var assertionResults = new Array();
var details = { 'failed' : 0 };

function nullStringFix(stringToCheck){
	if( typeof stringToCheck == 'string' && stringToCheck == 'null')
		return null;
	return stringToCheck;
}


function equal(actual, expected, message){
	// in cases of comparision between null and 'null'
	// actual   = nullStringFix(actual);
	// expected = nullStringFix(expected);

	var succeeded = deepCompare(actual, expected);
	getResults(actual,expected,message,succeeded);
}

function deepEqual(actual, expected, message){

	var succeeded = ( actual === expected );
	getResults(actual,expected,message,succeeded);
}

function notEqual(actual, expected, message){

	var succeeded = !deepCompare(actual, expected)
	getResults(actual,expected,message,succeeded);
}

function notDeepEqual(actual, expected, message){

	var succeeded = (actual !== expected);
	getResults(actual,expected,message,succeeded);
}

// report the actual as error, expected as error and message as thrown error
// in order for this method to work we must take actual as a string and evaluate
// it inside throws 
function throwsException(actual,expect,message)
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
	console.log("RESULT ACTUAL = "+actual);
	assertionResults.push({ 'expected': expected, 'actual': actual, 'message': message, 'result':  succeeded});
	
	if (!succeeded)
		details.failed++;
}

function resetAssertions()
{
	assertionResults = new Array();
	details.failed = 0;
}

// Code from StackOverflow:
// http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
function deepCompare() 
{
	  var leftChain, rightChain;

	  function compare2Objects (x, y) {
	    var p;

	    // remember that NaN === NaN returns false
	    // and isNaN(undefined) returns true
	    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
	         return true;
	    }

	    // Compare primitives and functions.     
	    // Check if both arguments link to the same object.
	    // Especially useful on step when comparing prototypes
	    if (x === y) {
	        return true;
	    }

	    // Works in case when functions are created in constructor.
	    // Comparing dates is a common scenario. Another built-ins?
	    // We can even handle functions passed across iframes
	    if ((typeof x === 'function' && typeof y === 'function') ||
	       (x instanceof Date && y instanceof Date) ||
	       (x instanceof RegExp && y instanceof RegExp) ||
	       (x instanceof String && y instanceof String) ||
	       (x instanceof Number && y instanceof Number)) {
	        return x.toString() === y.toString();
	    }

	    // At last checking prototypes as good a we can
	    if (!(x instanceof Object && y instanceof Object)) {
	        return false;
	    }

	    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
	        return false;
	    }

	    if (x.constructor !== y.constructor) {
	        return false;
	    }

	    if (x.prototype !== y.prototype) {
	        return false;
	    }

	    // check for infinitive linking loops
	    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
	         return false;
	    }

	    // Quick checking of one object beeing a subset of another.
	    // todo: cache the structure of arguments[0] for performance
	    for (p in y) {
	        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
	            return false;
	        }
	        else if (typeof y[p] !== typeof x[p]) {
	            return false;
	        }
	    }

	    for (p in x) {
	        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
	            return false;
	        }
	        else if (typeof y[p] !== typeof x[p]) {
	            return false;
	        }

	        switch (typeof (x[p])) {
	            case 'object':
	            case 'function':

	                leftChain.push(x);
	                rightChain.push(y);

	                if (!compare2Objects (x[p], y[p])) {
	                    return false;
	                }

	                leftChain.pop();
	                rightChain.pop();
	                break;

	            default:
	                if (x[p] !== y[p]) {
	                    return false;
	                }
	                break;
	        }
	    }

	    return true;
	  }

	  if (arguments.length < 1) {
	    return true; //Die silently? Don't know how to handle such case, please help...
	    // throw "Need two or more arguments to compare";
	  }



	  for (var i = 1, l = arguments.length; i < l; i++) {

	      leftChain = []; //todo: this can be cached
	      rightChain = [];

	      if (!compare2Objects(arguments[0], arguments[i])) {
	          return false;
	      }
	  }

	  return true;
}