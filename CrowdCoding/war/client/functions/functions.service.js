

////////////////////////
//FUNCTIONS SERVICE   //
////////////////////////
var fList = null;
angular
    .module('crowdCode')
    .factory('functionsService', ['$rootScope', '$q', '$filter', '$firebaseObject', 'firebaseUrl', 'FunctionArray', 'Function', function($rootScope, $q, $filter, $firebaseObject, firebaseUrl, FunctionArray, Function) {

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
		this.getIdByName  			   = getIdByName;
		this.getDescribedFunctionsCode = getDescribedFunctionsCode;
		this.getDescribedFunctionsName = getDescribedFunctionsName;
		this.getDescribedFunctionsId   = getDescribedFunctionsId;
		this.getDescribedFunctions     = getDescribedFunctions;
		this.getAll 				   = getAll;

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
			angular.forEach(functions, function(fun)
			{
				functionsNames.push(fun.name);
			});
			return functionsNames;
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
			console.log('desc',describedNames);
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
			var deferred = $q.defer();

			var ref = new Firebase(firebaseUrl+ '/history/artifacts/functions/' + id+ '/' + version);			
			var obj = $firebaseObject( ref );
			obj.$loaded().then(function(){
				deferred.resolve(new Function(obj));
			});
			return deferred.promise;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function name
		function getByName(name){
			for( var i = 0 ; i < functions.length ; i ++){
				if( functions[i].name == name ) {
			  		return functions[i];
			  	}
			}
			return null;
		}

		function getIdByName(name){
			var funct = getByName(name);
			if( funct !== null )
				return funct.id;
			return -1;
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

	};

	return service;
}]);

