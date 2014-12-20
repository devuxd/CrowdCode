//This file is responsible for manipulating the debug fields for callee functions of a
//caller function that is failing one of its unit tests (hence, target for a debug test failure micro-task).
//This script in inserted in the file DebugTestFailure.jsp, therefore, 
//some object definitions used here come from that file. 
 
// initialize the debug statements array
// and the debug statements counter
var debugStatements = [] ;
var numDebugStatements = 0;
var debug = {};


//Inserts the inputs and outputs to a map datastructure that will be used 
//later to displays these values in the debug fields.
function logCall( functionName, parameters, returnValue, usedStubs , stubMap, debug)
{
	// if the callee map doesn't have entries for the functionName, 
	// generate a new input map
	var inputsMap;
	if(  usedStubs[functionName] === undefined ){ 
		inputsMap = {};
		usedStubs[functionName]=inputsMap;
	} else
		inputsMap = usedStubs[functionName];

	var stubKey = JSON.stringify(parameters);

	var stringifiedInputs = [];
	for( var i=0;i<parameters.length;i++)
		stringifiedInputs[i] = JSON.stringify(parameters[i]);

	// create the stub entry
	inputsMap[stubKey] = { 
		inputs : stringifiedInputs,
		output : JSON.stringify(returnValue)
	};

	// update the callee map inputs map for the function
	usedStubs[functionName] = inputsMap;

	if( stubMap[functionName] === undefined )
		stubMap[functionName] = {};
	stubMap[functionName][stubKey] = true;
}

// Checks if there is a mock for the function and parameters. Returns values in form
// { hasStub: BOOLEAN, stubOutput: VALUE }
function hasStubFor(functionName, parameters, stubs, debug)
{
	var hasStub = false;
	var output = null;
	
	// debug.log("Stub for "+functionName);
	// debug.log(JSON.stringify(parameters));

	if( stubs[ functionName ] !== undefined )
	{
		var inputMap  = stubs[functionName];
		var inputsKey =  JSON.stringify(parameters)  ;

		if ( stubs[ functionName ][ inputsKey ] !== undefined )
		{
			hasStub = true;
			output  = stubs[ functionName ][inputsKey].output;
		}			
	}

	return { hasStub: hasStub, output: output };
}


// utility function: replace all the occurrences 
// of 'find' with 'replace' inside the string 'str'
// and returns the replaced string
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function deepCopy(obj) {
    var ret = {}, key, val;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === 'object' && val !== null) {
                ret[key] = deepCopy(val);
            } else {
                ret[key] = val;
            }
        }
    }
    return ret;
}

function Debug() {
	this.messages = [],
	this.log = function(statement){
		if( typeof statement == 'object')
			statement = JSON.stringify(statement);
		this.messages.push( "> " + statement );
	}
}
