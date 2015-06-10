
// check if a functionName is already taken
angular
    .module('crowdCode')
    .directive('functionNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var functionsName=functionsService.getDescribedFunctionsName();
                var valid =  viewValue === ""|| viewValue === undefined || (functionsName.indexOf(viewValue) == -1);
                if (!valid) {

                    ctrl.$setValidity('function', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('function', true);
                    return viewValue;
                }

            });

        }
    };
}]);