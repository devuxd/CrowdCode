///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('NoMicrotaskController', ['$scope', '$rootScope',  'firebaseUrl', '$firebaseArray', 'avatarFactory','workerId', function($scope, $rootScope,  firebaseUrl,$firebaseArray, avatarFactory, workerId) {
    

	$scope.avatar = avatarFactory.get;
	// create the reference and the sync
	$scope.leaders = $firebaseArray(new Firebase(firebaseUrl + '/leaderboard/leaders'));
	$scope.leaders.$loaded().then(function() {});


}]);
