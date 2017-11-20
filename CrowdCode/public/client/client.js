// create the AngularJS app, load modules and start

// create CrowdCodeWorker App and load modules
angular
  .module('crowdCode', [
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
    'angularytics',
  ])
  .service('Auth', ['$firebaseAuth',
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ])
  .service('CurrentUserID', function($http, $q) {
    var deferred = $q.defer();
    $http.get('/api/v1/currentWorkerId').then(function(payload) {
      q.resolve(payload.data);
    }, function(err) {
      q.reject(err);
    });
    return deferred.promise;
  })
  .factory('httpRequestInterceptor', function($q, Auth) {
    return {
      request: function(config) {
        if (sessionStorage.getItem('accessToken')) {
          //console.log("token[" + window.localStorage.getItem('accessToken') + "], config.headers: ", config.headers);
          config.headers.authorization = 'Bearer ' + sessionStorage.getItem('accessToken');
        }
        return config || $q.when(config);
      },
      responseError: function(rejection) {

        console.log("Found responseError: ", rejection);
        if (rejection.status == 401) {

          console.log("Access denied (error 401), please login again");
          //$location.nextAfterLogin = $location.path();
          //window.location.href = '/login';
        }
        return $q.reject(rejection);
      }
    };
  })
  .config(function($dropdownProvider, ngClipProvider, AngularyticsProvider, $httpProvider) {
    var config = {
      apiKey: "AIzaSyCmhzDIbe7pp8dl0gveS2TtOH4n8mvMzsU",
      authDomain: "crowdcode2.firebaseapp.com",
      databaseURL: "https://crowdcode2.firebaseio.com",
      projectId: "crowdcode2",
      storageBucket: "crowdcode2.appspot.com",
      messagingSenderId: "382318704982"
    };
    firebase.initializeApp(config);

    //$httpProvider.interceptors.push('httpRequestInterceptor');

    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);

    ngClipProvider.setPath("/include/zeroclipboard-2.2.0/dist/ZeroClipboard.swf");

    angular.extend($dropdownProvider.defaults, {
      html: true
    });

  })
  .constant('workerId', workerId)
  .constant('projectId', projectId)
  .constant('firebaseUrl', 'https://crowdcode2.firebaseio.com/Projects/' + projectId)
  .constant('logoutUrl', logoutURL)
  .run(function($rootScope, $interval, $modal, $firebaseArray, firebaseUrl, logoutUrl, userService, functionsService, AdtService,
    avatarFactory, questionsService, notificationsService, newsfeedService, Angularytics, testsService) {

    // current session variables
    $rootScope.projectId = projectId;
    $rootScope.workerId = workerId;
    $rootScope.workerHandle = workerHandle;
    $rootScope.firebaseUrl = firebaseUrl;
    $rootScope.userData = userService.data;
    $rootScope.logoutUrl = logoutUrl;
    $rootScope.avatar = avatarFactory.get;

    var userStatistics = $modal({
      scope: $rootScope,
      container: 'body',
      animation: 'am-fade-and-scale',
      placement: 'center',
      template: '/client/achievements/achievements_panel.html',
      show: false
    });
    var workerProfile = $modal({
      scope: $rootScope.$new(true),
      container: 'body',
      animation: 'am-fade-and-scale',
      placement: 'center',
      template: '/client/worker_profile/workerStatsModal.html',
      show: false
    });
    var profileModal = $modal({
      scope: $rootScope,
      container: 'body',
      animation: 'am-fade-and-scale',
      placement: 'center',
      template: '/client/widgets/popup_user_profile.html',
      show: false
    });
    var servicesLoadingStatus = {};
    var loadingServicesInterval = $interval(loadServices(), 200);


    $rootScope.$on('showUserStatistics', showStatistics);
    $rootScope.$on('showWorkerProfile', showWorkerProfile);
    $rootScope.$on('showProfileModal', showProfileModal);
    $rootScope.$on('serviceLoaded', serviceLoaded);
    $rootScope.$on('sendFeedback', sendFeedback);

    $rootScope.trustHtml = function(unsafeHtml) {
      return $sce.trustAsHtml(unsafeHtml);
    };
    $rootScope.makeDirty = makeFormDirty;

    // Track interactions of interest and send to Google Analytics
    Angularytics.init();
    $rootScope.trackInteraction = function(interactionCategory, userAction, context) {
      var triggerElement = userAction + ': ' + context.target.innerHTML;
      Angularytics.trackEvent(interactionCategory, triggerElement, workerHandle);
    };

    function loadServices() {
      servicesLoadingStatus = {};
      functionsService.init();
      AdtService.init();
      questionsService.init();
      notificationsService.init();
      newsfeedService.init();
      testsService.init();

    }

    function serviceLoaded(event, nameOfTheService) {
      servicesLoadingStatus[nameOfTheService] = true;

      if (servicesLoadingStatus.hasOwnProperty('functions') &&
        servicesLoadingStatus.hasOwnProperty('adts') &&
        servicesLoadingStatus.hasOwnProperty('questions') &&
        servicesLoadingStatus.hasOwnProperty('newsfeed') &&
        servicesLoadingStatus.hasOwnProperty('tests')) {

        $interval.cancel(loadingServicesInterval);
        loadingServicesInterval = undefined;


        userService.listenForJobs();
        userService.listenForLogoutWorker();

        $rootScope.$broadcast('openDashboard');
        //$rootScope.$broadcast('fetchMicrotask');

        $rootScope.$broadcast('queue-tutorial', 'main', false, function() {
          $rootScope.$broadcast('showProfileModal');
        });
      }
    }

    function showProfileModal() {
      profileModal.$promise.then(profileModal.show);
    }

    function showStatistics() {
      userStatistics.$promise.then(userStatistics.show);
    }

    function showWorkerProfile($event, id) {
      workerProfile.$scope.id = id;
      workerProfile.$promise.then(workerProfile.show);
    }


    function makeFormDirty(form) {
      angular.forEach(form, function(formElement, fieldName) {
        // If the fieldname doesn't start with a '$' sign, it means it's form
        if (fieldName[0] !== '$') {
          if (angular.isFunction(formElement.$setDirty))
            formElement.$setDirty();

          //if formElement as the proprety $addControl means that have other form inside him
          if (formElement !== undefined && formElement.$addControl)
            makeFormDirty(formElement);
        }
      });
    }

    function sendFeedback(event, message) {

      if (message.toString() != '') {
        ////console.log("message " + message.toString());
        var feedback = {
          // 'microtaskType': $scope.microtask.type,
          // 'microtaskID': $scope.microtask.id,
          'workerHandle': $rootScope.workerHandle,
          'workerID': $rootScope.workerId,
          'feedback': message.toString()
        };
        var feedbackRef = firebase.database().ref().child('Projects').child(projectId).child('feedback');
        var feedbacks = $firebaseArray(feedbackRef);
        feedbacks.$loaded().then(function() {
          feedbacks.$add(feedback);
        });
      }
    }
  });
