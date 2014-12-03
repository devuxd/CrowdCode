///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
myApp.controller('NoMicrotaskController', ['$scope', '$rootScope', '$firebase', 'testsService', 'functionsService', 'ADTService', '$interval', function($scope, $rootScope, $firebase, testsService, functionsService, ADTService, $interval) {
    //$interval(function(){ $scope.$emit('load')}, 2000);
}]);

///////////////////////////////
//  WRITE TEST CASES CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestCasesController', ['$scope', '$rootScope', '$firebase', '$alert', 'testsService', 'TestList', 'functionsService', 'ADTService', function($scope, $rootScope, $firebase, $alert, testsService, TestList, functionsService, ADTService) {
    
    // private variables
    var alert = null;

    // scope variables 
    $scope.newTestCase         = "";
    $scope.testCases           = TestList.getTestCasesByFunctionId($scope.funct.id);
    console.log("TEST CASES",$scope.testCases);
    $scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;



    // addTestCase action 
    $scope.addTestCase = function() {
        // push the new test case and set the flag added to TRUE
        if ($scope.newTestCase !== "") {
            // push the new test cases
            $scope.testCases.push({
                id      : null,
                text    : $scope.newTestCase,
                added   : true,
                deleted : false
            });
            // reset the new test case field
            $scope.newTestCase = "";
        }
    };

    //deleteTestCase actions
    $scope.removeTestCase = function(index) {
        // if the testcase was added during this microtask, remove it from the array
        if ($scope.testCases[index].added === true) 
            $scope.testCases.splice(index, 1);
        
        // else set the flag DELETED to true
        else $scope.testCases[index].deleted = true;
    };


    // collect form data
    $scope.$on('collectFormData', function(event, microtaskForm) {

        // do validation
        angular.forEach(microtaskForm, function(formElement, fieldName) {
            // If the fieldname doesn't start with a '$' sign, it means it's form
            if (fieldName[0] !== '$') {
                formElement.$dirty = true;
            }
            //if formElement as the proprety $addControl means that have other form inside him
            if (formElement !== undefined && formElement.$addControl) {
                angular.forEach(formElement, function(formElement, fieldName) {
                    // If the fieldname starts with a '$' sign, it means it's an Angular
                    // property or function. Skip those items.
                    if (fieldName[0] !== '$') {
                        formElement.$dirty = true;
                    }
                });
            }
        });

        // if the new test case field is not empty,
        // add as a new test case
        if ($scope.newTestCase !== "") 
            $scope.addTestCase();

        // initialize the error
        var error = "";
        if (microtaskForm.$pristine) error = "Add at least 1 test case";
        if (microtaskForm.$invalid)  error = "Fix all the errors before submit";

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

            // prepare form data for submission
            formData = {
                testCases       : $scope.testCases,
                functionVersion : $scope.funct.version
            };
            console.log(formData);
            // call microtask submission
             $scope.$emit('submitMicrotask', formData);
        }
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
    $scope.$on('collectFormData', function(event, microtaskForm) {

        if ($scope.review.rating < 3) {
            microtaskForm.$dirty = true;
            angular.forEach(microtaskForm, function(formElement, fieldName) {
                // If the fieldname doesn't start with a '$' sign, it means it's form
                if (fieldName[0] !== '$') {
                    formElement.$dirty = true;
                }
            });
        }

        var error = "";
        if ($scope.review.rating === -1) error = "plese, select one of the three option";
        else if (microtaskForm.$invalid && $scope.review.rating <= 3) error = "please, write an explanation for your createTreeWalker(root, whatToShow, filter, entityReferenceExpansion)";
        

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

}]);

