

////////////////////////
//FUNCTIONS SERVICE   //
////////////////////////

angular
    .module('crowdCode')
    .factory("FunctionFactory",['$firebaseArray', '$firebaseUtils',  'FunctionObject', 'firebaseUrl', 'TestFactory', function( $firebaseArray, $firebaseUtils,  FunctionObject, firebaseUrl, TestFactory) {
    	return $firebaseArray.$extend({
    	   // change the added behavior to return Widget objects
    	   $$added: function(snap) {
    	     // instead of creating the default POJO (plain old JavaScript object)
    	     // we will return an instance of the Widget class each time a child_added
    	     // event is received from the server
    	     return new FunctionObject(snap.val());
    	   },

    	   // override the update behavior to call Widget.update()
    	   $$updated: function(snap) {
    	     // we need to return true/false here or $watch listeners will not get triggered
    	     // luckily, our FunctionObject.prototype.update() method already returns a boolean if
    	     // anything has changed
    	     return this.$getRecord(snap.key()).update(snap.val());
    	     }

    	   });

    	}]);

angular
    .module('crowdCode')
    .factory('functionsService', ['$window','$rootScope', '$filter', '$firebaseArray', '$firebaseObject', 'firebaseUrl','FunctionFactory','FunctionObject', 'TestFactory', function( $window, $rootScope,  $filter, $firebaseArray, $firebaseObject, firebaseUrl,FunctionFactory, FunctionObject, TestFactory) {


	var service = new function(){
		// Private variables
		var functions;

		// Public functions
		this.init 					   = init ;
		this.allFunctionNames 		   = allFunctionNames;
		this.get 					   = get;
		this.getVersion 			   = getVersion;
		this.getByName 			       = getByName;
		this.getNameById  			   = getNameById;
		this.getDescribedFunctionsCode = getDescribedFunctionsCode;
		this.getDescribedFunctionsName = getDescribedFunctionsName;
		this.getDescribedFunctionsId   = getDescribedFunctionsId;
		this.getDescribedFunctions     = getDescribedFunctions;
		this.findMatches 			   = findMatches;
		this.getCount 				   = getCount;
		this.getAll 				   = getAll;
		this.parseFunctionFromAce 	   = parseFunctionFromAce;




		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
		    functions = FunctionFactory (new Firebase(firebaseUrl+'/artifacts/functions'));
			functions.$loaded().then(function(){
				console.log("functions",functions);
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','functions');
			});
		}

		function allFunctionNames()
		{
			var functionsNames = [];
			angular.forEach(functions, function(i, value)
			{
				functionsNames.push(value.name);
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
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id !== excludedFunctionId ){
					describedIds.push(value.id);
				}
			});
			return describedIds;
		}

		// Returns all the described function Names except the one with the passed ID
		function getDescribedFunctionsName(excludedFunctionId)
		{
			var describedNames = [];
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedNames.push(value.name);
				}
			});
			return describedNames;
		}

		// Returns all the described function signature except the one with the passed ID
		function getDescribedFunctionsCode(excludedFunctionId)
		{
			var describedCode = '';
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedCode += value.header+'{ }';
				}
			});
			return describedCode;
		}


		// Get the function object, in FunctionInFirebase format, for the specified function id
		function get(id)
		{
			return functions.$getRecord(id);
		}

		function getAll()
		{
			return functions;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function id
		function getVersion(id, version)
		{
			return $firebaseObject( new Firebase(firebaseUrl+ '/history/artifacts/functions/' + id+ '/' + version));
		}

		// Get the function object, in FunctionInFirebase format, for the specified function name
		function getByName(name)
		{
			var funct = null;
			angular.forEach(functions, function(value) {
				if( funct === null && value.name === name && value.described) {
			  		funct = value;
			  	}
			});
			return funct;
		}

		function getNameById(id)
		{
			var funct = get(id);
			if( funct !== null){
				return funct.name;
			}
			return '';
		}

		function getIdByName(name)
		{
			// console.log(name);
			var functionId = -1;
			angular.forEach(functions, function(value) {
				if( functionId === -1 && value.name === name ) {
			  		functionId = value.id;
			  	}
			});
			return functionId;
		}

	function getCount(){
		return functions.length;
	}

	// Given a String return all the functions that have either or in the description or in the header that String
	function findMatches(searchText, functionSourceName)
	{
		var re = new RegExp(searchText);
		var results = [];

		angular.forEach(functions, function(value){
			if( value.name !== functionSourceName ){
				var score = computeMatchScore(value, re);
				if (score > 0){
					results.push({ 'score': score, 'value': new FunctionFactory( value) });
				}
			}
		});

		return results;
	}

	function computeMatchScore (functionDescription, re)
	{
		// Loop over each piece of the function description. For each piece that matches regex,
		// add one to score. For matches to function name, add 5.
		var score = 0;

		if (re.test(functionDescription.name.toLowerCase()))
			score += 5;
		if (re.test(functionDescription.description.toLowerCase()))
			score += 1;
		if (re.test(functionDescription.header.toLowerCase()))
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

};
	return service;
}]);

