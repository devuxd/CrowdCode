////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('ADTService', ['$window','$rootScope', '$firebaseArray', 'firebaseUrl', function($window,$rootScope, $firebaseArray,firebaseUrl) {

	var service = new  function(){

		var typeNames=[];
		var nameToADT=[];
		var adts = [];

		this.init         = init;
		this.getAll       = getAll;
		this.getByName	  = getByName;
		this.getNameToADT = function() { return nameToADT; };
		this.isValidName  = isValidName;

		function init(){
			adts = $firebaseArray(new Firebase(firebaseUrl+'/artifacts/ADTs'));
			adts.$loaded().then(function(){

				typeNames=[];
				nameToADT=[];

				if(adts.length>0){
					for(var i=0; i<adts.length;i++ ){
						typeNames.push(adts[i].name);
						nameToADT[adts[i].name] = adts[i];
					}
				}

				// tell the others that the adts services is loaded
				$rootScope.$broadcast('serviceLoaded','adts');

			});


		}

		function getByName(name){
			return adts.filter(function(adt){
				if( adt.name === name )
					return true;
				return false;
			});
		}

		function getAll(){
			return adts;
		}

		// Returns true if name is a valid type name and false otherwise.
		function isValidName(name){
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

	}

	return service;
}]);
