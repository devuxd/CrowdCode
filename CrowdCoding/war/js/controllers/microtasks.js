///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
myApp.controller('NoMicrotaskController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService','$interval', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService, $interval) {
	//$interval(function(){ $scope.$emit('load')}, 2000);
}]);

///////////////////////////////
//  WRITE TEST CASES CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestCasesController', ['$scope','$rootScope','$firebase','$alert','testsService','TestList', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,$alert,testsService,TestList,functionsService, ADTService) {

	$scope.newTestCase = "";

	var alert=null;
	$scope.testCases = [];

	// retrieve the tests for the functionID
	var tests = TestList.getByFunctionId($scope.microtask.functionID);
	console.log(tests);
	// for each test push the test case entry in the test cases list
	angular.forEach(tests,function(test,index){
		$scope.testCases.push( { id: test.getId(), text: test.getDescription() , added: false, deleted: false } );
		console.log($scope.testCases);
	});

	$scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;

    // addTestCase and deleteTestCase actions
	$scope.addTestCase = function(){
		// push the new test case and set the flag added to TRUE
		if( $scope.newTestCase != "" ){

			var testCase = { id: null, text: $scope.newTestCase , added: true, deleted: false };
			$scope.testCases.push(testCase);
			$scope.newTestCase="";
		}
	};
	$scope.removeTestCase = function(index){
		// if the testcase was added during this microtask, remove it from the array
		if( $scope.testCases[index].added === true)
			$scope.testCases.splice(index,1);
		// else set the flag DELETED to true
		else 
			$scope.testCases[index].deleted = true;
		console.log($scope.testCases);
	};

	// collect form data
	$scope.$on('collectFormData',function(event,microtaskForm){

		var error="";
		// if the new test case field is not empty,
		// add as a new test case
		if( $scope.newTestCase !== "" ) $scope.addTestCase();

		if(microtaskForm.$pristine)
			error= "Add at least 1 test case";
		if(microtaskForm.$invalid)
			error= "Fix all the errors before submit";
		
		if(error!=="")
		{
			if (alert!==null) alert.destroy();

			alert=$alert({title: 'Error!', content: error, type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
		}
		else {
			// prepare form data for submission
			formData = { testCases: $scope.testCases, functionVersion: $scope.funct.version};

			// call microtask submission
			$scope.$emit('submitMicrotask',formData);
		}
	});

}]);

///////////////////////////////
//  Review CONTROLLER //
///////////////////////////////
myApp.controller('ReviewController', ['$scope','$rootScope','$firebase','$alert','testsService', 'functionsService', 'ADTService','microtasksService', function($scope,$rootScope,$firebase,$alert,testsService,functionsService, ADTService, microtasksService) {

	$scope.review = {};
	$scope.review.reviewText   = "";
	$scope.review.functionCode = "";

	//load the microtask to review
	$scope.review.microtask = microtasksService.get($scope.microtask.microtaskIDUnderReview);
	$scope.review.microtask.$loaded().then(function(){

		if ($scope.review.microtask.type == 'WriteTestCases'){
			//retrievs the reference of the existing test cases to see if the are differents
			$scope.review.testcases = $scope.review.microtask.submission.testCases;

			//load the version of the function with witch the test cases where made
			var functionUnderTestSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + $scope.review.microtask.functionID
					+ '/' + $scope.review.microtask.submission.functionVersion));
			var functionUnderTest = functionUnderTestSync.$asObject();
			functionUnderTest.$loaded().then(function(){
				$scope.review.functionCode = functionsService.renderDescription(functionUnderTest)+functionUnderTest.header;
			});

		} else if ($scope.review.microtask.type == 'WriteFunction') {

			$scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission)+$scope.review.microtask.submission.header+$scope.review.microtask.submission.code;

		}
		else if ($scope.review.microtask.type == 'WriteTest') {

			//load the version of the function with witch the test cases where made
			var functionUnderTestSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + $scope.review.microtask.functionID
					+ '/' + ($scope.review.microtask.functionVersion>0?$scope.review.microtask.functionVersion:1)));
			$scope.functionUnderTest = functionUnderTestSync.$asObject();
			$scope.functionUnderTest.$loaded().then(function(){
				$scope.review.functionCode = functionsService.renderDescription($scope.functionUnderTest)+$scope.functionUnderTest.header;
			});
		}

		else if ($scope.review.microtask.type == 'WriteCall')
		{

			$scope.functionChanged=functionsService.get($scope.review.microtask.functionID);
			$scope.review.functionCode=functionsService.renderDescription($scope.functionChanged)+$scope.functionChanged.header+$scope.functionChanged.code;

		}
		else if ($scope.review.microtask.type == 'WriteFunctionDescription')
		{

			$scope.review.functionCode=functionsService.renderDescription($scope.review.microtask.submission)+$scope.review.microtask.submission.header;

		}

	});

	//Star rating manager
	$scope.review.mouseOn   = 0;
	$scope.review.maxRating = 5;
	$scope.review.rating    = 0;

	$scope.rate = function(value) {
		if (value >= 0 && value <= $scope.review.maxRating ) {
			$scope.review.rating = value;
		}
	};

	$scope.$on('collectFormData',function(event,microtaskForm){
			var error="";
			
			if($scope.review.rating===0)
				error= "Select at least 1 star to evaluate the work";

			if(microtaskForm.$invalid)
				error= "The review form can't be empty";
		//	console.log("here");
			if(error!=="")
				$alert({title: 'Error!', content: error, placement: 'top', type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
			else {

				formData = {
					microtaskIDReviewed: $scope.microtask.microtaskIDUnderReview,
					reviewText:          $scope.review.reviewText,
					qualityScore:        $scope.review.rating
				};

				$scope.$emit('submitMicrotask',formData);
			}
		});

}]);

