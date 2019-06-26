var http = require('http');
var request = require('request');
var concat = require('concat-stream');
var Firebase = require('firebase');
var q = require('q');
var fs = require('fs');

var projectId = 'spreadsheetV5';
var actualId;
var eventArray=[];
var workerArray=[];
var fbRootRef = new Firebase('https://crowdcode.firebaseio.com/projects/'+projectId);
var apiPath  = 'http://crowd-coding-dev.appspot.com/'+projectId+'/ajax/';
var allArray=[];
var csv="";

//var apiPath  = 'http://localhost:8888/'+projectId+'/ajax/';
fbRootRef
	.child('history/events')
	.once('value',function( snap ){
		var events = snap.val();
			//console.log(events);
			var lastAssignementForMicrotask=[];
			for(var index in events){
				var event= events[index];
				if(event.eventType=="microtask.assigned")
					lastAssignementForMicrotask[event.microtaskKey]=event.timeInMillis;

				if(events[index].eventType=="microtask.skipped" || events[index].eventType=="microtask.submitted" ){
					var microtaskEvent=[];
					microtaskEvent.event=events[index].eventType;
					microtaskEvent.microtaskKey=event.microtaskKey;
					microtaskEvent.assigningTime=lastAssignementForMicrotask[event.microtaskKey];
					microtaskEvent.submittingTime = event.timeInMillis;
					microtaskEvent.time=microtaskEvent.submittingTime-microtaskEvent.assigningTime;
					microtaskEvent.workerId=event.workerID;
				
					//microtaskEvent.push();
					if(eventArray[event.microtaskKey]===undefined)
						eventArray[event.microtaskKey]=[];
					eventArray[event.microtaskKey].push(microtaskEvent);
					allArray.push(microtaskEvent);
				}
			}
			
			fbRootRef
				.child('workers')
				.once('value',function( snap ){
					var workers = snap.val();
					fbRootRef
						.child('microtasks')
						.once('value',function( snap ){

							var microtasks = snap.val();
							for( var microtaskKey in allArray)
							{
								var e = allArray[microtaskKey];
								e.workerId=workers[e.workerId].workerHandle;
								e.owningArtifact=microtasks[e.microtaskKey].owningArtifact;
								e.microtaskType=microtasks[e.microtaskKey].type;
								e.reviewScore=microtasks[e.microtaskKey].review?microtasks[e.microtaskKey].review.qualityScore : 'none';
								e.reviewText=microtasks[e.microtaskKey].review?microtasks[e.microtaskKey].review.reviewText : 'none';

								//console.log(e);
							//	console.log(e.workerId);
							//console.log(e.event + e.microtaskKey + e.assigningTime +e.submittingTime + e.time + workers[e.workerId].workerHandle);
								var csvline=((e.event +","+ e.microtaskKey +","+e.microtaskType +","+e.owningArtifact.replace(/,/g,";")+ ","+ (e.assigningTime) +","+ (e.submittingTime) +","+ (e.time/86400000) +","+ (e.workerId) +","+ e.reviewScore +","+e.reviewText.replace(/,/g,";").replace(/\n/g,";")));//+"\n";
								//console.log(typeof csvline);
								csv=csv.concat(csvline+"\n");
								//console.log(csv);
								
							}
							console.log(csv);
							fs.writeFile("C:\\Users\\Fabio\\Desktop\\test", csv, function(err) {
							    if(err) {
							        return console.log(err);
							    }

							  //  console.log("The file was saved!");
							}); 

						});
							
						// microtask for each worker
						for( var microtaskKey in eventArray)
						{
							for(var eventIndex in eventArray[microtaskKey])
							{
								var submission=eventArray[microtaskKey][eventIndex];
								if(workerArray[submission.workerId] === undefined)
									workerArray[submission.workerId]=[];
								workerArray[submission.workerId].push(submission);
							}
						}

			var timeForWorker={};
			//console.log(workerArray.length);
			fbRootRef
				.child('workers')
				.once('value',function( snap ){
					var workers = snap.val();

			for(var workerIndex in workerArray)
			{
				var workerHandle=workers[workerIndex].workerHandle;
				//console.log(workerIndex);
				if(timeForWorker[workerHandle]===undefined)
				{	timeForWorker[workerHandle]=0;
					//console.log(timeForWorker[workerIndex]);
				}
				for(var microtaskValue in workerArray[workerIndex])
				{
					//console.log(workerIndex +" al "+  workerArray[workerIndex][microtaskValue].time);
					if(workerArray[workerIndex][microtaskValue].time>0){
					//console.log(typeof workerArray[workerIndex][microtaskValue].time);
				//	console.log(timeForWorker[workerIndex]);
						timeForWorker[workerHandle]+=(workerArray[workerIndex][microtaskValue].time/1000/60/60);
					}
				}
				
			}
		
			//console.log(timeForWorker);

			 });
			
	
	});
});
