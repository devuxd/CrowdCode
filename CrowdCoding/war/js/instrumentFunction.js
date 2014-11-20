//This file is responsible for manipulating the debug fields for callee functions of a
//caller function that is failing one of its unit tests (hence, target for a debug test failure micro-task).
//This script in inserted in the file DebugTestFailure.jsp, therefore, 
//some object definitions used here come from that file. 
 
// initialize the stubs
var stubs = {};

// initialize the debug statements array
// and the debug statements counter
var debugStatements = [] ;
var numDebugStatements = 0;


//Inserts the inputs and outputs to a map datastructure that will be used 
//later to displays these values in the debug fields.
function logCall( functionName, parameters, stubReturnValue, realReturnValue )
{
	// if the callee map doesn't have entries for the functionName, 
	// generate a new input map
	var inputsMap;
	if(!stubs.hasOwnProperty(functionName)){ 
		inputsMap = {};
		stubs[functionName]=inputsMap;
	} else
		inputsMap = stubs[functionName];
	

	// if stubReturnValue, has been generated at run-time
	// and is not a stub derived from a existent test
	if( stubReturnValue == null ) stubReturnValue = realReturnValue;

	
	// generate the inputsKey for inputsMap 
	var inputsKey = JSON.stringify(parameters);

	// passed parameters should be strings
	var parameterFormatter = function(arguments){
		var returnValue = [];
		for(var i=0; i < arguments.length;i ++)
			returnValue[i] = arguments[i].toString();

		return returnValue;
	}

	// create the stub entry
	inputsMap[inputsKey] = { 
		inputs     : parameterFormatter(parameters),
		stubOutput : (typeof stubReturnValue === 'object')?JSON.stringify(stubReturnValue):stubReturnValue,
		realOutput : (typeof realReturnValue === 'object')?JSON.stringify(realReturnValue):realReturnValue,
	};

	// update the callee map inputs map for the function
	stubs[functionName] = inputsMap;

	console.log("LOG CALL "+functionName);
	console.log(stubs);
}

// add a debug statement 
function logDebug(statement){
	debugStatements[numDebugStatements++] = " > "+statement.toString();
}

// Checks if there is a mock for the function and parameters. Returns values in form
// { hasMock: BOOLEAN, mockOutput: VALUE }
function hasStubFor(functionName, parameters, stubs)
{
	var hasStub = false;
	var stubOutput = null;
	
	if(stubs.hasOwnProperty(functionName))
	{
		var inputOutputMap = stubs[functionName];
		
		var argsKey = JSON.stringify(parameters);
		if (inputOutputMap.hasOwnProperty(argsKey))
		{
			hasStub = true;
			stubOutput = inputOutputMap[argsKey].stubOutput;
		}			
	}

	return { hasStub: hasStub, stubOutput: stubOutput };
}


// utility function: replace all the occurrences 
// of 'find' with 'replace' inside the string 'str'
// and returns the replaced string
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}
