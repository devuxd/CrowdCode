
angular
    .module('crowdCode')
    .directive('testEditor', ['$q',function($q) {

    // var chains = ['to','be','been','is','that','which','and','has','have','with','at','of','same'];
    // var methods = [ 'not','deep','any','all','a','include','ok','true','false','null','undefined','exists','empty','arguments','equal','above','least','below','most','within','instanceof','property','ownProperty','length','string','match','keys','throw','respondTo','itself','itself','satisfy','closeTo','members','change','increase','decrease'];
    
    return {
        restrict: 'EA',
        require: '?ngModel',
        templateUrl: '/client/widgets/test_editor.html',
        scope: {
            ngModel: '=',
            errors: '='
        },
        link: function ( $scope, element, attrs, ngModelCtrl ) {
            
            $scope.errors = {};

            // when model change, update our view (just update the div content)
            ngModelCtrl.$render = function() {
                console.log('rendering');
                // checkValidity();
            };

            ngModelCtrl.$asyncValidators.code = function(modelValue, viewValue) {
                var deferred  = $q.defer();
                var code = modelValue || viewValue;
                var lintResult =  JSHINT(code, {latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true, expr:true});
                
                if( !lintResult ){
                    $scope.errors.code = checkForErrors(JSHINT.errors)[0];
                    deferred.reject();
                }
                else {
                    var worker = new Worker('/clientDist/test_runner/testvalidator-worker.js');
                    worker.postMessage({ 
                        'baseUrl'     : document.location.origin, 
                        'code'        : code,
                    });
                    worker.onmessage = function(message){
                        if( message.data.error ){
                            $scope.errors.code = message.data.error;
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                            
                        worker.terminate();
                    };
                }

        
                return deferred.promise;
            };



            
        },
        controller: function($scope,$element){
            $scope.aceLoaded = function(_editor) {

                var options = {
                   enableLiveAutocompletion: true,
                   useWorker: false,
                   
                };

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');

                var myCompleter = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        callback(null,[
                            {name: 'expect', value: 'expect', snippet: 'expect(${0:expression})', score: 1 },
                            {name: 'to', value: 'to', snippet: 'to(${0:expression})',score: 1 },
                            {name: 'be', value: 'be', snippet: 'be(${0:expression})',score: 1 },
                            {name: 'equal', value: 'equal', snippet: 'equal(${0:expression})',score: 1 }
                        ]);
                    }
                }

                _editor.completers = [myCompleter];
            };
        	
        }
    };
}]);