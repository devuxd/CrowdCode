// Runs all of the tests in the system.

var timeOutTime = 1000;
var validTests;
var allPassedTestCases;
var allFailedTestCases;
var allTheFunctionCode;
var mocks;
var worker;
var testRunTimeout;
var currentTextIndex;

// Runs all currently valid tests, sending the results from the test run to the server.
function runAllTests()
{
	// Load the tests
	validTests = tests.getValidTests();
	
	// Load the functions.	
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
	var allFunctionIDs = functions.allFunctionIDs();
	for (var i=0; i < allFunctionIDs.length; i++)
	{
		functionsWithEmptyBodies += functions.getMockEmptyBodiesFor(allFunctionIDs[i]);
		functionsWithMockBodies += functions.getMockCodeFor(allFunctionIDs[i]);
	}	
	allTheFunctionCode = functionsWithEmptyBodies + '\n' + functionsWithMockBodies;	
	
	// Load the mocks
	mocks = {};
	loadMocks(tests.getValidTests());

	// Initialize test running state
	allPassedTestCases = new Array();
	allFailedTestCases = new Array();
	currentTextIndex = 0;
	
	// Run the tests
	runTest();
}
				
// Loads the mock datastructure using the data found in the mockData - an object in MocksDTO format
function loadMocks(testData)
{
	$.each(testData, function(index, storedMock)
	{
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

function runTest()
{
	// If we've run out of tests
	if (currentTextIndex >= validTests.length)
	{
		finishTesting();
		return;
	}
	
	var testCode = validTests[currentTextIndex].code;  //.replace(/\n/g,"");
	console.log("test code: " + testCode);
	
	
	// Check the code for syntax errors using JSHint. Since only the user defined code will be checked,
	// add extra defs for references to the instrumentation code.
	var extraDefs = "var mocks = {}; function hasMockFor(){} function printDebugStatement (){} ";		
	var codeToLint = extraDefs + allTheFunctionCode + testCode;
	console.log("TestRunner linting on: " + codeToLint);
	var lintResult = JSHINT(getUnitTestGlobals() + codeToLint, getJSHintGlobals());
	var errors = checkForErrors(JSHINT.errors);
	console.log("errors: " + JSON.stringify(errors));
	
	var testResult;
	
	// If there are no errors, run the test
	if(errors == "")
	{
		testRunTimeout = setTimeout(function(){stopTest();}, timeOutTime);
		var codeToExecute = allTheFunctionCode + testCode;

		// execute the tests on the worker thread
	    worker = new Worker('testRunnerWorker.js');
	    worker.onmessage = function(e) 
	    {
		    clearTimeout(testRunTimeout);					    	
		    console.log("Received: " + e.data);
			processTestFinished(false, e.data);
	    }
	    
		// load the script and start the worker
		worker.postMessage({url: document.location.origin});					
		worker.postMessage({number: currentTextIndex, code: codeToExecute, mocks: mocks});			
	}
	else
	{
		// jshint found errors
		testCaseNumberThatFailed = currentTextIndex;
		console.log(testCaseNumberThatFailed);
		allFailedTestCases.push(testCaseNumberThatFailed);
		
		currentTextIndex++;
		runTest();	
	}
}

function stopTest()
{
	console.log("Hit timeout in TestRunner running the test " + currentTextIndex);
	
	worker.terminate();
	processTestFinished(true, null);
}
	
function processTestFinished(testStopped, testResult)
{
	// If the code is unimplemented, the test neither failed nor passed. If the test
	// did not pass or timed out, it failed. Otherwise, it passed.
	if (testStopped)
		allFailedTestCases.push(currentTextIndex);
	else if(!testResult.codeUnimplemented)
	{
		if (!testResult.passed)
			allFailedTestCases.push(currentTextIndex);
		else
			allPassedTestCases.push(currentTextIndex);
	}
	
	// Increment the test and run the next one.
	currentTextIndex++;
	runTest();		
}

function finishTesting()
{		
	// TODO: submit results to server
	
}
	
function collectFormDataForNormal()
{
		var formData = { passingTestCases: allPassedTestCases, failingTestCases: allFailedTestCases };
		return formData;
}