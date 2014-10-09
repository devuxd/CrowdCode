

////////////////////
//FUNCTIONS SERVICE   //
////////////////////
myApp.factory('functionsService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {
	
	var service = new function(){
		// Private variables	
		var functions;
		
		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); };
		this.functionAdded = function(addedFunction) { return functionAdded(addedFunction); };
		this.functionChanged = function(changedFunction) { return functionChanged(changedFunction); };	
		this.allFunctionIDs = function() { return allFunctionIDs(); };
		this.get = function(id) { return get(id); };
		this.getMockCodeFor = function(id) { return getMockCodeFor(id); };
		this.getMockEmptyBodiesFor = function(id) { return getMockEmptyBodiesFor(id); };
		this.getMockHeader = function(id) { return getMockHeader(id); };
		this.renderDescription= function(functionCalled) { return renderDescription(functionCalled); };
		this.getAllDescribedFunctionCoode = function(idFunction) { return getAllDescribedFunctionCoode(idFunction); };
		this.getAllDescribedFunctionNames = function(idFunction) { return getAllDescribedFunctionNames(idFunction); };
	 	this.isValidParamDescription = function(line) { return isValidParamDescription(line); };
		
		
		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
			var functionsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functions = functionsSync.$asArray();
			functions.$loaded().then(function(){ console.log('functions loaded');  });
		}
		
		
		
		/*
		// Event handler for a function being added or changed
		function functionAdded(addedFunction)
		{
			functions[addedFunction.id] = addedFunction;
			functionCount++;
			linesOfCode += addedFunction.linesOfCode;
			statsChangeCallback(linesOfCode, functionCount);
		}	
		
		function functionChanged(changedFunction)
		{
			linesOfCode += changedFunction.linesOfCode - functions[changedFunction.id].linesOfCode;
			functions[changedFunction.id] = changedFunction;
			statsChangeCallback(linesOfCode, functionCount);		
		}	*/
		
		// Returns an array with every current function ID
		function allFunctionIDs()
		{
			var functionIDs = [];	
			$.each(functions, function(i, value)
			{
				functionIDs.push(value.id);
			});

			return functionIDs;
		}
		
		// Returns all the described function Names except the one with the passed ID 
		function getAllDescribedFunctionNames(idFunction)
		{
			var functionNames = [];	
			$.each(functions, function(i, value)
			{
				if(value.described && value.id!=idFunction)
					functionNames.push(value.name);
				
			});

			return functionNames;
		}
	
		// Returns all the described function signature except the one with the passed ID 
		function getAllDescribedFunctionCoode(idFunction)
		{

			var functionsCode = "";	
			$.each(functions, function(i, value)
			{
				if(value.described && value.id!=idFunction)
					functionsCode+=value.header+"{ }";
				
			});

			return functionsCode;
		}
		
		
		// Get the function object, in FunctionInFirebase format, for the specified function id
		function get(id)
		{
			if (functions.hasOwnProperty(id))		
				return functions[id];
			else
				return null;
		}
		
		// Get the function declaration and mock implementation for the function with the specified id.
		// Rather than the actual implementation, the implementation is replace with an implementation
		// that checks for a corresponding mock and only calls the corresponding actual implementation 
		// if the mock is not present.
		// Returns an empty string if the specified function cannot be found.
		function getMockCodeFor(id)
		{
			var mockCode = '';		
			var functionObj = get(id);
			if (functionObj == null)
				return '';
			
			// First, add the normal header for the function
			mockCode += functionObj.header + '\n';
			
			// Next, add the mock implementation body
			mockCode += '{ var returnValue; \n';
			mockCode += 'var params = arguments; \n';
			mockCode += 'var mockFor = hasMockFor(\'' + functionObj.name + '\', arguments, mocks); \n';
			mockCode += 'if (mockFor.hasMock) \n';
			mockCode += '     returnValue = mockFor.mockOutput; \n';
			mockCode += 'else \n';
			mockCode += '     returnValue = ' + functionObj.name + 'aaaActualIMP.apply(null, params); \n';
			mockCode += 'return returnValue; \n}\n\n';

			// Third, add the special header for the actual implementation
			mockCode += getMockHeader(id);
			
			// Fourth, add the actual code body of the function
			mockCode += functionObj.code + '\n';
			
			return mockCode;		
		}
		
		// Gets the header and mock headers with empty implementation bodies (e.g., ' {  } ')
		// for the function with the specified id
		function getMockEmptyBodiesFor(id)
		{
			var mockCode = '';		
			var functionObj = get(id);
			if (functionObj == null)
				return '';
			
			return functionObj.header + '\n { } \n' + getMockHeader(id) + '\n { } \n';
		}	
		
		// For the function with the specified function id, 
		// gets the special header used for the actual implementation when running with mocks
		// Returns an empty string if the specified function cannot be found.
		function getMockHeader(id)
		{
			var functionObj = get(id);
			if (functionObj == null)
				return '';

			// Generate the mock header.
			// Get the params string out of the header by looking for the first instance of a paren (which
			// must be the start of the functions params)		
			var mockHeader = ' function ' + functionObj.name + 'aaaActualIMP'
				+ functionObj.header.substring(functionObj.header.indexOf('('));
			return mockHeader;
		}	
		

		
		
		
		function renderDescription(functionCalled)
		{
				var numParams = 0;
				var fullDescription = '/**\n' + functionCalled.description + '\n'; 
							
		    	// Format description into 66 column max lines, with two spaces as starting character
				fullDescription = wordwrap(fullDescription, 66, '\n  ') + '\n'; 
				
				if(functionCalled.paramNames!=undefined && functionCalled.paramNames.length>0)
				{	
		    	for(var i=0; i<functionCalled.paramNames.length; i++)
					{
					if(functionCalled.paramDescriptions!=undefined && functionCalled.paramDescriptions.length>i)
						fullDescription += '  @param ' + functionCalled.paramTypes[i] + ' ' + functionCalled.paramNames[i] + ' - ' + functionCalled.paramDescriptions[i] + '\n'; 
					
					}
				}
				
				fullDescription += '\n  @return ' + functionCalled.returnType + ' \n' + '**/\n\n';
				
				return fullDescription;
				
			
		}
		
		
		function renderHeader(functionName, paramNames)
		{
			var header = 'function ' + functionName + '(';
			var numParams = 0;
			
			for(var i=0; i<paramNames.lenght; i++)
			{
			  	if (numParams > 0)
	    			header += ', ';
	     
		  		header += paramNames[i];	
			}
		    header += ')';
			
			return header;
		}
		
		//Checks that exists a description of the parameter 
		function isValidParamDescription(line)
		{
			var beginDescription = line.indexOf(' - ');
			if(beginDescription==-1||line.substring(beginDescription).lenght<5)
				return false;
			else
				return true;
		}
		
		

		// checks that the name is vith alphanumerical characters or underscore
		function isValidName(name)
		{
			var regexp = /^[a-zA-Z0-9_]+$/;
			
			if (name.search(regexp)==-1)
			 	return false;
			else
				return true;
			
		}
		
		

		
		// Starting at index start, finds the next contiguous set of nonspace characters that end in a space or the end of a line
		// (not returning the space). If no such set of characters exists, returns -1
		// Must be called where start is a nonspace character, but may be past the end of text.
		function findNextWord(text, start)
		{
			if (start >= text.length)
				return -1;
					
			var nextSpace = text.indexOf(' ', start);
			
			// If there is no next space, return the whole string. Otherwise, return everything from start up to 
			// (but not incluing) nextSpace.
			if (nextSpace == -1)
				return text.substring(start);
			else
				return text.substring(start, nextSpace);
		}
		
		

		function parseDescription(lineDescription,functionName)
		{
			var functionData={};
			functionData.paramTypes=[];
			functionData.paramNames=[];
			functionData.paramDescriptions=[];
			functionData.description="";
			functionData.header = 'function ' + functionName + '(';
			var numParams = 0;
			
			for(var i=0; i<lineDescription.length;i++){
				
				lineDescription[i] = lineDescription[i].replace(/\s{2,}/g,' ');
				var paramLine = lineDescription[i].search('@param ');
				var returnLine = lineDescription[i].search('@return ');
				
				if(paramLine!=-1)
					{		
						var paramType = findNextWord(lineDescription[i], paramLine + 7);
						var paramName = findNextWord(lineDescription[i], paramLine + paramType.length+ 8);
						var paramDescriptions = lineDescription[i].substring( paramLine + paramType.length+ paramName.length +11);
						
						
						functionData.paramTypes.push(paramType);
						functionData.paramNames.push(paramName);
						functionData.paramDescriptions.push(paramDescriptions.trim());		
						
						if (numParams > 0)
							functionData.header += ', ';
			     
						functionData.header += paramName;	
						numParams++;
					}
				
				else if(returnLine!=-1)
					{
					var type = findNextWord(lineDescription[i], returnLine + 9);
					
					functionData.returnType=type
							
					}
				else if(lineDescription[i].length>4)
					
					functionData.description+=lineDescription[i];
				}
			functionData.header += ')';
				
				return functionData;
			}
		
	}
	
	return service;
}]); 