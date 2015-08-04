

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
                var valid = match !== null && viewValue == match[0];
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