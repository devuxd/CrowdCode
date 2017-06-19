'use strict';

var crowdcodeApp = angular.module('nodeCrowdcodeApp', ['ui.router', 'firebase', 'mgcrea.ngStrap'])
  .service('Auth', ['$firebaseAuth',
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ])
  .factory('Workers', ['$firebaseArray', '$firebaseObject', function($firebaseArray, $firebaseObject) {
    var workersRef = firebase.database().ref('Workers');
    var workers = $firebaseArray(workersRef);

    var Workers = {
      getProfile: function(uid) {
        return $firebaseObject(workersRef.child(uid));
      },
      getDisplayName: function(uid) {
        return workers.$getRecord(uid).name;
      },
      all: workers
    };

    return Workers;
  }])
  .service('Projects', ['$http', function($http) {
    this.fetch = function() {
      return $http.get('/api/v1/projects');
    }
  }])
  .run(function($transitions) {
    $transitions.onStart({}, function() {
      //console.log("started .....");
    });
    $transitions.onError({}, function(trans) {
      var state = trans.injector().get('$state');
      if (trans.error().detail === 'AUTH_REQUIRED') {
        state.go('welcome');
      }
    })
  })
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
      .state('project', {
        url: "/project/:projectname",
        templateUrl: './clientDist/client.html',
      })
      // clientRequest PAGE =================================
      .state('clientRequest', {
        url: '/clientRequest',
        templateUrl: './clientReq/client_request.html',
        controller: 'ClientRequestController as client',
        resolve: {
          auth: function($state, Auth) {
            return Auth.$requireSignIn();
          },
          'projects': ['$firebaseArray', '$q', function($firebaseArray, $q) {
            var ref = firebase.database().ref().child("clientRequests");;
            var projectNames = $firebaseArray(ref);
            var projects = [];
            var deferred = $q.defer();
            projectNames.$loaded().then(function() {
              angular.forEach(projectNames, function(value, key) {
                projects.push(value.$id);
              });
              deferred.resolve(projects);
            });
            return deferred.promise;
          }]
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
          //console.log(result);
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
