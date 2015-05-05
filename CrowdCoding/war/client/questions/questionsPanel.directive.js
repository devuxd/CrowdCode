angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, questionsService, functionsService, microtasksService){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			$scope.setView      = setView;
			$scope.setSelected  = setSelected;
			$scope.loadedArtifact = null;

			$scope.questions = questionsService.getQuestions();
			$scope.questions.$loaded().then(function(){
				$scope.allTags = questionsService.getAllTags();
			});

			$rootScope.$on('noMicrotask',function( event ){
				$scope.loadedArtifact = null;
			});

			$rootScope.$on('loadMicrotask',function( event, microtask ){
				$scope.loadedArtifact = functionsService.get(microtask.functionID);
			});

			$scope.$on('showQuestion',function( event, questionId ){
				setSelected( $scope.questions.$getRecord(questionId) );
				setView('question_detail');
			});
			
			$scope.view = 'question_list';

			function setView(view){
				$scope.view = view;
			}

			function setSelected(q){
				$scope.sel = q;
			}
		}
	};
});