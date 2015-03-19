
/* -------- FIELD VALIDATORS --------- */

angular
    .module('crowdCode')
    .directive('jsonValidator', ['ADTService', function(ADTService) {
    return {
       
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            // instantiate a new JSONValidator
            var validator = new JSONValidator();
            ngModelCtrl.$formatters.unshift(function(viewValue) {
                // initialize JSONValidator and execute errorCheck
                validator.initialize(ADTService.getNameToADT(), viewValue, attrs.jsonValidator);
                validator.errorCheck();

                if(viewValue === undefined || validator.isValid() ){
                    ngModelCtrl.$setValidity('json', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('json', false);
                   ngModelCtrl.$error.json = validator.getErrors();
                   return viewValue;
                }
            });
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('jsonDataType', ['ADTService', function(ADTService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel) {
            ngModel.$validators.jsonDataType = function(modelValue,viewValue){
                var value = modelValue || viewValue;
                var validator = new JSONValidator();
                validator.initialize(ADTService.getNameToADT(), value, attrs.jsonDataType);
                validator.errorCheck();
                ngModel.$error.jsonErrors = validator.getErrors();
                return validator.isValid();
            };
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('reservedWord', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            var reservedWord= ["abstract","boolean","break","byte","case","catch","char","class","const","continue",
            "debugger","default","delete","do","double","else","enum","export","extends","false","final","finally",
            "float","for","function","goto","if","implements","import","in","instanceof","int","interface","long","native",
            "new","null","package","private","protected","public","return","short","static","super","switch","synchronized",
            "this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with"];

            ngModelCtrl.$parsers.unshift(function(viewValue) {
                
                if(reservedWord.indexOf(viewValue)===-1){
                    ngModelCtrl.$setValidity('reservedWord', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('reservedWord', false);
                   ngModelCtrl.$error.reservedWord = "You are using a reserved word of JavaScript, please Change it";
                   return viewValue;
                }
            });
        }
    };
});

angular
    .module('crowdCode')
    .directive('unicName', function(){
    return {
        scope: { parameters : "=" }, // {} = isolate, true = child, false/undefined = no change
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
        link: function($scope, iElm, iAttrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                // calc occurrences 
                var occurrence=0;
                angular.forEach($scope.parameters, function(value, key) {
                    if(value.paramName==viewValue)
                        occurrence++;
                });
                if (occurrence!==0) {
                    ctrl.$setValidity('unic', false);
                    ctrl.$error.unic = "More occurence of the same parameter name have been found, plese fix them";
                    return viewValue;
                } else {
                    ctrl.$setValidity('unic', true);
                    return viewValue;
                }

            });
        }
    };
});




// var name validator
angular
    .module('crowdCode')
    .directive('varNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var match = viewValue.match(/[a-zA-Z][\w\_]*/g);
                var valid = match != null && viewValue == match[0];
                if (!valid) {
                    ctrl.$setValidity('var', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('var', true);
                    return viewValue;
                }

            });

        }
    };
}]);


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
        link: function(scope, element, attrs) {
            var unwatch = $scope.watch("focusValue", function(currentValue, previousValue) {
                if (currentValue === true && !previousValue) {
                    element[0].focus();
                } else if (currentValue === false && previousValue) {
                    element[0].blur();
                }
            });

            element.on('$destroy',function(){
                unwatch();
            });
        }
    };
});





