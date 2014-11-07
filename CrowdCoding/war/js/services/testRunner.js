/////////////////////////
// TEST RUNNER SERVICE //
/////////////////////////
myApp.factory('testRunnerService', ['$window','$rootScope','$http','$q','testsService','functionsService', function($window,$rootScope,$http,$q,testsService,functionsService) {

	var timeOutTime = 1000;
	var validTests;
	var allTheFunctionCode;
	var mocks;
	var worker;
	var testRunTimeout;
	var currentTextIndex;
	var functionID;
	
	
	var testRunner = {};

	
	var deferred = $q.defer();

	var consoleData = [];
	function resetConsole(){
		consoleData = [];
	}

	function addToConsole(line,color){
		// if no color is set, default is white
		if(!color) color="white";

		// if line is a string, concat to consoleData
		if( typeof line == 'string' || line instanceof String)
			consoleData.push({text:line,color:color});
		// if line is an array of lines 
		else if( line instanceof Array )
			angular.forEach(line,function(value,key){
				addToConsole(value,color);
			});
		else
			addToConsole(value.toString(),color)
	}


	//Runs all of the tests for the specified function, sending the results to the server
	testRunner.runTestsForFunction = function(idForFunction,functionCode)
	{
		deferred = $q.defer();

		functionID = idForFunction;
		this.running = false;
		// Load the tests
		validTests = testsService.validTestsforFunction(functionID);
		
		// Load the functions. As the specified function may itself directly or indirectly call every function, 
		// load all functions in the system.
		// For every function in the system, get the actual function name with a mocked implementation
		// and the corresponding mocked function with the actual function implementation.
		// As we will be using JSHint to check for syntax errors and JSHint requires that functions be defined
		// lexically before (e.g., above in the source code) they are called, include at the beginning of this
		// the headers of all of the functions and mocks with a blank body. When functions are subsequently called
		// below these defs, they will then always point to a function that has already been defined. After the functions
		// are originally defined above, they will be redefined below with the actual implementation, which will 
		// overwrite the empty first definitions.

		var functionsWithMockBodies = '';
		var functionsWithEmptyBodies = '';	
		var allFunctionIDs = functionsService.allFunctionIDs();

		for (var i=0; i < allFunctionIDs.length; i++)
		{
			functionsWithEmptyBodies += functionsService.getMockEmptyBodiesFor(allFunctionIDs[i]);
			if(functionCode!=undefined && (typeof functionCode) == "string"){
				functionsWithMockBodies += functionsService.getMockCodeFor(allFunctionIDs[i],functionCode);
			}
			else
				functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i]);
		}	
		allTheFunctionCode = functionsWithEmptyBodies + '\n' + functionsWithMockBodies;	

		console.log(functionsWithMockBodies);
		// Load the mocks
		mocks = {};
		this.loadMocks(testsService.getValidTests());

		resetConsole();

		// Initialize test running state
		allPassedTestCases = new Array();
		allFailedTestCases = new Array();
		currentTextIndex = 0;
		
		// Run the tests
		this.runTest();

		return deferred.promise;
	}
	
	
	// Loads the mock datastructure using the data found in the mockData - an object in MocksDTO format
	testRunner.loadMocks = function(testData)
	{
		console.log("loading mocks");
		console.log(testData);
		$.each(testData, function(index, storedMock)
		{
			console.log("-- loading mock index="+index);
			console.log(storedMock);

			// If the mock is poorly formatted somehow, want to keep going...
			try
			{
				// If there is not already mocks for this function, create an entry
				var functionMocks;
				if (mocks.hasOwnProperty(storedMock.functionName))
				{
					functionMocks = mocks[storedMock.functionName];
				}
				else
				{
					functionMocks = {};
					mocks[storedMock.functionName] = functionMocks;
				}
				
				// We currently have the inputs in the format [x, y, z]. To build the inputs key,
				// we need them in the format {"0": 1}
				var inputsKey = {};
				$.each(storedMock.simpleTestInputs, function(index, input)
				{
					inputsKey[JSON.stringify(index)] = JSON.parse(input);				
				});
				
				functionMocks[JSON.stringify(inputsKey)] = { inputs: storedMock.simpleTestInputs, 
						      output: JSON.parse(storedMock.simpleTestOutput) };
			}
			catch (e)
			{
				console.log("Error loading mock " + index);				
			}			
		});
	}


	testRunner.processTestFinished = function(testStopped, testResult)
	{
		// If the code is unimplemented, the test neither failed nor passed. If the test
		// did not pass or timed out, it failed. Otherwise, it passed.
		if (testStopped)
			allFailedTestCases.push(currentTextIndex);
		else if(!testResult.codeUnimplemented)
		{
			if (!testResult.passed){
				addToConsole("Result: FAILED","rgb(184, 134, 134)");
				allFailedTestCases.push(currentTextIndex);
			}
			else{
				addToConsole("Result: PASSED","rgb(125, 171, 125)");
				allPassedTestCases.push(currentTextIndex);
			}
		}
		
		addToConsole(testResult.log);
		// Increment the test and run the next one.
		currentTextIndex++;
		this.runTest();		
	}

	testRunner.runTest = function()
	{
		//console.log("running test "); console.log(validTests[currentTextIndex]);
		// If we've run out of tests
		if (currentTextIndex >= validTests.length)
		{
			deferred.resolve({
				passedTests:allPassedTestCases,
				console:consoleData
			});
			return;
		}
		
		var testCode = validTests[currentTextIndex].code;  //.replace(/\n/g,"");
		
		addToConsole("> Running test for test code: " + testCode);
		
		
		// Check the code for syntax errors using JSHint. Since only the user defined code will be checked,
		// add extra defs for references to the instrumentation code.
		var extraDefs = "var mocks = {}; function hasMockFor(){} function printDebugStatement (){} ";		
		var codeToLint = extraDefs + allTheFunctionCode + testCode;
		console.log("TestRunner linting on: " + codeToLint);
		var lintResult = JSHINT(getUnitTestGlobals() + codeToLint, getJSHintGlobals());
		var errors = checkForErrors(JSHINT.errors);
		//console.log("errors: " + JSON.stringify(errors));
		
		var testResult;
		
		// If there are no errors, run the test
		if(errors == "")
		{
			testRunTimeout = setTimeout(function(){this.stopTest();}, timeOutTime);
			var codeToExecute = allTheFunctionCode + testCode;

			// execute the tests on the worker thread
		    worker = new Worker('/js/workers/testRunnerWorker.js');

		    // Add a callback on the worker for receiving and processing messages from the worker. 
		    worker.onmessage = function(e) 
		    {
			    clearTimeout(testRunTimeout);					    	
				testRunner.processTestFinished(false, e.data);
		    }
		    
			// load the script and start the worker
			worker.postMessage({url: document.location.origin});					
			worker.postMessage({number: currentTextIndex, code: codeToExecute, mocks: mocks});	

		}
		else
		{
			// jshint found errors
			testCaseNumberThatFailed = currentTextIndex;
			allFailedTestCases.push(testCaseNumberThatFailed);
			
			currentTextIndex++;
			this.runTest();	
		}
	}

	testRunner.stopTest = function()
	{
		console.log("Hit timeout in TestRunner running the test " + currentTextIndex);
		
		worker.terminate();
		this.processTestFinished(true, null);
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
			getData.push('functionID='+functionID);
			getData.push('result='+passedTests);

			// PASS THE FIRST FAILED TEST ID TO THE SERVER 
			// USEFUL FOR SPAWNING A DIFFERENT DEBUG MICROTASK FOR 
			// EACH FAILED TEST
			//if( allFailedTestCases.length > 0 )
			//	getData.push("testID="+validTests[allFailedTestCases[0]].id);

			console.log(getData);
			$http.get('/' + $rootScope.projectId + '/testResult?'+getData.join("&")).
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