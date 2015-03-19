	////////////////////
// MAIN CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
angular
    .module('crowdCode')
    .controller('MainController', [
	'$scope',
	'$rootScope',
	'$firebase',
	'$interval',
	'$modal',
	'logoutUrl',
	'userService',
	'functionsService',
	'ADTService',
	'microtasksService',
	'TestList',
	'avatarFactory',
	function($scope, $rootScope, $firebase, $interval, $modal, logoutUrl, userService,  functionsService, ADTService, microtasksService, TestList, avatarFactory) {

		// current session variables
		$rootScope.projectId    = projectId;
		$rootScope.workerId     = workerId;
		$rootScope.workerHandle = workerHandle;
		$rootScope.firebaseURL  = firebaseURL;
		$rootScope.userData     = userService.data;
		$rootScope.logoutUrl    = logoutUrl;


		$scope.makeDirty = function (form)
		{
			angular.forEach(form, function(formElement, fieldName) {
				// If the fieldname doesn't start with a '$' sign, it means it's form
				if (fieldName[0] !== '$'){
					if(angular.isFunction(formElement.$setDirty))
		                formElement.$setDirty();

					//if formElement as the proprety $addControl means that have other form inside him
					if (formElement !== undefined && formElement.$addControl)
						$scope.makeDirty(formElement);
				}
			});
		};

		$scope.avatar = avatarFactory.get;

		 // Pre-fetch an external template populated with a custom scope
		var profileModal = $modal({scope: $scope, container: 'body', animation: 'am-fade-and-scale', placement: 'center', template: '/html/templates/popups/popup_user_profile.html', show: false});
		// Show when some event occurs (use $promise property to ensure the template has been loaded)
		$rootScope.$on('showProfileModal', function() {
			profileModal.$promise.then(profileModal.show);
		});


		// ---- SERVICES SYNC ----
		$scope.servicesLoadingStatus = {};

		//  services loading function
		var loadServices = function(){
			$scope.servicesLoadingStatus = {};
			functionsService.init();
			ADTService.init();
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
				 newVal.hasOwnProperty('adts') ) {
				$interval.cancel(loadingServicesInterval);
				loadingServicesInterval = undefined;
				stopWatchingLoadedServices();
				userService.listenForJobs();
				userService.listenForLogoutWorker();


				$rootScope.$broadcast('loadMicrotask');

				$rootScope.$broadcast('run-tutorial','main', false, function(){
					$rootScope.$broadcast('showProfileModal');
				});
			}
		},true);


		$rootScope.$on('sendFeedback', function(event, message) {
			////console.log("message " + message.toString());
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
			});

		});

}]);

