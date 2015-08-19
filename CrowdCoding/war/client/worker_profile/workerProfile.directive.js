angular
	.module('crowdCode')
	.directive('workerProfile', ['$firebase','iconFactory','firebaseUrl','$firebaseArray','$firebaseObject','workerId', workerProfile])
	
function workerProfile($firebase, iconFactory, firebaseUrl,$firebaseArray,$firebaseObject, workerId) {
return {
    restrict: 'EA',
    scope:{workerProfile:"="},
    templateUrl: '/client/worker_profile/profile_panel.html',
    controller: function($scope) {
      $scope.workerName = "";
      $scope.hasAchievement = false;
      $scope.workerStats = [];
      $scope.listOfachievements = [];
      $scope.icon = iconFactory.get;    	 
      $scope.currentId = 0;
      
      $scope.gotAchievement = function(){
    	  $scope.hasAchievement = true;
      }
      
      var nameObj = $firebaseObject(new Firebase(firebaseUrl + '/workers/'+ $scope.workerProfile+'/workerHandle'));
      nameObj.$loaded().then(function(){
    	  $scope.workerName = nameObj.$value;
  	  });
      
      
      	var statsRef  = new Firebase(firebaseUrl + '/workers/'+ $scope.workerProfile+'/microtaskHistory');
       	var statsSync = $firebaseArray(statsRef);
       	$scope.workerStats = statsSync;
       	$scope.workerStats.$loaded().then(function(){
       });
       	
       	
      	var achievementsRef  = new Firebase(firebaseUrl + '/workers/'+ $scope.workerProfile+'/listOfAchievements');
      	var achievementsSync = $firebaseArray(achievementsRef);
      	$scope.listOfachievements = achievementsSync;
      	$scope.listOfachievements.$loaded().then(function(){
      	});
    	}
	}
}

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




