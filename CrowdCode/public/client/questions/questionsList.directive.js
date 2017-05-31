angular.module('crowdCode').directive('questionList',function($rootScope,$tooltip,$timeout,workerId,firebaseUrl, questionsService, microtasksService){
	return {
		scope: false,
		restrict: 'AEC',
		templateUrl: '/client/questions/questionsList.html',
		link: function($scope,$element,$attrs){

			var searchTimeout;

			$scope.search = [];
			$scope.sel = null;
			
			$scope.updateFilter = updateFilter;
			$scope.getFilterStr = getFilterStr;
			$scope.resetFilter = resetFilter;
			$scope.addToFilter = addToFilter;

			var filterBox = $('.searchbox');
			var tooltipTimeout = null;
			$scope.filterTooltip = $tooltip(filterBox, {trigger:'manual',placement:'bottom',title: 'Press enter to search'});
			$scope.showTooltip = function(){
				console.log('showing');
				$scope.filterTooltip.show();

				tooltipTimeout = $timeout(function(){ 
					$scope.filterTooltip.hide(); 
					$timeout.cancel(tooltipTimeout)
				},1000);
			}

			function getFilterStr(){
				var text = '';
				for( var i = 0; i < $scope.search.length; i++)
					text += ' ' + $scope.search[i].text;
				return text;
			}

			function updateFilter(){
				
				$scope.filterTooltip.hide();
				var text = getFilterStr();
		        searchTimeout = $timeout(function() {
		        	if( text == '' )
		        		$scope.questions = questionsService.getQuestions();
		        	else {
		        		$scope.questions = questionsService.searchResults( text );
		        	}
		        }, 250); // delay 250 ms
			}

			function resetFilter(){
				$scope.search = [];
				updateFilter();
			}

			function addToFilter( text ){
				var found = false;
				for( var i = 0; i < $scope.search.length; i++)
					if( !found && $scope.search[i].text == text ) 
						found = true;
				if( !found ){
					$scope.search.push({ text: text }); 
					updateFilter();
				}
			}


		}, 
		controller: function($scope){
			
		}
	};
});