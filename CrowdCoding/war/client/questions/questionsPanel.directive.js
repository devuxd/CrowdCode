angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, microtasksService){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			$scope.setView = setView;
			$rootScope.$on('loadMicrotask',function( event, microtask){
				console.log("fetchedMicrotaskKey",microtask);
				$scope.fetchedMicrotask=microtask;
			});
			$scope.view = 'question_list';
			function setView(view){
				$scope.view = view;
			}
		}
	};
});