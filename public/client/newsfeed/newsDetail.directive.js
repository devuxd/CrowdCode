
angular
    .module('crowdCode')
    .directive('newsDetail', function(newsfeedService,functionsService,Function,microtasksService){
    return {
        templateUrl: "/client/newsfeed/news_detail.html",
        restrict:"EA",
        scope: {
            newObj: "=newsDetail"
        },
        link: function($scope, iElm, iAttrs) {
            console.log('NEWOBJ',$scope.newObj);

            $scope.challengeText='';
            $scope.challengeReview=challengeReview;

            $scope.data = {};
            var type = $scope.newObj.microtaskType === 'DescribeFunctionBehavior' ? 'implementation' : 'review';
            var microtask = microtasksService.get($scope.newObj.microtaskKey, type);
            microtask.$loaded().then(function() {
                $scope.data = loadMicrotaskData(microtask);
                console.log("Newsfeed data", $scope.data);
            });

            function loadMicrotaskData(microtask){

                console.log('loading data for ',microtask);

                var data = {};

                data.templateUrl = microtask.type;
                data.type       = microtask.type;
                data.promptType = microtask.promptType;

                //if the microtask is a review
                if ( microtask.type == "Review") {
                    data.isReview  = true;
                    data.review = {
                        score : microtask.submission.qualityScore,
                        text  : microtask.submission.reviewText
                    };
                } else if (angular.isDefined( microtask.review )) {
                    data.reviewKey = microtask.review.reviewKey;
                    data.review = {
                        score : microtask.review.qualityScore,
                        text  : microtask.review.reviewText
                    };
                }

                data.functionName = microtask.functionName;

                switch(microtask.type){
                    case 'DescribeFunctionBehavior':

                        var submission = microtask.submission;
                        var newFunction = new Function(submission.function);
                        functionsService.getVersion(microtask.functionId, microtask.functionVersion).then(function( funct ){
                            data.oldCode = funct.getFullCode();
                            data.newCode = newFunction.getFullCode();
                        });
                        if( submission.disputedTests){
                            data.templateUrl += '_disputed';
                            data.openedTests = [];
                            data.functionParameters = funct.parameters;
                            data.functionReturnType = funct.returnType;
                            data.disputedTests = submission
                                .disputedTests
                                .map(function(test){
                                    var testObj = funct.getTestById(test.id);
                                    testObj.disputeText = test.disputeText;
                                    return testObj;
                                });
                        }

                        if( submission.disputeFunctionText.length > 0 ) {
                            data.disputeText = submission.disputeFunctionText;
                            data.templateUrl += '_disputed';
                        }
                        else {
                            data.tests       = angular.copy(submission.tests);
                            data.functionParameters = functionsService.get(microtask.functionId).parameters;
                            data.functionReturnType = functionsService.get(microtask.functionId).returnType;
                            data.openedTests = [];
                            data.isComplete  = microtask.isFunctionComplete;
                        }

                        break;

                    case 'ImplementBehavior':

                        var submission = microtask.submission;
                        var newFunction = new Function(submission.function);
                        var funct = functionsService.get(microtask.functionId);

                        data.newCode = newFunction.getFullCode();
                        data.oldCode = funct.getFullCode();

                        if( submission.disputedTests ){
                            data.templateUrl += '_disputed';
                            data.openedTests = [];
                            data.functionParameters = funct.parameters;
                            data.functionReturnType = funct.returnType;
                            data.disputedTests = submission
                                .disputedTests
                                .map(function(test){
                                    var testObj = funct.getTestById(test.id);
                                    testObj.disputeText = test.disputeText;
                                    return testObj;
                                });
                        }

                        break;

                    case 'Review':
                        data.reviewed = {};
                        var rev = microtasksService.get(microtask.reference_id, 'implementation');
                        rev.$loaded().then(function() {
                            data.reviewed = loadMicrotaskData(rev);
                            data.templateUrl = 'Review_' + data.reviewed.templateUrl;
                        });
                        break;

                    default:
                }
                return data;
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
