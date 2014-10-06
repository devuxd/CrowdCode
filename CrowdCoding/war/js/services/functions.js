

////////////////////
//FUNCTIONS SERVICE   //
////////////////////
myApp.factory('functionsService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {
	
	var service = new function(){
		// Private variables	
		var functionCount;			// count of the number of functions
		var statsChangeCallback;	// function to call when statistics change
		var linesOfCode;		
		
		// public attributes
		this.allFunctions = [];
		
		// Constructor
		this.initialize = function() {};     
		
		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); }
		this.functionAdded = function(addedFunction) { return functionAdded(addedFunction); };
		this.functionChanged = function(changedFunction) { return functionChanged(changedFunction); };	
		this.allFunctionIDs = function() { return allFunctionIDs(); };
		this.get = function(id) { return get(id); };
		this.getMockCodeFor = function(id) { return getMockCodeFor(id); };
		this.getMockEmptyBodiesFor = function(id) { return getMockEmptyBodiesFor(id); };
		this.getMockHeader = function(id) { return getMockHeader(id); };		
		
		// Function bodies
		
		function init(newStatsChangeCallback)
		{

		    // hook from firebase all the functions declarations of the project
			var functionsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			this.allFunctions = functionsSync.$asArray();
			
			statsChangeCallback = newStatsChangeCallback;
			functions = {};
			functionCount = 0;
			linesOfCode = 0;
		}
		
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
		}	
		
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
	}
	
	return service;
}]); 