
angular
    .module('crowdCode')
    .directive('aceEditJs', [ '$sce', 'functionsService', function($sce, functionsService) {
   
    var markers = [ ];
    var editor = null;
    
    return {
        restrict: 'EA',

        templateUrl: '/html/templates/ui/ace_edit_js.html',
        scope: {
            editor           : '=',
            functionData     : '=function', // the firebase function object extended in FunctionFactory
            annotations      : '=', // the array of gutter annottations
            markers          : '=', // array of { regex: '', token: '' }
            updateIf         : '=updateIf', // condition when to refresh the editor
            hasPseudo        : '='
        },

        controller: function($scope,$element){
            $scope.$on('statements-updated',function(event,numStatements){
                console.log('received statements '+numStatements);
            });
            $scope.code = $scope.functionData.getFunctionCode(); 

            $scope.trustHtml = function (unsafeHtml){
                return $sce.trustAsHtml(unsafeHtml);
            };

        	$scope.aceLoaded = function(_editor) {


                $scope.editor = editor = _editor;

                $element.on('focus',function(){_editor.focus();});

        		var options = {};
                var sessionOptions = { useWorker: false };
                var rendererOptions = {
                    showGutter: true,
                    showFoldWidgets: false
                };

                _editor.setOptions(options);
                _editor.session.setOptions(sessionOptions);
                _editor.renderer.setOptions(rendererOptions);

                _editor.on('change',onChange);
                _editor.on('click',onClick);

                // $scope.$watch('updateIf',updateIf);

                $scope.$watch('annotations', updateAnnotations);

                function onChange(e){
                    var code = _editor.getValue();
                    var ast = null
                    try{
                        var ast = esprima.parse( code, {loc: true});
                        if( $scope.hasPseudo !== undefined ) 
                            $scope.hasPseudo = code.search('//#') > -1  || ast.body.length > 1;
                        if( $scope.functionData.readOnly )
                            readOnlyFunctionDescription( ast);
                    } catch(e){ console.log(e.stack) };

                    redrawMarkers();
                }

                function onClick(e){
                    var pos = e.$pos;

                    // for each marker check if the click position
                    // is inside on one of the highlighted ranges
                    // and if defined, execute the on click action
                    for( var m in markers ){
                        var marker = markers[m];
                        if( marker.onClick !== undefined ){
                            for( var r in marker.ranges ){
                                if( marker.ranges[r].comparePoint(pos) == 0) 
                                    marker.onClick.apply(null);
                            }
                        } 
                    }
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
                        _editor.session.clearAnnotations( );
                        _editor.session.setAnnotations( value );
                    }
                }
                
			};

        }
    };

    function readOnlyFunctionDescription(ast){
        var intersects = function(range){ return editor.getSelectionRange().intersects(range); };
        
        var start = ast.body[0].body.loc.start;
        var Range = ace.require("ace/range").Range;
        var range = new Range( 0, 0, start.line-1, start.column);
        editor.keyBinding.setKeyboardHandler({
            handleKeyboard : function(editor, hash, keyString, keyCode, event) {
                // if in the readonly range, allow only arrow keys
                if (intersects(range)) { 
                    if ( ['up','down','left','right'].indexOf(keyString) > -1 ){
                        return false;
                    }
                    return {command:"null", passEvent:false}; 
                }
            }
        });
    }

    function redrawMarkers(){
        var session = editor.session;
        var Range = ace.require("ace/range").Range;
        var Search = ace.require("ace/search").Search;

        // remove all the previous markers
        var oldMarkers = session.getMarkers(false);
        for( var om in oldMarkers ){
            session.removeMarker( oldMarkers[om] );
        }

        // add the new markers

        var search = new Search();
        for( var m in markers ){
            var marker = markers[m];
            search.set({
                needle: new RegExp( marker.regex ),
                regExp: true
            });
            marker.ranges = search.findAll(session);
            for( var r in marker.ranges ){
                session.addMarker( marker.ranges[r], marker.token , "text", false);
            }
        }
    }

    /** done in validation by jshint **/
    function countStatements(ast){
        // var count = 0;
        // traverse(ast, function (node){
        //     if( node.type !== undefined ){
        //         console.log(node.type);
        //         if( node.type.search('Statement') > -1 || ['VariableDeclaration'].indexOf(node.type) > -1 )
        //             count ++;
        //     }
        // });

        // return count;
    }

}]);



// define("DynamicHighlightRules", [], function(require, exports, module) {
//     "use strict";
//     var oop = require("ace/lib/oop");
//     var JavaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
//     var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

//     var DynamicHighlightRules = function() {
       
//        var newRules = {
//             "start" : [
//                 {
//                     token: 'call', // String, Array, or Function: the CSS token to apply
//                     regex: 'segments', // String or RegExp: the regexp to match,
//                     next: 'start'
//                 }
//             ]
//         };
//         this.$rules = newRules;//new TextHighlightRules().getRules();
//         // this.addRules(newRules,'call-'); 
//     }

//     oop.inherits(DynamicHighlightRules, TextHighlightRules);
//     exports.DynamicHighlightRules = DynamicHighlightRules;
// });

