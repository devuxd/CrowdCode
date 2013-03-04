	<script>
		var myCodeMirror = CodeMirror.fromTextArea(code);
	   	myCodeMirror.setValue('<%=functionCode%>');
	 	myCodeMirror.setOption("theme", "vibrant-ink");
		  			
	 	function doPresubmitWork()
	 	{
	 		// Possibly due to some issue in how the microtask div is getting initialized and loaded,
	 		// codeMirror is not being correctly bound to the textArea. To manually force it
	 		// to save its value back to the textarea so we can read it, we execute the following line:
		 	myCodeMirror.save();	 		
	 	}
	
		// Check for issues like # not at newline and errors produced by JSLint. If these
		// occur, write an error message.
	 	function checkCodeForErrors()
	 	{
		    var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
			var functionCode = allTheFunctionCode + " " + functionHeader + "{"  + $("#code").val() + "}";
			debugger;
			if(("\n" + $("#code").val()).indexOf("\n#") == -1 && ("\n" + $("#code").val()).indexOf("\n!") == -1)
			{
				if($("#code").val().indexOf("#") != -1)
				{
					$("#errors").html("<bold> ERRORS: </bold> </br>" + "wrong placement of # needs to go at beginning of line");
					return false; 
				}
				//else if($("#code").val()).indexOf("!") != -1)
				//{
				//	$("#errors").html("<bold> ERRORS: </bold> </br>" + "wrong placement of ! needs to go at beginning of line");
				//	return false; 
				//}
				else
				{
					var errors = "";
				    console.log(functionCode);
				    var lintResult = JSLINT(functionCode,getJSLintGlobals());
					console.log(JSLINT.errors);
					if(!lintResult)
					{
						var errors = checkForErrors(JSLINT.errors);
						console.log(errors);
						if(errors != "")
						{
							$("#errors").html("<bold> ERRORS: </bold> </br>" + errors);
							return false; 
						}
					}
				}
			}
			
			// Success: no errors
			return true;
	 	}
	
	
	</script>


	<BR>{
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR>
	<div id = "errors"> </div>