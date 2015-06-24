
angular
    .module('crowdCode')
    .directive('testEditor', function() {
    var stringified = false;

    return {
        restrict: 'EA',

        template:'<div class="ace_editor test-editor" ui-ace="{ onLoad : aceLoaded, mode: \'javascript\', theme:\'chrome\', showGutter: true, useWrapMode : true, showLineNumbers : true }" ng-model="test.code" readonly="{{!test.editing}}" ></div>',
        scope: {
            test : '='
        },
        link: function ( $scope, $element, $attrs ) {

        },
        controller: function($scope,$element){

            $scope.test.editing = $scope.test.editing || true;
        	$scope.aceLoaded = function(_editor) {
                $scope.test.editor = _editor;

        		var options = {
		    	   maxLines: Infinity,
                   minLines: 4
		    	};
                
                $element.on('focus',function(){
                    _editor.focus();
                });

                if( $scope.hasOwnProperty('tabindex') && $scope.tabindex ){
                    $element.find('.ace_text-input').attr('tabindex', $scope.tabindex);
                }

                // _editor.getSession().on('change', function(e) {
                //     console.log('event change:', e.data);
                    
                // });


                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');
			};
        }
    };
});