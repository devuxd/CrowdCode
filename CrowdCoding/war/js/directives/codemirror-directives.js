
myApp.directive('codeMirrorReadonly',function($compile,functionsService) {
    return {
        restrict: 'EA',

        template:'<div ui-codemirror="{ onLoad : codemirrorLoaded }"></div>',
        scope: {
            code: "="
        },
          controller: function($scope,$element){
           	$scope.codemirrorLoaded = function(codeMirror){

        		codeMirror.setOption("readOnly", "true");
        		codeMirror.setOption("theme", "custom");
        		codeMirror.setOption("tabindex", "-1");
        		codeMirror.setSize(null,'auto');
                //Changed from  //ng-model="code" to  codeMirror.setValue($scope.code); to do the hilighting

                codeMirror.setValue($scope.code);
                functionsService.highlightPseudoSegments(codeMirror,[],false);
           	};
        }
    };
});
