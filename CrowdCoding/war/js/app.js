// create the AngularJS app, load modules and start

// create CrowdCodeWorker App and load modules
angular
	.module('crowdCode',[ 
		'ngAnimate',
		'ngMessages', 
		'firebase', 
		'ui.codemirror', 
		'ngSanitize', 
		'ui.ace', 
		'mgcrea.ngStrap', 
		'ngClipboard',
	    'luegg.directives'
	])
	.config(function($dropdownProvider, ngClipProvider ) {

		ngClipProvider.setPath("/include/zeroclipboard-2.2.0/dist/ZeroClipboard.swf");

		angular.extend($dropdownProvider.defaults, { html: true });

	})
	.constant('workerId'   ,workerId)
    .constant('projectId'  ,projectId)
	.constant('firebaseUrl',firebaseURL)
	.constant('logoutUrl'  ,logoutURL)
	.run();