///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
myApp.controller('DebugTestFailureController', ['$scope','$rootScope','$firebase','$alert','$timeout','testsService', 'testRunnerService','functionsService', 'ADTService', function($scope,$rootScope,$firebase,$alert,$timeout,testsService,testRunnerService,functionsService, ADTService) {

 	//retrieve tests for the current function
	$scope.tests        = testsService.validTestsforFunction($scope.microtask.functionID);
	$scope.passedTests  = [];
	$scope.testsRunning = false; // for cheching if tests are running


	// INITIALIZE THE CONSOLE CODEMIRROR
	$scope.consoleOutput  = "";
	var consoleCodeMirror = null;
	$scope.consoleLoaded  = function(codemirror){
		consoleCodeMirror = codemirror;
		codemirror.setOption("readOnly", "true");
		codemirror.setOption("theme", "console");
		codemirror.setOption("tabindex", "-1");
		codemirror.setSize(null,'200px');
		codemirror.refresh();
	}

	// INITIALIZE THE FUNCTION EDITOR CODEMIRROR
	$scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;

	var functionCodeMirror  = null;
	var highlightPseudoCall = false;
	$scope.codemirrorLoaded = function(codemirror){
    	functionCodeMirror = codemirror;

		codemirror.doc.setValue($scope.code);
		codemirror.setOption('autofocus', true);
		codemirror.setOption('indentUnit', 4);
		codemirror.setOption('indentWithTabs', true);
		codemirror.setOption('lineNumbers', true);
		codemirror.setOption("theme", "custom-editor");
		codemirror.refresh();
 	};


 	$scope.results = {};
 	$scope.stubs   = {};
	$scope.runTests = function(){
		// set testsRunning flag
		$scope.testsRunning = true;
		var functionBody = undefined;
		if( functionCodeMirror != null ){
			var ast = esprima.parse(functionCodeMirror.doc.getValue(), {loc: true});
		    functionBody = functionCodeMirror.getRange(
				{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			    { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column });
		}


		// ask the worker to run the tests
		testRunnerService.runTestsForFunction($scope.microtask.functionID, functionBody, $scope.stubs).then(function(data){


			//$scope.results = 
			$scope.results = data.results;
			$scope.stubs   = data.stubs;

			// console.log(" ----- RESULTS FROM THE TEST RUNNER ");
			// console.log(data.results);
			// console.log(data.stubs);
		
			// reset testsRunning flag
			$timeout(function(){
				$scope.testsRunning = false;
			},200);
		});
	};

	$scope.dispute      = false;
	$scope.disputedTest = null;
	$scope.$on('disputeTest',function(event,testKey){
		$scope.dispute = true;
		$scope.disputedTest = $scope.tests[testKey];
	});
	$scope.cancelDispute = function(){
		$scope.dispute = false;
	}

	// check if test is passed
	// testKey is the key of the test in $scope.tests
	$scope.isTestPassed = function(testKey){
		if( $scope.passedTests != 'undefined' && $scope.passedTests.indexOf(testKey) !=-1 )
			return true;
		return false;
	}

	$scope.$on('collectFormData',function(){
		formData = {};/*
		if($scope.dispute){
			// return jSON object
			console.log($scope.disputedTest);

			formData = {
				name:        $scope.disputedTest.description,
				description: $scope.disputedTest.disputeText,
				testId:      $scope.disputedTest.$id
			};

		} else {

			var text = codemirror.getValue();
	 		var ast = esprima.parse(text, {loc: true});

			var calleeNames = functionsService.getCalleeNames(ast);

			// Get the text for the function description, header, and code.
			// Note esprima (the source of line numbers) starts numbering lines at 1, while
		    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
			var fullDescription = codemirror.getRange({ line: 0, ch: 0}, { line: ast.loc.start.line - 1, ch: 0 });

			var linesDescription = fullDescription.split('\n');
			var name = ast.body[0].id.name;

			var functionParsed = functionsService.parseDescription(linesDescription,name);
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

		}

		$scope.$emit('submitMicrotask',formData);*/
	});

	// run the tests
	$scope.runTests();

}]);

///////////////////////////////
//  REUSE SEARCH CONTROLLER //
///////////////////////////////
myApp.controller('ReuseSearchController', ['$scope','$alert','functionsService', function( $scope, $alert, functionsService ) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HEREù


	// set selected to -2 to initialize the default value
	//-2 nothing selected (need an action to submit)
	//-1 no function does this
	// 0- n index of the function selected
	$scope.selectedResult = -2;
	$scope.results        = functionsService.findMatches('', $scope.funct.name);


	var code = functionsService.renderDescription($scope.funct) + $scope.funct.header+ $scope.funct.code;


	// search for all the functions that have $scope.reuseSearch.text in theirs description or header
	$scope.doSearch = function(){
		$scope.selectedResult = -2 ;
		$scope.results        = functionsService.findMatches( $scope.text, $scope.funct.name );
	};

	$scope.select = function(index){
		$scope.selectedResult = index;
	}

	$scope.codemirrorLoaded = function(codeMirror){
		codeMirror.setValue(code);
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "custom");
		codeMirror.setSize(null,'auto');
		codeMirror.refresh();
	};

	$scope.$on('collectFormData',function(event,microtaskForm){

		if( $scope.selectedResult == -2 ){

			var error = 'Choose a function or select the checkbox "No funtion does this"';
			$alert({title: 'Error!', content: error, type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
		
		} else {
			//if no function selected the value of selected is ==-1 else is the index of the arrayList of function
			if( $scope.selectedResult == -1 )
				formData = {  functionName: "", noFunction: true };
			else 
				formData = { functionName: $scope.results[ $scope.selectedResult ].value.name, noFunction: false };
			
			$scope.$emit('submitMicrotask',formData);
		}
	});

}]);

///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
myApp.controller('WriteCallController', ['$scope','$rootScope','$firebase','$alert','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,$alert,testsService,functionsService, ADTService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE

	var marks=[];
	var highlightPseudoCall = false;
	var changeTimeout;
	var readOnlyDone=false;




	$scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;


    $scope.codemirrorLoaded = function(myCodeMirror){

    	codemirror = myCodeMirror;
		codemirror.setOption('autofocus', true);
		codemirror.setOption('indentUnit', 4);
		codemirror.setOption('indentWithTabs', true);
		codemirror.setOption('lineNumbers', true);
		codemirror.setSize(null, 500);
		codemirror.setOption("theme", "custom-editor");


		functionsService.highlightPseudoSegments(codemirror,marks,highlightPseudoCall);

	 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
	 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
	    // typing).

		codemirror.on("change", function(){

			// If we are editing a function that is a client request and starts with CR, make the header
		 	// readonly.

			if (!readOnlyDone && $scope.funct.name.startsWith('CR')){
				functionsService.makeHeaderAndParameterReadOnly(codemirror);
				readOnlyDone=true;
			}

			// Mangage code change timeout
			clearTimeout(changeTimeout);
			changeTimeout = setTimeout( function(){functionsService.highlightPseudoSegments(codemirror,marks,highlightPseudoCall);}, 500);

		});
 	};


$scope.$on('collectFormData',function(event,microtaskForm){

		var error="";

		if(microtaskForm.$invalid)
			error= 'Choose a function or select the button "No funtion does this"';

		if(error!=="")
			$alert({title: 'Error!', content: error, placement: 'top', type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
		else {

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
			$scope.$emit('submitMicrotask',formData);
		}
	});

}]);

///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService','$alert', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService,$alert) {

 

	var marks = [];
	var highlightPseudoCall =false;
	var readOnlyDone=false;
	var changeTimeout;


	if( $scope.microtask.promptType == 'DESCRIPTION_CHANGE'){
		var oldCode = $scope.microtask.oldFullDescription.split("\n");
		var newCode = $scope.microtask.newFullDescription.split("\n");
		var diffRes = diff( oldCode, newCode );
		var diffCode = "";
		angular.forEach(diffRes,function(diffRow){

			if(diffRow[0]=="="){
				diffCode += diffRow[1].join("\n");
			} else {
				diffCode += diffRow[0]+diffRow[1].join("\n");
			}
			diffCode += "\n";
		})
    	$scope.diffCode = diffCode;
    	console.log($scope.diffCode);

	}


	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	$scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;

    $scope.codemirrorLoaded = function(myCodeMirror){
     	codemirror = myCodeMirror;
		codemirror.setOption('autofocus', true);
		codemirror.setOption('indentUnit', 4);
		codemirror.setOption('indentWithTabs', true);
		codemirror.setOption('lineNumbers', true);
		codemirror.setSize(null, 500);
		codemirror.setOption("theme", "custom-editor");


		functionsService.highlightPseudoSegments(codemirror,marks,highlightPseudoCall);
	 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
	 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
	    // typing).

		codemirror.on("change", function(){
			// If we are editing a function that is a client request and starts with CR, make the header
		 	// readonly.

			if (!readOnlyDone && $scope.funct.name.startsWith('CR')){
				functionsService.makeHeaderAndParameterReadOnly(codemirror);
				readOnlyDone=true;
			}
			// Mangage code change timeout
			clearTimeout(changeTimeout);
			changeTimeout = setTimeout( function(){ functionsService.highlightPseudoSegments(codemirror,marks,highlightPseudoCall);}, 500);

		});
	};


	$scope.$on('collectFormData',function(event,microtaskForm){

		var error="";

		if(microtaskForm.$invalid)
			error= 'Fix all errors before submit, if you don\'t know how use the pseudocode';

		if(error!=="")
			$alert({title: 'Error!', content: error, placement: 'top', type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
		else {
			var text = codemirror.getValue();
	 		var ast = esprima.parse(text, {loc: true});

			var calleeNames = functionsService.getCalleeNames(ast);

			// Get the text for the function description, header, and code.
			// Note esprima (the source of line numbers) starts numbering lines at 1, while
		    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
			var fullDescription = codemirror.getRange({ line: 0, ch: 0}, { line: ast.loc.start.line - 1, ch: 0 });

			var linesDescription = fullDescription.split('\n');
			var name = ast.body[0].id.name;

			var functionParsed = functionsService.parseDescription(linesDescription,name);


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

			$scope.$emit('submitMicrotask',formData);
		}
	});

}]);

////////////////////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
////////////////////////////////////////////
myApp.controller('WriteFunctionDescriptionController', ['$scope','$rootScope','$firebase','$alert','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,$alert,testsService,functionsService, ADTService) {

	// initialization of models 
	$scope.description  = "";
	$scope.returnType   = "";
	$scope.functionName = ""
	$scope.parameters   = [];


    // addParameter and deleteParameter 
	$scope.addParameter = function(){
		var parameter = { text: '', added: true, deleted: false, id: $scope.parameters.length };
		$scope.parameters.push(parameter);
	};
	$scope.deleteParameter = function(index){
		$scope.parameters.splice(index,1);
	};

	//prepare the codemirror Value
	$scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;

	//Setup the codemirror box with the code of the function that created the pseudocall
	$scope.codemirrorLoaded = function(codeMirror){
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "custom");
		codeMirror.setSize(null,'auto');
		codeMirror.setValue($scope.code);
		codeMirror.refresh();
	};

	//Add the first parameter
	$scope.addParameter();

	$scope.$on('collectFormData',function(event,microtaskForm){

		if(microtaskForm.$invalid){
			var error = 'Fix all errors before submit';
			$alert({title: 'Error!', content: error, type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
		} else {

			var paramNames=[];
			var paramTypes=[];
			var paramDescriptions=[];

			for(var i=0; i<$scope.parameters.length;i++){
				paramNames.push($scope.parameters[i].paramName);
				paramTypes.push($scope.parameters[i].paramType);
				paramDescriptions.push($scope.parameters[i].paramDescription);
			}

			formData = { name: $scope.writeFunctionDescription.functionName,
					    returnType: $scope.returnType===undefined ? '' : $scope.returnType ,
					    paramNames: paramNames,
					    paramTypes: paramTypes,
					    paramDescriptions: paramDescriptions,
				     	description: $scope.description,
						header: functionsService.renderHeader($scope.functionName, paramNames)
						};

			$scope.$emit('submitMicrotask',formData);
		}
	});

}]);


///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestController', ['$scope','$rootScope','$firebase','$filter','$alert','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,$filter,$alert,testsService,functionsService, ADTService) {

	// initialize testData
	// if microtask.submission and microtask.submission.simpleTestInputs are defined
	// assign test inputs and output to testData, otherwise initialize an empty object
	$scope.testData = ( angular.isDefined($scope.test.simpleTestInputs) && angular.isDefined($scope.test.simpleTestOutput) ) ?
					   {inputs: $scope.test.simpleTestInputs , output: $scope.test.simpleTestOutput } :
					   {inputs:[],output:''} ;

	
	//  $scope.testData.inputs[0]={};
	// Configures the microtask to show information for disputing the test, hiding
	// other irrelevant portions of the microtask.
	$scope.dispute = false;
	$scope.toggleDispute = function(){
		$scope.dispute = !$scope.dispute;
		if(!$scope.dispute)
			$scope.testData.disputeText = "";
	};

	// IF THE PROMPT TYPE IS FUNCTION CHANGED, CALC THE DIFF TO SHOW WITH CODEMIRROR
	if( $scope.microtask.promptType == 'FUNCTION_CHANGED'){
		var oldCode = $scope.microtask.oldFunctionDescription.split("\n");
		var newCode = $scope.microtask.newFunctionDescription.split("\n");
		var diffRes = diff( oldCode, newCode );
		var diffCode = "";
		angular.forEach(diffRes,function(diffRow){

			if(diffRow[0]=="="){
				diffCode += diffRow[1].join("\n");
			} else {
				diffCode += diffRow[0]+diffRow[1].join("\n");
			}
			diffCode += "\n";
		});
    	$scope.diffCode = diffCode;

	}
	// LOAD THE VERSION OF THE FUNCTION WHEN THE MICROTASK HAS BEEN SPAWNED
	else {
		$scope.code = "";
		console.log("FIND FUN VERSION");
		//load the version of the function with witch the test cases where made

		var functionVersionSync = {};
		if($scope.microtask.functionVersion == 0)
			functionVersionSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + $scope.microtask.functionID + '/1'));
		else 
			functionVersionSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + $scope.microtask.functionID + '/' + $scope.microtask.functionVersion));


		$scope.funct = functionVersionSync.$asObject();
		$scope.funct.$loaded().then(function(){
			console.log($scope.funct);
			$scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header;
			console.log($scope.code);
		});
	}


	$scope.loadExample=function(ADTName){
		return ADTService.getByName(ADTName).example;
	};

	var alertObj = null; // initialize alert obj

	$scope.$on('collectFormData',function(event,microtaskForm){

		if(microtaskForm.$invalid){
			if( alertObj != null ) alertObj.destroy(); // avoid multiple alerts
			var error= 'Fix all errors before submit';
			alertObj = $alert({title: 'Error!', content: error, type: 'danger', show: true, duration : 3, template : '/html/templates/alert/alert_submit.html', container: 'alertcontainer'});
		} else {
			
			if($scope.dispute){
				// return jSON object
				formData = {functionVersion: $scope.funct.version,
							code: '',
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
				testCode += '),' + $scope.testData.output + ',\'' + $scope.test.description + '\');' ;

				formData = { functionVersion: $scope.funct.version,
							 code: testCode,
							 hasSimpleTest: true,
							 inDispute: false,
							 disputeText: '',
			     			 simpleTestInputs: $scope.testData.inputs,
			     			 simpleTestOutput: $scope.testData.output };


			}
			$scope.$emit('submitMicrotask',formData);
		}

	});

}]);
