/*
 *  Tests maintains the state of all tests, synchronized with the server, and provides services
 *  for running tests.
 * 
 */

function Tests() {
	// private variables	
	var tests;
	
	this.initialize = function()
	{
		textArea = newTextArea;
		errorsDiv = newErrorsDiv;
		errorsDiv.hide();
		paramType = newParamType;
		codeMirror = CodeMirror.fromTextArea(textArea); 	
		codeMirror.setSize(null, 120);
		codeMirror.on("change", testChanged);
	};
	
	// Public functions.
	//this.isValid = function() { return isValid(); };
	
}
