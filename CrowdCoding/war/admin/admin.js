
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
    'ngSanitize',
    'ui.router',
    'ui.ace',
    'firebase',
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
      })

      
      .state('feedback',{
        url: '/feedback',
        templateUrl: 'feedback/feedback.html',
        controller: 'FeedbackCtrl'
      })
    
      .state('chat',{
        url: '/chat',
        templateUrl: 'chat/chat.html',
        controller: 'ChatCtrl'
      })

      .state('code',{
        url: '/code',
        templateUrl: 'code/code.html',
        controller: 'CodeCtrl'
      })

      .state('functions',{
        url: '/functions',
        templateUrl: 'functions/functions.html',
        controller: 'FunctionsCtrl',
        controllerAs: 'vm'
      })

      .state('tests',{
        url: '/tests',
        controller: 'TestsCtrl',
        controllerAs: 'vm'
      })

      .state('users',{
        url: '/users',
        templateUrl: 'users/users.html',
        controller: 'UsersCtrl'
      })
      .state('questions',{
        url: '/questions',
        templateUrl: 'questions/questions.html',
        controller: 'QuestionsCtrl'
      });

  })
  .run(['$rootScope', '$location', '$anchorScroll', '$templateCache','Microtasks','eventsService',function($rootScope, $location, $anchorScroll, $templateCache, Microtasks, eventsService) {
    
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
    
  }])
.constant('firebaseUrl','https://crowdcode.firebaseio.com/projects/'+projectId)
.filter('keylength', function(){
  return function(input){
    if(angular.isObject(input)){
      return Object.keys(input).length;
    } else {
      return null;
    }
  };
})
.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    
    angular.forEach(items, function(item) {
      filtered.push(item);
    });

    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });

    if(reverse) 
      filtered.reverse();

    return filtered;
  };
});
