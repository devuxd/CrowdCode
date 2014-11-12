// This Javascript file corresponds to an HTML5 WebWorker, and it should only be loaded through a new Worker(...)
// command. Workers execute in their own thread, and only communicate by message passing. This worker
// is designed to run the specified test code and return the results.
//
var debugStatements   = [];
var calleeMap = {};
var testCasedPassed   = true;
var codeUnimplemented = false;		// is any of the code under test unimplemented?

self.onmessage = function(e) 
{
	var data = e.data;
	if (data.url)
	{
		 // Because of the way that the webworker is included, we need to get the full URL in order to
		 // include a script. Get the base URL for the server from the parameter.
		 var url = data.url;
		 var index = url.indexOf('index.html');
		 if (index != -1)
		 {
		     url = url.substring(0, index);
	     }
		 importScripts(url + '/js/assertionFunctions.js');
		 //importScripts(url + '/js/instrumentFunction.js'); ALL UTILITY FUNCTIONS ARE BOTTOM
	}
	else
	{
		// Execute the tests for a function
		try
		{

			// insert all the mocks for the final code
			var finalCode = 'var mocks = ' + JSON.stringify(data.mocks) + '; \n'
					      + data.code;
			calleeMap = data.calleeMap;
			
			// REPLACE THE LOG STATEMENTS 
			finalCode = finalCode.replace("printDebugStatement","logDebug");

			// EXECUTE ALL THE CODE
			eval(finalCode);
			

			//SHOW IN THE CONSOLE THE FINAL CODE 			
			console.log("+++++ FINAL CODE IN WORKER +++++");
			console.log(finalCode);		
			console.log("++++++++++++++++++++++");



			// If any of the tests failed, set test cases passed to false
			for (var index = 0; index < results.length; index++) 
			{
				if (!results[index].result) 
				{
					testCasedPassed = false;
					break;
				}
			}

		} catch (err) {
			console.log("+++++ THERE WAS AN ERROR IN THE TEST RUNNER WORKER ");
			console.log(err);
			testCasedPassed = false;
			// Check if the tests cases failed because code was discovered that was not yet implemented.
			// (as observed by the special NotImplementedException). If so, set the approrpriate flag.			
			if (err instanceof NotImplementedException)
				codeUnimplemented = true;
		}

		self.postMessage({
			testData  : {
				testNumber        : data.number,
				testResult        : testCasedPassed,
				debugStatements   : debugStatements,
				codeUnimplemented : codeUnimplemented,
			},
			calleeMap : calleeMap,
		});
	}
};


//Inserts the inputs and outputs to a map datastructure that will be used 
	//later to displays these values in the debug fields.
	function logCall( functionName, parameters, mockReturnValue, realReturnValue )
	{
		// Load up the inputs map first for this function (if it exists). Otherwise, create it.		
		var inputsMap;
		if(!calleeMap.hasOwnProperty(functionName)){ 
			inputsMap = {};
			calleeMap[functionName]=inputsMap;
		}else
			inputsMap = calleeMap[functionName];
		
		//we had to stringify parameters so we obtain a unique identifier to be used in the inputsMap 
		var args = {
			arguments:parameters, 
			toString: function(){ return JSON.stringify(parameters); }  
		};	

		if( mockReturnValue == null ) mockReturnValue = realReturnValue;
		
		inputsMap[JSON.stringify(parameters)] = { 
			inputs : parameters,
			mockOutput : mockReturnValue,
			realOutput : realReturnValue,
		};

		calleeMap[functionName] = inputsMap;
	}

	function logDebug(statement){
		debugStatements.push(statement.toString());
	}
	
	// Checks if there is a mock for the function and parameters. Returns values in form
	// { hasMock: BOOLEAN, mockOutput: VALUE }
	function hasMockFor(functionName, parameters, mocks)
	{
		var hasMock = false;
		var mockOutput = null;
		
		if(mocks.hasOwnProperty(functionName))
		{
			var inputOutputMap = mocks[functionName];
			
			var argsKey = JSON.stringify(parameters);
			if (inputOutputMap.hasOwnProperty(argsKey))
			{
				hasMock = true;
				mockOutput = inputOutputMap[argsKey].output;
			}			
		}
		return { hasMock: hasMock, mockOutput: mockOutput };
	}
	