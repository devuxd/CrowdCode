var fEditor ;
angular
    .module('crowdCode')
    .directive('aceEditJs', [ '$sce', 'functionsService', 'FunctionFactory', function($sce, functionsService, FunctionFactory) {
   
    var apiFunctions    = [];
    var pseudoFunctions = [];

    var markers   = [];

    return {
        restrict: 'EA',
        templateUrl: '/client/widgets/ace_edit_js.html',
        scope: {
            editor           : '=',
            functionData     : '=function', // the firebase function object extended in FunctionFactory
            annotations      : '=', // the array of gutter annottations
            markers          : '=', // array of { regex: '', token: '' }
            updateIf         : '=updateIf', // condition when to refresh the editor
            hasPseudo        : '='
        },

        controller: function($scope,$element){


            $scope.code = $scope.functionData.getFullCode();

            $scope.trustHtml = function (unsafeHtml){
                return $sce.trustAsHtml(unsafeHtml);
            };

        	$scope.aceLoaded = function(_editor) {


                ace.require('ace/ext/crowdcode');

                $scope.editor = fEditor = _editor;
                console.log($scope.editor);


                var options = {
                    enableFunctionAutocompleter: true
                };

                var sessionOptions  = {
                    useWorker: false
                };

                var rendererOptions = {
                    showGutter: true,
                    showFoldWidgets: false
                };

                _editor.setOptions(options);
                _editor.session.setOptions(sessionOptions);
                _editor.renderer.setOptions(rendererOptions);

                // loadFunctionsList(_editor);

                // event listeners
                $element.on('focus', _editor.focus() );

                _editor.on('change', onChange);
                _editor.on('click' , onClick);

                _editor.on('destroy',function(){ console.log('destroying');});

                // watchers on the scope vars
                $scope.$watch('annotations', updateAnnotations);
                $scope.$watch('markers'    , updateMarkers);

			};




            function onChange(event,editor){

                var code = editor.getValue();
                var ast = null;
                try{
                    ast = esprima.parse( code, {loc: true});
                } catch(exception) { /*console.log(e.stack); */ast = null; }

                if( ast !== null ){
                    if( $scope.hasPseudo !== undefined )
                        $scope.hasPseudo = code.search('//#') > -1  || ast.body.length > 1;

                    if( $scope.functionData.readOnly )
                        makeDescriptionReadOnly( ast);


                    updateFunctionsList(ast,editor);
                }

                redrawMarkers(markers);
            }

            function onClick(event,editor){
                var pos = event.$pos;

                // for each marker check if the click position
                // is inside on one of the highlighted ranges
                // and if defined, execute the on click action
                for( var m in $scope.markers ){
                    var marker = $scope.markers[m];

                    if( marker.onClick !== undefined ){
                        for( var r in marker.ranges ){
                            if( marker.ranges[r].comparePoint(pos) === 0) {

                                marker.onClick.call();
                            }
                        }
                    }
                }
            }
        }
    };


    function loadFunctionsList(editor){
        // load all the snippets
        apiFunctions = [];
        functionsService.getAll().$loaded().then(function(){
            var functs = functionsService.getAll();
            
            functs.map(function( functionRecord ){
                var fun = new FunctionFactory(functionRecord);
                
                var paramsString = fun.parameters
                    .map(function(par,idx){ 
                        return '${'+(idx+1)+':'+par.name+'}'; 
                    })
                    .join(',');

                apiFunctions.push({ 
                    name        : fun.name, 
                    meta        : 'API', 
                    className   : 'functions_api',
                    description : fun.getFullDescription(),
                    snippet     : fun.name + '(' + paramsString + ')'
                });
            });

            console.log('inside load ',editor);
            editor.functioncompleter.functions = apiFunctions.slice();
        });
    }


    function updateFunctionsList(ast,editor){
        // build the pseudocalls list
        pseudoFunctions = [];
        var firstLayer      = ast.body;
        for( var f = 1; f < firstLayer.length ; f++){
            if( firstLayer[f].type == 'FunctionDeclaration' ){
                var name = firstLayer[f].id.name;

                // build the snippet parameter list in the format ${1:firstParName},${2:secondParName}
                var parString = firstLayer[f].params
                                .map(function(param,idx){
                                    return '${'+(idx+1)+':'+param.name+'}';
                                })
                                .join(',');

                // add the pseudo to the list
                pseudoFunctions.push({
                    name:    name,
                    meta:    'pseudo',
                    className: 'functions_pseudo',
                    snippet: name + '('+ parString + ')'
                });
            }
        }

        // set the functions list as the apiFunctions + pseudoFunctions
        editor.functioncompleter.functions = apiFunctions.concat(pseudoFunctions);
    }

    function updateIf(value){
        if( value ){
            editor.resize();
            editor.renderer.updateFull();
            editor.scrollPageDown();
        }
    }

    function updateAnnotations(value){
        if( value !== undefined ){
            editor.session.clearAnnotations( );
            editor.session.setAnnotations( value );
        }
    }

    function updateMarkers(value){
        if( value === undefined ) value = [];
        var pseudoMarker = {
            regex: '//#(.*)',
            token: 'ace_pseudo_code'
        };
        markers = value;
        markers.push(pseudoMarker);
        redrawMarkers(markers);
    }

    function makeDescriptionReadOnly(ast){
        if( ast.body[0] === undefined )
            return;

        var intersects = function(range){ return editor.getSelectionRange().intersects(range); };

        var start = ast.body[0].body.loc.start;
        var Range = ace.require("ace/range").Range;
        var range = new Range( 0, 0, start.line-1, start.column+1);
        editor.keyBinding.setKeyboardHandler({
            handleKeyboard : function(editor, hash, keyString, keyCode, event) {
                // if in the readonly range, allow only arrow keys
                if ( intersects(range) ) { 
                    if ( ['up','down','left','right'].indexOf(keyString) > -1 ){
                        return false;
                    }
                    return {command:"null", passEvent:false}; 
                }
            }
        });
    }

    function redrawMarkers(markers){

        var session = editor.session;
        var Range   = ace.require("ace/range").Range;
        var Search  = ace.require("ace/search").Search;

        // remove all the previous markers
        var oldMarkers = session.getMarkers(false);
        for( var om in oldMarkers ){
            session.removeMarker( oldMarkers[om].id );
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
