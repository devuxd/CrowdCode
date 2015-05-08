angular.module('crowdCode').directive('questionForm',function($firebase,firebaseUrl,workerId, questionsService){
	return {
		scope: true,
		restrict: 'AEC',
		templateUrl: '/client/questions/questionForm.html',
		controller: function($scope){

			// scope methods
			$scope.postQuestion = postQuestion;

			// initialize form fields
			resetForm();
			
			function resetForm(){
				if( $scope.sel == null ){
					$scope.question  = { id: 0, title: '', text: '', artifactId : false };
					$scope.tags      = [];
				} else {
					$scope.question = { 
						id: $scope.sel.id, 
						title: $scope.sel.title, 
						text: $scope.sel.text
					};
					$scope.tags = [];
					if( $scope.sel.tags !== undefined )
						for( var t = 0; t < $scope.sel.tags.length; t++ )
							$scope.tags.push( { text: $scope.sel.tags[t] } );
						
				}
			}

			function postQuestion(){

				// prepare the tags for the submit 
				$scope.question.tags = [];
				for( var t = 0; t < $scope.tags.length; t++ ){
					$scope.question.tags.push( $scope.tags[t].text );
				}

				if( $scope.question.artifactId )
					$scope.question.artifactId = $scope.loadedArtifact.id;
				else
					$scope.question.artifactId = null;

				console.log($scope.question);

				questionsService
					.submit('question',$scope.question)
					.then(function(){
						if( $scope.sel == null )
							$scope.setUiView('list');
						else 
							$scope.setUiView('detail');

						$scope.questionForm.$setPristine();
					},function(){
						console.log('error submitting the question')
					});
			}

		}
	};
});