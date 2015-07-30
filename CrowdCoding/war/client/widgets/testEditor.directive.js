
angular
    .module('crowdCode')
    .directive('testEditor', function() {

    // var chains = ['to','be','been','is','that','which','and','has','have','with','at','of','same'];
    // var methods = [ 'not','deep','any','all','a','include','ok','true','false','null','undefined','exists','empty','arguments','equal','above','least','below','most','within','instanceof','property','ownProperty','length','string','match','keys','throw','respondTo','itself','itself','satisfy','closeTo','members','change','increase','decrease'];
    
    return {
        restrict: 'EA',
        templateUrl: '/client/widgets/test_editor.html',
        scope: {
            test : '=',
            testedFunction: '=',
        },
        link: function ( $scope, $element, $attrs ) {

        },
        controller: function($scope,$element){

            $scope.errors = [];

        	$scope.aceLoaded = function(_editor) {
                
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
                   enableLiveAutocompletion: true,
                   useWorker: false
		    	};

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');

                var myCompleter = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        callback(null,[
                            {name: 'deepEqual', value: 'expect().to.deep.equal()', snippet: 'expect(${1:expression}).to.deep.equal(${2:expectedValue});',score: 1 },
                            {name: 'property', value: 'expect().to.have.property()', snippet: 'expect(${1:expression}).to.have.property(${2:propertyName});',score: 1 },
                            {name: 'length', value: 'expect().to.have.lenght()', snippet: 'expect(${1:expression}).to.have.length(${2:length});',score: 1 },
                            {name: 'exception', value: 'expect().to.throw()', snippet: 'expect(${1:expression}).to.throw(${2:error});',score: 1 }

                        ]);
                    }
                };

                _editor.on('change', onChange);

                _editor.completers = [myCompleter];
                // console.log(langTools);

                function onChange(data,editor){

                    // var defs = 'var '+Object.keys(chai.Assertion.prototype).join(',')+';';
                    var tCode = editor.getValue();
                    var code = tCode ; //+ defs;
                    var lintResult =  JSHINT(code, {latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true, expr:true});
                    
                    $scope.errors = [];
                    if( !lintResult ){
                        $scope.errors = checkForErrors(JSHINT.errors);
                        $scope.$apply();
                        console.log('errors',$scope.errors );
                        
                    }
                    else {
                        var worker = new Worker('/clientDist/test_runner/testvalidator-worker.js');
                        worker.postMessage({ 
                            'baseUrl'     : document.location.origin, 
                            'code'        : code,
                        });
                        worker.onmessage = function(message){
                            if( message.data.error )
                                $scope.errors = [message.data.error];

                            worker.terminate();
                        };
                    }
                }
			};
        }
    };
});