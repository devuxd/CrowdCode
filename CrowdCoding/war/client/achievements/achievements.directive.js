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
       	var types = [];
        var items = {
            out: []
        };
        angular.forEach(listOfachievements, function (value, key) {
            if (!value.isUnlocked  && this.out.length < 3 && types.indexOf(value.condition) == -1) {
                this.out.push(value);
                types.push(value.condition);
            }
        }, items);
        types = [];
        return items.out;
    };
});



