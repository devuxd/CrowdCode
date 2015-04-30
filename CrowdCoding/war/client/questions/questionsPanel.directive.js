angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, questionsService,microtasksService){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			$scope.setView = setView;
			$scope.fetchedMicrotask;

			$scope.questions = questionsService.getQuestions();
			$scope.questions.$loaded().then(function(){
				$scope.allTags = questionsService.getAllTags();
			});

			$rootScope.$on('noMicrotask',function( event ){
				$scope.fetchedMicrotask = null;
			});
			$rootScope.$on('loadMicrotask',function( event, microtask ){
				$scope.fetchedMicrotask = microtask;
			});
			
			$scope.view = 'question_list';
			function setView(view){
				$scope.view = view;
			}
		}
	};
});