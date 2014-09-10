/*
 *  Tests maintains the state of all tests, synchronized with the server, and provides services
 *  for running tests.
 */

function Tests() 
{
	// Private variables	
	var tests;  				// map from testID to a TestInFirebase format object
	var testsCount;				// count of the number of tests
	var statsChangeCallback;	// function to call when statistics change
	var functionIDToTests;		// map from a functionID to an array of testIDs that are tests for the function
	
	// Constructor
	this.initialize = function()  {};     
	
	// Public functions
	this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); }
	this.testAdded = function(addedTest) { return testAdded(addedTest); };
	this.testChanged = function(changedTest) { return testChanged(changedTest); };	
	this.testDeleted = function(deletedTest) { return testDeleted(deletedTest); };	
	this.forFunction = function(functionID) { return forFunction(functionID) };
	this.testCasesForFunction = function(functionID) { return testCasesForFunction(functionID); };
	
	this.get = function(id) { return get(id); };
	
	// Function bodies
	
	function init(newStatsChangeCallback)
	{
		statsChangeCallback = newStatsChangeCallback;
		tests = {};
		testCount = 0;
		functionIDToTests = {};
	}
	
	// Event handler for a function being added or changed
	function testAdded(addedTest)
	{
		tests[addedTest.id] = addedTest;
		
		if (!functionIDToTests.hasOwnProperty(addedTest.functionID))		
			functionIDToTests[addedTest.functionID] = [];
		functionIDToTests[addedTest.functionID].push(addedTest.id);
		
		testCount++;
		statsChangeCallback(testCount);
	}	
	
	function testChanged(changedTest)
	{
		tests[addedTest.id] = addedTest;
		statsChangeCallback(testCount);		
	}	
	
	function testDeleted(deletedTest)
	{
		delete tests[addedTest.id];
		
		var testsForFunction = functionIDToTests[deletedTest.functionID];
		if (testsForFunction != null)		
			removeFromArray(functionIDToTests[deletedTest.functionID], deletedTest.id); 

		testCount--;
		statsChangeCallback(testCount);		
	}	
		
	function get(id)
	{
		if (tests.hasOwnProperty(id))		
			return tests[id];
		else
			return null;
	}
	
	// Returns an array of the tests, in TestInFirebase format, of all of the tests for the specified functionID.
	function forFunction(functionID)
	{
		if (!functionIDToTests.hasOwnProperty(functionID))		
			return [];
		else
			return clone(functionIDToTests[functionID]);
	}
	
	// Returns an array of test cases, in TestCaseDTO format, for the specifieid functionID
	function testCasesForFunction(functionID)
	{
		var testsFor = forFunction(functionID);
		var testCasesFor = [];
		
		for (var i=0; i < testsFor.length; i++)
			testCasesFor.push({ text: testFor.description, added: false, deleted: false, id: testFor.id });
		
		return testCasesFor;
	}
}
