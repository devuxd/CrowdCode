
angular
    .module('crowdCode')
    .directive('statementsProgressBar',['$rootScope',function($rootScope) {
    return {
        templateUrl : '/client/widgets/statements_progress_bar.html',
        restrict: 'AE',
        link: function (scope, elm, attrs, ctrl) {
            scope.statements=0;
            scope.max=10;
            scope.$on('statements-updated',function(event,statements,max){
                scope.statements=statements;
                scope.max=max;
            });
        }
    };
}]);
