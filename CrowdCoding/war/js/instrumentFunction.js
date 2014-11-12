//This file is responsible for manipulating the debug fields for callee functions of a
//caller function that is failing one of its unit tests (hence, target for a debug test failure micro-task).
//This script in inserted in the file DebugTestFailure.jsp, therefore, 
//some object definitions used here come from that file. 
 


var debugInput = 2;
var calleeList = []; 
var calleeMap = {};
var debugStatements = {};
console.log(debugStatements);
var numDebugStatements = 0;


//Inserts the inputs and outputs to a map datastructure that will be used 
//later to displays these values in the debug fields.
function logCall( functionName, parameters, mockReturnValue, realReturnValue )
{
	// Load up the inputs map first for this function (if it exists). Otherwise, create it.		
	var inputsMap;
	if(!calleeMap.hasOwnProperty(functionName)){ 
		inputsMap = {};
		calleeMap[functionName]=inputsMap;
	}else
		inputsMap = calleeMap[functionName];
	
	//we had to stringify parameters so we obtain a unique identifier to be used in the inputsMap 
	var args = {
		arguments:parameters, 
		toString: function(){ return JSON.stringify(parameters); }  
	};	

	if( mockReturnValue == null ) mockReturnValue = realReturnValue;
	
	inputsMap[JSON.stringify(parameters)] = { 
		inputs : parameters,
		mockOutput : mockReturnValue,
		realOutput : realReturnValue,
	};

	calleeMap[functionName] = inputsMap;
}


console.log(debugStatements);
function logDebug(statement){
	console.log("debug stat + "+statement);
	console.log("debug stat + "+numDebugStatements);
	debugStatements[++numDebugStatements] = statement.toString();

	console.log(debugStatements);

}

console.log(debugStatements);

// Checks if there is a mock for the function and parameters. Returns values in form
// { hasMock: BOOLEAN, mockOutput: VALUE }
function hasMockFor(functionName, parameters, mocks)
{
	var hasMock = false;
	var mockOutput = null;
	
	if(mocks.hasOwnProperty(functionName))
	{
		var inputOutputMap = mocks[functionName];
		
		var argsKey = JSON.stringify(parameters);
		if (inputOutputMap.hasOwnProperty(argsKey))
		{
			hasMock = true;
			mockOutput = inputOutputMap[argsKey].output;
		}			
	}
	return { hasMock: hasMock, mockOutput: mockOutput };
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

 //List of all callees by function name
	 //Map with information from callee to their inputs-output
		
		/*
	//Insert log statements and modify the caller body to call the callee wrappers Obtain the list of callees by traversing the AST (Abstract Syntax Tree) for the Caller 
	function instrumentCallerForLogging(callerSourceCode)
	{
		//Reinitializes the global datastructures
		calleeList =[];
		calleeMap  ={};
		
		console.log("----  CALLER SOURCE CODE");
		console.log(callerSourceCode);
		var tree = esprima.parse(callerSourceCode); //Create the AST for it
		console.log("----- ESPRIMA TREE ");
		console.log(JSON.stringify(tree));
		
		//Traverse it looking for the type function expression and replace the callee name by the callee wrappper
		
		traverse(tree, function (node){
			if((node != null) && (node.type === 'CallExpression'))
			{
				console.log("----- callee node: "+node.callee);
				console.log(node);
				
				// Add the callee if we have not seen it before
				if (calleeList.indexOf(node.callee.name) == -1){

					var argsValues = [];
					for(var i=0; i < node.arguments.length ; i++)
						argsValues.push(node.arguments[i].value);

					calleeList.push( { 
						name: node.callee.name, 
						arguments: argsValues
					});
				}
				node.callee.name = node.callee.name+"_Wrapper";
				return true;
			}
			else
	 			return false;
		});

		var instrumentedCaller = escodegen.generate(tree);
		console.log("---- Instrumented Caller= \n "+instrumentedCaller);
		var instrumentedCallees =  instrumentCallees() ;
		console.log("---- Instrumented Callees= \n "+instrumentedCallees);


		return instrumentedCaller + instrumentedCallees;
	}
	
	function traverse(node, func) {
	    func(node);//1
    	for (var key in node) { //2
        	if (node.hasOwnProperty(key)) { //3
            	var child = node[key];
            	if (typeof child === 'object' && child !== null) { //4
                	if (Array.isArray(child)) {
						child.forEach(function(node) { //5
						 	traverse(node, func);
						});
                	} else {
                    	traverse(child, func); //6
               	 	}
            	}
        	}
    	}
	}
	
	//Generate instrumented callees
	function instrumentCallees()
	{
		var wrapperFunctionBodies = "";		
		$.each(calleeList, function(i,callee)
		{
			var wrapperName = callee.name + "_Wrapper";
			var arguments   = callee.arguments;
						
			//Insert log statement for each callee (log inputs and outputs).
			//The arguments word used below retrieves the function arguments of the callee automatically for us.
			var wrapperBody = 
			"function "+ wrapperName+"() \n" + 
			"{ \n" +
				" var returnValue = " + callee.name + ".apply(null,arguments); \n " +
				" logCall("+ "'" + callee.name + "'" + ",arguments,returnValue); \n" +
				" return returnValue; \n" +        // JSON.parse(JSON.stringify
			"} ";			
			wrapperFunctionBodies = wrapperFunctionBodies + wrapperBody;
		});
		return wrapperFunctionBodies;
	}*/

	