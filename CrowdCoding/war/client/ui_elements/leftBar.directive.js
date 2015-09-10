angular
    .module('crowdCode')
    .directive('leftBar', function($rootScope){

	return {
		templateUrl: '/client/ui_elements/left_bar_template.html',
		replace: true,
		link: function($scope, iElm, iAttrs) {
			$rootScope.selectedTab = 'newsfeed';
			$rootScope.selectTab = function(tabName){
				$scope.selectedTab = tabName;
			}
		}
	};
});