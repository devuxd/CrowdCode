angular
    .module('crowdCode')
    .controller('userAchievements', ['$scope','$firebase','iconFactory','firebaseUrl','workerId', function($scope,$firebase,iconFactory,firebaseUrl,workerId){
    	
    	
    $scope.userStats = [];
    $scope.listOfachievements = [];
    $scope.icon = iconFactory.get;    	 
    	 
    	var statsRef  = new Firebase(firebaseUrl + '/workers/'+workerId+'/microtaskHistory');
     	var statsSync = $firebase(statsRef);
     	$scope.userStats = statsSync.$asArray();
     	$scope.userStats.$loaded().then(function(){
     	});
     	
     	
    	var achievementsRef  = new Firebase(firebaseUrl + '/workers/'+workerId+'/listOfAchievements');
    	var achievementsSync = $firebase(achievementsRef);
    	$scope.listOfachievements = achievementsSync.$asArray();
    	$scope.listOfachievements.$loaded().then(function(){
    	});
}]);

angular.module('crowdCode').filter('byCurrent', function () {
    return function (listOfachievements) {
       	var types = [];
        var items = {
            out: []
        };
        angular.forEach(listOfachievements, function (value, key) {
            if (!value.isUnlocked && types.indexOf(value.condition) == -1  && this.out.length < 3) {
                this.out.push(value);
                types.push(value.condition);
            }
        }, items);
        types = [];
        return items.out;
    };
});

angular.module('crowdCode').filter('statsToShow', function () {
    return function (userStats) {
        var items = {
            out: []
        };
        angular.forEach(userStats, function (value, key) {
            if (value.$id != 'question_views' && value.$id != 'tutorial_completed' && value.$id != 'accepted_microtask') {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});




//angular
//.module('crowdCode')
//.directive('userAchievements', ['$firebase','iconFactory','firebaseUrl','workerId', achievements])
//	
//function achievements($firebase, iconFactory, firebaseUrl, workerId) {
//return {
//    restrict: 'E',
//    templateUrl: '/client/achievements/achievements_panel.html',
//    controller: function($scope, $element) {
//        var lbSync = $firebase(new Firebase(firebaseUrl + '/workers/'+workerId+'/listOfAchievements'));
//        $scope.listOfachievements = lbSync.$asArray();
//        $scope.icon = iconFactory.get;
//        $scope.listOfachievements.$loaded().then(function() {});
//    }
//};
//}
//
//angular.module('crowdCode').filter('byCurrent', function () {
//return function (listOfachievements) {
//   	var types = [];
//    var items = {
//        out: []
//    };
//    angular.forEach(listOfachievements, function (value, key) {
//        if (!value.isUnlocked && types.indexOf(value.condition) == -1  && this.out.length < 3) {
//            this.out.push(value);
//            types.push(value.condition);
//        }
//    }, items);
//    types = [];
//    return items.out;
//};
//});



