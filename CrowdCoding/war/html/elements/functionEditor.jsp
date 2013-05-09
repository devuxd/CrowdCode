<script>
	var myCodeMirror = CodeMirror.fromTextArea(code, 
			{ autofocus: true, indentUnit: 4, indentWithTabs: true, lineNumbers: true });
	var doc = myCodeMirror.getDoc();
	myCodeMirror.setOption("theme", "vibrant-ink");	 	
	doc.setValue(editorCode);
	positionCursorAtStart();
	
	var marks = [];
	highlightPseudoSegments(marks);
 	
 	// If we are editing the main function, make the full description readonly
	if (functionName == 'main')
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
 		
 		// Iterate over each function declaration, grabbing its name
 		$.each(functionsAST.body, function(index, bodyNode)
 		{
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
		if(!hasErrorsHelper(text))
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
	    
	    var lintResult = JSHINT(functionCode,getJSHintGlobals());
		console.log(JSHINT.errors);
		console.log("lintResult: " + JSON.stringify(lintResult));
		
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
		
		// Check for AST errors
		if (ast.body.length == 0 || ast.body[0].type != "FunctionDeclaration" || ast.body.length > 1)
			errorMessages += "All code should be in a single function.<BR>"
		else if (functionNames.indexOf(ast.body[0].id.name) != -1)
			errorMessages += "The function name '" + ast.body[0].id.name + "' is already taken. Please use another.<BR>";					
		
		// Also check for purely textual errors
		// 1. If there is a pseudocall to replace, make sure it is gone
		if (highlightPseudoCall != false && text.indexOf(highlightPseudoCall) != -1)			
			errorMessages += "Replace the pseudocall '" + highlightPseudoCall + "' with a call to a function.";			
			
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
		var calleeNames = findCalleeNames(ast);
		
		// Get the text for the function description, header, and code.
		// Note esprima (the source of line numbers) starts numbering lines at 1, while
	    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
		var descriptionStart = { line: 0, ch: 0};
		var descriptionEnd = { line: ast.loc.start.line - 1, ch: 0 };
		var description = myCodeMirror.getRange(descriptionStart, descriptionEnd);			
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
	
	// Makes the header of the function readonly (not editable in CodeMirror)
	// Note: the code must be loaded into CodeMirror before this function is called.
	function makeHeaderReadOnly()
	{
	 	myCodeMirror.save();	 			
 		var text = $("#code").val();		
		var ast = esprima.parse(text, {loc: true});		
		
		// Take the range beginning at the start of the code and ending with the first character of the body
		// (the opening {})
		myCodeMirror.getDoc().markText({line:  ast.body[0].body.loc.start.line - 2, ch: 0}, 
				{ line: ast.body[0].body.loc.start.line - 1, ch: 1}, 
				{ readOnly: true }); 
	}
</script>

<BR>
<textarea id="code"></textarea>
	<%@include file="/html/elements/javascriptTutorial.jsp" %><BR>
<div id = "errorMessages" class="alert alert-error"></div>
