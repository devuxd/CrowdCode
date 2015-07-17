angular
    .module('crowdCode')
    .directive('achievements', ['$firebase','iconFactory','firebaseUrl','workerId', achievements]);

function achievements($firebase, iconFactory, firebaseUrl, workerId) {
    return {
        restrict: 'E',
        templateUrl: '/client/achievements/achievements_panel.html',
        controller: function($scope, $element) {
            var lbSync = $firebase(new Firebase(firebaseUrl + '/workers/'+workerId+'/listOfAchievements'));
            $scope.listOfachievements = lbSync.$asArray();
            $scope.icon = iconFactory.get;
            $scope.listOfachievements.$loaded().then(function() {});
        }
    };
}


angular.module('crowdCode').filter('byCurrent', function () {
    return function (listOfachievements) {
        var items = {
            out: []
        };
        angular.forEach(listOfachievements, function (value, key) {
            if (value.current > 0 && !value.isUnlocked  && this.out.length < 3) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});