angular
    .module('crowdCode')
    .directive('resizer', function($document) {

    return function($scope, $element, $attrs) {
        // calculate the sum of the 2 element's dimensions in percentage
        // respect to the parent element dimension
        // - height: if vertical resizer
        // - width:  if horizontal resizer
        // and position the resize bar in between the elements

        // on mouse down attach mousemove and mouseup callbacks
        var mouseDownListener = function(event) {
            event.preventDefault();
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        };
        $element.on('mousedown', mouseDownListener);

        function mousemove(event) {

            if ($attrs.resizer == 'vertical') {
                var datas = {
                        leftX: $($attrs.resizerLeft).offset().left,
                        rightX: $($attrs.resizerRight).offset().left,
                        mouseX: event.pageX
                    }
                    //$element.css({ left: $($attrs.resizerRight).position().left + 'px' });

                var totalSizePx = $($attrs.resizerLeft).outerWidth() + $element.outerWidth() + $($attrs.resizerRight).outerWidth();
                var totalSizePer = Math.round(totalSizePx / $element.parent().outerWidth() * 100);

                var leftWidthPer = Math.round((datas.mouseX - datas.leftX) / $element.parent().outerWidth() * 100);

                if ($attrs.resizerMain == "left") {


                    if (leftWidthPer < 0) leftWidthPer = 0;
                    if (leftWidthPer > totalSizePer) leftWidthPer = totalSizePer;
                    if ($attrs.resizerMin && leftWidthPer < $attrs.resizerMin) leftWidthPer = $attrs.resizerMin;
                    if ($attrs.resizerMax && leftWidthPer > $attrs.resizerMax) leftWidthPer = $attrs.resizerMax;

                    var rightWidthPer = totalSizePer - leftWidthPer;

                } else if ($attrs.resizerMain == "right") {

                    var rightWidthPer = totalSizePer - leftWidthPer;

                    if (rightWidthPer < 0) rightWidthPer = 0;
                    if (rightWidthPer > totalSizePer) rightWidthPer = totalSizePer;
                    if ($attrs.resizerMin && rightWidthPer < $attrs.resizerMin) rightWidthPer = $attrs.resizerMin;
                    if ($attrs.resizerMax && rightWidthPer > $attrs.resizerMax) rightWidthPer = $attrs.resizerMax;

                    //var leftWidthPer = totalSizePer - rightWidthPer;
                }

                $($attrs.resizerLeft).css({
                    width: leftWidthPer + '%'
                });
                $($attrs.resizerRight).css({
                    width: rightWidthPer + '%'
                });

            } else {
                var datas = {
                    topY: $($attrs.resizerTop).offset().top,
                    bottomY: $($attrs.resizerBottom).position().top,
                    mouseY: event.pageY
                }

                var totalSizePx = $($attrs.resizerTop).outerHeight() + $element.outerHeight() + $($attrs.resizerBottom).outerHeight();
                var resizerHeightPx = $element.outerHeight();
                var topHeightPx = (datas.mouseY - datas.topY);
                var bottomHeightPx = totalSizePx - resizerHeightPx - topHeightPx;

                if ($attrs.resizerMain == "top") {



                } else {


                }

                if (topHeightPx + resizerHeightPx + bottomHeightPx == totalSizePx)
                    console.log("MATCH");
                else
                    console.log("DONT MATCH");


                $($attrs.resizerTop).css({
                    height: topHeightPx + 'px'
                });
                $($attrs.resizerBottom).css({
                    height: bottomHeightPx + 'px'
                });

            }


        }

        // when mouse up detach the callbacks
        function mouseup() {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
        }

        $element.on('$destroy',function(){
            $element.off('mousedown', mouseDownListener);
        });
    };
});




angular
    .module('crowdCode')
    .directive('userMenu',function($popover){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  '/html/templates/popover/user_popover.html'
            };
            popover = $popover(element,popoverSettings);
            popover.$scope.close = function(){
                popover.$promise.then(popover.hide);
            };

            element.on('click',function(event){  
               
                popover.$promise.then(popover.toggle);
            });

            
           
        }
    };
});




angular
    .module('crowdCode')
    .directive('descriptionPopover',function($rootScope,$popover,functionsService){
    return {
        restrict: 'EA',
        scope:{
            descriptionPopover :'=',
        },
        link: function($scope, element,attrs){

            var popoverSettings = {
                trigger: 'hover',
                placement: 'top',
                template:  '/html/templates/popover/description_popover.html',
            };

            var popover=$popover(element, popoverSettings);
            popover.$scope.code=$scope.descriptionPopover;

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

// VIEWS THE STATS
angular
    .module('crowdCode')
    .directive('projectStats', function($rootScope,$firebase) {

    return {
        restrict: 'E',
        scope: true,
        template: '<b>Stats:</b>'
                  +'<span class="stats">'
                  +'<!--<span><span class="badge">{{microtaskCountObj.$value}}</span> microtasks</span>-->'
                  +'<span><span class="badge">{{functionsCount}}</span> functions</span>'
                  +'<span><span class="badge">{{testsCount}}</span> tests</span>'
                  +'<span><span class="badge">{{loc}}</span> loc</span>'
                  +'</span>',

        link: function($scope, $element) {

            //$scope.microtaskCountObj  = $firebase(new Firebase($rootScope.firebaseURL+'/status/microtaskCount')).$asObject();

            var functionsRef = new Firebase($rootScope.firebaseURL+'/artifacts/functions/');
            $scope.functionsCount = 0;
            functionsRef.on('child_added',function (snapshot){
                $scope.functionsCount ++;
            });

            $scope.loc = 0;
            functionsRef.on('value',function(snap){
                var functs = snap.val();
                $scope.loc = 0;
                angular.forEach(functs,function(val){
                    $scope.loc += val.linesOfCode;
                })
            });


        
            var testsRef = new Firebase($rootScope.firebaseURL+'/artifacts/tests');
            $scope.testsCount = 0;
            testsRef.on('child_added',function(snapshot){
                $scope.testsCount ++;
            });

        }
    };
});
angular
    .module('crowdCode')
    .directive('maxLength',function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

 
          ctrl.$parsers.push(function (viewValue) {
              var maxLength=attrs.maxLength || 70 ;
              var splittedDescription= viewValue.split('\n');
              var regex = '.{1,'+maxLength+'}(\\s|$)|\\S+?(\\s|$)';

              for(var i=0;i<splittedDescription.length;i++ )
              {
                  if(splittedDescription[i].length>maxLength)
                  {
                      splittedDescription[i]=splittedDescription[i].match(RegExp(regex, 'g')).join('\n  ');
                  }
              }

              return '  '+splittedDescription.join('\n  ')+'\n';
         });
          ctrl.$formatters.push(function (viewValue) {
                if( viewValue !== undefined )
                    return  viewValue.substring(2,viewValue.length-1).replace(/\n  /g,'\n');
                else
                    return viewValue;
          });

        }
    };
});

