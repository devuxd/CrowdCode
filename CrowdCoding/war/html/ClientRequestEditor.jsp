<html>
<head>
	<title>CrowdCode Client Request Editor</title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="/css/styles.css">
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>	
	<script src="/include/polyfill.js"></script>
	<script src="/include/jshint.js"></script>
	<script src="/js/errorCheck.js"></script>
	<script src="/js/functionSupport.js"></script>
	<script src="/js/ADTandDataCheck.js"></script>
	<script>
		var firebaseURL = 'https://crowdcode.firebaseio.com';
		var firebaseRef;
		
		// User stories are numbered from 0 to userStoryCount - 1 (as are ADTs).
		var ADTCount = 0;
		var functionCount = 0;
		var nextParameter = [];
		var typeNames = [];
		
		
		$(document).ready(function()
		{
			addDefaultADTData();
			
			$("#newFunctionDiv , #newParameterDiv, #errorMessages").hide();
			
			$('#addADT').click(function()
			{
				addADT('', '', '');
			});
		
			$('#addFunction').click(function()
					{
						addFunction("","","","","","", '{\n\t//#Mark this function as implemented by removing this line.\n\treturn {}; \n}');
					});
			
			$('#save').click(function()
			{
				if(validateAll())
				{
				// Save ADTs
				firebaseRef = new Firebase(firebaseURL + '/clientRequests/' + $('#project').val() + '/ADTs/ADTs');
				var ADTs = [];
				$("div[id^=ADTContainer]").each(function(){	    		    	
					var name = $(this).find("input[id^=ADTName]").val();
					var structure = $(this).find("textarea[id^=ADTStructure]").val();
					var description = $(this).find("textarea[id^=ADTDescrip]").val();	
					ADTs.push( { name: name, structure: parseStructureIntoJSON(structure), description: description });
			    });				
				firebaseRef.set(ADTs);
				
				// Save functions
				firebaseRef = new Firebase(firebaseURL + '/clientRequests/' + $('#project').val() + '/functions/functions');
				var functions = [];
				$("div[id^=FunctionContainer]").each(function(){	    		    	
								
					
					var numParams = 0;
					var paramNames = [];
					var paramTypes = [];
					var paramDescriptions = [];
			    	
					var header = 'function ' + $(this).find("input[id^=FunctionName]").val() + '(';
					$(this).find("tr[id=params]").each(function(index, value)
				    {	    		    	
				    	if (numParams > 0)
				    		header += ', ';
				    	
				    	var paramName = $(this).find("input").eq(0).val();
				    	var paramType = $(this).find("input").eq(1).val();
				    	var paramDescrip = $(this).find("input").eq(2).val();
				    	
				    	paramNames.push(paramName);
				    	paramTypes.push(paramType);
				    	paramDescriptions.push(paramDescrip);
				    	header += paramName;
				    	
				    	numParams++;
				    });
					
					
				    header += ')';
					
					console.log(paramDescriptions+"   "+ paramNames);
									
					var description = "";	
					var descLines = $(this).find("textarea[id^=FunctionDescription]").val().split("\n");

					for(var i=0; i < descLines.length; i++){
						
						if( descLines[i] != "" )
							description += descLines[i].trim() + "\n";
					}

					
					functions.push( { name: $(this).find("input[id^=FunctionName]").val(),
									returnType: $(this).find("input[id^=FunctionReturnType]").val(),
									paramNames: paramNames,
									paramTypes: paramTypes,
									paramDescriptions: paramDescriptions,
									header: header,
									description: description,
									code: $(this).find("textarea[id^=FunctionCode]").val(),	
														}); 
			    });				
				firebaseRef.set(functions);
			}});
			
			
			$('#load').click(function()
			{
				// Delete all the existing ADTs and functions
				$('#ADTs').html('');	
				$('#functions').html('');		
								
				// Add ADTs for each ADT in firebase				
				firebaseRef = new Firebase(firebaseURL + '/clientRequests/' + $('#project').val() + '/ADTs/ADTs');
				firebaseRef.once('value', function(dataSnapshot) 
				{ 
					$.each(dataSnapshot.val(), function(index, ADT)
					{
						addADT(ADT.name, renderStructure(ADT.structure), ADT.description);
					});
				});
				
				// Add functions for each function in firebase				
				firebaseRef = new Firebase(firebaseURL + '/clientRequests/' + $('#project').val() + '/functions/functions');
				firebaseRef.once('value', function(dataSnapshot) 
				{ 
					$.each(dataSnapshot.val(), function(index, functionObj)
					{
										
						addFunction(functionObj.description, functionObj.returnType, functionObj.name,  functionObj.paramNames, 
								functionObj.paramTypes, functionObj.paramDescriptions , functionObj.code);
					});
				});
			});
		});	
		
		// Takes a string listing fields in the format of "fieldName: typeName, ..." and outputs an array
		// of JSON objects for each field, where each JSON object is of the form { name: fieldName, type: typeName }
		function parseStructureIntoJSON(structure)
		{
			var fields = [];

			var arrayOfFieldStrings = structure.split(',');
			for (var j = 0; j < arrayOfFieldStrings.length; j++)
			{
				var fieldElements = arrayOfFieldStrings[j].split(':');
				var fieldName = fieldElements[0].trim();
				var typeName = fieldElements[1].trim();
				fields.push({ name: fieldName, type: typeName });
			}

			return fields;
		}
		
		//Add the default ADT Data
		function addDefaultADTData()
		{
			typeNames.push('String');
			typeNames.push('Number');
			typeNames.push('Boolean');		
		}
		
		function addClientADTData(value)
		{
			typeNames.push(value);
		}
		
		function removeClientADTData(value)
		{
			
			var index = typeNames.indexOf(value);
			
			if (index != -1) {
				typeNames.splice(index, 1);
			}
		}
		
		
		// Renders a structure in JSON format of [{ name: fieldName, type: typeName }, ... ] into the format of
		// "fieldName: typeName, ..."
		function renderStructure(structureJSON)
		{
			var structureString = '';
			
			for (var j = 0; j < structureJSON.length; j++)
			{
				if (j > 0)
					structureString += ', ';
				
				structureString += structureJSON[j].name + ': ' + structureJSON[j].type;				
			}
			
			return structureString;
		}
		/*
		// Takes a string with a list of zero or more comma delimeted items
		// Produces a JSON array of strings corresponding to each element in the list
		function parseList(input)
		{
			var output = input.split(',');
			// Remove spaces from output
			for (i = 0; i < output.length; i++)
				output[i] = output[i].trim();
			
			return output;
		}
		
		// Takes a JSON array of strings, renders as a string containing a comma delimeted list
		function renderList(input)
		{
			var output = '';
			if (input != null && input != '')
			{
				for (i = 0; i < input.length; i++)
				{
					if (i > 0)
						output += ', ';
					output += input[i];	
				}				
			}
				
			return output;
		}
		
		*/
		
		//add a new ADTField
		function addADT(name, structure, description)
		{
			$('#ADTs').append('<div class="ADTContainer" id="ADTContainer' + ADTCount + '"><div class="ADT">'
					+ 'Name: <input type="text" id="ADTName' + ADTCount + '" value="' + name + '"><BR>'
					+ 'JSON structure: <textarea class="ADTDescrip" id="ADTStructure' + ADTCount + '">' 
					    + structure + '</textarea><BR>' 
					+ 'Description: <textarea class="ADTDescrip" id="ADTDescrip' + ADTCount + '">'
					+ description + '</textarea>' 
					+ '</div>'
					+ '<a href="#" onclick="deleteADT(\'#ADTContainer' 
						+ ADTCount + '\')" class="closeButton">x</a></div>');
			
			//when the field loses fous add that name to the ADTlist
			$("#ADTContainer" + ADTCount).find("[id^=ADTName]").blur(function()
					{
				addClientADTData($(this).val());

			});
			
			//whenever the field name is selected remove that value from the ADTlist
			$("#ADTContainer" + ADTCount).find("[id^=ADTName]").focus(function()
					{
				removeClientADTData($(this).val());

			});
			
			
			//add the name to the list if already exists
			if(name!="")
				{
				addClientADTData(name);
				}
			
			
			ADTCount++;
		}
		
		function deleteADT(adt)
		{
			$(adt).remove();
		}
		
		function addField(name, type)
		{
			$('#ADTs').append('<div class="ADTContainer" id="ADTContainer' + ADTCount + '"><div class="ADT">'
					+ 'Name: <input type="text" id="ADTName' + ADTCount + '" value="' + name + '"><BR>'
					+ 'JSON structure: <textarea class="ADTDescrip" id="ADTStructure' + ADTCount + '">' 
					    + JSON.stringify(structure) + '</textarea><BR>'  
					+ 'Description: <textarea class="ADTDescrip" id="ADTDescrip' + ADTCount + '">'
					+ description + '</textarea>' 
					+ '</div>'
					+ '<a href="#" onclick="deleteADT(\'#ADTContainer' 
						+ ADTCount + '\')" class="closeButton">x</a></div>');
			ADTCount++;
		}
		
		function deleteField(field)
		{
			$(field).remove();
		}
				
		
		function addFunction(description, returnType, name, paramNames, paramTypes, paramDescriptions, code)
		{
			$('#functions').append('<div class="ADTContainer" id="FunctionContainer' + functionCount + '"><div id=adt class="ADT">' +
							$("#newFunctionDiv").html() + '</div>'
							+ '<a href="#" onclick="deleteFunction(\'#FunctionContainer' 
							+ functionCount + '\')" class="closeButton">x</a></div>'
					);
			
			//set the behavior of the fields
			setActionFunction();
				
			//set the value in the fileds
			setValueFunction(description,  returnType, name, paramNames, paramTypes, paramDescriptions, code);
	   		
			
			functionCount++;
		}
		
		
		function setValueFunction( description,  returnType, name, paramNames, paramTypes, paramDescriptions, code)
		{
		
			$("#FunctionContainer"+functionCount+" #FunctionDescription").val(description);
			$("#FunctionContainer"+functionCount+" #FunctionName").val(name);
			$("#FunctionContainer"+functionCount+" #FunctionReturnType").val(returnType);
			$("#FunctionContainer"+functionCount+" #FunctionCode").val(code);
			
			//for each parameter in the list I create a new parameter field with the given data
			for	(index = 0; index < paramNames.length; index++) {
			
				addParameterFunction(paramNames[index],paramTypes[index], paramDescriptions[index], $("#FunctionContainer"+functionCount+" #addParamRow"));
				
			}
			
			//if is a new function creates an empty parameter field
			if(name==="")
				{
				addParameterFunction("","","", $("#FunctionContainer" +functionCount+" #addParamRow"));
						
				}
			
		}
		
		
		
		function setActionFunction()
		{
			$("#FunctionContainer"+functionCount+" #addParameter").click(function()
					{
						addParameterFunction("","","",$(this).closest("[id=addParamRow]"));		
					});
					
					
			$("#FunctionContainer" +functionCount+" #FunctionReturnType").blur(function()
					{
						validateFunction($(this).closest("[id^=FunctionContainer]"),true);
					});
					
					
			$("#FunctionContainer" +functionCount+" #FunctionName").blur(function()
					{
						validateFunction($(this).closest("[id^=FunctionContainer]"),true);
					});
		}
		
		
		
		function deleteFunction(functionDiv)
		{
			$(functionDiv).remove();			
		}
		
		function addParameterFunction(name,type,description,addParamRowDiv)
		{
			
			 $(addParamRowDiv).before('<tr id="params"><td></td><td>' +						
				    '<input id="paramName" type="text" placeholder = "Parameter Name" value="'+name+'" class="input-small">,&nbsp;&nbsp;//' + 
					'&nbsp;<input id="paramType" type="text" placeholder = "type" value="'+type+'" class="input-small">&nbsp;&nbsp;-&nbsp;&nbsp;' + 
					'<input type="text" placeholder = "what is it for?" value="'+description+'" class="input-xlarge"> ' +	
					'<a id="deleteParam" href="#" class="closeButton">&times;</a>' +	
					'</td>');
			
			
			
				// Set focus to the first input field in the new row.
			 $(addParamRowDiv).prev().find("input").eq(0).focus();		
			
			 $(addParamRowDiv).prev().find("#deleteParam").click(function(){
				 
						deleteParams($(this).closest("[id=params]"));
						
					});
			 
			 $(addParamRowDiv).prev().find("#paramName").blur(function(){
				 
						validateFunction($(this).closest("[id^=FunctionContainer]"),true);
								
					});
			 
			 $(addParamRowDiv).prev().find("#paramType").blur(function(){
				 
				 validateFunction($(this).closest("[id^=FunctionContainer]"),true);
								
					});
					
		}
	
		
		function deleteParams(params)
		{
			
			$(params).remove();
		}
		
		// Validates all form fields that require validity checking for one function, updating the 
		// errorMessages div as appropriate to show errors. If ignoreEmpty is true, fields that are currently
		// empty are ignored. Returns true iff all of the validated fields are correct.
		function validateFunction(functionDiv, ignoreEmpty)
		{
			
			var errors = '';
					var functionName = $(functionDiv).find("#FunctionName");
					var functionReturn = $(functionDiv).find("#FunctionReturnType");
					
			errors += validateFunctionName(functionName, ignoreEmpty);
			
		    errors += validateReturnTypeName(functionReturn, ignoreEmpty);
			
		   $(functionDiv).find("tr[id^=params]").each( function(){ 
			   
	   	    	errors += validateParamName($(this).find("input").eq(0), ignoreEmpty);
	   	    	errors += validateParamTypeName($(this).find("input").eq(1), $(this).find("input").eq(0).val(),
	   	    			ignoreEmpty);   	    	
		   });
			
			if (errors != '')
			{
				$(functionDiv).find("#errorMessages").show();
				$(functionDiv).find("#errorMessages").html(errors);
				return false;
			}
			else
			{
				$(functionDiv).find("#errorMessages").hide();
				return true;
			}		
		}
		
		
		//return true if all the form are filled otherwise false and sets the errors
		function validateAll()
		{
			$("[id^=FunctionContainer]").each(function(){
				
				if(!validateFunction(this,false))
					return false;
				
				
			});
			return true;
		}
		
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Welcome to the <b>CrowdCode Client Request Editor</b></h3>
			Enter a project name in the textbox below to retrieve the client request for the project.
			If it does not exist, it will be created. Use the special project name "default" to
			set the client request for projects that do not have a client request specified.<BR><BR>
		
		   	<input type="text" class="input-xlarge" id="project">
		   	<button id="load" class="btn btn-small">Load</button> 
			<h4>ADTs</h4>
			Describe ADTs with a name, JSON structure, and description. The JSON structure should be of the form
			<b>fieldA: TypeName, fieldB: String</b>, where each TypeName is either defined separately as an 
			ADT or is one of the three primitives String, Number, Boolean. To indicate an n-dimensional array, add
			n sets of brackets after the type name (e.g., 2 dimensional array - TypeName[][]). The description should describe
			any rules about the ADT and include an example of a value of the ADT in JSON format.<BR>
			<div id="ADTs"></div>	
			<h4>Functions</h4>
			Describe functions with a name, comma delimeted list of parameters, comma delimeted list of parameter 
			types (ADTs or simple types), description with surrounding comments bracket, and code with surrounding 
			function brackets. The function description should end with a line for each of the parameters and 
			return value (if any) in the folloing form: " * @param [Type] [name] - [description]" and " @return [Type]". 
			 <BR>
			<div id="functions"></div><BR>	
			<button id="save" class="btn btn-primary">Save</button>	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       	
		   	<button id="addADT" class="btn btn-small">Add ADT</button>
			<button id="addFunction" class="btn btn-small">Add function</button><BR>
		</div>
		<div class="span1"></div>
	</div>
	<div id="newFunctionDiv"> 
		<textarea id="FunctionDescription" draggable="true" placeholder="Describe the purpose and behavior of the function"></textarea>
			returns &nbsp;&nbsp;<input type="text" id="FunctionReturnType" placeholder = "return type" class="input-medium"><BR>
			function 
			<input type="text" id="FunctionName" placeholder = "functionName" class="input-medium">(
			<BR>
			<table>
				<tr></tr>
				<tr id="addParamRow">
					<td></td>					
					<td><button id="addParameter"  class="btn btn-small">Add parameter</button></td>			
				</tr>
			</table>
		);
		<BR>
		 Code: <textarea class="ADTDescrip" id="FunctionCode"></textarea><BR>' 
		<div id="errorMessages" class="alert alert-error"></div>
	</div>	
	
</body>
</html>