// create the AngularJS app, load modules and start

// create CrowdCodeWorker App and load modules
var myApp = angular.module('crowdCodeWorker',[ 
	'ngAnimate', 
	'firebase', 
	'ui.codemirror', 
	'ngSanitize', 
	'ui.ace', 
	'mgcrea.ngStrap', 
	'angular-loading-bar', 
	'ngClipboard'
]);

// configure app modules
myApp.config(function($dropdownProvider, ngClipProvider) {

  ngClipProvider.setPath("/include/zeroclipboard-2.2.0/dist/ZeroClipboard.swf");
  
  angular.extend($dropdownProvider.defaults, {
    html: true
  });

});

// define app constants
myApp.constant('firebaseUrl',firebaseURL);
myApp.constant('logoutUrl',logoutURL);

// run the app
myApp.run();


