angular
    .module('crowdCode')
    .directive('microtaskForm', [ '$firebase', '$http', '$interval', '$timeout','$modal',  'functionsService','FunctionFactory', 'userService', 'microtasksService','TestList', microtaskForm]); 

function microtaskForm($firebase, $http, $interval, $timeout, $modal , functionsService, FunctionFactory, userService, microtasks, TestList) {
    return {
        restrict: 'E',
        templateUrl: '/client/microtasks/microtask_form.html',
        controller: function($scope,$element,$attrs){
        	console.log('controller microtask form');
			// private vars
			var templatesURL = "/client/microtasks/";
			var templates = {
				'NoMicrotask': 'no_microtask/no_microtask.html',
				'Review': 'review/review',
				'DebugTestFailure': 'debug_test_failure/debug_test_failure',
				'ReuseSearch': 'reuse_search/reuse_search',
				'WriteFunction': 'write_function/write_function',
				'WriteFunctionDescription': 'write_function_description/write_function_description',
				'WriteTest': 'write_test/write_test',
				'WriteTestCases': 'write_test_cases/write_test_cases',
				'WriteCall': 'write_call/write_call',
			};

			// initialize microtask and templatePath
			$scope.funct = {};
			$scope.test = {};
			$scope.microtask = {};
			$scope.templatePath = ""; //"/html/templates/microtasks/";

			var waitTimeInSeconds = 15;
			var checkQueueTimeout = null;
			var timerInterval     = null;
			$scope.checkQueueIn   = waitTimeInSeconds;


			$scope.$on('loadMicrotask', function($event, microtask){

				$scope.$emit('queue-tutorial', microtask.type , false, function(){});
				$scope.canSubmit=true;
				$scope.microtask = microtask;

				// retrieve the related function
				if (angular.isDefined($scope.microtask.functionID))
					$scope.funct = functionsService.get($scope.microtask.functionID);

				// retrieve the related test
				if ( angular.isDefined($scope.microtask.testID) )
					$scope.test = TestList.get($scope.microtask.testID).rec;

				//set up the right template
				$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";

				$scope.noMicrotask = false;
			});

			// in case of no microtasks available
			$scope.$on('noMicrotask', function($event, fetchData) {
				$scope.$emit('reset-reminder');
				$scope.templatePath = templatesURL + templates.NoMicrotask;
				$scope.noMicrotask = true;

				$scope.checkQueueIn = waitTimeInSeconds;
				timerInterval = $interval(function(){
					$scope.checkQueueIn -- ;
				}, 1000);

				checkQueueTimeout = $timeout(function() {
					$interval.cancel(timerInterval);
					$scope.$emit('fecthMicrotask');
				}, waitTimeInSeconds*1000); // check the queue every 30 seconds
			});

			// ------- MESSAGE LISTENERS ------- //

			// load microtask:
			// request a new microtask from the backend
			$scope.$on('fecthMicrotask', function($event, fetchData) {

				// if the check queue timeout
				// is active, cancel it
				if (checkQueueTimeout !== null) {
					$timeout.cancel(checkQueueTimeout);
				}

				// show the loading screen
				$scope.templatePath  = templatesURL + "loading.html";
				microtasks.fetch();
			});

			// listen for message 'submit microtask'
			$scope.$on('submitMicrotask', function(event, formData, autoSkip) {

				if($scope.canSubmit){

					$scope.templatePath   = templatesURL + "loading.html";
					$scope.canSubmit=false;
					microtasks.submit($scope.microtask,formData,autoSkip);
				}
			});
        }
    };
}