<script>
	var myCodeMirror = CodeMirror.fromTextArea(code, { autofocus: true });
	var doc = myCodeMirror.getDoc();
	myCodeMirror.setOption("theme", "vibrant-ink");	 	
	doc.setValue(editorCode);
	positionCursorAtStart();
 	
 	// If we are editing the main function, make the full description readonly
	if (functionName == 'main')
 		makeFullDescriptionReadOnly();
 	
 	// Find the list of all function names elsewhere in the system
 	var functionNames = buildFunctionNames();
 	
 	$('#errorMessages').hide();
 	
 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
    // typing).
    var changeTimeout;
 	myCodeMirror.on("change", codeChanged);
	
 	// Positions the cursor in the CodeMirror instance on the line after the beginning of the function's body
 	// (the line after the opening brace line)
 	function positionCursorAtStart()
 	{
 		myCodeMirror.save();	 			
 		var text = $("#code").val();
		var ast = esprima.parse(text, {loc: true});
		
		// esprima is 1 indexed, codeMirror is 0 indexed. So positioning on line after start.
 		doc.setCursor(ast.body[0].body.loc.start.line, 0);		
 	}
 	
 	// Builds a list of all of the function names that are currently in use
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
 	
	// Mangage code change timeout
	function codeChanged(editorInstance, changeObject)
	{
		clearTimeout(changeTimeout);
		changeTimeout = setTimeout(
				function(){processCodeChanged(editorInstance, changeObject);}, 500);
	}
	
	// Process a change to the code
	function processCodeChanged(editorInstance, changeObject)
	{
		highlightPseudoSegments();
		doErrorCheck();
	}
	
	// Highlight regions of code that are pseudocalls or pseudocode
	function highlightPseudoSegments()
	{
		// Break up the code into 
 		myCodeMirror.save();	 			
 		var text = $("#code").val();
 		
 		var lines = text.split('\n');
		$.each(lines, function(i, line)
		{
			var pseudoCallCol = line.indexOf('//!');
			if (pseudoCallCol != -1)
			 	doc.markText({line: i, ch: pseudoCallCol}, 
			 			     {line: i, ch: line.length}, 
			 			     {className: 'pseudoCall', inclusiveRight: true });
			
			var pseudoCodeCol = line.indexOf('//#');
			if (pseudoCodeCol != -1)
			 	doc.markText({line: i, ch: pseudoCodeCol}, 
			 			     {line: i, ch: line.length}, 
			 			     {className: 'pseudoCode', inclusiveRight: true });
		});
	}
	
 	
 	// First checks the code for any errors. If errors are found, they are displayed.
 	// If not, collects the code for submission.
 	// Returns an object of the form { errors: BOOLEAN, code: collectedCode } where collectedCode
 	// is null if there are errors.
 	function checkAndCollectCode()
 	{
 		// Possibly due to some issue in how the microtask div is getting initialized and loaded,
 		// codeMirror is not being correctly bound to the textArea. To manually force it
 		// to save its value back to the textarea so we can read it, we execute the following line:
	 	myCodeMirror.save();	 	
 		
 		var text = $("#code").val();
 		
		if(hasErrorsHelper(text))
		{
			return { errors: true, code: null };	
		}
		else
		{
			// Code is syntactically valid and should be able to build an ast.
			// Build the ast and do additional checks using the ast.
			var ast = esprima.parse(text, {loc: true});			
			if (hasASTErrors(text, ast))
			{
				return { errors: true, code: null };	
			}
			else
			{
				var codePieces = collectCode(text, ast);
				return { errors: false, code: codePieces };	
			}
		} 		
 	}
 	
	// Check the code for errors. If there are errors present, write an error message. Returns true 
	// iff there are no errors.
 	function doErrorCheck()
	{
	 	myCodeMirror.save();	 			
 		var text = $("#code").val();
		if(!hasErrorsHelper(text))
		{
			// Code is syntactically valid and should be able to build an ast.
			// Build the ast and do additional checks using the ast.
			var ast = esprima.parse(text, {loc: true});			
			if(!hasASTErrors(text, ast))
				return false;
		}		
		return true;
	}

	// Returns true iff there are errors
 	function hasErrorsHelper(text)
 	{
		var functionCode = allTheFunctionCode + " "  + text;
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
				$("#errorMessages").show();
				$("#errorMessages").html(errors);
				return true; 
			}
		}							
		
		// No errors found
		$("#errorMessages").hide();
		return false;
 	}
	
	function hasASTErrors(text, ast)
	{
		var errorMessages = "";
		
		if (ast.body.length == 0 || ast.body[0].type != "FunctionDeclaration" || ast.body.length > 1)
			errorMessages += "All code should be in a single function.<BR>"
		else if (functionNames.indexOf(ast.body[0].id.name) != -1)
			errorMessages += "The function name '" + ast.body[0].id.name + "' is already taken. Please use another.<BR>";					
		
		if (errorMessages != "")
		{
			$("#errorMessages").html(errorMessages);
			$("#errorMessages").show();
			return true;
		}
		else
		{		
			$("#errorMessages").hide();
			return false;
		}
	}
	
	// Returns an object capturing the code and other related information.
	function collectCode(text, ast)
	{
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
		
		var body = myCodeMirror.getRange(
				{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			    { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column });
		return { description: description, header: header, name: name, code: body};
	}
	
	// Makes the description and header of the function readonly (not editable in CodeMirror)
	// Note: the code must be loaded into CodeMirror before this function is called.
	function makeFullDescriptionReadOnly()
	{
	 	myCodeMirror.save();	 			
 		var text = $("#code").val();		
		var ast = esprima.parse(text, {loc: true});		
		
		// Take the range beginning at the start of the code and ending with the first character of the body
		// (the opening {})
		myCodeMirror.getDoc().markText({line: 0, ch: 0}, 
				{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column}, 
				{ readOnly: true }); 
	}
</script>

<BR>
<textarea id="code"></textarea><BR>
<div id = "errorMessages" class="alert alert-error"></div>