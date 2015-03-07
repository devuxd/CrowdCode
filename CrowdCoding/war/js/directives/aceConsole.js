
angular
    .module('crowdCode')
    .directive('aceConsole', aceConsole);

function aceConsole($timeout,$compile,$filter) {
    var timeoutPromise = null;
    return {
        restrict: 'E',
        scope: { 
            logs: '=', 
            update: '='
        },
        template: '<div class="ace-editor console" ui-ace="{ onLoad : aceLoaded, mode : \'json\', theme: \'twilight\', showGutter: false, useWrapMode : true}" readonly="false" ng-model="stringOutput"></div>',
        controller: function($scope,$element){ 

            $scope.aceLoaded = function(_editor) {
    
                _editor.setOptions({
                    maxLines: Infinity
                });

                $scope.$watch('logs',function( logs ){
                    
                    if( logs !== undefined ){
                        var textLogs = '';
                        // logs = $filter('orderBy')(logs,'timestamp',false);
                        for( var l in logs ){
                            textLogs += logs[l].statement + '\n';
                        }
                        _editor.getSession().setValue( textLogs );
                        _editor.renderer.updateFull();
                        _editor.scrollPageDown();
                    }
                });

                $scope.$watch('update',function( value ){
                    if( value ){
                        _editor.resize();
                        _editor.renderer.updateFull();
                        _editor.scrollPageDown();
                    }
                });

                _editor.on('change',function(){
                    
                })
            };


            // $scope.$on('destroy',function(){ timeoutPromise.cancel(); })
        }
    };
}