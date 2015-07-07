// create the AngularJS app, load modules and start

// create CrowdCodeWorker App and load modules
angular
	.module('crowdCode',[ 
		'templates-main',
		'firebase',  
		'ngAnimate',
		'ngMessages', 
		'ngSanitize', 
		'ngClipboard',
		'ngTagsInput',
		'mgcrea.ngStrap',
		'ui.ace', 
		'ui.layout',
		'luegg.directives',
		'toaster',
		'yaru22.angular-timeago',
	])
	.config(function($dropdownProvider, ngClipProvider ) { 

		ngClipProvider.setPath("/include/zeroclipboard-2.2.0/dist/ZeroClipboard.swf");

		angular.extend($dropdownProvider.defaults, { html: true });

	})
	.constant('workerId'   ,workerId) 
    .constant('projectId'  ,projectId)
	.constant('firebaseUrl', 'https://crowdcode.firebaseio.com/projects/' + projectId )
	.constant('logoutUrl'  ,logoutURL)
	.run(function($rootScope, $interval, $modal, $firebaseArray,  firebaseUrl, logoutUrl, userService,  functionsService, ADTService, avatarFactory, questionsService, notificationsService, newsfeedService ){

		// current session variables
		$rootScope.projectId    = projectId;
		$rootScope.workerId     = workerId;
		$rootScope.workerHandle = workerHandle;
		$rootScope.firebaseUrl  = firebaseUrl;
		$rootScope.userData     = userService.data;
		$rootScope.logoutUrl    = logoutUrl;
		$rootScope.avatar       = avatarFactory.get;
		
		var profileModal            = $modal({scope: $rootScope, container: 'body', animation: 'am-fade-and-scale', placement: 'center', template: '/client/widgets/popup_user_profile.html', show: false});
		var servicesLoadingStatus   = {};
		var loadingServicesInterval = $interval(loadServices(), 200);

		$rootScope.$on('showProfileModal', showProfileModal);
		$rootScope.$on('serviceLoaded'   , serviceLoaded);
		$rootScope.$on('sendFeedback', sendFeedback);

	

        $rootScope.trustHtml = function (unsafeHtml){
            return $sce.trustAsHtml(unsafeHtml);
        };
		$rootScope.makeDirty = makeFormDirty;
		

		function loadServices(){
			servicesLoadingStatus = {};
			functionsService.init();
			ADTService.init();
			questionsService.init();
			notificationsService.init();
			newsfeedService.init();
		}

		function serviceLoaded(event,nameOfTheService){
			servicesLoadingStatus[nameOfTheService] = true;

			if ( servicesLoadingStatus.hasOwnProperty('functions') &&
				 servicesLoadingStatus.hasOwnProperty('adts') &&
				 servicesLoadingStatus.hasOwnProperty('questions') &&
				 servicesLoadingStatus.hasOwnProperty('newsfeed')) {

				$interval.cancel(loadingServicesInterval);
				loadingServicesInterval = undefined;


				userService.listenForJobs();
				userService.listenForLogoutWorker();

				$rootScope.$broadcast('fecthMicrotask');

				$rootScope.$broadcast('queue-tutorial','main', false, function(){
					$rootScope.$broadcast('showProfileModal');
				});
			}
		}

		function showProfileModal() {
			profileModal.$promise.then(profileModal.show);
		}


		function makeFormDirty(form){
			angular.forEach(form, function(formElement, fieldName) {
				// If the fieldname doesn't start with a '$' sign, it means it's form
				if (fieldName[0] !== '$'){
					if(angular.isFunction(formElement.$setDirty))
		                formElement.$setDirty();

					//if formElement as the proprety $addControl means that have other form inside him
					if (formElement !== undefined && formElement.$addControl)
						makeFormDirty(formElement);
				}
			});
		}

		function sendFeedback(event, message) {

			if( message.toString() != '' ){
					////console.log("message " + message.toString());
				var feedback = {
					// 'microtaskType': $scope.microtask.type,
					// 'microtaskID': $scope.microtask.id,
					'workerHandle': $rootScope.workerHandle,
					'workerID': $rootScope.workerId,
					'feedback': message.toString()
				};


				feedbacks = $firebaseArray(new Firebase(firebaseUrl + '/feedback'));
				feedbacks.$loaded().then(function() {
					feedbacks.$add(feedback);
				});
			}
		}
	});


