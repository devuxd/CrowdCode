/* ---------- KEY LISTENERS ----------- */
angular
    .module('crowdCode')
    .directive('pressEnter', function() {


    return function(scope, element, attrs) {

        var keyPressListener = function(event){
            if (!event.shiftKey && !event.ctrlKey && event.which === 13 ) {
                scope.$apply(function() {
                    scope.$eval(attrs.pressEnter);
                });
                event.preventDefault();
                
            }
        };

        element.on('keydown', keyPressListener);

        element.on('$destroy',function(){
            element.off('keydown',null,keyPressListener);
        });
    };
});

angular.module('crowdCode').directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

angular
    .module('crowdCode')
    .directive('disableBackspace', function() {
    return function(scope, element, attrs) {
        element.unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && 
                     (
                         d.type.toUpperCase() === 'TEXT' ||
                         d.type.toUpperCase() === 'PASSWORD' || 
                         d.type.toUpperCase() === 'FILE' || 
                         d.type.toUpperCase() === 'EMAIL' || 
                         d.type.toUpperCase() === 'SEARCH' || 
                         d.type.toUpperCase() === 'DATE' )
                     ) || 
                    d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });
    };
});


/* --------- FORM FOCUS MANAGEMENT HELPERS ------------ */
angular
    .module('crowdCode')
    .directive('focus', function(){
  return {
    link: function(scope, element) {
      element[0].focus();
    }
  };
});


angular
    .module('crowdCode')
    .directive('syncFocusWith', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {
            var unwatch = $scope.$watch("focusValue", function(currentValue, previousValue) {
                console.log('ajejebrazorf',currentValue,previousValue);
                if (currentValue === true && !previousValue) {
                    $element[0].focus();
                } else if (currentValue === false && previousValue) {
                    $element[0].blur();
                }
            });

            $element.on('$destroy',function(){
                unwatch();
            });
        }
    };
});





// USED FOR UPLOADING THE USER PICTURE
angular
    .module('crowdCode')
    .directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);


