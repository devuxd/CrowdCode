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
			$scope.newTag    = '';
			$scope.relatedTo = 'none';
			$scope.allTags   = questionsService.getAllTags();

			$scope.postQuestion = postQuestion;
			$scope.addTag       = addTag;
			$scope.removeTag    = removeTag;


			function addTag(){
				var tags = $scope.newTag.split(',');
				for( var t = 0; t < tags.length ; t++ ){
					var tag = tags[t].trim();
					if( $scope.question.tags.indexOf(tag) == -1 && tag !== '')
						$scope.question.tags.push(tag);
				}
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

				if( $scope.relatedTo == 'artifact' ){
					console.log('relatedTo'+$scope.relatedTo, $scope.fetchedMicrotask);
					$scope.question.artifactId = $scope.fetchedMicrotask.owningArtifactId;
				}
					
				questionsService
					.submit('question',$scope.question)
					.then(function(){
						$scope.question = {
							title: '',
							text: '',
							tags: []
						};
						$scope.setView('question_list');
						$scope.questionForm.$setPristine();
					},function(){
						console.log('error submitting the question')
					});
			}

		}
	};
});