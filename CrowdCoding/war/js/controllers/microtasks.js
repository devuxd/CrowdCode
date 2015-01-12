///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
myApp.controller('NoMicrotaskController', ['$scope', '$rootScope', '$firebase', 'testsService', 'functionsService', 'ADTService', '$interval', function($scope, $rootScope, $firebase, testsService, functionsService, ADTService, $interval) {
    //$interval(function(){ $scope.$emit('load')}, 2000);
}]);

//////////////////////////////////
//  WRITE TEST CASES CONTROLLER //
//////////////////////////////////
myApp.controller('WriteTestCasesController', ['$scope', '$rootScope', '$firebase', '$alert', 'testsService', 'TestList', 'functionsService', 'ADTService', function($scope, $rootScope, $firebase, $alert, testsService, TestList, functionsService, ADTService) {
    

    // private variables
    var alert = null;

    //if a function starts with CR cannot be disputed
    $scope.canBeDisputed=true;
    if( $scope.funct.readOnly)
        $scope.canBeDisputed=false;

    // scope variables 
    $scope.model = {};
    $scope.model.newTestcase = "";
    $scope.model.testcases   = TestList.getTestCasesByFunctionId($scope.funct.id);
    $scope.dispute = false;
    $scope.disputeText = "";

    if(angular.isDefined($scope.microtask.reissuedFrom)){
        if($scope.microtask.promptType=='FUNCTION_SIGNATURE')
            $scope.testCases=$scope.reissuedMicrotask.submission.testCases;
    }

    $scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;

    // addTestCase action 
    $scope.addTestCase = function() {
        // push the new test case and set the flag added to TRUE
        var testCase = $scope.model.newTestcase.replace(/["']/g, "");

        if ( testCase !== "") {
            var exists = false;
            angular.forEach($scope.model.testcases,function(value,index){
                if( !exists && value.text == testCase )
                    exists = true;
            });

            if( !exists ){
                 // push the new test cases
                $scope.model.testcases.push({
                    id      : null,
                    text    : testCase,
                    added   : true,
                    deleted : false
                });
            }
           
            // reset the new test case field
            $scope.model.newTestcase = "";
        }
    };

    //deleteTestCase actions
    $scope.removeTestCase = function(index) {
        // if the testcase was added during this microtask, remove it from the array
        if ($scope.model.testcases[index].added === true) 
            $scope.model.testcases.splice(index, 1);
        
        // else set the flag DELETED to true
        else $scope.model.testcases[index].deleted = true;
    };

    $scope.toggleDispute = function() {
        $scope.dispute = !$scope.dispute;
        if (!$scope.dispute) $scope.disputeText = "";
    };

    // collect form data
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

        // do validation
        angular.forEach(microtaskForm, function(formElement, fieldName) {
            // If the fieldname doesn't start with a '$' sign, it means it's form
            if (fieldName[0] !== '$') {
                    if(angular.isFunction(formElement.$setDirty))
                        formElement.$setDirty();
            }
            //if formElement as the proprety $addControl means that have other form inside him
            if (formElement !== undefined && formElement.$addControl) {
                angular.forEach(formElement, function(formElement, fieldName) {
                    // If the fieldname starts with a '$' sign, it means it's an Angular
                    // property or function. Skip those items.
                    if (fieldName[0] !== '$') {
                        if(angular.isFunction(formElement.$setDirty))
                            formElement.$setDirty();
                    }
                });
            }
        });


        // initialize the error
        var error = "";
        // if the new test case field is not empty,
        // add as a new test case
     
        if (microtaskForm.$invalid)  
            error = "Fix all the errors before submit";

        if (!$scope.dispute && $scope.model.testcases.length == 0 && $scope.model.newTestcase == "") 
            error = "Add at least 1 test case";

        // if there is an error 
        if (error !== "") {
            // destroy the previous alert
            if (alert !== null) alert.destroy();
            // build the new alert
            alert = $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        } 


        // if there isn't an error submit the form
        else {
            if($scope.dispute){
                // prepare form data for submission
                formData = {
                    isFunctionDispute : $scope.dispute,
                    disputeText :       $scope.disputeText,
                    functionVersion : $scope.funct.version
                    
                    };
            }
            else{

                if($scope.model.newTestcase != "")
                    $scope.addTestCase();

                // prepare form data for submission
                formData = {
                        testCases       : $scope.model.testcases,
                        functionVersion : $scope.funct.version,
                };
            }
        
            // call microtask submission
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });

}]);


///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
myApp.controller('ReviewController', ['$scope', '$rootScope', '$firebase', '$alert', 'testsService', 'functionsService', 'ADTService', 'microtasksService', function($scope, $rootScope, $firebase, $alert, testsService, functionsService, ADTService, microtasksService) {
    // scope variables
    $scope.review = {};
    $scope.review.reviewText = "";
    $scope.review.functionCode = "";

    // private variables 
    var oldCode;
    var newCode;
    var diffRes;
    var diffCode;

    //load the microtask to review
    $scope.review.microtask = microtasksService.get($scope.microtask.microtaskKeyUnderReview);
    $scope.review.microtask.$loaded().then(function() {

        if ($scope.review.microtask.type == 'WriteTestCases') {

            //retrievs the reference of the existing test cases to see if the are differents
            $scope.review.testcases = $scope.review.microtask.submission.testCases;
            //load the version of the function with witch the test cases where made
            var functionUnderTestSync = $firebase(new Firebase($rootScope.firebaseURL + '/history/artifacts/functions/' + $scope.review.microtask.functionID + '/' + $scope.review.microtask.submission.functionVersion));
            var functionUnderTest     = functionUnderTestSync.$asObject();
            functionUnderTest.$loaded().then(function() {
                $scope.review.functionCode = functionsService.renderDescription(functionUnderTest) + functionUnderTest.header;
                //console.log("fatto con "+$scope.review.functionCode);
            });

        } else if ($scope.review.microtask.type == 'WriteFunction') {

            var funct = functionsService.get($scope.review.microtask.functionID);
            oldCode = (functionsService.renderDescription(funct) + funct.header + funct.code).split("\n");
            newCode = (functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code).split("\n");


            diffRes = diff(oldCode, newCode);
            diffCode = "";
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=") {
                    diffCode += diffRow[1].join("\n");
                } else {
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                }
                diffCode += "\n";
            });

            $scope.review.functionCode = diffCode;

            if ($scope.review.microtask.promptType == 'DESCRIPTION_CHANGE') {
                oldCode = $scope.review.microtask.oldFullDescription.split("\n");
                newCode = $scope.review.microtask.newFullDescription.split("\n");
                diffRes = diff(oldCode, newCode);
                diffCode = "";
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

        } else if ($scope.review.microtask.type == 'WriteTest') {

            //load the version of the function with witch the test cases where made
            var functionUnderTestSync = $firebase(new Firebase($rootScope.firebaseURL + '/history/artifacts/functions/' + $scope.review.microtask.functionID + '/' + ($scope.review.microtask.functionVersion > 0 ? $scope.review.microtask.functionVersion : 1)));
            $scope.functionUnderTest = functionUnderTestSync.$asObject();
            $scope.functionUnderTest.$loaded().then(function() {
                $scope.review.functionCode = functionsService.renderDescription($scope.functionUnderTest) + $scope.functionUnderTest.header;
            });

        } else if ($scope.review.microtask.type == 'WriteCall') {

            var funct = functionsService.get($scope.review.microtask.functionID);
            oldCode = (functionsService.renderDescription(funct) + funct.header + funct.code).split("\n");
            newCode = (functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code).split("\n");


            diffRes = diff(oldCode, newCode);
            diffCode = "";
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=") {
                    diffCode += diffRow[1].join("\n");
                } else {
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                }
                diffCode += "\n";
            });

            $scope.review.functionCode = diffCode;

            //      $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code;
        } else if ($scope.review.microtask.type == 'WriteFunctionDescription') {

            $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header;
       
        }
    });


    $scope.accept = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(5);
    };
    $scope.reject = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(1);
    };
    $scope.reissue = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(3);
    };

    //Star rating manager
    // $scope.review.mouseOn = 0;
    $scope.review.maxRating = 5;
    $scope.review.rating    = -1;
    $scope.rate = function(value) {
        console.log("RATE",value, value >= 0, value <= $scope.review.maxRating);
        if (value >= 0 && value <= $scope.review.maxRating) {
            $scope.review.rating = value;
        }
    };
    
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

        if ($scope.review.rating <= 3) {
            if(angular.isFunction(microtaskForm.$setDirty))
                microtaskForm.$setDirty();
            angular.forEach(microtaskForm, function(formElement, fieldName) {
                // If the fieldname doesn't start with a '$' sign, it means it's form
                if (fieldName[0] !== '$') {
                    if(angular.isFunction(formElement.$setDirty))
                        formElement.$setDirty();
                }
            });
        }

        var error = "";
        if ($scope.review.rating === -1) error = "plese, scores the review";
        else if (microtaskForm.$invalid && $scope.review.rating <= 3) 
            error = "please, write an explanation for your choice";
        

        if (error !== "") 
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        else {

            if( $scope.review.reviewText == undefined )
                $scope.review.reviewText = "";
            
            formData = {
                microtaskIDReviewed: $scope.microtask.microtaskKeyUnderReview,
                reviewText: $scope.review.reviewText,
                qualityScore: $scope.review.rating
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });

    
    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);

