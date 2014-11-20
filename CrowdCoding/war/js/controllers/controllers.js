

////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
myApp.controller('AppController', ['$scope','$rootScope','$firebase','$http','$interval','userService', 'testsService', 'functionsService', 'mocksService','testRunnerService','ADTService','microtasksService','TestList', function($scope,$rootScope,$firebase,$http,$interval,userService,testsService,functionsService, mocksService, testRunnerService, ADTService,microtasksService,TestList) {

	// current session variables
   	$rootScope.loaded={};	
    $rootScope.projectId    = projectId;
    $rootScope.workerId     = workerId;
    $rootScope.workerHandle = workerHandle;
    $rootScope.firebaseURL  = firebaseURL;
	
    // flags for knowing if service is loaded
   



	// wrapper for user login and logout
	$rootScope.workerLogin = function(){
		userService.login();
	};
	$rootScope.workerLogout = function(){
		userService.logout();
	};



	$scope.promise= $interval(
		function(){
		    $rootScope.loaded.functions  = false;
		    $rootScope.loaded.tests      = false;
		    $rootScope.loaded.ADTs       = false;
			userService.init();
			userService.listenForJobs();
			testsService.init();
			functionsService.init();
			ADTService.init();
	}, 1000);
	


	$scope.$on('popup_show',function(){ console.log('show popup'); $('#popUp').modal('show'); });
	$scope.$on('popup_hide',function(){ $('#popUp').modal('hide'); });
	$scope.popupContent = '';
	$scope.popupTitle = 'popup title';

	$scope.$watch(function () {
		return $rootScope.loaded;
    },function(newVal) {

    	if( $rootScope.loaded.functions && $rootScope.loaded.tests && $rootScope.loaded.ADTs ){	
			$interval.cancel($scope.promise);
			$rootScope.$broadcast('load');
	   	}

    },true);



	$rootScope.$on('sendFeedback', function(event, message) {
		console.log("message " + message);
		var feedback = {
			// 'microtaskType': $scope.microtask.type,
			// 'microtaskID': $scope.microtask.id,
			'workerHandle': $rootScope.workerHandle,
			'workerID': $rootScope.workerId,
			'feedback': message.toString()
		};


		var feedbackRef = $firebase(new Firebase(firebaseURL + '/feedback'));

		feedbacks = feedbackRef.$asArray();
		feedbacks.$loaded().then(function() {
			feedbacks.$add(feedback);
	//		$rootScope.feedback.sent=true;
		});



	});


}]);


