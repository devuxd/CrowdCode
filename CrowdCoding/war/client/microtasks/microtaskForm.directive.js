angular
    .module('crowdCode')
    .directive('microtaskForm', [ '$rootScope', '$firebase', '$http', '$interval', '$timeout','$modal',  'functionsService','FunctionFactory', 'userService', 'microtasksService','TestList', microtaskForm]); 

function microtaskForm($rootScope, $firebase, $http, $interval, $timeout, $modal , functionsService, FunctionFactory, userService, microtasks, TestList) {
    return {
        restrict: 'E',
        templateUrl: '/client/microtasks/microtask_form.html',
        controller: function($scope,$element,$attrs){
        	console.log('controller microtask form');
			// private vars
			var templatesURL = "/client/microtasks/";
			var templates = {
				'NoMicrotask': 'no_microtask/no_microtask',
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
			$scope.breakMode     = false;
			$scope.noMicrotask   = true;
			$scope.model = {
				startBreak :false
			};
			$scope.checkQueueIn  = waitTimeInSeconds;

			$scope.askQuestion = function(){
				$rootScope.$broadcast('setLeftBarTab','questions');
				$rootScope.$broadcast('askQuestion');
			};

			$scope.openTutorial = function(){
				$scope.$emit('queue-tutorial', $scope.microtask.type , true, function(){});
			};


			// ------- MESSAGE LISTENERS ------- //

			$scope.$on('fecthMicrotask' , fetchMicrotask);
			$scope.$on('submitMicrotask', submitMicrotask);

			$scope.$on('microtaskLoaded', onMicrotaskLoaded);
			$scope.$on('noMicrotask'    , onNoMicrotask);



			function onMicrotaskLoaded($event, microtask){

				// start the microtask tutorial
				$scope.$emit('queue-tutorial', microtask.type , false, function(){});

				$scope.noMicrotask = false;

				// initialize microtask data
				$scope.canSubmit = true;
				$scope.microtask = microtask;

				// retrieve the related function
				if (angular.isDefined($scope.microtask.functionID))
					$scope.funct = functionsService.get($scope.microtask.functionID);

				// retrieve the related test
				if ( angular.isDefined($scope.microtask.testID) )
					$scope.test = TestList.get($scope.microtask.testID).rec;

				//set up the right template
				$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";

			}

			function onNoMicrotask($event, fetchData) {

				$scope.noMicrotask = true;

				// reset the microtask submit reminder
				$scope.$emit('reset-reminder');

				// set the no microtask template
				$scope.templatePath = templatesURL + templates['NoMicrotask'] + ".html";

				// if is not in break mode, start to check the queue
				if(! $scope.breakMode){
					// initialize the countdown
					$scope.checkQueueIn = waitTimeInSeconds;
					// every second decremend the countdown
					timerInterval = $interval(function(){
						$scope.checkQueueIn -- ;
					}, 1000);
					// set the timeout to check the queue
					checkQueueTimeout = $timeout(function() {
						$interval.cancel(timerInterval);
						$scope.$emit('fecthMicrotask');
					}, waitTimeInSeconds*1000); 
				}
			}

			function fetchMicrotask($event, fetchData) {
				// cancel checkQueuetimeout
				if (checkQueueTimeout !== null) {
					$timeout.cancel(checkQueueTimeout);
				}
				$scope.breakMode = false;
				// show the loading screen
				$scope.templatePath  = templatesURL + "loading.html";
				// ask for a microtask fetch
				microtasks.fetch();
			}


			function submitMicrotask(event, formData, autoSkip) {

				// if the form is valid, submit the microtask
				if($scope.canSubmit){
					if( $scope.model.startBreak ) { $scope.breakMode = true; $scope.model.startBreak = false; }
					$scope.templatePath   = templatesURL + "loading.html";
					$scope.canSubmit=false;
					microtasks.submit($scope.microtask,formData,autoSkip, !$scope.breakMode);
				}
			}
        }
    };
}