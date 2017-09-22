angular
	.module('crowdCode')
	.directive('workerProfile', ['avatarFactory','iconFactory','firebaseUrl','$firebaseArray','$firebaseObject','workerId', workerProfile]);

function workerProfile(avatarFactory,iconFactory, firebaseUrl,$firebaseArray,$firebaseObject, workerId) {
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
      $scope.avatar  = avatarFactory.get;

      $scope.gotAchievement = function(){
    	  $scope.hasAchievement = true;
      }
    	var nameObj = $firebaseObject(firebase.database().ref().child('Projects').child(projectId).child('workers').child($scope.workerProfile).child('workerHandle'));
  	  nameObj.$loaded().then(function(){
  		  $scope.workerName = nameObj.$value;
  	  });

	   	$scope.workerStats = $firebaseArray(firebase.database().ref().child('Projects').child(projectId).child('workers').child($scope.workerProfile).child('microtaskHistory'));
  	  $scope.workerStats.$loaded().then(function(){
	    });

    	$scope.listOfachievements = $firebaseArray(firebase.database().ref().child('Projects').child(projectId).child('workers').child($scope.workerProfile).child('listOfAchievements'));
    	$scope.listOfachievements.$loaded().then(function(){
        console.log('list of achievements loaded');
    	});
    }
	}
}
