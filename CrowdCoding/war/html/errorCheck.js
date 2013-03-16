function checkForErrors(e)
{
	/**JSLINT CONFIG*/
	/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true*/
	/*global window: false, document: false, $: false, log: false, bleep: false,test: false*/
	  
	var anyErrors = false;
	var stringOfErrors = "";
	for (var i = 0; i < e.length; i++) 
	{
		// I am not sure if checking making sure not null is okay, I think so
		// but I am commenting just to be sure. If all reasons are null then
		// I think should be okay
		if(e[i] != null && e[i].reason != "Weird program." && e[i].reason != "Unexpected 'return'.") 
		{
			if(e[i].reason == "Stopping. (100% scanned).")
			{
				continue;
			}
			debugger;
			stringOfErrors += e[i].reason + "</br>";
			anyErrors = true;
		}
	}
	if(anyErrors)
	{
		debugger;
		return stringOfErrors; 
	}
	debugger;
	return "";
}

function getJSLintGlobals()
{
	debugger;
	// if releated to a parameter you can check box in JLINT website add here
	return {browser: true, continue: true, debug: true, devel: true, eqeq: true, evil: false, fragment: true, newcap: true, node: true, on: true, plusplus: true, rhino: true, sloppy: true, stupid: true, sub: true, todo: true,vars: true , white: true,windows: true ,bitwise: true,nomen: true,stupid: true , window: false, document: false, $: false, log: false, bleep: false};
}

function getUnitTestGlobals()
{
	// if related to unittest for lint add here
	return "/*global window: false, document: false, $: false, throws:false, log: false, bleep: false, equal: false,notEqual: false,deepEqual: false,notDeepEqual: false,raises: false*/";
}