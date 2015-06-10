angular
    .module('crowdCode').directive('newsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, workerId, questionsService, functionsService, FunctionFactory, TestList,microtasksService){

	return {
		scope: {},
		templateUrl: '/client/newsfeed/news_panel.html',
		link: function($scope,$element,$attrs){
			$scope.view           = 'list';
			$scope.animation      = 'from-left';
			$scope.selectedNews   = null; 

			$scope.setUiView      = setUiView;
			$scope.setSelected    = setSelected;

			$scope.$on('showNews',  onShowNews );

			// create the reference and the sync
			var ref = new Firebase(firebaseUrl + '/workers/' + workerId + '/newsfeed');
			var sync = $firebase(ref);
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
			// bind the array to scope.leaders
			$scope.news = sync.$asArray();

			function onShowNews( event, microtaskId ){
			    setSelected($scope.news.$getRecord(microtaskId));
			}
			function setSelected(news){
				$scope.selectedNews = news;


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
				    }
				    loadMicrotaskData[$scope.selectedNews.microtask.type]($scope.selectedNews);
				});
				setUiView('detail');
			}
			function setUiView(view){
				var prev = $scope.view;
				if( (prev == 'list' && view == 'detail') || (prev == 'detail' && view == 'list'))
					$scope.animation = 'from-right';
				else 
					$scope.animation = 'from-left';
				$timeout(function(){ 
					$scope.view = view; 
					if( view == 'list' ) 
						$scope.selectedNews = null; 
				},200);
			}

			
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


		}
	};
});