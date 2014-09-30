<script>
	var nextParam = 2;
	var functionNames;
	
	$(document).ready(function()
	{
		functionNames = buildFunctionNames();
		
		$('#errorMessages').hide();
		
		$("input[type=text]").focus(function(){
		    // Select field contents
		    this.select();
		});
		
		$("#addParameter").click(function()
		{
			$("#addParamRow").before('<tr id="params' + nextParam + '"><td></td><td>' +						
				    '<input type="text" onblur="validateAll(true)" placeholder = "paramName" class="input-small">,&nbsp;&nbsp;//' + 
					'&nbsp;<input type="text" onblur="validateAll(true)" placeholder = "type" class="input-small">&nbsp;&nbsp;-&nbsp;&nbsp;' + 
					'<input type="text" placeholder = "what is it for?" class="input-xlarge"> ' +	
					'<a href="#" onclick="deleteParams(\'#params' + nextParam + '\')" class="closeButton">&times;</a>' +	
					'</td>');
			// Set focus to the first input field in the new row.
			$('#params' + nextParam).find("input").eq(0).focus();

			nextParam++;						
			return false;
		});
	});
	
 	// Builds a list of names of every function declared in the system
 	function buildFunctionNames()
 	{
 		var names = [];
 		var functionsAST = esprima.parse(allTheFunctionCode);	
 		
 		// Iterate over each function declaration, grabbing its name
 		$.each(functionsAST.body, function(index, bodyNode)
 		{
 			if (bodyNode.type == "FunctionDeclaration")		
 				names.push(bodyNode.id.name);
 		});
 		
 		return names;
 	}	
			  
	function deleteParams(params)
	{
		$(params).remove();
	}
	
	// Validates all form fields that require validity checking, updating the 
	// errorMessages div as appropriate to show errors. If ignoreEmpty is true, fields that are currently
	// empty are ignored. Returns true iff all of the validated fields are correct.
	function validateAll(ignoreEmpty)
	{
		var errors = '';
				
		errors += validateFunctionName($("#name"), ignoreEmpty);
	    errors += validateReturnTypeName($("#returnType"), ignoreEmpty);
		
	    $("tr[id^=params]").each(function(index, value)
   	    {	    		    	
   	    	errors += validateParamName($(this).find("input").eq(0), ignoreEmpty);
   	    	errors += validateParamTypeName($(this).find("input").eq(1), $(this).find("input").eq(0).val(),
   	    			ignoreEmpty);   	    	
   	    });
		
		if (errors != '')
		{
			$('#errorMessages').show();
			$('#errorMessages').html(errors);
			return false;
		}
		else
		{
			$('#errorMessages').hide();
			return true;
		}		
	}
	/*
	function validateFunctionName(inputText, ignoreEmpty)
	{
		var value = inputText.val().trim();
		inputText.val(value);
		
		if (ignoreEmpty && value == '')
			return '';
		
		// Check that the function name is syntactically valid by building an 
		// empty function and running JSHint against it. If there's an error, it's not valid.
		// Also check that the function does not match a current function name.
		
		var codeToTest = 'function ' + value + '() {}';
		
		if (value == '')
			return 'Missing a function name.<BR>';
		else if (functionNames.indexOf(value) != -1)
			return "The function name '" + value + "' is already taken. Please use another.<BR>";		
		else if(!JSHINT(codeToTest,getJSHintGlobals()))
			return value + ' is not a valid function name.<BR>';
		else
			return '';
	}
	
	function validateParamName(inputText, ignoreEmpty)
	{
		var value = inputText.val().trim();
		inputText.val(value);
		
		if (ignoreEmpty && value == '')
			return '';
		
		// Check that the function name is syntactically valid by building an 
		// empty function and running JSHint against it. If there's an error, it's not valid.
		// Also check that the function does not match a current function name.
		
		var codeToTest = 'function funcABC( ' + value + ') {}';	
		if (value == '')
			return 'Missing a paramater name.<BR>';
		else if(!JSHINT(codeToTest,getJSHintGlobals()))
			return value + ' is not a valid paramater name.<BR>';
		else
			return '';
	}
	
	function validateParamTypeName(inputText, paramName, ignoreEmpty)
	{
		var value = inputText.val().trim();
		inputText.val(value);
		
		if (ignoreEmpty && value == '')
			return '';
		
		if (value == '')
			return 'Missing a type name for ' + paramName + '.<BR>';
		else if(!isValidTypeName(value)&&!isNotAlreadyTaken(value))
			return 'The type for ' + paramName + ' - ' + value + ' is not a valid type name. Valid type names are '
			  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]). <BR>';
		else
			return '';
	}
	
	function validateReturnTypeName(inputText, ignoreEmpty)
	{
		var value = inputText.val().trim();
		inputText.val(value);
		
		if (ignoreEmpty && value == '')
			return '';
		
		if (value == '')
			return 'Missing a return type.<BR>';
		else if(!isValidTypeName(value))
			return 'The return type ' + value + ' is not a valid type name. Valid type names are '
			  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]). <BR>';
		else
			return '';
	}
	*/
	function collectSignatureData()
	{
		var numParams = 0;
		var description = '/**\n' + $("#functionDescription").val() + '\n'; 
		var paramNames = [];
		var paramTypes = [];
		
    	// Format description into 66 column max lines, with two spaces as starting character
		description = wordwrap(description, 66, '\n  ') + '\n'; 
		
		var header = 'function ' + $("#name").val() + '(';
	    $("tr[id^=params]").each(function(index, value)
	    {	    		    	
	    	if (numParams > 0)
	    		header += ', ';
	    	
	    	var paramName = $(this).find("input").eq(0).val();
	    	var paramType = $(this).find("input").eq(1).val();
	    	var paramDescrip = $(this).find("input").eq(2).val();
	    	
	    	paramNames.push(paramName);
	    	paramTypes.push(paramType);
	    	header += paramName;
	    	description += '  @param ' + paramType + ' ' + paramName + ' - ' + paramDescrip + '\n'; 
	    	
	    	numParams++;
	    });
	    header += ')';
		description += '  @return ' + $("#returnType").val() + ' \n' + '**/\n';
		
		var formData = { name: $("#name").val(),
				    returnType: $("#returnType").val(),
				    paramNames: paramNames,
				    paramTypes: paramTypes,
			     	description: description,
					header: header };				

	    return formData;
	}
</script>


<textarea id="functionDescription" draggable="true" placeholder="Can you briefly describe the purpose and behavior of the function?"></textarea>
returns &nbsp;&nbsp;<input type="text" id="returnType" onblur="validateAll(true)" placeholder = "return type" class="input-medium"><BR>
function 
<input type="text" id="name" onblur="validateAll(true)" placeholder = "functionName" class="input-medium">(
<BR>
<table>
	<tr id="params1">
		<td width="20">
		<td>
			<input type="text" onblur="validateAll(true)" placeholder = "paramName" class="input-small">,&nbsp;&nbsp;// 
			<input type="text" onblur="validateAll(true)" placeholder = "type" class="input-small">&nbsp;&nbsp;-&nbsp; 
			<input type="text" placeholder = "what's it for?" class="input-xlarge">
			<a href="#" onclick="deleteParams('#params1')" class="closeButton">&times;</a>
		</td>
	<tr>
	<tr id="addParamRow">
		<td></td>					
		<td><button id="addParameter" class="btn btn-small">Add parameter</button></td>			
	</tr>
</table>
);
<div id="errorMessages" class="alert alert-error"></div>