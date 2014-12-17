/////////////////////////
// TEST RUNNER SERVICE //
/////////////////////////
myApp.factory('TestRunnerFactory', [
	'$window',
	'$rootScope',
	'$http',
	'$timeout',
	'testsService',
	'functionsService',
	'TestList', 
	'TestNotificationChannel',
	function($window,$rootScope,$http,$timeout,testsService,functionsService,TestList,NotificationChannel) {

	var instances = 0;

	function TestRunner( config ){
		this.id = ++instances;

		// set default config
		this.maxExecutionTime = 10*1000;
		this.submitToServer   = false;

		if( config != undefined && config.maxExecutionTime != undefined ){
			this.maxExecutionTime = config.maxExecutionTime;
		}

		if( config != undefined && config.submitToServer != undefined ){
			this.submitToServer = config.submitToServer;
		}

		// set default values 
		this.worker             = undefined;
		this.currentTestIndex   = undefined;
		this.testedFunctionId   = undefined;
		this.testedFunctionName = "";
		this.testedFunctionBody = "";
		this.testedFunctionCode = ""
		this.allTheFunctionCode = "";
		this.allFailedTestCases = new Array();
		this.allPassedTestCases = new Array();
		this.validTests = [];
		this.returnData = {};
		this.usedStubs  = {};
		this.stubs      = {};
		this.calleeFunctions = [];

		this.timestamp = 0;

		this.testReadyListener   = undefined;
		this.stubsReadyListener   = undefined;
		this.testsFinishListener = undefined;

		console.log('%cTest Runner: initialized','color:blue;',this);

		// // set listeners on the notification channel
		// NotificationChannel.onRunTests($rootScope,function(item){
		// 	if( item.submitToServer )
		// 		this.submitToServer = true;
		// 	else 
		// 		this.submitToServer = false;

		// 	//console.log("--> ==> PASSED STUBS  ",item.passedStubs);

		// 	this.runTests( item.passedFunctionId, item.passedFunctionBody, item.passedStubs );
		// });


		// NotificationChannel.onSubmitResults($rootScope,function(tem){
		// 	this.submitResultsToServer();
		// });
	}

	TestRunner.prototype.onTestReady = function(listener){
		this.testReadyListener = listener;
	};

	TestRunner.prototype.testReady = function(data){
		// console.log('%cTest Runner: test ready %o, output %o','color:blue;font-style:bold;',data,data.output);
		// console.assert(data.output != undefined,"Data output is not defined!");

		if( this.testReadyListener != undefined)
			this.testReadyListener.call( null, data);
	};

	TestRunner.prototype.onStubsReady = function(listener){
		this.stubsReadyListener = listener;
	};

	TestRunner.prototype.stubsReady = function(data){
		// console.log('%cTest Runner: stubs ready %o','color:blue;',data);
		if( this.stubsReadyListener != undefined)
			this.stubsReadyListener.call( null, data);
	};

	TestRunner.prototype.onTestsFinish = function(listener){
		this.testsFinishListener = listener;
	};

	TestRunner.prototype.testsFinish = function(data){
		// console.log('%cTest Runner: finished %o','color:blue;',data);
		if( this.testsFinishListener != undefined)
			this.testsFinishListener.call( null, data);
	};


	//Runs all of the tests for the specified function, sending the results to the server
	TestRunner.prototype.runTests = function(testedFunctionId,testedFunctionBody,actualStubs){
		
		// set global variables
		this.testedFunctionId   = testedFunctionId;
		this.validTests         = TestList.getImplementedByFunctionId(testedFunctionId);
		this.testedFunctionName = functionsService.getNameById(testedFunctionId);



		console.log('%cTest Runner: valid tests %o','color:blue;',this.validTests);

		// reset tests results variables
		this.returnData = {};
		this.usedStubs  = {};
		this.stubs      = {};
		this.allPassedTestCases = new Array();
		this.allFailedTestCases = new Array();
		this.testedFunctionBody = "";
		this.currentTestIndex = 0; 

		// build the tested function code with the header
		this.testedFunctionCode = functionsService.renderHeaderById(testedFunctionId);
		if( testedFunctionBody != undefined ) {
			this.testedFunctionBody = testedFunctionBody;
			this.testedFunctionCode += testedFunctionBody;
		} else                            
			this.testedFunctionCode  += functionsService.get(testedFunctionId).code;

		this.loadAllTheFunctionCode();

		this.loadStubs();

		if( actualStubs != undefined )
			this.mergeStubs(actualStubs);

		console.log('%cTest Runner: start run tests','color:blue;');
		this.runCurrentTest();
	};

	// Load the functions. 
	// As the specified function may itself directly or indirectly call every function, 
	// load all functions in the system.
	// For every function in the system, get the actual function name with a mocked implementation
	// and the corresponding mocked function with the actual function implementation.
	// As we will be using JSHint to check for syntax errors and JSHint requires that functions be defined
	// lexically before (e.g., above in the source code) they are called, include at the beginning of this
	// the headers of all of the functions and mocks with a blank body. When functions are subsequently called
	// below these defs, they will then always point to a function that has already been defined. After the functions
	// are originally defined above, they will be redefined below with the actual implementation, which will 
	// overwrite the empty first definitions.
	TestRunner.prototype.loadAllTheFunctionCode = function(){

		var functionsWithMockBodies = '';
		var functionsWithEmptyBodies = '';	

		this.allTheFunctionCode = ""; // reset the all functions code

		// retrieve callees
		this.calleeFunctions = [];
		var _this = this;
		var ast = esprima.parse( this.testedFunctionCode , {loc: true})
		traverse(ast, function (node)
		{
			if((node!=null) && (node.type === 'CallExpression'))
			{
				// Add it to the list of callee names if we have not seen it before
				if (_this.calleeFunctions.indexOf(node.callee.name) == -1)
					_this.calleeFunctions.push(node.callee.name);
			}
		});

		// for each function in the system
		var allFunctionIDs = functionsService.allFunctionIDs();
		
		for (var i=0; i < allFunctionIDs.length; i++)
		{
			functionsWithEmptyBodies += functionsService.getMockEmptyBodiesFor(allFunctionIDs[i]);

			// IF IS THE FUNCTION UNDER TEST DON'T GENERATE MOCK BODY
			if( allFunctionIDs[i] != this.testedFunctionId ){

				var isCallee = ( this.calleeFunctions.indexOf(functionsService.getNameById(allFunctionIDs[i])) != -1 );

				if(  isCallee ) // write mock body with logCall
					functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i],true);
				else // write normal mock body
					functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i]);
			}
		}	

		// generate all the function code
		this.allTheFunctionCode = functionsWithEmptyBodies + '\n'  // functions with empty bodies
			                    + functionsWithMockBodies  + '\n'  // functions with mock bodies	
			                    + this.testedFunctionCode + '\n'; // tested function code

		console.log('%cTest Runner: function code initialized','color:blue;');
	};
	
	
	// Loads the stubs datastructure using the data found in the mockData - an object in MocksDTO format
	TestRunner.prototype.loadStubs = function()
	{
		this.stubs = {}	;
		var _this = this;
		
		var allFunctionNames = functionsService.getAllDescribedFunctionNames();
		// for each described function
		angular.forEach( allFunctionNames, function( functionName ){
			if( functionName != _this.testedFunctionName )
				try{
					var stubsForFunction = TestList.buildStubsByFunctionName( functionName );
					_this.stubs[ functionName ]  = stubsForFunction;

				}
				catch (e)
				{
					console.log("Error loading stubs for the function " + functionName);	
					console.log(e);			
				}	
		})

		console.log('%cTest Runner: stubs loaded','color:blue;',this.stubs);

	};



	TestRunner.prototype.mergeStubs = function(actualStubs){

		var _this = this;
		angular.forEach(actualStubs,function( functionStubs, functionName ){
			
			console.log("---->STUBS",_this.stubs);
			// create new entry in the stubs with function name
			// if doesn't exists
			if( ! _this.stubs.hasOwnProperty( functionName ) )
				_this.stubs[ functionName ] = {};
			
			// for each used stub for functionName
			// add it or update the stub list
			angular.forEach( functionStubs, function( inputSet, inputSetKey ){

				_this.stubs[ functionName ][ inputSetKey ] = {
					inputs: angular.fromJson( inputSet.input ),
					output: angular.fromJson( inputSet.output )
				};
			}); 
		});

		console.log('%cTest Runner: stubs merged','color:blue;',this.stubs);
	};


	TestRunner.prototype.processTestFinished = function( testResult ){

		var d = new Date();
		var actualTimestamp = d.getTime();

		console.log('%cTest Runner: test %d finished, duration %.4f sec','color:blue;',this.currentTestIndex, (actualTimestamp-this.timestamp)/1000 ) ;
		

		// If the code is unimplemented, the test neither failed nor passed. If the test
		// did not pass or timed out, it failed. Otherwise, it passed.
		if ( !testResult ) 
			this.allFailedTestCases.push(this.currentTestIndex);
		else
			this.allPassedTestCases.push(this.currentTestIndex);

		// Increment the test and run the next one.
		this.currentTestIndex++;

		if( this.worker != undefined ){	
			this.worker.terminate();
			this.worker = undefined;
		}

		// IF ALL THE TESTS HAD RUNNED
		if ( this.currentTestIndex >= this.validTests.length )
		{
			// publish a message on run tests finished
			var item = {};
			item.stubs         = this.usedStubs,
			item.testsData     = this.returnData,
			item.overallResult = this.allFailedTestCases.length > 0 ? false : true;

			if( this.submitToServer )
				this.submitResultsToServer();

			this.testsFinish(item);

		}
		else
			this.runCurrentTest();		


	};

		
	TestRunner.prototype.runCurrentTest = function()
	{

		console.log('%cTest Runner: test %d started','color:blue;',this.currentTestIndex);
		var d = new Date();
		this.timestamp = d.getTime();

	    var _this = this;

		var testCode = this.validTests[this.currentTestIndex].getCode();  //.replace(/\n/g,"");

		// Check the code for syntax errors using JSHint. Since only the user defined code will be checked,
		// add extra defs for references to the instrumentation code.
		var code = "";

		// stubs are used by hasStubFor
		code += "var stubs     = " + JSON.stringify(this.stubs) + "; \n";     
		// the usedStubs is used for 
		code += "var usedStubs = " + JSON.stringify(this.usedStubs) + "; \n";  

		// add all the functions code
		code += this.allTheFunctionCode;

		// add the test code
		code += testCode;
		

	    // instantiate the worker
	    // and attach the on-message listener
	    this.worker = new Worker('/js/workers/test-runner.js');
	    // initialize the worker
	    this.worker.postMessage( { 'cmd' : 'initialize', 'baseUrl' : document.location.origin } );
		// set the max execution time
		var timeoutPromise = $timeout( function(){

			var item = {};
			item.number = _this.currentTestIndex + 1; 
			item.total  = _this.validTests.length ; 
			item.test   = _this.validTests[ _this.currentTestIndex ] ; 
			item.output = { 'expected': undefined, 'actual': undefined, 'message': undefined, 'result':  false} ;
			item.debug  = "ERROR: execution terminated due to timeout";
			_this.testReady(item);
			
			_this.processTestFinished(false);

		} , this.maxExecutionTime);

	    // start the execution posting the exec message with the code
		this.worker.postMessage( { 'cmd' : 'exec', 'code' : code } );

		this.worker.onmessage = function(e){
			var data = e.data;
			$timeout.cancel( timeoutPromise );

			if( e.data.errors != undefined ){

		  		// send the message to the TestNotificationChannel
		  		var item = {};
				item.number = _this.currentTestIndex + 1; 
				item.total  = _this.validTests.length ; 
				item.test   = _this.validTests[ _this.currentTestIndex ] ; 
				item.output = { 'expected': undefined, 'actual': undefined, 'message': "", 'result':  false} ;
				item.debug  = e.data.errors;
				_this.testReady(item);
				

		  		_this.processTestFinished( false );

			} else {

				// send the message to the TestNotificationChannel
		  		var item = {};
				item.number = _this.currentTestIndex + 1; 
				item.total  = _this.validTests.length ; 
				item.test   = _this.validTests[ _this.currentTestIndex ]; 
				item.output = data.output;
				item.debug  = data.debug;

				_this.testReady(item);
				_this.stubsReady(data.usedStubs);
				_this.usedStubs = data.usedStubs ;
				// console.log("RECEIVED STUBS = ",data.stubs);
				// console.log("RECEIVED USED STUBS = ",data.usedStubs);
				// console.log("RECEIVED RESULT = ",data.output.result == undefined ? false : data.output.result);
				// process test finished
		  		_this.processTestFinished( ( item.output != undefined && item.output.result == undefined ) ? item.output.result : false );

			}
			//w.terminate();
		};

	};

	TestRunner.prototype.submitResultsToServer = function()
	{		
		// Determine if the function passed or failed its tests. 
		// If at least one test failed, the function failed its tests.
		// If at least one test succeeded and no tests failed, the function passed its tests.
		// If no tests succeeded or failed, none of the tests could be successfully run - don't submit anything to the server.
		var passedTests;

		if (this.allFailedTestCases.length > 0)
			passedTests = false;
		else if (this.allPassedTestCases.length > 0 && this.allFailedTestCases.length == 0)
			passedTests = true;
		else 
			passedTests = null;
		
		if (passedTests != null)
		{ 
			var getData = [];
			getData.push('functionID='+this.testedFunctionId);
			getData.push('result='+passedTests);

			$http.get('/' + $rootScope.projectId + '/ajax/testResult?'+getData.join("&")).
			  success(function(data, status, headers, config) {
			    console.log("test result submitted GET");
			  }).
			  error(function(data, status, headers, config) {
			    console.log("test result submit error");
			  });
		}
			
	};

	
	return {
		instance : TestRunner
	};
}]); 