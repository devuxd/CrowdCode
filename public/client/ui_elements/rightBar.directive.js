angular
    .module('crowdCode')
    .directive('rightBar', function($rootScope){

	return {
		templateUrl: '/client/ui_elements/right_bar_template.html', 
		replace: true,
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};
});