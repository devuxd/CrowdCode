
myApp.directive('aceReadJson', function() {
    return {
        restrict: 'EA',
        template:'<div class="ace-editor" ui-ace="{ onLoad : aceLoaded, mode: \'javascript\', theme:\'xcode\', showGutter: false }" readonly="true" ng-model="ngModel"></div>',
        scope: {
            ngModel: "="
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
    return {
        restrict: 'EA',

        template:'<div class="ace_editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\', showGutter: false }" ng-model="ngModel"></div>',

        scope: {
            ngModel: "=",
            focusAce: "=",
            minLines: "="
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
    }
});

