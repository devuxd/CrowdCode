/////////////////////////
// TEST RUNNER FACTORY //
/////////////////////////
angular
    .module('crowdCode')
    .factory('TestRunnerFactory', [
	'$window',
	'$rootScope',
	'$http',
	'$timeout',
	'$q',
	'functionsService',
	function($window,$rootScope,$http,$timeout,$q,functionsService) {

		
	function TestRunner( config ){

		this.id = ++instances;

		// set default config
		this.maxExecutionTime = 10*1000;

		// set default values 
		this.worker = new Worker('/clientDist/test_runner/testrunner-worker.js');

		this.running = false;
	}


	TestRunner.prototype = {


		run: function(tests,name,code){
			var deferred = $q.defer();
			var self = this;
			console.log('TESTED',name,code);
			functionsService.getAll().$loaded().then(function(){
				var functions = {};
				functionsService.getAll().map(function(functionObj){
					if( functionObj.name !== name )
						functions[functionObj.name] = {
							code: functionObj.getFullCode()
						}
				});

				// instantiate the worker
				self.worker.postMessage({ 
			    	'cmd'         : 'init', 
			    	'baseUrl'     : document.location.origin, 
			    	'tested'      : {
			    		name: name,
			    		code: code
			    	},
			    	'functions'   : functions,
			    });

			    var totTests = tests.length;
			    var currTest = -1;

			    var runNextTest = function(){
			    	if( ++currTest < totTests ){
			    		console.log('running test '+currTest);
			    		self.runTest(tests[currTest],runNextTest);
			    	} else {
			    		console.log('tests finished');
			    		deferred.resolve(tests);
			    	}
			    };
			    runNextTest();
			});
			return deferred.promise;
		},

		runTest: function(test,onCompleteCallback){
		   	// ask the worker to run the test
		    this.worker.postMessage({ 
		    	'cmd'  : 'run',
		    	'testCode': test.code,
		    });
		    // when the worker finishes
		    this.worker.onmessage = function(message){
		    	test.result = message.data;
		    	onCompleteCallback.call();
		    };
		},

		// onTestsFinish: function(listener){
		// 	this.testsFinishListener = listener;
		// },


		// runFinished = function(data){

		// 	this.running = false;
			
		// 	// //console.log('%cTest Runner: finished %o','color:blue;',data);
		// 	if( this.testsFinishListener != undefined)
		// 		this.testsFinishListener.call( null, data);
		// },

	};


		

	// TestRunner.prototype.submitResultsToServer = function()
	// {		
	// 	// Determine if the function passed or failed its tests. 
	// 	// If at least one test failed, the function failed its tests.
	// 	// If at least one test succeeded and no tests failed, the function passed its tests.
	// 	// If no tests succeeded or failed, none of the tests could be successfully run - don't submit anything to the server.
	// 	var passedTests;
	// 	// console.log(this.allFailedTestCases);
	// 	// console.log(this.allPassedTestCases);
	// 	if (this.failedTests.length > 0)
	// 		passedTests = false;
	// 	else if (this.passedTests.length > 0 && this.failedTests.length === 0)
	// 		passedTests = true;
	// 	else 
	// 		passedTests = null;
		
	// 	if (passedTests !== null)
	// 	{ 
	// 		var getData = [];
	// 		getData.push('functionID='+this.testedFunctionId);
	// 		getData.push('result='+passedTests);

	// 		$http.get('/' + $rootScope.projectId + '/ajax/testResult?'+getData.join("&")).
	// 		  success(function(data, status, headers, config) {
	// 		    console.log("test result submitted: "+passedTests);
	// 		  }).
	// 		  error(function(data, status, headers, config) {
	// 		    console.log("test result submit error");
	// 		  });
	// 	}

	// 	// start the execution posting the exec message with the code
	// 	this.worker.postMessage( { 
	// 		'cmd'      : 'exec', 
	// 		'number'   : self.currentTestIndex,
	// 		'testCode' : test.buildCode(),
	// 		'stubs'    : self.stubs,
	//     	'calleeNames': self.calleeList.join(' '),
	//     	'execNum': test.execNum++
	// 	});


	// 	this.worker.onmessage = function(e){
	// 		var data = e.data;

	// 		$timeout.cancel( timeoutPromise );

	// 		// if no exceptions has been catched during the
	// 		// test execution, retrieve the stubMap and debug
	// 		// data for the test, notify stubs ready
	// 		// and update the usedStubs
	// 		if( e.data.errors ) {
	// 			test.stubs   = data.usedStubs !== undefined && data.usedStubs.length > 0 ? data.usedStubs : {};
	// 			test.errors  = e.data.errors;
	// 		} else {
	// 			test.stubs   = data.usedStubs ;
	// 			test.errors  = undefined;
	// 		}

	// 		var logs = JSON.parse(data.debug);
	// 		test.addToConsole( logs );

	// 		test.output        = data.output;
	// 		test.executionTime = data.executionTime;
	// 		test.number        = self.currentTestIndex; 
	// 		test.inTimeout     = false;

	// 	  	self.processTestFinished();
	// 	};
			
	// };


	var instances = 0;

	return {
		instance : TestRunner
	};






}]); 