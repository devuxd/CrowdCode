

////////////////////////
//FUNCTIONS SERVICE   //
////////////////////////
var fList = null;
angular
    .module('crowdCode')
    .factory('functionsService', ['$rootScope', '$filter', '$firebaseObject', 'firebaseUrl', 'FunctionArray', function($rootScope, $filter, $firebaseObject, firebaseUrl, FunctionArray) {

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
		this.getAll 				   = getAll;
		this.buildDtoFromAce = buildDtoFromAce;

		// Function bodies
		function init(){
		    // hook from firebase all the functions declarations of the project
		    functions = new FunctionArray(new Firebase(firebaseUrl+'/artifacts/functions'));
			functions.$loaded().then(function(){
				fList = functions;
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','functions');
			});
		}

		function allFunctionNames(){
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
		function getDescribedFunctionsName(excludedFunctionId){
			var describedNames = [];
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedNames.push(value.name);
				}
			});
			return describedNames;
		}

		// Returns all the described function signature except the one with the passed ID
		function getDescribedFunctionsCode(excludedFunctionId){
			var describedCode = '';
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedCode += value.header+'{ }';
				}
			});
			return describedCode;
		}


		// Get the function object, in FunctionInFirebase format, for the specified function id
		function get(id){
			return functions.$getRecord(id);
		}

		function getAll(){
			return functions;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function id
		function getVersion(id, version){
			var ref = new Firebase(firebaseUrl+ '/history/artifacts/functions/' + id+ '/' + version);
			return $firebaseObject( ref );
		}

		// Get the function object, in FunctionInFirebase format, for the specified function name
		function getByName(name){
			var funct = null;
			angular.forEach(functions, function(value) {
				if( funct === null && value.name === name && value.described) {
			  		funct = value;
			  	}
			});
			return funct;
		}

		function getNameById(id){
			var funct = get(id);
			if( funct !== null){
				return funct.name;
			}
			return '';
		}

		function getIdByName(name){
			// console.log(name);
			var functionId = -1;
			angular.forEach(functions, function(value) {
				if( functionId === -1 && value.name === name ) {
			  		functionId = value.id;
			  	}
			});
			return functionId;
		}

		function buildDtoFromAce( editor ){
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

