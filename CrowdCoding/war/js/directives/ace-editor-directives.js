
myApp.directive('aceReadonly', function() {
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



myApp.directive('aceEditorTest', function() {
    return {
        restrict: 'EA',

        template:'<div class="ace_editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\' }" ng-model="ngModel"></div>',

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

