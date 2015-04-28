angular.module('crowdCode').directive('questionForm',function($firebase,firebaseUrl,workerId, questionsService){
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
			$scope.getArtifactId=false;

			$scope.postQuestion = postQuestion;
			$scope.addTag       = addTag;
			$scope.removeTag    = removeTag;


			function addTag(){
				if( $scope.question.tags.indexOf($scope.newTag) == -1 && $scope.newTag !== '')
					$scope.question.tags.push($scope.newTag);
				$scope.newTag = '';
			}

			function removeTag(tag){
				if( $scope.question.tags.indexOf(tag) > -1 ){
					var index = $scope.question.tags.indexOf(tag) ;
					$scope.question.tags.splice(index,1);
				}
			}


			function postQuestion(){
				addTag();
				if($scope.getArtifactId)
					$scope.question.artifactId = $scope.fetchedMicrotask.owningArtifactId;

				questionsService
					.submitQuestion('question',$scope.question)
					.then(function(){
						$scope.question = {
							title: '',
							text: '',
							tags: []
						};
						$scope.setView('question_list');
					},function(){
						console.log('error submitting the question')
					});
			}

		}
	};
});