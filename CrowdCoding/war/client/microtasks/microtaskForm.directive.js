angular
    .module('crowdCode')
    .directive('microtaskForm', [ '$rootScope',  '$http', '$interval', '$timeout','$modal',  'functionsService', 'userService', 'microtasksService','userService', microtaskForm]); 

function microtaskForm($rootScope,  $http, $interval, $timeout, $modal , functionsService, userService, microtasks,userService) {

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
				'Dashboard': 'dashboard/dashboard',
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

			var waitTimeInSeconds = 5;
			var checkQueueTimeout = null;
			var timerInterval     = null;
			$scope.breakMode     = false;
			$scope.noMicrotask   = true;

			$scope.checkQueueIn  = waitTimeInSeconds;

			$scope.askQuestion = askQuestion();
			$scope.openTutorial = openTutorial;


			$scope.submit = submitMicrotask;
			$scope.skip   = skipMicrotask;
			$scope.fetch  = fetchMicrotask;

			// ------- MESSAGE LISTENERS ------- //

			$scope.$on('timeExpired'    , timeExpired);
			$scope.$on('fecthMicrotask' , fetchMicrotask);
			$scope.$on('fetchSpecificMicrotask' , fetchSpecificMicrotask);
			$scope.$on('microtaskLoaded', onMicrotaskLoaded);
			$scope.$on('openDashboard' , openDashboard);
			

			$scope.workerOption = "";

			$scope.currentPrompt = function(){
				$scope.workerOption = "Take a break";
				if(userService.data.level >= 2)
					$scope.workerOption = "Pick next microtask"				
						
				return $scope.workerOption;			
			}

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
			

			
			function openDashboard(){
				$scope.taskData.startBreak = true;
				$scope.breakMode = true;	
				cancelFetchTimer();
				$scope.templatePath  = templatesURL + templates['Dashboard'] + ".html";
			}
			
			function noMicrotasks() {
				$scope.noMicrotask = true;
				$scope.$emit('reset-reminder');			
				setFetchTimer();

				if(userService.data.level >= 2)
					$scope.templatePath = templatesURL + templates['Dashboard'] + ".html";
				else
					$scope.templatePath = templatesURL + templates['NoMicrotask'] + ".html";			
			}
			
			
			function setFetchTimer(){
				// if is not in break mode, start to check the queue
				if(! $scope.breakMode ){
					// initialize the countdown
					$scope.checkQueueIn = waitTimeInSeconds;
					// every second decremend the countdown
					timerInterval = $interval(function(){
						$scope.checkQueueIn -- ;
					}, 1000);
					// set the timeout to check the queue
					checkQueueTimeout = $timeout(function() {
						$scope.checkQueueIn = 0;
						$interval.cancel(timerInterval);

						$timeout(fetchMicrotask,1000);
						
					}, waitTimeInSeconds*1000); 
				}
			}

			function cancelFetchTimer(){
				// cancel checkQueuetimeout
				if (checkQueueTimeout !== null) {
					$timeout.cancel(checkQueueTimeout);
				}
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
			
			function fetchMicrotask($event, fetchData) {
				cancelFetchTimer();
				$scope.breakMode = false;
				microtasks
					.fetch()
					.then( function(fetchData){
						microtasks.load(fetchData);
					}, function(){
						noMicrotasks();
					}); 
			}
			
			function fetchSpecificMicrotask($event, microtaskId ) {
				cancelFetchTimer();
				$scope.breakMode     = false;
				$scope.templatePath  = templatesURL + "loading.html";
				microtasks.fetchSpecificMicrotask( microtaskId );
			}


			// skip button pressed
			function skipMicrotask(){
				checkBreakMode();
				$scope.canSubmit    = false;
				$scope.templatePath = templatesURL + "loading.html";
				microtasks
					.submit($scope.microtask,undefined,false,!$scope.breakMode)
					.then( function(fetchData){
						microtasks.load(fetchData);
					}, function(){
						noMicrotasks();
					});
			}

			// submit button pressed
			function submitMicrotask() {
				// check if form is untouched
		        if( !$scope.formController.$dirty ){
		            $modal({template : '/client/microtasks/modal_form_pristine.html' , show: true});
		            return;
		        }
		        // collect form data and submit the microtask
				if( $scope.taskData.collectFormData !== undefined ){
        			var formData = $scope.taskData.collectFormData($scope.formController);
        			if( formData ){
        				checkBreakMode();
						$scope.canSubmit    = false;
						$scope.templatePath = templatesURL + "loading.html";


						microtasks
							.submit($scope.microtask,formData,false,!$scope.breakMode)
							.then( function(fetchData){
								microtasks.load(fetchData);
							}, function(){
								noMicrotasks();
							});
        			}
        		}
			}


			function askQuestion(){
				$rootScope.$broadcast('setLeftBarTab','questions');
				$rootScope.$broadcast('askQuestion');
			}
			function openTutorial(){
				$scope.$emit('queue-tutorial', $scope.microtask.type , true, function(){});
			}
        }
    };
}