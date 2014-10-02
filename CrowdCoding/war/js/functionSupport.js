/*
 *  FunctionsSupport manage header and description of the functions.
 */


	
	function renderDescription(functionCalled)
	{
		    	console.log("paramNames"+functionCalled.paramNames.length );
		    	//console.log("paramTypes"+functionCalled.paramTypes.length );
		    	console.log("paramdescriptins"+functionCalled.paramDescriptions.length );
		    	
			var numParams = 0;
			var fullDescription = '/**\n' + functionCalled.description + '\n'; 
						
	    	// Format description into 66 column max lines, with two spaces as starting character
			fullDescription = wordwrap(fullDescription, 66, '\n  ') + '\n'; 
		
	    	for(var i=0; i<functionCalled.paramNames.length; i++)
				{
				if(functionCalled.paramDescriptions!=undefined && functionCalled.paramDescriptions.length>i)
					fullDescription += '  @param ' + functionCalled.paramTypes[i] + ' ' + functionCalled.paramNames[i] + ' - ' + functionCalled.paramDescriptions[i] + '\n'; 
				
				}
			
			
			fullDescription += '\n  @return ' + functionCalled.returnType + ' \n' + '**/\n\n';
			
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