
angular
    .module('crowdCode')
    .directive('newsDetail', function(newsfeedService,functionsService,microtasksService){
    return {
        templateUrl: "/client/newsfeed/news_detail.html",
        restrict:"AEC",
        scope: false,
        link: function($scope, iElm, iAttrs, controller) {
            $scope.challengeText='';
            $scope.challengeReview=challengeReview;
            var loadMicrotaskData = {
                'WriteFunction': loadWriteFunctionData,
                'WriteTestCases': loadWriteTestCasesData,
                'ReuseSearch': loadReuseSearchData,
                'WriteTest': loadWriteTestData,
                'WriteFunctionDescription': loadWriteFunctionDescriptionData,
                'WriteCall': loadWriteCallData,
                'DebugTestFailure': loadDebugTestFailureData,
                'Review': loadReviewData

            };
            $scope.selectedNews.microtask = microtasksService.get($scope.selectedNews.microtaskKey);
            $scope.selectedNews.microtask.$loaded().then(function() {
                //if the microtask is a review
                if ($scope.selectedNews.microtask.type == "Review") {
                    $scope.selectedNews.isReview = true;
                    $scope.selectedNews.qualityScore = $scope.selectedNews.microtask.submission.qualityScore;
                    $scope.selectedNews.reviewText = $scope.selectedNews.microtask.submission.reviewText;
                } else if (angular.isDefined($scope.selectedNews.microtask.review)) {

                    $scope.selectedNews.qualityScore = $scope.selectedNews.microtask.review.qualityScore;
                    $scope.selectedNews.reviewText = $scope.selectedNews.microtask.review.reviewText;
                    $scope.selectedNews.reviewKey = $scope.selectedNews.microtask.review.reviewKey;
                }
                loadMicrotaskData[$scope.selectedNews.microtask.type]($scope.selectedNews);
            });
            function loadWriteFunctionData(news) {
                if(news.microtask.submission.inDispute)
                    news.funct=functionsService.get(news.microtask.functionID);
                else
                    news.funct = new FunctionFactory(news.microtask.submission);

                if (news.microtask.promptType == 'REMOVE_CALLEE')
                    news.callee=functionsService.get(news.microtask.calleeId);

                if (news.microtask.promptType == 'DESCRIPTION_CHANGE') {
                    oldCode = news.microtask.oldFullDescription.split("\n");
                    newCode = news.microtask.newFullDescription.split("\n");
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
                    news.calledDiffCode = diffCode;
                }

            }
            function loadWriteTestCasesData(news) {

                news.testcases = news.microtask.submission.testCases;
                var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);
                functionUnderTest.$loaded().then(function(){
                    news.funct = new FunctionFactory(functionUnderTest);
                });
            }
            function loadReuseSearchData(news) {

                news.funct = functionsService.get(news.microtask.functionID);
                if(news.microtask.submission.noFunction===false)
                news.calleeFunction = functionsService.get(news.microtask.submission.functionId);
            }
            function loadWriteTestData(news) {

                news.testcases = news.microtask.submission.testCases;

                var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                functionUnderTest.$loaded().then(function(){
                    news.funct = new FunctionFactory(functionUnderTest);
                });
            }

            function loadWriteFunctionDescriptionData(news) {
                news.functionDescription = new FunctionFactory(news.microtask.submission).getSignature();
                news.requestingFunction  = functionsService.get(news.microtask.functionID);
            }
             function loadWriteCallData(news) {
                news.funct = new FunctionFactory(news.microtask.submission);
                news.calleeFunction = functionsService.get(news.microtask.calleeID);
            }
            function loadDebugTestFailureData(news) {
               news.funct = new FunctionFactory(news.microtask.submission.functionDTO);
               var reviewTest;
               news.tests=[];
               if(news.microtask.submission.disputedTests!==undefined && news.microtask.submission.disputedTests.length>0){
                    for(var index in news.microtask.submission.disputedTests){
                        reviewTest=TestList.get(news.microtask.submission.disputedTests[index].id);
                        reviewTest.disputeText = news.microtask.submission.disputedTests[index].disputeText;
                        news.tests.push(reviewTest);
                    }
               }

            }

            function loadReviewData(news){
                news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
                news.microtask.$loaded().then(function() {

                    loadMicrotaskData[news.microtask.type](news);

                });
            }
            function challengeReview(){
                var challengeDTO= { challengeText : $scope.challengeText };
                newsfeedService.challengeReview($scope.selectedNews.reviewKey, challengeDTO);
                $scope.challengeText='';
                $scope.setUiView('list');

            }
        }
    };
});