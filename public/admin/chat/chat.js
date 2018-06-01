'use strict';

/**
 * @ngdoc chat
 * @name crowdAdminApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('ChatCtrl', ['$scope', '$firebase',  'firebaseUrl', function ($scope, $firebase, firebaseUrl) {
    var sync = $firebase(new Firebase(firebaseUrl+"/chat"));
  	$scope.chat = sync.$asArray();

  	$scope.newMessage = '';
  	$scope.sendMessage = function(){
  		$scope.chat.$add({
  			"createdAt": Date.now(),
  			"microtaskKey": "",
  			"text": $scope.newMessage,
  			"workerHandle":"admin",
  			"workerId":"admin"}).then(function(){ $scope.newMessage = "";});

  	};
  	
  }]);
