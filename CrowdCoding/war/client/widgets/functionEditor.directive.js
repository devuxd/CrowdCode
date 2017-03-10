var fEditor;

angular
    .module('crowdCode')
    .directive('functionEditor', [ '$sce', 'functionsService', 'functionUtils', 'Function', function($sce, functionsService, functionUtils, Function) {
   

    var MAX_NEW_STATEMENTS = 10;
    var statements = undefined;
    var initialStatements = undefined;
    var apiFunctions    = [];
    var requestedFunctions = {};

    return {
        restrict: 'EA',
        templateUrl: '/client/widgets/function_editor.html',
        scope: {
            editor : '=',
            'function' : '=', // the firebase function object extended in FunctionFactory
            logs: '=',
            callbacks: '='
        },

        controller: function($scope,$element){

            $scope.errors = '';
            $scope.code   = $scope.function.getFullCode();

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
                        editStub : $scope.callbacks['onEditStub'] 
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

            
                // editor event listeners
                _editor.on('change', onChange);
                // _editor.on('click' , onClick);
                // _editor.on('destroy',function(){});

                // element event listeners
                $element.on('focus', _editor.focus );
			};      

            function onChange(event,editor){

                if( $scope.callbacks && $scope.callbacks.onCodeChanged ){
                    $scope.callbacks.onCodeChanged.call(null);
                }
            
                var code = editor.getValue();
                var validationData = functionUtils.validate(code);   

                // the # of statements validator doesn't relly depends on the 
                // validation of the function code, so it's better to separate
                // it from the functionUtils.validate method
                if( validationData.statements ){
                    statements        = validationData.statements;
                    initialStatements = initialStatements || statements; 

                    if( statements - initialStatements > MAX_NEW_STATEMENTS ){
                        validationData.errors.push("You are not allowed to add more than "+MAX_NEW_STATEMENTS+" statements");
                    }

                    $scope.$emit('statements-updated', statements - initialStatements, MAX_NEW_STATEMENTS );
                } 

                $scope.errors = validationData.errors;
                    
                loadFunctionsList(editor, validationData.requestedFunctions);

                if ( $scope.errors.length == 0 ){
                    if( $scope.callbacks && $scope.callbacks.onFunctionParsed ){
                        $scope.callbacks.onFunctionParsed.call(null,validationData.dto, validationData.requestedFunctions);
                    }
                } 

            }

            function loadApiFunctionsList(){
                functionsService.getAll().$loaded().then(function(){
                    // first of the API functions
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
                });
            }

            function loadFunctionsList(editor,newRequestedFunctions,rewrite){
                
                // initialize with api functions
                editor.functioncompleter.functions = apiFunctions.slice();

                // after of the requested, if any
                newRequestedFunctions = newRequestedFunctions || [];
                newRequestedFunctions.map(function( requestedDto ){

                    var requested = new Function(requestedDto);

                    var paramsString = requested
                        .parameters
                        .map(function(par,idx){ 
                            return '${'+(idx+1)+':'+par.name+'}'; 
                        })
                        .join(',');

                    var functRec = { 
                        name        : requested.name, 
                        meta        : 'PSEUDO', 
                        className   : 'functions_api',
                        description : requested.getFullDescription(),
                        snippet     : requested.name + '(' + paramsString + ')'
                    };


                    editor.functioncompleter.functions.push(functRec);
                    
                    
                });
                


                
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