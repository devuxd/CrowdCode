

///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReviewController', ['$scope', '$rootScope',  '$alert',  '$modal', 'functionsService', 'Function', 'AdtService', 'microtasksService', function($scope, $rootScope,  $alert, $modal, functionsService, Function, AdtService, microtasksService) {
    // scope variables
    $scope.review = {};
    $scope.review.template = 'loading';
    $scope.review.text = "";
    $scope.review.inDispute = false;


    //load the microtask to review
    var reviewed = microtasksService.get($scope.microtask.microtaskKeyUnderReview);
    reviewed.$loaded().then(function() {

        $scope.reviewed = reviewed;
        var submission = reviewed.submission;

        console.log(reviewed);

        // if ($scope.reviewed.type == 'WriteTestCases') {
        //     //load the version of the function with witch the test cases where made
        //     functionSync = functionsService.getVersion($scope.review.microtask.functionID,$scope.review.microtask.submission.functionVersion);
        //     functionSync.$loaded().then(function() {
        //     $scope.funct = new FunctionFactory(functionSync);
        //     });

        //     var testcases    = $scope.review.microtask.submission.testCases;
        //     var testcasesDiff = [];
        //     angular.forEach(testcases,function(tc,index){
        //         if(tc.added)
        //             testcasesDiff.push({ class: 'add', text : tc.text });
        //         else if( tc.deleted )
        //             testcasesDiff.push({ class: 'del', text : tc.text });
        //         else {
        //             var oldTc = TestList.get(tc.id);
        //             if( tc.text != oldTc.getDescription() ) {
        //                 testcasesDiff.push({ class: 'chg', old: oldTc.getDescription(), text : tc.text });
        //             }
        //             else
        //                 testcasesDiff.push({ class: '', text : tc.text });
        //         }
        //     });


        //     $scope.review.testcases    = testcasesDiff;


        // } else if ($scope.review.microtask.type == 'WriteFunction') {

        //     oldFunction = functionsService.get($scope.review.microtask.functionID);
        //     newFunction = new FunctionFactory ( $scope.review.microtask.submission );

        //     oldCode = oldFunction.getFullCode().split("\n");
        //     newCode = newFunction.getFullCode().split("\n");

        //     diffCode = "";
        //     diffRes = diff(oldCode, newCode);
        //     angular.forEach(diffRes, function(diffRow) {
        //         if (diffRow[0] == "=")
        //             diffCode += diffRow[1].join("\n");
        //         else
        //             for (var i = 0; i < diffRow[1].length; i++)
        //                 diffCode += diffRow[0] + diffRow[1][i] + "\n";
        //         diffCode += "\n";
        //     });
        //     $scope.review.functionCode = diffCode;

        //     if ($scope.review.microtask.promptType == 'REMOVE_CALLEE')
        //         $scope.callee=functionsService.get($scope.review.microtask.calleeId);

        //     if ($scope.review.microtask.promptType == 'DESCRIPTION_CHANGE') {
        //         oldCode = $scope.review.microtask.oldFullDescription.split("\n");
        //         newCode = $scope.review.microtask.newFullDescription.split("\n");
        //         diffRes = diff(oldCode, newCode);
        //         diffCode = "";
        //         angular.forEach(diffRes, function(diffRow) {
        //             if (diffRow[0] == "=") {
        //                 diffCode += diffRow[1].join("\n");
        //             } else {
        //                 for (var i = 0; i < diffRow[1].length; i++)
        //                     diffCode += diffRow[0] + diffRow[1][i] + "\n";
        //             }
        //             diffCode += "\n";
        //         });
        //         $scope.calledDiffCode = diffCode;
        //     }

        // } else if ($scope.review.microtask.type == 'WriteTest') {
        //     functionSync = functionsService.getVersion($scope.review.microtask.functionID,$scope.review.microtask.submission.functionVersion);
        //     functionSync.$loaded().then(function() {
        //         $scope.funct = new FunctionFactory(functionSync);
        //     });


        // } else if ($scope.review.microtask.type == 'WriteCall') {

        //     oldFunction = functionsService.get($scope.review.microtask.functionID);
        //     newFunction = new FunctionFactory ($scope.review.microtask.submission);
        //     oldCode = oldFunction.getFunctionCode().split("\n");

        //     newCode = newFunction.getFunctionCode().split("\n");


        //     diffRes = diff(oldCode, newCode);
        //     diffCode = "";
        //     angular.forEach(diffRes, function(diffRow) {
        //         if (diffRow[0] == "=") {
        //             diffCode += diffRow[1].join("\n");
        //         } else {
        //             for (var i = 0; i < diffRow[1].length; i++)
        //                 diffCode += diffRow[0] + diffRow[1][i] + "\n";
        //         }
        //         diffCode += "\n";
        //     });
        //     $scope.calleeFunction = functionsService.get($scope.review.microtask.calleeID);
        //     $scope.functName =oldFunction.name;
        //     $scope.review.functionCode = diffCode;

        //     //      $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code;
        // } else if ($scope.review.microtask.type == 'WriteFunctionDescription') {
        //     $scope.review.funct=new FunctionFactory($scope.review.microtask.submission);
        //     $scope.review.requestingFunction  = functionsService.get($scope.review.microtask.functionID);

        // } else if ($scope.review.microtask.type == 'ReuseSearch') {
        //     //load the callee function
        //     $scope.funct = functionsService.get($scope.review.microtask.functionID);
        //     $scope.calleeFunction = functionsService.get($scope.review.microtask.submission.functionId);

        // } else if ($scope.review.microtask.type == 'DebugTestFailure') {
        //     $scope.funct = functionsService.get($scope.review.microtask.functionID);

        //     if( $scope.review.microtask.submission.hasPseudo){
        //         oldFunction =  $scope.funct;
        //         newFunction = new FunctionFactory ( $scope.review.microtask.submission.functionDTO );

        //         oldCode = oldFunction.getFullCode().split("\n");
        //         newCode = newFunction.getFullCode().split("\n");

        //         diffCode = "";
        //         diffRes = diff(oldCode, newCode);
        //         angular.forEach(diffRes, function(diffRow) {
        //             if (diffRow[0] == "=")
        //                 diffCode += diffRow[1].join("\n");
        //             else
        //                 for (var i = 0; i < diffRow[1].length; i++)
        //                     diffCode += diffRow[0] + diffRow[1][i] + "\n";
        //             diffCode += "\n";
        //         });
        //         $scope.review.functionCode = diffCode;
        //     } else {
        //         $scope.tests= [];
        //         var reviewTest;
        //         for( var index in $scope.review.microtask.submission.disputedTests){
        //             reviewTest=TestList.get($scope.review.microtask.submission.disputedTests[index].id);
        //             reviewTest.disputeText = $scope.review.microtask.submission.disputedTests[index].disputeText;
        //             $scope.tests.push(reviewTest);
        //         }

        //     }
        // } else 

        if ( reviewed.type == 'DescribeFunctionBehavior') {

            $scope.data = {};

            if( submission.disputeFunctionText.length > 0 ){
                $scope.review.template    = 'describe_dispute';
                $scope.review.fromDispute = true;
                $scope.data.disputeText = submission.disputeFunctionText;
            }
            else {
                $scope.review.template = 'describe';
                $scope.data.tests = submission.tests;
            }

            functionsService
                .getVersion( reviewed.functionId, submission.functionVersion )
                .then(function( functObj ){
                    $scope.data.fDescription = functObj.getSignature();
                });

        } 
        else if (reviewed.type == 'ImplementBehavior') {
            $scope.data = {};
            $scope.data.funct = new Function( submission['function'] );

            $scope.review.template    = 'implement';

            if( submission.disputedTests ){
                var loadedFunct = functionsService.get( reviewed.functionId );
                $scope.data.disputedTests = submission.disputedTests
                    .map(function(test){
                        var testObj = loadedFunct.getTestById(test.id);
                        testObj.disputeText = test.disputeText;
                        return testObj;
                    });

            }
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


    $scope.taskData.collectFormData = collectFormData;
    
    function collectFormData(form) {

        
        if( form.$invalid ){
            $modal({template : '/client/microtasks/modal_form_invalid.html' , show: true});
            return;
        }

        
        var formData = {
            reviewText              :($scope.review.text ===undefined ? "" : $scope.review.text),
            qualityScore            : $scope.review.rating,
            fromDisputedMicrotask   : $scope.review.fromDispute
        };

        return formData;

    }

}]);
