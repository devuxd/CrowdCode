// create CrowdCodeWorker App and load modules
var myApp = angular.module('statistics',[ 
	'ngAnimate', 
	'firebase', 
	'ui.ace', 
	'ngSanitize', 
	'mgcrea.ngStrap'
]);

// configure app modules
myApp.config(function() {


});

// define app constants
myApp.constant('projectId',projectId);
myApp.constant('workerId',workerId);
myApp.constant('firebaseUrl','https://crowdcode.firebaseio.com/projects/allTogetherDrawV10');

myApp.directive('statisticsPanel',function($timeout,$firebase,firebaseUrl){
	return {
		scope: {},
		templateUrl: '/statistics/chat.html',
		link: function($scope,$element,$attrs){
		    var chatSync = $firebase(new Firebase(firebaseUrl+'/chat'));
			$scope.chat = chatSync.$asArray();
		}
	};
});


// run the app
myApp.run();