

////////////////////////////
// LEADERBOARD CONTROLLER //
////////////////////////////
angular
    .module('crowdCode')
    .controller('LeaderboardController', ['$scope', '$rootScope', '$firebase', 'firebaseUrl', 'avatarFactory','workerId', function($scope, $rootScope, $firebase, firebaseUrl, avatarFactory, workerId) {
	// create the reference and the sync

	var lbSync = $firebase(new Firebase(firebaseUrl + '/leaderboard/leaders'));

	$scope.avatar = avatarFactory.get;
	$scope.leaders       = lbSync.$asArray();
	$scope.leaders.$loaded().then(function() {});
}]);

