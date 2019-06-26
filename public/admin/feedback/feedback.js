'use strict';

/**
 * @ngdoc feedback
 * @name crowdAdminApp.controller:FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('FeedbackCtrl', ['$scope', '$firebase', 'firebaseUrl', function ($scope, $firebase, firebaseUrl) {
    var sync = $firebase(new Firebase(firebaseUrl+"/feedback"));
  	$scope.feedbacks = sync.$asArray();
  }]);
