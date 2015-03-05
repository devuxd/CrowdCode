
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DebugTestFailureController', ['$scope', '$timeout', '$rootScope', '$alert', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    

    $scope.tabs = {
        list: ['Test Result','Code','Console','Stubs','Previous Tests'],
        active : 0,
        select : function(selectedIndex){
            if( selectedIndex >= 0 && selectedIndex < this.list.length ){
                this.active = selectedIndex;
            }
        }
    };

    var testRunner = new TestRunnerFactory.instance();
    testRunner.setTestedFunction($scope.microtask.functionID);
    testRunner.onTestsFinish(processTestsFinish);
    
    $scope.previousTests = [];
    $scope.currentTest   = null;
    $scope.passedTests   = [];
    $scope.firstTimeRun  = true; 
    $scope.testsRunning  = false;


    $scope.stubs      = {}; // contains all the stubs used by all the tests
    $scope.callees    = {}; // contains the info of all the callee

    $scope.hidePassedTests  = false;
    $scope.runTests         = runTests;

    $scope.functionDescription = $scope.funct.getSignature();
    $scope.data = {};
    $scope.data.code = $scope.funct.getFunctionCode();
    $scope.data.editor = null;

    $scope.keepCode = false;
    $scope.toggleKeepCode = function(){ $scope.keepCode = !$scope.keepCode };


    $scope.$on('collectFormData', collectFormData );
    $scope.runTests();

    


    function processTestsFinish(data){
        $timeout(function(){

            // if on the first run all the tests pass, 
            // load a new microtask 
            $scope.testsRunning = false;

            if ($scope.firstTimeRun){
                // if all the tests passed
                // auto submit this microtask
                if( data.overallResult ){
                    $scope.$emit('collectFormData', true);
                }
                // otherwise remove the non passed tests
                // but except the first 
                else {
                    var firstFailedIn = false;
                    var allTests = [];
                    $scope.previousTests = [];
                    angular.forEach( data.tests, function( test, index){
                        if( test.passed() || $scope.currentTest == null ){
                            allTests.push( test );

                            if( !test.passed() ) {
                                $scope.currentTest = test;
                                // $scope.$watch( function(){ 
                                //     return Object.keys($scope.currentTest.debug).join('\n'); 
                                // },function(){
                                //     $scope.data.console = $scope.currentTest.getConsole();
                                // });
                            } else 
                                $scope.previousTests.push( test )
                        } 
                    });
                    console.log( 'how many previous tests: ' + $scope.previousTests.length );
                    testRunner.setTests( allTests );
                }

                $scope.firstTimeRun = false;
            } 
        },0);
    }


    function runTests(firstTime) {
        if($scope.testsRunning) return false;

        $scope.activePanel = -1;

        testRunner.setTestedFunctionCode( $scope.data.code );

        if( !$scope.firstTimeRun )
            testRunner.mergeStubs( $scope.currentTest.stubs );

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


        // TAKE THE FAILED TESTS THAT IS NOT IN DISPUTE
        var failedNonInDispute = false;
        var disputeTextEmpty    = false;
        var inDispute = false;
        var allTests = $scope.previousTests.concat($scope.currentTest);
       

        angular.forEach( allTests, function(test){
            console.log(!test.passed(),test.rec.inDispute);
            if( !test.passed() && ( test.rec.inDispute === undefined || !test.rec.inDispute )  ){
                console.log('failed non in disp');
               failedNonInDispute = true;
            } else if( test.rec.inDispute ){
                console.log('indispute');
                inDispute = true;
                if( test.rec.disputeTestText === undefined || test.rec.disputeTestText.length == 0 ){
                    disputeTextEmpty = true;
                }
            }
        });

        if( failedNonInDispute )
            errors += "Please fix all the failed tests or dispute them! \n";
        else if( disputeTextEmpty )
            errors += "Please, fill the dispute texts!";
        console.log(errors);

        if (errors === "") {
            if ( inDispute ) {
                formData = {
                    name         : $scope.dispute.test.rec.description,
                    testId       : $scope.dispute.test.rec.id,
                    description  : $scope.dispute.description
                };
            } else {
                // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
                var stubs = [];

                console.log($scope.currentTest);

                if( $scope.currentTest != null ){
                    angular.forEach( $scope.currentTest.stubs, function(stubsForFunction, functionName) {
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
                }
                

                 // create form data to send
                formData       = functionsService.parseFunctionFromAce($scope.data.editor);
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