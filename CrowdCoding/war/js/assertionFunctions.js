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
	
	// report the actual as error, expected as error and message as thrown error
	// in order for this method to work we must take actual as a string and evaluate
	// it inside throws 
	function throws(actual,expect,message)
	{
		var succeeded = false;
		// if does not throw an error will not succeed 
		try
		{
			eval(actual)
		}
		catch(err)
		{
			// succeed if expected error message is same
			succeeded = err.message.indexOf(expect) > -1;
			actual = "";
			if(succeeded)
			{
				message = "Error Messages match";
			}
		}
		if(!succeeded)
		{
			actual = "no error was thrown";
		}
		getResults(actual,expect,message,succeeded);
	}
	
	
	
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