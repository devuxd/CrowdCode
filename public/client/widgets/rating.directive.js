
angular
    .module('crowdCode')
    .directive('rating', ['$q',function($q) {

    // var chains = ['to','be','been','is','that','which','and','has','have','with','at','of','same'];
    // var methods = [ 'not','deep','any','all','a','include','ok','true','false','null','undefined','exists','empty','arguments','equal','above','least','below','most','within','instanceof','property','ownProperty','length','string','match','keys','throw','respondTo','itself','itself','satisfy','closeTo','members','change','increase','decrease'];
    
    return {
        restrict: 'EA',
        require: 'ngModel',
        templateUrl: '/client/widgets/rating.html',
        scope: {
        },
        link: function ( $scope, iElement, iAttrs, ngModelCtrl ) {


            $scope.data = {
                mouseOn: 0,
                value : -1
            }

            ngModelCtrl.$validators.required = function(modelValue,viewValue){
                return $scope.data.value != -1 ;
            };


            var max = 5;
            $scope.rate = function(value) {
                if (value >= 0 && value <= max) {
                    ngModelCtrl.$setDirty();
                    $scope.data.value = value;
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$commitViewValue();
                }
            };
        }
    };
}]);
