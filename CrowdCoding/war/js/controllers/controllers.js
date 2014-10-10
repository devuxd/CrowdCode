
////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
myApp.controller('AppController', ['$scope','$rootScope','$firebase','userService', 'testsService', 'functionsService', 'testRunnerService','ADTService', function($scope,$rootScope,$firebase,userService,testsService,functionsService, testRunnerServe, ADTService) {
	
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
	ADTService.init();
	//console.log(testRunnerService.runTestsForFunction(1));
}]); 


//////////////////////////
// MICROTASK CONTROLLER //
//////////////////////////
myApp.controller('MicrotaskController', ['$scope','$rootScope','$firebase','$http', 'testsService', 'functionsService','functionEditorService',function($scope,$rootScope,$firebase,$http,testsService,functionsService,functionEditorService) {
	
	// private vars
	var templatesURL = "/html/templates/microtasks/";
	var templates = {
		'WriteFunction':'write_function',
		'WriteFunctionDescription':'write_function_description',
		'WriteTest':'write_test',
		'WriteTestCases':'write_test_cases',
		'WriteCall':'write_call',
	};
	var formData = {};



	// initialize microtask and templatePath
	$scope.funct = {};
	$scope.inlineForm = false;
	$scope.test = {};
	$scope.testData = {};
	$scope.microtask = {};
	$scope.templatePath = "";//"/html/templates/microtasks/";

	// collect form data is different for each microtask
	var collectFormData = {
			'WriteTest': function(){
				if($scope.dispute){
					// return jSON object
					formData = { code: '', 
								inDispute: true, 
								disputeText: $scope.testData.disputeText, 
								hasSimpleTest: true, 
								simpleTestInputs: [], 
								simpleTestOutput: '' };
				} else {
					// build the test code
					var testCode = 'equal('+$scope.funct.name+'(';
					angular.forEach($scope.testData.inputs, function(value, key) {
					  testCode +=  value ;
					  tangularestCode +=  (key!=$scope.testData.inputs.length-1) ? ',' : '';
					});
					testCode += '),' + $scope.testData.output + ',\'' + $scope.test.description + '\')' ; 
					// return jSON object
					formData = { code: testCode, 
								 hasSimpleTest: true, 
								 inDispute: false, 
								 disputeText: '', 
				     			 simpleTestInputs: $scope.testData.inputs, simpleTestOutput: $scope.testData.output };
				}
			},
			'WriteTestCases': function(){
				formData = { testCases: $scope.testCases, functionVersion: $scope.funct.version};
			},
			'WriteFunction': function(){
				
				var collectedCode= functionEditorService.checkAndCollectCode();
				
				console.log('error '+collectedCode.errors);
				//TODO se error =false submit if true popup
				console.log('collected code'+collectedCode.code);
				
				formData=collectedCode.code;
				
			},
			'WriteFunctionDescription': function(){
			},
			'WriteCall': function(){
			},
	};
	
	// initialize form data is different for each microtask
	var initializeFormData = {
			'WriteTest': function(){
				// initialize testData
				// if microtask.submission and microtask.submission.simpleTestInputs are defined
				// assign test inputs and output to testData, otherwise initialize an empty object
				$scope.testData = ( angular.isDefined($scope.microtask.submission) && angular.isDefined($scope.microtask.submission.simpleTestInputs) ) ? 
								   {inputs: $scope.microtask.submission.simpleTestInputs , output: $scope.microtask.submission.simpleTestOutput } : 
								   {inputs:[],output:''} ;

				// Configures the microtask to show information for disputing the test, hiding 
				// other irrelevant portions of the microtask.
				$scope.dispute = false;
				$scope.toggleDispute = function(){ 
					$scope.dispute = !$scope.dispute; 
					if(!$scope.dispute) 
						$scope.testData.disputeText = ""; 
				};


			},
			'WriteTestCases': function(){
				$scope.inlineForm = true;
				// initialize testCases
				// if microtask.submission and microtask.submission.testCases are defined 
				// assign available testCases otherwise initialize a new array
				$scope.testCases = ( angular.isDefined($scope.microtask.submission) && angular.isDefined($scope.microtask.submission.testCases) ) ? 
								   $scope.microtask.submission.testCases : [] ;
				$scope.fillOutLast = false;
				$scope.setFillOutLast = function(val){
					if(val!=true && val!=false) return; 
					$scope.fillOutLast = val;
				};
			    // addTestCase and deleteTestCase utils function for microtask WRITE TEST CASES
				$scope.addTestCase = function(){
					console.log("adding test case");
					var lastTestCase = $scope.testCases[$scope.testCases.length-1];
					if(lastTestCase==null || lastTestCase.text!=""){
						$scope.setFillOutLast(false);
						var testCase = { text: '', added: true, deleted: false, id: $scope.testCases.length };
						$scope.testCases.push(testCase);
					}
					else $scope.setFillOutLast(true);
				}
				$scope.deleteTestCase = function(index){
					$scope.testCases.splice(index,1);
				}
			},
			'WriteFunction': function(){
                
                $scope.code="";
                $scope.code+= functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;


                
			},
			'WriteFunctionDescription': function(){
			},
			'WriteCall': function(){
			},
	};

	// load microtask:
	// request a new microtask from the backend and if success
	// inizialize template and microtask-related values
	$scope.load = function(){

		$scope.inlineForm = false; // reset form as non-inline
		console.log("loading microtask");

		$http.get('/'+$rootScope.projectId+'/fetch?AJAX').
		  success(function(data, status, headers, config) {


		  	// create the reference and the sync
			var ref  = new Firebase($rootScope.firebaseURL+'/microtasks/' + data.id);
			var sync = $firebase(ref);

			// load the microtask data
			$scope.microtask = sync.$asObject();
			$scope.microtask.$loaded().then(function(){


			  	//choose the right template
			 	$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";

				// assign title 
				$scope.datas = data;

				// retrieve the related function
				var functionId = angular.isDefined($scope.microtask.functionID) ? $scope.microtask.functionID : $scope.microtask.testedFunctionID;
				if( angular.isDefined(functionId) ) {
					$scope.funct = functionsService.get(functionId);
				}
				// retrieve the related test 
				var testId = angular.isDefined($scope.microtask.testID) ? $scope.microtask.testID : 0;
				if( angular.isDefined(testId) ) {
					$scope.test = testsService.get(testId);
				}

				// initialize form data for the current microtask
				initializeFormData[$scope.microtask.type]();

				// debug stuff
				console.log("data: ");console.log(data);
				console.log("microtask: ");console.log($scope.microtask); 
				console.log("function: ");console.log($scope.funct);
				console.log("test: ");console.log($scope.test);
								

			});
		  }).
		  error(function(data, status, headers, config) {

				$scope.templatePath = "/html/templates/microtasks/no_microtask.html";

		  });
	};
	

	// ------- MESSAGE LISTENERS ------- //

	// listen for message 'submit microtask'
	$scope.$on('submitMicrotask',function(event,data){
		console.log('submit fired');
		// call collect form data for the current microtask
		collectFormData[$scope.microtask.type](); 
		// SEND THE DATA
		// // stringify formData and send it via an AJAX POST call
  //   	var stringifiedData = JSON.stringify( formData );
		// $.ajax({
		//     contentType: 'application/json',
		//     data: stringifiedData,
		//     type: 'POST',
		//     url: '/<%=projectID%>/submit?type=' + microtaskType + '&id=' + microtaskID,
		// }).done( function (data) { loadMicrotask();	});   
		
		// Push the microtask submit data onto the Firebase history stream
		// var submissionRef = new Firebase(firebaseURL + '/microtasks/' + microtaskID + '/submission');
		// submissionRef.set(formData);
		console.log(formData);
		$http.post('/'+$rootScope.projectId+'/submit?type=' + $scope.microtask.type + '&id=' + $scope.microtask.id , formData).
			success(function(data, status, headers, config) {
				console.log("submit success");
				$scope.microtask.submission = formData;
				$scope.microtask.$save();
			  	$scope.load();
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
			  $scope.load();
		  });
	});

	// auto-load microtask on controller load
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







///////////////////////////////////
//FUNCTION EDITOR CONTROLLER     //
///////////////////////////////////
myApp.controller('FunctionEditorController',  ['$scope','$rootScope','$firebase','$filter','functionEditorService','functionsService',function($scope,$rootScope,$firebase,$filter, functionEditorService, functionsService) {
 
	
	


	$scope.codemirrorLoaded = function(myCodeMirror){
	
	var allFunctionNames=functionsService.getAllDescribedFunctionNames($scope.funct.id);
	var allFunctionCode=functionsService.getAllDescribedFunctionCoode($scope.funct.id);

	console.log("names  "+allFunctionNames);
	console.log("code "+allFunctionCode);
	
	myCodeMirror.setOption('autofocus', true);
	myCodeMirror.setOption('indentUnit', 4);
	myCodeMirror.setOption('indentWithTabs', true);
	myCodeMirror.setOption('lineNumbers', true);
	myCodeMirror.getDoc().setValue($scope.code); 
	myCodeMirror.setSize(null, 500);
	myCodeMirror.setOption("theme", "vibrant-ink");	 	
	
	
	functionEditorService.initService(myCodeMirror, allFunctionNames, allFunctionCode);
	functionEditorService.highlightPseudoSegments();

	
	// If we are editing a function that is a client request and starts with CR, make the header
 	// readonly.
	if ($scope.funct.name.startsWith('CR'))
		functionEditorService.makeHeaderAndParameterReadOnly();
	
 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
    // typing).
	myCodeMirror.on("change", function(){
	
		functionEditorService.codeChanged();
	});
	
	
	
 };
  
}]); 
 myApp.controller('typeBrowserController',  ['$scope','$rootScope','$firebase','$filter','ADTService',function($scope,$rootScope,$firebase,$filter, ADTService) {

  console.log(ADTService.getAllADTs());
 $scope.ADTs = ADTService.getAllADTs();
 		

  
  
}]); 

