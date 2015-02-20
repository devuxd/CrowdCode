angular
    .module('crowdCode')
    .directive('leaderboard', leaderboard);

function leaderboard($firebase, avatarFactory, firebaseUrl, workerId) {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/panels/leaderboard_panel.html',
        controller: function($scope, $element) {
            var lbSync = $firebase(new Firebase(firebaseUrl + '/leaderboard/leaders'));
            $scope.avatar  = avatarFactory.get;
            $scope.leaders = lbSync.$asArray();
            $scope.leaders.$loaded().then(function() {});
        }
    };
}

