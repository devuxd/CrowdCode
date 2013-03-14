	var results = new Array();
	var details = { 'failed' : 0 };


	function equal(actual, expected, message)
	{
		var succeeded = (actual == expected);
		getResults(actual,expected,message,succeeded);
	}
	
	function deepEqual(actual, expected, message)
	{
		var succeeded = (actual === expected);
		getResults(actual,expected,message,succeeded);
	}
	
	function notEqual(actual, expected, message)
	{
		var succeeded = (actual != expected);
		getResults(actual,expected,message,!succeeded);
	}
	
	function notDeepEqual(actual, expected, message)
	{
		var succeeded = (actual !== expected);
		getResults(actual,expected,message,succeeded);
	}
	
	// TODO: Throws its complicated maybe try catch entire block and on error 
	// report the actual as error, expected as error and message as thrown error
//	function throws(actual,expect,message)
//	{
//		var succeeded = false;
//		try
//		{
//			actual
//		}
//		catch(err)
//		{
//			succeeded = expect = err
//		}
//		getResults(actual,expected,message,succeeded);
//	}
	
	
	
	function getResults(actual,expected,message,succeeded)
	{
		results.push({ 'expected': expected, 'actual': actual, 'message': message, 'result':  succeeded});
		
		if (!succeeded)
			details.failed++;
	}
	
	function resetAssertions()
	{
		results = new Array();
		details.failed = 0;
	}
