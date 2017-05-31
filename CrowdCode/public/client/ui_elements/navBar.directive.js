angular
    .module('crowdCode')
    .directive('navBar', navBar); 

function navBar() {
    return {
    	replace: true,
        restrict: 'E',
        templateUrl: '/client/ui_elements/nav_bar_template.html'
    };
};

