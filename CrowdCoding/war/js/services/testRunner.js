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
	var mocks;
	var worker;
	var testRunTimeout;
	var currentTextIndex;
	var functionId;
	var functionBody;
	var functionCode;
	var returnData;
	var worker;
	var calleeMap = {}
	
	
	var testRunner = {};

	
	var deferred = $q.defer();

	//Runs all of the tests for the specified function, sending the results to the server
	testRunner.runTestsForFunction = function(passedFunctionId,passedFunctionBody)
	{

		deferred = $q.defer();

		// initialize globals
		returnData         = {}; 
		calleeMap          = {};
		functionId         = passedFunctionId;
		functionBody       = passedFunctionBody;
		allPassedTestCases = new Array();
		allFailedTestCases = new Array();
		currentTextIndex   = 0;

		// Load the tests for the specified function
		validTests = TestList.getByFunctionId(functionId);

		// build the tested function code with the header
		functionCode = functionsService.renderHeaderById(functionId);
		if( functionBody != undefined ) functionCode += functionBody;
		else                            functionCode += functionsService.get(functionId).code;

		// prepare instruments function 
		//var instrumentedCaller  = instrumentCallerForLogging( completeFunctionCode );

		// load all the function code
		this.loadAllTheFunctionCode();

		// load all the mocks in the system
		this.loadMocks();

		// Run the tests
		this.runTest();

		return deferred.promise;
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

		var callee = [];
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


		console.log("CALLEE");
		console.log(callee);
	
		// for each function in the system
		var allFunctionIDs = functionsService.allFunctionIDs();
		for (var i=0; i < allFunctionIDs.length; i++)
		{
			// IF IS THE FUNCTION UNDER TEST DON'T GENERATE MOCK BODY
			if( allFunctionIDs[i] != functionId ){
				functionsWithEmptyBodies += functionsService.getMockEmptyBodiesFor(allFunctionIDs[i]);


				console.log( callee.indexOf(functionsService.getNameById(allFunctionIDs[i])) );
				if( callee.indexOf(functionsService.getNameById(allFunctionIDs[i])) != -1 )
					functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i],true);
				else 
					functionsWithMockBodies  += functionsService.getMockCodeFor(allFunctionIDs[i]);
			}
		}	

		// generate all the function code
		allTheFunctionCode = functionsWithEmptyBodies + '\n'  // functions with empty bodies
		                   + functionsWithMockBodies  + '\n'  // functions with mock bodies	
		                   + functionCode + '\n'; // tested function body
	}
	
	
	// Loads the mock datastructure using the data found in the mockData - an object in MocksDTO format
	testRunner.loadMocks = function()
	{
		mocks = {}	;
		
		var allFunctionNames = functionsService.getAllDescribedFunctionNames()

		// for each described function
		angular.forEach(allFunctionNames,function(functionName){
			try{
				var mocksForFunction = TestList.buildMocksByFunctionName(functionName);
				mocks[functionName]  = mocksForFunction;
			}
			catch (e)
			{
				console.log("Error loading mock " + functionName);				
			}	
		})
	}


	testRunner.processTestFinished = function(testStopped, testResult)
	{
		// If the code is unimplemented, the test neither failed nor passed. If the test
		// did not pass or timed out, it failed. Otherwise, it passed.
		if (testStopped) allFailedTestCases.push(currentTextIndex);
		else if(!testResult.codeUnimplemented){
			if (!testResult.passed)
				allFailedTestCases.push(currentTextIndex);
			else
				allPassedTestCases.push(currentTextIndex);
		}
	
		// Increment the test and run the next one.
		currentTextIndex++;
		this.runTest();		
	}


	testRunner.stopTest = function()
	{
		console.log("Hit timeout in TestRunner running the test " + currentTextIndex);
		
		worker.terminate();
		this.processTestFinished(true, null);
	}
		
	testRunner.runTest = function()
	{
		// IF ALL THE TESTS HAD RUNNED
		if (currentTextIndex >= validTests.length)
		{

			deferred.resolve({
				calleeMap : calleeMap,
				results   : returnData
			});
			return;
		}
		
		var testCode = validTests[currentTextIndex].getCode();  //.replace(/\n/g,"");
		
		// Check the code for syntax errors using JSHint. Since only the user defined code will be checked,
		// add extra defs for references to the instrumentation code.
		var extraDefs  = "var mocks = {}; function logCall(){} function hasMockFor(){} function printDebugStatement (){} ";		
		var codeToLint = extraDefs + allTheFunctionCode + testCode;
		var lintResult = JSHINT(getUnitTestGlobals() + codeToLint, getJSHintGlobals());
		var errors     = checkForErrors(JSHINT.errors);
		var testResult;


		//console.log("======= CODE TO LINT ");
		//console.log(codeToLint);
		
		// If there aren't LINT errors, run the test
		if(errors == ""){

			// set the max execution time
			//var timeoutPromise = $timeout( this.stopTest() , timeOutTime);

			// build the code to be executed by the worker
			var codeToExecute = allTheFunctionCode + testCode;

			//console.log("======= CODE TO EXECUTE ");
			//console.log(codeToExecute);


		    // INSTANTIATE THE WORKER
		    worker = new Worker('/js/workers/testRunnerWorker.js');

		    // Add a callback for receiving and processing messages from the worker. 
		    worker.onmessage = function(e) {
		    	// cancel the test execution timeout
			    //$timeout.cancel(timeoutPromise);
			    // add the returned data
			    calleeMap                    = e.data.calleeMap;
			    returnData[currentTextIndex] = e.data.testData;	
			    // process test finished	    	
				testRunner.processTestFinished(false, e.data);
		    }
		    
		    // initialize the worker 
			worker.postMessage({ url: document.location.origin, });

		    // pass necessary data to the worker
			worker.postMessage({    
				test       : validTests[currentTextIndex], 
				testNumber : currentTextIndex,             
				code       : codeToExecute,    
				calleeMap  : calleeMap,           
				mocks      : mocks                  
			});	

		} else { // if the lint found errors

			// add the failed test index to the failed test cases
			allFailedTestCases.push(currentTextIndex);
			
			// Increment the test and run the next one.
			currentTextIndex++;
			this.runTest();		
		}
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