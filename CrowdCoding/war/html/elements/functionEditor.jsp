<script>
	var myCodeMirror = CodeMirror.fromTextArea(code);
   	myCodeMirror.setValue(editorCode);
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
		functionHeader = functionHeader.replace(/\"/g,"'");
		var functionCode = allTheFunctionCode + " "  + $("#code").val();
		var errors = "";
	    console.log(functionCode);
	    
	    var lintResult = JSHINT(functionCode,getJSHintGlobals());
		console.log(JSHINT.errors);
		if(!lintResult)
		{
			var errors = checkForErrors(JSHINT.errors);
			console.log(errors);
			if(errors != "")
			{
				$("#errors").html("<bold> ERRORS: </bold> </br>" + errors);
				return false; 
			}
		}							
		
		// Success: no errors
		return true;
 	}
	
	// You can only edit one function at a time. To ask the crowd to find or create a function, add
	// a pseudocall.
	// if Body.length > 0, throw an error
	
	
	// Returns an object capturing the code and other related information.
	function collectCode()
	{
 		var text = $("#code").val();
		var ast = esprima.parse(text, {loc: true});
		
		// Get the text for the function description, header, and code.
		// Note esprima (the source of line numbers) starts numbering lines at 1, while
	    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
		var descriptionStart = { line: 0, ch: 0};
		var descriptionEnd = { line: ast.loc.start.line - 1, ch: 0 };
		var description = myCodeMirror.getRange(descriptionStart, descriptionEnd);			
		var name = ast.body[0].id.name;
		
		var header = 'function ' + name + '(';
		$.each(ast.body[0].params, function(index, value)
		{
			if (index > 0)
				header += ', ';
			header += ast.body[0].params[index].name;
		});
		header += ')';
		
		debugger;
		
		var body = myCodeMirror.getRange(
				{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			    { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column });
				
		
		debugger;
		
		return { description: description, header: header, name: name, code: body};
	}
</script>

<BR>
<textarea id="code"></textarea><BR><BR>
<div id = "errors"> </div>