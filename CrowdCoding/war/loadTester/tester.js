var http = require('http');
var request = require('request');
var concat = require('concat-stream');
var Firebase = require('firebase');
var q = require('q');

var projectId = 'dummyProject';
var actualId;

var fbRootRef = new Firebase('https://crowdcode.firebaseio.com/projects/'+projectId);
var apiPath  = 'http://crowd-coding-dev.appspot.com/'+projectId+'/ajax/';
//var apiPath  = 'http://localhost:8888/'+projectId+'/ajax/';


function DummyWorker( assignedId ){
	var self = this;
	
	var microtaskKey = null;

	var nextOperationTimer;
	var numOperations = 0;
	var id;


	function init(){
		actualId = assignedId;
		id = assignedId;
		console.log('DummyWorker '+id+' started');
		self.scheduleNextOperation();
	}


	self.scheduleNextOperation = function(){
		numOperations ++ ;
		if( numOperations <= 5000 ){
			if( microtaskKey == null ){
				var opTime = randomTime(2000);
				nextOperationTimer = setTimeout( self.fetch, opTime ) ;
			} else {
				var opTime = randomTime(10*1000);
				nextOperationTimer = setTimeout( self.submit, opTime ) ;
			}
		} else{
			console.log('DummyWorker '+id+' stopped working');
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

		generateSubmitData( microtaskKey , id)
			.then(function( data ){

				if( data.submission == null )
					skip = true;

				var reqOptions = {
					uri: apiPath + 'enqueue' + '?workerId='+id+'&key='+microtaskKey+'&skip='+skip+'&disablepoint=false',
					method: 'POST',
					json: data.submission
				};


				console.log('DummyWorker '+id+' - submitting '+data.type, skip);

				request(reqOptions,function( error, response, json){
					console.log('DummyWorker '+id+' - fetched', json);
					setMicrotaskSubmission( microtaskKey, data.submission );

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
	return Math.random() * ( 5000 - 200 ) + 1200 ;
}

function generateSubmitData( microtaskKey, id ){
	var deferred = q.defer();
	fbRootRef
		.child('microtasks/'+microtaskKey)
		.once('value',function( snap ){
			var mtask = snap.val();
			//fbRootRef
			var formData = null;
			console.log("mtask "+mtask +" from worker"+id);
			switch( mtask.type ){
				case 'WriteTestCases':
					formData = { 
						inDispute :false,
						functionVersion:0,
						testCases:[]
					};

					// from 2 to 7 test cases description
					var numTC = Math.ceil( Math.random() * 10  + 5 );
					for( var tc = 1; tc <= numTC ; tc++){
						formData.testCases.push({
							id   : null,
							text : mtask.owningArtifact + ' test case # ' + tc,
							added: true,
							deleted: false
						});
					}

					break;
				case 'WriteTest':
					formData = { 
						code:"equal(createElement);",
						disputeFunctionText:"",
						disputeTestText:"",
						functionVersion:2,
						hasSimpleTest:false,
						inDispute:false,
						simpleTestInputs:["input"],
						simpleTestOutput:"ouput"
					};
					break;
				case 'WriteFunction':

					var funName = mtask.owningArtifact;

					formData = {
					  "description" : "  desc\n",
					  "header" : "function "+funName+"(par)",
					  "name" : funName,
					  "parameters" : [ { "description" : "par", "name" : "par", "type" : "Number" } ],
					  "returnType" : "Number",
					  "code" : "{ // return par; \n}",
					  "pseudoFunctions" : []
					};

					// if( Math.random() > 0.5 ){
					// 	formData.code = "{ return par; \n}"
					// }

					var numPF = Math.random() >0.05 ? 1: 0;
					var name=funName+Math.random();
					for( var pf = 1; pf <= numPF ; pf++ ){
						formData.pseudoFunctions.push({
							"description" : "function "+name+"(par)",
							"name" : name
						});
					}

					break;

				case 'WriteCall':

					var funName = mtask.owningArtifact;

					formData = {
					  "description" : "  desc\n",
					  "header" : "function "+funName+"(par)",
					  "name" : funName,
					  "parameters" : [ { "description" : "par", "name" : "par", "type" : "Number" } ],
					  "returnType" : "Number",
					  "code" : mtask.calleeID,
					  "pseudoFunctions" : [],
					  "calleeIds" : [mtask.calleeID]
					};

					break;

				case 'ReuseSearch':
					formData = {
		                functionName: "",
		                functionId: 0,
		                noFunction: true
		            };
					break;

				case 'WriteFunctionDescription':
					var funName = mtask.pseudoFunctionName;
					formData = {
						"description" : "  desc\n",
						"header" : "function "+funName+"(par)",
						"name" : funName,
						"parameters" : [ { "description" : "par", "name" : "par", "type" : "Number" } ],
						"returnType" : "Number"
					};
					break;

				case 'WriteTest':
					formData = {
						"functionVersion":2,
						"code":"equal(fun(14),14,'67');",
						"inDispute":false,
						"disputeFunctionText":"",
						"disputeTestText":"",
						"hasSimpleTest":false,
						"simpleTestInputs":["14"],
						"simpleTestOutput":"14"
					};
					break;

				case 'Review':
					formData =  {
						microtaskIDReviewed: mtask.microtaskKeyUnderReview,
						reviewText:"review text",
						qualityScore:(parseInt(Math.random()*5)%5)+1,
						fromDisputedMicrotask:false
					};
					break;
				
				
				default: 

			}

			deferred.resolve( { type: mtask.type, submission: formData } );
		});

	return deferred.promise;
}

function setMicrotaskSubmission(microtaskKey, data){
	fbRootRef
		.child('microtasks/'+microtaskKey+'/submission')
		.set(data);
}

var automator = new CrowdCodeAutomator(10);
automator.init();


