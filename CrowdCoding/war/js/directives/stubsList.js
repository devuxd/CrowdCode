angular
    .module('crowdCode')
    .directive('stubsList', stubsList); 

function stubsList() {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/ui/stubs_list.html'
    };
};