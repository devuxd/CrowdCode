angular
    .module('crowdCode')
    .directive('leaderboard', ['avatarFactory','$firebaseArray','firebaseUrl','workerId','$rootScope',leaderboard]);

function leaderboard( avatarFactory, $firebaseArray, firebaseUrl, workerId,$rootScope) {
    return {
        restrict: 'E',
        templateUrl: '/client/leaderboard/leaderboard.template.html',
        controller: function($scope, $element) {
            $scope.avatar  = avatarFactory.get;
            var leaderRef = firebase.database().ref().child('Projects').child(projectId).child('leaderboard').child('leaders');
            $scope.leaders = $firebaseArray(leaderRef);
            $scope.leaders.$loaded().then(function() {});

            $scope.clicked = function(workerToShow){
            	if(workerToShow.$id != workerId){
            		$rootScope.$broadcast('showWorkerProfile',workerToShow.$id);
            	}
            	else{
            		$rootScope.$broadcast('showUserStatistics');
            	}
            }
        }


    };
}
