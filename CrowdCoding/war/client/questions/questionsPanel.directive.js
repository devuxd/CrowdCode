angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, workerId, questionsService, functionsService, microtasksService){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			
			$scope.allTags        = [];
			$scope.view           = 'list';
			$scope.animation      = 'from-left';
			$scope.sel            = null;
			$scope.loadedArtifact = null;

			$scope.questions = questionsService.getQuestions();
			$scope.questions.$loaded().then(function(){
				$scope.allTags = questionsService.allTags;
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
				var prev = $scope.view;
				if( (prev == 'list' && view == 'detail') || (prev == 'detail' && view == 'list'))
					$scope.animation = 'from-right';
				else 
					$scope.animation = 'from-left';

				
				$timeout(function(){ 
					$scope.view = view; 
					if( view == 'list' ) 
						$scope.sel = null; 
				},200);
			}

			function setSelected(q){
				$scope.sel = q;

				updateView();
				setUiView('detail');
			}

			function updateView(){
				if( $scope.sel === undefined ) return;

				var view = {
					at            : Date.now(),
					version       : $scope.sel.version,
					answersCount  : $scope.sel.answersCount,
					commentsCount : $scope.sel.commentsCount
				};
				questionsService.setWorkerView( $scope.sel.id, view );
			}

			function isUpdated(q){
				return q.views === undefined || q.views[ workerId ] === undefined || q.views[workerId].version < q.version; 
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
				
				var updates = [];
				if( diffAnswers > 0 )  updates.push( diffAnswers + ' new answer' + ( diffAnswers > 1 ? 's' : '' ) );
				if( diffComments > 0 ) updates.push( diffComments + ' new comment' + ( diffComments > 1 ? 's' : '' ) );

				return updates.length > 0 ? '('+updates.join(', ')+')' : '' ;
			}

			function isRelatedToArtifact(q){
				return q.artifactsId != null && $scope.loadedArtifact != null && q.artifactsId.indexOf( ''+$scope.loadedArtifact.id ) > -1 ; 
			}

			function toggleRelation(q){
				if( isRelatedToArtifact(q) ){
					questionsService
						.linkArtifact(q.id, $scope.loadedArtifact.id , true )
						.then(function(){
							console.log('success');
						},function(){
							console.log('error');
						});
				} else {
					questionsService
						.linkArtifact(q.id, $scope.loadedArtifact.id , false )
						.then(function(){
							console.log('success');
						},function(){
							console.log('error');
						});
				}
			}


		}
	};
});