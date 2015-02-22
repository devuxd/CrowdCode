angular
    .module('crowdCode')
    .directive('functionEditor', functionEditor); 

function functionEditor($sce,functionsService) {

    var marks = [];
    var highlightPseudoCall = false;
    var readOnlyDone = false;
    var readOnly = false;
    var changeTimeout;


    return {
        restrict: 'E',
        scope: {
            codemirror : '=',
            code       : '=',
            funct      : '=',
        },
        templateUrl: '/html/templates/ui/function_editor.html',
        controller: function($scope,$element){

            readOnly = $scope.funct.readOnly;

        	$scope.trustHtml = function (unsafeHtml){
        		return $sce.trustAsHtml(unsafeHtml);
        	};

            $scope.codemirrorLoaded = function(codemirror) {
                codemirror.setOption('autofocus', true);
                codemirror.setOption('indentUnit', 4);
                codemirror.setOption('indentWithTabs', true);
                codemirror.setOption('lineNumbers', true);
                codemirror.setSize(null, 600);
                codemirror.setOption("theme", "custom-editor");
                codemirror.on("change", changeListener);
                $scope.codemirror = codemirror;
                
                $scope.$emit('codemirror',codemirror);
            };


            $scope.$on('$destroy',function(){
                $scope.codemirror.off("change", changeListener);
            });
        }
    };


    function changeListener(codemirror) {
        // If we are editing a function that is a client request and starts with CR, make the header
        // readonly.
        if ( readOnly && !readOnlyDone) {
            functionsService.makeHeaderAndParameterReadOnly(codemirror);
            readOnlyDone = true;
        }
        // Mangage code change timeout
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(function() {
            functionsService.highlightPseudoSegments(codemirror, marks, highlightPseudoCall);
        }, 500);
    };
};