angular
    .module('crowdCode')
    .directive('leftBar', function(){

	return {
		scope: true, 
		templateUrl: '/client/widgets/left_bar_template.html', 
		replace: false,
		link: function($scope, iElm, iAttrs, controller) {
			$scope.tabs=[ 'newsfeed', 'questions', 'leaderboard']; //, 'chat'];
			$scope.selectedTab = 1;
			$scope.selectTab = function(index){
				$scope.selectedTab = index;
			};

			$scope.$on('setLeftBarTab',function( event, tabName ){
				console.log('switching to tab '+tabName);
				var index = $scope.tabs.indexOf(tabName);
				if( index > -1 )
					$scope.selectTab( index );
			});
		}
	};
});