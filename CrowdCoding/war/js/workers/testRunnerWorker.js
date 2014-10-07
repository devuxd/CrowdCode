// This Javascript file corresponds to an HTML5 WebWorker, and it should only be loaded through a new Worker(...)
// command. Workers execute in their own thread, and only communicate by message passing. This worker
// is designed to run the specified test code and return the results.
//

var testCasedPassed = true;
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
		 importScripts(url + '/js/instrumentFunction.js');
	}
	else
	{
		// Execute the tests for a function
		try
		{
			var finalCode = 'var mocks = ' + JSON.stringify(data.mocks) + '; ' + data.code;
			eval(finalCode);
			
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
			testCasedPassed = false;
			// Check if the tests cases failed because code was discovered that was not yet implemented.
			// (as observed by the special NotImplementedException). If so, set the approrpriate flag.			
			if (err instanceof NotImplementedException)
				codeUnimplemented = true;
		}
		self.postMessage({
			number : data.number,
			passed : testCasedPassed,
			codeUnimplemented : codeUnimplemented
		});
	}
};
