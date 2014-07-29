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
	
	// Constructor
	this.initialize = function()  {};     
	
	// Public functions
	this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); }
	this.testAdded = function(addedTest) { return testAdded(addedTest); };
	this.testChanged = function(changedTest) { return testChanged(changedTest); };	
	this.get = function(id) { return get(id); };
	
	// Function bodies
	
	function init(newStatsChangeCallback)
	{
		statsChangeCallback = newStatsChangeCallback;
		tests = {};
		testCount = 0;
	}
	
	// Event handler for a function being added or changed
	function testAdded(addedTest)
	{
		tests[addedTest.id] = addedTest;
		testCount++;
		statsChangeCallback(testCount);
	}	
	
	function testChanged(changedTest)
	{
		tests[addedTest.id] = addedTest;
		statsChangeCallback(testCount);		
	}	
	
	function get(id)
	{
		if (tests.hasOwnProperty(id))		
			return tests[id];
		else
			return null;
	}
}
