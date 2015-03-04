angular
    .module('crowdCode')
    .directive('stubsList', stubsList); 

function stubsList() {
    return {
        restrict: 'E',
        scope: { test: '=' },
        templateUrl: '/html/templates/ui/stubs_list.html'
    };
};