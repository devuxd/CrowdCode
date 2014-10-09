
// directive for json field validation
myApp.directive('json', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {

                // instantiate a new JSONValidator
                var validator = new JSONValidator();
                var paramType = "Number";
                // initialize JSONValidator and execute errorCheck
                validator.initialize(viewValue,paramType)
                validator.errorCheck();
                
                if (!validator.isValid()) {
                    ctrl.$setValidity('json', false);
                    ctrl.$error.json_message = validator.getErrors();
                    return undefined;
                } else {
                    ctrl.$setValidity('json', true);
                    return viewValue;
                }
            });
        }
    };  
});