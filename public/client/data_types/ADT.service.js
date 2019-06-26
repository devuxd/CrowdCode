////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('AdtService', ['$rootScope', '$firebaseArray', 'firebaseUrl', function($rootScope, $firebaseArray,firebaseUrl) {

	var service = new  function(){

		var adts = [];

		this.init         = init;
		this.getAll       = getAll;
		this.getAllNames  = getAllNames;
		this.getByName	  = getByName;
		this.getNameToAdt = getNameToAdt;

		function init(){
      adtRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('ADTs');
			adts = $firebaseArray(adtRef);
			adts.$loaded().then(function(){
				// tell the others that the adts services is loaded
				$rootScope.$broadcast('serviceLoaded','adts');

			});
		}

		function getByName(name){
			for( var i = 0; i < adts.length; i++ ){
				if( adts[i].name === name )
					return adts[i];
			}
    		return null;
		}

		function getAll(){
			return adts;
		}

		function getAllNames(){
			return adts.map(function(adt){
				return adt.name;
			});
		}

		function getNameToAdt(){
			var nameToAdt = {};
			adts.map(function(adt){
				nameToAdt[ adt.name ] = adt;
			});
			return nameToAdt;
		}



	}

	return service;
}]);
