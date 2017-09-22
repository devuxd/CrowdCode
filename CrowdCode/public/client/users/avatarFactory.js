

angular
    .module('crowdCode')
    .factory("avatarFactory",[ 'firebaseUrl','$firebaseObject', function( firebaseUrl, $firebaseObject ){

	var loaded = {};

	var factory = {};
	factory.get = function(workerId){
		if( workerId === undefined ){
			console.warn('worker id not defined');
			return -1;
		}
		if( workerId == 'admin' ){
			return {
				$value: '/img/avatar_gallery/admin.png'
			};
		}

		if(loaded.hasOwnProperty(workerId)){
			return loaded[workerId];
		} else {

			loaded[workerId] = $firebaseObject(firebase.database().ref().child('Projects').child(projectId).child('workers').child(workerId).child('avatarUrl'));
			loaded[workerId].$loaded().then(function(){
				return loaded[workerId];
			});
		}
	};

	return factory;
}]);
