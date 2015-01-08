////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
myApp.controller('AppController', [
	'$scope',
	'$rootScope',
	'$firebase',
	'$interval',
	'$modal',
	'logoutUrl',
	'userService',
	'testsService',
	'functionsService',
	'ADTService',
	'microtasksService',
	'TestList',
	function($scope, $rootScope, $firebase, $interval, $modal, logoutUrl, userService, testsService, functionsService, ADTService, microtasksService, TestList) {

		// current session variables
		$rootScope.projectId    = projectId;
		$rootScope.workerId     = workerId;
		$rootScope.workerHandle = workerHandle;
		$rootScope.firebaseURL  = firebaseURL;
		$rootScope.userData     = userService.data;



		// wrapper for user login and logout
		$rootScope.workerLogin = function()  { userService.login();  };
		$rootScope.workerLogout = function() { userService.logout(); };

		// user profile dropdown
		$scope.dropdown = [
		  {
		    "text": "change profile picture",
		    "click": "showProfileModal()"
		  },
		  {
		    "divider": true
		  },
		  {
		    "text": "logout",
		    "href": logoutUrl
		  }
		];	

		 // Pre-fetch an external template populated with a custom scope
		var profileModal = $modal({scope: $scope, container: 'body', animation: 'am-fade-and-scale', placement: 'center', template: '/html/templates/popups/popup_change_picture.html', show: false});
		// Show when some event occurs (use $promise property to ensure the template has been loaded)
		$scope.showProfileModal = function() {
			profileModal.$promise.then(profileModal.show);
		};


		// ---- SERVICES SYNC ----
		$scope.servicesLoadingStatus = {};

		//  services loading function
		var loadServices = function(){
			console.log('ASKING TO LOAD SERVICES');
			$scope.servicesLoadingStatus = {};

			testsService.init();
			functionsService.init();
			ADTService.init();

			userService.init();
			userService.listenForJobs();
		};
		// set an interval that will be called
		// every 200 msec
		var loadingServicesInterval = $interval(loadServices(), 200);

		$scope.$on('serviceLoaded',function(event,nameOfTheService){
			$scope.servicesLoadingStatus[nameOfTheService] = true;
		});

		// watch for the loaded services and if all are loaded
		// cancel the loading interval and stop the watch
		var stopWatchingLoadedServices = $scope.$watch( 'servicesLoadingStatus', function(newVal,oldVal) {
			if ( newVal.hasOwnProperty('functions') &&
				 newVal.hasOwnProperty('adts') &&
				 newVal.hasOwnProperty('tests') ) {
				console.log("ALL SERVICES LOADED");
				$interval.cancel(loadingServicesInterval);
				loadingServicesInterval = undefined;
				stopWatchingLoadedServices();

				$rootScope.$broadcast('loadMicrotask');
			}
		},true);


		$rootScope.$on('sendFeedback', function(event, message) {
			console.log("message " + message);
			var feedback = {
				// 'microtaskType': $scope.microtask.type,
				// 'microtaskID': $scope.microtask.id,
				'workerHandle': $rootScope.workerHandle,
				'workerID': $rootScope.workerId,
				'feedback': message.toString()
			};


			var feedbackRef = $firebase(new Firebase(firebaseURL + '/feedback'));

			feedbacks = feedbackRef.$asArray();
			feedbacks.$loaded().then(function() {
				feedbacks.$add(feedback);
				//		$rootScope.feedback.sent=true;
			});

		});


	}
]);


myApp.controller('UserProfileController', ['$scope', '$rootScope', '$timeout', 'fileUpload', function($scope, $rootScope, $timeout, fileUpload) {
	$scope.imageUrl = '/user/picture?userId=' + $rootScope.workerId + '&t=' + (new Date().getTime());
	$scope.uploadFile = function() {
		var file = $scope.image;
		var uploadUrl = "/user/pictureChange";

		fileUpload.uploadFileToUrl(file, uploadUrl);

		$timeout(function() {
			$scope.imageUrl = '/user/picture?userId=' + $rootScope.workerId + '&t=' + (new Date().getTime());
		}, 500);
	};

}]);