///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
myApp.controller('DebugTestFailureController', ['$scope', '$rootScope', '$firebase', '$alert', '$timeout', 'testsService', 'testRunnerService', 'functionsService', 'ADTService', 'TestList', function($scope, $rootScope, $firebase, $alert, $timeout, testsService, testRunnerService, functionsService, ADTService, TestList) {
    // scope variables
    $scope.tests        = testsService.validTestsforFunction($scope.microtask.functionID);
    $scope.passedTests  = [];
    $scope.testsRunning = false; // for cheching if tests are running
    $scope.testsData    = {};
    $scope.stubs        = {};
    $scope.paramNames   = $scope.funct.paramNames;

    // INITIALIZE THE FUNCTION EDITOR CODEMIRROR
    $scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;
    $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;


    var functionCodeMirror = null;
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

    $scope.runTests = function(firstRun) {

        // set testsRunning flag
        $scope.testsRunning = true;

        var functionBody;
        if (functionCodeMirror !== null) {
            var ast = esprima.parse(functionCodeMirror.doc.getValue(), {
                loc: true
            });
            functionBody = functionCodeMirror.getRange(
                {
                    line : ast.body[0].body.loc.start.line - 1,
                    ch   : ast.body[0].body.loc.start.column
                }, 
                {
                    line: ast.body[0].body.loc.end.line - 1,
                    ch: ast.body[0].body.loc.end.column
                }
            );
        }

        // ask the worker to run the tests
        testRunnerService.runTestsForFunction($scope.microtask.functionID, functionBody, $scope.stubs).then(function(data) {
            //$scope.results = 
            $scope.testsData = data.testsData;
            $scope.stubs     = Object.keys(data.stubs).length > 0 ? data.stubs : null;

            console.log("RECEIVED STUBS", $scope.stubs);

            // if on the first run all the tests pass, 
            // load a new microtask 
            if (firstRun != undefined && firstRun && data.overallResult) {
                console.log("---- AUTO LOADING A NEW MICROTASK");
                $scope.$emit('collectFormData', true);
            }

            // reset testsRunning flag
            $timeout(function() {
                $scope.testsRunning = false;
            }, 200);
        });
    };

    $scope.dispute = false;
    $scope.disp = {};
    $scope.disp.disputeText = "";
    $scope.disputedTest = null;
    $scope.$on('disputeTest', function(event, testKey) {
        $scope.dispute = true;
        $scope.disputedTest = $scope.tests[testKey];
    });

    $scope.cancelDispute = function() {
        $scope.dispute = false;
    };

    // check if test is passed
    // testKey is the key of the test in $scope.tests
    $scope.isTestPassed = function(testKey) {
        if ($scope.passedTests != 'undefined' && $scope.passedTests.indexOf(testKey) != -1) return true;
        return false;
    };


    $scope.$on('collectFormData', function(event, data) {
        formData = {};
        var errors = "";
        // IF DISPUTING A TEST 
        if ($scope.dispute) {
            if ($scope.disp.disputeText.length === 0) // IF THE DISPUTED TEXT IS EMPTY, SHOW THE ERROR
                errors = "Please, insert the description of the dispute!";
        } else {
            var oneTestFailed = false;
            angular.forEach($scope.testsData, function(data, index) {
                if (!oneTestFailed && !data.output.result) oneTestFailed = true;
            });
            if (oneTestFailed) errors = "Please fix all the failing tests before submit!";
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

                        TestList.searchAndAdd( stubFunction.id, functionName, stub.inputs, stub.output );

                        // mocks.push({
                        //     functionName: functionName,
                        //     inputs: stub.inputs,
                        //     expectedOutput: stub.output,
                        //     code: mockCode
                        // });
                    });
                });
                // BUILD FUNCTION CODE
                var text = functionCodeMirror.getValue();
                var ast = esprima.parse(text, {
                    loc: true
                });
                var calleeNames = functionsService.getCalleeNames(ast);
                // Get the text for the function description, header, and code.
                // Note esprima (the source of line numbers) starts numbering lines at 1, while
                // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
                var fullDescription = functionCodeMirror.getRange({
                    line: 0,
                    ch: 0
                }, {
                    line: ast.loc.start.line - 1,
                    ch: 0
                });
                var linesDescription = fullDescription.split('\n');
                var name = ast.body[0].id.name;
                var functionParsed = functionsService.parseDescription(linesDescription, name);
                //if pseudosegment are present the body is already istanziated
                body = functionCodeMirror.getRange({
                    line: ast.body[0].body.loc.start.line - 1,
                    ch: ast.body[0].body.loc.start.column
                }, {
                    line: ast.body[0].body.loc.end.line - 1,
                    ch: ast.body[0].body.loc.end.column
                });
                formData = {
                    description: functionParsed.description,
                    header: functionParsed.header,
                    name: name,
                    code: body,
                    returnType: functionParsed.returnType,
                    paramNames: functionParsed.paramNames,
                    paramTypes: functionParsed.paramTypes,
                    paramDescriptions: functionParsed.paramDescriptions,
                    calleeNames: calleeNames
                };

                // if first run is true
                if (data != undefined && data) formData['autoSubmit'] = true;
            }
            // console.log("submitting",formData);
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
    });


    // FIRST run of the tests
    $scope.runTests(true);
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
    $scope.$on('collectFormData', function(event, microtaskForm) {
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
            if (!readOnlyDone && $scope.funct.name.startsWith('CR')) {
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
    $scope.$on('collectFormData', function(event, microtaskForm) {
        var error = "";
        var textToParse, text;
        textToParse = text = codemirror.getValue();
        var body = "";
        var hasPseudosegment = text.search('//!') !== -1 || text.search('//#') !== -1;
        //if there are error
        if (microtaskForm.$invalid)
            if (!hasPseudosegment) {
                error = 'Fix all errors before submit, if you don\'t know how use the pseudocode';
            } else {
                // IF NO PSEUDO CALLS OR PSEUDOSEGMENTS 
                // CALCULATE THE BODY AND THE TEXT TO PARSE FOR ESPRIMA
                //find if exist more header structure and in case gives an error
                var headersNumber = text.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g);
                if (headersNumber.length > 1) {
                    error = 'Only one header is allowed in the code, please fix it';
                }
                //search for the beginning position of the header
                var startHeaderPosition = text.indexOf(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g);
                //the end position of the header will be the first occurence of "{" after the beginning
                var endHeaderPosition = text.indexOf("{", startHeaderPosition);
                //the body is the part of the text between the end of the header and the end of the text
                body = text.substring(endHeaderPosition, text.length);
                //subsitutes the old body with an empty one so that esprima can parse it
                textToParse = text.substring(0, endHeaderPosition) + "{}";
            }
            //if errors has been found
        if (error !== "") {
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
            var ast = esprima.parse(textToParse, {
                loc: true
            });
            var calleeNames = functionsService.getCalleeNames(ast);
            var fullDescription = codemirror.getRange({
                line: 0,
                ch: 0
            }, {
                line: ast.loc.start.line - 1,
                ch: 0
            });
            var descriptionLines = fullDescription.split('\n');
            var functionName = ast.body[0].id.name;
            var functionParsed = functionsService.parseDescription(descriptionLines, functionName);
            //if pseudosegment are present the body is already istantiated
            if (text == textToParse) body = codemirror.getRange({
                line: ast.body[0].body.loc.start.line - 1,
                ch: ast.body[0].body.loc.start.column
            }, {
                line: ast.body[0].body.loc.end.line - 1,
                ch: ast.body[0].body.loc.end.column
            });
            formData = {
                //functionVersion: $scope.funct.version,
                description: functionParsed.description,
                header: functionParsed.header,
                name: functionName,
                code: body,
                returnType: functionParsed.returnType,
                paramNames: functionParsed.paramNames,
                paramTypes: functionParsed.paramTypes,
                paramDescriptions: functionParsed.paramDescriptions,
                calleeNames: calleeNames
            };
            $scope.$emit('submitMicrotask', formData);
        }
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
            if (!readOnlyDone && $scope.funct.name.startsWith('CR')) {
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
    $scope.$on('collectFormData', function(event, microtaskForm) {
        var error = "";
        var text, textToParse, body = "";
        text = textToParse = codemirror.getValue();
        var hasPseudosegment = text.search('//!') !== -1 || text.search('//#') !== -1;
        //if there are error
        if (microtaskForm.$invalid)
            if (!hasPseudosegment) {
                error = 'Fix all errors before submit, if you don\'t know how use the pseudocode';
            } else {
                // IF NO PSEUDO CALLS OR PSEUDOSEGMENTS 
                // CALCULATE THE BODY AND THE TEXT TO PARSE FOR ESPRIMA
                //find if exist more header structure and in case gives an error
                var headersNumber = text.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g);
                if (headersNumber.length > 1) {
                    error = 'Only one header is allowed in the code, please fix it';
                }
                //search for the beginning position of the header
                var startHeaderPosition = text.indexOf(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g);
                //the end position of the header will be the first occurence of "{" after the beginning
                var endHeaderPosition = text.indexOf("{", startHeaderPosition);
                //the body is the part of the text between the end of the header and the end of the text
                body = text.substring(endHeaderPosition, text.length);
                //subsitutes the old body with an empty one so that esprima can parse it
                textToParse = text.substring(0, endHeaderPosition) + "{}";
            }
            //if errors has been found
        if (error !== "") {
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
            var ast = esprima.parse(textToParse, {
                loc: true
            });
            var calleeNames = functionsService.getCalleeNames(ast);
            var fullDescription = codemirror.getRange({
                line: 0,
                ch: 0
            }, {
                line: ast.loc.start.line - 1,
                ch: 0
            });
            var descriptionLines = fullDescription.split('\n');
            var functionName = ast.body[0].id.name;
            var functionParsed = functionsService.parseDescription(descriptionLines, functionName);
            //if pseudosegment are present the body is already istantiated
            if (text == textToParse) body = codemirror.getRange({
                line: ast.body[0].body.loc.start.line - 1,
                ch: ast.body[0].body.loc.start.column
            }, {
                line: ast.body[0].body.loc.end.line - 1,
                ch: ast.body[0].body.loc.end.column
            });
            formData = {
                //functionVersion: $scope.funct.version,
                description: functionParsed.description,
                header: functionParsed.header,
                name: functionName,
                code: body,
                returnType: functionParsed.returnType,
                paramNames: functionParsed.paramNames,
                paramTypes: functionParsed.paramTypes,
                paramDescriptions: functionParsed.paramDescriptions,
                calleeNames: calleeNames
            };
            $scope.$emit('submitMicrotask', formData);
        }
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
        $scope.parameters.splice(index, 1);
    };
    //prepare the codemirror Value
    $scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;
    //Setup the codemirror box with the code of the function that created the pseudocall
    $scope.codemirrorLoaded = function(codeMirror) {
        codeMirror.setOption("readOnly", "true");
        codeMirror.setOption("theme", "custom");
        codeMirror.setSize(null, 'auto');
        codeMirror.setValue($scope.code);
        codeMirror.refresh();
    };
    //Add the first parameter
    $scope.addParameter();
    $scope.$on('collectFormData', function(event, microtaskForm) {

        angular.forEach(microtaskForm, function(formElement, fieldName) {
            // If the fieldname doesn't start with a '$' sign, it means it's form
            if (fieldName[0] !== '$') {
                formElement.$dirty = true;
            }
            //if formElement as the proprety $addControl means that have other form inside him
            if (formElement !== undefined && formElement.$addControl) {
                angular.forEach(formElement, function(formElement, fieldName) {
                    // If the fieldname starts with a '$' sign, it means it's an Angular
                    // property or function. Skip those items.
                    if (fieldName[0] !== '$') {
                        formElement.$dirty = true;
                    }
                    //if formElement as the proprety $addControl means that have other form inside him
                    if (formElement !== undefined && formElement.$addControl) {
                        angular.forEach(formElement, function(formElement, fieldName) {
                            // If the fieldname starts with a '$' sign, it means it's an Angular
                            // property or function. Skip those items.
                            if (fieldName[0] !== '$') {
                                formElement.$dirty = true;
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
}]);
///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestController', ['$scope', '$rootScope', '$firebase', '$filter', '$alert', 'testsService', 'functionsService', 'ADTService', function($scope, $rootScope, $firebase, $filter, $alert, testsService, functionsService, ADTService) {
    // initialize testData
    // if microtask.submission and microtask.submission.simpleTestInputs are defined
    // assign test inputs and output to testData, otherwise initialize an empty object
    $scope.testData = (angular.isDefined($scope.test.simpleTestInputs) && angular.isDefined($scope.test.simpleTestOutput)) ? {
        inputs: $scope.test.simpleTestInputs,
        output: $scope.test.simpleTestOutput
    } : {
        inputs: [],
        output: ''
    };
    //  $scope.testData.inputs[0]={};
    // Configures the microtask to show information for disputing the test, hiding
    // other irrelevant portions of the microtask.
    $scope.dispute = false;
    $scope.toggleDispute = function() {
        $scope.dispute = !$scope.dispute;
        if (!$scope.dispute) $scope.testData.disputeText = "";
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
    $scope.$on('collectFormData', function(event, microtaskForm) {
        angular.forEach(microtaskForm, function(formElement, fieldName) {
            // If the fieldname doesn't start with a '$' sign, it means it's form
            if (fieldName[0] !== '$') {
                formElement.$dirty = true;
            }
            //if formElement as the proprety $addControl means that have other form inside him
            if (formElement !== undefined && formElement.$addControl) {
                angular.forEach(formElement, function(formElement, fieldName) {
                    // If the fieldname starts with a '$' sign, it means it's an Angular
                    // property or function. Skip those items.
                    if (fieldName[0] !== '$') {
                        formElement.$dirty = true;
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
}]);