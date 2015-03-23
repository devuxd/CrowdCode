angular
    .module('crowdCode')
    .directive('microtaskForm', [ '$firebase', '$http', '$interval', '$timeout','$modal',  'functionsService','FunctionFactory', 'userService', 'microtasksService','TestList', microtaskForm]); 

function microtaskForm($firebase, $http, $interval, $timeout, $modal , functionsService, FunctionFactory, userService, microtasks, TestList) {
    return {
        restrict: 'E',
        templateUrl: '/client/microtasks/microtask_form.html',
        controller: function($scope,$element,$attrs){
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
			$scope.validatorCondition = false;
			$scope.loadingMicrotask = true;
			//Whait for the inizializations of all service
			//when the microtask array is syncronize with firebase load the first microtask

			$scope.userService = userService;

			var waitTimeInSeconds = 15;
			var checkQueueTimeout = null;
			var timerInterval     = null;
			$scope.checkQueueIn   = waitTimeInSeconds;



			function loadMicrotask(microtaskKey, firstFetch){
				//console.log('Loading microtask '+microtaskKey);

				if( microtaskKey === undefined || microtaskKey == "null" ){
					noMicrotask();
					return;
				}
				if( firstFetch == '1')
					userService.setFirstFetchTime();

				userService.assignedMicrotaskKey = microtaskKey;

				$scope.microtask = microtasks.get(microtaskKey);
				$scope.microtask.$loaded().then(function() {


					// retrieve the related function
					if (angular.isDefined($scope.microtask.functionID) || angular.isDefined($scope.microtask.testedFunctionID)) { 
						$scope.funct = functionsService.get($scope.microtask.functionID);
					}
					// retrieve the related test
					var testId = angular.isDefined($scope.microtask.testID) && $scope.microtask.testID!==0 ? $scope.microtask.testID : null;
					if ( testId !== null ) {
						var TestObj = TestList.get(testId);
						////console.log('Loaded test %o of id %d',TestObj,testId);
						$scope.test = TestObj.rec;
					}

					// if is a reissued microtask
					// retrieve the initial microtask
					if ( angular.isDefined( $scope.microtask.reissuedFrom ) ) {

						$scope.reissuedMicrotask = microtasks.get($scope.microtask.reissuedFrom);
							$scope.reissuedMicrotask.$loaded().then(function() {
							//choose the right template
							if ( $scope.microtask !== undefined && $scope.reissuedMicrotask !== undefined ){
								$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
								$scope.noMicrotask = false;

								$scope.$emit('run-tutorial', $scope.microtask.type , false, function(){});
								$scope.$emit('run-reminder', $scope.microtask.type,function (){ $scope.$emit('skipMicrotask',true); });
							}
							else
								noMicrotask();
						});

					}
					// otherwise
					else {

						//choose the right template
						if ( $scope.microtask !== undefined ){
							$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
							$scope.noMicrotask = false;

							$scope.$emit('run-tutorial', $scope.microtask.type , false, function(){});
							$scope.$emit('run-reminder', $scope.microtask.type, function (){ $scope.$emit('skipMicrotask',true); } );

						}
						else
							noMicrotask();
					}

				});
			}

			// in case of no microtasks available
			function noMicrotask(){
				$scope.$emit('reset-reminder');
				$scope.templatePath = templatesURL + templates['NoMicrotask'];
				$scope.noMicrotask = true;

				$scope.checkQueueIn = waitTimeInSeconds;
				timerInterval = $interval(function(){
					$scope.checkQueueIn -- ;
				}, 1000);

				checkQueueTimeout = $timeout(function() {
					$interval.cancel(timerInterval);
					$scope.$emit('loadMicrotask');
				}, waitTimeInSeconds*1000); // check the queue every 30 seconds
			}

			// ------- MESSAGE LISTENERS ------- //

			// load microtask:
			// request a new microtask from the backend and if success
			// inizialize template and microtask-related values
			$scope.$on('loadMicrotask', function($event, fetchData) {
				$scope.canSubmit=true;

				// if the check queue timeout
				// is active, cancel it
				if (checkQueueTimeout !== null) {
					$timeout.cancel(checkQueueTimeout);
				}

				// show the loading screen
				$scope.templatePath  = templatesURL + "loading.html";

				// if a fetchData is provided
				if( fetchData !== undefined ){

					loadMicrotask(fetchData.microtaskKey,fetchData.firstFetch);
				}
				// otherwise do a fetch request
				else {
					var fetchPromise = microtasks.fetch();
					fetchPromise.then(function(fetchData){

						loadMicrotask(fetchData.microtaskKey,fetchData.firstFetch);
					}, function(){
						noMicrotask();
					});
				}
			});


			// listen for message 'submit microtask'
			$scope.$on('submitMicrotask', function(event, formData) {

				if($scope.canSubmit){

					$scope.templatePath   = templatesURL + "loading.html";
					$scope.canSubmit=false;
					microtasks.submit($scope.microtask,formData).then(function(data){
						$scope.$broadcast('loadMicrotask',data);
					},function(){
						console.error('Error during microtask submit!');
					});
				}
			});

			// listen for message 'skip microtask'
			$scope.$on('skipMicrotask', function(event,autoSkip) {

				if($scope.canSubmit){

					$scope.templatePath   = templatesURL + "loading.html";
					$scope.canSubmit=false;
					microtasks.submit($scope.microtask,null,autoSkip).then(function(data){
						$scope.$broadcast('loadMicrotask',data);
					},function(){
						console.error('Error during microtask skip!');
					});
				}
			});


        }
    };
};