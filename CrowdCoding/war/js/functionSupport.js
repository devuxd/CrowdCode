/*
 *  FunctionsSupport manage header and description of the functions.
 */


	
	function renderDescription(description, returnType, paramNames, paramTypes, paramsDescriptions)
	{
		    	
			var numParams = 0;
			var fullDescription = '/**\n' + description + '\n'; 
						
	    	// Format description into 66 column max lines, with two spaces as starting character
			fullDescription = wordwrap(fullDescription, 66, '\n  ') + '\n'; 
		
	    	for(var i=0; i<paramNames.length; i++)
				{
				if(paramsDescriptions!=undefined && paramsDescriptions.length>i)
					fullDescription += '  @param ' + paramTypes[i] + ' ' + paramNames[i] + ' - ' + paramsDescriptions[i] + '\n'; 
				
				}
			
			
			fullDescription += '\n  @return ' + returnType + ' \n' + '**/\n\n';
			
			return fullDescription;
			
		
	}
	
	
	function renderHeader(functionName, paramNames)
	{
		var header = 'function ' + functionName + '(';
		var numParams = 0;
		
		for(var i=0; i<paramNames.lenght; i++)
		{
		  	if (numParams > 0)
    			header += ', ';
     
	  		header += paramNames[i];	
		}
	    header += ')';
		
		return header;
	}