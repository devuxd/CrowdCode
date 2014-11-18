////////////////////
//ADT SERVICE   //
////////////////////
myApp.factory('ADTService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {

	var service = new  function(){

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
		this.getAllADTs				= function() { return getAllADTs(); };
		this.getByName				= function(name){return getByName(name);};
		this.getNameToADT			= function() { return nameToADT; };

		function init()
		{
			typeNames=[];
			nameToADT=[];
			ADTs=[];
			addDefaultADT();


			// hook from firebase all the functions declarations of the project
			var ADTSync = $firebase(new Firebase($rootScope.firebaseURL+'/ADTs/ADTs'));
			var firebaseADTs=[];
			firebaseADTs = ADTSync.$asArray();
			firebaseADTs.$loaded().then(function(){
				if(firebaseADTs.length>0){
					for(var i=0; i<firebaseADTs.length;i++ ){
						typeNames.push(firebaseADTs[i].name);
						nameToADT[firebaseADTs[i].name] = firebaseADTs[i];
						ADTs.push(firebaseADTs[i]);
					}
				}

				console.log("ADT INITIALIZED");
				
				$rootScope.loaded.ADTs=true;

			});


		}

		function getByName(name)
		{

			var adt=[];

			for(var i=0; i<ADTs.length; i++)
				{
				if(ADTs[i].name===name)
					{

					return ADTs[i];
					}
				}

			return [];
		}

		// Adds type names for primitives
		function addDefaultADT()
		{
			typeNames.push('String');
			ADTs.push( { name:'String',
									description:'A String simply stores a series of characters like \"John Doe\".'+
												'A string can be any text inside double quotes',
									example:'\"John Doe\"',
									fullExample:'var x = \"John Doe\";',
									structure:[]
									});

			typeNames.push('Number');
			ADTs.push( { name:'Number',
									description:'Number is the only type of number.'+
												'Numbers can be written with, or without, decimals.',

									example:'14.00',
									fullExample:'var x = 14.00;',
									structure:[]
									});

			typeNames.push('Boolean');
			ADTs.push({ name:'Boolean',
									description:'A Boolean represents one of two values: true or false.',
									example:'true',
									fullExample:'var x = true;',
									structure:[]
									});

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
