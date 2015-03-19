
angular
    .module('crowdCode')
    .directive('microtaskPopover', function($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService,FunctionFactory, TestList){
    return {
        
        scope: true,
        controller: function($scope, $element, $attrs, $transclude) {

            var loadData = {
                'WriteFunction': function(news) {

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

                },

                'WriteTestCases': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },

                'ReuseSearch': function(news) {

                    news.funct = functionsService.get(news.microtask.functionID);
                    if(news.microtask.submission.noFunction===false)
                    news.calleeFunction = functionsService.get(news.microtask.submission.functionId);


                },
                'WriteTest': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },
                'WriteFunctionDescription': function(news) {
                    news.functionDescription = new FunctionFactory(news.microtask.submission).getSignature();
                    news.requestingFunction  = functionsService.get(news.microtask.functionID);
                },
                'WriteCall': function(news) {

                    news.funct = new FunctionFactory(news.microtask.submission);
                    news.calleeFunction = functionsService.get(news.microtask.calleeID);
                },
                'DebugTestFailure': function(news) {
                   news.funct = new FunctionFactory(news.microtask.submission.functionDTO);
                   var reviewTest;
                   news.tests=[];
                   if(news.microtask.submission.disputedTests.length>0){
                        for(var index in news.microtask.submission.disputedTests){
                            reviewTest=TestList.get(news.microtask.submission.disputedTests[index].id);
                            reviewTest.disputeText = news.microtask.submission.disputedTests[index].disputeText;
                            news.tests.push(reviewTest);
                        }
                   }

                },
                'Review': function(news) {

                    news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
                    news.microtask.$loaded().then(function() {

                        loadData[news.microtask.type](news);

                    });
                }

            };

            //Utility to show and hide the popover
            var showPopover = function(popover) {
              popover.$promise.then(popover.show);
            };
            var hidePopover = function(popover) {
              popover.$promise.then(popover.hide);
            };
         

            //
            $scope.showMicrotaskPopover = function(news) {

                if($scope.$parent.popover[news.microtaskKey]===undefined){
                    //Hide all the popover if any is visualized
                    
                    for(var key in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[key]);
                    }
                    $scope.$parent.popover[news.microtaskKey] = $popover($element, {template : "/client/newsfeed/news_popover.html", placement:"right-bottom", trigger : "manual", autoClose: "false", container: "body"   });
                    $scope.$parent.popover[news.microtaskKey].$scope.n=news;
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                    //load the data
                    news.microtask = microtasksService.get(news.microtaskKey);
                    news.microtask.$loaded().then(function() {
                        //if the microtask is a review
                        if (news.microtask.type == "Review") {
                            news.isReview = true;
                            console.log(news.microtask);
                            news.qualityScore = news.microtask.submission.qualityScore;
                            news.reviewText = news.microtask.submission.reviewText;
                        } else if (angular.isDefined(news.microtask.review)) {

                            news.qualityScore = news.microtask.review.qualityScore;
                            news.reviewText = news.microtask.review.reviewText;
                        }
                        loadData[news.microtask.type](news);
                    });

                } else if($scope.$parent.popover[news.microtaskKey].$isShown === false){

                    //Hide all the popover if any is visualized
                    for(var index in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[index]);
                    }
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                }


            };
        },
          link: function($scope, iElm, iAttrs, controller) {

        }
    };
});