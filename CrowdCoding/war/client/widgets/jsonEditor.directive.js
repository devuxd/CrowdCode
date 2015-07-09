

angular
    .module('crowdCode')
    .directive('jsonEditor', function() {
    var stringified = false;

    return {
        restrict: 'EA',

        template:'<div class="ace_editor json-editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\', showGutter: true, useWrapMode : true, showLineNumbers : false }" ng-model="stringValue" ></div> ',
        scope: {
            dataType : "@"
        },
        require: "ngModel",

        link: function ( scope, element, attrs, ngModel ) {
            if( ngModel == undefined ) 
                console.log("NG MODEL NOT DEFINED");
            scope.stringValue = 4;

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

        	$scope.aceLoaded = function(_editor) {

        		var options = {
		    	   maxLines: Infinity
		    	};
                
                $element.on('focus',function(){
                    _editor.focus();
                });

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');
			};
        }
    };
});