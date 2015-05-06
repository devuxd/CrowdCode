angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, workerId, questionsService, functionsService, microtasksService){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			
			$scope.allTags        = [];
			$scope.loadedArtifact = null;
			$scope.view           = 'question_list';
			$scope.sel            = null;

			$scope.questions = questionsService.getQuestions();
			$scope.questions.$loaded().then(function(){
				$scope.allTags = questionsService.getAllTags();
			});

			$scope.setUiView       = setUiView;
			$scope.setSelected     = setSelected;
			$scope.updateView      = updateView;
			$scope.isRelated       = isRelatedToArtifact;
			$scope.toggleRelation  = toggleRelation;
			$scope.isUpdated       = isUpdated;
			$scope.getUpdateString = getUpdateString;

			$scope.$on('noMicrotask',   onMicrotaskLoaded ); 
			$scope.$on('loadMicrotask', onMicrotaskLoaded );
			$scope.$on('showQuestion',  onShowQuestion );

			function onMicrotaskLoaded( event, microtask ){
				if( microtask === undefined )
					$scope.loadedArtifact = null 
				else				
					$scope.loadedArtifact = functionsService.get(microtask.functionID);
			}

			function onShowQuestion( event, questionId ){
				setSelected( $scope.questions.$getRecord(questionId) );
			}

			function setUiView(view){
				$scope.view = view;
			}

			function setSelected(q){
				$scope.sel = q;

				updateView();
				setUiView('question_detail');
			}

			function updateView(){
				if( $scope.sel === undefined ) return;

				var view = {
					at            : Date.now(),
					answersCount  : $scope.sel.answersCount,
					commentsCount : $scope.sel.commentsCount
				};
				questionsService.setView( $scope.sel.id, view );
			}

			function isUpdated(q){
				return q.views === undefined || q.views[ workerId ] === undefined || q.views[workerId].at < q.updatedAt; 
			}

			function getUpdateString(q){
				var diffAnswers, diffComments;

				if( q.views === undefined || q.views[ workerId ] === undefined  ){
					diffAnswers  = q.answersCount; 
					diffComments = q.commentsCount; 
				} else {
					var view = q.views[ workerId ];
					diffAnswers  = q.answersCount  - view.answersCount; 
					diffComments = q.commentsCount - view.commentsCount; 
				}
				
				var updates  = [];
				if( diffAnswers > 0 )  updates.push( diffAnswers + ' new answers');
				if( diffComments > 0 ) updates.push( diffComments + ' new comments');
				return '('+updates.join(', ')+')';
			}

			function isRelatedToArtifact(q){
				return q.artifactsId != null && $scope.loadedArtifact != null && q.artifactsId.indexOf( ''+$scope.loadedArtifact.id ) > -1 ; 
			}

			function toggleRelation(q){
				if( isRelatedToArtifact(q) ){
					questionsService.linkArtifact(q.id, $scope.loadedArtifact.id , true );
				} else {
					questionsService.linkArtifact(q.id, $scope.loadedArtifact.id , false );
				}
			}


		}
	};
});