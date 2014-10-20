
////////////////////
// TESTS SERVICE   //
////////////////////
myApp.factory('testsService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {

	var service = new function(){
		
		// Private variables	
		var tests = [];  				// map from testID to a TestInFirebase format object
		var functionIDToTests;		// map from a functionID to an array of testIDs that are tests for the function

		// Constructor
		this.initialize = function()  {
		};     
		
		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); }
		this.testAdded = function(addedTest) { return testAdded(addedTest); };
		this.testChanged = function(changedTest) { return testChanged(changedTest); };	
		this.testDeleted = function(deletedTest) { return testDeleted(deletedTest); };	
		this.forFunction = function(functionID) { return forFunction(functionID) };
		this.get = function(id) { return get(id); };
		this.getValidTests = function() { return getValidTests(); };	
		this.forFunction = function(functionID) { return forFunction(functionID) };
		this.validTestsforFunction = function(functionID) { return validTestsforFunction(functionID) };
		this.testCasesForFunction = function(functionID) { return testCasesForFunction(functionID); };
		this.getAllTestsToRun = function() { return getAllTestsToRun(); };

		
		// Function bodies
		
		function init(newStatsChangeCallback)
		{

			functionIDToTests = {};
			
			// get the list of all tests from firebase
			console.log($rootScope.firebaseURL+'/artifacts/tests');
			var testsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/tests'));
			var testsInFirebase = testsSync.$asArray();
			testsInFirebase.$loaded().then(function(){ console.log('tests loaded');  });
			
			// watch for changes in the tests data
			testsInFirebase.$watch(function(obj){ 
				switch(obj.event){
					case 'child_added':   testAdded(testsInFirebase.$getRecord(obj.key));   break;
					case 'child_changed': testChanged(testsInFirebase.$getRecord(obj.key)); break;
					case 'child_deleted': testDeleted(testsInFirebase.$getRecord(obj.key)); break;
				}
			});
		}
		
		
		
		// Event handler for a function being added or changed
		function testAdded(addedTest)
		{
			tests[addedTest.id] = addedTest;
			
			if (!functionIDToTests.hasOwnProperty(addedTest.functionID))		
				functionIDToTests[addedTest.functionID] = [];
			functionIDToTests[addedTest.functionID].push(addedTest.id);
			
		}	
		
		function testChanged(changedTest)
		{
			tests[changedTest.id] = changedTest;
		}	
		
		function testDeleted(deletedTest)
		{
			delete tests[deletedTest.id];
			
			var testsForFunction = functionIDToTests[deletedTest.functionID];
			if (testsForFunction != null)		
				removeFromArray(functionIDToTests[deletedTest.functionID], deletedTest.id); 
	
		}	
			
		function get(id)
		{
			if (tests.hasOwnProperty(id))		
				return tests[id];
			else
				return null;
		}
		
		// Returns an array of all tests in the system that are not currently in dispute
		function getValidTests()
		{
			var validTests = [];
			console.log(tests);
			/*		
			$.each(tests, function(i, test)
			{
				console.log(i);
				console.log(test);
				if (test.isImplemented)
					validTests.push(test);			
			});*/
			return validTests;
		}
		
		// Returns an array of the tests, in TestInFirebase format, of all of the tests for the specified functionID.
		function forFunction(functionID)
		{
			if (!functionIDToTests.hasOwnProperty(functionID))		
				return [];
			else
			{
				var testsForFunction = [];			
				$.each(functionIDToTests[functionID], function(i, testID)
				{
					var test = get(testID);				
					if (test.isImplemented)
						testsForFunction.push(test);				
				});			

				return testsForFunction;
			}	
		}	
		
		// Returns an array of the valid, implemented tests, in TestInFirebase format, for the specified functionID.
		function validTestsforFunction(functionID)
		{
			if (!functionIDToTests.hasOwnProperty(functionID))		
				return [];
			else
			{
				var testsForFunction = [];
				$.each(functionIDToTests[functionID], function(i, testID)
				{
					var test = get(testID);	
					if (test.isImplemented)
						testsForFunction.push(test);				
				});			
				return testsForFunction;
			}
		}
		
		// Returns an array of test cases, in TestCaseDTO format, for the specifieid functionID
		function testCasesForFunction(functionID)
		{
			var testsFor = forFunction(functionID);
			var testCasesFor = [];
		
			for (var i=0; i < testsFor.length; i++)
			{
				testFor = testsFor[i];
				testCasesFor.push({ text: testFor.description, added: false, deleted: false, id: testFor.id });
			}
		
			return testCasesFor;
		}
		
		// Gets the tests for the specified function as a string, replacing any calls to the specified function
		// with calls to a mock.
//		function allTestCodeToRunFor(functionID)
//		{
//			var testsForFuncArray = forFunction(functionID);
//			var functionName = functions.get(functionID).name;
//			var testsForFuncString = '';
//			
//			for (var i = 0; i < testsForFunc.length; i++)
//				testsForFuncString += testsForFuncArray[i].code;
//			
//			// We need to replace every call to the function under test (functionName) in the test code with a 
//			// call to our mock (functionNameaaaActualName). Since we don't have a parse tree here, 
//			// we're just going to do a string replace. That is, we'll replace every occurence
//			// of "functionName(" with with "functionNameaaaActualImp(. And also 
//			// replace "functionName (" with "functionNameaaaActualImp (". Including the parens hopefully
//			// avoids most (but certainly not all) situations where the function name is used in the
//			// error description in the test case or elsewhere. 				
//			var callsiteTemplate1 = functionName + '(';
//			var callsiteTemplate2 = functionName + ' (';
//			var mockedCallsite = functionName + 'aaaActualIMP(';
//			
//			return testsForFuncString.replace(new RegExp(callsiteTemplate1, 'g'), mockedCallsite)
//							  .replace(new RegExp(callsiteTemplate2, 'g'), mockedCallsite);
//		}	

		// Returns a string containing every test that is not currently in dispute, 
		// where each test includes the complete code of the test
		function getAllTestsToRun()
		{
			var testCode = '';		
			$.each(tests, function(i, test)
			{
				if (test.isImplemented)
					testCode += test.code +'\n\n';
			});
			return testCode;
		}
		
	}
	
	return service;
}]); 