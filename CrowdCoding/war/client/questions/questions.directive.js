angular
    .module('crowdCode').directive('questionsPanel',function($timeout,$firebase,firebaseUrl){

	return {
		scope: {},
		templateUrl: '/client/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			$scope.setView = setView;
			$scope.view = 'question_list';

			function setView(view){
				$scope.view = view;
			}
		}
	};
});

angular
    .module('crowdCode').directive('questionList',function($timeout,$firebase,firebaseUrl, questionsService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionsList.html',
		link: function($scope,$element,$attrs){
			$scope.setSelected=setSelected;

			function setSelected(q){
				$scope.sel = q;
			}
			$scope.search    = '';
			$scope.questions = questionsService.getQuestions();

			var searchTimeout;
			$scope.$watch('search',function( val ){

				if (searchTimeout) $timeout.cancel(searchTimeout);	
		        searchTimeout = $timeout(function() {
		        	if( val.length === 0)
		        		$scope.questions = questionsService.getQuestions();
		        	else {
		        		$scope.questions = questionsService.searchResults( val );
		        		console.log($scope.questions);
		        	}
		        }, 250); // delay 250 ms
			});
		}
	};
});

    angular
        .module('crowdCode').directive('questionDetail',function($timeout,$firebase,firebaseUrl,workerId,questionsService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionDetail.html',
		link: function($scope,$element,$attrs){
			$scope.answerText='';
			$scope.workerId= workerId;
			$scope.postAnswer = postAnswer;
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

			$scope.postComment = postComment;

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

        angular
            .module('crowdCode').directive('questionForm',function($firebase,firebaseUrl,workerId, questionsService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionForm.html',
		link: function($scope,$element,$attrs){
			$scope.question = {
				title: '',
				text: '',
				tags: []
			};

			$scope.allTags=questionsService.getAllTags();
			$scope.newTag = '';
			$scope.a={newTag:''};

			$scope.postQuestion = postQuestion;
			$scope.addTag       = addTag;

			console.log("from directivee",$scope.allTags);

			function addTag(){
				if( $scope.question.tags.indexOf($scope.newTag) == -1 && $scope.newTag !== '')
					$scope.question.tags.push($scope.newTag);

				$scope.newTag = '';
			}

			function postQuestion(){
				addTag();
				console.log($scope.question);
				questionsService.submitQuestion('question',$scope.question);
			}

		}
	};
});