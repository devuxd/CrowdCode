

angular
    .module('crowdCode')
    .factory("avatarFactory",[ '$firebase','firebaseUrl', function( $firebase , firebaseUrl ){

	var loaded = {};

	var factory = {};
	factory.get = function(workerId){
		if( workerId === undefined ){
			console.warn('worker id not defined');

			return -1;
		}

		if(loaded.hasOwnProperty(workerId)){
			return loaded[workerId];
		} else {
			pictureSync = $firebase(new Firebase(firebaseURL + '/workers/'+workerId+'/avatarUrl'));
			loaded[workerId] = pictureSync.$asObject();
			loaded[workerId].$loaded().then(function(){
				return loaded[workerId];
			});
		}
	};

	return factory;
}]);