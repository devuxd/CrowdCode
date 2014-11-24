/////////////////////////
// TEST RUNNER SERVICE //
/////////////////////////
myApp.factory('testRunnerService', [
	'$window',
	'$rootScope',
	'$http',
	'$q',
	'$timeout',
	'testsService',
	'functionsService',
	'TestList', 
	function($window,$rootScope,$http,$q,$timeout,testsService,functionsService,TestList) {

	var timeOutTime = 1000;
	var validTests;
	var allTheFunctionCode;
	var w;
	var testRunTimeout;
	var currentTextIndex;
	var functionId;
	var functionBody;
	var functionCode;
	var returnData;
	var worker;
	var stubs = {}
	var callee = [];
	var calleeMap = {};
	
	var testRunner = {};

	
	var deferred = $q.defer();

	//Runs all of the tests for the specified function, sending the results to the server
	testRunner.runTestsForFunction = function(passedFunctionId,passedFunctionBody,passedStubs)
	{

		deferred = $q.defer();

		// initialize globals
		returnData         = {}; 
		stubs              = {};
		calleeMap          = {};
		functionId         = passedFunctionId;
		functionBody       = passedFunctionBody;
		allPassedTestCases = new Array();
		allFailedTestCases = new Array();
		currentTextIndex   = 0;

		// Load the tests for the specified function
		validTests = TestList.getByFunctionId(functionId);
		console.log("valid tests");
		console.log(validTests);


		// build the tested function code with the header
		functionCode = functionsService.renderHeaderById(functionId);
		if( functionBody != undefined ) functionCode += functionBody;
		else                            functionCode += functionsService.get(functionId).code;

		// prepare instruments function 
		//var instrumentedCaller  = instrumentCallerForLogging( completeFunctionCode );

		// load all the function code
		this.loadAllTheFunctionCode();

		//console.log("LOADED FUNCTION CODE");
		//console.log(allTheFunctionCode);

		// load all the stubs in the system
		this.loadStubs();


		// console.log("LOADED CALLEE MAP");
		// console.log(JSON.stringify(stubs));

		if( passedStubs != undefined )
			this.mergeStubs(passedStubs);


		// console.log("MERGED CALLEE MAP");
		// console.log(JSON.stringify(stubs));

		// Run the tests
		this.runTest();

		return deferred.promise;
	}

	testRunner.mergeStubs = function(passedStubs){

		angular.forEach(passedStubs,function( functionStubs, functionName ){
			
			// create new entry in the stubs with function name
			// if doesn't exists
			if( ! stubs.hasOwnProperty( functionName ) )
				stubs[ functionName ] = {};
			
			// for each passed stub for functionName
			// add it or update the stub list
			angular.forEach( functionStubs, function( inputSet, inputSetKey ){
				stubs[ functionName ][ inputSetKey ] = inputSet;
			}); 
		});
	}

	testRunner.getCalleeStubs = function(){
		var calleeStubs = {};
		angular.forEach( stubs , function( functionStubs, functionName ){
			
			if( callee.indexOf( functionName ) != -1  )
				calleeStubs[ functionName ] = functionStubs;
		});
		return calleeStubs;
	}


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
	testRunner.loadAllTheFunctionCode = function(){

		var functionsWithMockBodies = '';
		var functionsWithEmptyBodies = '';	

		allTheFunctionCode = ""; // reset the all functions code

		var functionName = functionsService.getNameById(functionId);
		callee = [];
		var ast = esprima.parse( functionCode , {loc: true})
		traverse(ast, function (node)
		{
			if((node!=null) && (node.type === 'CallExpression'))
			{
				// Add it to the list of callee names if we have not seen it before
				if (callee.indexOf(node.callee.name) == -1)
					callee.push(node.callee.name);
			}
		});

		// for each function in the system
		var allFunctionIDs = functionsService.allFunctionIDs();
		for (var i=0; i < allFunctionIDs.length; i++)
		{
			// IF IS THE FUNCTION UNDER TEST DON'T GENERATE MOCK BODY
			if( allFunctionIDs[i] != functionId ){
				functionsWithEmptyBodies += functionsService.getMockEmptyBodiesFor(allFunctionIDs[i]);

				var isCallee = ( callee.indexOf(functionsService.getNameById(allFunctionIDs[i])) != -1 );
				if(  isCallee ) // write mock body with logCall
					functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i],true);
				else // write normal mock body
					functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i]);
			}
		}	

		// generate all the function code
		allTheFunctionCode = functionsWithEmptyBodies + '\n'  // functions with empty bodies
		                   + functionsWithMockBodies  + '\n'  // functions with mock bodies	
		                   + functionCode + '\n'; // tested function body
	}
	
	
	// Loads the stubs datastructure using the data found in the mockData - an object in MocksDTO format
	testRunner.loadStubs = function()
	{
		stubs = {}	;
		
		var allFunctionNames = functionsService.getAllDescribedFunctionNames()

		// for each described function
		angular.forEach( allFunctionNames, function( functionName ){
			if( functionName != functionsService.getNameById( functionId ) )
				try{
					var stubsForFunction = TestList.buildStubsByFunctionName( functionName );
					stubs[ functionName ]  = stubsForFunction;

				}
				catch (e)
				{
					console.log("Error loading stubs for the function " + functionName);	
					console.log(e);			
				}	
		})
	}


	testRunner.processTestFinished = function( testResult )
	{
		// If the code is unimplemented, the test neither failed nor passed. If the test
		// did not pass or timed out, it failed. Otherwise, it passed.
		if ( !testResult ) 
			allFailedTestCases.push(currentTextIndex);
		else
			allPassedTestCases.push(currentTextIndex);

		// Increment the test and run the next one.
		currentTextIndex++;

		// IF ALL THE TESTS HAD RUNNED
		if (currentTextIndex >= validTests.length)
		{
			deferred.resolve({
				stubs     : calleeMap,
				testsData : returnData
			});
			return;
		}

		
		this.runTest();		
	}


	testRunner.stopTest = function()
	{
		console.log("TERMINATING TEST!");
		this.processTestFinished(false);
		
	}
		
	testRunner.runTest = function()
	{
		var testCode = validTests[currentTextIndex].getCode();  //.replace(/\n/g,"");
		console.log("TEST CODE: "+testCode);
		// Check the code for syntax errors using JSHint. Since only the user defined code will be checked,
		// add extra defs for references to the instrumentation code.
		var code = "";

		// add stubs 
		code += "var stubs = " + JSON.stringify(stubs) + "; \n"; 

		// add calleeMap 
		code += "var calleeMap = " + JSON.stringify(calleeMap) + "; \n"; 

		// add all the functions code
		code += allTheFunctionCode;

		// add the test code
		code += testCode;
		

		// set the max execution time
		var timeoutPromise = $timeout( function(){
			testRunner.stopTest();
		} , timeOutTime);

		// the worker is still running, 
	    // kill it before starting again
	    if ( w != undefined ) {
	      console.log("KILLING THE WORKER FOR TEST "+currentTextIndex );
	      w.terminate();
	    }

	    // instantiate the worker
	    // and attach the on-message listener
	    w = new Worker('/js/workers/test-runner.js');

	    // initialize the worker
	    w.postMessage( { 'cmd' : 'initialize', 'baseUrl' : document.location.origin } );

	    // start the execution posting the exec message with the code
		w.postMessage( { 'cmd' : 'exec', 'code' : code } );

		w.onmessage = function(e){
			var data = e.data;
			$timeout.cancel( timeoutPromise );
			if( e.data.errors != undefined ){

				// if there are errors, show to the console and 
				// set the test result to false
				console.log( e.data.errors );
		  		testRunner.processTestFinished( false );

			} else {

				// attach output for the returnData
				returnData[ currentTextIndex ] = {};
				returnData[ currentTextIndex ].test   = validTests[ currentTextIndex ] ; 
				returnData[ currentTextIndex ].output = data.output ;
				returnData[ currentTextIndex ].debug  = data.debug ;

				// update the callee map
				calleeMap = data.calleeMap ;

				console.log(data);
				// process test finished
		  		testRunner.processTestFinished( data.output.result );
			}
		};

	}

	testRunner.submitResultsToServer = function()
	{		

		console.log("SUBMITTING DATA TO SERVER");
		// Determine if the function passed or failed its tests. 
		// If at least one test failed, the function failed its tests.
		// If at least one test succeeded and no tests failed, the function passed its tests.
		// If no tests succeeded or failed, none of the tests could be successfully run - don't submit anything to the server.
		var passedTests;

		if (allFailedTestCases.length > 0)
			passedTests = false;
		else if (allPassedTestCases.length > 0 && allFailedTestCases.length == 0)
			passedTests = true;
		else 
			passedTests = null;
		
		if (passedTests != null)
		{ 
			var getData = [];
			getData.push('functionID='+functionId);
			getData.push('result='+passedTests);

			$http.get('/' + $rootScope.projectId + '/ajax/testResult?'+getData.join("&")).
			  success(function(data, status, headers, config) {
			    console.log("test result submitted GET");
			  }).
			  error(function(data, status, headers, config) {
			    console.log("test result submit error");
			  });
		}
			
	}
	
	return testRunner;
	
	/*
	var defer;
	worker.addEventListener('message', function(e) {
	  console.log('Worker said: ', e.data);
	  defer.resolve(e.data);
	}, false);
	
	return {
	    doWork : function(myData){
	        defer = $q.defer();
	        worker.postMessage(myData); // Send data to our worker. 
	        return defer.promise;
	    }
	};*/
	
}]); 