angular.module('crowdCode').directive('questionDetail',function($timeout,$firebase,firebaseUrl,workerId,questionsService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionDetail.html',
		link: function($scope,$element,$attrs){
			$scope.answer  = {};
			$scope.comment = {};

			$scope.answer.text      = '';
			$scope.comment.text     = '';
			$scope.comment.answerId = null;

			$scope.workerId    = workerId;

			$scope.postAnswer  = postAnswer;
			$scope.postComment = postComment;

			$scope.toggleClosed = toggleClosed;

			$scope.toggleVoteUp   = toggleVoteUp;
			$scope.toggleVoteDown = toggleVoteDown;


			function toggleClosed(questioning){
				if( questioning.closed !== undefined ){
					questionsService.setStatus(questioning.id, ! questioning.closed );
				}
			}

			function toggleVoteUp(questioning){
				var remove = false;
				if( questioning.votersId && questioning.votersId.indexOf(workerId) !==-1)
					remove= true;
				questionsService.vote(questioning.id,remove);
			}

			function toggleVoteDown(questioning){
				var remove = false;
				if( questioning.reportersId && questioning.reportersId.indexOf(workerId) !==-1)
					remove= true;
				questionsService.report(questioning.id,remove);
			}

			function postComment(answerId){
				if( $scope.comment.text != ''){
					var commentForm = { questionId : $scope.sel.id , answerId : answerId, text : $scope.comment.text };
					questionsService
						.submit("comment",commentForm)
						.then(function(){
							$scope.comment.text ='';
							$scope.comment.answerId = null;
							$scope.showCommentForm = false;
							$scope.updateView();
						},function(){
							console.log('error posting the comment');
						});
				}
			}

			function postAnswer(){
				if( $scope.answer.text != ''){
					var answerForm = { questionId : $scope.sel.id , text : $scope.answer.text };
					questionsService
						.submit("answer",answerForm)
						.then(function(){
							$scope.answer.text='';
							$scope.showAnswerForm = false;
							$scope.updateView();
						},function(){
							console.log('error posting the answer');
						});
				}
			}
		}
	};
});