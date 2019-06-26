var Firebase = require("firebase");
var fs = require("fs");
var jsdiff = require('diff');

var project      = 'spreadsheetV5';
var functRef     = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/artifacts/functions');
var historyRef   = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/history/artifacts/functions');
var tasksRef     = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/microtasks');
var eventsRef    = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/history/events');
var questionsRef = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/questions/');
var workersRef   = new Firebase('https://crowdcode.firebaseio.com/projects/'+project+'/workers/');

console.log('https://crowdcode.firebaseio.com/projects/'+project+'/workers/');

var workers   = {};
var questions = {};
var count = { e:0, q: 0, a: 0, c: 0, v: 0};
questionsRef.on('value',function(snap){
	// console.log(snap.val());
	snap.forEach(function(childSnap){
		var quest = childSnap.val();
		
		initWorker( quest.ownerId, quest.ownerHandle );
		initQuestion( quest.id );

		questions[ quest.id ].createdAt  = quest.createdAt;
		questions[ quest.id ].answeredAt = -1;
		questions[ quest.id ].closed    = quest.closed;

		workers[ quest.ownerId ].questions++;

		var answersKey = Object.keys(quest.answers);
		for( var k = 0; k < answersKey.length ; k++ ){

			var key = answersKey[k];
			var answ = quest.answers[ key ];

			initWorker( answ.ownerId, answ.ownerHandle );

			workers[ answ.ownerId ].answers++;
			questions[ quest.id ].answers++;

			if( quest.ownerId != answ.ownerId && ( answ.answeredAt != -1 || answ.createdAt < questions[ quest.id ].answeredAt ) ){
				questions[ quest.id ].answeredAt = answ.createdAt;
			}

			if( answ.comments !== undefined ){
				var commentsKey = Object.keys(answ.comments);
				for( var k1 = 0; k1 < commentsKey.length ; k1++ ){
					var key1 = commentsKey[k1];
					var comm = answ.comments[ key1 ];
					initWorker( comm.ownerId, comm.ownerHandle );
					workers[ comm.ownerId ].comments++;
					questions[ quest.id ].comments++;
					count.c++;
				}

			}

			count.a++;
				
		}
		count.q++;
	});

	eventsRef.on('value',function(snap){
		snap.forEach(function(eventSnap){
			var event = eventSnap.val();
			if( event.eventType == 'question.viewed' && event.workerId != '115274188392793936250' ){
				initWorker(  event.workerId );
				initQuestion( event.questionId );

				workers[ event.workerId ].views++;
				questions[ event.questionId ].views++;
				count.e++;
			}
		});
		finish();
	});
	
});

function finish(){
	var csv = 'workerId,workerHandle,questions,answers,comments,views\n';
	var workerKeys = Object.keys(workers);
	for( var k = 0; k < workerKeys.length; k++ ){
		var workerId = workerKeys[k];
		var worker = workers[workerId];

		csv += '\''+workerId + '\',' + worker.name + ',' + worker.questions + ',' + worker.answers + ',' + worker.comments + ',' + worker.views + '\n';
	}


	var csv1 = 'questionId,answers,comments,views,createdAt,answeredFirstAt\n';
	var questionsKeys = Object.keys(questions);
	for( var k = 0; k < questionsKeys.length; k++ ){
		var qId = questionsKeys[k];
		var q = questions[qId];

		csv1 += '\''+qId + '\',' + q.answers + ',' + q.comments + ',' + q.views + ',' + q.createdAt + ',' + q.answeredAt + '\n';
	}

	fs.writeFile("question_worker_stats.csv", csv, function(err) {
	    fs.writeFile("question_stats.csv", csv1, function(err) {
		    console.log('written question stats');
		    // process.exit();
		});
	});

}
function initWorker(workerId, workerHandle){
	if( ! workers[workerId] ){
		workers[ workerId ] = { 
			name: workerHandle, 
			questions : 0, 
			answers: 0, 
			comments: 0, 
			views: 0 
		};

		if( workers[ workerId ].name == undefined ){
			workersRef.child( workerId ).once('value',function(snap){
				var val = snap.val();
				console.log(workerId,val.workerHandle);
				workers[ workerId ].name = val.workerHandle;
			});
		}
	}
		
}

function initQuestion(questionId){
	if( ! questions[questionId] )
		questions[questionId] = { 
			answers: 0, 
			comments: 0, 
			views      : 0,
			createdAt  : 0,
			answeredAt : 0,
			answeredByAsker : false,
			closed     : 0
		};
}