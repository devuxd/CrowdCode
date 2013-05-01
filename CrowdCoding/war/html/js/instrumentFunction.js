

//This file is responsible for manipulating the debug fields for callee functions of a
//caller function that is failing one of its unit tests (hence, target for a debug test failure micro-task).

//This script in inserted in the file DebugTestFailure.jsp, therefore, 
//some object definitions used here come from that file. 
 
 	//Run the new 
 
	var debugInput = 2;
	var calleeList=[];  //List of all callees by function name
	var calleeMap = {}; //Map with information from callee to their inputs-output
	
	
	//Insert log statements and modify the caller body to call the callee wrappers Obtain the list of callees by traversing the AST (Abstract Syntax Tree) for the Caller 
	function instrumentCallerForLogging(callerSourceCode){
		
		debugger;
		
		//Reinitializes the global datastructures
		calleeList=[];
		calleeMap ={};
		
		console.log("callerSourceCode-----------------------------");
		console.log(callerSourceCode);
		var tree = esprima.parse(callerSourceCode); //Create the AST for it
		console.log("Created tree = esprima.parse="+ JSON.stringify(tree));
		
		//Traverse it looking for the type function expression and replace the callee name by the callee wrappper
		
		traverse(tree, function (node){
				if((node!=null)&& (node.type === 'CallExpression')){
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
	
	
	//Verify whether the node in the AST is a function call and log it.
	/*function visitorCallees(node){
		if((node!=null)&& (node.type === 'CallExpression')){
			console.log("callee name ="+ node.callee.name);
			calleeList.push({
			name: node.callee.name,
			});
			node.callee.name = name+"_Wrapper";
		return true;
		}
		else
		 return false;
	}*/
	
	
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
	
	
	//Replace the calls for callees for calls to the wrapper functions
	/*function visitorInstrumentCaller(node){
		
		if((node!=null)&& (node.type === 'CallExpression')){
			console.log("callee name ="+ node.callee.name);
			node.callee.name = node.callee.name + "_Wrapper";
			calleeList.push({
			name: node.callee.name,
			});
		return true;
		}
		else
		 return false;
	}*/

	//Generate instrumented callees
	function instrumentCallees(){
		var wrapperFunctionBodies="";
		//For all callees 
		console.log("logging calleeList:");
		console.log(calleeList);
		
		$.each(calleeList, function(i,calleeName){
			var wrapperName = calleeName + "_Wrapper"
			
			
			//Insert log statement for each callee (log inputs and outputs).
			//The arguments word used below retrieves the function arguments of the callee automatically for us.
			var wrapperBody = " function "+ wrapperName+"(){ "+
							" var returnValue=" + calleeName+ ".apply(null,arguments); "+
							" logCall("+ "'"+calleeName + "'"+",arguments,returnValue); "+
							" return returnValue;"+
							" } ";			
			wrapperFunctionBodies = wrapperFunctionBodies + wrapperBody;
		});
		return wrapperFunctionBodies;
	}

	//Inserts the inputs and outputs to a map datastructure that will be used 
	//latter to displays these values in the debug fields.
	function logCall(functionName, parameters, returnValue){
		debugger;
		
		var inputsMap;
		if(!calleeMap.hasOwnProperty(functionName)){ 
			inputsMap = {};
			calleeMap[functionName]=inputsMap;
		}
		else
			inputsMap = calleeMap[functionName];
		
		//we had to stringify parameters so we obtain a unique identifier to be used in the inputsMap 
		var args = {arguments:parameters, 
					toString: function(){
						return JSON.stringify(parameters);
						}
					};
		
		inputsMap[args] = { returnValue: returnValue, parameters:parameters};
		calleeMap[functionName] = inputsMap;
		
	}