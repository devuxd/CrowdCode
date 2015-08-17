angular
    .module('crowdCode')
    .directive('leaderboard', ['avatarFactory','$firebaseArray','firebaseUrl','workerId','$rootScope', leaderboard]);

function leaderboard( avatarFactory, $firebaseArray, firebaseUrl, workerId,$rootScope) {
    return {
        restrict: 'E',
        templateUrl: '/client/leaderboard/leaderboard.template.html',
        controller: function($scope, $element) {
            $scope.avatar  = avatarFactory.get;
            $scope.leaders = $firebaseArray(new Firebase(firebaseUrl + '/leaderboard/leaders'));
            $scope.leaders.$loaded().then(function() {});
            
            $scope.clicked = function(workerToShow){
            	//$scope.$broadcast('showWorkerProfile',workerIdToShow);
            	if(workerToShow.$id != workerId){
            		$rootScope.$broadcast('showWorkerProfile',workerToShow.$id);
            	}
            }
        }
    
   
    };
}