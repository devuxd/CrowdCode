

////////////////////
//FUNCTIONS SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('functionsService', ['$window','$rootScope','$firebase', '$filter','FunctionFactory', function( $window, $rootScope, $firebase, $filter, FunctionFactory) {


	var service = new  function(){
		// Private variables
		var functions;
		var functionsHistory;
		var loaded = false;

		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); };
		this.allFunctionNames = function() { return allFunctionNames(); };
		this.get = function(id) { return get(id); };
		this.getVersion = function(id,version) { return getVersion(id, version); };
		this.getByName = function(name) { return getByName(name); };
		this.getNameById  = function(id) { return getNameById(id); };
		this.getDescribedFunctionsCode = function(excludedFunctionId) { return getDescribedFunctionsCode(excludedFunctionId); };
		this.getDescribedFunctionsName = function(excludedFunctionId) { return getDescribedFunctionsName(excludedFunctionId); };
		this.getDescribedFunctionsId   = function(excludedFunctionId) { return getDescribedFunctionsId(excludedFunctionId); };
		this.getDescribedFunctions     = function() { return getDescribedFunctions(); };
		this.findMatches = function(searchText, functionSourceName) { return findMatches(searchText, functionSourceName); };
		this.getCount = function(){ return (functions === undefined)?0:functions.length; };
	 	this.isLoaded = function() { return loaded; };
		this.getAll = function(){ return functions;	};
		this.parseFunction = function (codemirror) { return parseFunction(codemirror); };
		this.parseFunctionFromAce = function (ace) { return parseFunctionFromAce(ace); };


		// Function bodies
		function init()
		{
			console.log($rootScope.firebaseURL);
		    // hook from firebase all the functions declarations of the project
		    var functionsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functions = functionsSync.$asArray();
			functions.$loaded().then(function(){
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','functions');
			});
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


		function allFunctionNames()
		{
			var functionsNames = [];
			$.each(functions, function(i, value)
			{
				functionName.push(value.nameget);
			});
			return functionNames;
		}


		// Returns an array with every current function ID
		function getDescribedFunctions(){
			return $filter('filter')(functions, { described: true });
		}

		// Returns an array with every current function ID
		function getDescribedFunctionsId(excludedFunctionId){
			var describedIds = [];
			angular.forEach( getDescribedFunctions(), function(value, index){
				if( value.id !== excludedFunctionId )
					describedIds.push(value.id);
			});
			return describedIds;
		}

		// Returns all the described function Names except the one with the passed ID
		function getDescribedFunctionsName(excludedFunctionId)
		{
			var describedNames = [];
			angular.forEach( getDescribedFunctions(), function(value, index){
				if( value.id != excludedFunctionId ){
					describedNames.push(value.name);
				}
			});
			return describedNames;
		}

		// Returns all the described function signature except the one with the passed ID
		function getDescribedFunctionsCode(excludedFunctionId)
		{
			var describedCode = "";
			angular.forEach( getDescribedFunctions(), function(value, index){
				if( value.id != excludedFunctionId )
					describedCode += value.header+"{ }";
			});
			return describedCode;
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

			if( funct === null )
				return -1;
			else 
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
				if( funct===null && value.name == name && value.described) {
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

	function parseFunction(codemirror)
	{

		var ast = esprima.parse(codemirror.getValue(), {loc: true});
		var calleeNames      = getCalleeNames(ast);
		var fullDescription  = codemirror.getRange({ line: 0, ch: 0}, { line: ast.loc.start.line - 1, ch: 0 });
		var descriptionLines = fullDescription.split('\n');
		var functionName     = ast.body[0].id.name;
		var functionParsed   = parseDescription(descriptionLines, functionName);


		functionParsed.code = codemirror.getRange( 
			{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			{ line: ast.body[0].body.loc.end.line   - 1, ch: ast.body[0].body.loc.end.column	}
		);

		functionParsed.pseudoFunctions=[];
		var pseudoFunctionsName=[];
		for( var i=1; i < ast.body.length; i++ ){
			var prevPseudoBody = ast.body[i-1];
			var currPseudoBody = ast.body[i];

			var pseudoFunction={};
			
			pseudoFunction.description = codemirror.getRange(
				{ line: prevPseudoBody.loc.end.line - 1, ch: prevPseudoBody.loc.end.column },
				{ line: currPseudoBody.loc.end.line - 1, ch: currPseudoBody.loc.end.column - 2 }
			).match(/.+/g).join("\n");


			pseudoFunction.name = currPseudoBody.id.name;
			
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

	function parseFunctionFromAce( editor )
	{
		var Range   = (window.ace || {}).require('ace/range').Range;
		var session = editor.getSession();

		var ast = esprima.parse( session.getValue(), {loc: true});
		var calleeNames      = getCalleeNames(ast);
		var fullDescription  = session.getTextRange( new Range(0, 0, ast.loc.start.line - 1, 0) );
		var descriptionLines = fullDescription.split('\n');
		var functionName     = ast.body[0].id.name;
		var functionParsed   = parseDescription(descriptionLines, functionName);

		functionParsed.code = session.getTextRange( new Range(ast.body[0].body.loc.start.line - 1,ast.body[0].body.loc.start.column,ast.body[0].body.loc.end.line- 1,ast.body[0].body.loc.end.column) );

		functionParsed.pseudoFunctions=[];
		var pseudoFunctionsName=[];
		for( var i=1; i < ast.body.length; i++ ){
			var prevPseudoBody = ast.body[i-1];
			var currPseudoBody = ast.body[i];

			var pseudoFunction={};
			
			pseudoFunction.description = session.getTextRange( new Range( prevPseudoBody.loc.end.line - 1, prevPseudoBody.loc.end.column, currPseudoBody.loc.end.line - 1, currPseudoBody.loc.end.column - 2) ).match(/.+/g).join("\n");
			pseudoFunction.name = currPseudoBody.id.name;
			
			functionParsed.pseudoFunctions.push(pseudoFunction);
			pseudoFunctionsName.push(ast.body[i].id.name);
		}
		functionParsed.calleeIds=[];

		for(i =0; i< calleeNames.length; i++){
			if(pseudoFunctionsName.indexOf(calleeNames[i])!==-1){
				calleeNames.slice(i,1);
			} else {
				var functionId=getIdByName(calleeNames[i]);
				if(functionId!=-1)
					functionParsed.calleeIds.push(functionId);
			}
		}

		return functionParsed;
	}

}
	return service;
}]);

