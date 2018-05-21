function checkForErrors(e)
{
	/**JSHINT CONFIG*/
	/*jshint camelcase: false, white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true*/
	/*global window: false, document: false, $: false, log: false, bleep: false,test: false*/

	var anyErrors = false;
	var arrayOfErrors = [];
	for (var i = 0; i < e.length; i++) 
	{
		// I am not sure if checking making sure not null is okay, I think so
		// but I am commenting just to be sure. If all reasons are null then
		// I think should be okay
//		if(e[i] != null && e[i].reason != "Weird program." && e[i].reason != "Unexpected 'return'." && e[i].reason != "Unexpected 'else' after 'return'.") 
//		{
//			if(e[i].reason == "Stopping. (100% scanned).")
//			{
//				continue;
//			}
//			debugger;
		    if (e[i] != null)
		    {
                                // ignore errors from calling third party APIs, Their names finish with implementation
                if(e[i].reason.endsWith('Implementation\' is not defined.')){
                	console.log('enterd',e[i]);
                    return "";
                } else {
                    arrayOfErrors.push("Line " + e[i].line + ": " + e[i].reason);
                    anyErrors = true;
                }
		    }
//		}
	}
	if(anyErrors)
	{
		return arrayOfErrors; 
	}
	return "";
}

function getJSHintGlobals()
{
	//latededf was  true, setted as false
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true};
}

function getJSHintForPseudocalls()
{
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true};
}

function getJSHintForStatements()
{
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true };
}

function getUnitTestGlobals()
{
	// if related to unittest for lint add here
	return "/*global window: false, document: false, $: false, throws:false, log: false, bleep: false, equal: false, notEqual: false, deepEqual: false, notDeepEqual: false, raises: false*/";
}