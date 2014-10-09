/*
 *  A JSONValitator provides a way to validate json texts.
 * 
 */

function JSONValidator() {
	// private variables	
	var text;
	var isValidParam;
	var paramType;   // String indicating type of parameter
	var errors;
	
	this.initialize = function(JSONtext, newParamType)
	{
		text         = JSONtext
		paramType    = newParamType;
		isValidParam = false;
	};
	
	this.isValid    = function() { return isValid(); };
	this.errorCheck = function() { return errorCheck(); };	
	this.getErrors  = function() { return errors; };	
	
	// Returns true iff the text contained is currently valid
	function isValid()
	{
		return isValidParam;
	}
	
	function errorCheck()
	{	
		errors = "";

		// wrap the value as an assignment to a variable, then syntax check it
		var stmtToTest = 'var stmt = ' + text + ';';	
		if(!JSHINT(stmtToTest,getJSHintGlobals()))
			errors = checkForErrors(JSHINT.errors);

		// If there are no syntax errors, check the structure.
		if (errors == "")
		{
			try
			{
				errors = checkStructure(JSON.parse(text), paramType);		
			}
			catch (e)
			{
				console.log(e);
				// We can get an error here if the 1) field names are not surrounded by double quotes, 2) there's a trailing ,
				// Also need to check that strings are surrounded by double quotes, not single quotes....				
				errors = "Error - 1) property names are surrounded by double quotes, 2) strings are surounded by double quotes - not" 
					+ " single quotes, and 3) there are no trailing commas in the list of fields.";
			}
		}

		isValidParam = (errors=="") ? true : false ;
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
				errors += "'" + JSON.stringify(struct) + "' should be an array, but is not. Try enclosing " +
						"the value in array bracks ([]).\n";
			}
		}	
		// Base case: check for typeNames that are simple types
		else if (typeName == 'String')	
		{
			if (typeof struct != 'string')
				errors += "'" + JSON.stringify(struct) + "' should be a String, but is not.\n";
		}
		else if (typeName == "Number")
		{
			if (typeof struct != 'number')
				errors += "'" + JSON.stringify(struct) + "' should be a Number, but is not.\n";			
		}
		else if (typeName == "Boolean")
		{
			if (typeof struct != 'boolean')
				errors += "'" + JSON.stringify(struct) + "' should be a Boolean, but is not.\n";	
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
					errors += checkStructure(struct[fieldName], fieldType);
				else
					errors +=  "'" + JSON.stringify(struct) + "' is missing the required property " + fieldName + "\n"; 
			}
		}
		else	
		{
			errors += "Internal error - " + typeName + " is not a valid type name.\n";
		}
		
		return errors;
	}	
}
