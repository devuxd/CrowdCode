var Firebase = require("firebase");
var fs = require("fs");
var jsdiff = require('diff');
var parse = require('csv-parse');

var project      = 'allTogetherDrawV9';

console.log('Analyzing '+project+' ...');

var parser = parse({delimiter:','});
var input = 
fs.readFile('./session_2.csv', 'utf8', function (err,data) {
	if( err )
		return console.log(err);
	
	parse(data,{delimiter:','},function(err,data){
		var tasks = {};
		var workers = {};


		var csv = 'type,duration,newType,newArtifact\n';
		for(var i=0;i<data.length;i++){

			var wId = data[i][5];
			var type = data[i][6];
			var aId = data[i][8];
			var key = data[i][7];
			var duration = data[i][9]

			var newType = false;
			var newArtifact = false;

			
			if (!workers[wId])
				workers[wId] = { artifacts: [], types: []};

			if (workers[wId].artifacts.indexOf(aId) == -1) {
				workers[wId].artifacts.push(aId);
				newArtifact = true;
			}

			if (workers[wId].types.indexOf(type) == -1) {
				workers[wId].types.push(type);
				newType = true;
			}

			csv += type+','+duration+','+newType+','+newArtifact+'\n';
			
		}

		console.log(csv);

		fs.writeFile("data_s2.csv", csv, function(err) {
			console.log('File written.');
			process.exit();
		});
	});
});



// eventsRef.on('value',function(snap){

	

// 	snap.forEach(function(childSnap){
// 		var e = childSnap.val();
		
// 		if (tasks[e.microtaskKey]===undefined)
// 			tasks[e.microtaskKey] = { assignedAt: undefined,completedAt: undefined,type:undefined, newType:false, newArtifact:false};

// 		if (e.eventType == 'microtask.assigned') {
// 			tasks[e.microtaskKey].assignedAt = e.timeInMillis;
// 			tasks[e.microtaskKey].type = e.microtaskType;
// 			tasks[e.microtaskKey].completedAt = undefined;
// 		}

// 		if (e.eventType == 'microtask.submitted') {
// 			tasks[e.microtaskKey].completedAt = e.timeInMillis;

// 			if (!workers[e.workerID])
// 				workers[e.workerID] = { artifacts: [], types: []};

// 			if (workers[e.workerID].artifacts.indexOf(e.artifactID) == -1) {
// 				workers[e.workerID].artifacts.push(e.artifactID);
// 				tasks[e.microtaskKey].newArtifact = true;
// 			}

// 			if (workers[e.workerID].types.indexOf(e.microtaskType) == -1) {
// 				workers[e.workerID].types.push(e.microtaskType);
// 				tasks[e.microtaskKey].newType = true;
// 			}
// 		}

// 	});
// 	var avg = 0;
// 	var csv = 'type,duration,newType,newArtifact\n';
// 	for (var mKey in tasks) {
// 		if (!tasks[mKey].assignedAt || !tasks[mKey].completedAt )
// 			continue;

// 		var duration = tasks[mKey].completedAt-tasks[mKey].assignedAt;
// 		avg += duration;
// 		csv += tasks[mKey].type+','+duration+','+tasks[mKey].newType+','+tasks[mKey].newArtifact+'\n';
// 		console.log(mKey,tasks[mKey].type,msToTime(duration),tasks[mKey].newType,tasks[mKey].newArtifact);
// 	}

// 	avg /= Object.keys(tasks).length;
	
// 	fs.writeFile("data.csv", csv, function(err) {
// 		console.log('Avg comp time '+msToTime(avg)+' on '+Object.keys(tasks).length+' tasks');
// 		console.log('File written.');
// 		process.exit();
// 	});
// });*/
