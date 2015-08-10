angular
    .module('crowdCode')
    .directive('jsReader',function($compile,functionsService) {

    function calculateDiff(oldCode,newCode){

        oldCode = oldCode.split('\n');
        newCode = newCode.split('\n');

        var diffRes = diff(oldCode, newCode);
        var diffCode = "";
        angular.forEach(diffRes, function(diffRow) {
            if (diffRow[0] == "=") {
                diffCode += diffRow[1].join("\n");
            } else {
                for (var i = 0; i < diffRow[1].length; i++)
                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
            }
            diffCode += "\n";
        });
        return diffCode;
    }

    return {
        restrict: 'EA',
        replace: true,
        template: '<div class="ace-editor js-reader" ui-ace="{ onLoad : aceLoaded, mode : mode, theme: theme, showGutter: false, useWrapMode : true}" readonly="true" ng-model="code"></div>',
        scope: {
            code: '=',
            oldCode: '=',
            mode: '@',
            highlight: '=',
        },
        controller: function($scope,$element){ 
            
            if($scope.mode===undefined){
                $scope.mode='javascript';
                $scope.theme='xcode';
            }
            else
                $scope.theme='github';   


            console.log($scope.mode,$scope.oldCode);
            if( $scope.mode == 'diff' && $scope.oldCode != undefined ){
                $scope.code = calculateDiff($scope.oldCode,$scope.code);
            }

            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity,
                    useWorker:false
                });
                var marker = [];
                _editor.on('change',function(){
                    if( $scope.highlight !== undefined ){
                        angular.forEach($scope.highlight,function(val){
                            if( marker[val.needle] !== undefined ){
                                _editor.getSession().removeMarker(marker[val.needle]);
                                marker[val.needle] == undefined;
                            }
                            var Range = ace.require("ace/range").Range;

                            var conf   = { regex: val.regex || false };
                            var needle = conf.regex ? new RegExp(val.needle) : val.needle;
                            var range = _editor.find(needle,conf);
                           // console.log('Needle',val.needle,range);
                            if( range !== undefined ){
                                marker[val.needle] = _editor.getSession().addMarker(range,'ace_pseudo_call','text',true);
                                // console.log('added marker for  '+val.needle, range, marker);
                               // console.log(_editor.getSession().getMarkers());
                            }
                            
                        });
                    }
                });
                
            };
        }
    };
});
