///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
myApp.controller('NoMicrotaskController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
}]);

///////////////////////////////
//  WRITE TEST CASES CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestCasesController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// DECLARE VARIABLES HERE

	// INITIALIZE FORM DATA HERE
	console.log("initialization of write test cases");

	$scope.submit = function(){
		// PREPARE FORM DATA HERE
		console.log("write test cases controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  Review CONTROLLER //
///////////////////////////////
myApp.controller('ReviewController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of review controller");

	$scope.submit = function(){
		console.log("review controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
myApp.controller('DebugTestFailureController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of debug test failure");

	$scope.submit = function(){
		console.log("debug test failure controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  REUSE SEARCH CONTROLLER //
///////////////////////////////
myApp.controller('ReuseSearchController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of reuse search controller");

	$scope.submit = function(){
		console.log("reuse search controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
myApp.controller('WriteCallController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write call");

	$scope.submit = function(){
		console.log("write call controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write function");

	$scope.submit = function(){
		console.log("write function controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionDescriptionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write function description");

	$scope.submit = function(){
		console.log("write function description controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);


///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write test controller");

	$scope.submit = function(){
		console.log("write test controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);

///////////////////////////////
//  WRITE TEST CASES CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestCasesController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {
	
	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write test cases  controller");

	$scope.submit = function(){
		console.log("write test cases controlle prepare form data");
		$scope.$emit('submitMicrotask');
	}

}]);