
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
                scope.ngModel = "empty";
            } else if ( typeof scope.ngModel !== 'string' ){
                scope.ngModel = JSON.stringify( scope.ngModel );
            } 
        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {
        		_editor.setOptions({
		    	     maxLines: Infinity
		    	});
			 };
        }
    }
});


myApp.directive('aceEditJson', function() {
    var stringified = false;
    var parsing     = false;

    return {
        restrict: 'EA',

        template:'<div class="ace_editor json-editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\', showGutter: true, useWrapMode : true, showLineNumbers : false }" ng-model="ngModel"></div>',

        scope: {
            ngModel    : "=",

            focusAce : "=",
            minLines : "="
        },
        require: "?ngModel",
        link: function ( scope, iElement, iAttrs, ngModel ) {

            if( ngModel.$isEmpty( scope.ngModel ) ) {
                scope.ngModel = "empty";
            } else if ( typeof scope.ngModel !== 'string' ){
                scope.ngModel = JSON.stringify( scope.ngModel , null, "\t");
            } 
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
    }
});

