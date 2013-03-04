	var results = new Array();
	var details = { 'failed' : 0 };


	function equal(actual, expected, message)
	{
		var succeeded = (actual == expected);
		results.push({ 'expected': expected, 'actual': actual, 'message': message, 'result':  succeeded});
		
		if (!succeeded)
			details.failed++;
	}
	
	function resetAssertions()
	{
		results = new Array();
		details.failed = 0;
	}
	
