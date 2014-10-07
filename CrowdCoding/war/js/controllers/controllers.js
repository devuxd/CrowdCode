

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
	
	var templates = {
			'WriteFunction':'write_function',
			'WriteFunctionDescription':'write_function_description',
			'WriteTest':'write_test',
			'WriteTestCases':'write_test_cases',
			'WriteCall':'write_call',
	}
	
	// load microtask function
	$scope.microtask = {};
	$scope.templatePath = "";//"/html/templates/microtasks/";
	
	$scope.load = function(){
		console.log("loading microtask");
		$http.get('/'+$rootScope.projectId+'/fetch?AJAX').
		  success(function(data, status, headers, config) {
			 
			  $scope.templatePath = "/html/templates/microtasks/"+templates[data.type]+".html";
			
			  // create the reference and the sync
				var ref  = new Firebase($rootScope.firebaseURL+'/microtasks/' + data.id);
			    var sync = $firebase(ref);
			    // create the object and bind the firebase ref to the scope.score var
			    $scope.microtask = sync.$asObject();
			    
			    
			    $scope.microtask.$loaded().then(function(){
			    	console.log(	$scope.microtask);
			    	$scope.microtask.description = renderDescription($scope.microtask);
			    	
			    
			    });
			    
			//  console.log('dsgasdggdsadsag'+$scope.microtask);
			//  console.log($scope.templatePath);microtask
			  
		  }).
		  error(function(data, status, headers, config) {
			  $scope.templatePath = "/html/templates/microtasks/no_microtask.html";
		  });
	};
	
	$scope.$on('submitMicrotask',function(event,data){
		console.log('submit fired');
	});
	
	$scope.$on('skipMicrotask',function(event,data){
		console.log('/'+$rootScope.projectId+'/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id + '&skip=true');
		$http.get('/'+$rootScope.projectId+'/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id + '&skip=true').
		  success(function(data, status, headers, config) {
			  console.log(data);
		  });
		$scope.load();
	});

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

//////////////////////
//JAVA TUTORIAL     //
//////////////////////
myApp.controller('JavaTutorialController',  ['$scope','$rootScope','$firebase','$filter',function($scope,$rootScope,$firebase,$filter) {
	 
	$scope.codemirrorLoaded = function(tutCodeMirror){
		
	tutCodeMirror.setOption('autofocus', true);
	tutCodeMirror.setOption('indentUnit', 4);
	tutCodeMirror.setOption('indentWithTabs', true);
	tutCodeMirror.setOption('lineNumbers', true);
		
	tutCodeMirror.setSize(null, 500);
			$.get('/js/javascriptTutorial.txt', function(code) { 
				tutCodeMirror.getDoc().setValue(code); 
		
		});
		
	  };


}]); 



//////////////////////
//WRITE FUNCTION CONTROLLER     //
//////////////////////
myApp.controller('WriteFunctionController',  ['$scope','$rootScope','$firebase','$filter',function($scope,$rootScope,$firebase,$filter) {
	 
	$scope.codemirrorLoaded = function(tutCodeMirror){
		
	tutCodeMirror.setOption('autofocus', true);
	tutCodeMirror.setOption('indentUnit', 4);
	tutCodeMirror.setOption('indentWithTabs', true);
	tutCodeMirror.setOption('lineNumbers', true);
		
	tutCodeMirror.setSize(null, 500);
			$.get('/js/javascriptTutorial.txt', function(code) { 
				tutCodeMirror.getDoc().setValue(code); 
		
		});
		
	  };


}]); 
