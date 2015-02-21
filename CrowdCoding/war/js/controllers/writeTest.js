///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestController', ['$scope', '$rootScope', '$firebase', '$filter', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $filter, $alert,  functionsService, FunctionFactory, ADTService) {
    // initialize testData


    // if microtask.submission and microtask.submission.simpleTestInputs are defined
    // assign test inputs and output to testData, otherwise initialize an empty object
    if( angular.isDefined($scope.test.simpleTestInputs) && angular.isDefined($scope.test.simpleTestOutput) ){

        $scope.testData = {
            inputs: $scope.test.simpleTestInputs,
            output: $scope.test.simpleTestOutput
        } ;

    } else {
        $scope.testData = {
            inputs: [],
            output: ''
        };

    }


    if( angular.isDefined($scope.microtask.reissuedFrom) && angular.isDefined($scope.reissuedMicrotask.submission.simpleTestInputs) ){
        $scope.testData.inputs=$scope.reissuedMicrotask.submission.simpleTestInputs;
        $scope.testData.output=$scope.reissuedMicrotask.submission.simpleTestOutput;
    }

    // scope data 
    $scope.disputeFunction = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.disputeTest.text = '';
            $scope.disputeTest.active = false;
            $scope.disputeFunction.active = ! $scope.disputeFunction.active;
            if( $scope.disputeFunction.active )
                $scope.disputeFunction.text = '';

        }
    };
    // scope data
    $scope.disputeTest = {
        active : false,
        text   : '',
        toggle : function(){

            $scope.disputeFunction.text='';
            $scope.disputeFunction.active= false;
            $scope.disputeTest.active = ! $scope.disputeTest.active;
            if( $scope.disputeTest.active )
                $scope.disputeTest.text = '';
        }
    };

    // IF THE PROMPT TYPE IS FUNCTION CHANGED, CALC THE DIFF TO SHOW WITH CODEMIRROR
    if ($scope.microtask.promptType == 'FUNCTION_CHANGED') {
        var oldCode = $scope.microtask.oldFunctionDescription.split("\n");
        var newCode = $scope.microtask.newFunctionDescription.split("\n");
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
    // LOAD THE VERSION OF THE FUNCTION WHEN THE MICROTASK HAS BEEN SPAWNED
    else {
        $scope.code = "";
        //load the version of the function with witch the test cases where made
        var functionVersionSync = {};
        if ($scope.microtask.functionVersion === 0) functionVersionSync = $firebase(new Firebase($rootScope.firebaseURL + '/history/artifacts/functions/' + $scope.microtask.functionID + '/1'));
        else functionVersionSync = $firebase(new Firebase($rootScope.firebaseURL + '/history/artifacts/functions/' + $scope.microtask.functionID + '/' + $scope.microtask.functionVersion));
        $scope.funct = functionVersionSync.$asObject();
        $scope.funct.$loaded().then(function() {
            $scope.code = (new FunctionFactory($scope.funct)).getSignature();
        });
    }

    var alertObj = null; // initialize alert obj
    
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        
        $scope.makeDirty(microtaskForm);

        if (microtaskForm.$invalid) {
            if (alertObj !== null) alertObj.destroy(); // avoid multiple alerts
            var error = 'Fix all errors before submit';
            alertObj = $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            if( $scope.disputeTest.active ){
                // return jSON object
                formData = {
                    functionVersion: $scope.funct.version,
                    code: '',
                    inDispute: true,
                    disputeFunctionText : '',
                    disputeTestText     : $scope.disputeTest.text,
                    hasSimpleTest: true,
                    simpleTestInputs: [],
                    simpleTestOutput: ''
                };
            } else if( $scope.disputeFunction.active ) {
                // return jSON object
                formData = {
                    functionVersion: $scope.funct.version,
                    code: '',
                    inDispute: true,
                    disputeFunctionText : $scope.disputeFunction.text,
                    disputeTestText     : '',
                    hasSimpleTest: true,
                    simpleTestInputs: [],
                    simpleTestOutput: ''
                };
            } else {
                // build the test code
                var testCode = 'equal(' + $scope.funct.name + '(';
                angular.forEach($scope.testData.inputs, function(value, key) {
                    testCode += value;
                    testCode += (key != $scope.testData.inputs.length - 1) ? ',' : '';
                });
                testCode += '),' + $scope.testData.output + ',\'' + $scope.test.description + '\');';
                formData = {
                    functionVersion: $scope.funct.version,
                    code: testCode,
                    hasSimpleTest: true,
                    inDispute: false,
                    disputeFunctionText : '',
                    disputeTestText     : '',
                    simpleTestInputs: $scope.testData.inputs,
                    simpleTestOutput: $scope.testData.output
                };
            }
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });

}]);