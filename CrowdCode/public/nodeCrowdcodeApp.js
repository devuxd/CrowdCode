'use strict';

var crowdcodeApp = angular.module('nodeCrowdcodeApp', ['ui.router', 'firebase', 'mgcrea.ngStrap'])
  .service('Auth', ['$q', '$firebase', '$firebaseAuth',
    function($q, $firebase, $firebaseAuth) {
      var auth = $firebaseAuth();
      return auth;
    }
  ])
  .factory('Users', function($firebaseArray, $firebaseObject) {
    var usersRef = firebase.database().ref('users');
    var users = $firebaseArray(usersRef);

    var Users = {
      getProfile: function(uid) {
        return $firebaseObject(usersRef.child(uid));
      },
      getDisplayName: function(uid) {
        return users.$getRecord(uid).displayName;
      },
      all: users
    };

    return Users;
  })
  .run(["$rootScope", "$state", function($rootScope, $state) {
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      // We can catch the error thrown when the $requireSignIn promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
        $state.go("welcome");
      }
    });
  }])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    var config = {
      apiKey: "AIzaSyCmhzDIbe7pp8dl0gveS2TtOH4n8mvMzsU",
      authDomain: "crowdcode2.firebaseapp.com",
      databaseURL: "https://crowdcode2.firebaseio.com",
      projectId: "crowdcode2",
      storageBucket: "crowdcode2.appspot.com",
      messagingSenderId: "382318704982"
    };
    firebase.initializeApp(config);

    $urlRouterProvider.otherwise('/');

    $stateProvider
      // Welcome PAGE ========================================
      .state('welcome', {
        url: '/',
        templateUrl: 'welcome.html',
        controller: 'WelcomeCtrl as welcome',
        resolve: {
          // controller will not be loaded until $waitForSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function(Auth) {
            // $waitForSignIn returns a promise so the resolve waits for it to complete
            return Auth.$waitForSignIn();
          }]
        }
      })
      // clientRequest PAGE =================================
      .state('clientRequest', {
        url: '/clientRequest',
        templateUrl: './clientReq/client_request.html',
        controller: 'ClientRequestController as client',
        resolve: {
          auth: function($state, Users, Auth) {
            return Auth.$requireSignIn().catch(function() {
              $state.go('welcome');
            });
          }
        }
      });
  }])
  .controller('MainCtrl', ['$rootScope', 'Auth', '$http', function($rootScope, Auth, $http) {
    Auth.$onAuthStateChanged(user => {
      if (user) {
        $rootScope.user = user;
        var idToken = user.ie;
        $http({
          method: "POST",
          url: "api/v1/authenticate",
          data: {
            "idToken": idToken
          },
          headers: {
            'Authorization': 'Bearer ' + idToken
          },
          responseType: "json",
        }).then(result => {
          console.log(result);
        }).catch(err => {
          console.log(err);
        });
        //console.log(fbAuth.$getAuth());
        console.log("user is logged in");
      } else {
        $rootScope.user = null;
        console.log("user is not logged in");
      }
    })
  }])
  .controller('WelcomeCtrl', ['$rootScope', '$state', 'Auth', 'currentAuth', function($rootScope, $state, Auth, currentAuth) {
    var vm = this;
    console.log(currentAuth.ie);
    vm.goto = function() {
      if ($rootScope.user) {
        $state.go('clientRequest');
      } else {
        var provider = new firebase.auth.GoogleAuthProvider();
        //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        provider.setCustomParameters({
          'login_hint': 'user@example.com'
        });
        Auth.$signInWithRedirect(provider);
      }
    }

  }]);
