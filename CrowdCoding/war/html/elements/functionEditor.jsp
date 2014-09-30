<script>
console.log("===============================parte function editor================================");
	var myCodeMirror = CodeMirror.fromTextArea(code, 
			{ autofocus: true, indentUnit: 4, indentWithTabs: true, lineNumbers: true });
	myCodeMirror.setSize(null, 500);
	var doc = myCodeMirror.getDoc();
	myCodeMirror.setOption("theme", "vibrant-ink");	 	
	doc.setValue(editorCode);
	//positionCursorAtStart();
	
	var marks = [];
	highlightPseudoSegments(marks);
 	
 	// If we are editing a function that is a client request and starts with CR, make the header
 	// readonly.
	if (functionName.startsWith('CR'))
		makeHeaderReadOnly();
 	
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
 	
 	// Builds a list of names of every function declared in the system
 	function buildFunctionNames()
 	{
 		var names = [];
 		var functionsAST = esprima.parse(allTheFunctionCode);	
 		console.log(allTheFunctionCode);
 		// Iterate over each function declaration, grabbing its name
 		$.each(functionsAST.body, function(index, bodyNode)
 		{
 			console.log(bodyNode.id.name);
 			if (bodyNode.type == "FunctionDeclaration")		
 				names.push(bodyNode.id.name);
 		});
 		
 		return names;
 	}
 	
 	// Builds and returns a list of distinct callee names called in the specified AST
 	function findCalleeNames(ast)
 	{
 		var calleeNames = []; 		
		traverse(ast, function (node)
		{
			if((node!=null) && (node.type === 'CallExpression'))
			{
				// Add it to the list of callee names if we have not seen it before
				if (calleeNames.indexOf(node.callee.name) == -1)
					calleeNames.push(node.callee.name);
			}
		});
		return calleeNames;
 	}
 	
 	// Based on esprima example at http://sevinf.github.io/blog/2012/09/29/esprima-tutorial/
 	function traverse(node, func) 
 	{
	    func(node);
    	for (var key in node) {
        	if (node.hasOwnProperty(key)) {
            	var child = node[key];
            	if (typeof child === 'object' && child !== null) {
                	if (Array.isArray(child)) {
                   	 child.forEach(function(node) {
                   	     traverse(node, func);
                   	 });
                	} else {
                    	traverse(child, func); 
               	 }
            	}
        	}
    	}
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
		highlightPseudoSegments(marks);
		doErrorCheck();
	}
	
	// Highlight regions of code that are pseudocalls or pseudocode
	function highlightPseudoSegments(marks)
	{
		// Clear the old marks (if any)
		$.each(marks, function(index, mark)
		{
			mark.clear();
		});
		
		// Break up the code into 
 		myCodeMirror.save();	 			
 		var text = $("#code").val();
 		
 		// Depending on the state of CodeMirror, we might not get code back. 
 		// In this case, do nothing
 		if(typeof text === 'undefined')
 		{
 			return;
 		}; 		
 		
 		var lines = text.split('\n');
		$.each(lines, function(i, line)
		{
			var pseudoCallCol = line.indexOf('//!');
			if (pseudoCallCol != -1)
			 	marks.push(doc.markText({line: i, ch: pseudoCallCol}, 
			 			     {line: i, ch: line.length}, 
			 			     {className: 'pseudoCall', inclusiveRight: true }));
			
			var pseudoCodeCol = line.indexOf('//#');
			if (pseudoCodeCol != -1)
			 	marks.push(doc.markText({line: i, ch: pseudoCodeCol}, 
			 			     {line: i, ch: line.length}, 
			 			     {className: 'pseudoCode', inclusiveRight: true }));
			
			// If there is currently a pseudocall that is being replaced, highlight that in a special 
			// color
			if (highlightPseudoCall != false)
			{
				var pseudoCallCol = line.indexOf(highlightPseudoCall);
				if (pseudoCallCol != -1)
				 	marks.push(doc.markText({line: i, ch: pseudoCallCol}, 
				 			     {line: i, ch: line.length}, 
				 			     {className: 'highlightPseudoCall', inclusiveRight: true }));
			}
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
			// If there are syntax errors, but there are also pseudocalls or pseudocode, attempt to 
			// parse the code without the central code block. If this succeeds, return no errors
			// and collect the code. Otherwise, indicate errors.
			if (hasPseudocallsOrPseudocode(text))
			{
				var replacedText = replaceFunctionCodeBlock(text);
				// If the text does not contain a function block, display an error.
				if (replacedText == '')				
					showErrors('No function block could be found. Make sure that there is a line that starts with "function".');									
				else
				{
					if (!hasErrorsHelper(replacedText))						
					{
						// Code is syntactically valid and should be able to build an ast.
						// Build the ast and do additional checks using the ast.
						var ast = esprima.parse(replacedText, {loc: true});			
						if (!hasASTErrors(replacedText, ast))
						{
							var codePieces = collectCode(replacedText, ast);
							// Replace the code in codePieces with the actual, syntactically invalid code
							codePieces.code = findCodeblockInInvalidCode(text);	
							return { errors: false, code: codePieces };	
						}						
					}					
				}	
			}			
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
		console.log("Starting error check");
		
	 	myCodeMirror.save();	 			
 		var text = $("#code").val();
		if(hasErrorsHelper(text))			
		{
			if (hasPseudocallsOrPseudocode(text))
			{
				var replacedText = replaceFunctionCodeBlock(text);
				// If the text does not contain a function block, display an error.
				if (replacedText == '')
					showErrors('No function block could be found. Make sure that there is a line that starts with "function".');
				else
				{
					if (!hasErrorsHelper(replacedText))
					{
						var ast = esprima.parse(replacedText, {loc: true});			
						if(!hasASTErrors(replacedText, ast))
							return true;
					}					
				}
			}
		}
		else
		{
			console.log("Passed jshint. Now looking for AST errors.");
			
			// Code is syntactically valid and should be able to build an ast.
			// Build the ast and do additional checks using the ast.
			var ast = esprima.parse(text, {loc: true});			
			if(!hasASTErrors(text, ast))
				return true;
		}		
		return false;
	}

	// Returns true iff there are errors
 	function hasErrorsHelper(text)
 	{
		var functionCode = allTheFunctionCode + " "  + text;
		var errors = "";
	    console.log("linting on: " + functionCode);
	    
	    var lintResult = -1;
	    try
	    {	    
	    	lintResult = JSHINT(functionCode,getJSHintGlobals());
	    }
	    catch (e)
	    {
	    	console.log("Error in running JSHHint. " + e.name + " " + e.message);
	    }
	    
	    if (lintResult == -1)
	    	return true;
	    
		console.log(JSHINT.errors);
		console.log("lintResult: " + JSON.stringify(lintResult));
		
		if(!lintResult)
		{
			var errors = checkForErrors(JSHINT.errors);
			console.log(errors);
			if(errors != "")
			{
				showErrors(errors);
				return true; 
			}
		}							
		
		// No errors found
		$("#errorMessages").hide();
		return false;
 	}
	
	// Shows the error messages with the specified errors
	function showErrors(errors)
	{
		$("#errorMessages").show();
		$("#errorMessages").html(errors);
	}
	
	function hasASTErrors(text, ast)
	{
		var errorMessages = "";
		console.log(functionNames);
		// Check for AST errors
		if (ast.body.length == 0 || ast.body[0].type != "FunctionDeclaration" || ast.body.length > 1)
			errorMessages += "All code should be in a single function.<BR>"
		else if (functionNames.indexOf(ast.body[0].id.name) != -1)
			errorMessages += "The function name '" + ast.body[0].id.name + "' is already taken. Please use another.<BR>";					
		
		// Also check for purely textual errors
		// 1. If there is a pseudocall to replace, make sure it is gone
		if (highlightPseudoCall != false && text.indexOf(highlightPseudoCall) != -1)			
			errorMessages += "Replace the pseudocall '" + highlightPseudoCall + "' with a call to a function.<BR>";			
		
		errorMessages += hasTypeNameError(ast, errorMessages);	
			
		if (errorMessages != "")
		{
			console.log("AST Error check: true");
			$("#errorMessages").html(errorMessages);
			$("#errorMessages").show();
			return true;
		}
		else
		{		
			console.log("AST Error check: false");
			$("#errorMessages").hide();
			return false;
		}
	}
	
	// Checks if the function description is missing or has undefined type names.
	// i.e., checks that a valid TypeName follows @param  (@param TypeName)
	// and checks that a valid TypeName follows @return.
	// A valid type name is any type name in allADTs and the type names String, Number, Boolean followed
	// by zero or more sets of array brackets (e.g., Number[][]).
	// Returns an error message(s) if there is an error 
	function hasTypeNameError(ast)
	{
		var errorMessages = '';
		var paramKeyword = '@param ';
		var returnKeyword = '@return ';
		
		// Loop over every line of the function description, checking for lines that have @param or @return
		var descriptionLines = getDescription(ast).split('\n');
		for (var i = 0; i < descriptionLines.length; i++)
		{
			var line = descriptionLines[i];
			errorMessages += checkForValidType(paramKeyword, line);
			errorMessages += checkForValidType(returnKeyword, line);
		}
		
		return errorMessages;		
	}

	// Checks that, if the specified keyword occurs in line, it is followed by a valid type name. If so,
	// it returns an empty string. If not, an error message is returned.
	function checkForValidType(keyword, line)
	{
		var loc = line.search(keyword);
		if (loc != -1)	
		{
			var nextWord = findNextWord(line, loc + keyword.length);
			if (nextWord == -1)
				return "The keyword " + keyword + "must be followed by a valid type name on line '" + line + "'.<BR>";				
			else if (!isValidTypeName(nextWord)&&!isNotAlreadyTaken(nextWord))
				return nextWord + ' is not a valid type name. Valid type names are '
				  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]). <BR>';					
		}
		
		return '';
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
	
	// Returns an object capturing the code and other related information.
	function collectCode(text, ast)
	{
		var calleeNames = findCalleeNames(ast);
		
		// Get the text for the function description, header, and code.
		// Note esprima (the source of line numbers) starts numbering lines at 1, while
	    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
		var description = getDescription(ast)		
		var name = ast.body[0].id.name;
		var paramNames = [];
		
		var header = 'function ' + name + '(';
		$.each(ast.body[0].params, function(index, value)
		{
			if (index > 0)
				header += ', ';
			header += ast.body[0].params[index].name;
			paramNames.push(ast.body[0].params[index].name);
		});
		header += ')';
		
		var body = myCodeMirror.getRange(
				{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			    { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column });
		return { description: description, header: header, name: name, code: body, paramNames: paramNames,
					calleeNames: calleeNames};
	}
	
	function getDescription(ast)
	{
		// Get the text for the function description, header, and code.
		// Note esprima (the source of line numbers) starts numbering lines at 1, while
	    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
		var descriptionStart = { line: 0, ch: 0};
		var descriptionEnd = { line: ast.loc.start.line - 1, ch: 0 };
		return myCodeMirror.getRange(descriptionStart, descriptionEnd);	
	}
	
	// Makes the header of the function readonly (not editable in CodeMirror).
	// The header is the line that starts with 'function'
	// Note: the code must be loaded into CodeMirror before this function is called.
	function makeHeaderReadOnly()
	{
	 	myCodeMirror.save();	 			
 		var text = $("#code").val();			
		
		// Take the range beginning at the start of the code and ending with the first character of the body
		// (the opening {})
		var headerLine = indexOfFirstLineStartingFunction(text);
		
		myCodeMirror.getDoc().markText({line: headerLine, ch: 0}, 
				{ line: headerLine + 1, ch: 1}, 
				{ readOnly: true }); 
	}
	
	// Replaces function code block with empty code. Function code blocks must start on the line
	// after a function statement.
	// Returns a block of text with the code block replaced or '' if no code block can be found
	function replaceFunctionCodeBlock(text)
	{     
		var lines = text.split('\n');			
        for (var i = 0; i < lines.length; i++)
        {
			if (lines[i].startsWith('function'))
			{       
				// If there is not any more lines after this one, return an error
				if (i + 1 >= lines.length - 1)
					return '';
				
				// Return a string replacing everything from the start of the next line to the end
				// Concatenate all of the lines together
				var newText = '';
				for (var j = 0; j <= i; j++)
					newText += lines[j] + '\n';
				
				newText += '{}';
				return newText;		
			}
		}
        
		return '';
	}
	
	// Uses text search to try to find a code block in syntactically invalid code. Gets the lines starting
	// from the first line after a line starting with "function" till the end of text.
	// Returns a block of text with the code block replaced or '' if no code block can be found
	function findCodeblockInInvalidCode(text)
	{     
		var lines = text.split('\n');			
        for (var i = 0; i < lines.length; i++)
        {
			if (lines[i].startsWith('function'))
			{
				// Return a string replacing everything from the start of the next line to the end
				// Concatenate all of the lines together
				var newText = '';
				for (var j = i + 1; j < lines.length; j++)
				{
					newText += lines[j];
					if (j < lines.length - 1)
						newText += '\n';
				}
	
				return newText;		
			}
		}
        
		return '';
	}
	
	// Finds and returns the index of the first line (0 indexed) starting with the string function, or -1 if no such
	// line exists
	function indexOfFirstLineStartingFunction(text)
	{
		// Look for a line of text that starts with 'function'.
		var lines = text.split('\n');			
        for (var i = 0; i < lines.length; i++)
        {
			if (lines[i].startsWith('function'))
				return i;
        }
	}
		
	// Returns true iff the text contains at least one pseudocall or pseudocode
	function hasPseudocallsOrPseudocode(text)
	{
		return (text.indexOf('//!') != -1) || (text.indexOf('//#') != -1);
	}
	
</script>

<textarea id="code"></textarea>
<div id = "errorMessages" class="alert alert-error"></div>