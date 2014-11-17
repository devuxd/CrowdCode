///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
myApp.controller('NoMicrotaskController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService','$interval', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService, $interval) {
	//$interval(function(){ $scope.$emit('load')}, 2000);
}]);

///////////////////////////////
//  WRITE TEST CASES CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestCasesController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	$scope.newTestCase = "";
	$scope.testCases   = angular.isDefined($scope.microtask.submission) ? $scope.microtask.submission.testCases : [] ;
	$scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;
	

    // addTestCase and deleteTestCase actions
	$scope.addTestCase = function(){
		var testCase = { id: $scope.testCases.length, text: $scope.newTestCase , added: true, deleted: false };
		$scope.testCases.push(testCase);
		$scope.newTestCase="";
	};
	$scope.removeTestCase = function(index){
		$scope.testCases.splice(index,1);
	}

	// collect form data
	$scope.$on('collectFormData',function(event,microtaskForm){

		// if the new test case field is not empty, 
		// add as a new test case
		if( $scope.newTestCase != "" ) $scope.addTestCase();


		// console.log("THE FORM IS");
		// console.log(microtaskForm);


		// console.log("TEST CASES ARE");
		// console.log($scope.testCases);


		// prepare form data for submission
		formData = { testCases: $scope.testCases, functionVersion: $scope.funct.version};
		console.log(formData);
		// call microtask submission
		$scope.$emit('submitMicrotask',formData);
	});

}]);

///////////////////////////////
//  Review CONTROLLER //
///////////////////////////////
myApp.controller('ReviewController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService','microtasksService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService, microtasksService) {

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

	$scope.$on('collectFormData',function(){

		formData = {
			microtaskIDReviewed: $scope.microtask.microtaskIDUnderReview,
			reviewText:          $scope.review.reviewText,
			qualityScore:        $scope.review.rating
		};

		$scope.$emit('submitMicrotask',formData);
	});

}]);

///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
myApp.controller('DebugTestFailureController', ['$scope','$rootScope','$firebase','$timeout','testsService', 'testRunnerService','functionsService', 'ADTService', function($scope,$rootScope,$firebase,$timeout,testsService,testRunnerService,functionsService, ADTService) {

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
 	$scope.stubs   = { key1:"value" };
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

			console.log(" ----- RESULTS FROM THE TEST RUNNER ");

			//$scope.results = 
			$scope.results   = data.results;
			$scope.stubs = data.stubs;

			console.log(data.results);
			console.log(data.stubs);
		
			// reset testsRunning flag
			$timeout(function(){
				$scope.testsRunning = false;
			},200);
		});
	};

	$scope.dispute      = false;
	$scope.disputedTest = null;
	$scope.disputeTest = function(testKey){
		$scope.dispute = true;
		$scope.disputedTest = $scope.tests[testKey];
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
myApp.controller('ReuseSearchController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	$scope.reuseSearch={};
	$scope.reuseSearch.functions=[];

	// set selected to -2 to initialize the default value
	//-2 nothing selected (need an action to submit)
	//-1 no function does this
	// 0- n index of the function selected

	var code = functionsService.renderDescription($scope.funct) + $scope.funct.header+ $scope.funct.code;
	$scope.reuseSearch.selected=-2;
	$scope.reuseSearch.functions= functionsService.findMatches('', $scope.funct.name);

	// search for all the functions that have $scope.reuseSearch.text in theirs description or header

	$scope.doSearch = function(){
		$scope.reuseSearch.selected=-2;
		$scope.reuseSearch.functions= functionsService.findMatches($scope.reuseSearch.text,$scope.funct.name);
	};

	$scope.codemirrorLoaded = function(codeMirror){
		//Retreves the code of the function that generated the pseudocall
		codeMirror.setValue(code);
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "custom");
		codeMirror.setSize(null,'auto');

		codeMirror.refresh();
	}

	$scope.$on('collectFormData',function(){

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
		$scope.$emit('submitMicrotask',formData);
	});

}]);

///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
myApp.controller('WriteCallController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

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


	$scope.$on('collectFormData',function(){

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
	});

}]);

///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {


	var marks = [];
	var highlightPseudoCall =false;
	var readOnlyDone=false;
	var changeTimeout;
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


	$scope.$on('collectFormData',function(){
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
	});

}]);

////////////////////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
////////////////////////////////////////////
myApp.controller('WriteFunctionDescriptionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	//Set the form in line
	$rootScope.inlineForm = true;

	$scope.writeFunctionDescription={};
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

	//prepare the codemirror Value
	$scope.writeFunctionDescription.code=functionsService.renderDescription($scope.funct) + $scope.funct.header + $scope.funct.code;

	//Setup the codemirror box with the code of the function that created the pseudocall
	$scope.codemirrorLoaded = function(codeMirror){
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "custom");
		codeMirror.setSize(null,'auto');
		codeMirror.setValue($scope.writeFunctionDescription.code);
		codeMirror.refresh();
	}

	//Add the first parameter
	$scope.addParameter();

	$scope.$on('collectFormData',function(){

		var paramNames=[];
		var paramTypes=[];
		var paramDescriptions=[];

		for(var i=0; i<$scope.writeFunctionDescription.parameters.length;i++)
			{
			paramNames.push($scope.writeFunctionDescription.parameters[i].paramName);
			paramTypes.push($scope.writeFunctionDescription.parameters[i].paramType);
			paramDescriptions.push($scope.writeFunctionDescription.parameters[i].paramDescritpion)
			}

		formData = { name: $scope.writeFunctionDescription.functionName,
				    returnType: $scope.writeFunctionDescription.returnType==undefined ? '' : $scope.writeFunctionDescription.returnType ,
				    paramNames: paramNames,
				    paramTypes: paramTypes,
				    paramDescriptions: paramDescriptions,
			     	description: $scope.writeFunctionDescription.description,
					header: functionsService.renderHeader($scope.writeFunctionDescription.functionName, paramNames)
					};

		$scope.$emit('submitMicrotask',formData);
	});

}]);


///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestController', ['$scope','$rootScope','$firebase','$filter','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,$filter,testsService,functionsService, ADTService) {

	$scope.code="";


	//load the version of the function with witch the test cases where made
	var functionVersionSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + $scope.microtask.functionID
			+ '/' + ($scope.microtask.functionVersion>0?$scope.microtask.functionVersion:1)));
	$scope.funct = functionVersionSync.$asObject();
	$scope.funct.$loaded().then(function(){
		$scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header;
	});

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
	$scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header;


	$scope.loadExample=function(ADTName){
		return ADTService.getByName(ADTName).example;
	}


	$scope.$on('collectFormData',function(){

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
	});

}]);
