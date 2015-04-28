angular.module('crowdCode').directive('questionList',function($rootScope,$timeout,$firebase,firebaseUrl, questionsService, microtasksService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionsList.html',
		link: function($scope,$element,$attrs){
			
			$scope.setSelected=setSelected;
			$scope.resetFilter=resetFilter;

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
		        	}
		        }, 250); // delay 250 ms
			});

			
			function resetFilter(){
				$scope.search = '';
			}

			function setSelected(q){
				$scope.sel = q;
			}

		}
	};
});