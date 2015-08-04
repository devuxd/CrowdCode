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
	'Function',
	function($window,$rootScope,$http,$timeout,$q,functionsService,Function) {

		
	function TestRunner( config ){

		this.id = ++instances;

		// set default config
		this.maxExecutionTime = 10*1000;

		// set default values 
		this.worker = null;

		this.running = false;

		this.name = '';
		this.code = '';
	}


	TestRunner.prototype = {


		run: function(tests, functName, functCode, stubs, extraFunctions){
			var deferred = $q.defer();
			var self = this;

			if( self.running )
				deferred.reject();

			self.running = true;
			self.name = functName;
			self.code = functCode;
			
			self
				.initWorker(self.name, self.code, stubs, extraFunctions)
				.then(function(){

					var totTests = tests.length;
				    var currTest = -1;

				    tests.map(function(test){
				    	test.running = true;
				    });

				    var runNextTest = function(){
				    	if( ++currTest < totTests ){
				    		self.runTest(tests[currTest],runNextTest);
				    	} else {
				    		self.running = false;
				    		self.worker.postMessage({ 'cmd' : 'stubs'});
				    		self.worker.onmessage = function(message){
				    			deferred.resolve({
				    				tests: tests,
				    				stubs: JSON.parse(message.data)
				    			});
				    			self.worker.terminate();
				    		};
				    	}
				    };
				    runNextTest();
				    
				});

			return deferred.promise;
		},

		runTest: function(test,onCompleteCallback){
			var self = this;
		   	var t = $timeout(function(){
		   		$timeout.cancel(t);
		   		test.result = { passed: false, message: 'timeout', executionTime: -1 };
		    	test.running = false;
		   		self.worker.terminate();
		   		self.initWorker(self.name,self.code).then(function(){
		   			onCompleteCallback.call();
		   		});
		   	},2000);
		    var startTime = (new Date()).getTime();

		   	// ask the worker to run the test
		    self.worker.postMessage({ 
		    	'cmd'  : 'run',
		    	'testCode': test.code,
		    });

		    // when the worker finishes
		    self.worker.onmessage = function(message){
		   		$timeout.cancel(t);

		   		var data = JSON.parse(message.data);
		    	test.result = data.result;
		    	test.result.executionTime = (new Date()).getTime() - startTime;
		    	test.logs = data.logs;
		    	test.running = false;

		    	onCompleteCallback.call();
		    };
		},


		initWorker: function(name,code,stubs,extraFunctions){
			var self = this;
			var deferred = $q.defer();

			

			functionsService.getAll().$loaded().then(function(){
				// create the functions array
				var functions = {};
				functionsService.getAll().map(function(functionObj){
					if( functionObj.name !== name )
						functions[functionObj.name] = {
							code: functionObj.getFullCode(),
						};
				});

				extraFunctions = extraFunctions || [];
				extraFunctions.map(function(dto){
					var functionObj = new Function(dto);
					if( functionObj.name !== name )
						functions[functionObj.name] = {
							code: functionObj.getFullCode()
						};
						
				});

				// if the stubs are not defined
				if( !stubs ){
					stubs = {};
					functionsService.getAll().map(function(functionObj){
						if( functionObj.name !== name )
							stubs[functionObj.name] = functionObj.getStubs();
					});
				}

				console.log('stubs in test runner', stubs);

				self.worker = new Worker('/client/test_runner/testrunner-worker.js');
				// instantiate the worker
				self.worker.postMessage({ 
			    	'cmd'         : 'init', 
			    	'baseUrl'     : document.location.origin, 
			    	'tested'      : {
			    		name: name,
			    		code: code
			    	},
			    	'functions'   : functions,
			    	'stubs'       : stubs
			    });

			    self.worker.onmessage = function(message){
			    	self.worker.onmessage = undefined;
			    	if( message.data == 'initComplete' ) 
			    		deferred.resolve();
			    };
			});

		    return deferred.promise;
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