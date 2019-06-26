////////////////////////
//TEST SERVICE   //
////////////////////////
angular
  .module('crowdCode')
  .factory('testsService', ['$rootScope', '$q', '$filter', '$firebaseObject', 'firebaseUrl', 'TestArray', 'Test', function($rootScope, $q, $filter, $firebaseObject, firebaseUrl, TestArray, Test) {

    var service = new function() {
      // Private variables
      var tests;

      // Public tests
      this.init = init;
      this.get = get;
      this.getVersion = getVersion;
      this.getAll = getAll;

      // Test bodies
      function init() {
        // hook from firebase all the tests declarations of the project
        var testRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('Tests');
        tests = new TestArray(testRef);
        tests.$loaded().then(function() {
          // tell the others that the tests services is loaded
          $rootScope.$broadcast('serviceLoaded', 'tests');
        });
      }

      // Get the test object, for the specified test id
      function get(id) {
        return tests.$getRecord(id);
      }

      function getAll() {
        return tests;
      }

      // Get the function object, in FunctionInFirebase format, for the specified function id
      function getVersion(id, version) {
        var deferred = $q.defer();
        var testRef = firebase.database().ref().child('Projects').child(projectId).child('history').child('artifacts').child('Tests').child(id).child(version);
        //new Firebase(firebaseUrl+ '/history/artifacts/tests/' + id+ '/' + version);
        var obj = $firebaseObject(testRef);
        obj.$loaded().then(function() {
          deferred.resolve(new Test(obj));
        });
        return deferred.promise;
      }

    };

    return service;
  }]);
