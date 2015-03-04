
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DebugTestFailureController', ['$scope', '$rootScope', '$alert', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $rootScope, $alert, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    
    var testRunner = new TestRunnerFactory.instance();
    testRunner.setTestedFunction($scope.microtask.functionID);
    testRunner.onTestsFinish(processTestsFinish);
    
    $scope.tests = [];

    for(var t in $scope.tests){
        $scope.tests[t] = angular.extend($scope.tests[t],new TestRunnerFactory.defaultTestItem());
    }


    $scope.passedTests      = [];
    $scope.firstTimeRun     = true; 
    $scope.testsRunning     = false;

    $scope.stubs      = {}; // contains all the stubs used by all the tests
    $scope.callees    = {}; // contains the info of all the callee

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


    function processTestsFinish(data){
        // if on the first run all the tests pass, 
        // load a new microtask 
        $scope.testsRunning = false;

        if ($scope.firstTimeRun){
            // if all the tests passed
            // auto submit this microtask
            console.log(data);
            if( data.overallResult ){
                $scope.$emit('collectFormData', true);
            }
            // otherwise remove the non passed tests
            // but except the first 
            else {
                var firstFailedIn = false;
                angular.forEach( data.tests, function( test, index){
                    console.log('filtering: ',test,test.passed());
                    if( test.passed() || !firstFailedIn ){

                        $scope.tests.push( test );
                        processTestFinish(test);

                        if( !test.passed() ) firstFailedIn = true;
                    } 
                });
                testRunner.setTests($scope.tests);
            }

            $scope.firstTimeRun = false;
        } 

        $scope.$apply();
    }


    function processTestFinish(data){

        $scope.completed = data.number+1;
        $scope.tests[data.number] = angular.extend($scope.tests[data.number],data);

        if( data.stubs !== undefined ){
            angular.forEach( data.stubs, function( fStubs, fName ) {
                // retrieve the callee info
                if( $scope.callees[fName] == undefined ){
                    var calleeFun = functionsService.getByName(fName);
                    $scope.callees[fName] = {
                        inputs      : calleeFun.getParamNames(),
                        returnType  : calleeFun.returnType,
                        signature   : calleeFun.getSignature()
                    };
                    console.log( $scope.callees[fName]);
                }
                // merge this stubs into all the used stubs
                if( $scope.stubs[fName] === undefined ) $scope.stubs[fName] = {};
                angular.forEach( fStubs, function( stub, key ){
                    $scope.stubs[fName][key] = stub;
                });

            });
        }

        if( data.output !== undefined)
            if( data.output.result )
                $scope.numPassed ++;

        $scope.$apply();
    }


    function runTests(firstTime) {
        if($scope.testsRunning) return false;

        $scope.activePanel = -1;

        if( $scope.codemirror !== undefined ){
            testRunner.setTestedFunctionCode( $scope.codemirror.getValue() );
        }

        testRunner.mergeStubs( $scope.stubs );

        // push a message for for running the tests
        if( testRunner.runTests() != -1 ) {
            $scope.testsRunning = true;
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