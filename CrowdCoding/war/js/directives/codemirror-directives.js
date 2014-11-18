
myApp.directive('codeMirrorReadonly',function($compile,functionsService) {
    return {
        restrict: 'EA',

        template:'<div ui-codemirror="{ onLoad : codemirrorLoaded }" ng-model="code" ></div>',
        scope: {
            code: '=',
            reverse: '='
        },
        controller: function($scope,$element){
        	$scope.codemirrorLoaded = function(codeMirror){

        		codeMirror.setOption("readOnly", "true");

                if( $scope.hasOwnProperty('reverse') && $scope.reverse )
                  codeMirror.setOption("theme", "custom-reverse");
                else 
        		  codeMirror.setOption("theme", "custom");

        		codeMirror.setOption("tabindex", "-1");
        		codeMirror.setSize(null,'auto');

               /* $scope.$watch( 'code' ,function(newValue, oldValue) { 
                    functionsService.highlightPseudoSegments(codeMirror,[],false);
                });*/
                   
           	};
        }
    };
});
