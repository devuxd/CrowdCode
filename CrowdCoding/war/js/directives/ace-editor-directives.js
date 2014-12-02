
myApp.directive('aceReadJson', function() {
    return {
        restrict: 'EA',
        template:'<div class="ace-editor json-reader" ui-ace="{ onLoad : aceLoaded, mode: \'javascript\', theme:\'xcode\', showGutter: false, useWrapMode : true }" readonly="true" ng-model="aceModel"></div>',
        require: "ngModel",
        scope: true,
        link: function ( scope, iElement, iAttrs, ngModel ) {
            if( !ngModel ) return;
        
            // convert the json object into a string
            ngModel.$formatters.push(function( modelValue ) {
                
                if ( typeof modelValue !== 'string' )
                    return  angular.toJson( modelValue );
                
                return modelValue;
            });
            

            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                scope.aceModel = ngModel.$viewValue;
            };
        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {
        		_editor.setOptions({
		    	     maxLines: Infinity
		    	});
			};
        }
    };
});


myApp.directive('aceEditJson', function() {
    var stringified = false;

    return {
        restrict: 'EA',

        template:'<div class="ace_editor json-editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\', showGutter: true, useWrapMode : true, showLineNumbers : false }" ng-model="stringValue"></div>',

        scope: {
            focusAce : "=",
            minLines : "="
        },
        require: "ngModel",

        link: function ( scope, iElement, iAttrs, ngModel ) {
            if( !ngModel ) console.log("NG MODEL NOT DEFINED");

            // JSON -> formatter -> string

            // convert the json object into a string
            ngModel.$formatters.push(function( modelValue ) {
                if( modelValue == undefined ) modelValue = "";

                var stringValue = "";
                if ( typeof modelValue !== 'string' ){

                    stringValue = angular.toJson( modelValue );
                    stringified = true;
                } 
                else{
                    stringValue = modelValue;
                }

                return stringValue;
            });

            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                scope.stringValue = ngModel.$viewValue;
            };

            // string -> parser -> JSON

            // convert the string into a JSON
            ngModel.$parsers.push(function( viewValue ) {

                var jsonValue = "";

                if( stringified )
                    try {
                        jsonValue = angular.fromJson(viewValue) ;
                    } catch (e) {
                        jsonValue = ngModel.$viewValue ;
                    }
                else
                    jsonValue = viewValue;

                return jsonValue;
            });

            // update the ngModel.$viewValue when the UI changes 
            scope.$watch('stringValue', function() {
                ngModel.$setViewValue( scope.stringValue );
            });

        },
        controller: function($scope,$element){



        	$scope.aceLoaded = function(_editor) {
        		_editor.setOptions({
		    	   maxLines: Infinity
		    	});
                
                if( $scope.hasOwnProperty('focusAce') && $scope.focusAce ){
                    _editor.focus();
                }

                if( $scope.hasOwnProperty('minLines') && $scope.minLines ){
                   _editor.setOptions({
                       minLines: $scope.minLines
                    });
                }
			};
        }
    };
});
