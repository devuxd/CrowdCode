angular
    .module('crowdCode')
    .directive('leaderboard', ['$firebase','avatarFactory','firebaseUrl','workerId', leaderboard]);

function leaderboard($firebase, avatarFactory, firebaseUrl, workerId) {
    return {
        restrict: 'E',
        templateUrl: '/client/leaderboard/leaderboard.template.html',
        controller: function($scope, $element) {
            var lbSync = $firebase(new Firebase(firebaseUrl + '/leaderboard/leaders'));
            $scope.avatar  = avatarFactory.get;
            $scope.leaders = lbSync.$asArray();
            $scope.leaders.$loaded().then(function() {});
        }
    };
}

