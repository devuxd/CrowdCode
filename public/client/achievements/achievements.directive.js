angular
    .module('crowdCode')
    .controller('userAchievements', ['$scope','avatarFactory','iconFactory','$firebaseArray','firebaseUrl','workerId', function($scope, avatarFactory,iconFactory,$firebaseArray,firebaseUrl,workerId){


    $scope.userStats = [];
    $scope.listOfachievements = [];
    $scope.icon = iconFactory.get;
    $scope.avatar  = avatarFactory.get;
      var statsRef = firebase.database().ref().child('Workers').child(workerId).child('microtaskHistory');
    	//var statsRef  = new Firebase(firebaseUrl + '/workers/'+workerId+'/microtaskHistory');
     	//var statsSync = $firebaseArray(statsRef);
     	$scope.userStats = $firebaseArray(statsRef);
     	$scope.userStats.$loaded().then(function(){
        console.log($scope.userStats);
     	});


    	var achievementsRef  = firebase.database().ref().child('Workers').child(workerId).child('listOfAchievements');
      //new Firebase(firebaseUrl + '/workers/'+workerId+'/listOfAchievements');
    	//var achievementsSync = $firebaseArray(achievementsRef);
    	$scope.listOfachievements = $firebaseArray(achievementsRef);
    	$scope.listOfachievements.$loaded().then(function(){
        console.log($scope.listOfachievements);
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
