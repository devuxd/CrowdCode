/*
 *  FunctionsSupport manage header and description of the functions.
 */




 function renderHeader(functionName, parameters)
 {
 	var header='function '+functionName+'(';
	for(var index in parameters)
		header += parameters[index].name + (index==parameters.length-1 ? "" :", ");
	header+=")";
	return header;
 }


 

 /**
 descLines is the description lines array (split on \n)
 functionName is the name of the function
  */
 function parseDescription(descLines,functionName)
 {
 	// initialize vars
 	var parameters = [];
 	var description = "";
 	var header      = "";
 	var returnType  = "";

 	var numParams = 0;

 	for(var i=0; i<descLines.length;i++){
 		var line = descLines[i];
 		// check if the current line is a parameter or return line
 		var isParam  = line.search('@param ');
 		var isReturn = line.search('@return ');
 		if( isParam!=-1 || isReturn!=-1 ){

 			var matches = line.match(/\w+(\[\])*/g);
 	        if( matches == null )
 	            return [];

 	        //console.log('matches',matches);

 	        var type = matches[1];
 	        var name = matches[2];


 			if(isParam!=-1){	// if a param has been found in the current line
 				// find the parameter type, name and description
 				var parameter={};
 				parameter.type = matches[1];
 				parameter.name = matches[2];
 				var descriptionStart = line.indexOf(', ');
 				parameter.description = line.substring(descriptionStart+2);

 				// push them into the relative arrays
 				parameters.push(parameter);

 				// increment the number of parameterss
 				numParams++;
 			}
 			else{ // if is a return line
 				returnType = matches[1];
 			}
 		}
 		else if( line.length > 4 ){ // otherwise is a description line
 			if(line[i].length > 74)
 			{
 			    descLines[i]=line.match(/.{1,74}(\s|$)|\S+?(\s|$)/g).join('\n  ');
 			}
 			description+=descLines[i]+"\n";
 		}
 	}


 	// build header
 	header=renderHeader(functionName,parameters);

 	// return all the infos
 	return { 'name'				: functionName,
 			 'header'           : header,
 			 'description'      : description,
 			 'parameters'       : parameters,
 			 'returnType'       : returnType
 			};
 }



 // Makes the header of the function readonly (not editable in CodeMirror).
 // The header is the line that starts with 'function'
 // Note: the code must be loaded into CodeMirror before this function is called.
 function makeHeaderAndParameterReadOnly(codemirror)
 {
 	var text = codemirror.getValue();

 	// Take the range beginning at the start of the code and ending with the first character of the body
 	// (the opening {})
 	//console.log(codemirror);
 	var readOnlyLines = indexesOfTheReadOnlyLines(text);
 	for(var i=0; i<readOnlyLines.length; i++)
 	{
 		codemirror.getDoc().markText({line: readOnlyLines[i], ch: 0},
 			{ line: readOnlyLines[i]+1, ch: 0},
 			{ readOnly: true });
 	}

 }




 function makeHeaderAndDescriptionReadOnly(codemirror)
 {
 	var text = codemirror.getValue();
 	var ast = esprima.parse(text, {loc: true});

 	codemirror.getDoc().markText({line: 0, ch: 0},
 		{ line: ast.loc.start.line, ch: 0},
 		{ readOnly: true });

 	ast = undefined;
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
 	}

 		var lines = text.split('\n');
 	$.each(lines, function(i, line)
 	{
 		/*var pseudoCallCol = line.indexOf('//!');
 		if (pseudoCallCol != -1)
 		 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
 		 			     {line: i, ch: line.length},
 		 			     {className: 'pseudoCall', inclusiveRight: true }));*/

 		var pseudoCodeCol = line.indexOf('//#');
 		if (pseudoCodeCol != -1)
 		 	marks.push(codemirror.markText({line: i, ch: pseudoCodeCol},
 		 			     {line: i, ch: line.length},
 		 			     {className: 'pseudoCode', inclusiveRight: true }));

 		// If there is currently a pseudocall that is being replaced, highlight that in a special
 		// color
 		if (highlightPseudoCall)
 		{

 			var pseudoCallCol =  line.indexOf(highlightPseudoCall+"(") ==-1 ? line.indexOf(highlightPseudoCall+" ") : line.indexOf(highlightPseudoCall+"(");

 			if (pseudoCallCol != -1){
 			 	marks.push(codemirror.markText({line: i, ch: pseudoCallCol},
 			 			     {line: i, ch: line.length},
 			 			     {className: 'pseudoCall', inclusiveRight: true }));
 			}
 		}
 	});
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
 		if (lines[i].search(/(@param)|(@return)/g)!=-1)
 			{
 				indexesLines.push(i);
 			}
 		if(lines[i].search(/(function\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{)/g)!=-1)
 			{
 				indexesLines.push(i);
 				return indexesLines;
 			}
     }

 }

 function getCalleeNames(ast)
 {
 	var calleeNames = [];
 	traverse(ast, function (node)
 	{
 		if((node!==null) && (node.type === 'CallExpression'))
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


 // checks that the name is vith alphanumerical characters or underscore
 function isValidName(name)
 {
 	var regexp = /^[a-zA-Z0-9_]+$/;

 	if (name.search(regexp)==-1)
 	 	return false;
 	else
 		return true;

 }




 function parseFunctionRegex(text)
 {
 	var functionParsed={};


 	//retrieves the header from the code (in position  0 because mache retruns an array)
 	var header = text.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g)[0];
 	//retrieves the beginning position of the header
 	var startHeaderPosition = text.indexOf(header);

 	//retrieves the end position of the header loofing for the first occurence of "{" after the beginning
 	var endHeaderPosition = text.indexOf("{", startHeaderPosition);

 	// retrieves the complete description and splits it in line
 	var fullSplittedDescription=text.substring(0, startHeaderPosition).split('\n');

 	//retrieves the name of the function looking for the word before the "("
 	var functionName = header.match(/\b\w+(?=\s*\()/g)[0];

 	//retrieves the name, header, description , paramNames, paramTypes, paramDescriptions, returnType
 	functionParsed=parseDescription(fullSplittedDescription, functionName);

 	//retrieves the code of the function
 	functionParsed.code= text.substring(endHeaderPosition, text.length);

 	//creates an empty vector to put the callee
 	functionParsed.calleeIds=[];
 	//look for all the possible name in the function code of type name followed by a "("
 	var calleeNames= functionParsed.code.match(/\b\w+(?=\s*\()/g);

 	if(calleeNames!==null){
 		
 		//remove the duplicates
 		for(var i=0; i<calleeNames.length; i++) {
 		  for(var j=i+1; j<calleeNames.length; j++) {
 		    // If this[i] is found later in the array
 		    if (calleeNames[i] === calleeNames[j])
 		      j = ++i;
 		  }

 		  //search if exists a function with that name and returns the id if exist
 		  var functionId=getIdByName(calleeNames[i]);
 		  if(functionId!=-1)
 		  	functionParsed.calleeIds.push(functionId);
 		}
 	}

 	return functionParsed;
 }