
///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteCallController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService) {
    // INITIALIZATION OF FORM DATA MUST BE DONE HERE
    var marks = [];
    var highlightPseudoCall = $scope.microtask.pseudoName;
    var changeTimeout;
    var readOnlyDone = false;

    //load the callee function
    $scope.calleeFunction = new FunctionFactory(functionsService.get($scope.microtask.calleeID));


    if(angular.isDefined($scope.microtask.reissuedFrom))
        $scope.funct = (new FunctionFactory ($scope.reissuedMicrotask.submission));

    //remove the pseudofunction from the code of the function
    $scope.funct.removePseudoFunction( $scope.microtask.pseudoName );


    $scope.code = $scope.funct.getFullCode();

    $scope.codemirrorLoaded = function(myCodeMirror) {
        codemirror = myCodeMirror;
        codemirror.setOption('autofocus', true);
        codemirror.setOption('indentUnit', 4);
        codemirror.setOption('indentWithTabs', true);
        codemirror.setOption('lineNumbers', true);
        codemirror.setSize(null, 600);
        codemirror.setOption("theme", "custom-editor");
        functionsService.highlightPseudoSegments(codemirror, marks, highlightPseudoCall);
        // Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
        // changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
        // typing).
        codemirror.on("change", function() {
            // If we are editing a function that is a client request and starts with CR, make the header
            // readonly.
            if (!readOnlyDone && $scope.funct.readOnly) {
                functionsService.makeHeaderAndParameterReadOnly(codemirror);
                readOnlyDone = true;
            }
            // Mangage code change timeout
            clearTimeout(changeTimeout);
            changeTimeout = setTimeout(function() {
                functionsService.highlightPseudoSegments(codemirror, marks, highlightPseudoCall);
            }, 500);
        });
    };
    
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        var error = "";
        var  text = codemirror.getValue();
        var hasPseudosegment = text.search('//!') !== -1 || text.search('//#') !== -1;

        //if there are error and pseudosegments
        if ( microtaskForm.$invalid){
            $alert({
               title: 'Error!',
               content: 'Fix all errors before submit, if you don\'t know how use the pseudocode',
               type: 'danger',
               show: true,
               duration: 3,
               template: '/html/templates/alert/alert_submit.html',
               container: 'alertcontainer'
            });
        }
        else {
            //     description: functionParsed.description,
            //     header: functionParsed.header,
            //     name: functionName,
            //     code: body,
            //     returnType: functionParsed.returnType,
            //     paramNames: functionParsed.paramNames,
            //     paramTypes: functionParsed.paramTypes,
            //     paramDescriptions: functionParsed.paramDescriptions,
            //     calleeIds: calleeIds

            formData = functionsService.parseFunction(codemirror);
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);