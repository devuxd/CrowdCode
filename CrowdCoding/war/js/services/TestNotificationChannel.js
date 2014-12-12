myApp.factory('TestNotificationChannel', [ '$rootScope', function($rootScope) {
	
	// private notifications messages
	var _RUN_TESTS_ = '_RUN_TESTS_';
	var _RUN_TESTS_FINISHED_ = '_RUN_TESTS_FINISHED_';
	var _TEST_READY_ = '_TEST_READY_';
	var _STUB_READY_ = '_STUB_READY_';


	// publish a run tests notification 
	var runTests = function(item){
		$rootScope.$broadcast(_RUN_TESTS_,{ item: item });
	};

	// subscribe to run tests notification
	var onRunTests = function($scope,handler){
		$scope.$on(_RUN_TESTS_,function(event.args){
			handler(args.item);
		});
	});

	// publish a run tests finished notification 
	var runTestsFinished = function(item){
		$rootScope.$broadcast(_RUN_TESTS_FINISHED_,{ item: item });
	};

	// subscribe to run tests finished notification
	var onRunTestsFinished = function($scope,handler){
		$scope.$on(_RUN_TESTS_FINISHED_,function(event.args){
			handler(args.item);
		});
	});

	// publish a test ready notification 
	var testReady = function(item){
		$rootScope.$broadcast(_TEST_READY_,{ item: item });
	};

	// subscribe to test ready notification
	var onTestReady = function($scope,handler){
		$scope.$on(_TEST_READY_,function(event.args){
			handler(args.item);
		});
	});

	// publish a stub ready notification
	var stubReady = function(item){
		$rootScope.$broadcast(_STUB_READY_,{ item: item });
	};

	// subscribe to stub ready notification
	var onStubReady = function($scope,handler){
		$scope.$on(_STUB_READY_,function(event.args){
			handler(args.item);
		});
	});

	// return the public accessible methods
	return {
		runTests           : runTests,
		onRunTests         : onRunTests,
		runTestsFinished   : runTestsFinished,
		onRunTestsFinished : onRunTestsFinished,
		testReady          : testReady,
		onTestReady        : onTestReady,
		stubReady          : stubReady,
		onStubReady        : onStubReady
	};
});