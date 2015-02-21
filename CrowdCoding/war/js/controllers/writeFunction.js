
///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteFunctionController', ['$scope', '$rootScope', '$firebase',  'functionsService','FunctionFactory', 'ADTService', '$alert', function($scope, $rootScope, $firebase,  functionsService, FunctionFactory, ADTService, $alert) {
    
    var marks = [];
    var highlightPseudoCall = false;
    var readOnlyDone = false;
    var changeTimeout;

    if ($scope.microtask.promptType == 'DESCRIPTION_CHANGE') {
        var oldCode = $scope.microtask.oldFullDescription.split("\n");
        var newCode = $scope.microtask.newFullDescription.split("\n");
        var diffRes = diff(oldCode, newCode);
        var diffCode = "";
        angular.forEach(diffRes, function(diffRow) {
            if (diffRow[0] == "=") {
                diffCode += diffRow[1].join("\n");
            } else {
                for (var i = 0; i < diffRow[1].length; i++)
                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
            }
            diffCode += "\n";
        });
        $scope.diffCode = diffCode;
    }

    // INITIALIZATION OF FORM DATA MUST BE DONE HERE
    if( angular.isDefined($scope.microtask.reissuedFrom) )
            $scope.code = (new FunctionFactory($scope.reissuedMicrotask.submission)).getFullCode();
        else
            $scope.code = $scope.funct.getFullCode();

    var codemirror;

    var codemirrorChangeListener = function() {
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
    };

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
        codemirror.on("change", codemirrorChangeListener);
    };
    

    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        var error = "";
        var text= codemirror.getValue();
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
            //add the dispute text to the submit
            if($scope.microtask.promptType==='RE_EDIT')
                formData.disputeText=$scope.microtask.disputeText;
            console.log(formData);
           $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
        codemirror.off("change", codemirrorChangeListener);
    });
}]);