///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
myApp.controller('DebugTestFailureController', ['$scope', '$rootScope', '$firebase', '$alert', '$timeout', 'testsService', 'functionsService', 'ADTService', 'TestList', 'TestRunnerFactory', function($scope, $rootScope, $firebase, $alert, $timeout, testsService, functionsService, ADTService, TestList, TestRunnerFactory) {
    
    var testRunner = new TestRunnerFactory.instance();

    // scope variables

    $scope.tabs = ['Tests Result', 'Function Editor'];
    $scope.active = 0;

    $scope.tests        = TestList.getImplementedByFunctionId($scope.microtask.functionID);

    for(var t in $scope.tests){
        $scope.tests[t] = angular.extend($scope.tests[t],TestRunnerFactory.defaultTestItem);
    }


    $scope.passedTests  = [];
    $scope.firstTimeRun = true; // if it's first time run and all tests passed, auto submit the microtask
    $scope.testsRunning = false; // for cheching if tests are running
    $scope.stubs        = [];
    $scope.paramNames   = $scope.funct.paramNames;
    $scope.calleDescription = {};
    $scope.completed        = 0;
    $scope.total            = $scope.tests.length;
    $scope.numPassed = 0;
    $scope.hidePassedTests = false;


    // INITIALIZE THE FUNCTION EDITOR CODEMIRROR
    $scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;
    $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;
    
    var functionCodeMirror = undefined;
    var readOnlyDone=false;
    $scope.codemirrorLoaded = function(codemirror) {
        functionCodeMirror = codemirror;
        codemirror.setOption('autofocus', true);
        codemirror.setOption('indentUnit', 4);
        codemirror.setOption('indentWithTabs', true);
        codemirror.setOption('lineNumbers', true);
        codemirror.setOption("theme", "custom-editor");
        codemirror.refresh();

        codemirror.on("change", function() {
            //set the descprtion and header as readonly
            if(!readOnlyDone) {
                functionsService.makeHeaderAndDescriptionReadOnly(codemirror);
                readOnlyDone = true;
            }
        });
    };


    testRunner.onTestReady(function(data){

        $scope.completed = data.number+1;
        $scope.tests[data.number] = angular.extend($scope.tests[data.number],data);

        if( data.output.result ){
            $scope.numPassed ++;
        }

        $scope.$apply();
    });

    testRunner.onStubsReady(function(data){
        $scope.stubs = Object.keys(data).length > 0 ? data : null;
        angular.forEach($scope.stubs, function(data, index) {

            calleeFunction = functionsService.getByName(index);
            if( $scope.stubsParamNames == undefined)
                $scope.stubsParamNames = {};

            $scope.stubsParamNames[index] = calleeFunction.paramNames;

            $scope.calleDescription[index]={};
            $scope.calleDescription[index].code=functionsService.renderDescription(calleeFunction) + calleeFunction.header;
        });

        $scope.$apply();
    });

    testRunner.onTestsFinish(function(data){
        //console.log('--> task received run tests finished');
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
    });

    $scope.runTests = function(firstTime) {
        if($scope.testsRunning) return false;

        var code = undefined;
        if( functionCodeMirror !== undefined )
            code = functionCodeMirror.getValue();

        // push a message for for running the tests
        testRunner.runTests($scope.microtask.functionID,code,$scope.stubs);
        
        //set testsRunning flag
        $scope.testsRunning = true;

        var numTests = $scope.tests.length;
        
        for(var t in $scope.tests){
            $scope.tests[t] = angular.extend($scope.tests[t],TestRunnerFactory.defaultTestItem);
        }
        
        $scope.completed = 0;
        $scope.total     = 0;
        $scope.numPassed = 0;

    };


    $scope.dispute = false;
    $scope.disp = {};
    $scope.disp.disputeText = "";
    $scope.disputedTest = null;
    $scope.$on('disputeTest', function(event, testKey) {
        //console.log('dispute for test ',testKey);
        $scope.dispute = true;
        $scope.disputedTest = $scope.testsData[testKey].test;
    });

    $scope.cancelDispute = function() {
        $scope.dispute = false;
    };

    var collectOff = $scope.$on('collectFormData', function(event, data) {

        // CHECK IF THERE ARE FORM ERRORS
        var errors = "";

        // if a test is in dispute and the disputeText length is 0, 
        // create the error for the dispute
        if ($scope.dispute && $scope.disp.disputeText.length === 0) {
                errors = "Please, insert the description of the dispute!";
        } 
        // if there are no dispute in action check if 
        // all tests are passed 
        else {
            var oneTestFailed = false;
            angular.forEach($scope.testsData, function(data, index) {
                if (!oneTestFailed && !data.output.result) 
                    oneTestFailed = true;
            });


            if (oneTestFailed) errors = "Please fix all the failing tests before submit!";
            if ( data.$invalid ) errors = "Please fix the function code before submit!";

        }

        if (errors === "") {
            if ($scope.dispute) {
                formData = {
                    name: $scope.disputedTest.description,
                    testId: $scope.disputedTest.$id,
                    description: $scope.disp.disputeText
                };
            } else {
                // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
                var stubs = [];
                angular.forEach($scope.stubs, function(stubsForFunction, functionName) {
                    var stubFunction = functionsService.getByName( functionName );
                    angular.forEach(stubsForFunction, function(stub, index) {

                        var test = TestList.search( functionName, stub.inputs );
                        if( test == null ){

                            var testCode = 'equal(' + stubFunction.name + '(';
                            var inputs = [];
                            angular.forEach( stub.inputs, function(value, key) {
                                testCode += value;
                                testCode += (key != stub.inputs.length - 1) ? ',' : '';
                                
                            });
                            testCode += '),' + stub.output + ',\'' + 'auto generated 3' + '\');';

                            test = {
                                functionVersion: stubFunction.version,
                                code: testCode,
                                hasSimpleTest: true,
                                inDispute: false,
                                disputeText: '',
                                functionID: stubFunction.id,
                                functionName: stubFunction.name,
                                simpleTestInputs: stub.inputs,
                                simpleTestOutput: stub.output
                            };

                            stubs.push(test);
                        }
                    });
                });

                var text = functionCodeMirror.getValue();

                // create form data to send
                formData = functionsService.parseFunction(text);
                // add the stubs to the form data
                formData.stubs = stubs;
            }
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
    });

    $scope.runTests();


    $scope.$on('$destroy',function(){
        collectOff();
        functionCodeMirror = undefined;
    });
}]);

///////////////////////////////
//  REUSE SEARCH CONTROLLER //
///////////////////////////////
myApp.controller('ReuseSearchController', ['$scope', '$alert', 'functionsService', function($scope, $alert, functionsService) {
    // set selected to -2 to initialize the default value
    //-2 nothing selected (need an action to submit)
    //-1 no function does this
    // 0- n index of the function selected
    $scope.selectedResult = -2;
    //display all the available function at the beginning
    $scope.results = functionsService.findMatches('', $scope.funct.name);
    $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;
    // search for all the functions that have $scope.reuseSearch.text in theirs description or header
    $scope.doSearch = function() {
        $scope.selectedResult = -2;
        $scope.results = functionsService.findMatches($scope.text, $scope.funct.name);
    };
    $scope.select = function(index) {
        $scope.selectedResult = index;
    };
    
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        if ($scope.selectedResult == -2) {
            var error = 'Choose a function or select the checkbox "No funtion does this"';
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            //if no function selected the value of selected is ==-1 else is the index of the arrayList of function
            if ($scope.selectedResult == -1) formData = {
                functionName: "",
                functionId: 0,
                noFunction: true
            };
            else formData = {
                functionId: $scope.results[$scope.selectedResult].value.id,
                functionName: $scope.results[$scope.selectedResult].value.name,
                noFunction: false
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);
///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
myApp.controller('WriteCallController', ['$scope', '$rootScope', '$firebase', '$alert', 'testsService', 'functionsService', 'ADTService', function($scope, $rootScope, $firebase, $alert, testsService, functionsService, ADTService) {
    // INITIALIZATION OF FORM DATA MUST BE DONE HERE
    var marks = [];
    var highlightPseudoCall = "//!" + $scope.microtask.pseudoCall;
    var changeTimeout;
    var readOnlyDone = false;
    if(angular.isDefined($scope.microtask.reissuedFrom))
        $scope.code = functionsService.renderDescription($scope.reissuedMicrotask.submission) + $scope.reissuedMicrotask.submission.header + $scope.reissuedMicrotask.submission.code;
    else
        $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;

    $scope.codemirrorLoaded = function(myCodeMirror) {
        codemirror = myCodeMirror;
        codemirror.setOption('autofocus', true);
        codemirror.setOption('indentUnit', 4);
        codemirror.setOption('indentWithTabs', true);
        codemirror.setOption('lineNumbers', true);
        codemirror.setSize(null, 500);
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
        if ( microtaskForm.$invalid && !hasPseudosegment ){
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

            formData = functionsService.parseFunction(text);
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);
///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionController', ['$scope', '$rootScope', '$firebase', 'testsService', 'functionsService', 'ADTService', '$alert', function($scope, $rootScope, $firebase, testsService, functionsService, ADTService, $alert) {
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
        console.log($scope.diffCode);
    }

    // INITIALIZATION OF FORM DATA MUST BE DONE HERE
    if( angular.isDefined($scope.microtask.reissuedFrom) )
        $scope.code = functionsService.renderDescription( $scope.reissuedMicrotask.submission ) +
                      $scope.reissuedMicrotask.submission.header + $scope.reissuedMicrotask.submission.code;
    else
        $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;


    var codemirror = undefined;

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
        console.warn("codemirror before assign %o",codemirror);
        codemirror = myCodeMirror;
        console.warn("codemirror after assign %o",codemirror);
        codemirror.setOption('autofocus', true);
        codemirror.setOption('indentUnit', 4);
        codemirror.setOption('indentWithTabs', true);
        codemirror.setOption('lineNumbers', true);
        codemirror.setSize(null, 500);
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
        if ( microtaskForm.$invalid && !hasPseudosegment ){
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

            formData = functionsService.parseFunction(text);
            //add the dispute text to the submit
            if($scope.microtask.promptType==='RE_EDIT')
                formData.disputeText=$scope.microtask.disputeText;
            
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
        codemirror.off("change", codemirrorChangeListener);
    });
}]);
////////////////////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
////////////////////////////////////////////
myApp.controller('WriteFunctionDescriptionController', ['$scope', '$rootScope', '$firebase', '$alert', 'testsService', 'functionsService', 'ADTService', function($scope, $rootScope, $firebase, $alert, testsService, functionsService, ADTService) {
    // initialization of models 
    $scope.description = "";
    $scope.returnType = "";
    $scope.functionName = "";
    $scope.parameters = [];
    // addParameter and deleteParameter 
    $scope.addParameter = function() {
        var parameter = {
            text: '',
            added: true,
            deleted: false,
            id: $scope.parameters.length
        };
        $scope.parameters.push(parameter);
    };
    $scope.deleteParameter = function(index) {
        console.log("delete try");
        event.preventDefault();
        event.stopPropagation();
        if( $scope.parameters.length>1 )
            $scope.parameters.splice(index, 1);
    };

    if(angular.isDefined($scope.microtask.reissuedFrom)){
        $scope.functionName=$scope.reissuedMicrotask.submission.name;
        $scope.description=$scope.reissuedMicrotask.submission.description;
        $scope.returnType=$scope.reissuedMicrotask.submission.returnType;
        for (var i = 0; i < $scope.reissuedMicrotask.submission.paramNames.length; i++) {

            $scope.parameters[i]={
                paramName: $scope.reissuedMicrotask.submission.paramNames[i],
                paramType: $scope.reissuedMicrotask.submission.paramTypes[i],
                paramDescription:$scope.reissuedMicrotask.submission.paramDescriptions[i]
            };
        }
    }
    else{
        //Add the first parameter
        $scope.addParameter();
    }

    //prepare the codemirror Value
    $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;

    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

        angular.forEach(microtaskForm, function(formElement, fieldName) {
            // If the fieldname doesn't start with a '$' sign, it means it's form
            if (fieldName[0] !== '$') {
                if(angular.isFunction(formElement.$setDirty))
                    formElement.$setDirty();
            }
            //if formElement as the proprety $addControl means that have other form inside him
            if (formElement !== undefined && formElement.$addControl) {
                angular.forEach(formElement, function(formElement, fieldName) {
                    // If the fieldname starts with a '$' sign, it means it's an Angular
                    // property or function. Skip those items.
                    if (fieldName[0] !== '$') {
                       if(angular.isFunction(formElement.$setDirty))
                            formElement.$setDirty();
                    }
                    //if formElement as the proprety $addControl means that have other form inside him
                    if (formElement !== undefined && formElement.$addControl) {
                        angular.forEach(formElement, function(formElement, fieldName) {
                            // If the fieldname starts with a '$' sign, it means it's an Angular
                            // property or function. Skip those items.
                            if (fieldName[0] !== '$') {
                                if(angular.isFunction(formElement.$setDirty))
                                    formElement.$setDirty();
                            }
                        });
                    }
                });
            }
        });
        if (microtaskForm.$invalid) {
            var error = 'Fix all errors before submit';
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            var paramNames = [];
            var paramTypes = [];
            var paramDescriptions = [];
            for (var i = 0; i < $scope.parameters.length; i++) {
                paramNames.push($scope.parameters[i].paramName);
                paramTypes.push($scope.parameters[i].paramType);
                paramDescriptions.push($scope.parameters[i].paramDescription);
            }
            formData = {
                name: $scope.functionName,
                returnType: $scope.returnType === undefined ? '' : $scope.returnType,
                paramNames: paramNames,
                paramTypes: paramTypes,
                paramDescriptions: paramDescriptions,
                description: $scope.description,
                header: functionsService.renderHeader($scope.functionName, paramNames)
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);

///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestController', ['$scope', '$rootScope', '$firebase', '$filter', '$alert', 'testsService', 'functionsService', 'ADTService', function($scope, $rootScope, $firebase, $filter, $alert, testsService, functionsService, ADTService) {
    // initialize testData

    //if a function starts with CR cannot be disputed
    $scope.canBeDisputed=true;
    if( $scope.funct.readOnly)
        $scope.canBeDisputed=false;

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
    //  $scope.testData.inputs[0]={};
    // Configures the microtask to show information for disputing the test, hiding
    // other irrelevant portions of the microtask.
    $scope.dispute = false;
    $scope.functionDispute = false;

    if(angular.isDefined($scope.microtask.reissuedFrom)){
        if($scope.reissuedMicrotask.submission.inDispute){
            // Configures the microtask to show information for disputing the test.
            $scope.dispute = true;
            $scope.testData.disputeText = $scope.reissuedMicrotask.submission.disputeText;
        }
        else{
            $scope.testData.inputs=$scope.reissuedMicrotask.submission.simpleTestInputs;
            $scope.testData.output=$scope.reissuedMicrotask.submission.simpleTestOutput;
        }
    }




    $scope.toggleDispute = function() {
        $scope.dispute = !$scope.dispute;
        if (!$scope.dispute) $scope.testData.disputeText = "";
        if ( $scope.functionDispute ) $scope.functionDispute = false;
    };
    $scope.toggleFunctionDispute = function() {
        $scope.functionDispute = !$scope.functionDispute;
        if (!$scope.functionDispute) $scope.testData.functionDisputeText = "";
        if ( $scope.dispute ) $scope.dispute = false;
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
            $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header;
        });
    }
    $scope.loadExample = function(ADTName) {
        return ADTService.getByName(ADTName).example;
    };
    var alertObj = null; // initialize alert obj
    
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        angular.forEach(microtaskForm, function(formElement, fieldName) {
            // If the fieldname doesn't start with a '$' sign, it means it's form
            if (fieldName[0] !== '$') {
                if(angular.isFunction(formElement.$setDirty))
                    formElement.$setDirty();
            }
            //if formElement as the proprety $addControl means that have other form inside him
            if (formElement !== undefined && formElement.$addControl) {
                angular.forEach(formElement, function(formElement, fieldName) {
                    // If the fieldname starts with a '$' sign, it means it's an Angular
                    // property or function. Skip those items.
                    if (fieldName[0] !== '$') {
                        if(angular.isFunction(formElement.$setDirty))
                            formElement.$setDirty();
                    }
                });
            }
        });
        console.log(microtaskForm);
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
            if ($scope.dispute) {
                // return jSON object
                formData = {
                    functionVersion: $scope.funct.version,
                    code: '',
                    inDispute: true,
                    disputeText: $scope.testData.disputeText,
                    hasSimpleTest: true,
                    simpleTestInputs: [],
                    simpleTestOutput: ''
                };
            } else if ($scope.functionDispute) {
                // return jSON object
                formData = {
                    functionVersion: $scope.funct.version,
                    code: '',
                    inDispute: false,
                    isFunctionDispute : true,
                    disputeText : $scope.testData.functionDisputeText,
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
                    disputeText: '',
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