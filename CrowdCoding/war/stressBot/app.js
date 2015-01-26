// create CrowdCodeWorker App and load modules
var myApp = angular.module('stressBot',[ 
	'ngAnimate', 
	'firebase', 
	'ui.ace', 
	'mgcrea.ngStrap'
]);

// configure app modules
myApp.config(function() {


});

// define app constants
myApp.constant('projectId',projectId);

myApp.controller('MainController',['$scope','projectId',function($scope,projectId){
	$scope.projectId = projectId;

}]);

// run the app
myApp.run();