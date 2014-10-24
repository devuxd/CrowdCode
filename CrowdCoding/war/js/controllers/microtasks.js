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
	$rootScope.inlineForm = true;
	$scope.newTestCase = "";


	// initialize testCases
	// if microtask.submission and microtask.submission.testCases are defined
	// assign available testCases otherwise initialize a new array
	$scope.testCases = ( angular.isDefined($scope.microtask.submission) && angular.isDefined($scope.microtask.submission.testCases) ) ?
					   $scope.microtask.submission.testCases : [] ;

    // addTestCase and deleteTestCase utils function for microtask WRITE TEST CASES
	$scope.addTestCase = function(){

		if($scope.viewData.newTestCase!=undefined && $scope.viewData.newTestCase!=""){

			var testCase = { text: $scope.viewData.newTestCase, added: true, deleted: false, id: $scope.testCases.length };
			$scope.testCases.push(testCase);
			$scope.viewData.newTestCase="";

		}
	}


	$scope.deleteTestCase = function(index){
		$scope.testCases.splice(index,1);
		console.log("deleting test case");
	}


	$scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header;

	$scope.codemirrorLoaded = function(codeMirror){

		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");
		codeMirror.setOption("tabindex", "-1");
		codeMirror.setSize(null,200);
		codeMirror.refresh();
	}

	$scope.submit = function(){
		// PREPARE FORM DATA HERE
		formData = { testCases: $scope.testCases, functionVersion: $scope.funct.version};
		$scope.$emit('submitMicrotask',formData);
	}

}]);

///////////////////////////////
//  Review CONTROLLER //
///////////////////////////////
myApp.controller('ReviewController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService','microtasksService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService, microtasksService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of review controller");
	$scope.review.reviewText="";
	$scope.review.codeMirrorCode="";
	//setup codemirror box

	$scope.codemirrorLoaded = function(codeMirror){

		codeMirror.setSize(null,200);
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");

		codeMirror.refresh();
	}

	//load the microtask to review
	//var microtaskUnderReviewSync=$firebase( new Firebase ($rootScope.firebaseURL+'/microtasks/'+$scope.microtask.microtaskIDUnderReview));

	//$scope.review.microtaskUnderReview = microtaskUnderReviewSync.$asObject();
	//$scope.review.microtaskUnderReview.$loaded().then(function(){

	$scope.review.microtaskUnderReview=microtasksService.get($scope.microtask.microtaskIDUnderReview);


		if ($scope.review.microtaskUnderReview.type == 'WriteTestCases')
		{
			//retrievs the reference of the existing test cases to see if the are differents
			$scope.review.currenttestcases=testsService.testCasesForFunction($scope.review.microtaskUnderReview.functionID);

			//load the version of the function with witch the test cases where made
			var functionUnderTestSync =$firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + $scope.review.microtaskUnderReview.functionID
					+ '/' + $scope.review.microtaskUnderReview.submission.functionVersion));
			$scope.functionUnderTest = functionUnderTestSync.$asObject();
			$scope.functionUnderTest.$loaded().then(function(){

			$scope.review.codeMirrorCode=functionsService.renderDescription($scope.functionUnderTest)+$scope.functionUnderTest.header;
			});

		}
		else if ($scope.review.microtaskUnderReview.type == 'WriteTest')
		{

			$scope.functionUnderTest=functionsService.get($scope.review.microtaskUnderReview.functionID);
			$scope.review.codeMirrorCode=functionsService.renderDescription($scope.functionUnderTest)+$scope.functionUnderTest.header;

		}
		else if ($scope.review.microtaskUnderReview.type == 'WriteFunction')
		{

			$scope.review.codeMirrorCode=functionsService.renderDescription($scope.review.microtaskUnderReview.submission)+$scope.review.microtaskUnderReview.submission.header+$scope.review.microtaskUnderReview.submission.code;

		}
		else if ($scope.review.microtaskUnderReview.type == 'WriteCall')
		{

			$scope.functionChanged=functionsService.get($scope.review.microtaskUnderReview.functionID);
			$scope.review.codeMirrorCode=functionsService.renderDescription($scope.functionChanged)+$scope.functionChanged.header+$scope.functionChanged.code;

		}
		else if ($scope.review.microtaskUnderReview.type == 'WriteFunctionDescription')
		{

			$scope.review.codeMirrorCode=functionsService.renderDescription($scope.review.microtaskUnderReview.submission)+$scope.review.microtaskUnderReview.submission.header;

		}


	//Star rating manager
	$scope.review.rate = 0;
	$scope.max = 5;

	$scope.hoveringOver = function(value) {
	   $scope.overStar = value;
	   $scope.percent = 100 * (value / $scope.max);
	};



	$scope.submit = function(){
		console.log("review controlle prepare form data");

		formData = {
    		microtaskIDReviewed: $scope.microtask.microtaskIDUnderReview,
    		reviewText: $scope.review.reviewText,
			qualityScore: $scope.review.rate
		};
		$scope.$emit('submitMicrotask',formData);
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
		$scope.$emit('submitMicrotask',formData);
	}

}]);

