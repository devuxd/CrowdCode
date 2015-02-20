angular
    .module('crowdCode')
    .directive('testResult', testResult); 

function testResult() {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/ui/test_result.html'
    };
};