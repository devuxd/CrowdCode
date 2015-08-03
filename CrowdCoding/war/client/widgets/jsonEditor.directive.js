

angular
    .module('crowdCode')
    .directive('jsonEditor', ['$q','AdtUtils',function($q,AdtUtils) {
    var stringified = false;

    return {
        restrict: 'EA',

        templateUrl:'/client/widgets/json_editor.html',
        scope: {
            type: '@',
            name: '@',
            errors: '='
        },
        require: "ngModel",

        link: function ( $scope, iElem, iAttrs, ngModelCtrl ) {

            $scope.errors = {};
            $scope.conf = iAttrs.jsonEditor;
            
            // update the UI to reflect the ngModel.$viewValue changes
            ngModelCtrl.$render = function (){
                console.log('rendering',ngModelCtrl.$viewValue,ngModelCtrl.$modelValue);
                
                if( ngModelCtrl.$viewValue === "") 
                    $scope.stringValue = "";
                else {
                    try{
                        $scope.stringValue = angular.toJson(angular.fromJson (ngModelCtrl.$viewValue),true);
                    } catch(e){
                        $scope.stringValue = ngModelCtrl.$viewValue;
                    }
                }
            };

            ngModelCtrl.$asyncValidators.code = function(modelValue, viewValue) {
                console.log('validating');

                var deferred  = $q.defer();
                
                var code      = modelValue || viewValue;

                var validationData = AdtUtils.validate(code,conf.type,conf.name);  
                
                if( validationData.errors.length > 0 ){
                    $scope.errors.code = validationData.errors[0];
                    deferred.reject();
                }
                else {
                    deferred.resolve();
                }

                return deferred.promise;
            };
        },

        controller: function($scope,$element){
            $scope.errors = [];
        	$scope.aceLoaded = function(_editor) {

        		var options = {
		    	   maxLines: Infinity
		    	};
                
                $element.on('focus',function(){
                    _editor.focus();
                });

                _editor.setOptions(options);
                _editor.session.setOptions({useWorker: false});
                _editor.commands.removeCommand('indent');
			};

        }
    };
}]);