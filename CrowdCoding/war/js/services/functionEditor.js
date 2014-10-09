//////////////////////////////
//FUNCTION EDITOR SERVICE   //
//////////////////////////////

myApp.factory('functionEditorService', [function() {
	
	var service = new function(){
		// Private variables	
		var functionEditor;
		var marks = [];
		 var changeTimeout;
		 
		 //TODO
		 var allTheFunctionCode="";
		var highlightPseudoCall =false;
		// Public functions
		this.positionCursorAtStart = function(text) { return positionCursorAtStart(text); };
		this.buildFunctionNames = function() { return buildFunctionNames(); };
		this.codeChanged = function(text) { return codeChanged(text); };	
		//this.traverse = function(node, func) { return traverse(node, func); };
		this.highlightPseudoSegments = function(doc) { return highlightPseudoSegments(doc); };
	/*	this.get = function(id) { return get(id); };
		this.getMockCodeFor = function(id) { return getMockCodeFor(id); };
		this.getMockEmptyBodiesFor = function(id) { return getMockEmptyBodiesFor(id); };
		this.getMockHeader = function(id) { return getMockHeader(id); };
		this.renderDescription= function(functionCalled) { return renderDescription(functionCalled); };





var myCodeMirror = CodeMirror.fromTextArea(code, 
		{ autofocus: true, indentUnit: 4, indentWithTabs: true, lineNumbers: true });
		
		
		

	myCodeMirror.setSize(null, 500);
	var doc = myCodeMirror.getDoc();
	myCodeMirror.setOption("theme", "vibrant-ink");	 	
	doc.setValue( code);
	//positionCursorAtStart();
	
	var marks = [];
	highlightPseudoSegments(marks);
 	
 	// If we are editing a function that is a client request and starts with CR, make the header
 	// readonly.
	if (functionName.startsWith('CR'))
		makeHeaderAndParameterReadOnly();
	
 	
 	// Find the list of all function names elsewhere in the system
 	var functionNames = buildFunctionNames();
 	
 	$('#errorMessages').hide();
 	
 	// Setup an onchange event with a delay. CodeMirror gives us an event that fires whenever code
 	// changes. Only process this event if there's been a 500 msec delay (wait for the user to stop
    // typing).
    var changeTimeout;
 	myCodeMirror.on("change", codeChanged);
});

*/


 	// Positions the cursor in the CodeMirror instance on the line after the beginning of the function's body
 	// (the line after the opening brace line)
 	function positionCursorAtStart(text)
 	{
 		
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
	function codeChanged(doc)
	{
		clearTimeout(changeTimeout);
		changeTimeout = setTimeout(
				function(){processCodeChanged(doc);}, 500);
	}
	
	// Process a change to the code
	function processCodeChanged(doc)
	{
		
		highlightPseudoSegments(doc);
		doErrorCheck(doc);
	}
	
	// Highlight regions of code that are pseudocalls or pseudocode
	function highlightPseudoSegments(doc)
	
	
	
	{
		
		var text= doc.getValue();
		//console.log("testo"+ text);
		// Clear the old marks (if any)
		$.each(marks, function(index, mark)
		{
			mark.clear();
		});
		
			
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
 	function checkAndCollectCode(text)
 	{
 		console.log("collect code");
 		// Possibly due to some issue in how the microtask div is getting initialized and loaded,
 		// codeMirror is not being correctly bound to the textArea. To manually force it
 		// to save its value back to the textarea so we can read it, we execute the following line:
	 //	myCodeMirror.save();	 	
 		
 	//	var text = $("#code").val();	
 	
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
 	function doErrorCheck(doc)
	{
 		var text = doc.getValue();
 		
 		
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
		
		errorMessages += hasDescriptionError(ast, errorMessages);	
			
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
	
	// Checks if the function description is in he form " @param [Type] [name] - [description]"
	// and if has undefined type names.
	// i.e., checks that a valid TypeName follows @param  (@param TypeName)
	// checks that a valid TypeName follows @return.
	// A valid type name is any type name in allADTs and the type names String, Number, Boolean followed
	// by zero or more sets of array brackets (e.g., Number[][]).
	// Returns an error message(s) if there is an error 
	function hasDescriptionError(ast)
	{
		var errorMessages = '';
		var paramKeyword = '@param ';
		var returnKeyword = '@return ';
		var paramDescriptionNames=[];
		
		// Loop over every line of the function description, checking for lines that have @param or @return
		var descriptionLines = getDescription(ast).split('\n');
		
		for (var i = 0; i < descriptionLines.length; i++)
		{
			var line = descriptionLines[i];
			errorMessages += checkForValidTypeNameDescription(paramKeyword, line, paramDescriptionNames);
			errorMessages += checkForValidTypeNameDescription(returnKeyword, line);
		
		}
		//if the description doesn't contain error checks the consistency between the parameter in the descriptions and the
		// ones in the header
		
		if( errorMessages === '')
			{
			
			var paramHeaderNames=[];
			$.each(ast.body[0].params, function(index, value)
			{
				paramHeaderNames.push(ast.body[0].params[index].name);
			});
			
			errorMessages+=checkNameConsistency(paramDescriptionNames,paramHeaderNames);
			}
		return errorMessages;		
	}

	// Checks that, if the specified keyword occurs in line, it is followed by a valid type name. If so,
	// it returns an empty string. If not, an error message is returned.
	function checkForValidTypeNameDescription(keyword, line, paramDescriptionNames)
	{
		//subtitues multiple spaces with a single space
		line = line.replace(/\s{2,}/g,' ');
		
		var loc = line.search(keyword);
		
		if (loc != -1)	
		{
			var type = findNextWord(line, loc + keyword.length);
			var name = findNextWord(line, loc + keyword.length+type.length+1);
			if(paramDescriptionNames!=undefined)
				{
				paramDescriptionNames.push(name);
				}
			
			if (type == -1)
				return "The keyword " + keyword + "must be followed by a valid type name on line '" + line + "'.<BR>";				
			else if (!isValidTypeName(type))
				return type + ' is not a valid type name. Valid type names are '
				  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]). <BR>';
			else if (keyword==='@param '&& !isValidName(name))
				return name+ ' is not a valid name. Use upper and lowercase letters, numbers, and underscores. <BR>';	
			else if (keyword==='@param '&& !isValidParamDescription(line))
				return line+' Is not a valid description line. The description line of each parameter should be in the following form: " @param [Type] [name] - [description]". <BR>';		
			else if (keyword==='@return ' && name!=-1)
				return 'The return value must be in the form  " @return [Type]". <BR>';	
		}
		
		return '';
	}
	// checks that the two vectors have the same value, if not reports the error
	function checkNameConsistency(paramDescriptionNames,paramHeaderNames)
	{
		var errorMessage='';
		for( var i=0;i<paramHeaderNames.length; i++){
			
			if (paramDescriptionNames.indexOf(paramHeaderNames[i])==-1){
			
				errorMessage+='Write a desciption for the parameter '+paramHeaderNames[i]+'. <BR>';
			}
		}
		
		
		if(errorMessage===''){
			for( var i=0;i<paramDescriptionNames.length;i++){
				
				if (paramHeaderNames.indexOf(paramDescriptionNames[i])==-1){
					
					errorMessage+='The parameter '+paramDescriptionNames[i] +' does not exist in the header of the function <BR>';
				}
			}
		}
		
		return errorMessage;
		
		
	}
	
	
	
	
	// Returns an object capturing the code and other related information.
	function collectCode(text, ast)
	{
		
		var calleeNames = findCalleeNames(ast);
		
		// Get the text for the function description, header, and code.
		// Note esprima (the source of line numbers) starts numbering lines at 1, while
	    // CodeMirror begins numbering lines at 0. So subtract 1 from every line number.
		var fullDescription = getDescription(ast);	
		
		var linesDescription = fullDescription.split('\n');
		var name = ast.body[0].id.name;
		
		var functionParsed= parseDescription(linesDescription,name);
		
		
		
		
		var body = myCodeMirror.getRange(
				{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			    { line: ast.body[0].body.loc.end.line - 1,   ch: ast.body[0].body.loc.end.column });

		return { description: functionParsed.description, header: functionParsed.header, name: name, code: body, paramNames: functionParsed.paramNames,
			paramTypes: functionParsed.paramTypes, paramDescriptions: functionParsed.paramDescriptions, calleeNames: calleeNames};
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
	function makeHeaderAndParameterReadOnly(text)
	{
		
	//	myCodeMirror.save();	 			
 		//var text = $("#code").val();			
		
		// Take the range beginning at the start of the code and ending with the first character of the body
		// (the opening {})
		
		var readOnlyLines = indexesOfTheReadOnlyLines(text);
		
		for(var i=0; i<readOnlyLines.length; i++)
			{
	
			myCodeMirror.getDoc().markText({line: readOnlyLines[i], ch: 0}, 
				{ line: readOnlyLines[i] + 1, ch: 1}, 
				{ readOnly: true }); 
			}
	
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
	function indexesOfTheReadOnlyLines(text)
	{
		// Look for a line of text that starts with 'function', '@param' or '@return'.
		var indexesLines=[];
		var lines = text.split('\n');	
		
        for (var i = 0; i < lines.length; i++)
        {
			if (lines[i].startsWith('function')||lines[i].search('@param')!=-1||lines[i].search('@return')!=-1)
				{
					indexesLines.push(i);
				}
        }
		
        return indexesLines;
	}
		
	// Returns true iff the text contains at least one pseudocall or pseudocode
	function hasPseudocallsOrPseudocode(text)
	{
		return (text.indexOf('//!') != -1) || (text.indexOf('//#') != -1);
	}
	
	
	}

	return service;
}]); 
	