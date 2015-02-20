angular
    .module('crowdCode')
    .directive('functionEditor', functionEditor); 

function functionEditor() {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/ui/function_editor.html'
    };
};