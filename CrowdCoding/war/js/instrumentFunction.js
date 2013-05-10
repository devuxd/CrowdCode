//This file is responsible for manipulating the debug fields for callee functions of a
//caller function that is failing one of its unit tests (hence, target for a debug test failure micro-task).
//This script in inserted in the file DebugTestFailure.jsp, therefore, 
//some object definitions used here come from that file. 
 
	var debugInput = 2;
	var calleeList=[];  //List of all callees by function name
	var calleeMap = {}; //Map with information from callee to their inputs-output
		
	//Insert log statements and modify the caller body to call the callee wrappers Obtain the list of callees by traversing the AST (Abstract Syntax Tree) for the Caller 
	function instrumentCallerForLogging(callerSourceCode)
	{
		//Reinitializes the global datastructures
		calleeList=[];
		calleeMap ={};
		
		console.log("callerSourceCode-----------------------------");
		console.log(callerSourceCode);
		var tree = esprima.parse(callerSourceCode); //Create the AST for it
		console.log("Created tree = esprima.parse="+ JSON.stringify(tree));
		
		//Traverse it looking for the type function expression and replace the callee name by the callee wrappper
		
		traverse(tree, function (node){
				if((node != null) && (node.type === 'CallExpression'))
				{
					console.log("callee name ="+ node.callee.name);
					// Add the callee if we have not seen it before
					if (calleeList.indexOf(node.callee.name) == -1)
						calleeList.push(node.callee.name);
					node.callee.name = node.callee.name+"_Wrapper";
					return true;
				}
				else
		 			return false;
			});
		
		var instrumentedCaller = escodegen.generate(tree);
		console.log("Instrumented Caller= "+instrumentedCaller);
		instrumentedCaller = instrumentedCaller + instrumentCallees(); //Generate the body of the Wrapper functions.
		return instrumentedCaller;
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
		$.each(calleeList, function(i,calleeName)
		{
			var wrapperName = calleeName + "_Wrapper";
						
			//Insert log statement for each callee (log inputs and outputs).
			//The arguments word used below retrieves the function arguments of the callee automatically for us.
			var wrapperBody = 
			"function "+ wrapperName+"()" + 
			"{ " +
				" var returnValue = " + calleeName + ".apply(null,arguments); " +
				" logCall("+ "'" + calleeName + "'" + ",arguments,returnValue, mocks); " +
				" return returnValue;" +        // JSON.parse(JSON.stringify
			"} ";			
			wrapperFunctionBodies = wrapperFunctionBodies + wrapperBody;
		});
		return wrapperFunctionBodies;
	}

	//Inserts the inputs and outputs to a map datastructure that will be used 
	//latter to displays these values in the debug fields.
	function logCall(functionName, parameters, returnValue)
	{
		// Load up the inputs map first for this function (if it exists). Otherwise, create it.		
		var inputsMap;
		if(!calleeMap.hasOwnProperty(functionName)){ 
			inputsMap = {};
			calleeMap[functionName]=inputsMap;
		}
		else
			inputsMap = calleeMap[functionName];
		
		//we had to stringify parameters so we obtain a unique identifier to be used in the inputsMap 
		var args = {arguments:parameters, 
					toString: function(){ return JSON.stringify(parameters); }  };	
		
		inputsMap[args] = { returnValue: returnValue, parameters:parameters};
		calleeMap[functionName] = inputsMap;
	}
	
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
	
	// Loads the mock datastructure using the data found in the mockData - an object in MocksDTO format
	function loadMocks(mockData)
	{
		$.each(mockData, function(index, storedMock)
		{
			// If the mock is poorly formatted somehow, want to keep going...
			try
			{
				// If there is not already mocks for this function, create an entry
				var functionMocks;
				if (mocks.hasOwnProperty(storedMock.functionName))
				{
					functionMocks = mocks[storedMock.functionName];
				}
				else
				{
					functionMocks = {};
					mocks[storedMock.functionName] = functionMocks;
				}
				
				// We currently have the inputs in the format [x, y, z]. To build the inputs key,
				// we need them in the format {"0": 1}
				var inputsKey = {};
				$.each(storedMock.inputs, function(index, input)
				{
					inputsKey[JSON.stringify(index)] = JSON.parse(input);				
				});
				
				functionMocks[JSON.stringify(inputsKey)] = { inputs: storedMock.inputs, 
						      output: JSON.parse(storedMock.expectedOutput) };
			}
			catch (e)
			{
				console.log("Error loading mock " + index);				
			}			
		});
	}
