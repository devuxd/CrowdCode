

////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
myApp.controller('AppController', ['$scope','$rootScope','$firebase','userService', 'testsService', 'functionsService', 'testRunnerService','ADTService','microtasksService', function($scope,$rootScope,$firebase,userService,testsService,functionsService, testRunnerServe, ADTService,microtasksService) {

	// current session variables
    $rootScope.projectId    = projectId;
    $rootScope.workerId     = workerId;
    $rootScope.workerHandle = workerHandle;
    $rootScope.firebaseURL  = firebaseURL;
    $rootScope.loaded={};
    $rootScope.loaded.microtasks=false;
    $rootScope.loaded.functions=false;
    $rootScope.loaded.tests=false;
    $rootScope.loaded.ADTs=false;


	// wrapper for user login and logout
	$rootScope.workerLogin = function(){
		userService.login();
	}

	$rootScope.workerLogout = function(){
		userService.logout();
	}

	//user.listenForJobs();
	microtasksService.init();
	userService.init();
	userService.listenForJobs();
	testsService.init();
	functionsService.init();
	ADTService.init();

	$scope.$on('popup_show',function(){ console.log('show popup'); $('#popUp').modal('show'); });
	$scope.$on('popup_hide',function(){ $('#popUp').modal('hide'); });
	$scope.popupContent = '';
	$scope.popupTitle = 'popup title';
}]);


