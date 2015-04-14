angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, microtasksService){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			$scope.setView = setView;
			$scope.fetchedMicrotask;
			$rootScope.$on('fetchedMicrotaskKey',function( event, microtaskKey ){
				console.log("fetchedMicrotaskKey",microtaskKey);
				$scope.fetchedMicrotask=microtasksService.get(microtaskKey);
				//console.log(val);
			 // delay 250 ms
			});
			$scope.view = 'question_list';
			function setView(view){
				$scope.view = view;
			}
		}
	};
});