angular.module('crowdCode').directive('questionList',function($rootScope,$timeout,$firebase,firebaseUrl, questionsService, microtasksService){
	return {
		scope: false,
		templateUrl: '/client/questions/questionsList.html',
		link: function($scope,$element,$attrs){
				$rootScope.$on('fetchedMicrotaskKey',function( event, microtaskKey ){
					console.log("fetchedMicrotaskKey",microtaskKey);
					//console.log(val);
				 // delay 250 ms
				});

			console.log(microtasksService.fetchedMicrotaskKey);
			$scope.setSelected=setSelected;
			console.log(microtasksService.getFetchedMicrotask());
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