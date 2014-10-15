



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
myApp.controller('MicrotaskController', ['$scope','$rootScope','$firebase','$http', 'testsService', 'functionsService',function($scope,$rootScope,$firebase,$http,testsService,functionsService) {

	// private vars
	var templatesURL = "/html/templates/microtasks/";
	var templates = {
		'ReuseSearch':'reuse_search',
		'WriteFunction':'write_function',
		'WriteFunctionDescription':'write_function_description',
		'WriteTest':'write_test',
		'WriteTestCases':'write_test_cases',
		'WriteCall':'write_call',
	};
	var formData = {};

	var codemirrorr;
	var marks = [];
	var highlightPseudoCall =false;
	var changeTimeout;


	// initialize microtask and templatePath
	$scope.funct = {};
	$scope.inlineForm = false;
	$scope.test = {};
	$scope.testData = {};
	$scope.microtask = {};
	$scope.templatePath = "";//"/html/templates/microtasks/";
	$scope.reuseSearch= {};
	$scope.reuseSearch.functions= [];
	$scope.writeFunctionDescription= {};
//	$scope.writeFunctionDescription.parameters =[];

	// collect form data is different for each microtask
	var collectFormData = {
			'ReuseSearch': function(){


				//if no function selected the value of selected is ==-1 else is the index of the arrayList of function
				if($scope.reuseSearch.selected==-1)
				{
					formData = {  functionName: "",
								  noFunction: true
								};
				}
				else
				{
					formData = { functionName: $scope.reuseSearch.functions[$scope.reuseSearch.selected].value.name,
								 noFunction: false
							};
				}

			},
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
					  testCode +=  (key!=$scope.testData.inputs.length-1) ? ',' : '';
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
				var text = codemirror.getValue();
		 		var ast = esprima.parse(text, {loc: true});

				var calleeNames = getCalleeNames(ast);

				// Get the text for the function description, header, and code.
				// Note esprima (the source of line numbers) starts numbering lines at 1, while
			    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
				var fullDescription = codemirror.getRange({ line: 0, ch: 0}, { line: ast.loc.start.line - 1, ch: 0 });

				var linesDescription = fullDescription.split('\n');
				var name = ast.body[0].id.name;

				var functionParsed = parseDescription(linesDescription,name);
				console.log(functionParsed);

				var body = codemirror.getRange(
						{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
					    { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column });

				formData =  { description: functionParsed.description,
							 header:       functionParsed.header,
							 name:         name,
							 code:         body,
							 returnType:   functionParsed.returnType,
							 paramNames:   functionParsed.paramNames,
							 paramTypes:   functionParsed.paramTypes,
							 paramDescriptions: functionParsed.paramDescriptions,
							 calleeNames:  calleeNames};
			},
			'WriteFunctionDescription': function(){
			//	$scope.inlineForm = false;
			},
			'WriteCall': function(){
			},
	};

	// initialize form data is different for each microtask
	var initializeFormData = {


			'ReuseSearch': function(){


				//Retreves the code of the function that generated the pseudocall
				$scope.reuseSearch.code=functionsService.get($scope.microtask.callerID).code;

				// set selected to -2 to initialize the default value
				//-2 nothing selected (need an action to submit)
				//-1 no function does this
				// 0- n index of the function selected
				$scope.reuseSearch.selected=-2;
				$scope.reuseSearch.functions= [];

				// search for all the functions that have $scope.reuseSearch.text in theirs description or header
				$scope.doSearch = function(){
				$scope.reuseSearch.selected=-2;
				$scope.reuseSearch.functions= functionsService.findMatches($scope.reuseSearch.text);
				};

			},
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
				$scope.codemirrorLoaded = function(codeMirror){
					codeMirror.setValue(renderDescription($scope.funct) + $scope.funct.header);
					codeMirror.setOption("readOnly", "true");
					codeMirror.setOption("theme", "pastel-on-dark");
					codeMirror.refresh();
				}
			},
			'WriteFunction': function(){

                $scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;
                $scope.codemirrorLoaded = function(myCodeMirror){
					codemirror = myCodeMirror;
					codemirror.setOption('autofocus', true);
					codemirror.setOption('indentUnit', 4);
					codemirror.setOption('indentWithTabs', true);
					codemirror.setOption('lineNumbers', true);
					codemirror.setSize(null, 500);
					codemirror.setOption("theme", "vibrant-ink");
					codemirror.doc.setValue($scope.code);

					highlightPseudoSegments(codemirror,marks,highlightPseudoCall);

					// If we are editing a function that is a client request and starts with CR, make the header
				 	// readonly.
					if ($scope.funct.name.startsWith('CR'))
						makeHeaderAndParameterReadOnly();

				 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
				 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
				    // typing).

					codemirror.on("change", function(){
						$scope.code = codemirror.doc.getValue();
						// Mangage code change timeout
						clearTimeout(changeTimeout);
						changeTimeout = setTimeout( function(){highlightPseudoSegments(codemirror,marks,highlightPseudoCall);}, 500);

					});
			 	};

			},
			'WriteFunctionDescription': function(){

				//Set the form in line
				$scope.inlineForm = true;

				//inizialize the empty array of the parameters
				$scope.writeFunctionDescription.parameters=[];


			   // addParameter and deleteParameter utils function for microtask WRITE FUNCTION DESCRIPTION
				$scope.addParameter = function(){

					var parameter = { text: '', added: true, deleted: false, id: $scope.writeFunctionDescription.parameters.length };
						$scope.writeFunctionDescription.parameters.push(parameter);
				}


				$scope.deleteParameter = function(index){
					$scope.writeFunctionDescription.parameters.splice(index,1);
				}

				//Setup the codemirror box with the code of the function that created the pseudocall
				$scope.codemirrorLoaded = function(codeMirror){
					var callerFunction= functionsService.get($scope.microtask.callerID);
					codeMirror.setValue(renderDescription($scope.callerFunction) + $scope.callerFunction.header);
					codeMirror.setOption("readOnly", "true");
					codeMirror.setOption("theme", "pastel-on-dark");
					codeMirror.refresh();
				}

				//Add the first parameter
				$scope.addParameter();

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
			//	$scope.inputSearch="";

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


				// debug stuff

				console.log("data: ");console.log(data);
				console.log("microtask: ");console.log($scope.microtask);
				console.log("function: ");console.log($scope.funct);
				console.log("test: ");console.log($scope.test);

				// initialize form data for the current microtask
				initializeFormData[$scope.microtask.type]();

			  	//choose the right template
			 	$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";

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
		console.log(formData);

		collectFormData[$scope.microtask.type]();


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
// JAVA TUTORIAL     //
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
//TYPE BROWSER    CONTROLLER     //
///////////////////////////////////
myApp.controller('typeBrowserController',  ['$scope','$rootScope','$firebase','$filter','ADTService',function($scope,$rootScope,$firebase,$filter, ADTService) {

	 $scope.ADTs = ADTService.getAllADTs();
}]);




///////////////////////////////////
//FUNCTION EDITOR CONTROLLER     //
///////////////////////////////////
myApp.controller('FunctionEditorController',  ['$scope','$rootScope','$firebase','$filter','functionsService',function($scope,$rootScope,$firebase,$filter, functionsService) {

    var codemirror;

	var marks = [];
	var highlightPseudoCall =false;
	var changeTimeout;


 	// Highlight regions of code that  pseudocalls or pseudocode
	function highlightPseudoSegments(){

		var text= codemirror.getValue();
		console.log("testo"+ text);
		// Clear the old marks (if any)
		$.each(marks, function(index, mark)
		{
			mark.clear();
		});


 		// Depending on the state of CodeMirror, we might not get code back.
 		// In this case, do nothing
 		if(typeof text === 'undefined')
 		{
 			return;
 		};

 		var lines = text.split('\n');
		$.each(lines, function(i, line)
		{
			var pseudoCallCol = line.indexOf('//!');
			if (pseudoCallCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'pseudoCall', inclusiveRight: true }));

			var pseudoCodeCol = line.indexOf('//#');
			if (pseudoCodeCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCodeCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'pseudoCode', inclusiveRight: true }));

			// If there is currently a pseudocall that is being replaced, highlight that in a special
			// color
			if (highlightPseudoCall != false)
			{
				var pseudoCallCol = line.indexOf(highlightPseudoCall);
				if (pseudoCallCol != -1)
				 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
				 			     {line: i, ch: line.length},
				 			     {className: 'highlightPseudoCall', inclusiveRight: true }));
			}
		});
	}

	// Makes the header of the function readonly (not editable in CodeMirror).
	// The header is the line that starts with 'function'
	// Note: the code must be loaded into CodeMirror before this function is called.
	function makeHeaderAndParameterReadOnly()
	{


 		var text = codemirror.getValue();

		// Take the range beginning at the start of the code and ending with the first character of the body
		// (the opening {})

		var readOnlyLines = indexesOfTheReadOnlyLines(text);

		for(var i=0; i<readOnlyLines.length; i++)
		{
			codemirror.getDoc().markText({line: readOnlyLines[i], ch: 0},
				{ line: readOnlyLines[i] + 1, ch: 1},
				{ readOnly: true });
		}

	}



	$scope.codemirrorLoaded = function(myCodeMirror){

/*
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

*/
		codemirror = myCodeMirror;
		var allFunctionNames = functionsService.getAllDescribedFunctionNames($scope.$parent.funct.id);
		var allFunctionCode  = functionsService.getAllDescribedFunctionCode($scope.$parent.funct.id);

		codemirror.setOption('autofocus', true);
		codemirror.setOption('indentUnit', 4);
		codemirror.setOption('indentWithTabs', true);
		codemirror.setOption('lineNumbers', true);
		codemirror.setSize(null, 500);
		codemirror.setOption("theme", "vibrant-ink");
		codemirror.doc.setValue($scope.code);


		highlightPseudoSegments();


		// If we are editing a function that is a client request and starts with CR, make the header
	 	// readonly.
		if ($scope.funct.name.startsWith('CR'))
			makeHeaderAndParameterReadOnly();

	 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
	 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
	    // typing).

		codemirror.on("change", function(){
			$scope.code = codemirror.doc.getValue();
			// Mangage code change timeout
			clearTimeout(changeTimeout);
			changeTimeout = setTimeout( function(){highlightPseudoSegments();}, 500);

		});



 	};


}]);