myApp.controller('UserProfileController',['$scope','$rootScope','$timeout','fileUpload',function($scope,$rootScope,$timeout,fileUpload){
	$scope.imageUrl = '/user/picture?userId='+$rootScope.workerId+'&t='+(new Date().getTime());
	$scope.uploadFile = function(){
        var file = $scope.image;
        var uploadUrl = "/user/pictureChange";

        fileUpload.uploadFileToUrl(file, uploadUrl);

        $timeout(function(){ $scope.imageUrl = '/user/picture?userId='+$rootScope.workerId+'&t='+ (new Date().getTime()); },500);
    };
		    
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
	$rootScope.inlineForm = false;

	// initialize microtask and templatePath
	$scope.funct = {};
	$scope.test = {};
	$scope.microtask = {};
	$scope.templatePath = "";//"/html/templates/microtasks/";
	$scope.validatorCondition = false;
	//Whait for the inizializations of all service
	//when the microtask array is syncronize with firebase load the first microtask


	// load microtask:
	// request a new microtask from the backend and if success
	// inizialize template and microtask-related values
	$scope.$on('load', function (){
		// set the loading template
		$scope.templatePath = templatesURL + "loading.html";
		$rootScope.inlineForm = false; // reset form as non-inline
		$http.get('/'+projectId+'/ajax/fetch').
		  success(function(data, status, headers, config) {
		  	console.log(data);
		  	$scope.microtask= microtasksService.get(data.id);
		  	$scope.microtask.$loaded().then(function(){

		  		console.log("MICROTASK LOADED");
		  		console.log($scope.microtask);
		  		
				// assign title
				$scope.datas = data;

				// retrieve the related function
				if( angular.isDefined($scope.microtask.functionID) || angular.isDefined($scope.microtask.testedFunctionID)) {
					$scope.funct = functionsService.get($scope.microtask.functionID);
				}
				// retrieve the related test
				var testId = angular.isDefined($scope.microtask.testID) ? $scope.microtask.testID : 0;
				if( angular.isDefined(testId) ) {
					$scope.test = testsService.get(testId);
				}

				// debug stuff
				 // console.log("data: ");console.log(data);
				 // console.log("microtask: ");console.log($scope.microtask);
				 // console.log("function: ");console.log($scope.funct);
				 // console.log("test: ");console.log($scope.test);


			  	//choose the right template
			  	if( $scope.microtask.type != undefined && templates[$scope.microtask.type] != undefined )
			 		$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
			 	else
					$scope.templatePath = "/html/templates/microtasks/no_microtask.html";

		  	});
		  }).
		  error(function(data, status, headers, config) {

				$scope.templatePath = "/html/templates/microtasks/no_microtask.html";

		  });
	});


	// ------- MESSAGE LISTENERS ------- //

	// listen for message 'submit microtask'
	$scope.$on('submitMicrotask',function(event,formData){
		$http.post('/'+$rootScope.projectId+'/ajax/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id , formData).
			success(function(data, status, headers, config) {

				 //Push the microtask submit data onto the Firebase history stream
				$scope.microtask.submission = formData;
				$scope.microtask.$save();
				console.log("submit success");
			  	$scope.$emit('load');
		  	})
		  	.error(function(data, status, headers, config) {
		  		console.log("submit error");
		  		console.log(data);
  		 	});
	});

	// listen for message 'skip microtask'
	$scope.$on('skipMicrotask',function(event,data){
		console.log("skip fired");
		$http.get('/'+$rootScope.projectId+'/ajax/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id + '&skip=true').
		  success(function(data, status, headers, config) {
			  $scope.$emit('load');
		  });
	});

	$scope.startTutorial = function(tutorialName){
		console.log("START TUTORIAL CALLED");
		$scope.$broadcast('tutorial-'+tutorialName);
	};

}]);


//////////////////////
// SCORE CONTROLLER //
//////////////////////
myApp.controller('ScoreController', ['$scope','$rootScope','$firebase', function($scope,$rootScope,$firebase) {
	// create the reference and the sync
	var ref  = new Firebase($rootScope.firebaseURL+'/workers/'+$rootScope.workerId+'/score');
    var sync = $firebase(ref);
    // create the object and bind the firebase ref to the scope.score var
    $scope.score = sync.$asObject();
    $scope.score.$loaded().then(function(){
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

	var ref  = new Firebase($rootScope.firebaseURL+'/workers/'+$rootScope.workerId+'/stats');
	var sync = $firebase(ref);
	$scope.stats = sync.$asObject();
	$scope.total = 0;

	$scope.stats.$watch(function(event){
		/*
		if($scope.stats.$value == null){
			$scope.stats.$value = {
				functions:0,
				tests:0,
				testcases:0,
				reviews:0,
				function_descriptions:0,
				function_calls:0,
				debugs:0,
				searches:0
			};
			$scope.total = 0;
			$scope.stats.$save();

		} else {
			updateTotal();
		}

		*/

	});

	function updateTotal(){
		$scope.total = 0;
			angular.forEach($scope.stats,function(value,key){
					$scope.total += value;
			});
	}
}]);

///////////////////////////////////
//TYPE BROWSER    CONTROLLER     //
///////////////////////////////////
myApp.controller('typeBrowserController',  ['$scope','$rootScope','$firebase','$filter','ADTService',function($scope,$rootScope,$firebase,$filter, ADTService) {

	 $scope.ADTs = ADTService.getAllADTs();
}]);



myApp.config(function($dropdownProvider) {
  angular.extend($dropdownProvider.defaults, {
    html: true
  });

});

myApp.controller('dropdownController', ['$scope', function($scope){
$scope.dropdown = [
  {
    "text": '<i >change profile picture</i>',
    "href": "#",
    "data-animation":"am-fade-and-scale",
    "data-placement":"center",
    "data-template":"/html/templates/popups/popup_feedback.html",
    "bs-modal":"modal"
  },
  {
    "text": "<i class=\"fa fa-globe\"></i>&nbsp;Display an alert",
    "click": "$alert(\"Holy guacamole!\")"
  },
  {
    "text": "<i class=\"fa fa-external-link\"></i>&nbsp;External link",
    "href": "/auth/facebook",
    "target": "_self"
  },
  {
    "divider": true
  },
  {
    "text": "Separated link",
    "href": "#separatedLink"
  }
];


}]);