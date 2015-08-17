angular
    .module('crowdCode')
    .controller('workerProfile', ['$scope','$rootScope','$firebase','iconFactory','$firebaseArray','firebaseUrl','workerId', function($scope,$rootScope,$firebase,iconFactory,$firebaseArray,firebaseUrl,workerId){
    	
    	
    $scope.userStats = [];
    $scope.listOfachievements = [];
    $scope.icon = iconFactory.get;    	 
    $scope.currentId = 0;
    $scope.$on('showNewProfile', showNewProfile);
    
    function showNewProfile($event, WorkerToShow ) {
       	console.log(WorkerToShow + ' ' + workerId);
    	console.log('here121');
    	console.log('ops ' +$scope.currentId);
    	if($scope.currentId != WorkerToShow){
    		$scope.currentId = WorkerToShow;
    		$scope.reloadInfo(WorkerToShow);
    		console.log('ops ' +$scope.currentId);
    	}
    	//$rootScope.$broadcast('showWorkerProfile');
    }
    	var statsRef  = new Firebase(firebaseUrl + '/workers/'+ $scope.currentId+'/microtaskHistory');
     	var statsSync = $firebaseArray(statsRef);
     	$scope.userStats = statsSync;
     	$scope.userStats.$loaded().then(function(){
     });
     	
     	
    	var achievementsRef  = new Firebase(firebaseUrl + '/workers/'+ $scope.currentId+'/listOfAchievements');
    	var achievementsSync = $firebaseArray(achievementsRef);
    	$scope.listOfachievements = achievementsSync;
    	$scope.listOfachievements.$loaded().then(function(){
    		console.log('blablabla ' +$scope.currentId);
    	});
    	
    	function reloadInfo(id){
    		console.log('new thing');
        	var statsRef  = new Firebase(firebaseUrl + '/workers/'+ id+'/microtaskHistory');
         	var statsSync = $firebaseArray(statsRef);
         	$scope.userStats = statsSync;
         	$scope.userStats.$loaded().then(function(){
         	});
         	
         	
        	var achievementsRef  = new Firebase(firebaseUrl + '/workers/'+ id+'/listOfAchievements');
        	var achievementsSync = $firebaseArray(achievementsRef);
        	$scope.listOfachievements = achievementsSync;
        	$scope.listOfachievements.$loaded().then(function(){
        		console.log('blablabla ' +id);
        	});
    		
    		
    	}
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



