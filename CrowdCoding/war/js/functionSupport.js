/*
 *  FunctionsSupport manage header and description of the functions.
 */

	
	
	
	
	
	function renderDescription(functionCalled)
	{
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
	
	//Checks that exists a description of the parameter 
	function isValidParamDescription(line)
	{
		var beginDescription = line.indexOf(' - ');
		if(beginDescription==-1||line.substring(beginDescription).lenght<5)
			return false;
		else
			return true;
	}
	
	

	// checks that the name is vith alphanumerical characters or underscore
	function isValidName(name)
	{
		var regexp = /^[a-zA-Z0-9_]+$/;
		
		if (name.search(regexp)==-1)
		 	return false;
		else
			return true;
		
	}
	
	

	
	// Starting at index start, finds the next contiguous set of nonspace characters that end in a space or the end of a line
	// (not returning the space). If no such set of characters exists, returns -1
	// Must be called where start is a nonspace character, but may be past the end of text.
	function findNextWord(text, start)
	{
		if (start >= text.length)
			return -1;
				
		var nextSpace = text.indexOf(' ', start);
		
		// If there is no next space, return the whole string. Otherwise, return everything from start up to 
		// (but not incluing) nextSpace.
		if (nextSpace == -1)
			return text.substring(start);
		else
			return text.substring(start, nextSpace);
	}
	
	

	function parseDescription(lineDescription,functionName)
	{
		var functionData={};
		functionData.paramTypes=[];
		functionData.paramNames=[];
		functionData.paramDescriptions=[];
		functionData.description="";
		functionData.header = 'function ' + functionName + '(';
		var numParams = 0;
		
		for(var i=0; i<lineDescription.length;i++){
			
			lineDescription[i] = lineDescription[i].replace(/\s{2,}/g,' ');
			var paramLine = lineDescription[i].search('@param ');
			var returnLine = lineDescription[i].search('@return ');
			
			if(paramLine!=-1)
				{		
					var paramType = findNextWord(lineDescription[i], paramLine + 7);
					var paramName = findNextWord(lineDescription[i], paramLine + paramType.length+ 8);
					var paramDescriptions = lineDescription[i].substring( paramLine + paramType.length+ paramName.length +11);
					
					
					functionData.paramTypes.push(paramType);
					functionData.paramNames.push(paramName);
					functionData.paramDescriptions.push(paramDescriptions.trim());		
					
					if (numParams > 0)
						functionData.header += ', ';
		     
					functionData.header += paramName;	
					numParams++;
				}
			
			else if(returnLine!=-1)
				{
				var type = findNextWord(lineDescription[i], returnLine + 9);
				
				functionData.returnType=type
						
				}
			else if(lineDescription[i].length>4)
				
				functionData.description+=lineDescription[i];
			}
		functionData.header += ')';
			
			return functionData;
		}