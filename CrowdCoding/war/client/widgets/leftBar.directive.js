angular
    .module('crowdCode')
    .directive('leftBar', function(){

	return {
		scope: true, 
		templateUrl: '/client/widgets/left_bar_template.html', 
		replace: false,
		link: function($scope, iElm, iAttrs, controller) {
			$scope.tabs=[ 'newsfeed', 'questions', 'leaderboard', 'chat'];
			$scope.selectedTab = 1;
			$scope.selectTab = function(index){
				$scope.selectedTab = index;
			};
		}
	};
});