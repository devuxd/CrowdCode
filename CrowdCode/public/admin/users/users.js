'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('UsersCtrl', ['$scope', '$firebase', 'firebaseUrl', function ($scope, $firebase, firebaseUrl) {

    var sync = $firebase(new Firebase(firebaseUrl+'/workers'));
  	$scope.users = sync.$asArray();

  }]);