//////////////////////////
// MICROTASK CONTROLLER //
//////////////////////////
myApp.controller('MicrotaskController', ['$scope','$rootScope','$firebase','$http', 'testsService', 'functionsService','userService','microtasksService',function($scope,$rootScope,$firebase,$http,testsService,functionsService,userService, microtasksService) {

	// private vars
	var templatesURL = "/html/templates/microtasks/";
	var templates = {
		'Review':'review',
		'DebugTestFailure':'debug_test_failure',
		'ReuseSearch':'reuse_search',
		'WriteFunction':'write_function',
		'WriteFunctionDescription':'write_function_description',
		'WriteTest':'write_test',
		'WriteTestCases':'write_test_cases',
		'WriteCall':'write_call',
	};
	var formData = {};

	var codemirrorr;




	// initialize microtask and templatePath
	$scope.funct = {};
	$rootScope.inlineForm = false;
	$scope.test = {};
	$scope.testData = {};
	$scope.microtask = {};
	$scope.templatePath = "";//"/html/templates/microtasks/";

	$scope.reuseSearch={};
	$scope.reuseSearch.functions=[];
	$scope.newTestCase = "";
	$scope.viewData = {};
	$scope.writeFunctionDescription= {};
	$scope.review={};




	//Whait for the inizializations of all service
	//when the microtask array is syncronize with firebase load the first microtask


	$scope.$watch(function () {

        return $rootScope.loaded;
    },function(newVal) {
    	if($rootScope.loaded.functions && $rootScope.loaded.tests && $rootScope.loaded.ADTs && $rootScope.loaded.microtasks)
    		{
    		 console.log("all Services loaded loaded");
    		 load();
    		}
       },true
    );




	// load microtask:
	// request a new microtask from the backend and if success
	// inizialize template and microtask-related values
	function load(){
		// set the loading template
		$scope.templatePath = templatesURL + "loading.html";
		$rootScope.inlineForm = false; // reset form as non-inline

		$http.get('/'+$rootScope.projectId+'/fetch?AJAX').
		  success(function(data, status, headers, config) {

		  $scope.microtask= microtasksService.get(data.id);

		  	// create the reference and the sync
			//var ref  = new Firebase($rootScope.firebaseURL+'/microtasks/' + data.id);
			//var sync = $firebase(ref);

			// load the microtask data
			//$scope.microtask = sync.$asObject();
			//$scope.microtask.$loaded().then(function(){
			//	$scope.inputSearch="";

				// assign title
				$scope.datas = data;

				// retrieve the related function
				if( angular.isDefined($scope.microtask.functionID) ) {
					$scope.funct = functionsService.get($scope.microtask.functionID);
				}
				// retrieve the related test
				var testId = angular.isDefined($scope.microtask.testID) ? $scope.microtask.testID : 0;
				if( angular.isDefined(testId) ) {
					$scope.test = testsService.get(testId);
				}

				// debug stuff
				// console.log("data: ");console.log(data);
				 console.log("microtask: ");console.log($scope.microtask);
				// console.log("function: ");console.log($scope.funct);
				// console.log("test: ");console.log($scope.test);


			  	//choose the right template
			 	$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";


		//	});
		  }).
		  error(function(data, status, headers, config) {

				$scope.templatePath = "/html/templates/microtasks/no_microtask.html";

		  });
	};


	// ------- MESSAGE LISTENERS ------- //

	// listen for message 'submit microtask'
	$scope.$on('submitMicrotask',function(event,formData){

		console.log('submit fired');
		console.log(formData);

		$http.post('/'+$rootScope.projectId+'/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id , formData).
			success(function(data, status, headers, config) {

				 //Push the microtask submit data onto the Firebase history stream
				microtasksService.submit($scope.microtask,formData );
				console.log("submit success");
			  	load();
		  	})
		  	.error(function(data, status, headers, config) {
		  		console.log("submit error");
  		 	});
	});

	// listen for message 'skip microtask'
	$scope.$on('skipMicrotask',function(event,data){
		console.log("skip fired");
		$http.get('/'+$rootScope.projectId+'/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id + '&skip=true').
		  success(function(data, status, headers, config) {
			  load();
		  });
	});



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


////////////////////////////////////
// FUNCTIONS REFERENCE CONTROLLER //
////////////////////////////////////
myApp.controller('FunctionsReferenceController', ['$scope','$rootScope','$firebase','functionsService',function($scope,$rootScope,$firebase,functionsService) {
	// bind the array to scope.leaders
	$scope.functions = functionsService.getAll();

	console.log("functions");
	console.log($scope.functions);
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


///////////////////////////////
// ONLINE WORKERS CONTROLLER //
///////////////////////////////
myApp.controller('OnlineWorkersController', ['$scope','$rootScope','$firebase',function($scope,$rootScope,$firebase) {
	/*
	var diffInSec = 60+60*5; // how wide is the timewindow
	var currDate  = new Date();
	var endTimestamp   = currDate.getTime()+1*60*1000; // +1 to see also the current worker
	var startTimestamp = endTimestamp - diffInSec*1000;

	var startDate = new Date();
	startDate.setTime(startTimestamp);
	var endDate   = new Date();
	endDate.setTime(endTimestamp);
	console.log(startDate);
	console.log(endDate);
	console.log("diff: "+(endTimestamp-startTimestamp)/60000);
*/
	var ref  = new Firebase($rootScope.firebaseURL+'/status/presences/');
	var sync = $firebase(ref);
	// bind the array to scope.onlineWorkers

	$scope.onlineWorkers = sync.$asArray();
	$scope.onlineWorkers.$loaded().then(function(){  });
}]);

//////////////////////
// STATS CONTROLLER //
//////////////////////
myApp.controller('StatsController', ['$scope','$rootScope','$firebase','$filter','functionsService','testsService',function($scope,$rootScope,$firebase,$filter,functionsService,testsService) {
	$scope.locCount = 5;



	var ref  = new Firebase($rootScope.firebaseURL+'/workers/'+$rootScope.workerId+'/stats');
	var sync = $firebase(ref);
	$scope.stats = sync.$asObject();
	$scope.stats.$watch(function(){

		if($scope.stats.$value == null){
			$scope.stats.$value = {
				microtasks:0,
				functions:0,
				tests:0,
				testcases:0,
				reviews:0,
				function_descriptions:0,
				function_calls:0,
				debugs:0,
				searches:0
			};
			$scope.stats.$save();
			$scope.total = 0;
			angular.forEach($scope.stats,function(value,key){
				if(key!="microtasks")
					$scope.total += value;
			})
		}


	});

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
	var chatRef  = new Firebase($rootScope.firebaseURL+'/chat').limit(10);
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
// JAVA TUTORIAL    //
//////////////////////
myApp.controller('JavaTutorialController',  ['$scope','$rootScope','$firebase','$filter',function($scope,$rootScope,$firebase,$filter) {


	var tutorialText="";
	$.get('/js/javascriptTutorial.txt', function(code) {
		 tutorialText = code;
	});
  	$scope.codemirrorLoaded = function(tutCodeMirror){
	    tutCodeMirror.getDoc().setValue(tutorialText);
		tutCodeMirror.setOption('autofocus', true);
		tutCodeMirror.setOption('indentUnit', 4);
		tutCodeMirror.setOption('indentWithTabs', true);
		tutCodeMirror.setOption('lineNumbers', true);
	  	tutCodeMirror.setSize(null, 500);
    };
}]);

///////////////////////////////////
//TYPE BROWSER    CONTROLLER     //
///////////////////////////////////
myApp.controller('typeBrowserController',  ['$scope','$rootScope','$firebase','$filter','ADTService',function($scope,$rootScope,$firebase,$filter, ADTService) {

	 $scope.ADTs = ADTService.getAllADTs();
}]);


