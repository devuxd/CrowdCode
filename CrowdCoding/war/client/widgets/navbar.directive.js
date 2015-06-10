angular
    .module('crowdCode')
    .directive('navbar', navbar); 

function navbar() {
    return {
    	replace: true,
        restrict: 'E',
        templateUrl: '/client/widgets/navbar.html'
    };
};