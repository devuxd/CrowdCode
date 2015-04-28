var http = require('http');
var request = require('request')
var concat = require('concat-stream');
var Firebase = require('firebase');
var q = require('q');

var projectId = 'calculatorTRY';


var fbRootRef = new Firebase('https://crowdcode.firebaseio.com/projects/'+projectId);
var apiPath  = 'http://localhost:8888/'+projectId+'/ajax/';



function DummyWorker( assignedId ){
	var self = this;
	var id;
	var microtaskKey = null;

	var nextOperationTimer;
	var numOperations = 0;


	function init(){
		id = assignedId;
		self.scheduleNextOperation();
	}


	self.scheduleNextOperation = function(){
		numOperations ++ ;
		if( numOperations <= 5 ){
			if( microtaskKey == null ){
				var opTime = randomTime(2000);
				nextOperationTimer = setTimeout( self.fetch, opTime ) ;
			} else {
				var opTime = randomTime(10*1000);
				nextOperationTimer = setTimeout( self.submit, opTime ) ;
			}
		} else{
			clearTimeout( nextOperationTimer );
		}
	};

	self.fetch = function(){
		request
			.get( apiPath + 'fetch' + '?workerId='+id )
			.pipe(concat(function(data){
				var json = JSON.parse( data.toString() );
				console.log('DummyWorker '+id+' - fetched', json);
				if( json.hasOwnProperty( 'microtaskKey') )
					microtaskKey = json.microtaskKey;
				else 
					microtaskKey = null;

				self.scheduleNextOperation();
			}));
	};

	self.submit = function(){
		var formData = {};
		var skip     = Math.random() <= 0.05 ? true : false;

		generateSubmitData( microtaskKey )
			.then(function( formData ){
				console.log('DummyWorker '+id+' - submitting', microtaskKey);
				setMicrotaskSubmission( microtaskKey, formData );

				if( formData == null )
					skip = true;

				var reqOptions = {
					uri: apiPath + 'enqueue' + '?workerId='+id+'&key='+microtaskKey+'&skip='+skip+'&disablepoint=false',
					method: 'POST',
					json: formData
				};

				request(reqOptions,function( error, response, json){
					console.log('DummyWorker '+id+' - fetched', json);
					if( json.hasOwnProperty( 'microtaskKey' ) )
						microtaskKey = json.microtaskKey;
					else 
						microtaskKey = null;
					
					self.scheduleNextOperation();
				});
							
			});	
	};

	init();
}

function CrowdCodeAutomator( numWorkers ){
	var self = this;
	var workers = [];

	self.init = function(){
		for(var i=1;i<=numWorkers;i++){
			workers.push(new DummyWorker(i));
		}
	}
}


function randomTime(max){
	return Math.random() * ( 2000 - 200 ) + 200 ;
}

function generateSubmitData( microtaskKey ){
	var deferred = q.defer();
	fbRootRef
		.child('microtasks/'+microtaskKey)
		.once('value',function( snap ){
			var mtask = snap.val();
			var formData = null;

			switch( mtask.type ){
				case 'WriteTestCases':
					formData = { 
						inDispute :false,
						functionVersion:2,
						testCases:[
							{
								id:null,
								text:"1",
								added:true,
								deleted:false,
							},{
								id:null,
								text:"2",
								added:true,
								deleted:false,
							},{
								id:null,
								text:"3",
								added:true,
								deleted:false,
							}
						]
					};
					break;

				case 'WriteFunction':

					break;


				case 'Review':
					formData =  {
						microtaskIDReviewed: mtask.microtaskKeyUnderReview,
						reviewText:"",
						qualityScore:4,
						fromDisputedMicrotask:false
					};
					break;
				
				default: 

			}

			deferred.resolve(formData);
		});

	return deferred.promise;
}

function setMicrotaskSubmission(microtaskKey, data){
	fbRootRef
		.child('microtasks/'+microtaskKey+'/submission')
		.set(data);
}

var automator = new CrowdCodeAutomator(2);
automator.init();


