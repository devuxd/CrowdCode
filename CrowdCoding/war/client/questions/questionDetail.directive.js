angular.module('crowdCode').directive('questionDetail',function($timeout,$firebase,firebaseUrl,workerId,questionsService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionDetail.html',
		link: function($scope,$element,$attrs){
			$scope.answerText='';
			$scope.workerId= workerId;

			$scope.postAnswer = postAnswer;
			$scope.postComment = postComment;

			$scope.toggleVoteUp = toggleVoteUp;
			$scope.toggleVoteDown = toggleVoteDown;

			$scope.selectedAnswer={
				toggle : function(id){ this.id!=id ? this.id=id: this.id=0 },
				id:0,
				text : ''
			};

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

				var commentForm={questionId : $scope.sel.id , answerId : $scope.selectedAnswer.id, text : $scope.selectedAnswer.text};
				$scope.selectedAnswer.text='';
				console.log(commentForm);
				questionsService.submitQuestion("comment",commentForm);
			}

			function postAnswer(){

				var answerForm={questionId : $scope.sel.id , text : $scope.answerText};
				$scope.answerText='';
				console.log(answerForm);
				questionsService.submitQuestion("answer",answerForm);
			}
		}
	};
});