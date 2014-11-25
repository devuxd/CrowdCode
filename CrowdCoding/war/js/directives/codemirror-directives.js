
myApp.directive('codeMirrorReadonly',function($compile,functionsService) {
    return {
        restrict: 'EA',

        template:'<div ui-codemirror="{ onLoad : codemirrorLoaded }" ng-model="code" ></div>',
        scope: {
            code: '=',
            reverse: '=',
            mode:'@'
        },
        controller: function($scope,$element){
        	$scope.codemirrorLoaded = function(codeMirror){

               

        		codeMirror.setOption("readOnly", "true");

                if( $scope.hasOwnProperty('reverse') && $scope.reverse )
                  codeMirror.setOption("theme", "custom-reverse");
                else 
        		  codeMirror.setOption("theme", "custom");

               // codeMirror.setOption("lineWrapping" , true);
        		codeMirror.setOption("tabindex", "-1");
                //if a mode is defined
                if($scope.mode)
                    codeMirror.setOption("mode", $scope.mode);
                else
                    codeMirror.setOption("mode", "javascript");


        		codeMirror.setSize(null,'auto');
                codeMirror.refresh();
               // functionsService.highlightPseudoSegments(codeMirror,[],false);

                codeMirror.on("change", function(){
                    functionsService.highlightPseudoSegments(codeMirror,[],false);
                    codeMirror.refresh();
                });

                // $scope.$watch( 'code' ,function(newValue, oldValue) {
                //    functionsService.highlightPseudoSegments(codeMirror,[],false);
                // });
           	};
        }
    };
});
