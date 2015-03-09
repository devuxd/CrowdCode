
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
            editor : '=',
            annotations : '=',
            callees: '=',
            onCalleeClick: '='
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
                var markers = [];
        		var options = {};
                var sessionOptions = { useWorker: false };
                var rendererOptions = {
                    showGutter: true,
                    showFoldWidgets: false,
                    theme: '/ace/theme/twilight'
                };

                $element.on('focus',function(){_editor.focus();});

                _editor.setOptions(options);
                _editor.session.setOptions(sessionOptions);
                _editor.renderer.setOptions(rendererOptions);

                _editor.on('change',onChange);
                _editor.on('click',onClick);

                $scope.$watch('update',updateIf);
                $scope.$watch('annotations', updateAnnotations);

                function onClick(e){
                    if( $scope.callees !== undefined && $scope.callees !== null){ 
                        var editor = e.editor;
                        var pos = editor.getCursorPosition();
                        var token = editor.session.getTokenAt(pos.row, pos.column);
                        if( $scope.onCalleeClick !== undefined && $scope.callees.indexOf(token.value) > -1 ){
                            $scope.onCalleeClick.apply(null,[token.value]);
                        }
                    }
                }

                function onChange(e){
                    var ast = null
                    try{
                        var ast = esprima.parse( _editor.getValue(), {loc: true});

                        if( $scope.funct.readOnly )
                            readOnlyFunctionDescription( _editor, ast);
                        
                        highlightCallees( _editor, markers, ast);
                    } catch(e){ };
                    
                }

                function updateIf(value){
                    if( value ){
                        _editor.resize();
                        _editor.renderer.updateFull();
                        _editor.scrollPageDown();
                    }
                }

                function updateAnnotations(value){
                    if( value !== undefined ){
                        console.log('received annotations',value);
                        _editor.session.clearAnnotations( );
                        _editor.session.setAnnotations( value );
                    }
                }
                
			};

        }
    };
}]);

var Range = ace.require("ace/range").Range;

function readOnlyFunctionDescription(editor,ast){
    var intersects = function(range){ return editor.getSelectionRange().intersects(range); };
    var text = editor.getValue();
    var range = new Range( 0, 0, ast.loc.start.line, ast.loc.start.column);
    editor.keyBinding.addKeyboardHandler({
        handleKeyboard : function(data, hash, keyString, keyCode, event) {
            if (hash === -1 || (keyCode <= 40 && keyCode >= 37)) return false;
            if (intersects(range)) { return {command:"null", passEvent:false}; }
        }
    });
}

function highlightCallees( editor,markers,ast){
  
    var session = editor.session;

    // remove previous callee markers
    for( var m in markers){
        if( marker[m].type == 'callee' ){
            session.removeMarker( marker[m].id );
            markers.splice(m,1);
        }
    }

    // add news callee markers
    var callees = [];
    traverse(ast, function (node){
        if((node!=null) && (node.type === 'CallExpression') && callees.indexOf(node.callee.name) == -1)
            callees.push(node.callee.name);
    });
    console.log(callees);
            
    var conf  = { regex: true };
    for( var c in callees){
        var fName = callees[c];
        var regex = new RegExp(fName+'\((.*)\)');
        var range = editor.find(regex,conf);
        if( range !== undefined ){
            range.start = session.doc.createAnchor(range.start); 
            range.end   = session.doc.createAnchor(range.end) ;
            range.id    = session.addMarker( range, "ace_call", "text", false);
            range.type  = 'callee';
            markers.push(range);
        }
    }
}

