
myApp.directive('aceReadJson', function() {
    return {
        restrict: 'EA',
        template:'<div class="ace-editor json-reader" ui-ace="{ onLoad : aceLoaded, mode: \'javascript\', theme:\'xcode\', showGutter: false, useWrapMode : true }" readonly="true" ng-model="ngModel"></div>',
        scope: {

            ngModel: "="
        },
        require: "?ngModel",
        link: function ( scope, iElement, iAttrs, ngModel ) {

            if( ngModel.$isEmpty( scope.ngModel ) ) {
                scope.ngModel = "";
            } else if ( typeof scope.ngModel !== 'string' ){
                scope.ngModel = angular.toJson( scope.ngModel );
            } 
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
                console.log("FORMATTER",modelValue);

                if( modelValue == undefined ) modelValue = "";

                var stringValue = "";
                if ( typeof modelValue !== 'string' ){
                    console.log("insn't a string");
                    scope.ngModel = angular.toJson( modelValue );
                    stringified = true;
                } 
                else{
                    console.log("is a string");
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
                        console.log("JSON NOT WELL FORMATTED");
                    }
                else
                    jsonValue = viewValue;


                console.log("PARSER",viewValue,jsonValue);
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

                // if the passed ngModel is not a string, 
                // on each value change, update back the model
                // if( stringified ){
                //     _editor.getSession().on("change", function(){
                //         console.log("CHANGED");
                //         try {
                //             var annot = _editor.getSession().getAnnotations();
                //             if( annot.length == 0 && _editor.getValue() != "" ){
                //                 var value = _editor.getValue();
                //                 parsed = true;
                //                 $scope.ngModel = JSON.parse( value );
                //             }
                //         } catch (e) {
                //             console.log("ERROR ACE JSON EDITOR "+e.message);
                //         }

                //     });
                // }

			};
        }
    };
});
