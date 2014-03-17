/*
 *  A TestEditor provides a means for editing tests. It takes a list of parameters
 * 
 * 
 * 
 */

function TestEditor() {
	// private variables	
	var textArea;
	var paramName;
	var paramType;   // String indicating type of parameter
	var errorsDiv;
	var codeMirror;
	var changeTimeout;
	var isValidParam = true;
	
	this.initialize = function(newTextArea, newErrorsDiv, newParamName, newParamType)
	{
		textArea = newTextArea;
		errorsDiv = newErrorsDiv;
		errorsDiv.hide();
		paramName = newParamName;
		paramType = newParamType;
		codeMirror = CodeMirror.fromTextArea(textArea); 	
		codeMirror.setSize(null, 120);
		codeMirror.on("change", testChanged);
	};
	
	// Event handler for changes to the CodeMirror box
	function testChanged(editorInstance, changeObject)
	{
		clearTimeout(changeTimeout);
		changeTimeout = setTimeout(
				function(){processTestChanged(editorInstance, changeObject);}, 500);		
	}
	
	// Processes a change to a test
	function processTestChanged(editorInstance, changeObject)
	{
		errorCheck();		
	}	
	
	// Returns true iff the text contained is currently valid
	function isValid()
	{
		return isValidParam;
	}
	
	function errorCheck()
	{
		var errors = "";		
		// wrap the value as an assignment to a variable, then syntax check it
		var stmtToTest = 'var stmt = ' + codeMirror.getDoc().getValue() + ';';			
		if(!JSHINT(stmtToTest,getJSHintGlobals()))
			errors = checkForErrors(JSHINT.errors);

		// If there are no syntax errors, check the structure.
		if (errors == "")
		{
			try
			{
				errors = checkStructure(JSON.parse(codeMirror.getDoc().getValue()), paramType);		
			}
			catch (e)
			{
				// We can get an error here if the 1) field names are not surrounded by double quotes, 2) there's a trailing ,
				// Also need to check that strings are surrounded by double quotes, not single quotes....				
				errors = "Error - 1) field names are surrounded by double quotes, 2) strings are surounded by double quotes - not" 
					+ " single quotes, and 3) there are no trailing commas in the list of fields.";
			}
		}
				
		// Display errors, if there are any.
		if (errors != "")
		{
			errorsDiv.show();
			errorsDiv.html(errors);
			isValidParam = false;
		}
		else
		{
			isValidParam = true;
			errorsDiv.hide();			
		}
	}
	
	// Checks that the provided struct is correctly formatted as the type in typeName.
	// Returns an empty string if no errors and an html formatted error string if there are.
	function checkStructure(struct, typeName)
	{
		var errors = "";
		
		// Recursive case: check for typeNames that are arrays
		if (typeName.endsWith("[]"))
		{
			// Check that struct is an array.
			if (Array.prototype.isPrototypeOf(struct))
			{
				// Recurse on each array element, passing the typename minus the last []
				for (var i = 0; i < struct.length; i++)
				{					
					errors += checkStructure(struct[i], typeName.substring(0, typeName.length - 2));
				}	
			}
			else
			{
				errors += "'" + JSON.stringify(struct) + "' should be an array, but is not.<BR>";
			}
		}	
		// Base case: check for typeNames that are simple types
		else if (typeName == 'String')	
		{
			if (typeof struct != 'string')
				errors += "'" + JSON.stringify(struct) + "' should be a String, but is not.<BR>";
		}
		else if (typeName == "Number")
		{
			if (typeof struct != 'number')
				errors += "'" + JSON.stringify(struct) + "' should be a Number, but is not.<BR>";			
		}
		else if (typeName == "Boolean")
		{
			if (typeof struct != 'boolean')
				errors += "'" + JSON.stringify(struct) + "' should be a Boolean, but is not.<BR>";	
		}
		// Recursive case: typeName is an ADT name. Recursively check that 
		else if (nameToADT.hasOwnProperty(typeName))
		{
			var typeDescrip = nameToADT[typeName].structure;
			
			// Loop over all the fields defined in typeName, checking that each is present in struct
			// and (recursively) that they are of the correct type.
			for (var i = 0; i < typeDescrip.length; i++)
			{
				var fieldName = typeDescrip[i].name;
				var fieldType = typeDescrip[i].type;
				
				if (struct.hasOwnProperty(fieldName))
				{
					errors += checkStructure(struct[fieldName], fieldType);
				}
				else
				{
					errors +=  "'" + JSON.stringify(struct) + "' is missing the required field " + fieldName + "<BR>"; 
				}
			}
		}
		else	
		{
			errors += "Internal error - " + typeName + " is not a valid type name.<BR>";
		}
		
		return errors;
	}
	
	
	
}