//////////////////////////
// MICROTASK CONTROLLER //
//////////////////////////
myApp.controller('MicrotaskController', ['$scope', '$rootScope', '$firebase', '$http', '$interval', '$timeout', 'testsService', 'functionsService', 'userService', 'microtasksService','TestList', function($scope, $rootScope, $firebase, $http, $interval, $timeout, testsService, functionsService, userService, microtasksService, TestList) {

	// private vars
	var templatesURL = "/html/templates/microtasks/";
	var templates = {
		'Review': 'review',
		'DebugTestFailure': 'debug_test_failure',
		'ReuseSearch': 'reuse_search',
		'WriteFunction': 'write_function',
		'WriteFunctionDescription': 'write_function_description',
		'WriteTest': 'write_test',
		'WriteTestCases': 'write_test_cases',
		'WriteCall': 'write_call',
	};
	
	$rootScope.inlineForm = false;

	// initialize microtask and templatePath
	$scope.funct = {};
	$scope.test = {};
	$scope.microtask = {};
	$scope.templatePath = ""; //"/html/templates/microtasks/";
	$scope.validatorCondition = false;
	//Whait for the inizializations of all service
	//when the microtask array is syncronize with firebase load the first microtask

	var waitTimeInSeconds   = 30;
	var checkQueueTimeout = null;
	var timerInterval     = null;
	$scope.checkQueueIn   = waitTimeInSeconds;

	// load microtask:
	// request a new microtask from the backend and if success
	// inizialize template and microtask-related values
	$scope.$on('loadMicrotask', function() {

		// if is != null, stop the queue checking interval
		if (checkQueueTimeout !== null) {
			$timeout.cancel(checkQueueTimeout);
		}

		// set the loading template
		$scope.templatePath   = templatesURL + "loading.html";

		$scope.microtask      = undefined;

		$http.get('/' + projectId + '/ajax/fetch')
			.success(function(data, status, headers, config) {

				$scope.microtask = microtasksService.get(data.key);
				$scope.microtask.$loaded().then(function() {

					// debug stuff
					// console.warn('data: %o', data);
					//console.warn('microtask: %o', $scope.microtask);

					// assign title
					$scope.datas = data;

					// retrieve the related function
					if (angular.isDefined($scope.microtask.functionID) || angular.isDefined($scope.microtask.testedFunctionID)) {
						$scope.funct = functionsService.get($scope.microtask.functionID);
					}
					// retrieve the related test
					var testId = angular.isDefined($scope.microtask.testID) && $scope.microtask.testID!=0 ? $scope.microtask.testID : null;
					if ( testId != null ) {
						var TestObj = TestList.get(testId);
						//console.log('Loaded test %o of id %d',TestObj,testId);	
						$scope.test = TestObj.rec;
					}

					// if is a reissued microtask
					// retrieve the initial microtask
					if ( angular.isDefined( $scope.microtask.reissuedFrom ) ) {

						$scope.reissuedMicrotask = microtasksService.get($scope.microtask.reissuedFrom);
	   					$scope.reissuedMicrotask.$loaded().then(function() {
							//choose the right template
							if ($scope.microtask.type !== undefined && templates[$scope.microtask.type] !== undefined)
								$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
							else
								$scope.templatePath = "/html/templates/microtasks/no_microtask.html";
						});

					} 
					// otherwise
					else {
						
						//choose the right template
						if ($scope.microtask.type !== undefined && templates[$scope.microtask.type] !== undefined)
							$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
						else
							$scope.templatePath = "/html/templates/microtasks/no_microtask.html";
					}
				});
			})
			.error(function(data, status, headers, config) {

				$scope.templatePath = "/html/templates/microtasks/no_microtask.html";

				$scope.checkQueueIn = waitTimeInSeconds; 
				var timerInterval = $interval(function(){
					$scope.checkQueueIn -- ;
				}, 1000);

				checkQueueTimeout = $timeout(function() {
					$interval.cancel(timerInterval);
					$scope.$emit('load');
				}, 30*1000); // check the queue every 30 seconds
			});
	});

	// ------- MESSAGE LISTENERS ------- //

	// listen for message 'submit microtask'
	$scope.$on('submitMicrotask', function(event, formData) {

		if ($scope.microtask === undefined)
			return;

		$http.post('/' + $rootScope.projectId + '/ajax/submit?type=' + $scope.microtask.type + '&key=' + $scope.microtask.$id, formData)
			.success(function(data, status, headers, config) {

				//Push the microtask submit data onto the Firebase history stream
				$scope.microtask.submission = formData;
				$scope.microtask.$save();
				$scope.microtask = undefined;
				$scope.$emit('loadMicrotask');
				console.log("submit success");
			})
			.error(function(data, status, headers, config) {
				console.log(data);
				$scope.microtask = undefined;
				console.log("submit error");
			});
	});

	// listen for message 'skip microtask'
	$scope.$on('skipMicrotask', function(event, data) {

		if ($scope.microtask == undefined)
			return;

		console.log("skip fired");
		$http.get('/' + $rootScope.projectId + '/ajax/submit?type=' + $scope.microtask.type + '&key=' + $scope.microtask.$id + '&skip=true')
			.success(function(data, status, headers, config) {
				$scope.microtask = undefined;
				$scope.$emit('loadMicrotask');
			})
			.error(function(data, status, headers, config) {
				console.log("skip error");
				console.log(data);
				$scope.microtask = undefined;
			});
	});

		
	$scope.startTutorial = function(tutorialName) {
		$scope.$broadcast('tutorial-' + tutorialName);
	};


}]);


