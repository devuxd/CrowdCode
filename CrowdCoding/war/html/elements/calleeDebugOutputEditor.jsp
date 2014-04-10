<script src='/js/instrumentFunction.js'></script>

<div id="addCalleeSection"></div>

<script>
	var rowMap = [];
	var outputEditors = [];

    //Iterates through the calleeList and the calleeMap to obtain inputs and outputs for all executed callees.
	function displayDebugFields(calleeList, calleeMap)
	{
    	// reset rowMap
    	rowMap = [];    
    	outputEditors = [];
		var i = 0;
		var newHTML = '';

		// For each text area that is to be created as an output editor, the name of the function being called.
		var functionNamesForOutputEditors = [];
		
		var nonLibraryCallees = findNonLibraryCallees(calleeList);
		
		if (nonLibraryCallees.length > 0)
			newHTML += '<table><tr><td>Inputs</td><td>Output</td>';
			
		$.each(nonLibraryCallees,function(j,calleeName)
		{
			// If there is no function description for the call, assume it is a library function
			// and ignore it, as the output of library functions cannot be edited.
			
			if (functionToDescription.hasOwnProperty(calleeName))
			{			
				var inputsMap={};
				inputsMap=calleeMap[calleeName];
				newHTML += '<div functionName='+"\'"+calleeName+"\'"+'><pre>';
				newHTML += functionToDescription[calleeName].replace(/\n/g, "<BR>") + '</pre>';
				
				for (var key in inputsMap) 
				{
					if (inputsMap.hasOwnProperty(key)) 
					{
						var obj = inputsMap[key];
						var paramObj = obj.parameters;
						var objContent = "";
						var paramsArray = [];
						
						for(var prop in paramObj){
							if (paramObj.hasOwnProperty(prop))
							{
								objContent = objContent +","+ JSON.stringify(paramObj[prop], null, 4);
								paramsArray.push(JSON.stringify(paramObj[prop]));
							}
						}
						objContent=objContent.substr(1);
						
						newHTML += '<tr><td><pre>' + objContent + '</pre></td>' 
						    + '<td><textarea class="functionValues ';
						if (hasMockForKey(calleeName, key))
							newHTML += ' mockOutput';
						newHTML += '" id="mockTextArea' + i + '" >' + 
							JSON.stringify(obj.returnValue, null, 4) 
							+ '</textarea><div class="alert alert-error" id="erorrsForMock' + i + '"</div></td></tr>';
					     
					    rowMap.push({ functionName: calleeName, inputsKey: key, 
					    	         inputs: paramsArray, returnValue: obj.returnValue });
					    
					    functionNamesForOutputEditors.push(calleeName);
						i++;	
					}
				}			
			}
			newHTML += '</div>';
		});

		if (nonLibraryCallees.length > 0)
			newHTML += '</table>';
			
		$("#addCalleeSection").html(newHTML);
		
		for (var j=0; j < i; j++ )
		{
			var mockTextArea = "mockTextArea" + j;   
   			var errorsForMockDiv = "erorrsForMock" + j; 
  			var type = functionToReturnType[functionNamesForOutputEditors[j]];  
   			var jsonEditor = new JSONEditor();
   			jsonEditor.initialize($('#' + mockTextArea)[0], $('#' + errorsForMockDiv), type);
   			outputEditors.push(jsonEditor);
   			//jsonEditor.getCodeMirror().on('change', function() { jsonEditor.getCodeMirror().save(); updateMock($('#' + mockTextArea)[0], j) });
		}
		
	}
        
    // Returns a new list of callees, removing any calls to library functions.
    function findNonLibraryCallees(calleeList)
    {
		var nonLibraryCallees = [];
		
		$.each(calleeList,function(i,calleeName)
		{
    		if (functionToDescription.hasOwnProperty(calleeName))
    			nonLibraryCallees.push(calleeName);			
		});

    	return nonLibraryCallees;
    }  
	
    // Update the specified mock
	function updateMock(inputText, index)
	{
    	alert(inputText.value);
    	
		var rowData = rowMap[index];
		
		// If there's no row for this function (e.g., it is a library call), do nothing,
		if (rowData == undefined)
			return;		
		

		// If there is not already mocks for this function, create an entry
		var functionMocks;
		if (mocks.hasOwnProperty(rowData.functionName))
		{
			functionMocks = mocks[rowData.functionName];
		}
		else
		{
			functionMocks = {};
			mocks[rowData.functionName] = functionMocks;
		}

		// Try to parse the output as JSON. If it fails, use the input as a string
		var output = inputText.value.trim();
		try 
		{
			output = JSON.parse(output);
		}
		catch (e)
		{
			// Do nothing
		}
		functionMocks[rowData.inputsKey] = { inputs: rowData.inputs, output: output };
		
		// Mark this output as being mock output
		$(inputText).addClass("mockOutput");
	}
    
	// Collects and returns mock data as an arry of MockDTO format objects
	function collectMocks()
	{
		var mockData = [];
		
		// Iterate over each of the functions that have mocks
		for (var functionName in mocks) 
		{
			if (mocks.hasOwnProperty(functionName)) 
			{
				var functionMocksA = mocks[functionName];					
				for (var inputKeys in functionMocksA)
				{
					var functionMocksB = functionMocksA					
					if (functionMocksB.hasOwnProperty(inputKeys))
					{
						var aMock = functionMocksB[inputKeys];
						var inputs = Array.prototype.slice.call(aMock.inputs, 0);
						var stringifiedInputs = [];
						for (var i = 0; i < inputs.length; i++)
							stringifiedInputs.push(inputs[i]);
												
						mockData.push({ functionName: functionName, 
							inputs: stringifiedInputs, 
							expectedOutput: JSON.stringify(aMock.output),
							code: buildTestImp(functionName, inputs, JSON.stringify(aMock.output))});		
					}
				}
			}
		}
		
	    return mockData;
	}
	
	
	// Given a function, an array of inputs, and an output, builds a string of test code
	// to test this
	function buildTestImp(functionName, inputs, output)
	{
		// Build code corresponding to the values entered in simple mode.
		var code = 'equal(' + functionName + '(';
		
		// Add a parameter for each input element ni the parameterValues div				
		$.each(inputs, function(index, input)
		{
			// Add a comma for any but the first param
			if (index != 0)
				code = code + ', ';
			
			code = code + input;
		});		
		code = code + '), ' + output + ", '');";
		
		return code;
	}
	
	// Check if there is a mock for the specified function and key
	function hasMockForKey(functionName, argsKey)
	{
		var hasMock = false;
		var mockOutput = null;
		
		if(mocks.hasOwnProperty(functionName))
		{
			var inputOutputMap = mocks[functionName];
			if (inputOutputMap.hasOwnProperty(argsKey))
				return true;						
		}
		return false;
	}	
</script>
