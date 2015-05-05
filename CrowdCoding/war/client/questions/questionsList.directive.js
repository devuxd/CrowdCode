angular.module('crowdCode').directive('questionList',function($rootScope,$timeout,$firebase,firebaseUrl, questionsService, microtasksService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionsList.html',
		link: function($scope,$element,$attrs){

			$scope.resetFilter=resetFilter;
			$scope.addToFilter=addToFilter;

			$scope.search    = '';
			$scope.isRelated = isRelatedToArtifact;

			$scope.toggleRelation = function(q){
				if( isRelatedToArtifact(q) ){
					questionsService.linkArtifact(q.id, $scope.loadedArtifact.id , true );
				} else {
					questionsService.linkArtifact(q.id, $scope.loadedArtifact.id , false );
				}

			};

			var searchTimeout;
			$scope.$watch('search',function( val ){
				if (searchTimeout) $timeout.cancel(searchTimeout);
		        searchTimeout = $timeout(function() {
		        	if( val.length === 0)
		        		$scope.questions = questionsService.getQuestions();
		        	else {
		        		$scope.questions = questionsService.searchResults( val );
		        	}
		        }, 250); // delay 250 ms
			});

			
			function isRelatedToArtifact(q){
				return q.artifactsId != null && $scope.loadedArtifact != null && q.artifactsId.indexOf( ''+$scope.loadedArtifact.id ) > -1 ; 
			}


			function resetFilter(){
				$scope.search = '';
			}

			function addToFilter( text ){
				if( $scope.search.indexOf(text) > -1 )
					return; 
				
				$scope.search = text + ' ' + $scope.search ; 
			}


		}
	};
});