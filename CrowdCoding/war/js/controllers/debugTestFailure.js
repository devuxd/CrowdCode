
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DebugTestFailureController', ['$scope', '$rootScope', '$alert', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $rootScope, $alert, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    
    var testRunner = new TestRunnerFactory.instance();
    testRunner.onTestReady(processTestReady);
    testRunner.onStubsReady(processStubsReady);
    testRunner.onTestsFinish(processTestsFinish);
    
    $scope.tests = TestList.getImplementedByFunctionId($scope.microtask.functionID);

    for(var t in $scope.tests){
        $scope.tests[t] = angular.extend($scope.tests[t],new TestRunnerFactory.defaultTestItem());
    }


    $scope.passedTests      = [];
    $scope.firstTimeRun     = true; 
    $scope.testsRunning     = false; 
    $scope.stubs            = [];
    $scope.paramNames       = $scope.funct.paramNames;
    $scope.calleDescription = {};
    $scope.completed        = 0;
    $scope.total            = $scope.tests.length;
    $scope.numPassed        = 0;
    $scope.hidePassedTests  = false;
    $scope.runTests         = runTests;

    $scope.dispute = {
        active      : false,
        description : '',
        test        : null
    };

    $scope.doDispute   = doDispute;
    $scope.undoDispute = undoDispute;

    $scope.functionDescription = $scope.funct.getSignature();
    $scope.code = $scope.funct.getFunctionCode();

    $scope.codemirror = undefined;
    $scope.$on('codemirror',function($event,data){
        $scope.codemirror = data;
    });

    $scope.$on('collectFormData', collectFormData );
    $scope.runTests();

    function doDispute(test) {
        $scope.dispute = {
            active      : true,
            description : '',
            test        : test
        };
    }

    function undoDispute() {
        $scope.dispute = {
            active      : false,
            description : '',
            test        : null
        };
    }

    function processTestReady(data){

        $scope.completed = data.number+1;
        $scope.tests[data.number] = angular.extend($scope.tests[data.number],data);

        if( data.output !== undefined)
            if( data.output.result )
                $scope.numPassed ++;

        $scope.$apply();
    }

    function processStubsReady(data){
        $scope.stubs = Object.keys(data).length > 0 ? data : null;
        angular.forEach($scope.stubs, function(data, index) {

            calleeFunction = functionsService.getByName(index);
            if( $scope.stubsParamNames === undefined){
                $scope.stubsParamNames = {};
                $scope.stubsReturnType = {};
            }

            $scope.stubsParamNames[index] = calleeFunction.paramNames;
            $scope.stubsReturnType[index] = calleeFunction.returnType;

            $scope.calleDescription[index]={};
            $scope.calleDescription[index].code=calleeFunction.getSignature();
        });

        $scope.$apply();
    }

    function processTestsFinish(data){
        // if on the first run all the tests pass, 
        // load a new microtask 
        $scope.testsRunning = false;
        $scope.$apply();
        

        if ($scope.firstTimeRun){
            if(data.overallResult){
                //console.log("---- AUTO LOADING A NEW MICROTASK");
                $scope.$emit('collectFormData', true);
            }
            $scope.firstTimeRun = false;
        }
    }


    function runTests(firstTime) {
        if($scope.testsRunning) return false;

        $scope.activePanel = -1;

        var code;
        // if( $scope.codemirror === undefined) 
            // console.log('CODEMIRROR UNDEFINED');

        if( $scope.codemirror !== undefined )
            code = $scope.codemirror.getValue();

        // push a message for for running the tests
        if( testRunner.runTests($scope.microtask.functionID,code,$scope.stubs) != -1 ) {
            //set testsRunning flag
            $scope.testsRunning = true;

            var numTests = $scope.tests.length;
            
            for(var t in $scope.tests){
                $scope.tests[t] = angular.extend($scope.tests[t],TestRunnerFactory.defaultTestItem);
            }
        }

        $scope.completed = 0;
        $scope.total     = 0;
        $scope.numPassed = 0;

    }



    

    function collectFormData(event, data) {

        // CHECK IF THERE ARE FORM ERRORS
        var errors = "";

        // if a test is in dispute and the disputeText length is 0, 
        // create the error for the dispute
        if ($scope.dispute.active){
            if($scope.dispute.description.length === 0) 
                errors = "Please, insert the description of the dispute!";
        }
        // if there are no dispute in action check if 
        // all tests are passed 
        else {
            var oneTestFailed = false;
            angular.forEach($scope.tests, function(data, index) {
                if (!oneTestFailed && !data.output.result) 
                    oneTestFailed = true;
            });

            if ( oneTestFailed ) errors = "Please fix all the failing tests before submit!";
            if ( data.$invalid ) errors = "Please fix the function code before submit!";
        }

        if (errors === "") {
            if ($scope.dispute.active) {
                formData = {
                    name         : $scope.dispute.test.rec.description,
                    testId       : $scope.dispute.test.rec.id,
                    description  : $scope.dispute.description
                };
            } else {
                // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
                var stubs = [];
                angular.forEach($scope.stubs, function(stubsForFunction, functionName) {
                    var stubFunction = functionsService.getByName( functionName );
                    angular.forEach(stubsForFunction, function(stub, index) {

                        var test = TestList.search( functionName, stub.inputs );
                        if( test === null ){

                            var testCode = 'equal(' + stubFunction.name + '(';
                            var inputs = [];
                            angular.forEach( stub.inputs, function(value, key) {
                                testCode += value;
                                testCode += (key != stub.inputs.length - 1) ? ',' : '';
                                
                            });
                            testCode += '),' + stub.output + ',\'' + 'auto generated' + '\');';

                            test = {
                                description      : 'auto generated test',
                                functionVersion  : stubFunction.version,
                                code             : testCode,
                                hasSimpleTest    : true,
                                functionID       : stubFunction.id,
                                functionName     : stubFunction.name,
                                simpleTestInputs : stub.inputs,
                                simpleTestOutput : stub.output,
                              //  readOnly         : true,
                                inDispute        : false,
                                disputeTestText  : '',
                            };

                            stubs.push(test);
                        }
                    });
                });

                 // create form data to send
                formData       = functionsService.parseFunction($scope.codemirror);
                formData.stubs = stubs;

            }
            $scope.$emit('submitMicrotask', formData);

        } else {
            $alert({
                title: 'Error!',
                content: errors,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        }
    }

}]);