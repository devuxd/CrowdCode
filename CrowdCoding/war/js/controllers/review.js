

///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReviewController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', 'microtasksService', 'TestList', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService, microtasksService, TestList) {
    // scope variables
    $scope.review = {};
    $scope.review.reviewText = "";
    $scope.review.functionCode = "";

    // private variables 
    var oldCode;
    var newCode;
    var diffRes;
    var diffCode;
    var oldFunction;
    var newFunction;

    //load the microtask to review
    $scope.review.microtask = microtasksService.get($scope.microtask.microtaskKeyUnderReview);
    $scope.review.microtask.$loaded().then(function() {


        $scope.reviewed = $scope.review.microtask;

        if ($scope.reviewed.type == 'WriteTestCases') {
            //load the version of the function with witch the test cases where made
            var functionUnderTestSync = $firebase(new Firebase($rootScope.firebaseURL + '/history/artifacts/functions/' + $scope.review.microtask.functionID + '/' + $scope.review.microtask.submission.functionVersion));
            var functionUnderTest     = functionUnderTestSync.$asObject();
            functionUnderTest.$loaded().then(function() {

                var testcases    = $scope.review.microtask.submission.testCases;
                var testcasesDiff = [];
                angular.forEach(testcases,function(tc,index){
                    if(tc.added)
                        testcasesDiff.push({ class: 'add', text : tc.text });
                    else if( tc.deleted )
                        testcasesDiff.push({ class: 'del', text : tc.text });
                    else {
                        var oldTc = TestList.get(tc.id);
                        if( tc.text != oldTc.getDescription() ) {
                            testcasesDiff.push({ class: 'chg', old: oldTc.getDescription(), text : tc.text });
                        }
                        else
                            testcasesDiff.push({ class: '', text : tc.text });
                    }
                });
               

                $scope.review.functionCode = functionsService.renderDescription(functionUnderTest) + functionUnderTest.header;
                $scope.review.testcases    = testcasesDiff;
            });

        } else if ($scope.review.microtask.type == 'WriteFunction') {

            oldFunction = functionsService.get($scope.review.microtask.functionID);
            newFunction = new FunctionFactory ( $scope.review.microtask.submission );

            oldCode = oldFunction.getFullCode().split("\n");
            newCode = newFunction.getFullCode().split("\n");

            diffCode = "";
            diffRes = diff(oldCode, newCode);
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=")
                    diffCode += diffRow[1].join("\n");
                else
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                diffCode += "\n";
            });
            $scope.review.functionCode = diffCode;

            if ($scope.review.microtask.promptType == 'REMOVE_CALLEE')
                $scope.callee=functionsService.get($scope.review.microtask.calleeId);

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
                $scope.calledDiffCode = diffCode;
            }

        } else if ($scope.review.microtask.type == 'WriteTest') {

            //load the version of the function with witch the test cases where made
            var functionUnderTestSync = $firebase(new Firebase($rootScope.firebaseURL + '/history/artifacts/functions/' + $scope.review.microtask.functionID + '/' + ($scope.review.microtask.functionVersion > 0 ? $scope.review.microtask.functionVersion : 1)));
            $scope.functionUnderTest = functionUnderTestSync.$asObject();
            $scope.functionUnderTest.$loaded().then(function() {
                $scope.review.functionCode = functionsService.renderDescription($scope.functionUnderTest) + $scope.functionUnderTest.header;
            });

        } else if ($scope.review.microtask.type == 'WriteCall') {

            oldFunction = functionsService.get($scope.review.microtask.functionID);
            newFunction = new FunctionFactory ($scope.review.microtask.submission);
            oldCode = oldFunction.getFunctionCode().split("\n");

            newCode = newFunction.getFunctionCode().split("\n");


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
            $scope.calleeFunction = functionsService.get($scope.review.microtask.calleeID);
            $scope.functName =oldFunction.name;
            $scope.review.functionCode = diffCode;

            //      $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code;
        } else if ($scope.review.microtask.type == 'WriteFunctionDescription') {
            $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header;
        } else if ($scope.review.microtask.type == 'ReuseSearch') {
            //load the callee function
            $scope.calleeFunction = functionsService.get($scope.review.microtask.submission.functionId);

        }else if ($scope.review.microtask.type == 'DebugTestFailure') {
            $scope.funct = functionsService.get($scope.review.microtask.functionID);
            $scope.test= TestList.get($scope.review.microtask.submission.testId);
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
        if (value >= 0 && value <= $scope.review.maxRating) {
            $scope.review.rating = value;
        }
    };
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

        if ($scope.review.rating <= 3)
            $scope.makeDirty(microtaskForm);

        var error = "";
        if ($scope.review.rating === -1)
            error = "plese, select a score";
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

            formData = {
                microtaskIDReviewed     : $scope.microtask.microtaskKeyUnderReview,
                reviewText              :($scope.review.reviewText ===undefined ? "" : $scope.review.reviewText),
                qualityScore            : $scope.review.rating,
                fromDisputedMicrotask   :($scope.review.microtask.submission.inDispute ===true ? true : false)
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);