///////////////////////////////
//  REUSE SEARCH CONTROLLER //
///////////////////////////////
myApp.controller('ReuseSearchController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of reuse search controller");

	// set selected to -2 to initialize the default value
	//-2 nothing selected (need an action to submit)
	//-1 no function does this
	// 0- n index of the function selected
	var functionWithPseudoCall=functionsService.get($scope.microtask.callerID);
	var code = functionsService.renderDescription(functionWithPseudoCall) + functionWithPseudoCall.header+ functionWithPseudoCall.code;
	$scope.reuseSearch.selected=-2;
	$scope.reuseSearch.functions= [];

	// search for all the functions that have $scope.reuseSearch.text in theirs description or header

	$scope.doSearch = function(){
		$scope.reuseSearch.selected=-2;
		$scope.reuseSearch.functions= functionsService.findMatches($scope.reuseSearch.text);
	};

	$scope.codemirrorLoaded = function(codeMirror){
		//Retreves the code of the function that generated the pseudocall
		codeMirror.setValue(code);
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");
		codeMirror.refresh();
	}

	$scope.submit = function(){
		console.log("reuse search controlle prepare form data");
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
	}

}]);

///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
myApp.controller('WriteCallController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write call");

	$scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;

	$scope.readonlyCodemirrorLoaded = function(codeMirror){
		codeMirror.setValue($scope.datas.pseudoCall);
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");
		codeMirror.refresh();
	}

	$scope.readonlyFunctionCodemirrorLoaded= function(codeMirror){
		codeMirror.setValue($scope.microtask.calleeFullDescription);
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");
		codeMirror.refresh();
	}

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
			makeHeaderAndParameterReadOnly(codemirror);

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


	$scope.submit = function(){
		console.log("write call controlle prepare form data");
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
		$scope.$emit('submitMicrotask',formData);
	}

}]);

///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {


	var marks = [];
	var highlightPseudoCall =false;
	var changeTimeout;

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write function");
	 $scope.code = functionsService.renderDescription($scope.funct)+$scope.funct.header+$scope.funct.code;

     $scope.codemirrorLoaded = function(myCodeMirror){
			codemirror = myCodeMirror;
			codemirror.setOption('autofocus', true);
			codemirror.setOption('indentUnit', 4);
			codemirror.setOption('indentWithTabs', true);
			codemirror.setOption('lineNumbers', true);
			codemirror.setSize(null, 500);
			codemirror.setOption("theme", "vibrant-ink");

			highlightPseudoSegments(codemirror,marks,highlightPseudoCall);

			// If we are editing a function that is a client request and starts with CR, make the header
		 	// readonly.
			if ($scope.funct.name.startsWith('CR'))
				makeHeaderAndParameterReadOnly(myCodeMirror);

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


	$scope.submit = function(){
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
		console.log("write function controller prepare form data");
		$scope.$emit('submitMicrotask',formData);
	}

}]);

///////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
///////////////////////////////
myApp.controller('WriteFunctionDescriptionController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write function description");

	//Set the form in line
	$scope.$rootScope.inlineForm = true;

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
	var callerFunction= functionsService.get($scope.microtask.callerID);
	$scope.writeFunctionDescription.code=functionsService.renderDescription(callerFunction) + callerFunction.header + callerFunction.code;

	//Setup the codemirror box with the code of the function that created the pseudocall
	$scope.codemirrorLoaded = function(codeMirror){
		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");
		codeMirror.refresh();
	}

	//Add the first parameter
	$scope.addParameter();

	$scope.submit = function(){
		console.log("write function description controlle prepare form data");

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
				    returnType: $scope.writeFunctionDescription.returnType,
				    paramNames: paramNames,
				    paramTypes: paramTypes,
				    paramDescriptions: paramDescriptions,
			     	description: $scope.writeFunctionDescription.description,
					header: renderHeader($scope.writeFunctionDescription.functionName, paramNames)
					};
		$scope.$emit('submitMicrotask',formData);
	}

}]);


///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
myApp.controller('WriteTestController', ['$scope','$rootScope','$firebase','testsService', 'functionsService', 'ADTService', function($scope,$rootScope,$firebase,testsService,functionsService, ADTService) {

	// INITIALIZATION OF FORM DATA MUST BE DONE HERE
	console.log("initialization of write test controller");
	// initialize testData
	// if microtask.submission and microtask.submission.simpleTestInputs are defined
	// assign test inputs and output to testData, otherwise initialize an empty object
	$scope.testData = ( angular.isDefined($scope.microtask.submission) && angular.isDefined($scope.microtask.submission.simpleTestInputs) ) ?
					   {inputs: $scope.microtask.submission.simpleTestInputs , output: testsService.get().simpleTestOutput } :
					   {inputs:[],output:''} ;

	// Configures the microtask to show information for disputing the test, hiding
	// other irrelevant portions of the microtask.
	$scope.dispute = false;
	$scope.toggleDispute = function(){
		$scope.dispute = !$scope.dispute;
		if(!$scope.dispute)
			$scope.testData.disputeText = "";
	};
	$scope.code = functionsService.renderDescription($scope.funct) + $scope.funct.header;
	$scope.codemirrorLoaded = function(codeMirror){

		codeMirror.setOption("readOnly", "true");
		codeMirror.setOption("theme", "pastel-on-dark");
		codeMirror.setOption("tabindex", "-1");
		codeMirror.refresh();
	}


	$scope.submit = function(){
		console.log("write test controlle prepare form data");
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
			testCode += '),' + $scope.testData.output + ',\'' + $scope.test.description + '\');' ;
			// return jSON object
			formData = { code: testCode,
						 hasSimpleTest: true,
						 inDispute: false,
						 disputeText: '',
		     			 simpleTestInputs: $scope.testData.inputs, simpleTestOutput: $scope.testData.output };
		}
		$scope.$emit('submitMicrotask',formData);
	}

}]);
