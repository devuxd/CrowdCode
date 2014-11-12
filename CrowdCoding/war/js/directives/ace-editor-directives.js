
myApp.directive('aceReadonly', function() {
    return {
        restrict: 'EA',

        template:'<div class="ace_editorTest" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\' }"  readonly="false" ng-model="code"></div>',

        scope: {
            code: "="
        },
          controller: function($scope,$element){
        	 console.log($scope.inputForm);
        	  console.log("directive called");
        		$scope.aceLoaded = function(_editor) {
        			_editor.setOptions({
		    	 //   maxLines: Infinity
		    	});

			 };
        }
    }
});



myApp.directive('aceEditorTest', function() {
    return {
        restrict: 'EA',

        template:'<div class="ace_editor-test" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\' }" ng-model="ngModel"></div>',

        scope: {
            ngModel: "="
        },
          controller: function($scope,$element){
        	 console.log($scope.inputForm);
        	  console.log("directive called");
        		$scope.aceLoaded = function(_editor) {
        			_editor.setOptions({
		    	 //   maxLines: Infinity
		    	});

			 };
        }
    }
});

