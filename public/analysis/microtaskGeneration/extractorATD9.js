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

var functionName = ( process.argv.length > 2 ) ? process.argv[2] : 'isOnOutline';

eventsRef.on('value',function(snap){

	// calculate min max time
	var minTime = new Date().getTime();
	var maxTime = 0;
	var tasks      = {};
	var properties = [];
	var tasksArray = [];
	var events = [];

	snap.forEach(function(childSnap){
		var e = childSnap.val();

		minTime = Math.min(minTime,e.timeInMillis);
		if (e.artifactName == functionName){
			if (e.eventType == 'microtask.spawned') {
				tasks[e.microtaskKey] = {
					type:        e.microtaskType,
					spawnedAt:   e.timeInMillis,
					submittedAt: -1
				};
			} 
			else if (e.eventType == 'microtask.unassigned') {
				tasks[e.microtaskKey].submittedAt = e.timeInMillis;
				
			}
			else if (e.eventType == 'artifact.property.change') {
				properties.push({name:e.propertyName,value:e.propertyValue,time:e.timeInMillis,slot:-1});
			}

			if( ['microtask.submitted','microtask.spawned','artifact.property.change'].indexOf(e.eventType) > -1){

				maxTime = Math.max(maxTime,e.timeInMillis);
			}
			events.push({mt:e.microtaskType,et:e.eventType,t:e.timeInMillis});
		}
	});

	console.log('Spawned tasks   = '+tasksArray.length);
	console.log('Property change = '+properties.length);

	for ( var t in tasks ) {
		tasksArray.push(tasks[t]);
	}

	events.sort(function(a,b){
		if( a.t == b.t )
			return 0;

		if( a.t < b.t ) return -1;
		return 1;
	});
	for(var e = 0 ; e < events.length; e++) console.log(events[e].t,events[e].mt,events[e].et);

	var fileContent = "var maxTime = "+maxTime+";\n"
					+ "var minTime = "+minTime+";\n"
				    + "var dobj = "+JSON.stringify(tasks) + ";\n"
				    + "var d = "+JSON.stringify(tasksArray) + ";\n"
					+ "var p = "+JSON.stringify(properties) + ";"
	fs.writeFile("extractorADT9_data.js", fileContent, function(err) {
	    
		// console.log(tasks);
		// console.log(properties);
		process.exit();
	});

});
