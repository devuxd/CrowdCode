///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('NoMicrotaskController', ['$scope', '$rootScope',  'firebaseUrl', '$firebaseArray', 'avatarFactory','workerId', function($scope, $rootScope,  firebaseUrl,$firebaseArray, avatarFactory, workerId) {


	$scope.avatar = avatarFactory.get;
	// create the reference and the sync
  var leadersRef = firebase.database().ref().child('Projects').child(projectId).child('leaderboard').child('leaders');
	$scope.leaders = $firebaseArray(leadersRef);
	$scope.leaders.$loaded().then(function() {});


}]);
