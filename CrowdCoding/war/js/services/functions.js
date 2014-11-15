

////////////////////
//FUNCTIONS SERVICE   //
////////////////////
myApp.factory('functionsService', ['$window','$rootScope','$firebase','mocksService', function($window,$rootScope,$firebase,mocks) {

	var service = new function(){
		// Private variables
		var functions;
		var functionsHistory;
		var loaded = false;

		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); };
		this.functionAdded = function(addedFunction) { return functionAdded(addedFunction); };
		this.functionChanged = function(changedFunction) { return functionChanged(changedFunction); };
		this.allFunctionIDs = function() { return allFunctionIDs(); };
		this.allFunctionNames = function() { return allFunctionNames(); };
		this.get = function(id) { return get(id); };
		this.getNameById  = function(id) { return getNameById(id); };
		this.getMockCodeFor = function(id,logEnabled) { return getMockCodeFor(id,logEnabled); };
		this.getMockEmptyBodiesFor = function(id) { return getMockEmptyBodiesFor(id); };
		this.getMockHeader = function(id) { return getMockHeader(id); };
		this.renderDescription= function(functionCalled) { return renderDescription(functionCalled); };
		this.getAllDescribedFunctionCode = function(idFunction) { return getAllDescribedFunctionCode(idFunction); };
		this.getAllDescribedFunctionNames = function(idFunction) { return getAllDescribedFunctionNames(idFunction); };
		this.findMatches = function(searchText, functionSourceName) { return findMatches(searchText, functionSourceName); };
		this.makeHeaderAndParameterReadOnly = function(codemirror){return makeHeaderAndParameterReadOnly(codemirror);};
		this.highlightPseudoSegments =function(codemirror,marks,highlightPseudoCall){ return highlightPseudoSegments(codemirror,marks,highlightPseudoCall);};
		this.findNextWord = function (text, start){ return findNextWord(text, start);};
		this.getCalleeNames = function (ast){ return getCalleeNames(ast);};
		this.getCalleeNamesById = function (functionId){ return getCalleeNamesById(functionId);};
		this.parseDescription = function (lineDescription,functionName) { return parseDescription(lineDescription,functionName);};
		this.renderHeader = function (functionName, paramNames) { return renderHeader(functionName, paramNames);};
		this.renderHeaderById = function (functionId) { return renderHeaderById(functionId);};
		this.getParamNamesById = function (functionId) { return getParamNamesById(functionId);};
	 	
	 	this.isLoaded = function() { return loaded; };
		this.getAll = function(){ return functions;	};
		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
			var functionsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functions = functionsSync.$asArray();
			functions.$loaded().then(function(){
				$rootScope.loaded.functions=true;  
				console.log("FUNCTION INITIALIZED");
			});

			/*var functionsArraySync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functionsHistory = functionsSync.$asArray();
			functionsHistory.$loaded().then(function(){ $rootScope.loaded.functions=true; });*/
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

		function allFunctionNames()
		{
			var functionsNames = [];
			$.each(functions, function(i, value)
			{
				functionName.push(value.nameget);
			});

			return functionNames;
		}

		// Returns all the described function Names except the one with the passed ID
		function getAllDescribedFunctionNames(idFunction)
		{
			var functionNames = [];
			$.each(functions, function(i, value)
			{
				if(value.described && value.id!=idFunction)
					{
					functionNames.push(value.name);
					}

			});

			return functionNames;
		}

		// Returns all the described function signature except the one with the passed ID
		function getAllDescribedFunctionCode(idFunction)
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
			var funct = null;
			angular.forEach(functions, function(value, key) {
				if( funct==null && value.id == id ) {
			  		funct = value;
			  	}
			});
			return funct;
		}

		function getNameById(id)
		{
			var funct = get(id);
			if( funct != null) return funct.name;
			return "";
		}

		// Get the function declaration and mock implementation for the function with the specified id.
		// Rather than the actual implementation, the implementation is replace with an implementation
		// that checks for a corresponding mock and only calls the corresponding actual implementation
		// if the mock is not present.
		// Returns an empty string if the specified function cannot be found.
		function getMockCodeFor(id,logEnabled){
			var mockCode = '';
			var functionObj = get(id);
			if (functionObj == null)
				return '';

			// First, add the normal header for the function
			mockCode += functionObj.header + '\n';

			// Next, add the mock implementation body
			mockCode += '{\n';
			mockCode += '  var returnValue;\n';
			mockCode += '  var stubFor = hasStubFor(\'' + functionObj.name + '\', arguments, workingStubs); \n';
			mockCode += '  if (stubFor.hasStub) \n';
			mockCode += '    returnValue = stubFor.stubOutput; \n';
			mockCode += '  else \n';
			mockCode += '    returnValue = ' + functionObj.name + 'ActualIMP.apply(null, arguments); \n';

			// TODO: WRITE A BETTER LOG CALL, now can call two times the actual implementation
			if( logEnabled != undefined && logEnabled ){
				mockCode += '  logCall(\'' + functionObj.name + '\',arguments,stubFor.stubOutput,' + functionObj.name + 'ActualIMP.apply(null, arguments) ); \n ';
			} 

			mockCode += '  return returnValue;';
			mockCode += '\n}\n\n';

			// Third, add the special header for the actual implementation
			mockCode += getMockHeader(id);

			// Fourth, add the actual code body of the function
			mockCode += '\n' + functionObj.code + '\n';

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

			return functionObj.header + '{}\n'+ getMockHeader(id) + '{}\n';
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
			var mockHeader = 'function ' + functionObj.name + 'ActualIMP'
				+ functionObj.header.substring(functionObj.header.indexOf('('));
			return mockHeader;
		}





		function getDescriptionFor(id)
		{
			var functionObj = get(id);
			var numParams = 0;
			var fullDescription = '/**\n' + functionObj.description + '\n';

	    	// Format description into 66 column max lines, with two spaces as starting character
			fullDescription = wordwrap(fullDescription, 66, '\n  ') + '\n';

			if(functionObj.paramNames!=undefined && functionObj.paramNames.length>0)
			{
	    	for(var i=0; i<functionObj.paramNames.length; i++)
				{
				if(functionObj.paramDescriptions!=undefined && functionObj.paramDescriptions.length>i)
					fullDescription += '  @param ' + functionObj.paramTypes[i] + ' ' + functionObj.paramNames[i] + ' , ' + functionCalled.paramDescriptions[i] + '\n';

				}
			}

			fullDescription += '\n  @return ' + functionObj.returnType + ' \n' + '**/\n\n';

			return fullDescription;
		}


		function getHeaderFor(id)
		{
			var functionObj = get(id);
			return functionObj.header;
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





	// Given a String return all the functions that have either or in the description or in the header that String
	function findMatches(searchText, functionSourceName)
	{
		var re = new RegExp(searchText);
		var results = [];

		$.each(functions, function(index, value)
		{
			if(value.name!=functionSourceName){
			var score = computeMatchScore(value, re);
			if (score > 0)
				results.push({ 'score': score, 'value': value});
			}
		});

		return results;
	}

	function computeMatchScore (functionDescription, re)
	{
		// Loop over each piece of the function description. For each piece that matches regex,
		// add one to score. For matches to function name, add 5.
		var score = 0;

		if (re.test(functionDescription.name))
			score += 5;
		if (re.test(functionDescription.description))
			score += 1;
		if (re.test(functionDescription.header))
			score += 1;

	    return score;
	}


	/**
	lineDescription is the description lines array (split on \n)
	functionName is the name of the function
	 */
	function parseDescription(lineDescription,functionName)
	{
		// initialize vars
		var paramTypes = [];
		var paramNames = [];
		var paramDescriptions = [];
		var description = "";
		var header      = "";
		var returnType  = ""

		var numParams = 0;

		console.log("parse description after regex");

		for(var i=0; i<lineDescription.length;i++){

			lineDescription[i] = lineDescription[i].replace(/\s{2,}/g,' ');

			console.log(lineDescription[i]);

			// check if the current line is a parameter or return line
			var paramLine  = lineDescription[i].search('@param ');
			var returnLine = lineDescription[i].search('@return ');

			if(paramLine!=-1){	// if a param has been found in the current line
				// find the parameter type, name and description
				var paramType = findNextWord(lineDescription[i], paramLine + 7);
				var paramName = findNextWord(lineDescription[i], paramLine + paramType.length+ 8);
				var paramDescription = lineDescription[i].substring( paramLine + paramType.length+ paramName.length +11);

				// push them into the relative arrays
				paramTypes.push(paramType);
				paramNames.push(paramName);
				paramDescriptions.push(paramDescription.trim());

				// increment the number of parameterss
				numParams++;
			}
			else if(returnLine!=-1) { // if is a return line
				var type = findNextWord(lineDescription[i], returnLine + 8);
				returnType=type;
			}
			else if( lineDescription[i].length > 4 ) // otherwise is a description line
				description+=lineDescription[i].trim()+"\n"
		}


		// build header
		header=renderHeader(functionName,paramNames);

		// return all the infos
		return { 'header'           : header,
				 'description'      : description,
				 'paramTypes'       : paramTypes,
				 'paramNames'       : paramNames,
				 'paramDescriptions': paramDescriptions,
				 'returnType'       : returnType
				};
	}


	function renderDescription(functionCalled)
	{
			var numParams = 0;
			var fullDescription = '/**\n' + functionCalled.description + '\n';

	    	// Format description into 66 column max lines, with two spaces as starting character
			fullDescription = wordwrap(fullDescription, 66, '  ')+'\n';

			if(functionCalled.paramNames!=undefined && functionCalled.paramNames.length>0)
			{
	    		for(var i=0; i<functionCalled.paramNames.length; i++)
				{
					if(functionCalled.paramDescriptions!=undefined && functionCalled.paramDescriptions.length>i)
						fullDescription += '  @param ' + functionCalled.paramTypes[i] + ' ' + functionCalled.paramNames[i] + ' , ' + functionCalled.paramDescriptions[i] + '\n';

				}
			}

			if(functionCalled.returnType!='')
				fullDescription += '\n  @return ' + functionCalled.returnType + ' \n';

			fullDescription+='**/\n';
			return fullDescription;

	}


	function renderHeader(functionName, paramNames)
	{
		var header = 'function ' + functionName + '(';
		var numParams = 0;

		for(var i=0; i<paramNames.length; i++)
		{
		  	if (numParams > 0)
				header += ', ';

	  		header += paramNames[i];
	  		numParams++;
		}
	    header += ')';

		return header;
	}


	function renderHeaderById(functionId)
	{
		var funct = get(functionId);
		return renderHeader(funct.name,funct.paramNames);
	}

	function getParamNamesById(functionId){
		return get(functionId).paramNames;
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





		// Highlight regions of code that  pseudocalls or pseudocode
	function highlightPseudoSegments(codemirror,marks,highlightPseudoCall){

		var text = codemirror.getValue();

		// Clear the old marks (if any)
		$.each(marks, function(index, mark)
		{
			mark.clear();
		});


		// Depending on the state of CodeMirror, we might not get code back.
		// In this case, do nothing
		if(typeof text === 'undefined')
		{
			return;
		};

			var lines = text.split('\n');
		$.each(lines, function(i, line)
		{
			var pseudoCallCol = line.indexOf('//!');
			if (pseudoCallCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'pseudoCall', inclusiveRight: true }));

			var pseudoCodeCol = line.indexOf('//#');
			if (pseudoCodeCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCodeCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'pseudoCode', inclusiveRight: true }));

			// If there is currently a pseudocall that is being replaced, highlight that in a special
			// color
			if (highlightPseudoCall != false)
			{
				var pseudoCallCol = line.indexOf(highlightPseudoCall);
				if (pseudoCallCol != -1)
				 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
				 			     {line: i, ch: line.length},
				 			     {className: 'highlightPseudoCall', inclusiveRight: true }));
			}
		});
	}



	// Makes the header of the function readonly (not editable in CodeMirror).
	// The header is the line that starts with 'function'
	// Note: the code must be loaded into CodeMirror before this function is called.
	function makeHeaderAndParameterReadOnly(codemirror)
	{
		var text = codemirror.getValue();

		// Take the range beginning at the start of the code and ending with the first character of the body
		// (the opening {})
		console.log("text "+text);
		//console.log(codemirror);
		var readOnlyLines = indexesOfTheReadOnlyLines(text);
		console.log(readOnlyLines);
		for(var i=0; i<readOnlyLines.length; i++)
		{
			codemirror.getDoc().markText({line: readOnlyLines[i], ch: 0},
				{ line: readOnlyLines[i] + 1, ch: 1},
				{ readOnly: true });
		}

	}

	function getCalleeNames(ast)
	{
		var calleeNames = [];
		traverse(ast, function (node)
		{
			if((node!=null) && (node.type === 'CallExpression'))
			{
				// Add it to the list of callee names if we have not seen it before
				if (calleeNames.indexOf(node.callee.name) == -1)
					calleeNames.push(node.callee.name);
			}
		});
		return calleeNames;
	}

	function getCalleeNamesById(functionId)
	{

		var ast = esprima.parse(renderHeaderById(functionId)+get(functionId).code, {loc: true})
		return getCalleeNames(ast);
	}

	// Based on esprima example at http://sevinf.github.io/blog/2012/09/29/esprima-tutorial/
	function traverse(node, func)
	{
	    func(node);
		for (var key in node) {
	    	if (node.hasOwnProperty(key)) {
	        	var child = node[key];
	        	if (typeof child === 'object' && child !== null) {
	            	if (Array.isArray(child)) {
	               	 child.forEach(function(node) {
	               	     traverse(node, func);
	               	 });
	            	} else {
	                	traverse(child, func);
	           	 	}
	        	}
	    	}
		}
	}

	//Finds and returns the index of the first line (0 indexed) starting with the string function, or -1 if no such
	// line exists
	function indexesOfTheReadOnlyLines(text)
	{
		// Look for a line of text that starts with 'function', '@param' or '@return'.
		var indexesLines=[];
		var lines = text.split('\n');

	    for (var i = 0; i < lines.length; i++)
	    {
			if (lines[i].startsWith('function')||lines[i].search('@param')!=-1||lines[i].search('@return')!=-1)
				{
					indexesLines.push(i);
				}
	    }

	    return indexesLines;
	}


	}
	return service;
}]);