

angular
    .module('crowdCode')
    .factory("iconFactory",[ '$firebase','firebaseUrl', function( $firebase , firebaseUrl ){

	var loaded = {};

	var factory = {};
	factory.get = function(condition){
			return {
				$value: '/img/achievements/'+condition+'.png'
			};
	};

	return factory;
}]);