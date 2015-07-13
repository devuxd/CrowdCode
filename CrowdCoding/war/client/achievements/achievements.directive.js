angular
    .module('crowdCode')
    .directive('achievements', ['$firebase','iconFactory','firebaseUrl','workerId', achievements]);

function achievements($firebase, iconFactory, firebaseUrl, workerId) {
    return {
        restrict: 'E',
        templateUrl: '/client/achievements/achievements_panel.html',
        controller: function($scope, $element) {
            var lbSync = $firebase(new Firebase(firebaseUrl + '/workers/'+workerId+'/awardedAchievements'));
            $scope.listOfachievements = lbSync.$asArray();
            $scope.icon = iconFactory.get;
            $scope.listOfachievements.$loaded().then(function() {});
        }
    };
}

