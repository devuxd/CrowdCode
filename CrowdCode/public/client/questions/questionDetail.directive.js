angular.module('crowdCode').directive('questionDetail',function($timeout,firebaseUrl,workerId,questionsService){
	return {
		scope: true,
		restrict: 'AEC',
		templateUrl: '/client/questions/questionDetail.html',
		link: function($scope,$element,$attrs){
			$scope.form = {};
			$scope.form.answer = {
				show: false,
				text: ''
			};
			$scope.form.comment = {
				show: false,
				answerId : null,
				text: ''
			};
			$scope.form.tag = {
				show: false,
				text: ''
			};

			$scope.workerId    = workerId;

			$scope.addTag    = addTag;
			$scope.removeTag = removeTag;


			$scope.postAnswer  = postAnswer;
			$scope.postComment = postComment;

			$scope.toggleClosed = toggleClosed;

			$scope.toggleVoteUp   = toggleVoteUp;
			$scope.toggleVoteDown = toggleVoteDown;



			function toggleClosed(questioning){
				if( questioning.closed !== undefined ){
					questionsService.setClosed(questioning.id, ! questioning.closed );
				}
			}

			function toggleVoteUp(questioning){
				var remove = false;
				if( questioning.votersId && questioning.votersId.indexOf(workerId) !==-1)
					remove = true;
				questionsService.vote(questioning.id,remove);
			}

			function toggleVoteDown(questioning){
				var remove = false;
				if( questioning.reportersId && questioning.reportersId.indexOf(workerId) !==-1)
					remove= true;
				questionsService.report(questioning.id,remove);
			}

			function addTag(){
				if( $scope.form.tag.text != '' ){
					questionsService.tag( $scope.sel.id, $scope.form.tag.text , false)
						.then(function(){ 
							$scope.form.tag = {
								show: false,
								text: ''
							};
							console.log('success');
						},function(){ 
							console.log('fail')
						});
				}
			}

			function removeTag(tag){
				questionsService.tag( $scope.sel.id, tag, true)
					.then(function(){ 
						console.log('success');
					},function(){ 
						console.log('fail')
					});
			}


			function postComment(answerId){
				if( $scope.form.comment.text != ''){
					var commentForm = { questionId : $scope.sel.id , answerId : answerId, text : $scope.form.comment.text };
					questionsService
						.submit("comment",commentForm)
						.then(function(){
							$scope.form.comment = {
								show: false,
								text: ''
							};
							$scope.updateView();
						},function(){
							console.log('error posting the comment');
						});
				}
			}

			function postAnswer(){
				if( $scope.form.answer.text != ''){
					var answerForm = { questionId : $scope.sel.id , text : $scope.form.answer.text };
					questionsService
						.submit("answer",answerForm)
						.then(function(){
							$scope.form.answer = {
								show: false,
								text: ''
							};
							$scope.updateView();
						},function(){
							console.log('error posting the answer');
						});
				}
			}
		}
	};
});