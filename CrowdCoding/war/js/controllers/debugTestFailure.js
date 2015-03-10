
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DebugTestFailureController', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    

    $scope.tabs = {
        list: ['Test Result','Code','Console','Stubs','Previous Tests'],
        active : 2,
        select : function(selectedIndex){
            if( selectedIndex >= 0 && selectedIndex < this.list.length ){
                this.active = selectedIndex;
            }
        }
    };

    var autosubmit = false;
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
    $scope.data.hasPseudo = false;
    $scope.data.annotations = [];
    $scope.data.markers = [];
    $scope.data.onCalleeClick = function(calleeName){
        $scope.$broadcast('open-stubs-'+calleeName);
    };

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
                    autosubmit = true;
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
                            } else 
                                $scope.previousTests.push( test )
                        } 
                    });
                    testRunner.setTests( [$scope.currentTest].concat( $scope.previousTests ) );
                }

                $scope.firstTimeRun = false;
            } 

            

            var error = $scope.currentTest.errors;
            if( error !== undefined ){
                $scope.data.annotations = [];
                $scope.data.annotations.push({
                    row:  error.line,
                    text: 'error: '+error.message + '',
                    type: 'error'
                });
            } else {
                var annotations = [];
                var debug = $scope.currentTest.debug; 
                if( debug !== undefined ){
                    for( var l in debug ){
                        if( debug[l].line != -1 ){
                            var line = debug[l].line;
                            annotations.push( {
                                row:  debug[l].line,
                                text: debug[l].position + ': ' +debug[l].statement + '',
                                type: 'info'
                            });
                        }   
                    }
                }
                $scope.data.annotations = annotations;
            }

            $scope.data.markers = [];
            $scope.data.callees = Object.keys($scope.currentTest.stubs);
            angular.forEach( $scope.data.callees,function(cName){
                $scope.data.markers.push({ 
                    regex: cName+'[\\s]*\\([\\s\\w\\[\\]\\+\\.\\,]*\\)', 
                    token: 'ace_call' ,
                    onClick: function(){
                        $scope.$broadcast('open-stubs-'+cName);
                    }
                });
            });
            console.log('markers',$scope.data.callees,$scope.currentTest.stubs,$scope.data.markers);
            // var tokens = [];


            $scope.data.running = false;

        },0);

        

        
    }


    function runTests(firstTime) {
        if( $scope.testsRunning ) return false;

        lastRunnedCode = $scope.data.editor === null ? $scope.data.code : $scope.data.editor.getValue();
        testRunner.setTestedFunctionCode( lastRunnedCode );


        if( !$scope.firstTimeRun ){
            console.log($scope.currentTest.stubs);
            testRunner.mergeStubs( $scope.currentTest.stubs );
        }

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
        var allTests = $scope.currentTest == null ? 
                        $scope.previousTests      : 
                        $scope.previousTests.concat($scope.currentTest);
        var disputed = [];

        var hasPseudo = $scope.data.hasPseudo ;

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
                    disputed.push( test.getDisputeDTO() );
                }
            }
        });

        console.log('hasPseudo',hasPseudo);
        if( /* dispute descriptions empty */ disputeTextEmpty )
            errors += "Please, fill the dispute texts!";
        else if ( /* if other form errors */ microtaskForm.$invalid )
            errors += "Please, fix all the errors before submit."
        else if ( /* code doesn't have pseudocall or pseudocode */ !hasPseudo) {
            console.log('no pseudo', failedNonInDispute )
            if( /* at least one test failed and is not disputed */ failedNonInDispute > 0 )
                errors += "Please fix all the failed tests or dispute them!";
            else if( /* code is changed since last test run */ lastRunnedCode != $scope.data.editor.getValue() )
                errors += "The code is changed since last tests run. \n Please, run again the tests before submit.";

        } 
        

        if (errors === "") {
            var formData = {
                functionDTO   : functionsService.parseFunctionFromAce($scope.data.editor),
                stubs         : [],
                disputedTests : [],
                hasPseudo     : hasPseudo,
                autoSubmit    : autosubmit
            };
            
            if( !hasPseudo ){
                // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
                var stubs = [];
                if( $scope.currentTest != null ){
                    angular.forEach( $scope.currentTest.stubs, function(stubsForFunction, functionName) {
                        var stubFunction = functionsService.getByName( functionName );
                        angular.forEach(stubsForFunction, function(stub, index) {
                            console.log('searching for stub '+stub.inputs,stub.output);
                            if( TestList.search( functionName, stub.inputs ) === null ){
                                console.log('not found!');
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
                            } else 
                                console.log('found!');
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