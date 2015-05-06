'use strict';

/**
 * @ngdoc overview
 * @name crowdAdminApp
 * @description
 * # crowdAdminApp
 *
 * Main module of the application.
 */
var $cache = null;
angular
  .module('crowdAdminApp', [
    'templates-main',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'mgcrea.ngStrap',
    'firebase',
    'nvd3',
    'ui.router',
    'ui.ace',
    'mgcrea.ngStrap' 
  ])
  .config(function ($stateProvider) {

    $stateProvider
      .state('dashboard',{
        url: '',
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl'
      })

      .state('microtasks',{
        url: '/microtasks',
        templateUrl: 'microtasks/microtasks.html',
        controller: 'MicrotasksCtrl'
      })
      
      .state('microtasksDetail',{
        url: '/microtasks/:microtaskKey',
        templateUrl: 'microtasks/microtaskDetail.html',
        controller: 'MicrotaskDetailCtrl'
      });

    //   .when('/microtasks', {
    //     templateUrl: 'microtasks/microtasks.html',
    //     controller: 'MicrotasksCtrl'
    //   })
    //   .when('/microtasks/:microtaskKey', {
    //     templateUrl: 'microtasks/microtaskDetail.html',
    //     controller: 'MicrotaskDetailCtrl',
    //     reloadOnSearch: false
    //   })
    //   .when('/feedback', {
    //     templateUrl: 'feedback/feedback.html',
    //     controller: 'FeedbackCtrl'
    //   })
    //   .when('/chat', {
    //     templateUrl: 'chat/chat.html',
    //     controller: 'ChatCtrl'
    //   })
    //   .when('/code', {
    //     templateUrl: 'code/code.html',
    //     controller: 'CodeCtrl'
    //   })
    //   .when('/functions', {
    //     templateUrl: 'functions/functions.html',
    //     controller: 'FunctionsCtrl',
    //     controllerAs: 'vm'
    //   })
    //   .when('/tests', {
    //     templateUrl: 'tests/tests.html',
    //     controller: 'TestsCtrl',
    //     controllerAs: 'vm'
    //   })
    //   .when('/users', {
    //     templateUrl: 'users/users.html',
    //     controller: 'UsersCtrl'
    //   })
    //   .otherwise({
    //     redirectTo: '/dashboard'
    //   });
  })
  .run(['$rootScope', '$location', '$anchorScroll', '$templateCache','Microtasks','eventsService',function($rootScope, $location, $anchorScroll, $templateCache, Microtasks, eventsService) {
    
    // $rootScope.$on('$viewContentLoaded', function() {
    //   $templateCache.removeAll();
    // });

    $rootScope.go = function ( path ) {
      $location.url( path ); 
    };

    // //when the route is changed scroll to the proper element.
    // $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    //   if( $routeParams.scrollTo !== undefined ){
    //     $location.hash($routeParams.scrollTo);
    //     $location.search('scrollTo',null);
    //     $anchorScroll(); 
    //   } 
    // });

    Microtasks.$loaded().then(function(){
      eventsService.addListener( Microtasks.handleEvent );
      eventsService.init();
    });

    $rootScope.time = new Date().getTime();

    // $cache = $templateCache;
    
  }])
.constant('firebaseUrl','https://crowdcode.firebaseio.com/projects/'+projectId);
