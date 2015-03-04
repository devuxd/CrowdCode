angular
    .module('crowdCode')
    .directive('testResult', testResult); 

function testResult() {
    return {
        restrict: 'E',
        scope: { test: '=', 'funct'},
        templateUrl: '/html/templates/ui/test_result.html',
        link: function(scope,element,attributes){

        	scope.diffMode = true;
        	scope.switchMode = function(){
        		scope.diffMode = !scope.diffMode;
        	}
        }
    };
};