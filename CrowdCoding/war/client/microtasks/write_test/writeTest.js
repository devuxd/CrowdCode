///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestController', ['$scope', '$rootScope', '$firebase', '$filter', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $filter, $alert,  functionsService, FunctionFactory, ADTService) {
    // initialize testData
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
        //load the version of the function with witch the test cases where made
        var functionSync = functionsService.getVersion($scope.microtask.functionID,$scope.microtask.functionVersion);
            functionSync.$loaded().then(function() {
            $scope.funct = new FunctionFactory(functionSync);
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
                template: '/client/microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            // prepare the standerd jSON object
            formData = {
                functionVersion: $scope.funct.version,
                code: '',
                inDispute: false,
                disputeFunctionText :'',
                disputeTestText     : '',
                hasSimpleTest: false,
                simpleTestInputs: [],
                simpleTestOutput: ''
            };
            if( $scope.disputeTest.active ){

                formData.inDispute = true;
                formData.disputeTestText = $scope.disputeTest.text;

            } else if( $scope.disputeFunction.active ) {

                formData.inDispute = true;
                formData.disputeFunctionText = $scope.disputeFunction.text;

            } else {
                // build the test code
                var testCode = 'equal(' + $scope.funct.name + '(';
                angular.forEach($scope.testData.inputs, function(value, key) {
                    testCode += value;
                    testCode += (key != $scope.testData.inputs.length - 1) ? ',' : '';
                });
                testCode += '),' + $scope.testData.output + ',\'' + $scope.test.description + '\');';

                formData.code = testCode;
                formData.simpleTestInputs = $scope.testData.inputs;
                formData.simpleTestOutput = $scope.testData.output;

            }
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });

}]);