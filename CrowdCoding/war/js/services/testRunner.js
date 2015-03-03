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
	'functionsService',
	'TestList', 
	'FunctionFactory',
	function($window,$rootScope,$http,$timeout,functionsService,TestList,FunctionFactory) {

	

	function DefaultTestItem(){
		return {
			number        : -1,
			stubs         : {},
			debug         : "",
			output        : {},
			executionTime : 0,
			ready         : function(){
				if( this.output.result !== undefined )
					return true;
		
				return false;
			},
			passed        : function(){
				if( this.ready() && this.output.result )
					return true;
				return false;
			}
		};
	};


	
	function TestRunner( config ){

		this.id = ++instances;

		// set default config
		this.maxExecutionTime = 10*1000;
		this.submitToServer   = false;

		if( config !== undefined) {
			if( config.maxExecutionTime !== undefined )
				this.maxExecutionTime = config.maxExecutionTime;
			if( config.submitToServer !== undefined )
				this.submitToServer = config.submitToServer;
		}

		// set default values 
		this.worker             = undefined;
		this.currentTestIndex   = undefined;

		// tested function data
		this.testedFunctionId   = undefined;
		this.testedFunctionName = "";
		this.testedFunctionCode = "";


		this.tests      = []; // tests to run

		this.allCode = "";

		// data for the results
		this.failedTests = new Array();
		this.passedTests = new Array();

		this.usedStubs  = {};
		this.stubs      = {};
		this.calleeList = [];
		this.returnData = {};

		this.timestamp = 0;

		this.running = false;

		this.testReadyListener   = undefined;
		this.stubsReadyListener  = undefined;
		this.testsFinishListener = undefined;
	}


	TestRunner.prototype.setTestedFunction = function(id){

		// check that the id is specified
		if( id === undefined ){
			throw new Error('no function id specified!');
			return -1;
		}

		// check if the function exists
		var testedFunction = functionsService.get(id);
		if( testedFunction === -1 ){
			throw new Error('no function with id ' + id + ' exists!');
		}

		// if the id of the tested function is changed
		// so also at the first time is set, load the function name,
		// the function code and all the code of the others function in the system
		if( id !== this.testedFunctionId ){
			// set the parameters of the tested function
			this.testedFunctionId   = id;
			this.testedFunctionName = testedFunction.name;
			this.testedFunctionCode = testedFunction.getFunctionCode() + '\n';
			this.calleeList         = testedFunction.getCalleeList();

			// load all the data needed for running the tests
			this.loadAllCode();
			this.loadTests();
			this.loadStubs();
		}
	};


	/*
		load the mock code of all the functions in the system
		except for the testedFunction
	*/
	TestRunner.prototype.loadAllCode = function(){
		var self = this;
		// reset the functions definition and code
		var allCode = ""; 
		// for each function in the system
		var functions = functionsService.getDescribedFunctions();
		angular.forEach( functions, function( functionRec, index){
			if( functionRec.id != self.testedFunctionId ){
				var functionObj = new FunctionFactory(functionRec);
				allCode += functionObj.getMockCode();
			}
		});
		// add a carriage return
		this.allCode += allCode + '\n';  
	};
	
	/*
		load from Firebase the tests to run
	*/
	TestRunner.prototype.loadTests = function(){
		this.tests = TestList.getImplementedByFunctionId(this.testedFunctionId);
		this.extendTests();
	};

	/*
		set manually the tests to run
	*/
	TestRunner.prototype.setTests = function( tests ){
		if( tests !== undefined  ){
			this.tests = tests;
			this.extendTests();
		}
	};

	/*
		extend each test with the DefaultTestItem
		properties and methods
	*/
	TestRunner.prototype.extendTests = function(){
		var tests = this.tests;
        for(var t in tests){
        	var test = tests[t];
        	if( test.output === undefined ) {
            	tests[t] = angular.extend( tests[t], new DefaultTestItem() );
        	}
        }
	};

	/*
		load the stubs of all the functions in the system
		except for the testedFunction
	*/
	TestRunner.prototype.loadStubs = function()
	{
		var self = this;
		var stubs = {};
		var functionsName = functionsService.getDescribedFunctionsName();
		angular.forEach( functionsName, function( functionName ){
			if( functionName != self.testedFunctionName ){
				var stubsForFunction  = TestList.buildStubsByFunctionName( functionName );
				stubs[ functionName ] = stubsForFunction;
			}	
		});
		this.stubs = stubs;
	};


	/*
		set the tested function code
	*/
	TestRunner.prototype.setTestedFunctionCode = function( code ){
		this.testedFunctionCode = code + '\n';

		var fakeFunction = new FunctionFactory({
			code   : code,
			header : ''
		});
		this.calleeList = fakeFunction.getCalleeList();
	};

	

	/*
		merge the pre-loaded stubs with the passed
		set of new stubs
	*/
	TestRunner.prototype.mergeStubs = function(newStubs){
		var oldStubs = this.stubs;
		angular.forEach( newStubs, function( fStubs, fName ){
			// create new entry in the stubs with function name
			// if doesn't exists
			if( oldStubs[ fName ] === undefined )
				oldStubs[ fName ] = {};
			
			// for each of the new stubs for the function,
			// if the stub already exists, update the value 
			// otherwise create add it
			angular.forEach( fStubs, function( stub, key ){
				oldStubs[ fName ][ key ] = {
					inputs: angular.fromJson( stub.inputs ),
					output: angular.fromJson( stub.output )
				};
			}); 
		});
	};
	

	TestRunner.prototype.runTests = function(){
		
		// avoid multiple concurrent test runs 
		if( this.running ){
			return -1;
		}

		// check that the tests to run are specified 
		if( this.testedFunctionId === undefined ){
			throw new Error('no specified function id to test!');
			return -1;
		}

		// check that the tests to run are specified 
		if( this.tests === undefined || this.tests.length == 0 ){
			throw new Error('no specified tests to run!');
			return -1;
		}

		// set this instance as running
		this.running = true;


		// reset tests results variables
		this.returnData = {};
		this.passedTests = this.failedTests = [];

		this.currentTestIndex = 0; 

	    // instantiate the worker
	    // and attach the on-message listener
	    this.worker = new Worker('/js/workers/test-runner.js');
	    // initialize the worker
	    this.worker.postMessage( { 
	    	'cmd'         : 'init', 
	    	'baseUrl'     : document.location.origin, 
	    	'allCode'     : this.allCode,  
	    	'testedCode'  : this.testedFunctionCode
	    });

		this.runCurrentTest();
	};

	TestRunner.prototype.processTestFinished = function( ){

	  	var test = this.tests[this.currentTestIndex]; 

		// If the code is unimplemented, the test neither failed nor passed. If the test
		// did not pass or timed out, it failed. Otherwise, it passed.
		if ( test.passed() ) 
			this.passedTests.push( test.number );
		else
			this.failedTests.push( test.number );

		// Increment the test and run the next one.
		this.currentTestIndex++;

		// IF ALL THE TESTS HAD RUNNED
		if ( this.currentTestIndex >= this.tests.length )
		{
			// publish a message on run tests finished
			var item = {};
			item.tests     = this.tests,
			item.overallResult = this.failedTests.length > 0 ? false : true;

			if( this.submitToServer )
				this.submitResultsToServer();


			if( this.worker !== undefined ){	
				this.worker.terminate();
				this.worker = undefined;
			}

			this.testsFinish(item);
			return;
		}
		else 
			this.runCurrentTest();		


	};

		
	TestRunner.prototype.runCurrentTest = function(){

	    var self = this;
	  
	  	var test = this.tests[this.currentTestIndex];
	  	
		// set the max execution time
		var timeoutPromise = $timeout( function(){

			var item = {};
			item.number = self.currentTestIndex ; 
			item.total  = self.tests.length ; 
			item.output = { 'expected': undefined, 'actual': undefined, 'message': undefined, 'result':  false} ;
			item.debug  = "ERROR: execution terminated due to timeout";
			self.testReady(item);
			
			self.processTestFinished(false);

		} , this.maxExecutionTime);

	    // start the execution posting the exec message with the code
		this.worker.postMessage( { 
			'cmd'      : 'exec', 
			'testCode' : test.buildCode(),
			'stubs'    : JSON.stringify(self.stubs),
	    	'calleeNames': self.calleeList.join(' ')
		});


		this.worker.onmessage = function(e){
			var data = e.data;

			$timeout.cancel( timeoutPromise );

			// if no exceptions has been catched during the
			// test execution, retrieve the stubMap and debug
			// data for the test, notify stubs ready
			// and update the usedStubs
			if( e.data.errors ) {
				test.stubs   = data.usedStubs !== undefined && data.usedStubs.length > 0 ? data.usedStubs : undefined;
			} else {
				test.stubs   = data.usedStubs ;
			}

			test.debug         = data.debug;
			test.output        = data.output;
			
			test.executionTime = data.executionTime;
			test.number        = self.currentTestIndex; 

		  	self.processTestFinished();
		};

	};

	TestRunner.prototype.submitResultsToServer = function()
	{		
		// Determine if the function passed or failed its tests. 
		// If at least one test failed, the function failed its tests.
		// If at least one test succeeded and no tests failed, the function passed its tests.
		// If no tests succeeded or failed, none of the tests could be successfully run - don't submit anything to the server.
		var passedTests;
		// console.log(this.allFailedTestCases);
		// console.log(this.allPassedTestCases);
		if (this.failedTests.length > 0)
			passedTests = false;
		else if (this.passedTests.length > 0 && this.failedTests.length === 0)
			passedTests = true;
		else 
			passedTests = null;
		
		if (passedTests !== null)
		{ 
			var getData = [];
			getData.push('functionID='+this.testedFunctionId);
			getData.push('result='+passedTests);

			$http.get('/' + $rootScope.projectId + '/ajax/testResult?'+getData.join("&")).
			  success(function(data, status, headers, config) {
			    console.log("test result submitted: "+passedTests);
			  }).
			  error(function(data, status, headers, config) {
			    console.log("test result submit error");
			  });
		}
			
	};



	// TestRunner.prototype.onTestReady = function(listener){
	// 	this.testReadyListener = listener;
	// };

	// TestRunner.prototype.testReady = function(data){
	// 	if( this.testReadyListener != undefined)
	// 		this.testReadyListener.call( null, data);
	// };

	// TestRunner.prototype.onStubsReady = function(listener){
	// 	this.stubsReadyListener = listener;
	// };

	// TestRunner.prototype.stubsReady = function(data){
	// 	// //console.log('%cTest Runner: stubs ready %o','color:blue;',data);
	// 	if( this.stubsReadyListener != undefined)
	// 		this.stubsReadyListener.call( null, data);
	// };

	TestRunner.prototype.onTestsFinish = function(listener){
		this.testsFinishListener = listener;
	};

	TestRunner.prototype.testsFinish = function(data){

		this.running = false;
		
		// //console.log('%cTest Runner: finished %o','color:blue;',data);
		if( this.testsFinishListener != undefined)
			this.testsFinishListener.call( null, data);
	};


	var instances = 0;

	return {
		instance : TestRunner,
		defaultTestItem : DefaultTestItem,
	};






}]); 