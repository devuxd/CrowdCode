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
function logCall( functionName, parameters, returnValue, calleeMap )
{
	
	// if the callee map doesn't have entries for the functionName, 
	// generate a new input map
	var inputsMap;
	if(!calleeMap.hasOwnProperty(functionName)){ 
		inputsMap = {};
		calleeMap[functionName]=inputsMap;
	} else
		inputsMap = calleeMap[functionName];

	// generate the inputsKey for inputsMap 
	var inputsKey = JSON.stringify(parameters);

	// create the stub entry
	inputsMap[inputsKey] = { 
		inputs : parameters,
		output : returnValue,
	};

	// update the callee map inputs map for the function
	calleeMap[functionName] = inputsMap;

	console.log("===> LOGGING CALLEE ",inputsMap);
}

// Checks if there is a mock for the function and parameters. Returns values in form
// { hasMock: BOOLEAN, mockOutput: VALUE }
function hasStubFor(functionName, parameters, stubs)
{
	var hasStub = false;
	var output = null;
	
	if(stubs.hasOwnProperty(functionName))
	{
		var inputOutputMap = stubs[functionName];
		
		var argsKey = JSON.stringify(parameters);
		
		if (inputOutputMap.hasOwnProperty(argsKey))
		{
			hasStub = true;
			output = inputOutputMap[argsKey].output;
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

function Debug() {
	this.messages = [],
	this.log = function(statement){
		this.messages.push( "> " + statement );
	}
}
