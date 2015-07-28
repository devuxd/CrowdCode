angular
    .module('crowdCode')
    .directive('leftBarButtons', function($rootScope){

	return {
		templateUrl: '/client/ui_elements/left_bar_buttons_template.html',
		replace: true,
		link: function($scope, iElm, iAttrs) {
		}
	};
});