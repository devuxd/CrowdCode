
// check if a function code has errors
angular
    .module('crowdCode')
    .directive('functionValidator', ['$rootScope','ADTService', 'functionsService', 'functionUtils', function($rootScope,ADTService, functionsService, functionUtils) {

    var MAX_NEW_STATEMENTS = 10;

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var statements = undefined;
            var initialStatements = undefined;

            ctrl.$formatters.unshift(function(code) {
                
                var validationData = functionUtils.validate(code);

                // the # of statements validator doesn't relly depends on the 
                // validation of the function code, so it's better to separate
                // it from the functionUtils.validate method
                if( validationData.statements ){
                    statements        = validationData.statements;
                    initialStatements = initialStatements || statements; 

                    if( statements - initialStatements > MAX_NEW_STATEMENTS ){
                        validationData.errors.push("You are not allowed to add more than "+MAX_NEW_STATEMENTS+" statements");
                    }

                    scope.$emit('statements-updated', statements - initialStatements, MAX_NEW_STATEMENTS );
                } 


                // if the errors array is empty, the validation is passed
                if ( validationData.errors.length > 0) {
                    ctrl.$setValidity('function', false);
                    ctrl.$error.function_errors = validationData.errors;
                    return undefined;
                } else {
                    ctrl.$setValidity('function', true);
                    ctrl.$error.function_errors = [];
                    return code;
                }

            });

        }
    };


}]);