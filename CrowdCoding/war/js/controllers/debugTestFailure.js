
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
    
    var lastRunnedCode = '';

    $scope.previousTests = [];
    $scope.currentTest   = null;
    $scope.passedTests   = [];
    $scope.firstTimeRun  = true; 


    $scope.stubs      = {}; // contains all the stubs used by all the tests
    $scope.callees    = {}; // contains the info of all the callee

    $scope.hidePassedTests  = false;
    $scope.runTests         = runTests;

    $scope.functionDescription = $scope.funct.getSignature();
    $scope.data = {};
    $scope.data.code = $scope.funct.getFunctionCode();
    $scope.data.editor = null;
    $scope.data.running = false;

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
                    testRunner.setTests( [$scope.currentTest].concat( $scope.previousTests ) );
                }

                $scope.firstTimeRun = false;
            } 
        },0);

        $scope.data.running = false;
    }


    function runTests(firstTime) {
        if( $scope.testsRunning ) return false;


        lastRunnedCode = $scope.data.code;
        testRunner.setTestedFunctionCode( lastRunnedCode );

        if( !$scope.firstTimeRun )
            testRunner.mergeStubs( $scope.currentTest.stubs );

        // push a message for for running the tests
        if( testRunner.runTests() != -1 ) {
            $scope.data.running = true;
            console.log('running');
        }

        $scope.completed = 0;
        $scope.total     = 0;
        $scope.numPassed = 0;

    }



    

    function collectFormData(event, microtaskForm) {

        // CHECK IF THERE ARE FORM ERRORS
        var errors = "";
        



        // TAKE THE FAILED TESTS THAT IS NOT IN DISPUTE
        var failedNonInDispute = 0;
        var disputeTextEmpty    = false;
        var inDispute = false;
        var allTests = $scope.previousTests.concat($scope.currentTest);
        var disputed = [];
        // scan the list of tests and search
        // if there are failed tests non in dispute
        // or there are disputed tests with empty dispute description
        angular.forEach( allTests, function(test){
            if( !test.passed() && ( test.rec.inDispute === undefined || !test.rec.inDispute )  ){
                failedNonInDispute++;
            } else if( test.rec.inDispute ){
                if( !disputeTextEmpty && (test.rec.disputeTestText === undefined || test.rec.disputeTestText.length == 0) ){
                    disputeTextEmpty = true;
                } else {
                    disputed.push(test.rec);
                }
            }
        });

        var parsedFunction = functionsService.parseFunctionFromAce($scope.data.editor);
        var hasPseudo = ( $scope.data.code.indexOf('//#') > -1 || parsedFunction.pseudoFunctions.length > 0) ;
        console.log( hasPseudo , $scope.data.code.indexOf('//#') > -1);
        if( /* dispute descriptions empty */ disputeTextEmpty )
            errors += "Please, fill the dispute texts!";
        else if ( /* if other form errors */ microtaskForm.$invalid )
            errors += "Please, fix all the errors before submit."
        else if ( /* code doesn't have pseudocall or pseudocode */ !hasPseudo) {
            console.log('no pseudo', failedNonInDispute )
            if( /* at least one test failed and is not disputed */ failedNonInDispute > 0 )
                errors += "Please fix all the failed tests or dispute them!";
            else if( /* code is changed since last test run */ lastRunnedCode != $scope.data.code )
                errors += "The code is changed since last tests run. \n Please, run again the tests before submit.";

        } 
        

        if (errors === "") {
            var formData = parsedFunction;

            
            if( !hasPseudo ){
                // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
                var stubs = [];
                if( $scope.currentTest != null ){
                    angular.forEach( $scope.currentTest.stubs, function(stubsForFunction, functionName) {
                        var stubFunction = functionsService.getByName( functionName );
                        angular.forEach(stubsForFunction, function(stub, index) {

                            if( TestList.search( functionName, stub.inputs ) === null ){

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
                formData.stubs = stubs;

                if ( disputed.length > 0 ) {
                    formData.disputedTests = disputed;
                } 
            }
            
            console.log(formData);
            $scope.$emit('submitMicrotask', formData);

        } else {
            $alert({
                title: 'Error!',
                content: errors,
                type: 'danger',
                show: true,
                duration: 5,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        }
    }

}]);