var fEditor;
angular
    .module('crowdCode')
    .directive('functionEditor', [ '$sce', 'functionsService', function($sce, functionsService) {
   
    var apiFunctions    = [];
    var pseudoFunctions = [];

    return {
        restrict: 'EA',
        templateUrl: '/client/widgets/function_editor.html',
        scope: {
            editor : '=',
            'function' : '=', // the firebase function object extended in FunctionFactory
            hasPseudo : '=',
            logs: '=',
            callbacks: '='
        },

        controller: function($scope,$element){


            $scope.code = $scope.function.getFullCode();

        	$scope.aceLoaded = function(_editor) {

                fEditor = _editor;
                ace.require('ace/ext/crowdcode');
                var LogInfo = ace.require("ace/ext/crowdcode/log_info").LogInfo;
                var Range = ace.require("ace/range").Range;

                $scope.editor =  _editor;

                $scope.$watch('logs',function(logs){

                    if( _editor.logInfo !== undefined )
                        _editor.logInfo.destroy();

                    if( logs === undefined ){
                        return;
                    }                    

                    new LogInfo(_editor, logs, {
                        editStub : $scope.callbacks['editStub'] 
                    });
                });

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

                loadFunctionsList(_editor);

                // editor event listeners
                _editor.on('change', onChange);
                // _editor.on('click' , onClick);
                // _editor.on('destroy',function(){});

                // element event listeners
                $element.on('focus', _editor.focus );
			};      

            function onChange(event,editor){

                if( $scope.callbacks && $scope.callbacks.codeChanged ){
                    $scope.callbacks.codeChanged.apply();
                }
                

                var code = editor.getValue();
                var ast = null;
                try{
                    ast = esprima.parse( code, {loc: true});
                } catch(exception) { /*console.log(e.stack); */ast = null; }

                if( ast !== null ){
                    if( $scope.hasPseudo !== undefined )
                        $scope.hasPseudo = code.search('//#') > -1  || ast.body.length > 1;

                    // if( $scope.function.readOnly )
                    //     makeDescriptionReadOnly(ast,editor);


                    updateFunctionsList(ast,editor);
                }
            }

            function loadFunctionsList(editor){
                // load all the snippets
                apiFunctions = [];
                functionsService.getAll().$loaded().then(function(){
                    var functs = functionsService.getAll();
                    functs.map(function( fun ){
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

                    editor.functioncompleter.functions = apiFunctions.slice();
                });
            }


            function updateFunctionsList(ast,editor){
                // build the pseudocalls list
                pseudoFunctions = [];

                // from the ast, get the list of declaration
                // jump the first (current function declaration)
                // and add the record of the pseudocalls to the
                // autocompleter list
                var firstLayer = ast.body;
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

            function makeDescriptionReadOnly(ast,editor){
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
        }
    };

}]);