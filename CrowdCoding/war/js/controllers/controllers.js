
////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
myApp.controller('AppController', ['$scope','$rootScope','$firebase','userService', 'testsService', 'functionsService', 'testRunnerService', function($scope,$rootScope,$firebase,userService,testsService,functionsService, testRunnerService) {
	
	// current session variables
    $rootScope.projectId    = projectId;
    $rootScope.workerId     = workerId;
    $rootScope.workerHandle = workerHandle;
    $rootScope.firebaseURL  = firebaseURL;
    
    // hook from firebase the workers online
	var workersSync = $firebase(new Firebase($rootScope.firebaseURL+'/status/loggedInWorkers'));
	$rootScope.onlineWorkers = workersSync.$asArray();
	
	// wrapper for user login and logout
	$rootScope.workerLogin = function(){
		userService.login();
	}
	
	$rootScope.workerLogout = function(){
		userService.logout();
	}
	
	//user.listenForJobs();			
	testsService.init();		
	functionsService.init();

	//console.log(testRunnerService.runTestsForFunction(1));
}]); 


//////////////////////////
// MICROTASK CONTROLLER //
//////////////////////////
myApp.controller('MicrotaskController', ['$scope','$rootScope','$firebase','$http', function($scope,$rootScope,$firebase,$http) {
	
	// private vars
	var templatesURL = "/html/templates/microtasks/";
	var templates = {
			'WriteFunction':'write_function',
			'WriteFunctionDescription':'write_function_description',
			'WriteTest':'write_test',
			'WriteTestCases':'write_test_cases',
			'WriteCall':'write_call',
	}


	// initialize microtask and templatePath
	$scope.microtask = {};
	$scope.templatePath = "";//"/html/templates/microtasks/";
	


	// listen for message 'submit microtask'
	$scope.$on('submitMicrotask',function(event,data){
		console.log('submit fired');
	});
	
	// listen for message 'skip microtask'
	$scope.$on('skipMicrotask',function(event,data){
		$http.get('/'+$rootScope.projectId+'/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id + '&skip=true').
		  success(function(data, status, headers, config) {
			  console.log("skip fired");
			  $scope.load();
		  });
	});

	// load microtask:
	// request a new microtask from the backend and if success
	// inizialize template and microtask-related values
	$scope.load = function(){

		console.log("loading microtask");

		$http.get('/'+$rootScope.projectId+'/fetch?AJAX').
		  success(function(data, status, headers, config) {

		  	//choose the right template
		 	$scope.templatePath = templatesURL + templates[data.type] + ".html";

		  	// create the reference and the sync
			var ref  = new Firebase($rootScope.firebaseURL+'/microtasks/' + data.id);
			var sync = $firebase(ref);

			// load the microtask data
			$scope.microtask = sync.$asObject();
			$scope.microtask.$loaded().then(function(){

				// assign title 
				$scope.datas = data;

				// retrieve the related function
				// IMPROVEMENT: is possible to avoid the query to firebase and use functionService????
				var functionId = angular.isDefined($scope.microtask.functionID) ? $scope.microtask.functionID : $scope.microtask.testedFunctionID;
				if( angular.isDefined(functionId) ) {
					var ref  = new Firebase($rootScope.firebaseURL+'/artifacts/functions/' + functionId);
					$scope.funct = $firebase(ref).$asObject();
				}

				// retrieve the related test 
				// IMPROVEMENT: is possible to avoid the query to firebase and use testService????
				var testId = angular.isDefined($scope.microtask.testID) ? $scope.microtask.testID : $scope.microtask.testedFunctionID;
				if( angular.isDefined($scope.microtask.testID) ) {
					var ref  = new Firebase($rootScope.firebaseURL+'/artifacts/tests/' + $scope.microtask.testID);
					$scope.test = $firebase(ref).$asObject();
				}


				// initialize testCases
				// if microtask.submission and microtask.submission.testCases are defined 
				// assign available testCases otherwise initialize a new array
				$scope.testCases = ( angular.isDefined($scope.microtask.submission) && angular.isDefined($scope.microtask.submission.testCases) ) ? 
								   $scope.microtask.submission.testCases : [] ;


				// debug stuff
				console.log(data);
				console.log($scope.microtask); 
				console.log($scope.funct);
				

			});
		  }).
		  error(function(data, status, headers, config) {

				$scope.templatePath = "/html/templates/microtasks/no_microtask.html";

		  });
	};
	



	// ------- WRITE TEST CASES UTILS ------- //
	// addTestCase and deleteTestCase utils function for microtask WRITE TEST CASES
	$scope.addTestCase = function(){
		var testCase = { text: '', added: true, deleted: false, id: $scope.testCases.length };
		$scope.testCases.push(testCase);	
	}
	$scope.deleteTestCase = function(index){
		$scope.testCases.splice(index,1);
	}

	// auto-load microtask on document load
	$scope.load();
}]);  


//////////////////////
// SCORE CONTROLLER //
//////////////////////
myApp.controller('ScoreController', ['$scope','$rootScope','$firebase', function($scope,$rootScope,$firebase) {
	// create the reference and the sync
	var ref  = new Firebase($rootScope.firebaseURL+'/workers/'+$rootScope.workerId+'/score');
    var sync = $firebase(ref);
    // create the object and bind the firebase ref to the scope.score var
    var obj = sync.$asObject();
    obj.$bindTo($scope,"score");
    obj.$loaded().then(function(){
    	if($scope.score.$value===null)
    		$scope.score.$value=0;
    });
}]);  


////////////////////////////
// LEADERBOARD CONTROLLER //
////////////////////////////
myApp.controller('LeaderboardController', ['$scope','$rootScope','$firebase',function($scope,$rootScope,$firebase) {
	// create the reference and the sync
	var ref  = new Firebase($rootScope.firebaseURL+'/leaderboard/leaders');
	var sync = $firebase(ref);
	// bind the array to scope.leaders
	$scope.leaders = sync.$asArray();
	$scope.leaders.$loaded().then(function(){});
}]);  

//////////////////////
// STATS CONTROLLER //
//////////////////////
myApp.controller('StatsController', ['$scope','$rootScope','$firebase','$filter','functionsService','testsService',function($scope,$rootScope,$firebase,$filter,functionsService,testsService) {
	$scope.locCount = 5;
	$scope.microtasksCount = 0;
	$scope.functionsCount = 0;
	$scope.testsCount = 0;
	/*
	functionsService.allFunctions.$loaded(function(x) {
		$scope.functionsCount = x.length
	});
	
	testsService.allTests.$loaded(function(x) {
		$scope.testsCount = x.length
	});*/
}]); 

/////////////////////
// NEWS CONTROLLER //
/////////////////////
myApp.controller('NewsController', ['$scope','$rootScope','$firebase','$filter',function($scope,$rootScope,$firebase,$filter) {
	// create the reference and the sync
	var ref  = new Firebase($rootScope.firebaseURL+'/workers/'+$rootScope.workerId+'/newsfeed');
	var sync = $firebase(ref);
	// bind the array to scope.leaders
	$scope.news = sync.$asArray();
}]);  

/////////////////////
// CHAT CONTROLLER //
/////////////////////
myApp.controller('ChatController', ['$scope','$rootScope','$firebase','$filter',function($scope,$rootScope,$firebase,$filter) {
	// create the reference and the sync
	var chatRef  = new Firebase($rootScope.firebaseURL+'/chat');
	var sync = $firebase(chatRef);
	// bind the array to scope.leaders
	$scope.messages = sync.$asArray();
	
	
	$scope.input = "";
	// key press function
	$scope.key = function(e){
		
		//console.log("keypress "+e.keyCode);
	    if (e.keyCode == 13) 
	    {
	    	$scope.messages.$add({text: $scope.input,workerHandle: $rootScope.workerHandle}).then(function(ref) {
    		   // after the add event
    		});
	    	//chatRef.push({text: $('#chatInput').val(), workerHandle: '<%=workerHandle%>'});
	    	$scope.input = "";
	    	return false;
	    }
	};
}]);  