////////////////////////////
// LEADERBOARD CONTROLLER //
////////////////////////////
myApp.controller('LeaderboardController', ['$scope', '$rootScope', '$firebase', function($scope, $rootScope, $firebase) {
	// create the reference and the sync
	var ref = new Firebase($rootScope.firebaseURL + '/leaderboard/leaders');
	var sync = $firebase(ref);
	// bind the array to scope.leaders
	$scope.leaders = sync.$asArray();
	$scope.leaders.$loaded().then(function() {});
}]);


///////////////////////////////
// ONLINE WORKERS CONTROLLER //
///////////////////////////////
myApp.controller('OnlineWorkersController', ['$scope', '$rootScope', '$firebase', function($scope, $rootScope, $firebase) {
	/*
	var diffInSec = 60+60*5; // how wide is the timewindow
	var currDate  = new Date();
	var endTimestamp   = currDate.getTime()+1*60*1000; // +1 to see also the current worker
	var startTimestamp = endTimestamp - diffInSec*1000;

	var startDate = new Date();
	startDate.setTime(startTimestamp);
	var endDate   = new Date();
	endDate.setTime(endTimestamp);
	console.log(startDate);
	console.log(endDate);
	console.log("diff: "+(endTimestamp-startTimestamp)/60000);
*/
	var ref = new Firebase($rootScope.firebaseURL + '/status/presences/');
	var sync = $firebase(ref);
	// bind the array to scope.onlineWorkers

	$scope.onlineWorkers = sync.$asArray();
	$scope.onlineWorkers.$loaded().then(function() {});
}]);



///////////////////////////////////
//TYPE BROWSER    CONTROLLER     //
///////////////////////////////////
myApp.controller('typeBrowserController', ['$scope', '$rootScope', '$firebase', '$filter', 'ADTService', function($scope, $rootScope, $firebase, $filter, ADTService) {
	$scope.ADTs = ADTService.getAllADTs();
}]);
