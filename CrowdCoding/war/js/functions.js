/*
 *  Functions maintains the state of all functions, synchronized with the server, and provides services
 *  for running functions.
 */

function Functions() 
{
	// Private variables	
	var functions;  			// map from functionID to a FunctionInFirebase format object
	var functionCount;			// count of the number of functions
	var statsChangeCallback;	// function to call when statistics change
	var linesOfCode;		
	
	// Constructor
	this.initialize = function()  {};     
	
	// Public functions
	this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); }
	this.functionAdded = function(addedFunction) { return functionAdded(addedFunction); };
	this.functionChanged = function(changedFunction) { return functionChanged(changedFunction); };	
	this.get = function(id) { return get(id); };
	
	// Function bodies
	
	function init(newStatsChangeCallback)
	{
		statsChangeCallback = newStatsChangeCallback;
		functions = {};
		functionCount = 0;
		linesOfCode = 0;
	}
	
	// Event handler for a function being added or changed
	function functionAdded(addedFunction)
	{
		functions[addedFunction.id] = addedFunction;
		functionCount++;
		linesOfCode += addedFunction.linesOfCode;
		statsChangeCallback(linesOfCode, functionCount);
	}	
	
	function functionChanged(changedFunction)
	{
		linesOfCode += changedFunction.linesOfCode - functions[changedFunction.id].linesOfCode;
		functions[changedFunction.id] = changedFunction;
		statsChangeCallback(linesOfCode, functionCount);		
	}	
	
	function get(id)
	{
		if (functions.hasOwnProperty(id))		
			return functions[id];
		else
			return null;
	}
}
