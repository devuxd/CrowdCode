

////////////////////
//FUNCTIONS SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('functionsService', ['$window','$rootScope','$firebase','FunctionFactory', function( $window, $rootScope, $firebase,FunctionFactory) {


	var service = new  function(){
		// Private variables
		var functions;
		var functionsHistory;
		var loaded = false;

		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); };
		this.functionAdded = function(addedFunction) { return functionAdded(addedFunction); };
		this.functionChanged = function(changedFunction) { return functionChanged(changedFunction); };
		this.allDescribedFunctionIDs = function() { return allDescribedFunctionIDs(); };
		this.allFunctionNames = function() { return allFunctionNames(); };
		this.get = function(id) { return get(id); };
		this.getVersion = function(id,version) { return getVersion(id, version); };
		this.getByName = function(name) { return getByName(name); };
		this.getNameById  = function(id) { return getNameById(id); };
		this.getMockCodeFor = function(id,logEnabled) { return getMockCodeFor(id,logEnabled); };
		this.getMockEmptyBodiesFor = function(id) { return getMockEmptyBodiesFor(id); };
		this.getMockHeader = function(id) { return getMockHeader(id); };
		this.renderDescription= function(functionCalled) { return renderDescription(functionCalled); };
		this.getAllDescribedFunctionCode = function(idFunction) { return getAllDescribedFunctionCode(idFunction); };
		this.getAllDescribedFunctionNames = function(idFunction) { return getAllDescribedFunctionNames(idFunction); };
		this.findMatches = function(searchText, functionSourceName) { return findMatches(searchText, functionSourceName); };
		this.makeHeaderAndParameterReadOnly = function(codemirror){return makeHeaderAndParameterReadOnly(codemirror);};
		this.makeHeaderAndDescriptionReadOnly = function(codemirror){return makeHeaderAndDescriptionReadOnly(codemirror);};
		this.highlightPseudoSegments =function(codemirror,marks,highlightPseudoCall){ return highlightPseudoSegments(codemirror,marks,highlightPseudoCall);};
		//this.hasPseudoSegments =function(functionCode){ return hasPseudoSegments(functionCode);};
	//	this.replaceFunctionCodeBlock = function (text) {return replaceFunctionCodeBlock(text); };
		this.findNextWord = function (text, start){ return findNextWord(text, start);};
		this.getCalleeNames = function (ast){ return getCalleeNames(ast);};
		this.getCalleeNamesById = function (functionId){ return getCalleeNamesById(functionId);};
		this.parseDescription = function (lineDescription,functionName) { return parseDescription(lineDescription,functionName);};
		this.parseFunction = function (text){ return parseFunction(text);};
		this.renderHeader = function (functionName, paramNames) { return renderHeader(functionName, paramNames);};
		this.renderHeaderById = function (functionId) { return renderHeaderById(functionId);};
		this.getParamNamesById = function (functionId) { return getParamNamesById(functionId);};
		this.getParamNamesByName = function (functionName) { return getParamNamesByName(functionName);};
		this.getCount = function(){ return (functions === undefined)?0:functions.length; };
	 	this.isLoaded = function() { return loaded; };
		this.getAll = function(){ return functions;	};
		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
			var functionsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functions = functionsSync.$asArray();
			functions.$loaded().then(function(){
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','functions');
			});

			/*var functionsArraySync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functionsHistory = functionsSync.$asArray();
			functionsHistory.$loaded().then(function(){ $rootScope.loaded.functions=true; });*/
		}

		// Replaces function code block with empty code. Function code blocks must start on the line
		// after a function statement.
		// Returns a block of text with the code block replaced or '' if no code block can be found
		function replaceFunctionCodeBlock(text) {
		    var lines = text.split('\n');
		    for (var i = 0; i < lines.length; i++) {
		        if (lines[i].startsWith('function')) {
		            // If there is not any more lines after this one, return an error
		            if (i + 1 >= lines.length - 1)
		                return '';

		            // Return a string replacing everything from the start of the next line to the end
		            // Concatenate all of the lines together
		            var newText = '';
		            for (var j = 0; j <= i; j++)
		                newText += lines[j] + '\n';

		            newText += '{}';
		            return newText;
		        }
		    }

		    return '';
		}

		// Returns an array with every current function ID
		function allDescribedFunctionIDs()
		{
			var functionIDs = [];
			$.each(functions, function(i, value)
			{
				if(value.described)
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
				if( funct===null && value.id == id ) {
			  		funct = value;
			  	}
			});
			return new FunctionFactory(funct);
		}

		// Get the function object, in FunctionInFirebase format, for the specified function id
		function getVersion(id, version)
		{
			var functionSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + id+ '/' + version));
			var funct = functionSync.$asObject();

			return funct;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function name
		function getByName(name)
		{
			var funct = null;
			angular.forEach(functions, function(value, key) {
				if( funct===null && value.name == name ) {
			  		funct = value;
			  	}
			});
			return new FunctionFactory(funct);
		}

		function getNameById(id)
		{
			var funct = get(id);
			if( funct !== null)
				return funct.name;
			return "";
		}

		function getIdByName(name)
		{
			// console.log(name);
			var functionId = -1;
			angular.forEach(functions, function(value, key) {
				if( functionId==-1 && value.name === name ) {
			  		functionId = value.id;
			  	}
			});
			return functionId;
		}

		// Get the function declaration and mock implementation for the function with the specified id.
		// Rather than the actual implementation, the implementation is replace with an implementation
		// that checks for a corresponding mock and only calls the corresponding actual implementation
		// if the mock is not present.
		// Returns an empty string if the specified function cannot be found.
		function getMockCodeFor(id,logEnabled){
			var mockCode = '';
			var functionObj = get(id);
			if (functionObj === null)
				return '';

			// First, add the normal header for the function
			mockCode += functionObj.header + '\n';

			mockCode += '{'+'\n';
			mockCode += '	// make JAVASCRIPT able to pass by value'+'\n';
			mockCode += '   var args = Array.prototype.slice.call(arguments);\n';
			mockCode += '   var argsCopy = [];' + '\n' ;
			mockCode += '	for( var a = 0 ; a < args.length ; a++ )'+'\n';
			mockCode += '		argsCopy[a] = JSON.parse(JSON.stringify(args[a]));'+'\n';
			// mockCode += '   debug.log("fromFunction' + functionObj.name + '");debug.log(JSON.stringify(args));debug.log(JSON.stringify(argsCopy));\n';
			mockCode += '	var returnValue = null;'+'\n';
			mockCode += '	var stubFor = hasStubFor( "' + functionObj.name + '", argsCopy, stubs, debug);'+'\n';
		    // mockCode += '   debug.log(JSON.stringify(stubFor));\n';
			mockCode += '   try { \n';
			mockCode += '		if ( stubFor.hasStub ) {'+'\n';
			mockCode += '			returnValue = stubFor.output;'+'\n';
			mockCode += '		} else {'+'\n';
			mockCode += '			returnValue = ' + functionObj.name + 'ActualIMP.apply( null, argsCopy );'+'\n';
			mockCode += '		}'+'\n';
			mockCode += '   } catch (e) { \n';
			mockCode += '       debug.log("There was an exception in the callee ' + functionObj.name + ': "+e.message);\n';

			// if log enabled signal that the function can be STUBBED
			if( logEnabled != undefined && logEnabled ){
				mockCode += '       debug.log("Use the CALLEE STUBS panel to stub this function.");\n';
			}

			mockCode += '   } \n';

			// if log enabled log this call
			if( logEnabled != undefined && logEnabled ){
			    // mockCode += '   debug.log("logging call. return value = ");debug.log(returnValue);\n';
				mockCode += '	logCall( "' + functionObj.name + '", args, returnValue, usedStubs, stubMap, debug) ;'+'\n';
			} 

			mockCode += '	return returnValue;'+'\n';
			mockCode += '}'+'\n';


			// Third, add the special header for the actual implementation
			mockCode += getMockHeader(id);

			// Fourth, add the actual code body of the function

			if( functionObj.written )
				mockCode += '\n' + functionObj.code + '\n';
			else
				mockCode += '\n{ return null; }\n';

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
		//	fullDescription = wordwrap(fullDescription, 50, '\n  ') + '\n';

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

		angular.forEach(functions, function(value, index){
			if( value.name != functionSourceName ){
			var score = computeMatchScore(value, re);
			if (score > 0)
				results.push({ 'score': score, 'value': new FunctionFactory( value) });
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
	descLines is the description lines array (split on \n)
	functionName is the name of the function
	 */
	function parseDescription(descLines,functionName)
	{
		// initialize vars
		var paramTypes = [];
		var paramNames = [];
		var paramDescriptions = [];
		var description = "";
		var header      = "";
		var returnType  = "";

		var numParams = 0;

		for(var i=0; i<descLines.length;i++){
			var line = descLines[i];
			// check if the current line is a parameter or return line
			var isParam  = line.search('@param ');
			var isReturn = line.search('@return ');
			if( isParam!=-1 || isReturn!=-1 ){

				var matches = line.match(/\w+(\[\])*/g);
		        if( matches == null )
		            return [];

		        //console.log('matches',matches);

		        var type = matches[1];
		        var name = matches[2];


				if(isParam!=-1){	// if a param has been found in the current line
					// find the parameter type, name and description
					var paramType = matches[1];
					var paramName = matches[2];
					var descriptionStart = line.indexOf(', ');
					var paramDescription = line.substring(descriptionStart+2);

					// push them into the relative arrays
					paramTypes.push(paramType);
					paramNames.push(paramName);
					paramDescriptions.push(paramDescription.trim());

					// increment the number of parameterss
					numParams++;
				}
				else{ // if is a return line
					var type = matches[1];
					returnType = type;
				}
			}
			else if( line.length > 4 ){ // otherwise is a description line
				if(line[i].length > 74)
				{
				    descLines[i]=line.match(/.{1,74}(\s|$)|\S+?(\s|$)/g).join('\n  ');
				}
				description+=descLines[i]+"\n";
			}
		}


		// build header
		header=renderHeader(functionName,paramNames);

		// return all the infos
		return { 'name'				: functionName,
				 'header'           : header,
				 'description'      : description,
				 'paramTypes'       : paramTypes,
				 'paramNames'       : paramNames,
				 'paramDescriptions': paramDescriptions,
				 'returnType'       : returnType
				};
	}


	function parseFunction(codemirror)
	{

		var ast = esprima.parse(codemirror.getValue(), {loc: true});
		var calleeNames = getCalleeNames(ast);
		var fullDescription = codemirror.getRange({ line: 0, ch: 0}, { line: ast.loc.start.line - 1, ch: 0 });
		var descriptionLines = fullDescription.split('\n');
		var functionName = ast.body[0].id.name;
		var functionParsed = parseDescription(descriptionLines, functionName);

		functionParsed.code = codemirror.getRange( { line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
												   { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column	});

		functionParsed.pseudoFunctions=[];
		var pseudoFunctionsName=[];
		for (var i=1; i<ast.body.length; i++ ){
			var pseudoFunction={};
			pseudoFunction.description= codemirror.getRange({
				    line: ast.body[i-1].body.loc.end.line - 1,
				    ch: ast.body[i-1].body.loc.end.column
				},{
				    line: ast.body[i].body.loc.end.line - 1,
				    ch: ast.body[i].body.loc.end.column-2
				}).match(/.+/g).join("\n");


			pseudoFunction.name=ast.body[i].id.name;
			
			functionParsed.pseudoFunctions.push(pseudoFunction);
			pseudoFunctionsName.push(ast.body[i].id.name);
		}
		functionParsed.calleeIds=[];

		for(i =0; i< calleeNames.length; i++)
		{
			if(pseudoFunctionsName.indexOf(calleeNames[i])!==-1){
				calleeNames.slice(i,1);
			}
			else{
				var functionId=getIdByName(calleeNames[i]);
				if(functionId!=-1)
					functionParsed.calleeIds.push(functionId);
			}
		}

		return functionParsed;




	}
	function parseFunctionRegex(text)
	{
		var functionParsed={};


		//retrieves the header from the code (in position  0 because mache retruns an array)
		var header = text.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g)[0];
		//retrieves the beginning position of the header
		var startHeaderPosition = text.indexOf(header);

		//retrieves the end position of the header loofing for the first occurence of "{" after the beginning
		var endHeaderPosition = text.indexOf("{", startHeaderPosition);

		// retrieves the complete description and splits it in line
		var fullSplittedDescription=text.substring(0, startHeaderPosition).split('\n');

		//retrieves the name of the function looking for the word before the "("
		var functionName = header.match(/\b\w+(?=\s*\()/g)[0];

		//retrieves the name, header, description , paramNames, paramTypes, paramDescriptions, returnType
		functionParsed=parseDescription(fullSplittedDescription, functionName);

		//retrieves the code of the function
		functionParsed.code= text.substring(endHeaderPosition, text.length);

		//creates an empty vector to put the callee
		functionParsed.calleeIds=[];
		//look for all the possible name in the function code of type name followed by a "("
		var calleeNames= functionParsed.code.match(/\b\w+(?=\s*\()/g);

		if(calleeNames!==null){
			
			//remove the duplicates
			for(var i=0; i<calleeNames.length; i++) {
			  for(var j=i+1; j<calleeNames.length; j++) {
			    // If this[i] is found later in the array
			    if (calleeNames[i] === calleeNames[j])
			      j = ++i;
			  }

			  //search if exists a function with that name and returns the id if exist
			  var functionId=getIdByName(calleeNames[i]);
			  if(functionId!=-1)
			  	functionParsed.calleeIds.push(functionId);
			}
		}

		return functionParsed;
	}


	function renderDescription(functionCalled)
	{
			var numParams = 0;

			var fullDescription = '/**\n' + functionCalled.description + '\n';

			if(functionCalled.paramNames!==undefined && functionCalled.paramNames.length>0)
			{
	    		for(var i=0; i<functionCalled.paramNames.length; i++)
				{
					if(functionCalled.paramDescriptions!==undefined && functionCalled.paramDescriptions.length>i)
						fullDescription += '  @param ' + functionCalled.paramTypes[i] + ' ' + functionCalled.paramNames[i] + ', ' + functionCalled.paramDescriptions[i] + '\n';

				}
			}

			if(functionCalled.returnType!=='')
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
	function getParamNamesByName(functionName){
		return getByName(functionName).paramNames;
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
		}

			var lines = text.split('\n');
		$.each(lines, function(i, line)
		{
			/*var pseudoCallCol = line.indexOf('//!');
			if (pseudoCallCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'pseudoCall', inclusiveRight: true }));*/

			var pseudoCodeCol = line.indexOf('//#');
			if (pseudoCodeCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCodeCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'pseudoCode', inclusiveRight: true }));

			// If there is currently a pseudocall that is being replaced, highlight that in a special
			// color
			if (highlightPseudoCall)
			{

				var pseudoCallCol =  line.indexOf(highlightPseudoCall+"(") ==-1 ? line.indexOf(highlightPseudoCall+" ") : line.indexOf(highlightPseudoCall+"(");

				if (pseudoCallCol != -1){
				 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
				 			     {line: i, ch: line.length},
				 			     {className: 'pseudoCall', inclusiveRight: true }));
				}
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
		//console.log(codemirror);
		var readOnlyLines = indexesOfTheReadOnlyLines(text);
		for(var i=0; i<readOnlyLines.length; i++)
		{
			codemirror.getDoc().markText({line: readOnlyLines[i], ch: 0},
				{ line: readOnlyLines[i]+1, ch: 0},
				{ readOnly: true });
		}

	}



	

	function makeHeaderAndDescriptionReadOnly(codemirror)
	{
		var text = codemirror.getValue();
		var ast = esprima.parse(text, {loc: true});

		codemirror.getDoc().markText({line: 0, ch: 0},
			{ line: ast.loc.start.line, ch: 0},
			{ readOnly: true });

		ast = undefined;
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
		var calleeNames = getCalleeNames(ast);
		ast = undefined
		return calleeNames;
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
			if (lines[i].search(/(@param)|(@return)/g)!=-1)
				{
					indexesLines.push(i);
				}
			if(lines[i].search(/(function\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{)/g)!=-1)
				{
					indexesLines.push(i);
					return indexesLines;
				}
	    }

	}


	}


	return service;
}]);

