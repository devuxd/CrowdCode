

angular
    .module('crowdCode')
    .directive('jsonEditor', ['$q','AdtUtils',function($q,AdtUtils) {
    var stringified = false;

    return {
        restrict: 'EA',

        templateUrl:'/client/widgets/json_editor.html',
        scope: {
            conf: '=jsonEditor',
            ngModel: '=',
            errors: '='
        },
        require: "ngModel",
        link: function ( $scope, iElem, iAttrs, ngModelCtrl ) {

            var initialValue;
            $scope.errors = {};
            
            ngModelCtrl.$validators.code = function(modelValue, viewValue) {
                var stringValue    = modelValue || viewValue;

                if( initialValue != stringValue )
                    ngModelCtrl.$setDirty();

                var validationData = AdtUtils.validate(stringValue,$scope.conf.type,$scope.conf.name);  
                
                if( validationData.errors.length > 0 ){
                    $scope.errors.code = validationData.errors[ 0 ];
                    return false;
                }
                else {
                    $scope.errors.code = "";
                    return true;
                }
            };
        },

        controller: function($scope,$element){
            $scope.errors = [];
        	$scope.aceLoaded = function(_editor) {

        		var options = {
                    minLines: 2,
		    	    maxLines: Infinity,
                    showLineNumbers:true
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