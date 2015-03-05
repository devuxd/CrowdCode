
angular
    .module('crowdCode')
    .directive('aceEditJs', [ '$sce', function($sce) {
    var stringified = false;

    return {
        restrict: 'EA',

        templateUrl: '/html/templates/ui/ace_edit_js.html',
        scope: {
            update : '=',
            funct  : '=',
            editor : '='
        },
        require: "ngModel",

        link: function ( scope, element, attrs, ngModel ) {
            if( ngModel == undefined ) 
                console.log("NG MODEL NOT DEFINED");

            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                scope.stringValue = ngModel.$viewValue;
            };

            // update the ngModel.$viewValue when the UI changes 
            scope.$watch('stringValue', function() {
                ngModel.$setViewValue( scope.stringValue );
            });
        },
        controller: function($scope,$element){
            $scope.trustHtml = function (unsafeHtml){
                return $sce.trustAsHtml(unsafeHtml);
            };
        	$scope.aceLoaded = function(_editor) {
                $scope.editor = _editor;

        		var options = {
		    	   // maxLines: Infinity
		    	};

                $element.on('focus',function(){
                    _editor.focus();
                });

                $scope.$watch('update',function( value ){
                    if( value ){
                        _editor.resize();
                        _editor.renderer.updateFull();
                        _editor.scrollPageDown();
                    }
                });

                // _editor.getSession().on('change', function(e) {
                //     console.log('event change:', e.data);
                    
                // });

                _editor.setOptions(options);
                _editor.session.setOptions({
                    useWorker: false
                });
                _editor.renderer.setOptions({
                    showGutter: true,
                    showFoldWidgets: false,
                    theme: '/ace/theme/twilight'
                });
                // _editor.commands.removeCommand('indent');
			};

        }
    };
}]);