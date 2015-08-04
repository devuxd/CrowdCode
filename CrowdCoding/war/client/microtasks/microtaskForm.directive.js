angular
    .module('crowdCode')
    .directive('microtaskForm', [ '$rootScope',  '$http', '$interval', '$timeout','$modal',  'functionsService', 'userService', 'microtasksService', microtaskForm]); 

function microtaskForm($rootScope,  $http, $interval, $timeout, $modal , functionsService, userService, microtasks) {
    return {
        restrict: 'A',
        scope: true,
        require: 'form',
        templateUrl: '/client/microtasks/microtask_form.html',
        link: function($scope,$element,$attrs,formController){
        	$scope.formController = formController;
        },
        controller: function($scope){

        	

        	$scope.taskData = {};

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
				'DescribeFunctionBehavior': 'describe_behavior/describe_behavior',
				'ImplementBehavior': 'implement_behavior/implement_behavior',
				'ChallengeReview': 'challenge_review/challenge_review'
			};

			// initialize microtask and templatePath
			$scope.funct = {};
			$scope.microtask = {};
			$scope.templatePath = ""; //"/html/templates/microtasks/";
			$scope.taskData.startBreak = false;

			var waitTimeInSeconds = 3;
			var checkQueueTimeout = null;
			var timerInterval     = null;
			$scope.breakMode     = false;
			$scope.noMicrotask   = true;

			$scope.checkQueueIn  = waitTimeInSeconds;

			$scope.askQuestion = function(){
				$rootScope.$broadcast('setLeftBarTab','questions');
				$rootScope.$broadcast('askQuestion');
			};

			$scope.openTutorial = function(){
				$scope.$emit('queue-tutorial', $scope.microtask.type , true, function(){});
			};

			$scope.submit = submitMicrotask;
			$scope.skip   = skipMicrotask;
			$scope.fetch  = fetchMicrotask;

			// ------- MESSAGE LISTENERS ------- //

			$scope.$on('timeExpired'    , timeExpired);
			$scope.$on('fecthMicrotask' , fetchMicrotask);
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
				if (angular.isDefined($scope.microtask.functionId))
					$scope.funct = functionsService.get($scope.microtask.functionId);

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

				// cancel breakMode
				$scope.breakMode = false;

				// show the loading screen
				// and ask for a microtask fetch
				$scope.templatePath  = templatesURL + "loading.html";
				microtasks.fetch(); 
			}

			function checkBreakMode(){
				if( $scope.taskData.startBreak ) { 
					$scope.breakMode = true; 
					$scope.taskData.startBreak = false; 
				}
			}

			// time is expired, skip the microtask
			function timeExpired(){
				$scope.canSubmit    = false;
				$scope.templatePath = templatesURL + "loading.html";
				microtasks.submit($scope.microtask,undefined,true,true);
			}

			// skip button pressed
			function skipMicrotask(){
				checkBreakMode();
				$scope.canSubmit    = false;
				$scope.templatePath = templatesURL + "loading.html";
				microtasks.submit($scope.microtask,undefined,false,!$scope.breakMode);
			}

			// submit button pressed
			function submitMicrotask() {

				if( $scope.taskData.collectFormData !== undefined ){
        			var formData = $scope.taskData.collectFormData($scope.formController);
        			if( formData ){
        				checkBreakMode();
						$scope.canSubmit    = false;
						$scope.templatePath = templatesURL + "loading.html";
						microtasks.submit($scope.microtask,formData,false,!$scope.breakMode);
        			}
        		}
			}
        }
    };
}