/*
 *  FunctionsSupport manage header and description of the functions.
 */

/**
	lineDescription is the description lines array (split on \n)
	functionName is the name of the function
*/
function parseDescription(lineDescription,functionName)
{
	// initialize vars
	var paramTypes = [];
	var paramNames = [];
	var paramDescriptions = [];
	var description = "";
	var header      = "";
	var returnType  = ""




	var numParams = 0;
	for(var i=0; i<lineDescription.length;i++){

		lineDescription[i] = lineDescription[i].replace(/\s{2,}/g,' ');

		// check if the current line is a parameter or return line
		var paramLine  = lineDescription[i].search('@param ');
		var returnLine = lineDescription[i].search('@return ');

		if(paramLine!=-1){	// if a param has been found in the current line
			// find the parameter type, name and description
			var paramType = findNextWord(lineDescription[i], paramLine + 7);
			var paramName = findNextWord(lineDescription[i], paramLine + paramType.length+ 8);
			var paramDescription = lineDescription[i].substring( paramLine + paramType.length+ paramName.length +11);

			// push them into the relative arrays
			paramTypes.push(paramType);
			paramNames.push(paramName);
			paramDescriptions.push(paramDescription.trim());

			// increment the number of parameterss
			numParams++;
		}
		else if(returnLine!=-1) { // if is a return line
			var type = findNextWord(lineDescription[i], returnLine + 8);
			returnType=type;
		}
		else if( lineDescription[i].length > 4 ) // otherwise is a description line
			description+=lineDescription[i].trim()+"\n"
	}


	// build header
	header = 'function ' + functionName + '(' + paramNames.join(',') + ')';

	// return all the infos
	return { 'header'           : header,
			 'description'      : description,
			 'paramTypes'       : paramTypes,
			 'paramNames'       : paramNames,
			 'paramDescriptions': paramDescriptions,
			 'returnType'       : returnType
			};
}


function renderDescription(functionCalled)
{
		var numParams = 0;
		var fullDescription = '/**\n' + functionCalled.description + '\n';

    	// Format description into 66 column max lines, with two spaces as starting character
		fullDescription = wordwrap(fullDescription, 66, '  ') + '\n' ;

		if(functionCalled.paramNames!=undefined && functionCalled.paramNames.length>0)
		{
    		for(var i=0; i<functionCalled.paramNames.length; i++)
			{
				if(functionCalled.paramDescriptions!=undefined && functionCalled.paramDescriptions.length>i)
					fullDescription += '  @param ' + functionCalled.paramTypes[i] + ' ' + functionCalled.paramNames[i] + ' - ' + functionCalled.paramDescriptions[i] + '\n';

			}
		}

		fullDescription += '\n  @return ' + functionCalled.returnType + ' \n' + '**/\n';

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





	// Highlight regions of code that  pseudocalls or pseudocode
function highlightPseudoSegments(codemirror,marks,highlightPseudoCall){
	var text = codemirror.getValue();

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
		 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
		 			     {line: i, ch: line.length},
		 			     {className: 'pseudoCall', inclusiveRight: true }));

		var pseudoCodeCol = line.indexOf('//#');
		if (pseudoCodeCol != -1)
		 	marks.push(codemirror.markText({line: i, ch: pseudoCodeCol},
		 			     {line: i, ch: line.length},
		 			     {className: 'pseudoCode', inclusiveRight: true }));

		// If there is currently a pseudocall that is being replaced, highlight that in a special
		// color
		if (highlightPseudoCall != false)
		{
			var pseudoCallCol = line.indexOf(highlightPseudoCall);
			if (pseudoCallCol != -1)
			 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
			 			     {line: i, ch: line.length},
			 			     {className: 'highlightPseudoCall', inclusiveRight: true }));
		}
	});
}



// Makes the header of the function readonly (not editable in CodeMirror).
// The header is the line that starts with 'function'
// Note: the code must be loaded into CodeMirror before this function is called.
function makeHeaderAndParameterReadOnly(codemirror)
{
	var text = codemirror.getValue();
	// Take the range beginning at the start of the code and ending with the first character of the body
	// (the opening {})

	var readOnlyLines = indexesOfTheReadOnlyLines(text);

	for(var i=0; i<readOnlyLines.length; i++)
	{
		codemirror.getDoc().markText({line: readOnlyLines[i], ch: 0},
			{ line: readOnlyLines[i] + 1, ch: 1},
			{ readOnly: true });
	}

}

function getCalleeNames(ast)
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

//Finds and returns the index of the first line (0 indexed) starting with the string function, or -1 if no such
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