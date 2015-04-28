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

			$scope.toggleVoteUp   = toggleVoteUp;
			$scope.toggleVoteDown = toggleVoteDown;


			function toggleVoteUp(questioning)
			{
				var remove = false;
				if( questioning.votersId && questioning.votersId.indexOf(workerId) !==-1)
					remove= true;
				questionsService.vote(questioning.id,remove);
			}

			function toggleVoteDown(questioning)
			{
				var remove = false;
				if( questioning.reportersId && questioning.reportersId.indexOf(workerId) !==-1)
					remove= true;
				questionsService.report(questioning.id,remove);
			}

			function postComment(){
				if( $scope.comment.text != ''){
					var commentForm = { questionId : $scope.sel.id , answerId : $scope.comment.answerId, text : $scope.comment.text };
					questionsService
						.submitQuestion("comment",commentForm)
						.then(function(){
							$scope.comment.text ='';
							$scope.comment.answerId = null;
							$scope.showCommentForm = false;
						},function(){
							console.log('error posting the comment');
						});
				}
			}

			function postAnswer(){
				if( $scope.answer.text != ''){
					var answerForm = { questionId : $scope.sel.id , text : $scope.answer.text };
					questionsService
						.submitQuestion("answer",answerForm)
						.then(function(){
							$scope.answer.text='';
							$scope.showAnswerForm = false;
						},function(){
							console.log('error posting the answer');
						});
				}
			}
		}
	};
});