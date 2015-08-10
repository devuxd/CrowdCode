angular
    .module('crowdCode')
    .directive('leaderboard', ['avatarFactory','$firebaseArray','firebaseUrl','workerId', leaderboard]);

function leaderboard( avatarFactory, $firebaseArray, firebaseUrl, workerId) {
    return {
        restrict: 'E',
        templateUrl: '/client/leaderboard/leaderboard.template.html',
        controller: function($scope, $element) {
            $scope.avatar  = avatarFactory.get;
            $scope.leaders = $firebaseArray(new Firebase(firebaseUrl + '/leaderboard/leaders'));
            $scope.leaders.$loaded().then(function() {});
        }
    };
}