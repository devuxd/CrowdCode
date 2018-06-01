var Firebase = require("firebase");
var fs = require("fs");
var jsdiff = require('diff');

var project      = 'allTogetherDrawV9';
var functRef     = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/artifacts/functions');
var historyRef   = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/history/artifacts/functions');
var tasksRef     = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/microtasks');
var eventsRef    = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/history/events');
var questionsRef = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/questions/');
var workersRef   = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/workers/');

console.log('Analyzing '+project+' ...');
function msToTime(duration) {
        var milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }

    tasksRef.on('value', function(snap){
    	var c = 0;
    	snap.forEach(function(childSnap){
    		if( childSnap.val().completed )
    			c++;
    	});
    	console.log("total completed tasks ="+c);

		process.exit();comp
    });
/*
eventsRef.on('value',function(snap){

	var tasks = {};
	var workers = {};

	snap.forEach(function(childSnap){
		var e = childSnap.val();
		
		if (tasks[e.microtaskKey]===undefined)
			tasks[e.microtaskKey] = { assignedAt: undefined,completedAt: undefined,type:undefined, newType:false, newArtifact:false};

		if (e.eventType == 'microtask.assigned') {
			tasks[e.microtaskKey].assignedAt = e.timeInMillis;
			tasks[e.microtaskKey].type = e.microtaskType;
			tasks[e.microtaskKey].completedAt = undefined;
		}

		if (e.eventType == 'microtask.submitted') {
			tasks[e.microtaskKey].completedAt = e.timeInMillis;

			if (!workers[e.workerID])
				workers[e.workerID] = { artifacts: [], types: []};

			if (workers[e.workerID].artifacts.indexOf(e.artifactID) == -1) {
				workers[e.workerID].artifacts.push(e.artifactID);
				tasks[e.microtaskKey].newArtifact = true;
			}

			if (workers[e.workerID].types.indexOf(e.microtaskType) == -1) {
				workers[e.workerID].types.push(e.microtaskType);
				tasks[e.microtaskKey].newType = true;
			}
		}

	});
	var avg = 0;
	var csv = 'type,duration,newType,newArtifact\n';
	for (var mKey in tasks) {
		if (!tasks[mKey].assignedAt || !tasks[mKey].completedAt )
			continue;

		var duration = tasks[mKey].completedAt-tasks[mKey].assignedAt;
		avg += duration;
		csv += tasks[mKey].type+','+duration+','+tasks[mKey].newType+','+tasks[mKey].newArtifact+'\n';
		console.log(mKey,tasks[mKey].type,msToTime(duration),tasks[mKey].newType,tasks[mKey].newArtifact);
	}

	avg /= Object.keys(tasks).length;
	
	fs.writeFile("data.csv", csv, function(err) {
		console.log('Avg comp time '+msToTime(avg)+' on '+Object.keys(tasks).length+' tasks');
		console.log('File written.');
		process.exit();
	});
});*/
