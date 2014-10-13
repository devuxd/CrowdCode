////////////////////
//ADT SERVICE   //
////////////////////
myApp.factory('ADTService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {
	
	var service = new function(){
		
		var typeNames=[];
		var nameToADT=[];
		var ADTs=[];
		// Public functions
		this.init                   = function() { return init(); };
		this.isValidTypeName        = function(name) { return isValidTypeName(name); };
		this.validateFunctionName   = function(inputText, ignoreEmpty) { return validateFunctionName(inputText, ignoreEmpty); };
		this.validateParamName      = function(inputText, ignoreEmpty) { return validateParamName(inputText, ignoreEmpty); };
		this.validateParamTypeName  = function(inputText, paramName, ignoreEmpty) { return validateParamTypeName(inputText, paramName, ignoreEmpty); };
		this.validateReturnTypeName = function(inputText, ignoreEmpty) { return validateReturnTypeName(inputText, ignoreEmpty); };
		this.getAllADTs = function() { return getAllADTs(); };
		
		
		function init()
		{
			
			addDefaultADT();
			

			// hook from firebase all the functions declarations of the project
			var ADTSync = $firebase(new Firebase($rootScope.firebaseURL+'/ADTs/ADTs'));

			ADTs = ADTSync.$asArray();
			ADTs.$loaded().then(function(){ 
				if(ADTs.length>0){
					for(var i; i<ADTs.length;i++ ){
						typeNames.push(ADTs[i].name);
						nameToADT[ADTs[i].name] = ADTs[i];		
					}
				}
			
			});
			
	
		}

		// Adds type names for primitives
		function addDefaultADT()
		{
			typeNames.push('String');
			typeNames.push('Number');
			typeNames.push('Boolean');	
		}
		
		function getAllADTs()
		{
			return ADTs;
		}
	
		// Returns true if name is a valid type name and false otherwise.
		function isValidTypeName(name)
		{
			var simpleName;	
			// Check if there is any array characters at the end. If so, split off that portion of the string. 
			var arrayIndex = name.indexOf('[]');
			if (arrayIndex != -1)
				simpleName = name.substring(0, arrayIndex);
			else
				simpleName = name;
			
			if (typeNames.indexOf(simpleName) == -1)
				return false;
			else if (arrayIndex != -1)
			{
				// Check that the array suffix contains only matched brackets..
				var suffix = name.substring(arrayIndex);
				if (suffix != '[]' && suffix != '[][]' && suffix != '[][][]' && suffix != '[][][][]')
					return false;			
			}
				
			return true;		
		}
		
		
		/*
		 *  ADTandDataCheck check the integrity and validity of the data.
		 */



			
		function validateFunctionName(inputText, ignoreEmpty)
		{
			var value = inputText.val().trim();
			inputText.val(value);
			
			var nameList=[];
				
			$("input[id=FunctionName").each(function(){
			
				var value=($(this).val()).trim();
				nameList.push(value);
			
			});
			
			
			if (ignoreEmpty && value == '')
				return '';
			
			// Check that the function name is syntactically valid by building an 
			// empty function and running JSHint against it. If there's an error, it's not valid.
			// Also check that the function does not match a current function name.
			
			var codeToTest = 'function ' + value + '() {}';

			
			if (value == '')
				return 'Missing a function name.<BR>';
			else if (nameList.indexOf(value,nameList.indexOf(value) +1)!=-1)
				return "The function name '" + value + "' is already taken. Please use another.<BR>";		
			else if(!JSHINT(codeToTest,getJSHintGlobals()))
				return value + ' is not a valid function name.<BR>';
			else
				return '';
		}

			
		function hasDuplicates(nameList, value) {
		    var valuesSoFar = {};
		    for (var i = 0; i < array.length; ++i) {
		        var value = array[i];
		        if (Object.prototype.hasOwnProperty.call(valuesSoFar, value)) {
		            return true;
		        }
		        valuesSoFar[value] = true;
		    }
		    return false;
		}
			
		function validateParamName(inputText, ignoreEmpty)
		{
			var value = inputText.val().trim();
			inputText.val(value);
			
			if (ignoreEmpty && value == '')
				return '';
			
			// Check that the function name is syntactically valid by building an 
			// empty function and running JSHint against it. If there's an error, it's not valid.
			// Also check that the function does not match a current function name.
			
			var codeToTest = 'function funcABC( ' + value + ') {}';	
			if (value == '')
				return 'Missing a paramater name.<BR>';
			else if(!JSHINT(codeToTest,getJSHintGlobals()))
				return value + ' is not a valid paramater name.<BR>';
			else
				return '';
		}
			
		function validateParamTypeName(inputText, paramName, ignoreEmpty)
		{
			
			var value = inputText.val().trim();
			inputText.val(value);
			
			if (ignoreEmpty && value == '')
				return '';
			
			if (value == '')
				return 'Missing a type name for ' + paramName + '.<BR>';
			else if(!isValidTypeName(value))
				return 'The type for ' + paramName + ' - ' + value + ' is not a valid type name. Valid type names are '
				  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]). <BR>';
			else
				return '';
		}
			
		function validateReturnTypeName(inputText, ignoreEmpty)
		{
			var value = inputText.val().trim();
			inputText.val(value);
			
			if (ignoreEmpty && value == '')
				return '';
			
			if (value == '')
				return 'Missing a return type.<BR>';
			else if(!isValidTypeName(value))
				return 'The return type ' + value + ' is not a valid type name. Valid type names are '
				  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]). <BR>';
			else
				return '';
		}	

	}
	
	return service;
}]); 
	