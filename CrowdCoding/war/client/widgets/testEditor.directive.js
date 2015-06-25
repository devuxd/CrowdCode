var editor ;
angular
    .module('crowdCode')
    .directive('testEditor', function() {


    return {
        restrict: 'EA',
        replace:true,
        template:'<div class="ace_editor test-editor" ui-ace="{ onLoad : aceLoaded, mode: \'javascript\', theme:\'chrome\', showGutter: true, useWrapMode : true, showLineNumbers : true }" ng-model="test.code" readonly="{{!test.editing}}" ></div>',
        scope: {
            test : '='
        },
        link: function ( $scope, $element, $attrs ) {

        },
        controller: function($scope,$element){


        	$scope.aceLoaded = function(_editor) {
                editor = _editor;
                $scope.test.editor = _editor;
                $scope.$watch('test.editing',function(newValue,oldValue){
                    if ( newValue ) {
                        _editor.renderer.setShowGutter(true);
                        _editor.setReadOnly(false);
                    } else {
                        _editor.renderer.setShowGutter(false);
                        _editor.setReadOnly(true);
                    }
                });

        		var options = {
		    	   maxLines: Infinity,
                   minLines: 4,
                   enableLiveAutocompletion: true,
		    	};

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');

                var myCompleter = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        console.log(pos,prefix);
                        callback(null,[
                            {name: 'expect', value: 'expect', snippet: 'expect(${0:expression})', score: 1 },
                            {name: 'to', value: 'to', snippet: 'to(${0:expression})',score: 1 },
                            {name: 'be', value: 'be', snippet: 'be(${0:expression})',score: 1 },
                            {name: 'equal', value: 'equal', snippet: 'equal(${0:expression})',score: 1 }
                        ]);
                    }
                }
                _editor.completers = [myCompleter];
                // console.log(langTools);
			};
        }
    };
});