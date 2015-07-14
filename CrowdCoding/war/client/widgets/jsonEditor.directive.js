

angular
    .module('crowdCode')
    .directive('jsonEditor', ['AdtUtils',function(AdtUtils) {
    var stringified = false;

    return {
        restrict: 'EA',

        templateUrl:'/client/widgets/json_editor.html',
        scope: {
            type: '@',
            name: '@'
        },
        require: "ngModel",

        link: function ( scope, element, attrs, ngModel ) {
            if( ngModel == undefined ) 
                console.log("NG MODEL NOT DEFINED");
            
            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                if( ngModel.$viewValue === "") 
                    scope.stringValue = "";
                else {
                    try{
                        scope.stringValue = angular.toJson(angular.fromJson (ngModel.$viewValue),true);
                    } catch(e){
                        scope.stringValue = ngModel.$viewValue;
                    }
                }
            };

            // update the ngModel.$viewValue when the UI changes 
            scope.$watch('stringValue', function() {
                ngModel.$setViewValue( scope.stringValue );
            });

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
                _editor.on('change', onChange);
			};

            function onChange(event,editor){
                var code = editor.getValue();
                var validationData = AdtUtils.validate(code,$scope.type,$scope.name);  
                $scope.errors = validationData.errors;
            }
        }
    };
}]);