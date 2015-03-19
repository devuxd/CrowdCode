


// helper for the function editing convenctions
angular
    .module('crowdCode')
    .directive('functionConvections', function($sce){
    return {
        scope: true, // {} = isolate, true = child, false/undefined = no change
        restrict: 'EA', 
        templateUrl: '/client/functions/function_conventions.html',
        controller: function($scope, $element, $attrs) {
            $scope.examplePseudocode = $sce.trustAsHtml(
                        '<strong>Example:</strong>\n'+
                        'function foo() { \n'+
                        '  var values = [ 128, 309 ];\n'+
                        '  var avg;\n'+
                        '  <span class="pseudoCode">//# calc the average of the values</span>\n'+
                        '  return avg; \n' +
                        '}\n');
            $scope.examplePseudocall = $sce.trustAsHtml(
                        '<strong>Example:</strong>\n'+
                        'function foo() { \n'+
                        '  var values = [ 128, 309 ];\n'+
                        '  var avg = <span class="pseudoCall">calcAverage(values)</span>; \n'+
                        '  return avg; \n' +
                        '}\n'+
                        '// return the average of the values\n'+
                        'function calcAverage(values){}');

        }
    };
});