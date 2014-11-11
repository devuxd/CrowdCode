
myApp.directive('codeMirrorReadonly', function($compile) {
    return {
        restrict: 'EA',

        template:'<div ng-model="code" ui-codemirror="{ onLoad : codemirrorLoaded }"></div>',

        scope: {
            code: "="
        },
          controller: function($scope,$element){
        	$scope.codemirrorLoaded = function(codeMirror){

        		codeMirror.setOption("readOnly", "true");
        		codeMirror.setOption("theme", "custom");
        		codeMirror.setOption("tabindex", "-1");
        		codeMirror.setSize(null,'auto');
           	}
        }
    }
});
