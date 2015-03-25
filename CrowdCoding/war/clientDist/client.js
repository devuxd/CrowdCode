// create the AngularJS app, load modules and start

// create CrowdCodeWorker App and load modules
angular
	.module('crowdCode',[ 
		'templates-main',
		'ngAnimate',
		'ngMessages', 
		'firebase', 
		'ngSanitize', 
		'ui.ace', 
		'mgcrea.ngStrap', 
		'ngClipboard',
		'luegg.directives'
	])
	.config(function($dropdownProvider, ngClipProvider ) {

		ngClipProvider.setPath("/include/zeroclipboard-2.2.0/dist/ZeroClipboard.swf");

		angular.extend($dropdownProvider.defaults, { html: true });

	})
	.constant('workerId'   ,workerId)
    .constant('projectId'  ,projectId)
	.constant('firebaseUrl',firebaseURL)
	.constant('logoutUrl'  ,logoutURL)
	.run();




angular
    .module('crowdCode')
    .directive('chat', function($timeout, $rootScope, $firebase, $alert, avatarFactory, userService) {
    return {
        restrict: 'E',
        templateUrl: 'chat/chat_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {

            $rootScope.chatActive = false;
            $rootScope.unreadedMessages=0;
            $rootScope.$on('toggleChat', function() {
                $element.find('.chat').toggleClass('active');
                $rootScope.chatActive = ! $rootScope.chatActive;
                $rootScope.unreadMessages =0;
            });
        },
        controller: function($scope, $element, $rootScope) {
            // syncs and references to firebase 
            var chatRef = new Firebase($rootScope.firebaseURL + '/chat');
            
            // data about the 'new message' alert
            var alertData = {
                duration : 4, // in seconds
                object : null,
                text   : '',
                worker : '',
                createdAt : 0
            };

            // track the page load time
            var startLoadingTime = new Date().getTime();

            // set scope variables
            $scope.avatar = avatarFactory.get;
            $rootScope.unreadMessages=0;
            $scope.messages = [];

            // for each added message 
            chatRef.on('child_added',function(childSnap, prevChildName){

                    // get the message data and add it to the list
                    var message = childSnap.val();
                    $scope.messages.push(message);

                    // if the chat is hidden and the timestamp is 
                    // after the timestamp of the page load
                    if( message.createdAt > startLoadingTime ) 
                        if( !$rootScope.chatActive ){

                             // increase the number of unread messages
                            $rootScope.unreadMessages++;
                            
                            // if the current message has been sent
                            // from the same worker of the previous one
                            // and the alert is still on
                            if( alertData.worker == message.workerHandle && ( message.createdAt - alertData.createdAt) < alertData.duration*1000 ) {
                                // append the new text to the current alert
                                alertData.text += '<br/>'+message.text;
                                alertData.object.hide();
                            } else { 
                                // set data for the new alert
                                alertData.text   = message.text;
                                alertData.worker = message.workerHandle;
                            }
                           
                            // record the creation time of the alert
                            // and show it 
                            alertData.createdAt = new Date().getTime();
                            alertData.object    = $alert({
                                title    : alertData.worker, 
                                content  : alertData.text , 
                                duration : alertData.duration ,
                                template : 'chat/alert_chat.html', 
                                keyboard : true, 
                                show: true
                            });
                        } 
                    
                    $timeout( function(){ $scope.$apply() }, 100);
            });

            // hide the alert if the chat becomes active
            $rootScope.$watch('chatActive',function(newVal,oldVal){
                if( newVal && alertData.object != null )
                    alertData.object.hide();
            });

            // add new message to the conversation
            $scope.data = {};
            $scope.data.newMessage = "";
            $scope.addMessage = function() {
                if( $scope.data.newMessage.length > 0){
                    var newMessageRef = chatRef.push();
                    newMessageRef.set({
                        text:         $scope.data.newMessage,
                        createdAt:    Date.now(),
                        workerHandle: $rootScope.workerHandle,
                        workerId:     $rootScope.workerId,
                        microtaskKey: (userService.assignedMicrotaskKey===null)?'no-microtask':userService.assignedMicrotaskKey
                    });
                    $scope.data.newMessage = "";
                }
            };
        }
    };
});

/*
 *  A JSONValitator provides a way to validate json texts.
 *
 */

function JSONValidator() {
	// private variables
	var text;
	var isValidParam;
	var paramType;   // String indicating type of parameter
	var errors = [];
	var nameToADT=[];

	this.initialize = function(myNameToAdt, myText, myParamType){
		text         = myText
		nameToADT    = myNameToAdt; // 
		paramType    = myParamType;

		isValidParam = false;
	};

	this.isValid    = function() { return isValid(); };
	this.errorCheck = function() { return errorCheck(); };
	this.getErrors  = function() { return errors; };

	// Returns true iff the text contained is currently valid
	function isValid()
	{
		return isValidParam;
	}

	function errorCheck()
	{
		errors = [];

		// wrap the value as an assignment to a variable, then syntax check it
		var stmtToTest = 'var stmt = ' + text + ';';
		if(!JSHINT(stmtToTest,getJSHintGlobals()))
			errors.concat(checkForErrors(JSHINT.errors));

		// If there are no syntax errors, check the structure.
		if (errors == "")
		{
			try
			{
				errors = checkStructure(JSON.parse(text), paramType);
			}
			catch (e)
			{
				if( e.message != 'Unexpected token o' )
					errors.push(e.message);

				// We can get an error here if the 1) field names are not surrounded by double quotes, 2) there's a trailing ,
				// Also need to check that strings are surrounded by double quotes, not single quotes....
				// errors.push("1) property names are surrounded by double quotes");
				// errors.push("2) strings are surrounded by double quotes not by single quotes" );
				// errors.push("3) there are no trailing commas in the list of fields.");
			}
		}

		isValidParam = (errors.length==0) ? true : false ;
	}

	// Checks that the provided struct is correctly formatted as the type in typeName.
	// Returns an empty string if no errors and an html formatted error string if there are.
	function checkStructure(struct, typeName, level)
	{
		if ( struct === null ){
			// null is an accepted value for any field
		}
		else if (typeName == 'String'){
			if (typeof struct != 'string')
				errors.push("'" + JSON.stringify(struct) + "' should be a String, but is not");
		}
		else if (typeName == "Number"){
			if (typeof struct != 'number')
				errors.push("'" + JSON.stringify(struct) + "' should be a Number, but is not");
		}
		else if (typeName == "Boolean"){
			if (typeof struct != 'boolean')
				errors.push("'" + JSON.stringify(struct) + "' should be a Boolean, but is not");
		}
		// Recursive case: check for typeNames that are arrays
		else if (typeName.endsWith("[]"))
		{
			// Check that struct is an array.
			if (Array.prototype.isPrototypeOf(struct))
			{
				// Recurse on each array element, passing the typename minus the last []
				for (var i = 0; i < struct.length; i++)
				{
					errors.concat(checkStructure(struct[i], typeName.substring(0, typeName.length - 2), level+1));
				}
			} else
			{
				errors.push("'" + JSON.stringify(struct) + "' should be an array, but is not. Try enclosing the value in array bracks ([]).");
			}
		}
		// Recursive case: typeName is an ADT name. Recursively check that
		else if (nameToADT.hasOwnProperty(typeName))
		{
			if( typeof struct == 'object' ){
				var typeDescrip = nameToADT[typeName].structure;
				var typeFieldNames = [];

				// Loop over all the fields defined in typeName, checking that each is present in struct
				// and (recursively) that they are of the correct type.
				for (var i = 0; i < typeDescrip.length; i++)
				{
					typeFieldNames.push(typeDescrip[i].name);

					var fieldName = typeDescrip[i].name;
					var fieldType = typeDescrip[i].type;


					if (struct.hasOwnProperty(fieldName))
						errors.concat(checkStructure(struct[fieldName], fieldType, level+1));
					else
						errors.push("'" + JSON.stringify(struct) + "' is missing the required property " + fieldName );
				}

				// Loop over all the fields defined in the struct, checking that each
				// is part of the data type
				var structFieldNames = Object.keys(struct);
				for(var f = 0; f <  structFieldNames.length; f++ )
					if( typeFieldNames.indexOf(structFieldNames[f]) == -1 ) 
						errors.push("'"+structFieldNames[f]+"' is not a field of the data type " + typeName);

			} else {
				errors.push("'" + JSON.stringify(struct) + "' is not an " + typeName );
			}
		}
		else
		{
			errors.push("Internal error - " + typeName + " is not a valid type name");
		}

		return errors;
	}
}
function checkForErrors(e)
{
	/**JSHINT CONFIG*/
	/*jshint camelcase: false, white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true*/
	/*global window: false, document: false, $: false, log: false, bleep: false,test: false*/
	  
	var anyErrors = false;
	var arrayOfErrors = [];
	for (var i = 0; i < e.length; i++) 
	{
		// I am not sure if checking making sure not null is okay, I think so
		// but I am commenting just to be sure. If all reasons are null then
		// I think should be okay
//		if(e[i] != null && e[i].reason != "Weird program." && e[i].reason != "Unexpected 'return'." && e[i].reason != "Unexpected 'else' after 'return'.") 
//		{
//			if(e[i].reason == "Stopping. (100% scanned).")
//			{
//				continue;
//			}
//			debugger;
		    if (e[i] != null)
		    {
				arrayOfErrors.push("Line " + e[i].line + ": " + e[i].reason) ;
				anyErrors = true;
		    }
//		}
	}
	if(anyErrors)
	{
		return arrayOfErrors; 
	}
	return "";
}

function getJSHintGlobals()
{
	//latededf was  true, setted as false
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true};
}

function getJSHintForPseudocalls()
{
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true};
}

function getJSHintForStatements()
{
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true };
}

function getUnitTestGlobals()
{
	// if related to unittest for lint add here
	return "/*global window: false, document: false, $: false, throws:false, log: false, bleep: false, equal: false, notEqual: false, deepEqual: false, notDeepEqual: false, raises: false*/";
}
angular
    .module('crowdCode')
    .service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    };
}]);
angular
    .module('crowdCode')
    .filter("newline", function(){
	  return function(text) {
		  return text.replace(/\n/g, '<br>');
	  };
});
angular
    .module('crowdCode')
    .filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

angular
    .module('crowdCode')
    .filter('keylength', function(){
  return function(input){
    if(!angular.isObject(input)){
      throw Error("Usage of non-objects with keylength filter!!")
    }
    return Object.keys(input).length;
  };
});
  angular.module('crowdCode')
  .filter('percentage', ['$filter', function($filter) {
      return function(input) {
          return $filter('number')(input*100, decimals)+'%';
      };
  }]);
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


/** 
 safe json parse 
**/
function safeJsonParse(json){
    var obj = null;
    if( json == 'Infinity' )
        obj = Infinity;
    else if( json == 'undefined' )
        obj = undefined;
    else if( json == 'NaN' )
        obj = NaN;
    else if( json == 'null' )
        obj = null;
    else {
        try {
            obj = JSON.parse(json);
        } catch( e ){
            obj = '"'+json+'"';
        }
    }

    return obj;
}


/**
  search and highlight the json 
**/
function jsonSyntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                var cls = 'jsonNumber';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'jsonKey';
                    } else {
                        cls = 'jsonString';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'jsonBoolean';
                } else if (/null/.test(match)) {
                    cls = 'jsonNull';
                }
                return '<span class="' + cls + '">' + match + '</span>';
    });
    return highlighted;
}


/* 
  join the lines of text (splitted by \n) as a list of html <span class="class"> 
  tags preeceding the content with #identation spaces
*/
function joinLines(text,cssClass,identation){
    var lines = text.split('\n');
    var html = '';
    for( var li in lines ){
        html += '<span class="'+cssClass+'">';
        for( var i=1 ; i<=identation ; i++) html += ' ';
        html += jsonSyntaxHighlight(lines[li])+'</span>';
    }
    return html;
}

/**
 * This class manages a list of Firebase elements and dispatches items in it to 
 * be processed. It is designed to only process one item at a time. 
 *
 * It uses transactions to grab queue elements, so it's safe to run multiple
 * workers at the same time processing the same queue.
 *
 * @param queueRef A Firebase reference to the list of work items
 * @param processingCallback The callback to be called for each work item
 */
function DistributedWorker(workerID, queueRef, processingCallback) {
	
	this.workerID = workerID;
	
	// retrieve callback
	this.processingCallback = processingCallback; 
	
	// start busy as FALSE
	this.busy = false;
	
	// every time at queueRef one child is added
	// retrieve the item and try to process it
	queueRef.startAt().limit(1).on("child_added", function(snapshot) {
		this.currentItem = snapshot.ref();
		this.tryToProcess();
	}, this);
	
}

//reset busy flag and try again to process
DistributedWorker.prototype.readyToProcess = function() {
	this.busy = false;
	this.tryToProcess();
};

// executes the transaction to pop() an
// object from the firebase queue
DistributedWorker.prototype.tryToProcess = function() {

	if(!this.busy && this.currentItem) {

		//local vars
		var dataToProcess = null,
		    self = this,
		    toProcess = this.currentItem;

		// set busy to true and initialize current item
		this.busy = true;
		this.currentItem = null;

		// start the firebase transaction
		toProcess.transaction(function(theItem) {

			// copy the retrieved item to dataToProcess
			dataToProcess = theItem;

			if(theItem) return null;
			else        return;

		}, function(error, committed, snapshot) { // on transaction complete

			if (error) throw error;

			if(committed) { // if transaction committed 
				//execute callback and after again ready to process
				self.processingCallback(dataToProcess, function() {
					self.readyToProcess();
				});

			} else {
				self.readyToProcess();
			}

		});
	}
};

////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('ADTService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {

	var service = new  function(){

		var typeNames=[];
		var nameToADT=[];
		var ADTs=[];
		// Public functions
		this.init                   = function() { return init(); };
		this.isValidTypeName        = function(name) { return isValidTypeName(name); };
		this.validateFunctionName   = function(inputText, ignoreEmpty) { return validateFunctionName(inputText, ignoreEmpty); };
		this.validateParamName      = function(inputText, ignoreEmpty) { return validateParamName(inputText, ignoreEmpty); };
		this.validateParamTypeName  = function(inputText, paramName, ignoreEmpty) { return validateParamTypeName(inputText, paramName, ignoreEmpty); };
		this.validateReturnTypeName = function(inputText, ignoreEmpty) { return validateReturnTypeName(inputText, ignoreEmpty); };
		this.getAllADTs				= function() { return getAllADTs(); };
		this.getByName				= function(name){return getByName(name);};
		this.getNameToADT			= function() { return nameToADT; };

		function init()
		{
			

			// hook from firebase all the functions declarations of the project
			var ADTSync = $firebase(new Firebase($rootScope.firebaseURL+'/ADTs/ADTs'));
			var firebaseADTs=[];
			firebaseADTs = ADTSync.$asArray();
			firebaseADTs.$loaded().then(function(){
				typeNames=[];
				nameToADT=[];
				ADTs=[];
				addDefaultADT();

				if(firebaseADTs.length>0){
					for(var i=0; i<firebaseADTs.length;i++ ){
						typeNames.push(firebaseADTs[i].name);
						nameToADT[firebaseADTs[i].name] = firebaseADTs[i];
						ADTs.push(firebaseADTs[i]);
					}
				}

				// tell the others that the adts services is loaded
				$rootScope.$broadcast('serviceLoaded','adts');

			});


		}

		function getByName(name)
		{

			var adt=[];

			for(var i=0; i<ADTs.length; i++)
				{
				if(ADTs[i].name===name)
					{

					return ADTs[i];
					}
				}

			return [];
		}

		// Adds type names for primitives
		function addDefaultADT()
		{
			typeNames.push('String');
			ADTs.push( { name:'String',
									description:'A String simply stores a series of characters like \"John Doe\".'+
												'A string can be any text inside double quotes',
									examples:[{name : 'default', value: '\"John Doe\"'}],
									structure:[]
									});

			typeNames.push('Number');
			ADTs.push( { name:'Number',
									description:'Number is the only type of number.'+
												'Numbers can be written with, or without, decimals.',

									examples:[{name : 'default', value: '14'}],
									structure:[]
									});

			typeNames.push('Boolean');
			ADTs.push({ name:'Boolean',
									description:'A Boolean represents one of two values: true or false.',
									examples:[{name : 'default', value: 'true'}],
									structure:[]
									});

		}

		function getAllADTs()
		{
			return ADTs;
		}

		// Returns true if name is a valid type name and false otherwise.
		function isValidTypeName(name)
		{
			var simpleName;
			// Check if there is any array characters at the end. If so, split off that portion of the string.
			var arrayIndex = name.indexOf('[]');
			if (arrayIndex != -1)
				simpleName = name.substring(0, arrayIndex);
			else
				simpleName = name;

			if (typeNames.indexOf(simpleName) == -1)
				return false;
			else if (arrayIndex != -1)
			{
				// Check that the array suffix contains only matched brackets..
				var suffix = name.substring(arrayIndex);
				if (suffix != '[]' && suffix != '[][]' && suffix != '[][][]' && suffix != '[][][][]')
					return false;
			}

			return true;
		}


		/*
		 *  ADTandDataCheck check the integrity and validity of the data.
		 */




		function validateFunctionName(inputText, ignoreEmpty)
		{
			var value = inputText.val().trim();
			inputText.val(value);

			var nameList=[];

			$("input[id=FunctionName").each(function(){

				var value=($(this).val()).trim();
				nameList.push(value);

			});


			if (ignoreEmpty && value == '')
				return '';

			// Check that the function name is syntactically valid by building an
			// empty function and running JSHint against it. If there's an error, it's not valid.
			// Also check that the function does not match a current function name.

			var codeToTest = 'function ' + value + '() {}';


			if (value == '')
				return 'Missing a function name.<BR>';
			else if (nameList.indexOf(value,nameList.indexOf(value) +1)!=-1)
				return "The function name '" + value + "' is already taken. Please use another.<BR>";
			else if(!JSHINT(codeToTest,getJSHintGlobals()))
				return value + ' is not a valid function name.<BR>';
			else
				return '';
		}


		function hasDuplicates(nameList, value) {
		    var valuesSoFar = {};
		    for (var i = 0; i < array.length; ++i) {
		        var value = array[i];
		        if (Object.prototype.hasOwnProperty.call(valuesSoFar, value)) {
		            return true;
		        }
		        valuesSoFar[value] = true;
		    }
		    return false;
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
			else if(!isValidTypeName(value))
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

	}

	return service;
}]);


// check if a variable type is a valid ADT
angular
    .module('crowdCode')
    .directive('adtValidator', ['ADTService', function(ADTService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var valid =  viewValue === ""|| viewValue === undefined || ADTService.isValidTypeName(viewValue) ;
                if (!valid) {
                    ctrl.$setValidity('adt', false);
                    ctrl.$error.adt = "Is not a valid type name. Valid type names are 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).";
                    return viewValue;
                } else {
                    ctrl.$setValidity('adt', true);
                    return viewValue;
                }

            });

        }
    };
}]);
angular
    .module('crowdCode')
    .directive('adtList', ['$compile', '$timeout', 'ADTService', function($compile, $timeout, ADTService) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'data_types/adt_list.html',
        link: function($scope, $element, $attributes) {
            $scope.ADTs = ADTService.getAllADTs();
            $scope.ADTs.selectedADT = -1;
            $scope.buildStructure = function(adt){
                var struct = '{';
                angular.forEach(adt.structure,function(field){
                    struct += '\n  '+field.name+': '+field.type;
                })
                struct += '\n}';
                return struct;
            };
        }
    }
}]);

angular
    .module('crowdCode')
    .directive('examplesList',function($rootScope,$popover,ADTService){
    return {
        restrict: 'EA',
        scope:{
            paramType :'=',
            key : '=',
            value : '='
        },
        link: function($scope, element,attrs){

            //function to load the example in the ng-model of the exapmle
            var loadExampleValue = function(value){
                $scope.value=value;
            };

            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  'data_types/examples_list_popover.html',
            };


            //load all the examples og the ADT
            var loadExamples = function(ADTName) {
                //check if ADT is multidimensional
                var dimension=ADTName.match(/\[\]/g);
                ADTName= ADTName.replace('[]','');

                var examplesList =  ADTService.getByName(ADTName).examples;
                
                //if the ADT is multidimensional adds the square brackets to all values of the examples
                if(dimension!==null){
                    var modifiedExamples=[];
                    var startValue='';
                    var endValue='';
                    for(var i=0; i<dimension.length; i++){
                        startValue+='[';
                        endValue+=']';
                    }
                    angular.forEach(examplesList,function(example,key)
                    {
                        modifiedExamples.push({name : example.name, value :startValue + example.value + endValue});
                    });
                    return modifiedExamples;
                }
                return examplesList;
            };

            var togglePopover = function(popoverKey) {
                //if the popover is undefined creates the popover
                if($rootScope.examplesListPopover[popoverKey]===undefined)
                {
                    //check if already another popover opened, if so destoy that one
                    if($rootScope.examplesListPopoverKey!==undefined){
                        $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].$promise.then($rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].hide);
                        $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey]=undefined;
                    }
                    //popover inizialization
                    $rootScope.examplesListPopover[popoverKey] = $popover(element, popoverSettings);
                    $rootScope.examplesListPopover[popoverKey].$promise.then($rootScope.examplesListPopover[popoverKey].show);
                    $rootScope.examplesListPopover[popoverKey].$scope.examplesList=loadExamples($scope.paramType);
                    $rootScope.examplesListPopover[popoverKey].$scope.togglePopover = togglePopover;
                    $rootScope.examplesListPopover[popoverKey].$scope.key = popoverKey;
                    $rootScope.examplesListPopover[popoverKey].$scope.loadExampleValue = loadExampleValue;

                    //sets the popover opened as this one
                    $rootScope.examplesListPopoverKey = popoverKey;
                }
                else
                {
                    //if the popover is not undefined means that is open and so close the popover
                    $rootScope.examplesListPopover[ popoverKey].$promise.then($rootScope.examplesListPopover[ popoverKey].hide);
                    $rootScope.examplesListPopover[ popoverKey]=undefined;
                    $rootScope.examplesListPopoverKey=undefined;
                }
            };

            element.on('click',function(){
                if($rootScope.examplesListPopover===undefined)
                    $rootScope.examplesListPopover=[];
                var exampleNumber= loadExamples($scope.paramType);
                if(exampleNumber.length==1){
                   $scope.value = exampleNumber[0].value;
                   $scope.$apply();
                   if($rootScope.examplesListPopoverKey!==undefined){
                       $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].$promise.then($rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].hide);
                       $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey]=undefined;
                       $rootScope.examplesListPopoverKey=undefined;
                   }
                }else{

                    //if doesn't exist yet the list of popovers inizialize it
                   

                    togglePopover($scope.key);
                }
            });
        }
    };
});

/* -------- FIELD VALIDATORS --------- */

angular
    .module('crowdCode')
    .directive('jsonValidator', ['ADTService', function(ADTService) {
    return {
       
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            // instantiate a new JSONValidator
            var validator = new JSONValidator();
            ngModelCtrl.$formatters.unshift(function(viewValue) {
                // initialize JSONValidator and execute errorCheck
                validator.initialize(ADTService.getNameToADT(), viewValue, attrs.jsonValidator);
                validator.errorCheck();

                if(viewValue === undefined || validator.isValid() ){
                    ngModelCtrl.$setValidity('json', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('json', false);
                   ngModelCtrl.$error.json = validator.getErrors();
                   return viewValue;
                }
            });
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('jsonDataType', ['ADTService', function(ADTService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel) {
            ngModel.$validators.jsonDataType = function(modelValue,viewValue){
                var value = modelValue || viewValue;
                var validator = new JSONValidator();
                validator.initialize(ADTService.getNameToADT(), value, attrs.jsonDataType);
                validator.errorCheck();
                ngModel.$error.jsonErrors = validator.getErrors();
                return validator.isValid();
            };
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('reservedWord', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            var reservedWord= ["abstract","boolean","break","byte","case","catch","char","class","const","continue",
            "debugger","default","delete","do","double","else","enum","export","extends","false","final","finally",
            "float","for","function","goto","if","implements","import","in","instanceof","int","interface","long","native",
            "new","null","package","private","protected","public","return","short","static","super","switch","synchronized",
            "this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with"];

            ngModelCtrl.$parsers.unshift(function(viewValue) {
                
                if(reservedWord.indexOf(viewValue)===-1){
                    ngModelCtrl.$setValidity('reservedWord', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('reservedWord', false);
                   ngModelCtrl.$error.reservedWord = "You are using a reserved word of JavaScript, please Change it";
                   return viewValue;
                }
            });
        }
    };
});

angular
    .module('crowdCode')
    .directive('unicName', function(){
    return {
        scope: { parameters : "=" }, // {} = isolate, true = child, false/undefined = no change
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
        link: function($scope, iElm, iAttrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                // calc occurrences 
                var occurrence=0;
                angular.forEach($scope.parameters, function(value, key) {
                    if(value.paramName==viewValue)
                        occurrence++;
                });
                if (occurrence!==0) {
                    ctrl.$setValidity('unic', false);
                    ctrl.$error.unic = "More occurence of the same parameter name have been found, plese fix them";
                    return viewValue;
                } else {
                    ctrl.$setValidity('unic', true);
                    return viewValue;
                }

            });
        }
    };
});




// var name validator
angular
    .module('crowdCode')
    .directive('varNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var match = viewValue.match(/[a-zA-Z][\w\_]*/g);
                var valid = match != null && viewValue == match[0];
                if (!valid) {
                    ctrl.$setValidity('var', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('var', true);
                    return viewValue;
                }

            });

        }
    };
}]);


/* ---------- KEY LISTENERS ----------- */
angular
    .module('crowdCode')
    .directive('pressEnter', function() {


    return function(scope, element, attrs) {

        var keyPressListener = function(event){
            if (!event.shiftKey && !event.ctrlKey && event.which === 13 ) {
                scope.$apply(function() {
                    scope.$eval(attrs.pressEnter);
                });
                event.preventDefault();
                
            }
        };

        element.on('keydown', keyPressListener);

        element.on('$destroy',function(){
            element.off('keydown',null,keyPressListener);
        });
    };
});

angular
    .module('crowdCode')
    .directive('disableBackspace', function() {
    return function(scope, element, attrs) {
        element.unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && 
                     (
                         d.type.toUpperCase() === 'TEXT' ||
                         d.type.toUpperCase() === 'PASSWORD' || 
                         d.type.toUpperCase() === 'FILE' || 
                         d.type.toUpperCase() === 'EMAIL' || 
                         d.type.toUpperCase() === 'SEARCH' || 
                         d.type.toUpperCase() === 'DATE' )
                     ) || 
                    d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });
    };
});


/* --------- FORM FOCUS MANAGEMENT HELPERS ------------ */
angular
    .module('crowdCode')
    .directive('focus', function(){
  return {
    link: function(scope, element) {
      element[0].focus();
    }
  };
});


angular
    .module('crowdCode')
    .directive('syncFocusWith', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focusValue: "=syncFocusWith"
        },
        link: function(scope, element, attrs) {
            var unwatch = $scope.watch("focusValue", function(currentValue, previousValue) {
                if (currentValue === true && !previousValue) {
                    element[0].focus();
                } else if (currentValue === false && previousValue) {
                    element[0].blur();
                }
            });

            element.on('$destroy',function(){
                unwatch();
            });
        }
    };
});





angular
    .module('crowdCode')
    .directive('resizer', function($document) {

    return function($scope, $element, $attrs) {
        // calculate the sum of the 2 element's dimensions in percentage
        // respect to the parent element dimension
        // - height: if vertical resizer
        // - width:  if horizontal resizer
        // and position the resize bar in between the elements

        // on mouse down attach mousemove and mouseup callbacks
        var mouseDownListener = function(event) {
            event.preventDefault();
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        };
        $element.on('mousedown', mouseDownListener);

        function mousemove(event) {

            if ($attrs.resizer == 'vertical') {
                var datas = {
                        leftX: $($attrs.resizerLeft).offset().left,
                        rightX: $($attrs.resizerRight).offset().left,
                        mouseX: event.pageX
                    }
                    //$element.css({ left: $($attrs.resizerRight).position().left + 'px' });

                var totalSizePx = $($attrs.resizerLeft).outerWidth() + $element.outerWidth() + $($attrs.resizerRight).outerWidth();
                var totalSizePer = Math.round(totalSizePx / $element.parent().outerWidth() * 100);

                var leftWidthPer = Math.round((datas.mouseX - datas.leftX) / $element.parent().outerWidth() * 100);

                if ($attrs.resizerMain == "left") {


                    if (leftWidthPer < 0) leftWidthPer = 0;
                    if (leftWidthPer > totalSizePer) leftWidthPer = totalSizePer;
                    if ($attrs.resizerMin && leftWidthPer < $attrs.resizerMin) leftWidthPer = $attrs.resizerMin;
                    if ($attrs.resizerMax && leftWidthPer > $attrs.resizerMax) leftWidthPer = $attrs.resizerMax;

                    var rightWidthPer = totalSizePer - leftWidthPer;

                } else if ($attrs.resizerMain == "right") {

                    var rightWidthPer = totalSizePer - leftWidthPer;

                    if (rightWidthPer < 0) rightWidthPer = 0;
                    if (rightWidthPer > totalSizePer) rightWidthPer = totalSizePer;
                    if ($attrs.resizerMin && rightWidthPer < $attrs.resizerMin) rightWidthPer = $attrs.resizerMin;
                    if ($attrs.resizerMax && rightWidthPer > $attrs.resizerMax) rightWidthPer = $attrs.resizerMax;

                    //var leftWidthPer = totalSizePer - rightWidthPer;
                }

                $($attrs.resizerLeft).css({
                    width: leftWidthPer + '%'
                });
                $($attrs.resizerRight).css({
                    width: rightWidthPer + '%'
                });

            } else {
                var datas = {
                    topY: $($attrs.resizerTop).offset().top,
                    bottomY: $($attrs.resizerBottom).position().top,
                    mouseY: event.pageY
                }

                var totalSizePx = $($attrs.resizerTop).outerHeight() + $element.outerHeight() + $($attrs.resizerBottom).outerHeight();
                var resizerHeightPx = $element.outerHeight();
                var topHeightPx = (datas.mouseY - datas.topY);
                var bottomHeightPx = totalSizePx - resizerHeightPx - topHeightPx;

                if ($attrs.resizerMain == "top") {



                } else {


                }

                if (topHeightPx + resizerHeightPx + bottomHeightPx == totalSizePx)
                    console.log("MATCH");
                else
                    console.log("DONT MATCH");


                $($attrs.resizerTop).css({
                    height: topHeightPx + 'px'
                });
                $($attrs.resizerBottom).css({
                    height: bottomHeightPx + 'px'
                });

            }


        }

        // when mouse up detach the callbacks
        function mouseup() {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
        }

        $element.on('$destroy',function(){
            $element.off('mousedown', mouseDownListener);
        });
    };
});




angular
    .module('crowdCode')
    .directive('userMenu',function($popover){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  'users/user_popover.html'
            };
            popover = $popover(element,popoverSettings);
            popover.$scope.close = function(){
                popover.$promise.then(popover.hide);
            };

            element.on('click',function(event){  
               
                popover.$promise.then(popover.toggle);
            });

            
           
        }
    };
});




angular
    .module('crowdCode')
    .directive('descriptionPopover',function($rootScope,$popover,functionsService){
    return {
        restrict: 'EA',
        scope:{
            descriptionPopover :'=',
        },
        link: function($scope, element,attrs){

            var popoverSettings = {
                trigger: 'hover',
                placement: 'top',
                template:  'widgets/description_popover.html',
            };

            var popover=$popover(element, popoverSettings);
            popover.$scope.code=$scope.descriptionPopover;

        }
    };
});




// USED FOR UPLOADING THE USER PICTURE
angular
    .module('crowdCode')
    .directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

// VIEWS THE STATS
angular
    .module('crowdCode')
    .directive('projectStats', function($rootScope,$firebase) {

    return {
        restrict: 'E',
        scope: true,
        template: '<b>Stats:</b>'
                  +'<span class="stats">'
                  +'<!--<span><span class="badge">{{microtaskCountObj.$value}}</span> microtasks</span>-->'
                  +'<span><span class="badge">{{functionsCount}}</span> functions</span>'
                  +'<span><span class="badge">{{testsCount}}</span> tests</span>'
                  +'<span><span class="badge">{{loc}}</span> loc</span>'
                  +'</span>',

        link: function($scope, $element) {

            //$scope.microtaskCountObj  = $firebase(new Firebase($rootScope.firebaseURL+'/status/microtaskCount')).$asObject();

            var functionsRef = new Firebase($rootScope.firebaseURL+'/artifacts/functions/');
            $scope.functionsCount = 0;
            functionsRef.on('child_added',function (snapshot){
                $scope.functionsCount ++;
            });

            $scope.loc = 0;
            functionsRef.on('value',function(snap){
                var functs = snap.val();
                $scope.loc = 0;
                angular.forEach(functs,function(val){
                    $scope.loc += val.linesOfCode;
                })
            });


        
            var testsRef = new Firebase($rootScope.firebaseURL+'/artifacts/tests');
            $scope.testsCount = 0;
            testsRef.on('child_added',function(snapshot){
                $scope.testsCount ++;
            });

        }
    };
});
angular
    .module('crowdCode')
    .directive('maxLength',function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

 
          ctrl.$parsers.push(function (viewValue) {
              var maxLength=attrs.maxLength || 70 ;
              var splittedDescription= viewValue.split('\n');
              var regex = '.{1,'+maxLength+'}(\\s|$)|\\S+?(\\s|$)';

              for(var i=0;i<splittedDescription.length;i++ )
              {
                  if(splittedDescription[i].length>maxLength)
                  {
                      splittedDescription[i]=splittedDescription[i].match(RegExp(regex, 'g')).join('\n  ');
                  }
              }

              return '  '+splittedDescription.join('\n  ')+'\n';
         });
          ctrl.$formatters.push(function (viewValue) {
                if( viewValue !== undefined )
                    return  viewValue.substring(2,viewValue.length-1).replace(/\n  /g,'\n');
                else
                    return viewValue;
          });

        }
    };
});



// check if a function code has errors
angular
    .module('crowdCode')
    .directive('functionValidator', ['$rootScope','ADTService', 'functionsService', function($rootScope,ADTService, functionsService) {

    var functionId;
    var funct;
    var allFunctionNames;
    var allFunctionCode;
    var errors = [];
    var code = "";
    var valid;
    var statements = 0;
    var startStatements;
    var maxNewStatements;
    var defaultMaxNewStatements=10;

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: { maxNewStatements: '=' },
        link: function(scope, elm, attrs, ctrl) {
            //initialize the max number of statements allowed to the scope value or the default value
            maxNewStatements = scope.maxNewStatements || defaultMaxNewStatements;
            //force  startStatements to undefined (necessary from the second time that the directive is used)
            startStatements = undefined;
            functionId = attrs.functionId;
            valid = true;

            var describedFunctions = functionsService.getDescribedFunctions();
            allFunctionNames = functionsService.getDescribedFunctionsName(functionId);
            allFunctionCode  = functionsService.getDescribedFunctionsCode(functionId) + " var console = null; " ;

            ctrl.$formatters.unshift(function(viewValue) {
                code=viewValue;
                validate(code);

                scope.$emit('statements-updated', statements, maxNewStatements);

                if (errors.length > 0) {
                    ctrl.$setValidity('function', false);
                    ctrl.$error.function_errors = errors;
                    return undefined;
                } else {
                    ctrl.$setValidity('function', true);
                    ctrl.$error.function_errors = [];
                    return viewValue;
                }

            });

        }
    };


    function getDescription(ast) {
        var codeLines = code.split("\n");
        var descStartLine = 0;
        var descEndLine = ast.loc.start.line;
        var descLines = codeLines.slice(descStartLine, descEndLine);
        return descLines;
    }

    // Check the code for errors. If there are errors present, write an error message. Returns true
    // iff there are no errors.
    function validate(code) {
        errors = [];
        var ast;
        
        // 1. If the text does not contain a function block, display an error and return.
        if (replaceFunctionCodeBlock(code) === '') {
            errors.push('No function block could be found. Make sure that there is a line that starts with "function".');
            return false;
        }

        // 2. If the are more header displays the error and returns
  /*      if (code.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g).length > 100){
            errors.push('Only one header is allowed in the code, please fix it');
            return false;
        }*/
        // 3. If the are syntactical errors displays the error and returns
        if (hasSyntacticalErrors(allFunctionCode + " "+code,getJSHintForPseudocalls()))
            return false;

        // 4. Trys to build the Est if not displays the error and return
        try {
            ast = esprima.parse(code, {loc: true});
        } catch (e) {

            errors.push("Error " + e.message);
            return false;
        }
        // 5. checks if the are ast Errors and displays it
        // returns true iff there are AST errors
        // Check for AST errors
        if (allFunctionNames.indexOf(ast.body[0].id.name) != -1)
            errors.push('The function name <strong>' + ast.body[0].id.name + '</strong> is already taken. Please use another.');
        

        // validate the order of the parameter between the description and the header

        var functonsName=[ast.body[0].id.name];
        var calleeNames = getCalleeNames(ast);
        for(i=1; i< ast.body.length; i++){ 

            if(ast.body[i].body===undefined)
                errors.push('There are errors in the code, please fix them.');
            else if(ast.body[1].id.name == ast.body[0].id.name)
                errors.push('Invalid pseudo function name <strong>'+ast.body[1].id.name+'</strong>.');
            else if( ast.body[i].params.length == 0 )
                errors.push('The pseudo function <strong>'+ast.body[1].id.name+'</strong> must have at least one parameter.')
            else if( functonsName.indexOf(ast.body[i].id.name)!==-1 )
                errors.push('The pseudo function <strong>'+ast.body[i].id.name +'</strong> has been declared multiple times');
            else if(ast.body[i].loc.start.line!==ast.body[i].loc.end.line || ast.body[i].body.loc.end.column - ast.body[i].body.loc.start.column!==2 )
                errors.push('Please, declare an empty body for the pseudo function <strong>'+ast.body[i].id.name+'</strong>. </br> <b>i.e. function functionName(parameters){}</b>');
            else if(calleeNames.indexOf(ast.body[i].id.name)===-1)
                errors.push('No occurrences of the pseudo function <strong>'+ast.body[i].id.name+'</strong>. Is it still needed?');
            functonsName.push(ast.body[i].id.name);
        }

        if(errors.length>0) return false;

        // 6. checks if the are errors in the descriptions structure
        hasDescriptionError(ast);
        var textSplitted=code.split("\n");
        var mainFunctionCode = textSplitted.slice(0,ast.body[0].loc.end.line).join("\n");
        if (hasSyntacticalErrors(mainFunctionCode,getJSHintForStatements(),true))
            return false;

        return false;
    }

    // Returns true iff there are syntactical errors
    function hasSyntacticalErrors(codeToValidate, JSHINTSettings, analyzeBody) {
        var lintResult = -1;
        // try to run JSHINT or catch and print error to the console
        try {
            lintResult = JSHINT(codeToValidate, JSHINTSettings);
            //console.log(JSHINT(functionCode, getJSHintForStatements()).getData());
        } catch (e) {
            console.log(e);
        }
        if(analyzeBody)
        {
            var functionsData = JSHINT.data().functions;
            if(functionsData.length>1){
                errors.push("Only one function is allowed, if you need more use the function stubs");
            }

            if( startStatements === undefined )
                startStatements = functionsData[0].metrics.statements;
            
            statements = functionsData[0].metrics.statements - startStatements;
            

            if( statements > maxNewStatements){
                errors.push("You are not allowed to insert more than "+maxNewStatements+" statements");
            }

        }
        if (!lintResult) {

            errors = errors.concat(checkForErrors(JSHINT.errors));
            if (errors.length > 0) {
                return true;
            }
        }

        return false;
    }


    // Checks if the function description is in he form " @param [Type] [name] - [description]"
    // and if has undefined type names.
    // i.e., checks that a valid TypeName follows @param  (@param TypeName)
    // checks that a valid TypeName follows @return.
    // A valid type name is any type name in allADTs and the type names String, Number, Boolean followed
    // by zero or more sets of array brackets (e.g., Number[][]).
    // Returns an error message(s) if there is an error
    function hasDescriptionError(ast) {
        var errorMessages = [];
        var paramKeyword = '@param ';
        var returnKeyword = '@return ';
        var paramDescriptionNames = [];
        var paramNumber = 0;
        var returnNumber=0;
        // Loop over every line of the function description, checking for lines that have @param or @return
        var descriptionLines = getDescription(ast);
        for (var i = 0; i < descriptionLines.length; i++) {

            var line = descriptionLines[i].replace(/\s{2,}/g, ' ');

            if( line.search(paramKeyword)!==-1 ){
                paramNumber++;
                errorMessages = errorMessages.concat(checkForValidTypeNameDescription(paramKeyword, line, paramDescriptionNames));
            } else if( line.search(returnKeyword)!==-1 ){
                returnNumber++;
                errorMessages = errorMessages.concat(checkForValidTypeNameDescription(returnKeyword, line));
            }

        }

        //check that the function has at least 1 parameter and exaclty 1 return
        if(paramNumber===0)
            errorMessages.push("The function must have at least one parameter");
        if(returnNumber!==1)
            errorMessages.push("The function must have 1 return type");

        //if the description doesn't contain error checks the consistency between the parameter in the descriptions and the
        // ones in the header
        if (ast.body[0].params !== undefined) {

            var paramHeaderNames = [];
            $.each(ast.body[0].params, function(index, value) {
                paramHeaderNames.push(ast.body[0].params[index].name);
            });

            errorMessages = errorMessages.concat(checkNameConsistency(paramDescriptionNames, paramHeaderNames));
        }
        if (errorMessages.length !== 0) {
            errors = errors.concat(errorMessages);
            return true;
        } else {
            return false;
        }
    }

    // Checks that, if the specified keyword occurs in line, it is followed by a valid type name. If so,
    // it returns an empty string. If not, an error message is returned.
    function checkForValidTypeNameDescription(keyword, line, paramDescriptionNames) {
        var errorMessage = [];
        var loc=line.search(keyword);
        var matches = line.match(/\w+(\[\])*/g);
        if( matches === null )
            return [];

        var type = matches[1];
        var name = matches[2];




        if (paramDescriptionNames !== undefined)
            paramDescriptionNames.push(name);

        if (type == -1)
            errorMessage.push("The keyword " + keyword + "must be followed by a valid type name on line '" + line + "'.");
        else if (!ADTService.isValidTypeName(type))
            errorMessage.push(type + ' is not a valid type name. Valid type names are ' + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).');
        else if (keyword === '@param' && !isValidName(name))
            errorMessage.push(name + ' is not a valid name. Use upper and lowercase letters, numbers, and underscores.');
        else if (keyword === '@param' && !isValidParamDescription(line))
            errorMessage.push(line + ' Is not a valid description line. The description line of each parameter should be in the following form: " @param [Type] [name] , [description]".');
        else if (keyword === '@return' && name != -1)
            errorMessage.push('The return value must be in the form  " @return [Type]".');

        return errorMessage;
    }


    //Checks that exists a description of the parameter
    function isValidParamDescription(line) {
        var beginDescription = line.indexOf(', ');
        if (beginDescription == -1 || line.substring(beginDescription).lenght < 5)
            return false;
        else
            return true;
    }

    // checks that the two vectors have the same value, if not return the errors (array of strings)
    function checkNameConsistency(paramDescriptionNames, paramHeaderNames) {

        var errors = [];


        if( paramDescriptionNames.length !== paramHeaderNames.length )
            errors.push('The number of the parameter in the description does not match the number of parameters in the function header');
        else {
            var orderError = "";
            for (var i = 0; i < paramDescriptionNames.length; i++) {
                if ( paramHeaderNames[i] != paramDescriptionNames[i]) {
                    orderError = 'The order of the parameters in the description does not match the order of the parameters in the function header' ;
                }
            }
            if( orderError !== "" ) errors.push(orderError);
        }

        
        for (var i = 0; i < paramDescriptionNames.length; i++) {
            if (paramHeaderNames.indexOf(paramDescriptionNames[i]) == -1) {
                errors.push('The parameter ' + paramDescriptionNames[i] + ' does not exist in the header of the function');
            }
        }

        for (var i = 0; i < paramHeaderNames.length; i++) {
            if (paramDescriptionNames.indexOf(paramHeaderNames[i]) == -1)
                errors.push('Please, write a desciption for the parameter ' + paramHeaderNames[i] + '.');
        }


        return errors;
    }


    // checks that the name is vith alphanumerical characters or underscore
    function isValidName(name) {
        var regexp = /^[a-zA-Z0-9_]+$/;
        if (name.search(regexp) == -1) return false;
        return true;
    }

    // Returns true iff the text contains at least one pseudocall or pseudocode
    function hasPseudocallsOrPseudocode(text) {
        return (text.indexOf('//!') != -1) || (text.indexOf('//#') != -1);
    }

    // Replaces function code block with empty code. Function code blocks must start on the line
    // after a function statement.
    // Returns a block of text with the code block replaced or '' if no code block can be found
    function replaceFunctionCodeBlock(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('function')) {
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

}]);



// helper for the function editing convenctions
angular
    .module('crowdCode')
    .directive('functionConvections', function($sce){
    return {
        scope: true, // {} = isolate, true = child, false/undefined = no change
        restrict: 'EA', 
        templateUrl: 'functions/function_conventions.html',
        controller: function($scope, $element, $attrs) {
            $scope.examplePseudocode = $sce.trustAsHtml(
                        '<strong>Example:</strong>\n'+
                        'function foo() { \n'+
                        '  var values = [ 128, 309 ];\n'+
                        '  var avg;\n'+
                        '  <span class="pseudoCode">//# calc the average of the values</span>\n'+
                        '  return avg; \n' +
                        '}\n');
            $scope.examplePseudocall = $sce.trustAsHtml(
                        '<strong>Example:</strong>\n'+
                        'function foo() { \n'+
                        '  var values = [ 128, 309 ];\n'+
                        '  var avg = <span class="pseudoCall">calcAverage(values)</span>; \n'+
                        '  return avg; \n' +
                        '}\n'+
                        '// return the average of the values\n'+
                        'function calcAverage(values){}');

        }
    };
});
angular
    .module('crowdCode')
    .factory("FunctionFactory", function () {


	function FunctionFactory(rec){
		//console.log("asfasfasf"+rec);
		if( rec === undefined || rec === null )
			this.rec = {};
		else{

			this.rec = rec;
			this.name 			    = this.rec.name;
			this.code               = this.rec.code;
			this.description 		= this.rec.description;
			this.header 			= this.rec.header;
			this.parameters 		= this.rec.parameters;
			this.pseudoFunctions 	= this.rec.pseudoFunctions;
			this.returnType 		= this.rec.returnType;
			this.described			= this.rec.described;
			this.id 				= this.rec.id;
			this.linesOfCode 		= this.rec.linesOfCode;
			this.messageType 		= this.rec.messageType;
			this.needsDebugging  	= this.rec.needsDebugging;
			this.queuedMicrotasks 	= this.rec.queuedMicrotasks;
			this.readOnly 			= this.rec.readOnly;
			this.version 			= this.rec.version;
			this.written 			= this.rec.written;
			this.fullDescription 	= this.getFullDescription();
			this.signature			= this.getSignature();
			this.functionCode 		= this.getFunctionCode();
			this.fullCode 			= this.getFullCode();
		}

	}

	FunctionFactory.prototype = {
		//Compatibility Mode

		getName             : function(){ return this.rec.name; } ,
		getCode 			: function(){ return this.rec.code; } ,
		getParameters 	    : function(){ return this.rec.parameters; },
		getReturnType 		: function(){ return this.rec.returnType; },
		isDescribed			: function(){ return this.rec.described; },
		getId 				: function(){ return this.rec.id; },
		getLinesOfCode 		: function(){ return this.rec.linesOfCode; },
		getMessageType 		: function(){ return this.rec.messageType; },
		getNeedsDebugging  	: function(){ return this.rec.needsDebugging; },
		getQueuedMicrotasks : function(){ return this.rec.queuedMicrotasks; },
		isReadOnly 			: function(){ return this.rec.readOnly; },
		getVersion 			: function(){ return this.rec.version; },
		isWritten 			: function(){ return this.rec.written; },
		getParamNames        : function(){
			var paramNames=[];
			for(var index in this.rec.parameters)
			{
				paramNames.push(this.rec.parameters[index].name);
			}
			return paramNames;
		},
		getParamNameAt      : function( index ){
			if( this.rec.parameters && this.rec.parameters[index] )
				return this.rec.parameters[index].name;
			else
				return '';
		},
		getParamTypes        : function(){
			var paramTypes=[];
			for(var index in this.rec.parameters)
			{
				paramTypes.push(this.rec.parameters[index].type);
			}
			return paramTypes;
		},
		getHeader 			: function(){ 
			if( this.rec.described !== false )
				return this.rec.header;
			else{
				var splittedDescription =this.rec.description.split("\n");
				if(splittedDescription && splittedDescription.length>0)
					return  splittedDescription.pop();
			}
		},
		getDescription 		: function(){ 
			if(this.rec.described!==false)
				return this.rec.description;
			else
			{
				var splitteDescription=this.rec.description.replace("//", "").split("\n");
				if( splitteDescription !== null )
					splitteDescription.pop();
				return splitteDescription.join("\n");
			}
		},
		getFullDescription	: function(){
			if(this.getDescription()===undefined)
				return "";
			
			var numParams = 0;

			var fullDescription = '/**\n' + this.getDescription() + '\n';

			if(this.rec.parameters!==undefined && this.rec.parameters.length>0)
			{
	    		for(var i=0; i<this.rec.parameters.length; i++)
				{
					fullDescription += '  @param ' + this.rec.parameters[i].type + ' ' + this.rec.parameters[i].name + ', ' + this.rec.parameters[i].description + '\n';

				}
			}

			if(this.rec.returnType!=='')
				fullDescription += '\n  @return ' + this.rec.returnType + ' \n';

			fullDescription+='**/\n';
			return fullDescription;
		},
		getSignature: function(){
			return this.getFullDescription() + this.getHeader();
		},

		getFunctionCode: function(){
			return this.getSignature() + this.rec.code;
		},
		getPseudoFunctions 	: function(){
			if(this.rec.pseudoFunctions){
				var pseudoFunctionsStringified="\n\n";
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ )
					pseudoFunctionsStringified+=this.rec.pseudoFunctions[i].description+"{}\n\n";
				return pseudoFunctionsStringified;
			} else
				return "";
		},
		getPseudoFunctionsList 	: function(){
			if(this.rec.pseudoFunctions){
				var pseudoFunctionsDescription;
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ )
					pseudoFunctionsDescription.push(this.rec.pseudoFunctions[i].description);
				return pseudoFunctionsDescription;
			} else
				return [];

		},
		getFullCode: function(){
			return this.getFunctionCode() + this.getPseudoFunctions();
		},
		getCalleeList: function(){
			var self = this;
			var esprimaCode = this.getHeader() + this.rec.code;
			var ast = esprima.parse( esprimaCode , {loc: true});
			var callees = [];
			traverse(ast, function (node)
			{
				if((node!=null) && (node.type === 'CallExpression'))
				{
					// Add it to the list of callee names if we have not seen it before
					if (callees.indexOf(node.callee.name) == -1)
						callees.push(node.callee.name);
				}
			});
			for(var prop in ast) { delete ast[prop]; }
			return callees;
		},
		removePseudoFunction: function(pseudoFunctionName) {
			if(this.rec.pseudoFunctions!==undefined)
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ ){
					if(this.rec.pseudoFunctions[i].name===pseudoFunctionName)
						this.rec.pseudoFunctions.splice(i,1);
				}
		},
		updateFunction : function(newFunction) {
			this.rec.pseudoFunctions 	= [];
			this.rec.description="";
			angular.forEach(newFunction, function(value, key) {
			 	this.rec[key]=value;
			},this);
		},
		getMockCode: function(){
			var returnCode = '';
			var logEnabled = true;
			var functionObj = this;
			if (functionObj === null)
				return '';

			// create the instrumented function
			var cutFrom = instrumentedFunction.toString().search('{');
			var instrumentedBody = instrumentedFunction.toString().substr(cutFrom);
			returnCode += functionObj.header;
			returnCode += instrumentedBody
						  .replace(/'%functionName%'/g, functionObj.name )
						  .replace(/'%functionNameStr%'/g, "'" + functionObj.name + "'")
						  .replace(/'%functionMockName%'/g, functionObj.name + 'ActualIMP');
			returnCode += '\n';

			// Third, create the ActualImplementation function
			returnCode += functionObj.getMockHeader();
			if( functionObj.written )
				returnCode += '\n' + functionObj.code + '\n';
			else
				returnCode += '\n{ return null; }\n';

			return returnCode;
		},
		getMockHeader: function(){
			var mockHeader = 'function ' 
			    + this.name + 'ActualIMP'
				+ this.header.substring(this.header.indexOf('('));
			return mockHeader;
		}

	};

	return FunctionFactory;
});

function instrumentedFunction(){
	var args        = Array.prototype.slice.call(arguments);
	var stubFor     = Debugger.getStubOutput( '%functionNameStr%', args );
	var returnValue = null;
	var argsCopy    = [];
	for( var a in args )
		argsCopy[a] = JSON.parse(JSON.stringify(args[a]));
	
	if( stubFor != -1 ){
		returnValue = stubFor.output;
	} else {
		try {
			returnValue = '%functionMockName%'.apply( null, argsCopy );
		} catch(e) {
			Debugger.log(-1,'There was an exception in the callee \'' + '%functionNameStr%' + '\': '+e.message);
			Debugger.log(-1,"Use the CALLEE STUBS panel to stub this function.");
		}
	}

	if( calleeNames.search( '%functionNameStr%' ) > -1 ){
		Debugger.logCall( '%functionNameStr%', args, returnValue ) ;
	}

	return returnValue;
}

// check if a functionName is already taken
angular
    .module('crowdCode')
    .directive('functionNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var functionsName=functionsService.getDescribedFunctionsName();
                var valid =  viewValue === ""|| viewValue === undefined || (functionsName.indexOf(viewValue) == -1);

                if (!valid) {

                    ctrl.$setValidity('function', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('function', true);
                    return viewValue;
                }

            });

        }
    };
}]);


////////////////////
//FUNCTIONS SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('functionsService', ['$window','$rootScope','$firebase', '$filter','FunctionFactory', function( $window, $rootScope, $firebase, $filter, FunctionFactory) {


	var service = new function(){
		// Private variables
		var functions;
		var functionsHistory;
		var loaded = false;

		// Public functions
		this.init = function(newStatsChangeCallback) { return init(newStatsChangeCallback); };
		this.allFunctionNames = function() { return allFunctionNames(); };
		this.get = function(id) { return get(id); };
		this.getVersion = function(id,version) { return getVersion(id, version); };
		this.getByName = function(name) { return getByName(name); };
		this.getNameById  = function(id) { return getNameById(id); };
		this.getDescribedFunctionsCode = function(excludedFunctionId) { return getDescribedFunctionsCode(excludedFunctionId); };
		this.getDescribedFunctionsName = function(excludedFunctionId) { return getDescribedFunctionsName(excludedFunctionId); };
		this.getDescribedFunctionsId   = function(excludedFunctionId) { return getDescribedFunctionsId(excludedFunctionId); };
		this.getDescribedFunctions     = function() { return getDescribedFunctions(); };
		this.findMatches = function(searchText, functionSourceName) { return findMatches(searchText, functionSourceName); };
		this.getCount = function(){ return (functions === undefined)?0:functions.length; };
	 	this.isLoaded = function() { return loaded; };
		this.getAll = function(){ return functions;	};
		this.parseFunction = function (codemirror) { return parseFunction(codemirror); };
		this.parseFunctionFromAce = function (ace) { return parseFunctionFromAce(ace); };


		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
		    var functionsSync = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/functions'));
			functions = functionsSync.$asArray();
			functions.$loaded().then(function(){
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','functions');
			});
		}

		// Replaces function code block with empty code. Function code blocks must start on the line
		// after a function statement.
		// Returns a block of text with the code block replaced or '' if no code block can be found
		function replaceFunctionCodeBlock(text) {
		    var lines = text.split('\n');
		    for (var i = 0; i < lines.length; i++) {
		        if (lines[i].startsWith('function')) {
		            // If there is not any more lines after this one, return an error
		            if (i + 1 >= lines.length - 1){
		                return '';
		            }

		            // Return a string replacing everything from the start of the next line to the end
		            // Concatenate all of the lines together
		            var newText = '';
		            for (var j = 0; j <= i; j++){
		                newText += lines[j] + '\n';
		            }

		            newText += '{}';
		            return newText;
		        }
		    }

		    return '';
		}


		function allFunctionNames()
		{
			var functionsNames = [];
			$.each(functions, function(i, value)
			{
				functionsNames.push(value.nameget);
			});
			return functionNames;
		}


		// Returns an array with every current function ID
		function getDescribedFunctions(){
			return $filter('filter')(functions, { described: true });
		}

		// Returns an array with every current function ID
		function getDescribedFunctionsId(excludedFunctionId){
			var describedIds = [];
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id !== excludedFunctionId ){
					describedIds.push(value.id);
				}
			});
			return describedIds;
		}

		// Returns all the described function Names except the one with the passed ID
		function getDescribedFunctionsName(excludedFunctionId)
		{
			var describedNames = [];
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedNames.push(value.name);
				}
			});
			return describedNames;
		}

		// Returns all the described function signature except the one with the passed ID
		function getDescribedFunctionsCode(excludedFunctionId)
		{
			var describedCode = '';
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedCode += value.header+'{ }';
				}
			});
			return describedCode;
		}


		// Get the function object, in FunctionInFirebase format, for the specified function id
		function get(id)
		{
			var funct = null;
			angular.forEach(functions, function(value) {
				if( funct === null && value.id == id ) {
			  		funct = value;
			  	}
			});

			if( funct === null ){
				return -1;
			} else {
				return new FunctionFactory(funct);
			}
		}

		// Get the function object, in FunctionInFirebase format, for the specified function id
		function getVersion(id, version)
		{
			var functionSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + id+ '/' + version));
			var funct = functionSync.$asObject();

			return funct;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function name
		function getByName(name)
		{
			var funct = null;
			angular.forEach(functions, function(value) {
				if( funct === null && value.name === name && value.described) {
			  		funct = value;
			  	}
			});
			return new FunctionFactory(funct);
		}

		function getNameById(id)
		{
			var funct = get(id);
			if( funct !== null){
				return funct.name;
			}
			return '';
		}

		function getIdByName(name)
		{
			// console.log(name);
			var functionId = -1;
			angular.forEach(functions, function(value) {
				if( functionId === -1 && value.name === name ) {
			  		functionId = value.id;
			  	}
			});
			return functionId;
		}


	// Given a String return all the functions that have either or in the description or in the header that String
	function findMatches(searchText, functionSourceName)
	{
		var re = new RegExp(searchText);
		var results = [];

		angular.forEach(functions, function(value){
			if( value.name !== functionSourceName ){
				var score = computeMatchScore(value, re);
				if (score > 0){
					results.push({ 'score': score, 'value': new FunctionFactory( value) });
				}
			}
		});

		return results;
	}

	function computeMatchScore (functionDescription, re)
	{
		// Loop over each piece of the function description. For each piece that matches regex,
		// add one to score. For matches to function name, add 5.
		var score = 0;

		if (re.test(functionDescription.name))
			score += 5;
		if (re.test(functionDescription.description))
			score += 1;
		if (re.test(functionDescription.header))
			score += 1;

	    return score;
	}

	function parseFunction(codemirror)
	{

		var ast = esprima.parse(codemirror.getValue(), {loc: true});
		var calleeNames      = getCalleeNames(ast);
		var fullDescription  = codemirror.getRange({ line: 0, ch: 0}, { line: ast.loc.start.line - 1, ch: 0 });
		var descriptionLines = fullDescription.split('\n');
		var functionName     = ast.body[0].id.name;
		var functionParsed   = parseDescription(descriptionLines, functionName);


		functionParsed.code = codemirror.getRange( 
			{ line: ast.body[0].body.loc.start.line - 1, ch: ast.body[0].body.loc.start.column },
			{ line: ast.body[0].body.loc.end.line   - 1, ch: ast.body[0].body.loc.end.column	}
		);

		functionParsed.pseudoFunctions=[];
		var pseudoFunctionsName=[];
		for( var i=1; i < ast.body.length; i++ ){
			var prevPseudoBody = ast.body[i-1];
			var currPseudoBody = ast.body[i];

			var pseudoFunction={};
			
			pseudoFunction.description = codemirror.getRange(
				{ line: prevPseudoBody.loc.end.line - 1, ch: prevPseudoBody.loc.end.column },
				{ line: currPseudoBody.loc.end.line - 1, ch: currPseudoBody.loc.end.column - 2 }
			).match(/.+/g).join("\n");


			pseudoFunction.name = currPseudoBody.id.name;
			
			functionParsed.pseudoFunctions.push(pseudoFunction);
			pseudoFunctionsName.push(ast.body[i].id.name);
		}
		functionParsed.calleeIds=[];

		for(i =0; i< calleeNames.length; i++)
		{
			if(pseudoFunctionsName.indexOf(calleeNames[i])!==-1){
				calleeNames.slice(i,1);
			}
			else{
				var functionId=getIdByName(calleeNames[i]);
				if(functionId!=-1)
					functionParsed.calleeIds.push(functionId);
			}
		}

		return functionParsed;
	}

	function parseFunctionFromAce( editor )
	{
		var Range   = (window.ace || {}).require('ace/range').Range;
		var session = editor.getSession();

		var ast = esprima.parse( session.getValue(), {loc: true});
		var calleeNames      = getCalleeNames(ast);
		var fullDescription  = session.getTextRange( new Range(0, 0, ast.loc.start.line - 1, 0) );
		var descriptionLines = fullDescription.split('\n');
		var functionName     = ast.body[0].id.name;
		var functionParsed   = parseDescription(descriptionLines, functionName);

		functionParsed.code = session.getTextRange( new Range(ast.body[0].body.loc.start.line - 1,ast.body[0].body.loc.start.column,ast.body[0].body.loc.end.line- 1,ast.body[0].body.loc.end.column) );

		functionParsed.pseudoFunctions=[];
		var pseudoFunctionsName=[];
		for( var i=1; i < ast.body.length; i++ ){
			var prevPseudoBody = ast.body[i-1];
			var currPseudoBody = ast.body[i];

			var pseudoFunction={};
			
			pseudoFunction.description = session.getTextRange( new Range( prevPseudoBody.loc.end.line - 1, prevPseudoBody.loc.end.column, currPseudoBody.loc.end.line - 1, currPseudoBody.loc.end.column - 2) ).match(/.+/g).join("\n");
			pseudoFunction.name = currPseudoBody.id.name;
			
			functionParsed.pseudoFunctions.push(pseudoFunction);
			pseudoFunctionsName.push(ast.body[i].id.name);
		}
		functionParsed.calleeIds=[];

		for(i =0; i< calleeNames.length; i++){
			if(pseudoFunctionsName.indexOf(calleeNames[i])!==-1){
				calleeNames.slice(i,1);
			} else {
				var functionId=getIdByName(calleeNames[i]);
				if(functionId!=-1)
					functionParsed.calleeIds.push(functionId);
			}
		}

		return functionParsed;
	}

}
	return service;
}]);



//////////////////////
//  JAVA HELPER     //
//////////////////////


angular
    .module('crowdCode')
    .directive('javascriptHelper', ['$compile', '$timeout', '$http', 'ADTService', function($compile, $timeout, $http, ADTService) {
    
    var javascriptTutorialTxt = '\/\/ This is a javascript variable. \r\nvar x = 5;\r\n \r\n\/\/ There are no types in Javascript.\r\nx = \"A string now\";\r\nx = false;\r\nx = 3.5;\r\n \r\n\/\/ This is an array\r\nvar array = [1, 2, 3, 4];\r\nvar sum = 0;\r\n \r\n\/\/ You can loop over arrays\r\nfor (var i = 0; i < array.length; i++)\r\n    sum += array[i];\r\n \r\n\/\/ And push things onto an array\r\nwhile (sum > 0)\r\n{\r\n    array.push(x);\r\n    sum--; \r\n}\r\n\r\n\/\/ These are objects. Objects contains properties, which map a \r\n\/\/ name to a value. Objects function as a map: pick a property \r\n\/\/ name, and assign it a value (any name will do).\r\nvar emptyObject = { };\r\nvar obj2 = { propName: \"value\" };\r\nvar obj3 = { storedArray: array };\r\nvar obj4 = { nestedObject: obj3 };\r\nvar obj5 = { complexExpression: aFunctionCall(obj4) };\r\nvar obj6 = { property1: true,\r\n             property2: \"your string here\" };\r\n\r\n\/\/ Properties in objects can be accessed.\r\nvar obj3Also = obj4.nestedObject;\r\nvar anotherWayToGetObj3 = obj4[\"nestedObject\"];\r\n\r\n\/\/ Or you can check if an object has a property\r\nif (obj4.hasOwnProperty(\"nextedObject\"))\r\n    x = \"Definitely true\";\r\n\r\n\/\/ You can convert objects to strings (that look just like\r\n\/\/ object literals)\r\nvar stringObj2 = JSON.stringify(obj2); \r\n\/\/ stringObj2 == { \"propName\": \"value\" }\r\n\/\/ (the quotes on the property name are optional....)\r\n\r\n\/\/ And back again\r\nvar obj3 = JSON.parse(stringObj3);\r\n\r\n\/\/ Want to know how to do something else? Try a google search!';
    
    return {
        restrict: 'EA',
        templateUrl: 'functions/javascript_tutorial.html',

        link: function($scope, $element, $attributes) {

            // $http.get('functions/javascriptTutorial.txt').success(function(code) {
                $scope.javaTutorial = javascriptTutorialTxt;
            // });

        },
        controller: function($scope, $element) {



            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });

            };
        }
    };

}]);


angular
    .module('crowdCode')
    .directive('leaderboard', leaderboard);

function leaderboard($firebase, avatarFactory, firebaseUrl, workerId) {
    return {
        restrict: 'E',
        templateUrl: 'leaderboard/leaderboard_panel.html',
        controller: function($scope, $element) {
            var lbSync = $firebase(new Firebase(firebaseUrl + '/leaderboard/leaders'));
            $scope.avatar  = avatarFactory.get;
            $scope.leaders = lbSync.$asArray();
            $scope.leaders.$loaded().then(function() {});
        }
    };
}



///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DebugTestFailureController', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    

    $scope.tabs = {
        list: ['Test Result','Code','Console','Stubs','Previous Tests'],
        active : 2,
        select : function(selectedIndex){
            if( selectedIndex >= 0 && selectedIndex < this.list.length ){
                this.active = selectedIndex;
            }
        }
    };

    var autosubmit = false;
    var testRunner = new TestRunnerFactory.instance();
    testRunner.setTestedFunction($scope.microtask.functionID);
    testRunner.onTestsFinish(processTestsFinish);
    
    var lastRunnedCode = '';

    $scope.previousTests = [];
    $scope.currentTest   = null;
    $scope.passedTests   = [];
    $scope.firstTimeRun  = true; 


    $scope.stubs      = {}; // contains all the stubs used by all the tests
    $scope.callees    = {}; // contains the info of all the callee

    $scope.hidePassedTests  = false;
    $scope.runTests         = runTests;

    $scope.functionDescription = $scope.funct.getSignature();
    $scope.data = {};
    $scope.data.code = $scope.funct.getFunctionCode();
    $scope.data.editor = null;
    $scope.data.running = false;
    $scope.data.hasPseudo = false;
    $scope.data.annotations = [];
    $scope.data.markers = [];
    $scope.data.onCalleeClick = function(calleeName){
        $scope.$broadcast('open-stubs-'+calleeName);
    };

    $scope.keepCode = false;
    $scope.toggleKeepCode = function(){ $scope.keepCode = !$scope.keepCode };


    $scope.$on('collectFormData', collectFormData );
    $scope.runTests();

    



    function processTestsFinish(data){
        $timeout(function(){

            // if on the first run all the tests pass, 
            // load a new microtask 
            $scope.testsRunning = false;

            if ($scope.firstTimeRun){
                // if all the tests passed
                // auto submit this microtask
                if( data.overallResult ){
                    autosubmit = true;
                    $scope.$emit('collectFormData', true);
                }
                // otherwise remove the non passed tests
                // but except the first 
                else {
                    var firstFailedIn = false;
                    var allTests = [];
                    $scope.previousTests = [];
                    angular.forEach( data.tests, function( test, index){
                        if( test.passed() || $scope.currentTest == null ){
                            allTests.push( test );

                            if( !test.passed() ) {
                                $scope.currentTest = test; 
                            } else 
                                $scope.previousTests.push( test )
                        } 
                    });
                    testRunner.setTests( [$scope.currentTest].concat( $scope.previousTests ) );
                }

                $scope.firstTimeRun = false;
            } 

            
            if( $scope.currentTest != null ){
                var error = $scope.currentTest.errors;
                if( error !== undefined ){
                    $scope.data.annotations = [];
                    $scope.data.annotations.push({
                        row:  error.line,
                        text: 'error: '+error.message + '',
                        type: 'error'
                    });
                } else {
                    var annotations = [];
                    var debug = $scope.currentTest.debug; 
                    if( debug !== undefined ){
                        for( var l in debug ){
                            if( debug[l].line != -1 ){
                                var line = debug[l].line;
                                annotations.push( {
                                    row:  debug[l].line,
                                    text: debug[l].position + ': ' +debug[l].statement + '',
                                    type: 'info'
                                });
                            }   
                        }
                    }
                    $scope.data.annotations = annotations;
                }

                $scope.data.markers = [];
                $scope.data.callees = Object.keys($scope.currentTest.stubs);
                angular.forEach( $scope.data.callees,function(cName){
                    $scope.data.markers.push({ 
                        regex: cName+'[\\s]*\\([\\s\\w\\[\\]\\+\\.\\,]*\\)', 
                        token: 'ace_call' ,
                        onClick: function(){
                            $scope.$broadcast('open-stubs-'+cName);
                        }
                    });
                });
            }
            
            // var tokens = [];

            console.log($scope.currentTest.stubs);
            $scope.data.running = false;

        },0);

        

        
    }


    function runTests(firstTime) {
        if( $scope.testsRunning ) return false;

        lastRunnedCode = $scope.data.editor === null ? $scope.data.code : $scope.data.editor.getValue();
        testRunner.setTestedFunctionCode( lastRunnedCode );


        if( !$scope.firstTimeRun ){
            testRunner.mergeStubs( $scope.currentTest.stubs );
        }

        // push a message for for running the tests
        if( testRunner.runTests() != -1 ) {
            $scope.data.running = true;
        }

        $scope.completed = 0;
        $scope.total     = 0;
        $scope.numPassed = 0;

    }



    

    function collectFormData(event, microtaskForm) {

        // CHECK IF THERE ARE FORM ERRORS
        var errors = "";
        



        // TAKE THE FAILED TESTS THAT IS NOT IN DISPUTE
        var failedNonInDispute = 0;
        var disputeTextEmpty    = false;
        var inDispute = false;
        var allTests = $scope.currentTest == null ? 
                        $scope.previousTests      : 
                        $scope.previousTests.concat($scope.currentTest);
        var disputed = [];

        var hasPseudo = $scope.data.hasPseudo ;

        // scan the list of tests and search
        // if there are failed tests non in dispute
        // or there are disputed tests with empty dispute description
        angular.forEach( allTests, function(test){
            if( !test.passed() && ( test.rec.inDispute === undefined || !test.rec.inDispute )  ){
                failedNonInDispute++;
            } else if( test.rec.inDispute ){
                if( !disputeTextEmpty && (test.rec.disputeTestText === undefined || test.rec.disputeTestText.length == 0) ){
                    disputeTextEmpty = true;
                } else {
                    disputed.push( test.getDisputeDTO() );
                }
            }
        });

        if( /* dispute descriptions empty */ disputeTextEmpty )
            errors += "Please, fill the dispute texts!";
        else if ( /* if other form errors */ microtaskForm.$invalid )
            errors += "Please, fix all the errors before submit."
        else if ( /* code doesn't have pseudocall or pseudocode */ !hasPseudo) {
            
            if( /* at least one test failed and is not disputed */ failedNonInDispute > 0 )
                errors += "Please fix all the failed tests or dispute them!";
            else if( /* code is changed since last test run */ lastRunnedCode != $scope.data.editor.getValue() )
                errors += "The code is changed since last tests run. \n Please, run again the tests before submit.";

        } 
        

        if (errors === "") {
            var formData = {
                functionDTO   : functionsService.parseFunctionFromAce($scope.data.editor),
                stubs         : [],
                disputedTests : [],
                hasPseudo     : hasPseudo,
                autoSubmit    : autosubmit
            };
            
            if( !hasPseudo ){
                // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
                var stubs = [];
                if( $scope.currentTest != null ){
                    angular.forEach( $scope.currentTest.stubs, function(stubsForFunction, functionName) {
                        var stubFunction = functionsService.getByName( functionName );
                        angular.forEach(stubsForFunction, function(stub, index) {

                            if( TestList.search( functionName, stub.inputs ) === null ){
                                console.log('stub not found!');
                                var testCode = 'equal(' + stubFunction.name + '(';
                                var inputs = [];
                                angular.forEach( stub.inputs, function(value, key) {
                                    testCode += value;
                                    testCode += (key != stub.inputs.length - 1) ? ',' : '';
                                });
                                testCode += '),' + stub.output + ',\'' + 'auto generated' + '\');';

                                test = {
                                    description      : 'auto generated test',
                                    functionVersion  : stubFunction.version,
                                    code             : testCode,
                                    hasSimpleTest    : true,
                                    functionID       : stubFunction.id,
                                    functionName     : stubFunction.name,
                                    simpleTestInputs : stub.inputs,
                                    simpleTestOutput : stub.output,
                                  //  readOnly         : true,
                                    inDispute        : false,
                                    disputeTestText  : '',
                                };

                                stubs.push(test);
                            } else 
                                console.log('stub found!');
                        });
                    });
                }
                formData.stubs = stubs;

                if ( disputed.length > 0 ) {
                    formData.disputedTests = disputed;
                } 
            }

            $scope.$emit('submitMicrotask', formData);

        } else {
            $alert({
                title: 'Error!',
                content: errors,
                type: 'danger',
                show: true,
                duration: 5,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        }
    }

}]);
angular
    .module('crowdCode')
    .directive('microtaskForm', [ '$firebase', '$http', '$interval', '$timeout','$modal',  'functionsService','FunctionFactory', 'userService', 'microtasksService','TestList', microtaskForm]); 

function microtaskForm($firebase, $http, $interval, $timeout, $modal , functionsService, FunctionFactory, userService, microtasks, TestList) {
    return {
        restrict: 'E',
        templateUrl: 'microtasks/microtask_form.html',
        controller: function($scope,$element,$attrs){
			// private vars
			var templatesURL = "microtasks/";
			var templates = {
				'NoMicrotask': 'no_microtask/no_microtask.html',
				'Review': 'review/review',
				'DebugTestFailure': 'debug_test_failure/debug_test_failure',
				'ReuseSearch': 'reuse_search/reuse_search',
				'WriteFunction': 'write_function/write_function',
				'WriteFunctionDescription': 'write_function_description/write_function_description',
				'WriteTest': 'write_test/write_test',
				'WriteTestCases': 'write_test_cases/write_test_cases',
				'WriteCall': 'write_call/write_call',
			};

			// initialize microtask and templatePath
			$scope.funct = {};
			$scope.test = {};
			$scope.microtask = {};
			$scope.templatePath = ""; //"/html/templates/microtasks/";
			$scope.validatorCondition = false;
			$scope.loadingMicrotask = true;
			//Whait for the inizializations of all service
			//when the microtask array is syncronize with firebase load the first microtask

			$scope.userService = userService;

			var waitTimeInSeconds = 15;
			var checkQueueTimeout = null;
			var timerInterval     = null;
			$scope.checkQueueIn   = waitTimeInSeconds;



			function loadMicrotask(microtaskKey){
				//console.log('Loading microtask '+microtaskKey);

				if( microtaskKey === undefined || microtaskKey == "null" ){
					noMicrotask();
					return;
				}

				userService.assignedMicrotaskKey = microtaskKey;

				$scope.microtask = microtasks.get(microtaskKey);
				$scope.microtask.$loaded().then(function() {


					// retrieve the related function
					if (angular.isDefined($scope.microtask.functionID) || angular.isDefined($scope.microtask.testedFunctionID)) { 
						$scope.funct = functionsService.get($scope.microtask.functionID);
					}
					// retrieve the related test
					var testId = angular.isDefined($scope.microtask.testID) && $scope.microtask.testID!==0 ? $scope.microtask.testID : null;
					if ( testId !== null ) {
						var TestObj = TestList.get(testId);
						////console.log('Loaded test %o of id %d',TestObj,testId);
						$scope.test = TestObj.rec;
					}

					// if is a reissued microtask
					// retrieve the initial microtask
					if ( angular.isDefined( $scope.microtask.reissuedFrom ) ) {

						$scope.reissuedMicrotask = microtasks.get($scope.microtask.reissuedFrom);
							$scope.reissuedMicrotask.$loaded().then(function() {
							//choose the right template
							if ( $scope.microtask !== undefined && $scope.reissuedMicrotask !== undefined ){
								$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
								$scope.noMicrotask = false;

								$scope.$emit('run-tutorial', $scope.microtask.type , false, function(){});
								$scope.$emit('run-reminder', $scope.microtask.type,function (){ $scope.$emit('skipMicrotask',true); });
							}
							else {
								$scope.$emit('stop-reminder');
								$scope.templatePath = templatesURL + templates['NoMicrotask'];
								$scope.noMicrotask = true;
							}
						});

					}
					// otherwise
					else {

						//choose the right template
						if ( $scope.microtask !== undefined ){
							$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";
							$scope.noMicrotask = false;

							$scope.$emit('run-tutorial', $scope.microtask.type , false, function(){});
							$scope.$emit('run-reminder', $scope.microtask.type, function (){ $scope.$emit('skipMicrotask',true); } );

						}
						else {

							$scope.$emit('stop-reminder');
							$scope.templatePath = templatesURL + templates['NoMicrotask'];
							$scope.noMicrotask = true;
						}
					}

				});
			}

			// in case of no microtasks available
			function noMicrotask(){
				$scope.$emit('stop-reminder');
				$scope.templatePath = templatesURL + templates['NoMicrotask'];
				$scope.noMicrotask = true;

				$scope.checkQueueIn = waitTimeInSeconds;
				timerInterval = $interval(function(){
					$scope.checkQueueIn -- ;
				}, 1000);

				checkQueueTimeout = $timeout(function() {
					$interval.cancel(timerInterval);
					$scope.$emit('loadMicrotask');
				}, waitTimeInSeconds*1000); // check the queue every 30 seconds
			}

			// ------- MESSAGE LISTENERS ------- //

			// load microtask:
			// request a new microtask from the backend and if success
			// inizialize template and microtask-related values
			$scope.$on('loadMicrotask', function($event, fetchData) {
				$scope.canSubmit=true;

				// if the check queue timeout
				// is active, cancel it
				if (checkQueueTimeout !== null) {
					$timeout.cancel(checkQueueTimeout);
				}

				// show the loading screen
				$scope.templatePath  = templatesURL + "loading.html";

				// if a fetchData is provided
				if( fetchData !== undefined ){

					if(  fetchData.firstFetch == '1')
						userService.setFirstFetchTime();

					loadMicrotask(fetchData.microtaskKey);
				}
				// otherwise do a fetch request
				else {
					var fetchPromise = microtasks.fetch();
					fetchPromise.then(function(fetchData){

						if(  fetchData.firstFetch == '1')
							userService.setFirstFetchTime();
						
						loadMicrotask(fetchData.microtaskKey);
					}, function(){
						noMicrotask();
					});
				}
			});


			// listen for message 'submit microtask'
			$scope.$on('submitMicrotask', function(event, formData) {

				if($scope.canSubmit){

					$scope.templatePath   = templatesURL + "loading.html";
					$scope.canSubmit=false;
					microtasks.submit($scope.microtask,formData).then(function(data){
						$scope.$broadcast('loadMicrotask',data);
					},function(){
						console.error('Error during microtask submit!');
					});
				}
			});

			// listen for message 'skip microtask'
			$scope.$on('skipMicrotask', function(event,autoSkip) {

				console.log("skip with value: "+autoSkip);
				if($scope.canSubmit){

					$scope.templatePath   = templatesURL + "loading.html";
					$scope.canSubmit=false;
					microtasks.submit($scope.microtask,null,autoSkip).then(function(data){
						$scope.$broadcast('loadMicrotask',data);
					},function(){
						console.error('Error during microtask skip!');
					});
				}
			});


        }
    };
};

angular
    .module('crowdCode')
    .directive('microtaskShortcuts', function() {
    return function(scope, element, attrs) {

        // manage the key down
        var keyDownListener = function(event, formData){

            var charCode = event.which || event.keyCode;
            var preventDefault = false;

            // all the microtask shortcuts are a combination of CTRL + key
            if( event.ctrlKey ) {

                // if is CTRL + ENTER submit microtask
                if(charCode == 13) { 
                    // console.log('CTRL+ENTER');
                    scope.$broadcast('collectFormData', scope.microtaskForm);
                    preventDefault = true;
                } 

                // // if is CTRL + BACKSPACE skip microtask
                // else if ( charCode == 8 ) { 
                //     // console.log('CTRL+BACKSPACE');
                //     //scope.$emit('skipMicrotask');
                //     preventDefault = true;
                // } 

                // // if is CTRL + H start the tutorial
                // else if ( charCode == 72 ) { // H
                //     // console.log('CTRL+H');
                //     // preventDefault = true;
                // }
            }

            // if a combo has been managed
            // prevent other default behaviors
            if( preventDefault )
                event.preventDefault();

        };

        // bind keydown listener
        element.on('keydown', keyDownListener);

        // unbind keydown listener on microtask form destroy
        element.on('$destroy',function(){
            element.off('keydown',null,keyDownListener);
        });
    };
});

/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
angular
    .module('crowdCode')
    .factory('microtasksService', ['$window','$rootScope','$firebase','$http','$q', 'userService', function($window,$rootScope,$firebase,$http,$q, userService) {

	// Private variables
	var microtasks;

	var service = {

		// Public functions
		get : function(id){
			var microtaskSync = $firebase(new Firebase($rootScope.firebaseURL+'/microtasks/'+id));
			var microtask = microtaskSync.$asObject();

			return microtask;
		},

		submit : function(microtask, formData,autoSkip){
			var deferred = $q.defer();

			if( microtask == undefined )
				deferred.reject();

			var skip = formData == null;
			var disablePoint = autoSkip||false;
			// submit to the server
			$http.post('/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip='+(skip? 'true' : 'false') + '&disablepoint=' +(disablePoint ? 'true':'false'), formData)

				.success(function(data, status, headers, config) {
					// submit to Firebase
					microtask.submission = formData;
					microtask.$save();

					deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject(data);
				});
			return deferred.promise;
		},

		fetch : function(){
			var deferred = $q.defer();

			// ask the microtask id
			$http.get('/' + projectId + '/ajax/fetch')
				.success(function(data, status, headers, config) {
					deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject(data);
				});

			return deferred.promise;
		}
	}
	return service;
}]);
///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('NoMicrotaskController', ['$scope', '$rootScope', '$firebase', 'firebaseUrl', 'avatarFactory','workerId', function($scope, $rootScope, $firebase, firebaseUrl, avatarFactory, workerId) {
    
    // create the reference and the sync

	var lbSync = $firebase(new Firebase(firebaseUrl + '/leaderboard/leaders'));

	$scope.avatar = avatarFactory.get;
	$scope.leaders       = lbSync.$asArray();
	$scope.leaders.$loaded().then(function() {});
}]);

///////////////////////////////
//  REUSE SEARCH CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReuseSearchController', ['$scope', '$alert', 'functionsService','FunctionFactory', function($scope, $alert, functionsService) {
    // set selected to -2 to initialize the default value
    //-2 nothing selected (need an action to submit)
    //-1 no function does this
    // 0- n index of the function selected
    $scope.selectedResult = -2;
    //display all the available function at the beginning
    $scope.results = functionsService.findMatches('', $scope.funct.name);

    $scope.code = $scope.funct.getFunctionCode();
    // search for all the functions that have $scope.reuseSearch.text in theirs description or header
    $scope.doSearch = function() {

        $scope.selectedResult = -2;
        $scope.results = functionsService.findMatches($scope.text, $scope.funct.name);
    };
    $scope.select = function(index) {
        $scope.selectedResult = index;
    };


    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        if ($scope.selectedResult == -2) {
            var error = 'Choose a function or select the checkbox "No funtion does this"';
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            //if no function selected the value of selected is ==-1 else is the index of the arrayList of function
            if ($scope.selectedResult == -1) formData = {
                functionName: "",
                functionId: 0,
                noFunction: true
            };
            else formData = {
                functionId: $scope.results[$scope.selectedResult].value.id,
                functionName: $scope.results[$scope.selectedResult].value.name,
                noFunction: false
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);


///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReviewController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', 'microtasksService', 'TestList', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService, microtasksService, TestList) {
    // scope variables
    $scope.review = {};
    $scope.review.reviewText = "";
    $scope.review.functionCode = "";

    // private variables 
    var oldCode;
    var newCode;
    var diffRes;
    var diffCode;
    var oldFunction;
    var newFunction;
    var functionSync;

    //load the microtask to review
    $scope.review.microtask = microtasksService.get($scope.microtask.microtaskKeyUnderReview);
    $scope.review.microtask.$loaded().then(function() {


        $scope.reviewed = $scope.review.microtask;

        if ($scope.reviewed.type == 'WriteTestCases') {
            //load the version of the function with witch the test cases where made
            functionSync = functionsService.getVersion($scope.review.microtask.functionID,$scope.review.microtask.submission.functionVersion);
            functionSync.$loaded().then(function() {
            $scope.funct = new FunctionFactory(functionSync);
            });

            var testcases    = $scope.review.microtask.submission.testCases;
            var testcasesDiff = [];
            angular.forEach(testcases,function(tc,index){
                if(tc.added)
                    testcasesDiff.push({ class: 'add', text : tc.text });
                else if( tc.deleted )
                    testcasesDiff.push({ class: 'del', text : tc.text });
                else {
                    var oldTc = TestList.get(tc.id);
                    if( tc.text != oldTc.getDescription() ) {
                        testcasesDiff.push({ class: 'chg', old: oldTc.getDescription(), text : tc.text });
                    }
                    else
                        testcasesDiff.push({ class: '', text : tc.text });
                }
            });


            $scope.review.testcases    = testcasesDiff;


        } else if ($scope.review.microtask.type == 'WriteFunction') {

            oldFunction = functionsService.get($scope.review.microtask.functionID);
            newFunction = new FunctionFactory ( $scope.review.microtask.submission );

            oldCode = oldFunction.getFullCode().split("\n");
            newCode = newFunction.getFullCode().split("\n");

            diffCode = "";
            diffRes = diff(oldCode, newCode);
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=")
                    diffCode += diffRow[1].join("\n");
                else
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                diffCode += "\n";
            });
            $scope.review.functionCode = diffCode;

            if ($scope.review.microtask.promptType == 'REMOVE_CALLEE')
                $scope.callee=functionsService.get($scope.review.microtask.calleeId);

            if ($scope.review.microtask.promptType == 'DESCRIPTION_CHANGE') {
                oldCode = $scope.review.microtask.oldFullDescription.split("\n");
                newCode = $scope.review.microtask.newFullDescription.split("\n");
                diffRes = diff(oldCode, newCode);
                diffCode = "";
                angular.forEach(diffRes, function(diffRow) {
                    if (diffRow[0] == "=") {
                        diffCode += diffRow[1].join("\n");
                    } else {
                        for (var i = 0; i < diffRow[1].length; i++)
                            diffCode += diffRow[0] + diffRow[1][i] + "\n";
                    }
                    diffCode += "\n";
                });
                $scope.calledDiffCode = diffCode;
            }

        } else if ($scope.review.microtask.type == 'WriteTest') {
            functionSync = functionsService.getVersion($scope.review.microtask.functionID,$scope.review.microtask.submission.functionVersion);
            functionSync.$loaded().then(function() {
                $scope.funct = new FunctionFactory(functionSync);
            });


        } else if ($scope.review.microtask.type == 'WriteCall') {

            oldFunction = functionsService.get($scope.review.microtask.functionID);
            newFunction = new FunctionFactory ($scope.review.microtask.submission);
            oldCode = oldFunction.getFunctionCode().split("\n");

            newCode = newFunction.getFunctionCode().split("\n");


            diffRes = diff(oldCode, newCode);
            diffCode = "";
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=") {
                    diffCode += diffRow[1].join("\n");
                } else {
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                }
                diffCode += "\n";
            });
            $scope.calleeFunction = functionsService.get($scope.review.microtask.calleeID);
            $scope.functName =oldFunction.name;
            $scope.review.functionCode = diffCode;

            //      $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code;
        } else if ($scope.review.microtask.type == 'WriteFunctionDescription') {
            $scope.review.funct=new FunctionFactory($scope.review.microtask.submission);
            $scope.review.requestingFunction  = functionsService.get($scope.review.microtask.functionID);

        } else if ($scope.review.microtask.type == 'ReuseSearch') {
            //load the callee function
            $scope.funct = functionsService.get($scope.review.microtask.functionID);
            $scope.calleeFunction = functionsService.get($scope.review.microtask.submission.functionId);

        }else if ($scope.review.microtask.type == 'DebugTestFailure') {
            $scope.funct = functionsService.get($scope.review.microtask.functionID);

            if( $scope.review.microtask.submission.hasPseudo){
                oldFunction =  $scope.funct;
                newFunction = new FunctionFactory ( $scope.review.microtask.submission.functionDTO );

                oldCode = oldFunction.getFullCode().split("\n");
                newCode = newFunction.getFullCode().split("\n");

                diffCode = "";
                diffRes = diff(oldCode, newCode);
                angular.forEach(diffRes, function(diffRow) {
                    if (diffRow[0] == "=")
                        diffCode += diffRow[1].join("\n");
                    else
                        for (var i = 0; i < diffRow[1].length; i++)
                            diffCode += diffRow[0] + diffRow[1][i] + "\n";
                    diffCode += "\n";
                });
                $scope.review.functionCode = diffCode;
            } else {
                $scope.tests= [];
                var reviewTest;
                for( var index in $scope.review.microtask.submission.disputedTests){
                    reviewTest=TestList.get($scope.review.microtask.submission.disputedTests[index].id);
                    reviewTest.disputeText = $scope.review.microtask.submission.disputedTests[index].disputeText;
                    $scope.tests.push(reviewTest);
                }

            }
        }
    });


    $scope.accept = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(5);
    };
    $scope.reject = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(1);
    };
    $scope.reissue = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(3);
    };

    //Star rating manager
    // $scope.review.mouseOn = 0;
    $scope.review.maxRating = 5;
    $scope.review.rating    = -1;
    $scope.rate = function(value) {
        if (value >= 0 && value <= $scope.review.maxRating) {
            $scope.review.rating = value;
        }
    };
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

        if ($scope.review.rating <= 3)
            $scope.makeDirty(microtaskForm);

        var error = "";
        if ($scope.review.rating === -1)
            error = "plese, select a score";
        else if (microtaskForm.$invalid && $scope.review.rating <= 3)
            error = "please, write an explanation for your choice";


        if (error !== "")
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        else {

            formData = {
                microtaskIDReviewed     : $scope.microtask.microtaskKeyUnderReview,
                reviewText              :($scope.review.reviewText ===undefined ? "" : $scope.review.reviewText),
                qualityScore            : $scope.review.rating,
                fromDisputedMicrotask   :($scope.review.microtask.submission.inDispute ===true ? true : false)
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);


///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteCallController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService) {
    // INITIALIZATION OF FORM DATA MUST BE DONE HERE
    $scope.data = {};
    $scope.data.hasPseudo = false;
    $scope.data.editor = null;    //load the callee function
    $scope.data.markers=[];
    $scope.calleeFunction = functionsService.get($scope.microtask.calleeID);
    $scope.data.markers.push({ 
        regex: $scope.calleeFunction.getName()+'[\\s]*\\([\\s\\w\\[\\]\\+\\.\\,]*\\)', 
        token: 'ace_pseudo_call'
    });


    if( angular.isDefined($scope.microtask.reissuedFrom) )
        $scope.funct.updateFunction($scope.reissuedMicrotask.submission);



    //remove the pseudofunction from the code of the function
    $scope.funct.removePseudoFunction( $scope.microtask.pseudoFunctionName );


    $scope.code = $scope.funct.getFullCode();

    $scope.codemirror = null;
    $scope.$on('collectFormData', collectFormData);

    function collectFormData(event, microtaskForm) {
        var error = "";
        
        //if there are error and pseudosegments
        if ( microtaskForm.$invalid){
            $alert({
               title: 'Error!',
               content: 'Fix all errors before submit, if you don\'t know how use the pseudocode',
               type: 'danger',
               show: true,
               duration: 3,
               template: 'microtasks/alert_submit.html',
               container: 'alertcontainer'
            });
        }
        else {

            formData = functionsService.parseFunctionFromAce($scope.data.editor);
            $scope.$emit('submitMicrotask', formData);
        }
    }
}]);

///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteFunctionController', ['$scope', '$rootScope', '$firebase',  'functionsService','FunctionFactory', 'ADTService', '$alert', function($scope, $rootScope, $firebase,  functionsService, FunctionFactory, ADTService, $alert) {
    
    $scope.data = {};
    $scope.data.hasPseudo = false;
    $scope.data.editor = null;
    $scope.$on('collectFormData', collectFormData);


    $scope.dispute = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.dispute.active = ! $scope.dispute.active;
            if( $scope.dispute.active )
                $scope.dispute.text = '';
        }
    };

     if( angular.isDefined($scope.microtask.reissuedFrom) )
         $scope.funct.updateFunction($scope.reissuedMicrotask.submission);

    if ($scope.microtask.promptType == 'DESCRIPTION_CHANGE') {
        var oldCode = $scope.microtask.oldFullDescription.split("\n");
        var newCode = $scope.microtask.newFullDescription.split("\n");
        var diffRes = diff(oldCode, newCode);
        var diffCode = "";
        angular.forEach(diffRes, function(diffRow) {
            if (diffRow[0] == "=") {
                diffCode += diffRow[1].join("\n");
            } else {
                for (var i = 0; i < diffRow[1].length; i++)
                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
            }
            diffCode += "\n";
        });
        $scope.diffCode = diffCode;
    }
    if ($scope.microtask.promptType == 'REMOVE_CALLEE') {
        $scope.callee= functionsService.get($scope.microtask.calleeId);
        $scope.funct.removePseudoFunction( $scope.callee.getName());
    }

 
    
    
    function collectFormData(event, microtaskForm) {
        
        //if there are errors
        if ( microtaskForm.$invalid){
            $alert({
               title: 'Error!',
               content: 'Fix all errors before submit!',
               type: 'danger',
               show: true,
               duration: 3,
               template: 'microtasks/alert_submit.html',
               container: 'alertcontainer'
            });
        }
        else {
    
            formData = functionsService.parseFunctionFromAce($scope.data.editor);

            //add the dispute text to the submit
            if($scope.dispute.active){
                formData.inDispute=true;
                formData.disputeFunctionText=$scope.dispute.text;
            }

            
            $scope.$emit('submitMicrotask', formData);
        }
    };


}]);

////////////////////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
////////////////////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteFunctionDescriptionController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService) {
    // initialization of models
    $scope.model = {};
    $scope.model.description = "";
    $scope.model.returnType = "";
    $scope.model.functionName = "";
    $scope.model.parameters = [];


    $scope.dispute = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.dispute.active = ! $scope.dispute.active;
            if( $scope.dispute.active )
                $scope.dispute.text = '';
        }
    };

    // addParameter and deleteParameter
    $scope.addParameter = function() {
        var parameter = {
            name: '',
            type: '',
            description: '',
        };
        $scope.model.parameters.push(parameter);
    };
    $scope.deleteParameter = function(index) {
        event.preventDefault();
        event.stopPropagation();
        if( $scope.model.parameters.length>1 )
            $scope.model.parameters.splice(index, 1);
    };


    if(angular.isDefined($scope.microtask.reissuedFrom)){
        $scope.model.functionName = $scope.reissuedMicrotask.submission.name;
        $scope.model.description  = $scope.reissuedMicrotask.submission.description;
        $scope.model.returnType   = $scope.reissuedMicrotask.submission.returnType;
        $scope.model.parameters   = $scope.reissuedMicrotask.submission.parameters;
    }
    else{
        //Add the first parameter
        $scope.addParameter();
    }
    //prepare the codemirror Value
    $scope.code = $scope.funct.getFunctionCode();
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        //set all forms dirty to make them red if empty
        $scope.makeDirty(microtaskForm);
        //set the variables
        var error ="";
        var header="";

        //if the form is invalid throw an error
        if (microtaskForm.$invalid) {
            error = 'Fix all errors before submit';
        }
        //else retrieves the data and pass them to jshint to check that all are valid
             //   NOT SURE THAT WE NEED TO LINT THE CODE OF THE DESCRIPTION

               // allFunctionCode = functionsService.getAllDescribedFunctionCode()+ " var debug = null; " ;
               // console.log('function name',$scope.model.functionName);

            //     var functionCode = allFunctionCode + " " + header + "{}";
            //     var lintResult = -1;
            //     // try to run JSHINT or catch and print error to the console
            //     try {
            //         lintResult = JSHINT(functionCode, getJSHintGlobals());
            //     } catch (e) {
            //         console.log("Error in running JSHHint. " + e.name + " " + e.message);
            //     }

            //     if (!lintResult) {
            //         console.log(lintResult);
            //         error="You are using Javascript redserved word, please change them";
            //     }
            // }

        //if all went well submit the result
        if(error!=="") {

            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });

        } else {

            formData = {
                name        : $scope.model.functionName,
                returnType  : $scope.model.returnType,
                parameters  : $scope.model.parameters,
                description : $scope.model.description,
                header      : renderHeader($scope.model.functionName, $scope.model.parameters)
            };

            if($scope.dispute.active){
                formData.inDispute = true;
                formData.disputeFunctionText = $scope.dispute.text;
            }
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);

///////////////////////////////
//  WRITE TEST CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestController', ['$scope', '$rootScope', '$firebase', '$filter', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $filter, $alert,  functionsService, FunctionFactory, ADTService) {
    // initialize testData
    // scope data 
    $scope.disputeFunction = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.disputeTest.text = '';
            $scope.disputeTest.active = false;
            $scope.disputeFunction.active = ! $scope.disputeFunction.active;
            if( $scope.disputeFunction.active )
                $scope.disputeFunction.text = '';

        }
    };
    // scope data
    $scope.disputeTest = {
        active : false,
        text   : '',
        toggle : function(){

            $scope.disputeFunction.text='';
            $scope.disputeFunction.active= false;
            $scope.disputeTest.active = ! $scope.disputeTest.active;
            if( $scope.disputeTest.active )
                $scope.disputeTest.text = '';
        }
    };

    // if microtask.submission and microtask.submission.simpleTestInputs are defined
    // assign test inputs and output to testData, otherwise initialize an empty object
    if( angular.isDefined($scope.test.simpleTestInputs) && angular.isDefined($scope.test.simpleTestOutput) ){

        $scope.testData = {
            inputs: $scope.test.simpleTestInputs,
            output: $scope.test.simpleTestOutput
        } ;

    } else {
        $scope.testData = {
            inputs: [],
            output: ''
        };

    }


    if( angular.isDefined($scope.microtask.reissuedFrom) && angular.isDefined($scope.reissuedMicrotask.submission.simpleTestInputs) ){
        $scope.testData.inputs=$scope.reissuedMicrotask.submission.simpleTestInputs;
        $scope.testData.output=$scope.reissuedMicrotask.submission.simpleTestOutput;
    }

   

    // IF THE PROMPT TYPE IS FUNCTION CHANGED, CALC THE DIFF TO SHOW WITH CODEMIRROR
    if ($scope.microtask.promptType == 'FUNCTION_CHANGED') {
        var oldCode = $scope.microtask.oldFunctionDescription.split("\n");
        var newCode = $scope.microtask.newFunctionDescription.split("\n");
        var diffRes = diff(oldCode, newCode);
        var diffCode = "";
        angular.forEach(diffRes, function(diffRow) {
            if (diffRow[0] == "=") {
                diffCode += diffRow[1].join("\n");
            } else {
                for (var i = 0; i < diffRow[1].length; i++)
                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
            }
            diffCode += "\n";
        });
        $scope.diffCode = diffCode;
    }
    // LOAD THE VERSION OF THE FUNCTION WHEN THE MICROTASK HAS BEEN SPAWNED
    else {
        //load the version of the function with witch the test cases where made
        var functionSync = functionsService.getVersion($scope.microtask.functionID,$scope.microtask.functionVersion);
            functionSync.$loaded().then(function() {
            $scope.funct = new FunctionFactory(functionSync);
        });
    }

    var alertObj = null; // initialize alert obj
    
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        
        $scope.makeDirty(microtaskForm);

        if (microtaskForm.$invalid) {
            if (alertObj !== null) alertObj.destroy(); // avoid multiple alerts
            var error = 'Fix all errors before submit';
            alertObj = $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            // prepare the standerd jSON object
            formData = {
                functionVersion: $scope.funct.version,
                code: '',
                inDispute: false,
                disputeFunctionText :'',
                disputeTestText     : '',
                hasSimpleTest: false,
                simpleTestInputs: [],
                simpleTestOutput: ''
            };
            if( $scope.disputeTest.active ){

                formData.inDispute = true;
                formData.disputeTestText = $scope.disputeTest.text;

            } else if( $scope.disputeFunction.active ) {

                formData.inDispute = true;
                formData.disputeFunctionText = $scope.disputeFunction.text;

            } else {
                // build the test code
                var testCode = 'equal(' + $scope.funct.name + '(';
                angular.forEach($scope.testData.inputs, function(value, key) {
                    testCode += value;
                    testCode += (key != $scope.testData.inputs.length - 1) ? ',' : '';
                });
                testCode += '),' + $scope.testData.output + ',\'' + $scope.test.description + '\');';

                formData.code = testCode;
                formData.simpleTestInputs = $scope.testData.inputs;
                formData.simpleTestOutput = $scope.testData.output;

            }
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });

}]);

//////////////////////////////////
//  WRITE TEST CASES CONTROLLER //
//////////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestCasesController', ['$scope', '$alert',  'TestList', 'functionsService','FunctionFactory', 'ADTService', function($scope, $alert,  TestList, functionsService, FunctionFactory, ADTService) {
    

    // private variables
    var alert = null;

    // scope data 
    $scope.dispute = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.dispute.active = ! $scope.dispute.active;
            if( $scope.dispute.active )
                $scope.dispute.text = '';
        } 
    };

    // if is not a reissued microtask, load the existent test cases
    // otherwise load the test cases from the reissued one
    var reissued = angular.isDefined($scope.microtask.reissuedFrom);
    $scope.model = {
        newTestCase : "",
        testcases   : reissued ? $scope.reissuedMicrotask.submission.testCases 
                               : TestList.getTestCasesByFunctionId($scope.funct.id)
    };

    // scope methods
    $scope.addTestCase    = addTestCase;
    $scope.removeTestCase = removeTestCase;

    // event listeners
    var collectOff = $scope.$on('collectFormData', collectFormData);
    $scope.$on('$destroy',collectOff);


    function addTestCase() {   
        var newTestCase = $scope.model.newTestCase !== undefined ? 
                            $scope.model.newTestCase.replace(/["']/g, "") : '' ;

                            
        if( newTestCase.match(/(\{|\}|\[|\])/g) !== null ) {
            if (alert !== null) 
                alert.destroy();

            alert = $alert({
                title: 'Error!',
                content: 'brackets are not allowed in the test case description!',
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        } else if ( newTestCase !== '' )  {
            
            var found = false;
            angular.forEach($scope.model.testcases,function(testCase,index){
                if( !found && testCase.text == newTestCase )
                    found = true;
            });

            if( !found ) {
                 // push the new test cases
                $scope.model.testcases.push({
                    id      : null,
                    text    : newTestCase,
                    added   : true,
                    deleted : false
                });

                // reset the new test case field
                $scope.model.newTestCase = "";
            } else {
                if (alert !== null) 
                alert.destroy();

                alert = $alert({
                    title: 'Error!',
                    content: 'another test case with the same description exists!',
                    type: 'danger',
                    show: true,
                    duration: 3,
                    template: 'microtasks/alert_submit.html',
                    container: 'alertcontainer'
                });
            }
        }
    }
    
    function removeTestCase(index) {
        // if the testcase was added during this microtask, remove it from the array
        // else set the flag DELETED to true
        if ($scope.model.testcases[index].added === true) 
            $scope.model.testcases.splice(index, 1);
        else $scope.model.testcases[index].deleted = true;
    }

    function collectFormData(event, microtaskForm) {

        // insert the test case in the input box if there is one
        addTestCase();

        // initialize the error
        var error = "";

        if( !$scope.dispute.active && $scope.model.testcases.length === 0 ) 
            error = "Add at least 1 test case";
        else if( $scope.dispute.active && $scope.dispute.text == "" )
            error = 'The report text cannot be empty!';

        // if there is an error 
        if (error !== "") {
            // destroy the previous alert
            if (alert !== null) 
                alert.destroy();

            // build the new alert
            alert = $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        } 
        // if there isn't an error submit the form
        else {
            formData = {
                inDispute         : $scope.dispute.active,
                functionVersion   : $scope.funct.version,
                testCases         : $scope.model.testcases
            };

            if($scope.dispute.active){
                formData.disputeFunctionText = $scope.dispute.text;
            } 
            
            // call microtask submission
            $scope.$emit('submitMicrotask', formData);
        }
    }

}]);

angular
    .module('crowdCode')
    .directive('microtaskPopover', function($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService,FunctionFactory, TestList){
    return {
        
        scope: true,
        controller: function($scope, $element, $attrs, $transclude) {

            var loadData = {
                'WriteFunction': function(news) {

                    if(news.microtask.submission.inDispute)
                        news.funct=functionsService.get(news.microtask.functionID);
                    else
                        news.funct = new FunctionFactory(news.microtask.submission);
                    
                    if (news.microtask.promptType == 'REMOVE_CALLEE')
                        news.callee=functionsService.get(news.microtask.calleeId);

                    if (news.microtask.promptType == 'DESCRIPTION_CHANGE') {
                        oldCode = news.microtask.oldFullDescription.split("\n");
                        newCode = news.microtask.newFullDescription.split("\n");
                        diffRes = diff(oldCode, newCode);
                        diffCode = "";
                        angular.forEach(diffRes, function(diffRow) {
                            if (diffRow[0] == "=") {
                                diffCode += diffRow[1].join("\n");
                            } else {
                                for (var i = 0; i < diffRow[1].length; i++)
                                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
                            }
                            diffCode += "\n";
                        });
                        news.calledDiffCode = diffCode;
                    }

                },

                'WriteTestCases': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },

                'ReuseSearch': function(news) {

                    news.funct = functionsService.get(news.microtask.functionID);
                    if(news.microtask.submission.noFunction===false)
                    news.calleeFunction = functionsService.get(news.microtask.submission.functionId);


                },
                'WriteTest': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },
                'WriteFunctionDescription': function(news) {
                    news.functionDescription = new FunctionFactory(news.microtask.submission).getSignature();
                    news.requestingFunction  = functionsService.get(news.microtask.functionID);
                },
                'WriteCall': function(news) {

                    news.funct = new FunctionFactory(news.microtask.submission);
                    news.calleeFunction = functionsService.get(news.microtask.calleeID);
                },
                'DebugTestFailure': function(news) {
                   news.funct = new FunctionFactory(news.microtask.submission.functionDTO);
                   var reviewTest;
                   news.tests=[];
                   if(news.microtask.submission.disputedTests.length>0){
                        for(var index in news.microtask.submission.disputedTests){
                            reviewTest=TestList.get(news.microtask.submission.disputedTests[index].id);
                            reviewTest.disputeText = news.microtask.submission.disputedTests[index].disputeText;
                            news.tests.push(reviewTest);
                        }
                   }

                },
                'Review': function(news) {

                    news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
                    news.microtask.$loaded().then(function() {

                        loadData[news.microtask.type](news);

                    });
                }

            };

            //Utility to show and hide the popover
            var showPopover = function(popover) {
              popover.$promise.then(popover.show);
            };
            var hidePopover = function(popover) {
              popover.$promise.then(popover.hide);
            };
         

            //
            $scope.showMicrotaskPopover = function(news) {

                if($scope.$parent.popover[news.microtaskKey]===undefined){
                    //Hide all the popover if any is visualized
                    
                    for(var key in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[key]);
                    }
                    $scope.$parent.popover[news.microtaskKey] = $popover($element, {template : "newsfeed/news_popover.html", placement:"right-bottom", trigger : "manual", autoClose: "false", container: "body"   });
                    $scope.$parent.popover[news.microtaskKey].$scope.n=news;
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                    //load the data
                    news.microtask = microtasksService.get(news.microtaskKey);
                    news.microtask.$loaded().then(function() {
                        //if the microtask is a review
                        if (news.microtask.type == "Review") {
                            news.isReview = true;
                            console.log(news.microtask);
                            news.qualityScore = news.microtask.submission.qualityScore;
                            news.reviewText = news.microtask.submission.reviewText;
                        } else if (angular.isDefined(news.microtask.review)) {

                            news.qualityScore = news.microtask.review.qualityScore;
                            news.reviewText = news.microtask.review.reviewText;
                        }
                        loadData[news.microtask.type](news);
                    });

                } else if($scope.$parent.popover[news.microtaskKey].$isShown === false){

                    //Hide all the popover if any is visualized
                    for(var index in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[index]);
                    }
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                }


            };
        },
          link: function($scope, iElm, iAttrs, controller) {

        }
    };
});
angular
    .module('crowdCode')
    .directive('news', news);

function news($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService) {
    return {
        restrict: 'E',
        templateUrl: 'newsfeed/news_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        controller: function($scope, $element) {
            $scope.popover=[];
           
            // create the reference and the sync
            var ref = new Firebase($rootScope.firebaseURL + '/workers/' + $rootScope.workerId + '/newsfeed');
            var sync = $firebase(ref);

            // bind the array to scope.leaders
            $scope.news = sync.$asArray();
        }
    };
}

// create the test list
angular
    .module('crowdCode')
    .factory("TestList", ['$firebase','firebaseUrl','TestFactory', function($firebase, firebaseUrl, TestFactory) {
	var ref = new Firebase(firebaseUrl+'/artifacts/tests');
	return $firebase(ref, {arrayFactory: "TestFactory"}).$asArray();
}]);


angular
    .module('crowdCode')
    .factory("TestFactory",['$FirebaseArray', '$firebaseUtils', '$firebase', 'Test', 'firebaseUrl', function( $FirebaseArray, $firebaseUtils, $firebase, Test, firebaseUrl){

	var lastId = 0;
	var objectsList = {};
	var count = 0;

	return $FirebaseArray.$extendFactory({

		// override $$added method of AngularFire FirebaseArray factory
		$$added: function(snap, prevChild) {
			var i = this.$indexFor(snap.name());
			if( i === -1 ) {

				var rec = snap.val();
				if( !angular.isObject(rec) ) {
					rec = { $value: rec };
				}
				rec.$id = snap.name();
				rec.$priority = snap.getPriority();
				$firebaseUtils.applyDefaults(rec, this.$$defaults);

				this._process('child_added', rec, prevChild);

				// add the object to our list
				objectsList[ snap.name() ] = new Test( snap.val() );
				if( parseInt(snap.name()) > lastId)
					lastId = parseInt(snap.name());

				count++;
			}
		},

		// override $$updated method of AngularFire FirebaseArray factory
		$$updated: function(snap) {
			var rec = this.$getRecord( snap.name() );
			console.log('updating test ',rec,(new Date()).getTime());
			if( angular.isObject(rec) ) {
				// apply changes to the record
				var changed = $firebaseUtils.updateRec(rec, snap);
				$firebaseUtils.applyDefaults(rec, this.$$defaults);
				if( changed ) {
					this._process('child_changed', rec);

					// UPDATE THE OBJECT IN OUR LIST
					objectsList[ snap.name() ].update( snap.val() );
				}
			}
		},

		// retrieve the test with id = testId
		get: function(testId){
			if( objectsList.hasOwnProperty(testId) ){
				return objectsList[testId];
			}
			return null;
		},

		// retrieve all the tests
		getAll: function(){
			return objectsList;
		},
		getImplementedByFunction: function(funct){
			return this.getImplementedByFunctionId(funct.id);
		},
		// retrieve all the tests belonging to
		// the function with id = functionId
		getImplementedByFunctionId: function(functionId){
			var returnList = [];
			console.log('searching implemented for fun'+functionId);
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionId() == functionId && test.isImplemented()){
					returnList.push(test);
				}	
			});

			return returnList;
		},
		getImplementedIdsByFunctionId: function(functionId){
			var returnList = [];
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionId() == functionId && test.isImplemented()){
					returnList.push( test.getId() );
				}	
			});
			return returnList;
		},
		// retrieve all the tests belonging to
		// the function with name = functionName
		getImplementedByFunctionName: function(functionName){
			var returnList = [];
			angular.forEach( objectsList, function(test, key){
				if( test.getFunctionName() == functionName  && test.isImplemented())
					returnList.push(test);
			});
			return returnList;
		},
		// retrieve all the tests belonging to
		// the function funct
		getByFunction: function(funct){
			this.getByFunctionId(funct.id);
		},

		// retrieve all the tests belonging to
		// the function with id = functionId
		getByFunctionId: function(functionId){
			var returnList = [];
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionId() == functionId )
					returnList.push(test);
			});

			return returnList;
		},
		// retrieve all the tests belonging to
		// the function with name = functionName
		getByFunctionName: function(functionName){
			var returnList = [];
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionName() == functionName )
					returnList.push(test);
			});
			return returnList;
		},

		// search a test belonging for the function functionName
		// and inputsValue
		search: function(functionName,inputsValue){
			// if one of the parameters is undefined, return null
			if(inputsValue === undefined || functionName === undefined)
				return null;

			// filter objectsList
			// return null if not found
			var foundTest = null;
			var found     = false;
			angular.forEach( objectsList, function( test, key){
				if( !found && test.getFunctionName() == functionName && 
				    test.hasSimpleTest() && 
					angular.toJson(test.getSimpleTest().inputs.toString()) == angular.toJson(inputsValue.toString()) ){
					found = true;
					foundTest = test;
				}
			});
			return foundTest;
		},

		// add a test to the factory
		// 1) search if already exists - there can't be two tests for the same function and with the same inputs
        // add to the list of FirebaseArray
		set: function(test){ 
			var rec = test.toJSON();
				// console.log(rec);
			var ref = new Firebase(firebaseUrl+'/artifacts/tests/'+test.getId());
			ref.set(rec);
		},


		searchOrBuild: function(functionId, functionName, inputsValue, outputValue){
			if( this.search(functionName, inputsValue) === null ) {
				test = new Test();

				test.setFunctionId( functionId );
			    test.setFunctionName( functionName );
				test.setDescription("auto generated for debug purposes");
			 	test.setSimpleTest(inputsValue,outputValue);
				test.buildCode();

				return test.rec;
			}
			return true;
		},

		// searchAndAdd: function(functionId, functionName, inputsValue, outputValue){
		// 	var test = this.search(functionName, inputsValue);

		// 	if( test === null ){
		// 		test = new Test();
		// 		test.setId(++lastId);

		// 		test.setImplemented(true);
		// 		test.setMessageType("Test in firebase");
		// 		test.setFunctionId( functionId );
		// 	    test.setFunctionName( functionName );
		// 	 	test.setSimpleTest(inputsValue,outputValue);
		// 		test.setDescription("auto generated for test purposes");
		// 		test.buildCode();
		// 		this.set(test);
		// 	}
		// 	else console.log("TEST FOUND");
		// },

		buildStubsByFunctionName: function(functionName){
			var tests = this.getByFunctionName(functionName);
			var stubs = {};

			angular.forEach(tests,function(test){
				if( test.hasSimpleTest() ){

					// the inputs in firebase are already stringified
					// so the key is just a copy of the string value
					// the output should be parsed instead!
					var inputsKey = "["+test.rec.simpleTestInputs+"]";

					stubs[ inputsKey ] = { 
						  inputs: test.rec.simpleTestInputs, 
					      output: test.rec.simpleTestOutput == "" ? "" : JSON.parse(test.rec.simpleTestOutput)
					};

				}
			});

			return stubs;
		},

		getTestCasesByFunctionId: function( functionId ){

		    var tests = this.getByFunctionId(functionId);
		    var testCases = [];

		    // for each test push the test case entry in the test cases list
		    angular.forEach(tests, function(test, index) {

		        testCases.push( test.getTestCase() );
		    });

		    return testCases;
		},

		getCount: function(){
			return count;
		}

	});
}]);

angular
    .module('crowdCode')
    .factory("Test", function ($FirebaseArray) {
	function Test(rec){
		if( rec === undefined )
			this.rec = {};
		else
			this.rec = rec;
	}

	Test.prototype = {
		getId: function(){
			return this.rec.id;
		},

		setId: function(id){
			this.rec.id  = id;
		},

		update: function(rec){
			this.rec = rec;
		},

		isImplemented: function(){
			return this.rec.isImplemented;
		},

		setImplemented: function(value){
			this.rec.isImplemented = value;
		},

		setMessageType: function(messageType){
			this.rec.messageType = messageType;
		},

		toJSON: function(){
			return this.rec;
		},

		getFunctionId: function(){
			return this.rec.functionID;
		},

		setFunctionId: function(functionId){
			this.rec.functionID = functionId;
		},

		getFunctionName: function(){
			return this.rec.functionName;
		},

		setFunctionName: function(functionName){
			this.rec.functionName = functionName;
		},

		getDescription: function(){
			return this.rec.description;
		},

		setDescription: function(description){
			this.rec.description = description;
		},


		getReadOnly: function(){
			return this.rec.readOnly;
		},

		setReadOnly: function(readOnly){
			this.rec.readOnly = readOnly;
		},

		hasSimpleTest: function(){
			if( this.rec.hasOwnProperty('simpleTestInputs') && this.rec.hasOwnProperty('simpleTestOutput') )
				return true;
			return false;
		},

		getSimpleTest: function(){
			if( !this.hasSimpleTest() )
				return {};

			return { 
				inputs: this.rec.simpleTestInputs, 
				output: this.rec.simpleTestOutput 
			}
		},

		getTestCase: function(){
			return {
	            id       : this.getId(),
	            text     : this.getDescription(),
	            readOnly : this.getReadOnly(),
	            added    : false,
	            deleted  : false,
	        };
		},

		setSimpleTest: function(inputs,output){
			angular.forEach(inputs,function(input){
				input = '"'+JSON.stringify(input).replace(/"/g, '\"')+'"';
			})
			this.rec.simpleTestInputs = inputs;
			this.rec.simpleTestOutput = output;
			this.rec.hasSimpleTest = true;
		},

		getCode: function(){
			return this.rec.code;
		},
		setCode: function(code){
			this.rec.code = code;
		},

		buildCode: function(){

			if( ! this.rec.isImplemented )
				return '';
			
			var testCode = 'equal(' + this.rec.functionName + '(';
			var length   = this.rec.simpleTestInputs.length;

            angular.forEach(this.rec.simpleTestInputs, function(value, key) {
                testCode += value;
                testCode += (key != length - 1) ? ',' : '';
            });
            testCode += '),' + this.rec.simpleTestOutput + ',\'' + this.rec.description + '\');';
			// console.log('test code for '+this.rec.description+ ':'+testCode);
			this.rec.code = testCode;
			return testCode;
		},

		getDisputeDTO: function(){
			return {
				id: this.rec.id,
				disputeText: this.rec.disputeTestText
			};
		}
	};

	return Test;
});



angular
    .module('crowdCode')
    .directive('tutorialManager', [ '$rootScope', '$compile', '$timeout', '$firebase', 'firebaseUrl','workerId', function($rootScope, $compile, $timeout, $firebase,firebaseUrl,workerId) {
    var fbRef = new Firebase(firebaseURL);
    var tutorialsOnRef = fbRef.child('/status/settings/tutorials');
    var userTutorials  = $firebase( fbRef.child('/workers/' + workerId + '/completedTutorials' ) ).$asObject();

    var queue = [];
    var running = false;

    return {
        restrict: 'E',
        scope: {},
        link: function($scope, $element, attrs) {
            tutorialsOnRef.once('value',function( snap ){
                if( snap.val() == true ){ // if tutorials enabled

                    // load the tutorial user settings
                    userTutorials.$loaded().then(function(){
                        // if it's the first time the user
                        // executes a tutorial, initialize 
                        // the object of the completed tutorials
                        if( userTutorials.$value == null ){
                            userTutorials.$value = { 'a': true };
                            userTutorials.$save();
                        }

                        // listen on the event 'run-tutorial'
                        // and start the tutorial with tutorialId
                        $rootScope.$on('run-tutorial',function( event, tutorialId, force, onFinish ){
                           // console.log('tutorial: '+tutorialId);
                            if( force || userTutorials[tutorialId] === undefined ){
                                // if another tutorial is running
                                // enqueue the new one
                                if( running ){
                                    queue.push({ id: tutorialId, onFinish: onFinish });
                                }
                                // otherwise run it
                                else 
                                    $scope.runTutorial(tutorialId,onFinish);
                            } else {
                                $scope.$emit('tutorial-finished');
                            }
                        });

                        $scope.runTutorial = function(id,onFinish){

                            // set the running flag
                            running = true;

                            // load the tutorial directive
                            var templateUrl = 'tutorials/'+id+'.html';
                            //console.log('tutorial template: '+templateUrl);
                            $scope.tutorialId = id;
                            $element.html( '<tutorial template-url="'+templateUrl+'"></tutorial>' );
                            $compile($element.contents())($scope);

                            // once it's finished 
                            var removeFinishListener = $scope.$on('tutorial-finished',function(){
                                // reset the element content
                                $element.html('');

                                // reset the running flag
                                running = false;

                                // execute the onFinish callback if any
                                if( onFinish != undefined ) 
                                     onFinish.apply();

                                userTutorials[id] = true;
                                userTutorials.$save();

                                if( queue.length > 0 ){
                                    // load the tutorial
                                    var tut = queue.pop();

                                    $timeout(function(){
                                        $scope.runTutorial(tut.id,tut.onFinish);
                                    }, 300);
                                }

                                removeFinishListener();
                            });
                        };

                    });



                }
            });
            
        }
    }
}]);

angular
    .module('crowdCode')
    .directive('tutorial', function($rootScope,$compile) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: function(elem,attrs) {
           return attrs.templateUrl;
        },
        link: function($scope, $element, $attrs) {

            $scope.title = $scope.tutorialId;

            $scope.currentStep = 0;
            $scope.totSteps = $element.find('step').length;

            var btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">next</a>';
            var btnCloseHtml = '<a href="#" class="btn-close" ng-click="close()">close</a>';

            var $tutorialContainer;
            var $overlay;
            var $content;

            var onShow = '';
            var onHide = '';

        
            $scope.start = function() {

                $tutorialContainer = $('<div class="tutorial-container"></div>');

                // create highlight layer
                $overlay = $('<div class="overlay"></div>');
                $tutorialContainer.append($overlay);

                // create the content layer 
                $content = $('<div class="content"></div>');
                $content.fadeOut();
                $tutorialContainer.append($content);

                // compile the element with $scope
                $compile($tutorialContainer.contents())($scope);

                // append the element to the body
                $('body').append($tutorialContainer);

                // show the overlay 
                $overlay.animate({opacity: 1}, 50);

                // reset the current step
                $scope.currentStep = 0;

                // visualize the first step
                $scope.showNext();
            };

            var prevOnHide = undefined;

            $scope.close = function(){
                $scope.destroy();
                $scope.$emit('tutorial-finished');
            }

            $scope.showNext = function() {
               

                // increment current Step (first step is = 1)
                $scope.currentStep += 1;
                
                // if the tutorial is finished, destroy it
                if ($scope.currentStep > $scope.totSteps) {

                    $scope.$emit('tutorial-finished');
                    $scope.currentStep = 0;
                    $scope.destroy();
                    return;
                }

                btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">'+( $scope.currentStep == $scope.totSteps ? 'finish' : 'next' )+'</a>';

                // retrieve the current step DOM-element
                // and the commands to apply on show/hide of the step content
                var $step  = $element.find('step:nth-child(' + $scope.currentStep + ')');
       
                var onShow = $step.attr('on-show') ;
                var onHide = $step.attr('on-hide') ;

                var contentStyle = $step.attr('style');
                var contentHtml  = $step.html();
                var highlight    = $step.attr('highlight');


                if( highlight !== undefined ){

                    var $highlightTag = $(document).find('#'+highlight)
                    var placement = $step.attr('placement');

                    if( placement === undefined )
                        throw "a placement should be defined!";

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    // calculate the hightlight css
                    var highlightCss = {
                        top    : $highlightTag.offset().top   ,
                        left   : $highlightTag.offset().left  ,
                        width  : $highlightTag.outerWidth()   ,
                        height : $highlightTag.outerHeight()
                    };

                    // calculate the content css
                    var contentCss = {
                        top  : highlightCss.top,
                        left : highlightCss.left
                    };

                    if( prevOnHide !== undefined && prevOnHide.length > 0 ) 
                        $scope.$eval(prevOnHide);

                    $content.fadeOut(400,function(){


                        $content.html(contentHtml + '<br/>' +btnNextHtml+btnCloseHtml);
                        $compile($content.contents())($scope);

                        $content.attr('style',contentStyle);

                        var width  = $content.outerWidth();
                        var height = $content.outerHeight();
                        var margin = 20;

                        if( placement == 'left' )        contentCss.left += -width - margin; 
                        else if( placement == 'right' )  contentCss.left += $highlightTag.outerWidth() +margin ; 
                        else if( placement == 'top' )    contentCss.top  += -height -margin ;
                        else if( placement == 'bottom' ) contentCss.top  += $highlightTag.outerHeight() +margin ;
                        else if( placement == 'top-center' )  {
                            contentCss.top  += -height -margin ;
                            if( $highlightTag.outerWidth() > width )
                                contentCss.left += ($highlightTag.outerWidth()-width)/2;
                            else
                                contentCss.left += -(width-$highlightTag.outerWidth())/2;

                        }  
                        else if( placement == 'right-center' )  {
                            contentCss.left += $highlightTag.outerWidth() +margin ;
                            if( $highlightTag.outerHeight() > height )
                                contentCss.top += ($highlightTag.outerHeight()-height)/2;
                            else
                                contentCss.top += -(height-$highlightTag.outerHeight())/2;

                        }  

                        $content.css(contentCss);
                        console.log(contentCss);

                        $overlay.animate(highlightCss, 400, function(){
                            // $content.animate(contentCss, 200 ,function(){
                                $content.fadeIn(300);
                            // });
                        });
                    });
                    
                } else {

                    
                    // contentCss.width = '40%';

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    $content.fadeOut(300,function(){
                        $content.html(contentHtml + '<br/>' +btnNextHtml+btnCloseHtml);
                        $compile($content.contents())($scope);

                        var contentCss = {};
                        contentCss.top   = ($('body').outerHeight()-$content.outerHeight())/2;
                        contentCss.left  = ($('body').outerWidth()-$content.outerWidth())/2;

                        $content.css(contentCss);
                        $overlay.animate({
                            width: '0px',
                            height: '0px',
                            top: '-50px',
                            left: '-50px'
                        },200,function(){
                            $content.fadeIn(300);
                        });

                    });
                    
                }
                

                prevOnHide = onHide;

            };

            $scope.destroy = function() {

                // remove the tutorial from the document
                $overlay.remove();
                $content.remove();
                $tutorialContainer.remove();
                $overlay = null;
                $content = null;
                $tutorialContainer = null;
                $scope.currentStep = 0;

            };

            $scope.start();
            
        }
    };
});





angular
    .module('crowdCode')
    .factory("avatarFactory",[ '$firebase','firebaseUrl', function( $firebase , firebaseUrl ){

	var loaded = {};

	var factory = {};
	factory.get = function(workerId){
		if( workerId === undefined ){
			console.warn('worker id not defined');
			return -1;
		}
		if( workerId == 'admin' ){
			return {
				$value: '/img/avatar_gallery/admin.png'
			};
		}

		if(loaded.hasOwnProperty(workerId)){
			return loaded[workerId];
		} else {
			pictureSync = $firebase(new Firebase(firebaseURL + '/workers/'+workerId+'/avatarUrl'));
			loaded[workerId] = pictureSync.$asObject();
			loaded[workerId].$loaded().then(function(){
				return loaded[workerId];
			});
		}
	};

	return factory;
}]);
////////////////////
// USER SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('userService', ['$window','$rootScope','$firebase','$timeout','$interval','$http','TestList','functionsService','TestRunnerFactory', function($window,$rootScope,$firebase,$timeout,$interval,$http,TestList,functionsService,TestRunnerFactory) {
    var user = {};

 	// retrieve the firebase references

 	var fbRef = new Firebase(firebaseURL);

	var userProfile    = fbRef.child('/workers/' + workerId);

	var isConnected    = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var offsetRef 	   = new Firebase("https://crowdcode.firebaseio.com/.info/serverTimeOffset");
	
	var userRef        = fbRef.child('/status/loggedInWorkers/' + workerId);
	var logoutRef      = fbRef.child('/status/loggedOutWorkers/'+ workerId);

	var userFetchTime  = $firebase( fbRef.child('/workers/' + workerId + '/fetch' ) );

	var updateLogInTime=function(){
		userRef.setWithPriority({connected:true,name:workerHandle,timeStamp:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
	};
	var offset;
	offsetRef.on("value", function(snap) {
	  offset = snap.val();
	});


	// when firebase is connected
	isConnected.on('value', function(snapshot) {
	  if (snapshot.val()) {
	  	// update user reference
	  	updateLogInTime();
	  	$interval(updateLogInTime,10000);

	    // on disconnect, set false to connection status
	    logoutRef.onDisconnect().set({workerId: workerId, timeStamp:Firebase.ServerValue.TIMESTAMP});
	    logoutRef.set(null);
	  }
	});


	user.data = $firebase(userProfile).$asObject();
	user.fetch= userFetchTime.$asObject();
	//user.fetchTime = $firebase(userProfile).$asObject();

	user.data.$loaded().then(function(){
		if( user.data.avatarUrl === null || user.data.avatarUrl === undefined ){
			user.data.avatarUrl = '/img/avatar_gallery/avatar1.png';
			user.data.$save().then(function(){});
		}
		user.data.workerHandle = workerHandle;
		user.data.$save();
	});
	user.assignedMicrotaskKey = null;

	user.getFetchTime = function(){
		return user.fetch;
	};

	user.setFirstFetchTime = function (){
		user.fetch.time=new Date().getTime();
		user.fetch.$save();

	};
	user.setAvatarUrl = function(url){
		user.data.avatarUrl = url;
		user.data.$save().then(function(){
			console.log('set avatar url: '+url);
		});
	};

	user.getAvatarUrl = function(){
		return user.data.pictureUrl || '';
	};

	// distributed test work
    user.listenForJobs = function(){
		// worker

		var queueRef = new Firebase($rootScope.firebaseURL+ "/status/testJobQueue/");
		new DistributedWorker( $rootScope.workerId, queueRef, function(jobData, whenFinished) {
			console.log('Receiving job ',jobData);

			var jobRef = queueRef.child('/'+jobData.functionId);
			//console.log(jobRef,jobData);
			jobRef.onDisconnect().set(jobData);

			var implementedIdsJob    = jobData.implementedIds.split(',');
			var implementedIdsClient = TestList.getImplementedIdsByFunctionId( jobData.functionId );
			var functionClient = functionsService.get( jobData.functionId );
			var unsynced = false;

			// CHECK THE SYNC OF THE IMPLEMENTED TESTS
			if( implementedIdsJob.length != implementedIdsClient.length ){
				unsynced = true;
			} else {
				for( var v in implementedIdsJob ){
					if( implementedIdsClient.indexOf( parseFloat(implementedIdsJob[v]) ) == -1 ){
						unsynced = true;
					}
				}
			}

			// CHECK THE SYNC OF THE FUNCTION VERSION
			if( !unsynced && functionClient.version != jobData.functionVersion ){
				unsynced = true;
			}
			//if this job has be done more than 20 times force unsync to false so that the test can be executed
			if( parseInt(jobData.bounceCounter) > 20) {
				unsynced = false;
				console.log(parseInt(jobData.bounceCounter));
			}

			// if some of the data is out of sync
			// put back the job into the queue
			if( unsynced){
				console.log('REBOUNCING');
				$timeout(function(){
					jobData.bounceCounter = parseInt(jobData.bounceCounter) + 1;
					jobRef.set( jobData );
					jobRef.onDisconnect().cancel();
					whenFinished();
				},500);
			} else {
				console.log('running from user service');
				var testRunner = new TestRunnerFactory.instance({submitToServer: true});
				testRunner.setTestedFunction( jobData.functionId );
				try {
					testRunner.runTests();
					testRunner.onTestsFinish(function(){
						console.log('------- tests finished received');
						jobRef.onDisconnect().cancel();
						whenFinished();
					});
				} catch(e){
					console.log('Exception in the TestRunner',e.stack);
					jobRef.set( jobData );
					jobRef.onDisconnect().cancel();
					whenFinished();
				}
			}
		});
	};

	// distributed worker logout
	// due to sincronization problem wait 5 seconds, after check that the user is not logged any more
	// checking that is null the value i the loggedIn worker
	// and then send the logout command to the server
	// distributed logout work
    user.listenForLogoutWorker = function(){
    	var logoutQueue     = new Firebase( firebaseURL + '/status/loggedOutWorkers/');

		new DistributedWorker($rootScope.workerId,logoutQueue, function(jobData, whenFinished) {

			//retrieves the reference to the worker to log out
			var logoutWorker = logoutQueue.child('/'+jobData.workerId);
			//if a disconnection occures during the process reeset the element in the queue
			logoutWorker.onDisconnect().set(jobData);

			var timeoutCallBack = function(){
				//time of the client plus the timezone offset given by firebase
				var clientTime = new Date().getTime() + offset;
				//retrieves the information of the login field
				var userLoginRef     = new Firebase( firebaseURL + '/status/loggedInWorkers/' + jobData.workerId );

				userLoginRef.once("value", function(userLogin) {

					//if the user doesn't uddate the timer for more than 30 seconds than log it out
				  	if(userLogin.val()===null || clientTime - userLogin.val().timeStamp > 30000){
				  		$http.post('/' + $rootScope.projectId + '/logout?workerid=' + jobData.workerId)
					  		.success(function(data, status, headers, config) {
					  			console.log("logged out seccessfully");
					  			userLoginRef.remove();
					  			$interval.cancel(interval);
					  			logoutWorker.onDisconnect().cancel();
					  			whenFinished();
					  		});
					 //if the timestamp of the login is more than the timesatmp of the logout means that the user logged in again
					 //so cancel the work
					} else if(userLogin.val()!==null && userLogin.val().timeStamp - jobData.timeStamp > 1000)
					{
						$interval.cancel(interval);
						logoutWorker.onDisconnect().cancel();
						whenFinished();
					}
				});

			};

			var interval = $interval(timeoutCallBack,10000);
		});
	};

    return user;
}]);


angular
    .module('crowdCode')
    .controller('UserProfileController', ['$scope', '$rootScope', '$timeout', 'fileUpload','userService', function($scope, $rootScope, $timeout, fileUpload, userService) {

	$scope.userData = userService.data;

	$scope.galleryPath = '/img/avatar_gallery/';

	$scope.uploadedAvatar  = null;
	$scope.selectedAvatar = -1;

	$scope.selectAvatar = function(number){
		////console.log('selecting avatar '+number);
		$scope.selectedAvatar = number;
	};

	$scope.saveAvatar = function() {
		////console.log('uploadedImage',$scope.uploadedAvatar);
		if( $scope.uploadedAvatar !== null){
			var file = $scope.uploadedAvatar;
			var uploadUrl = "/user/pictureChange";

			fileUpload.uploadFileToUrl(file, uploadUrl);

			$timeout(function() {
				userService.setAvatarUrl('/user/picture?userId=' + $rootScope.workerId + '&t=' + (new Date().getTime()));
			}, 500);
		} else if( $scope.selectedAvatar != -1 ){
			userService.setAvatarUrl($scope.galleryPath+'avatar'+$scope.selectedAvatar+'.png');
		}

	};


}]);

angular
    .module('crowdCode')
    .directive('aceEditJs', [ '$sce', 'functionsService', function($sce, functionsService) {
   
    var editor = null;
    var markers = [];
    return {
        restrict: 'EA',

        templateUrl: 'widgets/ace_edit_js.html',
        scope: {
            editor           : '=',
            functionData     : '=function', // the firebase function object extended in FunctionFactory
            annotations      : '=', // the array of gutter annottations
            markers          : '=', // array of { regex: '', token: '' }
            updateIf         : '=updateIf', // condition when to refresh the editor
            hasPseudo        : '='
        },

        controller: function($scope,$element){
            
            $scope.code = $scope.functionData.getFullCode(); 

            $scope.trustHtml = function (unsafeHtml){
                return $sce.trustAsHtml(unsafeHtml);
            };

        	$scope.aceLoaded = function(_editor) {


                $scope.editor = editor = _editor;

                $element.on('focus',function(){_editor.focus();});

        		var options = {};
                var sessionOptions = { useWorker: false };
                var rendererOptions = {
                    showGutter: true,
                    showFoldWidgets: false
                };

                _editor.setOptions(options);
                _editor.session.setOptions(sessionOptions);
                _editor.renderer.setOptions(rendererOptions);

                _editor.on('change',onChange);
                _editor.on('click',onClick);

                // $scope.$watch('updateIf',updateIf);
                $scope.$watch('annotations', updateAnnotations);

                $scope.$watch('markers', updateMarkers);

                function onChange(e){
                    var code = _editor.getValue();
                    var ast = null
                    try{
                        ast = esprima.parse( code, {loc: true}); 
                    } catch(e) { /*console.log(e.stack); */ast = null };

                    if( ast !== null ){
                        if( $scope.hasPseudo !== undefined ) 
                            $scope.hasPseudo = code.search('//#') > -1  || ast.body.length > 1;
                        
                        if( $scope.functionData.readOnly )
                            readOnlyFunctionDescription( ast);
                    }
                    
                    redrawMarkers(markers);
                }

                function onClick(e){
                    var pos = e.$pos;

                    // for each marker check if the click position
                    // is inside on one of the highlighted ranges
                    // and if defined, execute the on click action
                    for( var m in $scope.markers ){
                        var marker = $scope.markers[m];

                        if( marker.onClick !== undefined ){
                            for( var r in marker.ranges ){
                                if( marker.ranges[r].comparePoint(pos) == 0) {

                                    marker.onClick.call();
                                }
                            }
                        } 
                    }
                }

                function updateIf(value){
                    if( value ){
                        _editor.resize();
                        _editor.renderer.updateFull();
                        _editor.scrollPageDown();
                    }
                }

                function updateAnnotations(value){
                    if( value !== undefined ){
                        _editor.session.clearAnnotations( );
                        _editor.session.setAnnotations( value );
                    }
                }

                function updateMarkers(value){
                    if( value === undefined ) value = [];
                    var pseudoMarker = {
                        regex: '//#(.*)',
                        token: 'ace_pseudo_code'
                    };
                    markers = value;
                    markers.push(pseudoMarker);
                    redrawMarkers(markers);
                }
                
			};

        }
    };

    function readOnlyFunctionDescription(ast){
        if( ast.body[0] === undefined )
            return; 
        
        var intersects = function(range){ return editor.getSelectionRange().intersects(range); };
        
        var start = ast.body[0].body.loc.start;
        var Range = ace.require("ace/range").Range;
        var range = new Range( 0, 0, start.line-1, start.column+1);
        editor.keyBinding.setKeyboardHandler({
            handleKeyboard : function(editor, hash, keyString, keyCode, event) {
                // if in the readonly range, allow only arrow keys
                if (intersects(range)) { 
                    if ( ['up','down','left','right'].indexOf(keyString) > -1 ){
                        return false;
                    }
                    return {command:"null", passEvent:false}; 
                }
            }
        });
    }

    function redrawMarkers(markers){

        var session = editor.session;
        var Range = ace.require("ace/range").Range;
        var Search = ace.require("ace/search").Search;

        // remove all the previous markers
        var oldMarkers = session.getMarkers(false);
        for( var om in oldMarkers ){
            session.removeMarker( oldMarkers[om].id );
        }


        // add the new markers

        var search = new Search();
        for( var m in markers ){
            var marker = markers[m];
            search.set({
                needle: new RegExp( marker.regex ),
                regExp: true
            });
            marker.ranges = search.findAll(session);
            for( var r in marker.ranges ){
                session.addMarker( marker.ranges[r], marker.token , "text", false);
            }
        }
    }

    /** done in validation by jshint **/
    function countStatements(ast){
        // var count = 0;
        // traverse(ast, function (node){
        //     if( node.type !== undefined ){
        //         console.log(node.type);
        //         if( node.type.search('Statement') > -1 || ['VariableDeclaration'].indexOf(node.type) > -1 )
        //             count ++;
        //     }
        // });

        // return count;
    }

}]);



// define("DynamicHighlightRules", [], function(require, exports, module) {
//     "use strict";
//     var oop = require("ace/lib/oop");
//     var JavaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
//     var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

//     var DynamicHighlightRules = function() {
       
//        var newRules = {
//             "start" : [
//                 {
//                     token: 'call', // String, Array, or Function: the CSS token to apply
//                     regex: 'segments', // String or RegExp: the regexp to match,
//                     next: 'start'
//                 }
//             ]
//         };
//         this.$rules = newRules;//new TextHighlightRules().getRules();
//         // this.addRules(newRules,'call-'); 
//     }

//     oop.inherits(DynamicHighlightRules, TextHighlightRules);
//     exports.DynamicHighlightRules = DynamicHighlightRules;
// });



angular
    .module('crowdCode')
    .directive('aceEditJson', function() {
    var stringified = false;

    return {
        restrict: 'EA',

        template:'<div class="ace_editor json-editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\', showGutter: true, useWrapMode : true, showLineNumbers : false }" ng-model="stringValue" ></div> ',
        scope: {
            focusIf   : "=",
            minLines  : "=",
            tabindex  : "@",
            paramType : "@"
        },
        require: "ngModel",

        link: function ( scope, element, attrs, ngModel ) {
            if( ngModel == undefined ) 
                console.log("NG MODEL NOT DEFINED");
            scope.stringValue = 4;

            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){


                if( ngModel.$viewValue === "") 
                    scope.stringValue = "";
                else {
                    try{
                        scope.stringValue = angular.toJson(angular.fromJson (ngModel.$viewValue),true);
                    } catch(e){
                        scope.stringValue = ngModel.$viewValue;
                    }
                }


            };

            // update the ngModel.$viewValue when the UI changes 
            scope.$watch('stringValue', function() {
                ngModel.$setViewValue( scope.stringValue );
                
            });

        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {

        		var options = {
		    	   maxLines: Infinity
		    	};
                
                $element.on('focus',function(){
                    _editor.focus();
                });

                if( $scope.hasOwnProperty('tabindex') && $scope.tabindex ){
                    $element.find('.ace_text-input').attr('tabindex', $scope.tabindex);
                }

                if( $scope.hasOwnProperty('focusIf') && $scope.focusIf ){
                    _editor.focus();
                }

                if( $scope.hasOwnProperty('minLines') && $scope.minLines ){
                   options.minLines = $scope.minLines;
                }

                // _editor.getSession().on('change', function(e) {
                //     console.log('event change:', e.data);
                    
                // });

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');
			};
        }
    };
});
angular
    .module('crowdCode')
    .directive('aceReadJs',function($compile,functionsService) {

    return {
        restrict: 'EA',
        replace: true,
        template: '<div class="ace-editor js-reader" ui-ace="{ onLoad : aceLoaded, mode : mode, theme: theme, showGutter: false, useWrapMode : true}" readonly="true" ng-model="code"></div>',
        scope: {
            code: '=',
            mode: '@',
            highlight: '=',
        },
        controller: function($scope,$element){ 
            
            if($scope.mode===undefined){
                $scope.mode='javascript';
                $scope.theme='xcode';
            }
            else
                $scope.theme='github';   


            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });
                var marker = [];
                _editor.on('change',function(){
                    if( $scope.highlight !== undefined ){
                        angular.forEach($scope.highlight,function(val){
                            if( marker[val.needle] !== undefined ){
                                _editor.getSession().removeMarker(marker[val.needle]);
                                marker[val.needle] == undefined;
                            }
                            var Range = ace.require("ace/range").Range;

                            var conf   = { regex: val.regex || false };
                            var needle = conf.regex ? new RegExp(val.needle) : val.needle;
                            var range = _editor.find(needle,conf);
                           // console.log('Needle',val.needle,range);
                            if( range !== undefined ){
                                marker[val.needle] = _editor.getSession().addMarker(range,'ace_pseudo_call','text',true);
                                // console.log('added marker for  '+val.needle, range, marker);
                               // console.log(_editor.getSession().getMarkers());
                            }
                            
                        });
                    }
                });
                
            };
        }
    };
});




angular
    .module('crowdCode')
    .directive('aceReadJson', function() {



    return {
        restrict: 'EA',
        template: '<pre class="json" ng-bind-html="prettyJson"></pre>\n<span ng-if="::copyAllowed" class="clip-copy" clip-copy="json">\n',
        require: "ngModel",
        scope: true,
        link: function ( scope, iElement, iAttrs, ngModel ) {
            if( !ngModel ) return;

            scope.copyAllowed = iAttrs.hasOwnProperty('copyAllowed') ? true : false;
            scope.json = scope.prettyJson = "";
            
            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                if( ngModel.$viewValue == "") 
                    scope.prettyJson = "";
                else if ( ngModel.$viewValue === undefined || ngModel.$viewValue == "undefined" )
                    scope.prettyJson = "undefined";
                else if ((typeof(ngModel.$viewValue)=="number" && isNaN( ngModel.$viewValue)) || (typeof(ngModel.$viewValue)=="string") && ngModel.$viewValue=="NaN")
                    scope.prettyJson = "NaN";
                else {
                    scope.json = angular.toJson( angular.fromJson(ngModel.$viewValue), true) ;
                    scope.prettyJson = jsonSyntaxHighlight( scope.json );
                }
            };
        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {
        		_editor.setOptions({
		    	     maxLines: Infinity
		    	});
			};
        }
    };
});



angular
    .module('crowdCode')
    .directive('aceReadJsonDiff', function() {


    return {
        restrict: 'EA',
        template: '<pre class="json diff" ng-bind-html="diffHtml"></pre>\n',
        scope: {
            old: '=',
            new: '='
        },
        link: function ( scope, iElement, iAttrs, ngModel ) {

            var unwatch = scope.$watch('old+new',function(){
                if( scope.old != undefined && scope.new != undefined){
                    
                    
                    var oldObj,newObj;

                    // try to parse the old and new value to a JSON object
                    // if the conversion fails,  simply add quotes
                    oldObj = safeJsonParse( scope.old );
                    newObj = safeJsonParse( scope.new );

                    // initialize the diff result
                    var diffHtml = '';

                       // console.log('old/new',oldObj,newObj);

                    // if one of the two obj is null or
                    // if one of the two obj is undefined
                    // if the constructor is different
                    // if the oldObj is a number 
                    if( oldObj === null || newObj === null || 
                        oldObj === undefined || newObj === undefined || 
                        oldObj.constructor != newObj.constructor || 
                        typeof oldObj == 'number' ||
                        typeof oldObj == 'boolean'){

                        if( typeof(oldObj) == 'object' )
                            diffHtml += joinLines( angular.toJson(oldObj, true) , 'line added', 0);
                        else if ( typeof(oldObj) == 'string' )
                            diffHtml += joinLines( '"'+oldObj+'"', 'line added', 0);     
                        else
                            diffHtml += joinLines( oldObj + '', 'line added', 0);           

                        if( typeof(newObj) == 'object' )
                            diffHtml += joinLines( angular.toJson(newObj, true) , 'line removed', 0);
                        else if ( typeof(newObj) == 'string' )
                            diffHtml += joinLines( '"'+newObj+'"', 'line removed', 0);     
                        else
                            diffHtml += joinLines( newObj + '', 'line removed', 0);                    

                        scope.diffHtml = diffHtml;
                    }
                    // if the type of new is an object/array
                    else {

                        //console.log('compare obj');

                        var oldFields = Object.keys(oldObj);
                        var newFields = Object.keys(newObj);

                        var sharedFields  = oldFields.filter(function(value){ return newFields.indexOf(value) != -1; });
                        var removedFields = oldFields.filter(function(value){ return newFields.indexOf(value) == -1; });
                        var addedFields   = newFields.filter(function(value){ return oldFields.indexOf(value) == -1; });

                        var isArray = newObj.constructor == Array;

                        for( var f = 0 ; f < removedFields.length ; f++ ){
                            var name = removedFields[f];
                            var text = angular.toJson( oldObj[name], true) + ',';
                            if( !isArray ) text = '"'+name+'" : ' + text;
                            diffHtml += joinLines( text, 'line added', 2) ;
                            diffHtml += '\n';
                        }

                        for( var f = 0 ; f < sharedFields.length ; f++ ){
                            var name = sharedFields[f];
                            var equal = deepCompare(oldObj[name],newObj[name]);

                            if( equal ){
                                var text = angular.toJson( oldObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line ', 2) ;
                            } else {
                                var text = angular.toJson( oldObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line added', 2) ;


                                var text = angular.toJson( newObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line removed', 2) ;
                            }

                            diffHtml += '\n';
                        }

                        for( var f = 0 ; f < addedFields.length ; f++ ){
                            var name = addedFields[f];
                            var text = angular.toJson( newObj[name], true) + ',';
                            if( !isArray ) text = '"'+name+'" : ' + text;
                            diffHtml += joinLines( text, 'line removed', 2) ;

                            diffHtml += '\n';
                        }

                        // // find the differences in the 
                        // // first layer of properties
                        // var compareResults = [];
                        // for( var field in newObj ){
                        //     compareResults[ field ] = deepCompare( oldObj[field], newObj[field] );
                        // }

                        // // for each property of the first layer  
                        // var fields = Object.keys(compareResults);
                        // for( var k = 0; k < fields.length; k++ ){
                        //     var field = fields[k];
                            
                        //     // if the fields are equal 
                        //     // concat the value as is in the 
                        //     // diffHtml val
                        //     if( compareResults[field] ) {
                        //         var text = angular.toJson( newObj[field] !== undefined ? newObj[field] : '', true);
                        //         if( newObj.constructor == Object ) text = '"'+field+'" : ' + text;
                        //         if( k != fields.length -1 ) text += ',';

                        //         diffHtml += joinLines( text, 'line ', 2) ;
                        //     } 
                        //     // otherwise first add the old value of the property as 'removed'
                        //     // and after add the new value as 'added'
                        //     else {
                        //         // when the field is not defined in the oldObj
                        //         // show just the new value
                        //         if( oldObj[field] !== undefined ){
                        //             var removedText = angular.toJson( oldObj[field], true);
                        //             if( newObj.constructor == Object )
                        //                 removedText = '"'+field+'" : ' + removedText;
                        //             diffHtml += joinLines( removedText, 'line removed', 2) ;
                        //         }

                        //         var addedText   = angular.toJson( newObj[field], true);
                        //         if( k != fields.length -1 ) addedText += ',';
                        //         if( newObj.constructor == Object ){
                        //             addedText   = '"'+field+'" : ' + addedText;
                        //         }
                        //         diffHtml += joinLines( addedText, 'line added', 2);
                                    
                        //     }
                        //     if( k != fields.length -1 ) diffHtml += '\n';
                        // }

                        // pick the appropriate set of brackets for the final diff result
                        if( newObj.constructor == Array )  scope.diffHtml = '[\n'+diffHtml+']';
                        if( newObj.constructor == Object ) scope.diffHtml = '{\n'+diffHtml+'}';
                    }
                    

                }
            });
            
        }
    };
});
	////////////////////
// MAIN CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
angular
    .module('crowdCode')
    .controller('MainController', [
	'$scope',
	'$rootScope',
	'$firebase',
	'$interval',
	'$modal',
	'logoutUrl',
	'userService',
	'functionsService',
	'ADTService',
	'microtasksService',
	'TestList',
	'avatarFactory',
	function($scope, $rootScope, $firebase, $interval, $modal, logoutUrl, userService,  functionsService, ADTService, microtasksService, TestList, avatarFactory) {

		// current session variables
		$rootScope.projectId    = projectId;
		$rootScope.workerId     = workerId;
		$rootScope.workerHandle = workerHandle;
		$rootScope.firebaseURL  = firebaseURL;
		$rootScope.userData     = userService.data;
		$rootScope.logoutUrl    = logoutUrl;


		$scope.makeDirty = function (form)
		{
			angular.forEach(form, function(formElement, fieldName) {
				// If the fieldname doesn't start with a '$' sign, it means it's form
				if (fieldName[0] !== '$'){
					if(angular.isFunction(formElement.$setDirty))
		                formElement.$setDirty();

					//if formElement as the proprety $addControl means that have other form inside him
					if (formElement !== undefined && formElement.$addControl)
						$scope.makeDirty(formElement);
				}
			});
		};

		$scope.avatar = avatarFactory.get;

		 // Pre-fetch an external template populated with a custom scope
		var profileModal = $modal({scope: $scope, container: 'body', animation: 'am-fade-and-scale', placement: 'center', template: 'widgets/popup_user_profile.html', show: false});
		// Show when some event occurs (use $promise property to ensure the template has been loaded)
		$rootScope.$on('showProfileModal', function() {
			profileModal.$promise.then(profileModal.show);
		});


		// ---- SERVICES SYNC ----
		$scope.servicesLoadingStatus = {};

		//  services loading function
		var loadServices = function(){
			$scope.servicesLoadingStatus = {};
			functionsService.init();
			ADTService.init();
		};
		// set an interval that will be called
		// every 200 msec
		var loadingServicesInterval = $interval(loadServices(), 200);

		$scope.$on('serviceLoaded',function(event,nameOfTheService){
			$scope.servicesLoadingStatus[nameOfTheService] = true;
		});

		// watch for the loaded services and if all are loaded
		// cancel the loading interval and stop the watch
		var stopWatchingLoadedServices = $scope.$watch( 'servicesLoadingStatus', function(newVal,oldVal) {
			if ( newVal.hasOwnProperty('functions') &&
				 newVal.hasOwnProperty('adts') ) {
				$interval.cancel(loadingServicesInterval);
				loadingServicesInterval = undefined;
				stopWatchingLoadedServices();
				userService.listenForJobs();
				userService.listenForLogoutWorker();


				$rootScope.$broadcast('loadMicrotask');

				$rootScope.$broadcast('run-tutorial','main', false, function(){
					$rootScope.$broadcast('showProfileModal');
				});
			}
		},true);


		$rootScope.$on('sendFeedback', function(event, message) {
			////console.log("message " + message.toString());
			var feedback = {
				// 'microtaskType': $scope.microtask.type,
				// 'microtaskID': $scope.microtask.id,
				'workerHandle': $rootScope.workerHandle,
				'workerID': $rootScope.workerId,
				'feedback': message.toString()
			};


			var feedbackRef = $firebase(new Firebase(firebaseURL + '/feedback'));

			feedbacks = feedbackRef.$asArray();
			feedbacks.$loaded().then(function() {
				feedbacks.$add(feedback);
			});

		});

}]);


angular
    .module('crowdCode')
    .directive('navbar', navbar); 

function navbar() {
    return {
    	replace: true,
        restrict: 'E',
        templateUrl: 'widgets/navbar.html'
    };
};

angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$interval', '$firebase', 'firebaseUrl','$modal','userService', function($rootScope, $compile, $interval, $firebase,firebaseUrl,$modal,userService) {

    var microtaskInterval;

    var microtaskTimeout      =  10 * 60 * 1000;     //in second
    var microtaskFirstWarning =  4  * 60 * 1000;      //in second
    var timeInterval=500;//interval time in milliseconds

    var fetchTime = 0;
   // var startTime = 0;
    var popupWarning;
    var microtaskType;
    var callBackFunction;
    var isTutorialOpen;


    return {
        restrict: 'E',
        templateUrl : 'widgets/reminder.html',
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.microtaskFirstWarning = microtaskFirstWarning;
            $scope.microtaskTimeout      = microtaskTimeout;

           // TO FIX
             $rootScope.$on('run-tutorial',function(){
                 isTutorialOpen=true;
            });

            $rootScope.$on('tutorial-finished',function(){
                isTutorialOpen=false;
            });


            // listen on the event 'run-tutorial'
            // and start the tutorial with tutorialId
            $rootScope.$on('run-reminder',function( event, microtask, onFinish ){

                if( microtask!== undefined ){
                    microtaskType=microtask;
                    callBackFunction=onFinish;
                    initializeReminder();
                }
            });
            $rootScope.$on('stop-reminder',function( event ){
                
                $scope.skipMicrotaskIn=undefined;



                if(microtaskInterval!==undefined)
                    $interval.cancel(microtaskInterval);

                if(popupWarning!==undefined)
                {
                    popupWarning.$promise.then(popupWarning.hide);
                    popupWarning=undefined;
                }

            });

            var initializeReminder = function(){


                //cancel the interval if still active(when they press skip or submit)
                if(microtaskInterval!==undefined)
                    $interval.cancel(microtaskInterval);
                if(popupWarning!==undefined)
                {
                    popupWarning.$promise.then(popupWarning.hide);
                    popupWarning=undefined;
                }

                //time when user fetched the microtask for the first time in milliseonds
                fetchTime = userService.getFetchTime();

                //actual time of the system in seconds
                startTime =  new Date().getTime();

                fetchTime.$loaded().then(function(){
                    if(typeof(fetchTime.time)=='number'){
                        $scope.skipMicrotaskIn = fetchTime.time + microtaskTimeout - startTime ;
                        // console.log("reminder initialized, you have "+ $scope.skipMicrotaskIn + " millisecons more");

                        microtaskInterval = $interval(doReminder, timeInterval); 
                    }
                    else
                    {
                        // console.log("error reminder not started", fetchTime.time);
                    }
                });


            };


            var doReminder = function(){

                if( ! isTutorialOpen ){
                //remaining time
                    $scope.skipMicrotaskIn-=timeInterval;

                    if($scope.skipMicrotaskIn < 0)
                    {
                        endReminder();
                    }
                    else if(popupWarning===undefined && $scope.skipMicrotaskIn < microtaskFirstWarning){
                        popupWarning = $modal({title: microtaskType, template : "widgets/popup_reminder.html" , show: true});
                        popupWarning.$scope.skipMicrotaskIn=$scope.skipMicrotaskIn ;
                    }else if(popupWarning!==undefined)
                    {
                        popupWarning.$scope.skipMicrotaskIn=$scope.skipMicrotaskIn ;

                    }
                }
            };

            var endReminder = function(){
                // console.log("skipping: "+microtaskType);
                if(microtaskInterval!==undefined)
                    $interval.cancel(microtaskInterval);
                microtaskInterval=undefined;
                if(callBackFunction!==undefined)
                    callBackFunction.apply();
            };

        }
    };
}]);


angular
    .module('crowdCode')
    .directive('statementsProgressBar',['$rootScope',function($rootScope) {
    return {
        templateUrl : 'widgets/statements_progress_bar.html',
        restrict: 'AE',
        link: function (scope, elm, attrs, ctrl) {
            scope.statements=0;
            scope.max=10;
            scope.$on('statements-updated',function(event,statements, max){
                scope.statements=statements;
                scope.max=max;
            });
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('stubsModal', stubsList); 

function stubsList($modal,functionsService) {
    return {
        restrict: 'E',
        scope: { 
            functionName: '=',
            stubs: '='
        },
        replace:true,
        templateUrl:'widgets/stubs_modal.html',
        controller: function($scope,$element){
            $scope.$watch('functionName',function(){
                var callee = functionsService.getByName( $scope.functionName );
                $scope.info = {
                    name        : callee.name,
                    signature   : callee.getSignature(),
                    parameters  : callee.getParameters(),
                    returnType  : callee.returnType
                };
            });
            $scope.close = function(){
                $element.modal('hide');
            };
            
            $scope.$on('open-stubs-'+$scope.functionName,function(){
                $element.modal('show');
            })
        	
        }
    };
};
angular
    .module('crowdCode')
    .directive('testResult', testResult); 

function testResult() {
    return {
        restrict: 'E',
        scope: { 
            test  : '=',
            funct : '='
        },
        templateUrl: 'widgets/test_result.html',
        controller: function($scope,$element){

        	$scope.diffMode = true;
        	$scope.switchMode  = switchMode;
            $scope.doDispute   = doDispute;
            $scope.undoDispute = undoDispute;

            function switchMode(){
                $scope.diffMode = !$scope.diffMode;
            }

            function doDispute(test) {
                test.rec.inDispute = true;
                if( test.rec.disputeTestText === undefined )
                    test.rec.disputeTestText = '';
            }

            function undoDispute(test) {
                test.rec.inDispute = false;
            }
        }
    };
};
angular.module('templates-main', ['chat/alert_chat.html', 'chat/chat_panel.html', 'data_types/adt_list.html', 'data_types/examples_list_popover.html', 'functions/function_conventions.html', 'functions/javascript_tutorial.html', 'leaderboard/leaderboard_panel.html', 'microtasks/alert_submit.html', 'microtasks/debug_test_failure/debug_test_failure.html', 'microtasks/loading.html', 'microtasks/microtask_form.html', 'microtasks/microtask_title.html', 'microtasks/no_microtask/no_microtask.html', 'microtasks/reissue_microtask.html', 'microtasks/reuse_search/reuse_search.html', 'microtasks/review/review.html', 'microtasks/review/review_DebugTestFailure.html', 'microtasks/review/review_ReuseSearch.html', 'microtasks/review/review_WriteCall.html', 'microtasks/review/review_WriteFunction.html', 'microtasks/review/review_WriteFunctionDescription.html', 'microtasks/review/review_WriteTest.html', 'microtasks/review/review_WriteTestCases.html', 'microtasks/write_call/write_call.html', 'microtasks/write_function/write_function.html', 'microtasks/write_function_description/write_function_description.html', 'microtasks/write_test/write_test.html', 'microtasks/write_test_cases/write_test_cases.html', 'newsfeed/news_panel.html', 'newsfeed/news_popover.html', 'newsfeed/news_popover_DebugTestFailure.html', 'newsfeed/news_popover_ReuseSearch.html', 'newsfeed/news_popover_WriteCall.html', 'newsfeed/news_popover_WriteFunction.html', 'newsfeed/news_popover_WriteFunctionDescription.html', 'newsfeed/news_popover_WriteTest.html', 'newsfeed/news_popover_WriteTestCases.html', 'tutorials/DebugTestFailure.html', 'tutorials/ReuseSearch.html', 'tutorials/Review.html', 'tutorials/WriteCall.html', 'tutorials/WriteFunction.html', 'tutorials/WriteFunctionDescription.html', 'tutorials/WriteTest.html', 'tutorials/WriteTestCases.html', 'tutorials/main.html', 'users/user_popover.html', 'widgets/ace_edit_js.html', 'widgets/description_popover.html', 'widgets/dropdown_main.html', 'widgets/navbar.html', 'widgets/popup_feedback.html', 'widgets/popup_reminder.html', 'widgets/popup_shortcuts.html', 'widgets/popup_template.html', 'widgets/popup_user_profile.html', 'widgets/reminder.html', 'widgets/statements_progress_bar.html', 'widgets/stubs_modal.html', 'widgets/test_result.html']);

angular.module("chat/alert_chat.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("chat/alert_chat.html",
    "<div class=\"alert chat-alert\">\n" +
    "	\n" +
    "	<div class=\"header\">\n" +
    "		<span class=\"avatar pull-left\"><img src=\"/user/picture?userId={{ title }}\" alt=\"\" /></span>\n" +
    "		<span class=\"pull-left\">{{title}} says: </span>\n" +
    "		<span class=\"pull-right btn-close glyphicon glyphicon-remove\" ng-if=\"dismissable\" ng-click=\"$hide()\"></span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	</div>\n" +
    "	<div class=\"message\" ng-bind-html=\"content\"></div>\n" +
    "</div>");
}]);

angular.module("chat/chat_panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("chat/chat_panel.html",
    "<div id=\"chatPanel\" class=\"chat {{chatActive?'active':''}}\">\n" +
    "\n" +
    "	<div class=\"header\"> \n" +
    "		<span>Project chat</span>\n" +
    "		<span class=\"pull-right btn-close glyphicon glyphicon-remove\" ng-click=\"$emit('toggleChat')\"></span>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"output\" scroll-glue>\n" +
    "		<ul class=\"messages\">\n" +
    "			<li ng-repeat=\"m in messages\">\n" +
    "	      		<div class=\"avatar\"><img ng-src=\"{{ avatar(m.workerId).$value }}\"  alt=\"\" /></div>\n" +
    "	      		<div class=\"message\">\n" +
    "	      			<span class=\"nickname\">\n" +
    "						{{m.workerHandle}}:</span>\n" +
    "	      			<span class=\"text\">{{m.text}}</span>\n" +
    "	      		</div>\n" +
    "	      		<!--<div class=\"timestamp\">{{ m.createdAt | date : 'medium'}}</div>-->\n" +
    "	      			\n" +
    "	      		<div class=\"clearfix\"></div>\n" +
    "	      	</li>\n" +
    "	      	<li class=\"clearfix\"></li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"input\">\n" +
    "		<textarea ng-model=\"data.newMessage\" ng-model-option=\"{ updateOn: 'blur'}\"class=\"input-sm\" press-enter=\"addMessage()\" ></textarea>\n" +
    "	</div>\n" +
    "	\n" +
    "</div>");
}]);

angular.module("data_types/adt_list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data_types/adt_list.html",
    "<div class=\"panel-group adt-list\" bs-collapse ng-model=\"ADTs.selectedADT\">\n" +
    "    <div class=\"panel panel-default\" ng-repeat=\"(index,ADT) in ADTs\">\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <h4 class=\"panel-title\">\n" +
    "            <a bs-collapse-toggle>\n" +
    "                <span ng-if=\" ADTs.selectedADT !== index \" class=\"glyphicon glyphicon-chevron-right\" ></span>\n" +
    "                <span ng-if=\" ADTs.selectedADT === index \" class=\"glyphicon glyphicon-chevron-down\" ></span>\n" +
    "                {{ ADT.name }}\n" +
    "            </a>\n" +
    "            </h4>\n" +
    "        </div>\n" +
    "        <div class=\"panel-collapse\" bs-collapse-target>\n" +
    "            <div class=\"panel-body\">\n" +
    "                <div data-ng-bind-html=\"ADT.description | newline\" ></div><br />\n" +
    "\n" +
    "                <div ng-if=\"::(ADT.structure.length>0)\">\n" +
    "                    <h5 for=\"structure\">DATA STRUCTURE</h5>\n" +
    "                    <pre ng-bind=\"::buildStructure(ADT)\"></pre>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"::ADT.examples\" ng-init=\"selectedExample=ADT.examples[0]\" >\n" +
    "                    <h5 class=\"pull-left\" for=\"exampleSelect\">EXAMPLES:</h5>\n" +
    "                    <button name= \"exampleSelect\" \n" +
    "                            class=\"btn-select pull-right\"\n" +
    "                            bs-select  \n" +
    "                            ng-model=\"selectedExample\" \n" +
    "                            data-html=\"1\" \n" +
    "                            data-placement=\"bottom-right\"\n" +
    "                            ng-options=\"example.name for example in ADT.examples\" >\n" +
    "                    </button>\n" +
    "                    <span class=\"clearfix\"></span>\n" +
    "                    <div ace-read-json ng-model=\"::selectedExample.value\" class=\"clearfix adt-detail\" copy-allowed></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("data_types/examples_list_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data_types/examples_list_popover.html",
    "<div class=\"popover examples-list-popover\">\n" +
    "	<a href=\"#\" ng-repeat=\"example in examplesList\"  ng-click=\" togglePopover(key) ; loadExampleValue(example.value)\"> {{example.name}}<br/></a>\n" +
    "</div>");
}]);

angular.module("functions/function_conventions.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("functions/function_conventions.html",
    "<div class=\"function-conventions\">\n" +
    "	<p>\n" +
    "		Use <strong style=\"text-transform:uppercase\">pseudocode</strong> to sketch an implementation by using the syntax\n" +
    "		'<span class=\"pseudoCode\">//#  sketch of implementation</span>'.\n" +
    "		<pre ng-bind-html=\"examplePseudocode\"></pre>\n" +
    "	</p>\n" +
    "\n" +
    "	<p>\n" +
    "		Use <strong style=\"text-transform:uppercase\">function stubs</strong> to request a function call to a new or existing function. Call the function as normal, and define a <strong style=\"text-transform:uppercase\">function stub</strong> at the bottom with a short description, header, and an empty body.\n" +
    "		<pre ng-bind-html=\"examplePseudocall\"></pre>\n" +
    "	</p>\n" +
    "	<p>\n" +
    "		<b>Note:</b> all function calls are pass by value (i.e., if you pass an\n" +
    "		object to a function, and the function changes the object, you will not\n" +
    "		see the changes).\n" +
    "	</p>\n" +
    "</div>");
}]);

angular.module("functions/javascript_tutorial.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("functions/javascript_tutorial.html",
    "<!-- Button trigger modal -->\n" +
    "<a href=\"#\"  data-toggle=\"modal\" data-target=\"#javascriptTutorial\"  >\n" +
    "JAVASCRIPT TUTORIAL \n" +
    "</a>\n" +
    "\n" +
    "<!-- Modal -->\n" +
    "<div class=\"modal fade\" id=\"javascriptTutorial\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"text-transform:none;\">\n" +
    "  <div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "      <div class=\"modal-header\">\n" +
    "        <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n" +
    "        <h4 class=\"modal-title\" id=\"myModalLabel\">Javascript in 2 minutes!</h4>\n" +
    "      </div>\n" +
    "      <div class=\"modal-body\">\n" +
    "		<div ui-ace=\"{showGutter: false, theme:'xcode',  mode: 'javascript', onLoad : aceLoaded }\"  readonly=\"true\" ng-model=\"javaTutorial\"> </div>  <br>\n" +
    "   	</div>\n" +
    "      <div class=\"modal-footer\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("leaderboard/leaderboard_panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("leaderboard/leaderboard_panel.html",
    "<h3 class=\"toggler\">Leaderboard</h3>\n" +
    "<div id=\"leaderboardPanel\"  class=\"element active\" style=\"height:40%\">\n" +
    "	<div class=\"element-body scrollable\">\n" +
    "		<div>\n" +
    "			<ul class=\"sidebar-list leaderboard\" >\n" +
    "			  	<li ng-repeat=\"leader in leaders | orderBy:'-score'\" ng-if=\"leaders.length > 0\" \n" +
    "			  	  class=\"{{ leaders.$keyAt(leader) == workerId ? 'self' : '' }}\" >\n" +
    "			  	\n" +
    "			  		<div class=\"avatar\"><img style=\"width:25px\" ng-src=\"{{ avatar(leaders.$keyAt(leader)).$value }}\" alt=\"{{ ::leader.name }}\" /></div>\n" +
    "			  		<div class=\"score\">{{ leader.score }} pts</div>\n" +
    "			  		<div class=\"name\">{{::(leader.name) }}</div>\n" +
    "\n" +
    "			  		<div class=\"clearfix\"></div>\n" +
    "\n" +
    "				\n" +
    "			  	</li>\n" +
    "			</ul>\n" +
    "			<span ng-if=\"leaders.length == 0\" >\n" +
    "				no leaders yet!\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/alert_submit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/alert_submit.html",
    "<div class=\"alert submit-alert\" ng-class=\"[type ? 'alert-' + type : null]\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "  <strong ng-bind=\"title\"></strong>&nbsp;<span ng-bind-html=\"content\"></span>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/debug_test_failure/debug_test_failure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/debug_test_failure/debug_test_failure.html",
    "<div ng-controller=\"DebugTestFailureController\"  >\n" +
    "    \n" +
    "\n" +
    "    <div class=\"section section-description \" >\n" +
    "        \n" +
    "        <div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "        <div class=\"section-content  job-description\" >\n" +
    "            One of the tests for the function <strong>{{funct.name}}</strong> has failed. <br />\n" +
    "            Can you find and fix the bug (or report an issue with the test)?\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <alertcontainer></alertcontainer>\n" +
    "\n" +
    "    <div ng-repeat=\"callee in data.callees\">\n" +
    "        <stubs-modal function-name=\"callee\" stubs=\"currentTest.stubs[callee]\"></stubs-modal>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!dispute.active\" \n" +
    "         class=\"section section-description\"  >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>\n" +
    "            FAILING TEST \n" +
    "        </div>\n" +
    "        <div class=\"section-content\" >\n" +
    "           \n" +
    "            <div class=\"panel-group\" ng-model=\"activePanelCurr\" bs-collapse>\n" +
    "            \n" +
    "                <div class=\"panel panel-default test-result\" >\n" +
    "                    \n" +
    "                    <div class=\"panel-heading {{ currentTest.status() }}\" bs-collapse-toggle>\n" +
    "                        <strong class=\"pull-left\">    \n" +
    "                            <span class=\"glyphicon glyphicon-chevron-{{ activePanelCurr == 0 ? 'down' : 'right' }}\"></span>\n" +
    "                            {{currentTest.rec.description}} \n" +
    "                        </strong>\n" +
    "                        <span class=\"pull-right\">\n" +
    "                            <span ng-if=\"!currentTest.ready()\"> running ... </span>\n" +
    "                            <span ng-if=\"currentTest.ready()\">\n" +
    "                                <span ng-if=\"!currentTest.inTimeout\">\n" +
    "                                    <span>executed in {{currentTest.executionTime}} ms - </span>\n" +
    "                                    <span>{{currentTest.status()}}</span>\n" +
    "                                </span>\n" +
    "                                <span ng-if=\"currentTest.inTimeout\">timeout</span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                        \n" +
    "                        <span class=\"clearfix\"></span>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"panel-collapse\" bs-collapse-target>\n" +
    "                        <test-result test=\"currentTest\" funct=\"funct\" ></test-result>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "\n" +
    "            </div>  \n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!dispute.active && previousTests.length > 0\" class=\"section section-description\"  >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>\n" +
    "            OTHER TESTS\n" +
    "        </div>\n" +
    "        <div class=\"section-content\" >\n" +
    "            \n" +
    "            <div class=\"panel-group\" ng-model=\"activePanel\" bs-collapse>\n" +
    "            \n" +
    "                <div class=\"panel panel-default test-result\" \n" +
    "                    ng-repeat=\"(testIndex,test) in previousTests track by $index\"\n" +
    "                    ng-show=\"!test.output.result || !hidePassedTests\">\n" +
    "                    \n" +
    "                    <div class=\"panel-heading {{ test.status() }}\" bs-collapse-toggle>\n" +
    "                        <strong class=\"pull-left\">    \n" +
    "                            <span class=\"glyphicon glyphicon-chevron-{{ activePanel == testIndex ? 'down' : 'right' }}\"></span>\n" +
    "                            {{test.rec.description}} \n" +
    "                        </strong>\n" +
    "                        <span class=\"pull-right\">\n" +
    "                            <span ng-if=\"!test.ready()\"> running ... </span>\n" +
    "                            <span ng-if=\"test.ready()\">\n" +
    "                                <span ng-if=\"!test.inTimeout\">\n" +
    "                                    <span>executed in {{test.executionTime}} ms - </span>\n" +
    "                                    <span>{{test.status()}}</span>\n" +
    "                                </span>\n" +
    "                                <span ng-if=\"test.inTimeout\">timeout</span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                        \n" +
    "                        <span class=\"clearfix\"></span>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"panel-collapse \" bs-collapse-target>\n" +
    "                        <div ng-if=\"activePanel != NaN && (activePanel%previousTests.length)==$index\">    \n" +
    "                            <test-result test=\"test\" funct=\"funct\" ></test-result>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "\n" +
    "            </div>  \n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- CODE EDITOR -->\n" +
    "    <div class=\"section-cols \" ng-show=\" tabs.active == 2 \">\n" +
    "        <div class=\"container-flex-row\">\n" +
    "            <div class=\"section section-help bg-color-alpha \" style=\"width:30%\">\n" +
    "                <a ng-click=\"runTests()\" class=\"btn btn-primary\" style=\"margin:10px\" ng-disabled=\"microtaskForm.functionForm.$invalid\">\n" +
    "                    <span class=\"glyphicon glyphicon-refresh\"></span> \n" +
    "                    <span ng-if=\"!data.running\">Run the tests</span> \n" +
    "                    <span ng-if=\"data.running\">Tests running</span>\n" +
    "                </a>\n" +
    "                \n" +
    "                <div class=\"section-title\" > <div class=\"dot\"></div> <javascript-helper ></javascript-helper></div>\n" +
    "\n" +
    "                <div class=\"section-title\" >  <div class=\"dot\"></div> DEBUGGER TIPS </div>\n" +
    "                <div class=\"section-content\" >\n" +
    "                    <ul style=\"font-family:'Lato'; list-style:none; padding-left:5px; padding-right:5px;\">\n" +
    "                        <li style=\"border-bottom:1px solid #A9CAE0; \">use <strong>console.log(...)</strong> to monitor statements</li>\n" +
    "                        <li>click on the highlighted function calls for opening the stubs popup</li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"section-title\" >  <div class=\"dot\"></div> AVAILABLE DATA TYPES </div>\n" +
    "                <div class=\"section-content\" >\n" +
    "                    <adt-list></adt-list>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"section section-form\" style=\"width:70%\">\n" +
    "                <div class=\"section-content no-padding\" >\n" +
    "                    <ace-edit-js \n" +
    "                        function=\"funct\" \n" +
    "                        editor=\"data.editor\" \n" +
    "                        annotations=\"data.annotations\"\n" +
    "                        markers=\"data.markers\"\n" +
    "                        has-pseudo=\"data.hasPseudo\"\n" +
    "                        >\n" +
    "                    </ace-edit-js>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/loading.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/loading.html",
    "<div class=\"loading-microtask\" >\n" +
    "	<div class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></div> Loading microtask...\n" +
    "</div>");
}]);

angular.module("microtasks/microtask_form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/microtask_form.html",
    "<form name=\"microtaskForm\" class=\"form-horizontal\" novalidate microtask-shortcuts>\n" +
    "	<div id=\"task\" class=\"task\" microtask >\n" +
    "		<ng-include class=\"{{ !noMicrotask ? 'task-' + (microtask.type | lowercase) : '' }}\" src=\"templatePath\"></ng-include>\n" +
    "	</div>\n" +
    "	<reminder></reminder>\n" +
    "\n" +
    "	<div class=\"button-bar\">\n" +
    "		<div class=\"btn-group pull-left\" role=\"group\" ng-show=\"!noMicrotask\" >\n" +
    "			<button type=\"button\"\n" +
    "\n" +
    "       	 		id= \"skipBtn\"\n" +
    "       			ng-click=\"$emit('skipMicrotask')\" \n" +
    "       			tabindex=\"100\" \n" +
    "       			class=\"btn btn-default btn-sm\">\n" +
    "       			Skip\n" +
    "       		</button>\n" +
    "		  	\n" +
    "		  	<button type=\"button\" \n" +
    "      			id=\"submitBtn\"\n" +
    "		  		ng-click=\"$broadcast('collectFormData', microtaskForm) \" \n" +
    "		  		tabindex=\"99\" \n" +
    "		  		class=\"btn btn-primary btn-sm\">\n" +
    "		  		Submit\n" +
    "		  	</button>\n" +
    "		 \n" +
    "		</div>\n" +
    "\n" +
    "		<span class=\"pull-right\">\n" +
    "			<span ng-if=\"unreadMessages > 0\" class=\"unread-messages\">{{unreadMessages}}</span>\n" +
    "			<button ng-click=\"$emit('toggleChat')\" tabindex=\"101\" class=\"btn btn-chat-toggle {{chatActive?'opened':''}} btn-sm\"  >\n" +
    "\n" +
    "				<span class=\"glyphicon glyphicon-comment\"></span>\n" +
    "			</button>\n" +
    "		</span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	\n" +
    "	</div>\n" +
    "</form>");
}]);

angular.module("microtasks/microtask_title.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/microtask_title.html",
    "<div class=\"section-content no-padding microtask-details\" >\n" +
    "		<span class=\"bg-color type\">{{::microtask.title}}</span>\n" +
    "		<span class=\"reissued\" ng-if=\"microtask.reissuedFrom !== undefined\">REISSUED</span>\n" +
    "		<span class=\"points\">{{::microtask.points}} pts</span>\n" +
    "		<span class=\"tutorial-btn glyphicon glyphicon-question-sign color\" ng-click=\"$emit('run-tutorial', microtask.type, true); \"></span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "</div>");
}]);

angular.module("microtasks/no_microtask/no_microtask.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/no_microtask/no_microtask.html",
    "<div ng-controller=\"NoMicrotaskController\" >\n" +
    "	<div class=\"alert alert-warning no-microtask\" role=\"alert\" >\n" +
    "		SORRY, there aren't available microtasks at the moment. <br />\n" +
    "		The microtask queue will be checked again in <strong> {{checkQueueIn}} seconds </strong>.\n" +
    "	</div>\n" +
    "\n" +
    "	<h2>Workers Stats</h2>\n" +
    "	<div class=\"stats\">\n" +
    "		<ul>\n" +
    "		  <li ng-repeat=\"leader in leaders track by $index | orderBy:'-score'\" ng-if=\"leaders.length > 0\" \n" +
    "		  	  class=\"{{ leaders.$keyAt(leader) == workerId ? 'self' : '' }}\" >\n" +
    "		  	\n" +
    "		  		<div class=\"position\">#{{$index+1}}</div>\n" +
    "		  		<div class=\"avatar\"><img ng-src=\"{{ avatar(leaders.$keyAt(leader)).$value }}\" alt=\"{{ ::leader.name }}\" /></div>\n" +
    "		  		<div class=\"score\">{{ leader.score }} pts</div>\n" +
    "		  		<div class=\"name\">{{::(leader.name) }}</div>\n" +
    "\n" +
    "		  		<div class=\"clearfix\"></div>\n" +
    "\n" +
    "			\n" +
    "		  </li>\n" +
    "		</ul>\n" +
    "		<span ng-if=\"leaders.length == 0\" >\n" +
    "			no leaders yet!\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/reissue_microtask.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/reissue_microtask.html",
    "<div >\n" +
    "	<div class=\"section section-description\"  >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			REISSUE MOTIVATION\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			{{reissuedMicrotask.review.reviewText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/reuse_search/reuse_search.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/reuse_search/reuse_search.html",
    "<div ng-controller=\"ReuseSearchController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "		\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			A worker editing the function <strong>{{funct.getName()}}</strong> requested a call to a function providing the behavior of <strong>{{ microtask.pseudoFunctionName }}</strong>. Can you find a function providing such behavior (which might be named differently), or indicate that no such function exists?\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTED BEHAVIOR\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTING FUNCTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"code\" highlight=\"[ { 'needle' : microtask.pseudoFunctionName , regex: true } ]\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div> HINT\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					Choose a function that provides the requested behavior ( you can filter the list of functions by entering text in the input box).\n" +
    "					<strong>If there isn't the right function, click check \"no function found\".</strong>\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-title no-padding\" >\n" +
    "\n" +
    "					<div class=\"input-group\">\n" +
    "						<input\n" +
    "							class=\"form-control\"\n" +
    "							tabindex=\"1\"\n" +
    "							type=\"text\"\n" +
    "							name=\"newtestcase\"\n" +
    "							ng-model=\"text\"\n" +
    "							ng-change=\"doSearch()\"\n" +
    "							placeholder=\"Search for functions\"\n" +
    "							focus/>\n" +
    "						<span class=\"input-group-btn\">\n" +
    "							<button class=\"btn btn-default\" ng-click=\"doSearch()\" type=\"button\" tabindex=\"2\">\n" +
    "								<span class=\"glyphicon glyphicon-filter\"></span>\n" +
    "							</button>\n" +
    "						</span>\n" +
    "\n" +
    "					</div>\n" +
    "					<div class=\"input-group\" style=\"width:100%\">\n" +
    "\n" +
    "						<b>If you can't find any, select: \n" +
    "						<input type=\"checkbox\" ng-model=\"selectedResult\" ng-true-value=\"-1\" ng-false-value=\"-2\"> No function found</b>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "				<div class=\"section-content no-padding\">\n" +
    "\n" +
    "					<div ng-if=\"results.length > 0\" class=\"list-group\">\n" +
    "						<div ng-repeat= \"function in results | orderBy:'-score'\" \n" +
    "						     class=\"list-element animate-repeat {{ selectedResult == $index ? 'selected' : '' }}\"\n" +
    "						     ng-click=\"select($index)\" description-popover=\"function.value.getSignature()\">\n" +
    "								<b>{{function.value.getHeader()}}</b>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<span ng-if=\"results.length == 0\" >No function found</span>\n" +
    "					\n" +
    "\n" +
    "				</div>\n" +
    "\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/review/review.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review.html",
    "<div ng-controller=\"ReviewController\">\n" +
    "\n" +
    "	<div ng-if=\"reviewed !== undefined\" ng-include=\"'microtasks/review/review_' + reviewed.type + '.html'\"></div>\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>RATING SYSTEM\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<ul style=\"list-style:none;margin:0px;padding:0px;\">\n" +
    "						<li><b>1 Star</b>: Incoherent or unfocussed</li>\n" +
    "						<li><b>2 Stars</b>: Unconvincing or weak</li>\n" +
    "						<li><b>3 Stars</b>: There are some weakness</li>\n" +
    "						<li><b>4 Stars</b>: Good quality, without weakness</li>\n" +
    "						<li><b>5 Stars</b>: Excellent without weakness</li>\n" +
    "					</ul>\n" +
    "\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "\n" +
    "					<div class=\"heading-1\" >rating</div>\n" +
    "					<div id=\"ratingsDiv\" class=\"stars-container pull-left\" >\n" +
    "						<span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\"\n" +
    "							  ng-mouseenter=\"review.mouseOn=currentValue\"\n" +
    "							  ng-mouseleave=\"review.mouseOn=0\"\n" +
    "							  ng-click=\"rate(currentValue)\">\n" +
    "							<span class=\"star {{ ( review.mouseOn > $index || review.rating > $index ) ? 'full' : '' }}\"></span>\n" +
    "							<span ng-if=\"$index == 2\" class=\"stars-separator\" ></span>\n" +
    "						</span>\n" +
    "					</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "					<span class=\"rating-result pull-left\" ng-if=\"review.rating != -1\">\n" +
    "						<strong ng-if=\"review.rating <= 3\"><span class=\"glyphicon glyphicon-refresh\"></span> revise work</strong>  \n" +
    "						<strong ng-if=\"review.rating > 3\"><span class=\"glyphicon glyphicon-ok\"></span> work accepted</strong>  \n" +
    "					</span>\n" +
    "\n" +
    "					<span class=\"clearfix\"></span>\n" +
    "\n" +
    "					<div class=\"heading-1\" >review</div>\n" +
    "					<textarea\n" +
    "						id=\"reviewText\" class=\"col-md-12 form-control input-sm\" ng-model=\"review.reviewText\" name=\"reviewText\" ng-required=\"review.rating < 4\" focus style=\"resize:none;height:100px;\"></textarea>\n" +
    "					<span\n" +
    "					class=\"help-block\" ng-show=\"microtaskForm.reviewText.$dirty && review.rating < 4 && microtaskForm.reviewText.$invalid && microtaskForm.reviewText.$error.required\">This field is required!</span>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("microtasks/review/review_DebugTestFailure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_DebugTestFailure.html",
    "<div ng-if=\"review.microtask.submission.hasPseudo\">\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			A worker was asked to edit the code of the function <strong>{{ funct.getName() }}</strong>.\n" +
    "			Can you review this work?\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "	<div class=\"section section-review\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Diff of edits to function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"! review.microtask.submission.hasPseudo\">\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "\n" +
    "			A worker reported an issue with the following test case<span ng-if=\"review.microtask.submission.disputedTests.length > 1\">s</span> for the function <strong>{{funct.getName()}}</strong>.\n" +
    "			Can you review this work?\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\">\n" +
    "			<div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div data-ng-repeat=\"(key, test) in tests\">\n" +
    "		<div class=\"section section-description\">\n" +
    "			<div class=\"section-title\" ><div class=\"dot bg-color\"></div>test case</div>\n" +
    "			<div class=\"section-content\" >\n" +
    "				{{test.getDescription()}}\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section section-description\">\n" +
    "			<div  class=\"section-title\" ><div class=\"dot bg-color\"></div>TEST</div>\n" +
    "			<div class=\"section-content\" >\n" +
    "				<table style=\"width:100%\" class=\"test\">\n" +
    "					<tr ng-repeat=\"(inputKey,input) in test.getSimpleTest().inputs track by $index\">\n" +
    "						<td>{{funct.getParamNameAt($index)}}</td>\n" +
    "						<td>\n" +
    "							<div ace-read-json ng-model=\"input\" ></div>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr >\n" +
    "						<td>test output</td>\n" +
    "						<td>\n" +
    "							<div ace-read-json ng-model=\"test.getSimpleTest().output\" ></div>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "				</table>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section section-review\">\n" +
    "			<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "			<div class=\"section-content\" >\n" +
    "				{{test.disputeText}}\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/review/review_ReuseSearch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_ReuseSearch.html",
    "<div class=\"section section-description \" >\n" +
    "	\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		A worker editing the function <strong>{{funct.getName()}}</strong> requested a call to a function providing the behavior of <strong>{{review.microtask.pseudoFunctionName}}</strong>. As a result, a worker was asked to find a function providing such behavior. Can you review this work?\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>REQUESTED BEHAVIOR\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"review.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-description-2\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>requesting function\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"funct.getFunctionCode()\" highlight=\"[ { 'needle' : review.microtask.pseudoFunctionName , regex: true } ]\" ></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>Function Found\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"calleeFunction.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteCall.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteCall.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		The crowd created a description for the function\n" +
    "		 <strong>{{calleeFunction.getName()}}</strong>, called by the function below.<br />\n" +
    "		 As a result, a worker was asked to check if the call(s) were correct, and revise them if necessary, or decide that an alternative implementation was better. <br />Can you review this work?\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"calleeFunction.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>Diff of Edits to Function\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"review.functionCode\" mode=\"diff\" highlight=\"[ { 'needle' : calleeFunction.getName() , regex: true } ]\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteFunction.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteFunction.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"reviewed.submission.inDispute\">\n" +
    "			A worker has reported the following function as not implementable.  Can you review this request?\n" +
    "		</div>\n" +
    "		<div ng-if=\"! reviewed.submission.inDispute\">\n" +
    "			<div ng-if=\"reviewed.promptType == 'SKETCH'\">\n" +
    "				A worker was asked to edit the code of the function <strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType == 'RE_EDIT'\">\n" +
    "				A worker was asked to revise the following function (if necessary) to address an issue reported by the crowd.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "				A worker was asked to revise the following function (if necessary) based on a change to the signature of a function it calls.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType=='REMOVE_CALLEE'\">\n" +
    "				The crowd determined that the function <strong>{{callee.getName()}}</strong>, which was called in the function below, could not be implemented as requested, for the reason below.  As a result, a worker was asked to replace the call(s) to <strong>{{callee.getName()}}</strong> with a new 	implementation.\n" +
    "			</div>\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"! reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description-2\" ng-if=\"reviewed.disputeText.length > 0\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Reported Issue\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" ng-if=\"reviewed.disputeText.length > 0\" >\n" +
    "			{{reviewed.disputeText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"reviewed.promptType == 'REMOVE_CALLEE'\">\n" +
    "		<div class=\"section section-description-2\">\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>Description of Function Call to Remove\n" +
    "			</div>\n" +
    "			<div class=\"section-content no-padding\" >\n" +
    "				<ace-read-js code=\"callee.getSignature()\" ></ace-read-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"reviewed.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "		<div class=\"section section-description-2\">\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>Changes to Function Signature\n" +
    "			</div>\n" +
    "			<div class=\"section-content no-padding\" >\n" +
    "				<ace-read-js code=\"calledDiffCode\" mode=\"diff\" ></ace-read-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-review\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Diff of edits to function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description-2\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>reported function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-review\">\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			{{reviewed.submission.disputeFunctionText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteFunctionDescription.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteFunctionDescription.html",
    "<div class=\"section section-description \" >\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "			A worker was asked to write a detailed description for the following requested function.\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"review.microtask.submission.inDispute\">\n" +
    "			A worker has requested that the following function not be implemented.\n" +
    "		</div>\n" +
    "\n" +
    "		<span>Can you review this work?</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"! review.microtask.submission.inDispute\">Requested Function</span>\n" +
    "		<span ng-if=\"review.microtask.submission.inDispute\">Function description</span>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"review.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\" ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span >Requesting function</span>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"review.requestingFunction.getFunctionCode()\" highlight=\"[ { 'needle' : review.microtask.pseudoFunctionName , regex: true } ]\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>Detailed Function Description\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"review.funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\" ng-if=\"review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{review.microtask.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteTest.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteTest.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "			<div ng-if=\"review.microtask.promptType=='WRITE'\">\n" +
    "				A worker was asked to implement the following test case for\n" +
    "				the function <strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='CORRECT'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong>  to address the following issue.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong> (if necessary) based on a change to the description of the test case.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong> \n" +
    "				(if necessary) to work correctly with the new function signature specified below.\n" +
    "			</div>\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"review.microtask.submission.inDispute\">\n" +
    "			<div ng-if=\"review.microtask.submission.disputeFunctionText!=''\" >\n" +
    "				A worker reported the following issue with the function\n" +
    "				<strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.submission.disputeTestText!=''\" >\n" +
    "				A worker reported the following issue with the following test case for the function\n" +
    "				<strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "			<span>Can you review this issue?</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\">\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"reviewed.submission.disputeFunctionText!=''\">\n" +
    "			REPORTED FUNCTION DESCRIPTION\n" +
    "		</span>\n" +
    "		<span ng-if=\"reviewed.submission.disputeFunctionText==''\">\n" +
    "			FUNCTION DESCRIPTION\n" +
    "		</span>\n" +
    "	</div>\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\" ng-if=\"reviewed.submission.disputeFunctionText==''\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Test case</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-content\" >\n" +
    "		<span ng-if=\"review.microtask.promptType!='TESTCASE_CHANGED' || reviewed.submission.inDispute\">\n" +
    "			{{reviewed.owningArtifact}}\n" +
    "		</span>\n" +
    "\n" +
    "		<span ng-if=\"review.microtask.promptType=='TESTCASE_CHANGED' && ! reviewed.submission.inDispute\">\n" +
    "			<strong>Old description: </strong><span ng-bind=\"review.microtask.oldTestCase\"></span><br />\n" +
    "			<strong>New description: </strong><span ng-bind=\"review.microtask.owningArtifact\"></span>\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"review.microtask.submission.inDispute\" class=\"section section-review\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{reviewed.submission.disputeTestText}}\n" +
    "		{{reviewed.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"! reviewed.submission.inDispute\" >\n" +
    "	<div class=\"section section-review\">\n" +
    "		<div  class=\"section-title\" ><div class=\"dot bg-color\"></div>submitted TEST</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<table style=\"width:100%\" class=\"test\">\n" +
    "				<tr ng-repeat=\"(inputKey,input) in review.microtask.submission.simpleTestInputs track by $index\">\n" +
    "					<td>{{funct.getParamNameAt($index)}}</td>\n" +
    "					<td>\n" +
    "						<div ace-read-json ng-model=\"input\" ></div>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "				<tr ng-if=\"funct.returnType!=undefined\">\n" +
    "					<td>test output</td>\n" +
    "					<td>\n" +
    "						<div ace-read-json ng-model=\"review.microtask.submission.simpleTestOutput\" ></div>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</table>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteTestCases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteTestCases.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "		<!-- if function description disputed -->\n" +
    "		<div ng-if=\"reviewed.submission.inDispute\" >\n" +
    "			A worker reported an issue with a test case for the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			<span>Can you review this issue?</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- if no function description dispute  AND the prompt type is WRITE   --> \n" +
    "		<div ng-if=\"reviewed.promptType == 'WRITE' && !reviewed.submission.inDispute\" >\n" +
    "			A worker was asked to write test cases for the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- if no function description dispute  AND the prompt type is CORRECTS   -->\n" +
    "		<div ng-if=\"reviewed.promptType == 'CORRECT' && !reviewed.submission.inDispute\" >\n" +
    "			A worker was asked to edit test cases of the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>\n" +
    "			to address an issue found by the crowd.\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<!-- prompt type = WRITE -->\n" +
    "\n" +
    "\n" +
    "<!-- always show the function description --> \n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>function description\n" +
    "	</div>\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- if the function description has been disputed -->\n" +
    "<div class=\"section section-review\" ng-if=\"review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{review.microtask.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<!-- if the function description has not been disputed -->\n" +
    "\n" +
    "<!-- show report data if is a CORRECT -->\n" +
    "<div ng-if=\"reviewed.promptType == 'CORRECT' && !reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			Reported Issue \n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-content\">\n" +
    "			<strong>Test case: </strong>\n" +
    "			<span>{{reviewed.issuedTestCase}}</span>\n" +
    "			<br />\n" +
    "			<strong> Issue: </strong>\n" +
    "			<span>{{reviewed.issueDescription}}</span>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\" ng-if=\"!review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"reviewed.promptType == 'WRITE' && !reviewed.submission.inDispute\" >submitted test cases</span> \n" +
    "		<span ng-if=\"reviewed.promptType == 'CORRECT' && !reviewed.submission.inDispute\" >Revised test cases</span> \n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ul style=\"padding-left:20px\">\n" +
    "			<li ng-repeat=\"tc in review.testcases\">\n" +
    "				\n" +
    "				<span ng-if=\"tc.class != 'chg'\" class=\"{{tc.class}}\" >\n" +
    "					<span ng-if=\"tc.class == 'add'\">+</span>\n" +
    "					<span ng-if=\"tc.class == 'del'\">-</span>\n" +
    "					{{tc.text}}\n" +
    "				</span>\n" +
    "				<span ng-if=\"tc.class == 'chg'\">\n" +
    "					<span class=\"del\">{{tc.old}}</span>\n" +
    "					<strong>changed to </strong>\n" +
    "					<span class=\"add\">{{tc.text}}</span>\n" +
    "				</span>\n" +
    "\n" +
    "			</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/write_call/write_call.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_call/write_call.html",
    "<div ng-controller=\"WriteCallController\" >\n" +
    "\n" +
    "	 \n" +
    "	<div class=\"section section-description \" >\n" +
    "		\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			<div ng-if=\"microtask.pseudoFunctionName!=calleeFunction.getName()\">\n" +
    "				The crowd found that the calls to the function\n" +
    "				<strong>{{ microtask.pseudoFunctionName }}</strong>\n" +
    "				can be implemented by using the function <strong>{{calleeFunction.getName()}}</strong>.\n" +
    "				Based on the description of <strong>{{calleeFunction.getName()}}</strong>\n" +
    "				, can you revise the call(s) to <strong>{{ microtask.pseudoFunctionName }}</strong> ?\n" +
    "				<br />\n" +
    "			</div>\n" +
    "			<div ng-if=\"microtask.pseudoFunctionName==calleeFunction.getName()\">\n" +
    "				The crowd has created a description for the function <strong>{{ microtask.pseudoFunctionName }}</strong>, called by the function below. Based on the description, can you check if the call(s) are correct, and revise them if necessary?\n" +
    "			</div>\n" +
    "			<strong>Tip:</strong> If you know a better way to implement the function, you may revise the function as you see fit.\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'microtasks/reissue_microtask.html'\"></div>\n" +
    "	\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> FUNCTION DESCRIPTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"calleeFunction.getSignature()\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				\n" +
    "                <div class=\"section-title\" > \n" +
    "					<div class=\"dot\"></div> \n" +
    "					<javascript-helper ></javascript-helper>\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" > <div class=\"dot\"></div> AVAILABLE DATA TYPES </div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<ace-edit-js function=\"funct\" editor=\"data.editor\" markers=\"data.markers\"></ace-edit-js>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/write_function/write_function.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_function/write_function.html",
    "<div ng-controller=\"WriteFunctionController\" >\n" +
    "	<div class=\"section section-description \" >\n" +
    "\n" +
    "\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "\n" +
    "			<div ng-if=\"::microtask.promptType=='SKETCH'\">\n" +
    "				Can you write some code in the function below?<br />\n" +
    "				<strong>TIP:</strong> If there’s a lot to do, be sure to use pseudocalls and / or pseudocode to leave some work for others\n" +
    "			</div>\n" +
    "			<div ng-if=\"::microtask.promptType=='RE_EDIT'\">\n" +
    "				The crowd reported an issue with this function. Can you fix the function to address this issue (if necessary)?\n" +
    "			</div>\n" +
    "			<div ng-if=\"::microtask.promptType=='REMOVE_CALLEE'\">\n" +
    "				The crowd has determined that the function <strong>{{callee.getName()}}</strong>, called in the function below, cannot be implemented as requested. Can you replace the call(s) to \n" +
    "				<strong>{{callee.getName()}}</strong> with a new implementation?\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"::microtask.promptType=='DESCRIPTION_CHANGE'\">\n" +
    "				The signature of the following callee has changed as follows. Can you updated the code, if necessary?\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'microtasks/reissue_microtask.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='RE_EDIT' || microtask.promptType=='REMOVE_CALLEE'\" >\n" +
    "		<div class=\"section-title\"> <div class=\"dot bg-color\"></div> Reported Issue </div>\n" +
    "		<div  class=\"section-content\" >\n" +
    "			<span ng-bind=\"::microtask.disputeText\"></span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-description\" ng-if=\"::(microtask.promptType=='SKETCH' || microtask.promptType=='RE_EDIT')\">\n" +
    "		<div class=\"section-title\"> <div class=\"dot bg-color\"></div> Conventions for writing functions </div>\n" +
    "		<div  class=\"section-content\" >\n" +
    "			<function-convections ></function-convections>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='DESCRIPTION_CHANGE'\">\n" +
    "		<div class=\"section-title\" > <div class=\"dot bg-color\"></div> Changes to Function Signature</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"::diffCode\" mode=\"diff\" ></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='REMOVE_CALLEE'\">\n" +
    "		<div class=\"section-title\" > <div class=\"dot bg-color\"></div> Description of Function Call to Remove </div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"::callee.getSignature()\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "	\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\" ng-show=\"!dispute.active\" >\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%;\">\n" +
    "				<div class=\"section-title\" > \n" +
    "					<div class=\"dot\"></div> \n" +
    "					<javascript-helper ></javascript-helper>\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" > <div class=\"dot\"></div> AVAILABLE DATA TYPES </div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div ng-if=\"!funct.readOnly && !dispute.active\" >\n" +
    "					<a class=\"pull-right\" ng-click=\"dispute.toggle(); $event.preventDefault(); $event.stopPropagation();\">\n" +
    "						Report function as impossible (or inadvisable) to implement \n" +
    "						<span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "					</a>\n" +
    "					<div class=\"clearfix\"></div>\n" +
    "				</div>\n" +
    "				<ace-edit-js function=\"funct\" editor=\"data.editor\" hasPseudo=\"data.hasPseudo\"></ace-edit-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"container-flex-row\" ng-show=\"dispute.active\">\n" +
    "			<div class=\"section section-form\" style=\"width:100%\" >\n" +
    "				<div class=\"section-content\">\n" +
    "					<div class=\"heading-1\" >Why should this function not be implemented?</div>\n" +
    "					<textarea \n" +
    "						name=\"disputeFunctionText\" \n" +
    "						class=\"form-control required\" \n" +
    "						style=\"resize:none\" \n" +
    "						ng-model=\"dispute.text\" \n" +
    "						ng-required=\"dispute.active\">\n" +
    "					</textarea>\n" +
    "					<a href=\"#\" class=\"btn btn-sm pull-right\" ng-click=\"dispute.toggle()\" > Go back</a>\n" +
    "				</div>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/write_function_description/write_function_description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_function_description/write_function_description.html",
    "<div ng-controller=\"WriteFunctionDescriptionController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\">\n" +
    "		</div>\n" +
    "		<div class=\"section-content job-description\">\n" +
    "			A worker editing the function <strong>{{ funct.getName() }}</strong> requested that a function <strong>{{ microtask.pseudoFunctionName }}</strong> be created. Can you write a detailed description for the function doSub?\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'microtasks/reissue_microtask.html'\"></div>\n" +
    "	\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTED FUNCTION\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-link\" ng-if=\"!dispute.active\" >\n" +
    "			<a ng-click=\"dispute.toggle(); $event.preventDefault(); $event.stopPropagation();\">\n" +
    "				Report function as impossible (or inadvisable) to implement <span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "			</a>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTING FUNCTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"code\" highlight=\"[ { 'needle' : microtask.pseudoFunctionName , regex: true } ]\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-cols\" ng-if=\"!dispute.active\">\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content\">\n" +
    "					<div class=\"form-horizontal\" role=\"form\" style=\"display:inline-block\">\n" +
    "					  	<div class=\"form-group\">\n" +
    "						    <label for=\"description\" class=\"col-sm-2 control-label reset-padding\">description</label>\n" +
    "						    <div class=\"col-sm-10 reset-padding\">\n" +
    "						      	<textarea class=\"form-control\" name=\"description\" \n" +
    "						      		placeholder=\"briefly describe the purpose and the behavior of the function\" \n" +
    "						      		ng-model=\"model.description\" \n" +
    "						      		ng-model-options=\"{ updateOn: 'blur' }\"  \n" +
    "						      		required \n" +
    "						      		ng-pattern=\"/^[^/\\\\]+$/\" \n" +
    "						      		max-length=\"70\"\n" +
    "						      		focus>\n" +
    "						      	</textarea>\n" +
    "								<div class=\"help-block\" ng-messages=\"microtaskForm.description.$dirty &&microtaskForm.description.$error\">\n" +
    "									<span ng-message=\"required\">\n" +
    "										The description is required!\n" +
    "									</span>\n" +
    "									<span ng-message=\"pattern\">\n" +
    "										The special charachters \"\\\" and \"/\" are not allowed!\n" +
    "									</span>\n" +
    "								</div>\n" +
    "						    </div>\n" +
    "					  	</div>\n" +
    "					  	<div class=\"form-group\">\n" +
    "						    <label for=\"returnType\" class=\"col-sm-2 control-label reset-padding\">return data type</label>\n" +
    "						    <div class=\"col-sm-10 reset-padding\">\n" +
    "						      	<input type=\"text\" class=\"form-control\" name=\"returnType\" \n" +
    "						      		ng-model=\"model.returnType\" \n" +
    "						      		ng-model-options=\"{ updateOn: 'blur' }\"  \n" +
    "						      		adt-validator \n" +
    "						      		required \n" +
    "						      		placeholder=\"return data type\" \n" +
    "						      		press-enter=\"addParameter()\" >\n" +
    "\n" +
    "						    	<div class=\"help-block\" ng-messages=\"microtaskForm.returnType.$dirty &&microtaskForm.returnType.$error\">\n" +
    "									<span ng-message=\"required\">\n" +
    "										The return type is required!\n" +
    "									</span>\n" +
    "									<span ng-message=\"adt\">\n" +
    "										{{microtaskForm.returnType.$error.adt}}\n" +
    "									</span>\n" +
    "								</div>\n" +
    "						    </div>\n" +
    "					  	</div>\n" +
    "					  	<div class=\"form-group\">\n" +
    "						    <label for=\"functionName\" class=\"col-sm-2 control-label reset-padding\">function name</label>\n" +
    "						    <div class=\"col-sm-10 reset-padding\">\n" +
    "						      	<input type=\"text\" \n" +
    "						      		class=\"form-control\" \n" +
    "						      		name=\"functionName\" \n" +
    "						      		ng-model=\"model.functionName\" \n" +
    "						      		ng-model-options=\"{ updateOn: 'blur' }\"  \n" +
    "						      		required \n" +
    "						      		function-name-validator \n" +
    "						      		var-name-validator \n" +
    "						      		reserved-word \n" +
    "						      		placeholder=\"function name\" \n" +
    "						      		press-enter=\"addParameter()\" \n" +
    "						      	>\n" +
    "						    	<div class=\"help-block\" ng-messages=\"microtaskForm.functionName.$dirty &&microtaskForm.functionName.$error\">\n" +
    "									<span ng-message=\"required\">\n" +
    "										The function name is required!\n" +
    "									</span>\n" +
    "									<span ng-message=\"var\">\n" +
    "										The function name can't start with numbers or contain special characters (except the underscore _ )!\n" +
    "									</span>\n" +
    "									<span ng-message=\"function\"> \n" +
    "										The function name is already taken!\n" +
    "									</span>\n" +
    "									<span ng-message=\"reservedWord\">\n" +
    "										The function name is a reserved word of JavaScript!\n" +
    "									</span>\n" +
    "								</div>\n" +
    "						    </div>\n" +
    "					  	</div>\n" +
    "					  	<div class=\"form-group col-sm-12\">\n" +
    "						    <label class=\" control-label col-sm-2 reset-padding\">parameters</label>\n" +
    "							<div class=\"form-group col-sm-10 reset-padding\" >\n" +
    "								<div ng-repeat=\"(index,parameter) in model.parameters\" ng-form=\"param\" >\n" +
    "									<div class=\"form-horizontal\" style=\"display:inline-block\" >\n" +
    "									    <div class=\"col-sm-3 reset-padding\">\n" +
    "									      	<input type=\"text\" class=\"form-control pull-left\" \n" +
    "									      		ng-model=\"parameter.name\" \n" +
    "									      		required \n" +
    "									      		var-name-validator \n" +
    "									      		reserved-word \n" +
    "									      		placeholder=\"name\" \n" +
    "									      		name=\"parameterName\" \n" +
    "									      		unic-name parameters=\"parameters\" \n" +
    "									      		press-enter=\"addParameter()\"/>\n" +
    "										</div>\n" +
    "										<div\n" +
    "										<div class=\"col-sm-3 reset-padding\">\n" +
    "									      	<input type=\"text\" class=\"form-control pull-left\" \n" +
    "									      		name=\"parameterType\" \n" +
    "									      		ng-model=\"parameter.type\" \n" +
    "									      		ng-model-options=\"{ updateOn: 'blur' }\" \n" +
    "									      		required \n" +
    "									      		adt-validator \n" +
    "									      		placeholder=\"type\" \n" +
    "									      		press-enter=\"addParameter()\"/>\n" +
    "										</div>\n" +
    "										<div class=\"col-sm-5 reset-padding\">\n" +
    "									      	<input type=\"text\" class=\"form-control pull-left\" name=\"parameterDescription\" placeholder=\"description\" ng-model=\"parameter.description\" required ng-pattern=\"/^[a-zA-Z0-9_-\\s]+$/\" press-enter=\"addParameter()\"/>\n" +
    "										</div>\n" +
    "										<div class=\"col-sm-1 reset-padding\">\n" +
    "									      	<button ng-click=\"deleteParameter(index)\" class=\"btn  pull-right\">X</button>\n" +
    "									    </div>\n" +
    "									</div>\n" +
    "\n" +
    "\n" +
    "									<div class=\"help-block\" \n" +
    "										ng-messages=\"param.parameterName.$dirty && param.parameterName.$error\">\n" +
    "										<span ng-message=\"required\">\n" +
    "											The parameter name is required!\n" +
    "										</span>\n" +
    "										<span ng-message=\"unic\">\n" +
    "											More occurence of the same parameter name have been found, plese fix them!\n" +
    "										</span>\n" +
    "										<span ng-message=\"var\">\n" +
    "											The parameter name can't start with numbers or contain special characters (except the underscore _ )!\n" +
    "										</span>\n" +
    "										<span ng-message=\"reservedWord\">\n" +
    "											The parameter name is a reserved JavaScript word!\n" +
    "										</span>\n" +
    "									</div>\n" +
    "\n" +
    "									<div class=\"help-block\" ng-messages=\"param.parameterType.$dirty && param.parameterType.$error\">\n" +
    "										<span ng-message=\"required\">\n" +
    "											The type is required!\n" +
    "										</span>\n" +
    "										<span ng-message=\"adt\" >\n" +
    "											{{param.parameterType.$error.adt}}\n" +
    "										</span>\n" +
    "									</div>\n" +
    "\n" +
    "									<div class=\"help-block\" ng-messages=\"param.parameterDescription.$dirty && param.parameterDescription.$error\">\n" +
    "										<span ng-message=\"required\">\n" +
    "											The description is required!\n" +
    "										</span>\n" +
    "										<span ng-message=\"pattern\" >\n" +
    "											Only the special characters _ and - are allowed!\n" +
    "										</span>\n" +
    "									</div>\n" +
    "\n" +
    "							  	</div>\n" +
    "						  	</div>\n" +
    "						</div>\n" +
    "					  	<div class=\"form-group\">\n" +
    "					  		<div class=\"col-sm-12 reset-padding\">\n" +
    "					  			<button ng-click=\"addParameter()\" class=\"btn btn-mini pull-right\">Add Parameter</button>\n" +
    "					  		</div>\n" +
    "					  	</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-form\" ng-if=\"dispute.active\">\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div class=\"heading-1\" >Why is this function impossible (or inadvisable) to implement?</div>\n" +
    "			<textarea \n" +
    "				name=\"disputeFunctionText\" \n" +
    "				class=\"form-control required\" \n" +
    "				style=\"resize:none\" \n" +
    "				ng-model=\"dispute.text\" \n" +
    "				ng-required=\"dispute.active\">\n" +
    "			</textarea>\n" +
    "			<a href=\"#\" class=\"btn btn-sm pull-right\" ng-click=\"dispute.toggle()\" > Go back</a>\n" +
    "		</div>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/write_test/write_test.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_test/write_test.html",
    "<div ng-controller=\"WriteTestController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='WRITE'\">\n" +
    "				Can you implement the following test case, providing a JSON object literal for each input parameter and for the expected return value?<br />\n" +
    "				<strong>Tip:</strong> Descriptions of the data types are on the left, with examples you can copy and paste.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='CORRECT'\">\n" +
    "				The crowd reported an issue with this test. \n" +
    "				Can you fix the test to address this issue (if necessary)?\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				The description of the testCase has changed, as result, the test might be no longer correct.<BR>\n" +
    "				Can you update the test, if necessary?<BR>\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "				The signature or description of the function being tested has changed, as result, the test might be no longer correct.<BR>\n" +
    "				Can you update the test, if necessary?<BR>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-if=\"microtask.reissuedFrom !== undefined\" ng-include=\"'/html/templates/reissue_microtask.html'\"></div>\n" +
    "\n" +
    "	\n" +
    "	<div class=\"section section-description\" ng-if=\"microtask.promptType != 'FUNCTION_CHANGED'\" >\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION</div>\n" +
    "		<div class=\"section-link\" ng-hide=\"funct.readOnly || disputeFunction.active\" >\n" +
    "			<a ng-click=\"disputeFunction.toggle(); $event.preventDefault(); $event.stopPropagation();\">Report an issue with the function <span class=\"glyphicon glyphicon-exclamation-sign\"></span></a>\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "			<ace-read-js ng-if=\"microtask.promptType == 'FUNCTION_CHANGED'\" code=\"diffCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			TEST CASE\n" +
    "		</div>\n" +
    "		<div class=\"section-link\" ng-hide=\"test.readOnly || disputeTest.active\" >\n" +
    "			<a ng-click=\"disputeTest.toggle(); $event.preventDefault(); $event.stopPropagation();\">Report an issue in the test case <span class=\"glyphicon glyphicon-exclamation-sign\"></span></a>\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<span ng-if=\"microtask.promptType=='WRITE' || microtask.promptType=='FUNCTION_CHANGED' || microtask.promptType=='CORRECT'\" ng-bind=\"::test.description\"></span>\n" +
    "\n" +
    "			<span ng-if=\"microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				<strong>Old description: </strong><span ng-bind=\"microtask.oldTestCase\"></span><br />\n" +
    "				<strong>New description: </strong><span ng-bind=\"::test.description\"></span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='CORRECT'\" >\n" +
    "		<div class=\"section-title\"> <div class=\"dot bg-color\"></div> ISSUE DESCRIPTION </div>\n" +
    "		<div  class=\"section-content\" >\n" +
    "			<span ng-bind=\"::microtask.issueDescription\"></span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-description\" ng-if=\"microtask.promptType == 'FUNCTION_CHANGED'\" >\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>DIFF OF THE FUNCTION DESCRIPTION</div>\n" +
    "		<div class=\"section-link\" ng-hide=\"funct.readOnly || disputeFunction.active\" >\n" +
    "			<a ng-click=\"disputeFunction.toggle(); $event.preventDefault(); $event.stopPropagation();\">Report an issue in the function description<span class=\"glyphicon glyphicon-exclamation-sign\"></span></a>\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"diffCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "	<div class=\"section-cols\" ng-if=\"! disputeTest.active && !disputeFunction.active\">\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "\n" +
    "					<div class=\"heading-1\" >Input Parameters</div>\n" +
    "                    <table style=\"width:100%\" class=\"test\" ng-form=\"inputForm\" \n" +
    "                    	   ng-repeat=\"(index,parameter) in funct.getParameters()\">\n" +
    "                        <tr>\n" +
    "                            <td>\n" +
    "                            	{{parameter.name}}\n" +
    "					            <br />\n" +
    "					            <small>{{parameter.type}}</small>\n" +
    "                            </td>\n" +
    "                            <td>\n" +
    "								<ace-edit-json \n" +
    "									tabindex=\"{{index*5+1}}\" \n" +
    "									focus-if=\" index == 0 \" \n" +
    "									ng-model=\"testData.inputs[index]\" \n" +
    "									min-lines=\"2\"\n" +
    "									>\n" +
    "								</ace-edit-json>\n" +
    "\n" +
    "								<textarea type=\"text\" \n" +
    "									ng-model=\"testData.inputs[index]\"\n" +
    "									name=\"{{parameter.name}}\"\n" +
    "									ng-show=\"false\"\n" +
    "									required\n" +
    "									json-data-type=\"{{parameter.type}}\" />\n" +
    "\n" +
    "								<div class=\"help-block pull-left\" ng-show=\"inputForm.$dirty\" ng-messages=\"inputForm[parameter.name].$error\">\n" +
    "								    <div ng-message=\"required\">Please, fill this field</div>\n" +
    "								    <div ng-message=\"jsonDataType\">\n" +
    "								    	<span ng-repeat=\"e in inputForm[parameter.name].$error.jsonErrors\" ng-bind=\"e\"></span>\n" +
    "								    </div>\n" +
    "							  	</div>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                        <tr>\n" +
    "                        	<td colspan=\"2\">\n" +
    "                            	<a href=\"#\" tabindex=\"{{index*5+2}}\" examples-list param-type=\"parameter.type\" key = \"index\" value=\"testData.inputs[index]\">Paste Example</a>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </table>\n" +
    "\n" +
    "                    <div class=\"heading-1\" >Return Value </div>\n" +
    "                    <table style=\"width:100%\" class=\"test\" ng-form=\"outputForm\"  >\n" +
    "                        <tr>\n" +
    "                            <td>\n" +
    "                            	<small>{{funct.getReturnType()}}</small>\n" +
    "                            </td>\n" +
    "                            <td>\n" +
    "								<ace-edit-json \n" +
    "									tabindex=\"96\" \n" +
    "									ng-model=\"testData.output\" \n" +
    "									min-lines=\"2\"\n" +
    "									>\n" +
    "								</ace-edit-json>\n" +
    "\n" +
    "								<textarea type=\"text\" \n" +
    "									ng-model=\"testData.output\"\n" +
    "									name=\"output\"\n" +
    "									ng-show=\"false\"\n" +
    "									required\n" +
    "									json-data-type=\"{{funct.getReturnType()}}\" />\n" +
    "\n" +
    "								<div class=\"help-block pull-left\" ng-show=\"outputForm.$dirty\" ng-messages=\"outputForm.output.$error\">\n" +
    "								    <div ng-message=\"required\">Please, fill this field</div>\n" +
    "								    <div ng-message=\"jsonDataType\">\n" +
    "								    	<span ng-repeat=\"e in outputForm.output.$error.jsonErrors\" ng-bind=\"e\"></span>\n" +
    "								    </div>\n" +
    "							  	</div>\n" +
    "\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                        <tr>\n" +
    "                        	<td colspan=\"2\">\n" +
    "                            	<a href=\"#\" tabindex=\"97\" examples-list param-type=\"funct.returnType\" key = \"'-1'\" value='testData.output' >Paste Example</a>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </table>\n" +
    "\n" +
    "\n" +
    "\n" +
    "				</div> <!-- ./ SECTION CONTENT -->\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-form\" ng-show=\"disputeFunction.active\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Report an issue in the function\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div id=\"disputeDiv\" class=\"form-group\">\n" +
    "				<label for=\"disputeText\">What's wrong with this function description? </label>\n" +
    "				<textarea name=\"disputeText\" class=\"form-control\" style=\"resize:none\" ng-model=\"disputeFunction.text\" ng-required=\"disputeFunction.active\"></textarea>\n" +
    "				<span\n" +
    "				class=\"help-block\" ng-show=\"microtaskForm.disputeText.$dirty && microtaskForm.disputeText.$invalid && microtaskForm.disputeText.$error.required\">This field is required!</span>\n" +
    "				<br>\n" +
    "				<button class=\"btn btn-sm pull-right\" ng-click=\"disputeFunction.toggle()\" >Nothing is wrong</button>\n" +
    "			</div>\n" +
    "		</div> \n" +
    "	</div> \n" +
    "\n" +
    "	<div class=\"section section-form\" ng-show=\"disputeTest.active\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> Report an issue in THE TEST CASE\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div id=\"disputeDiv\" class=\"form-group\">\n" +
    "				<label for=\"disputeTextInput\">What’s wrong with this test case? </label>\n" +
    "				<textarea name=\"disputeTextInput\" class=\"form-control\" class=\"resize:none\" ng-model=\"disputeTest.text\"  ng-required=\"disputeTest.active\"></textarea>\n" +
    "				<span\n" +
    "				class=\"help-block\" ng-show=\"microtaskForm.disputeTextInput.$dirty && microtaskForm.disputeTextInput.$invalid && microtaskForm.disputeTextInput.$error.required\">This field is required!</span>\n" +
    "				<br>\n" +
    "				<button class=\"btn btn-sm pull-right \" ng-click=\"disputeTest.toggle()\" >Nothing is wrong</button>\n" +
    "			</div>\n" +
    "		</div> <!-- /. WRITE TEST DIV -->\n" +
    "	</div> <!-- ./ SECTION CONTENT -->\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/write_test_cases/write_test_cases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_test_cases/write_test_cases.html",
    "<div ng-controller=\"WriteTestCasesController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			\n" +
    "\n" +
    "			<div ng-show=\"microtask.promptType=='WRITE'\" >\n" +
    "				{{skipMicrotaskIn}}\n" +
    "				Can you describe some test cases in which this function might be used? <br />\n" +
    "				Are there any unexpected corner cases that might not work? <br/>\n" +
    "				<strong>TIP:</strong> You don’t need to specify concrete, executable tests, only high-level descriptions of scenarios to be tested.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-show=\"microtask.promptType=='CORRECT'\" >\n" +
    "				The crowd has reported an issue with one of the test cases for the function \n" +
    "				<strong>{{microtask.owningArtifact}}</strong>.<br>\n" +
    "				Can you fix the test case (and others if necessary)?\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'microtasks/reissue_microtask.html'\"></div>\n" +
    "	\n" +
    " 	<div ng-if=\"microtask.issuedTestCase != ''\">\n" +
    "		<div class=\"section section-description\"  >\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>\n" +
    "				Reported Issue\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section-content\">\n" +
    "\n" +
    "				<strong> Test case: </strong>\n" +
    "				<span>{{microtask.issuedTestCase}}</span>\n" +
    "				<br />\n" +
    "				<strong> Issue: </strong>\n" +
    "				<span>{{microtask.issueDescription}}</span>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    " 	</div>\n" +
    "	\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-description\" id=\"functionSignature\">\n" +
    "\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			FUNCTION DESCRIPTION\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-link\" ng-hide=\"funct.readOnly || dispute.active\" >\n" +
    "			<a ng-click=\"dispute.toggle(); $event.preventDefault(); $event.stopPropagation();\">\n" +
    "				Report an issue with the function <span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "			</a>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-content no-padding\">\n" +
    "			<ace-read-js code=\"::funct.getSignature()\" ></ace-read-js>\n" +
    "		</div>\n" +
    "		\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "			\n" +
    "	<div class=\"section-cols\" ng-if=\"!dispute.active\" >\n" +
    "\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\" id=\"example\">\n" +
    "				<!--<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					EXAMPLE\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<div class=\"accordion-inner\">\n" +
    "						subtract(a, b)<BR>\n" +
    "\n" +
    "						<B>Here are some test cases:</B><BR>\n" +
    "						a is greater than b<BR>\n" +
    "						b is greater than a<BR>\n" +
    "						a is the same as b<BR>\n" +
    "						a is positive, b is negative<BR>\n" +
    "						a is negative, b is zero<BR>\n" +
    "						a is positive, b is zero<BR>\n" +
    "					</div>\n" +
    "				</div>-->\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" id=\"form\" >\n" +
    "\n" +
    "				<div class=\"section-title no-padding\" >\n" +
    "					<div class=\"input-group\" ng-form=\"newForm\">\n" +
    "				    	<input type=\"text\"\n" +
    "				      		tabindex=\"1\"\n" +
    "				      		name=\"newTestCase\"\n" +
    "							ng-model=\"model.newTestCase\"\n" +
    "							press-enter=\"addTestCase()\"\n" +
    "							placeholder=\"Describe a test case\"\n" +
    "				      		class=\"form-control\"\n" +
    "				      		focus\n" +
    "				      	>\n" +
    "						<span class=\"input-group-btn\">\n" +
    "							<button class=\"btn btn-default\" ng-click=\"addTestCase()\" type=\"button\" tabindex=\"2\">\n" +
    "								<span class=\"glyphicon glyphicon-plus\"></span>\n" +
    "							</button>\n" +
    "						</span>\n" +
    "				    </div>\n" +
    "\n" +
    "				</div>\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "\n" +
    "					<div class=\"list-group\" >\n" +
    "						<div ng-form=\"testCase\" ng-repeat=\"(index,test) in model.testcases | filter: { deleted:false }\" class=\"list-item input-group input-group-sm animate-repeat\">\n" +
    "						  	<input ng-if=\"!test.readOnly\" type=\"text\" class=\"form-control\" \n" +
    "							    placeholder=\"Describe a test case\"\n" +
    "							  	name=\"testcase\"\n" +
    "								ng-model=\"test.text\"\n" +
    "								press-enter=\" editMode = testCaseForm.testcase.$invalid ? true : false \"\n" +
    "							    ng-focus=\"editMode=true\"\n" +
    "							    ng-blur=\"editMode=false\"\n" +
    "							    ng-readonly=\"test.readOnly\"\n" +
    "\n" +
    "							    tabindex=\"{{2*index+2}}\"\n" +
    "							    required\n" +
    "							>\n" +
    "							<input ng-if=\"test.readOnly\" type=\"text\" class=\"form-control\" \n" +
    "							  	name=\"testcase\"\n" +
    "								ng-model=\"test.text\"\n" +
    "							    readonly \n" +
    "							    data-placement=\"left\"\n" +
    "							    data-trigger=\"hover\" \n" +
    "							    data-title=\"this test case cannot be edited or removed\" \n" +
    "							    bs-tooltip\n" +
    "							>\n" +
    "					  		<span class=\"input-group-btn\" >\n" +
    "					  			<button class=\"btn\"  tabindex=\"{{2*index+3}}\" ng-click=\"removeTestCase($index)\" type=\"button\">\n" +
    "					  				<span class=\"glyphicon glyphicon-remove\" ng-hide=\"test.readOnly\" ></span>\n" +
    "					  			</button>\n" +
    "							</span>\n" +
    "						</div>\n" +
    "\n" +
    "							\n" +
    "							<div class=\"help-block\" ng-if=\"microtaskForm.$invalid\">\n" +
    "								a test case name can't be empty!\n" +
    "							</div>\n" +
    "					</div>\n" +
    "\n" +
    "					<span ng-if=\"model.testcases.length == 0\" >write at least one test case</span>\n" +
    "					\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-form\" ng-if=\"dispute.active\">\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div class=\"heading-1\" >what's wrong with this FUNCTION DESCRIPTION?</div>\n" +
    "			<textarea \n" +
    "				name=\"disputeTextInput\" \n" +
    "				class=\"form-control required\" \n" +
    "				style=\"resize:none\" \n" +
    "				ng-model=\"dispute.text\" \n" +
    "				ng-required=\"dispute.active\">\n" +
    "			</textarea>\n" +
    "			<a href=\"#\" class=\"btn btn-sm pull-right\" ng-click=\"dispute.toggle()\" > Nothing is wrong</a>\n" +
    "		</div> \n" +
    "\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "\n" +
    "	</div> \n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("newsfeed/news_panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_panel.html",
    "<h3 class=\"toggler\">Your activities</h3>\n" +
    "<div id=\"activityPanel\"  class=\"element active\"  style=\"height:40%\">\n" +
    "	<div class=\"element-body scrollable\">\n" +
    "		<div>\n" +
    "			<ul class=\"sidebar-list news\">\n" +
    "				<li microtask-popover\n" +
    "					class=\"news-element {{ n.microtaskType | lowercase }}\"\n" +
    "					ng-if=\"news.length > 0\" \n" +
    "					ng-repeat=\"n in news | orderBy:'-timeInMillis'\" \n" +
    "					ng-mouseenter=\"showMicrotaskPopover(n)\" \n" +
    "					>\n" +
    "					<div class=\"type\">{{::n.microtaskType}}</div>\n" +
    "					<div class=\"result\" ng-if=\"::(n.score != -1)\">\n" +
    "						<!--<span ng-if=\"::(n.score < 3)\" class=\"rejected\" >REJECTED</span>-->\n" +
    "						<span ng-if=\"::(n.score <= 3)\" class=\"reissued\">REISSUED</span>\n" +
    "						<span ng-if=\"::(n.score > 3)\" class=\"accepted\">ACCEPTED</span>\n" +
    "					</div>\n" +
    "					<span class=\"points\">{{::n.awardedPoints}}/<small>{{::n.maxPoints}}</small> pts</span>\n" +
    "					\n" +
    "			  		<div class=\"clearfix\"></div>\n" +
    "				</li>\n" +
    "			</ul>\n" +
    "			<div ng-if=\"news.length == 0\" >\n" +
    "				no news yet!\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "		        	\n" +
    "");
}]);

angular.module("newsfeed/news_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover.html",
    "<div class=\"popover popover-news task-{{ n.microtaskType | lowercase }}\" tabindex=\"-1\">\n" +
    "    <button type=\"button\" class=\"close popover-close\" ng-click=\"$hide()\">&times;</button>\n" +
    "    <h3 class=\"popover-title\"><b>Your work on: &emsp; </b> \n" +
    "        <span class=\"microtask-title\" ng-if=\"! n.isReview\">{{n.microtask.title}} </span>\n" +
    "        <span class=\"microtask-title\" ng-if=\"n.isReview\"> review</span>\n" +
    "    </h3>\n" +
    "    <!-- MICROTASK DATA -->\n" +
    "    <div ng-if=\"n.microtask.type\" ng-include=\"'newsfeed/news_popover_' + n.microtask.type + '.html'\"></div>\n" +
    "    <!-- REVIEW SCORE -->\n" +
    "    <div ng-if=\"n.qualityScore\">\n" +
    "        <h3 class=\"popover-title \" ng-if=\"! n.isReview\"><b>Score received:</b> </h3>\n" +
    "        <h3 class=\"popover-title \" ng-if=\"n.isReview\"><b>Given score:</b> </h3>\n" +
    "        <div  class=\"section section-description\">\n" +
    "            <div class=\"section-content\" >\n" +
    "                <span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\"  class=\"rating-star {{ n.qualityScore >= currentValue ? 'full' : '' }}\"></span>\n" +
    "                <span class=\"clearfix\"></span><br />\n" +
    "                <span ng-if=\"n.reviewText\"> <b>Review: </b>{{n.reviewText}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("newsfeed/news_popover_DebugTestFailure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_DebugTestFailure.html",
    "<div ng-if=\"review.microtask.submission.hasPseudo\">\n" +
    "    <div class=\"section section-description \" >\n" +
    "        <div class=\"section-content job-description\" >\n" +
    "            Debug of the function <strong>{{ n.funct.getName() }}</strong>.\n" +
    "            Can you review this work?\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"section section-review\" >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>Code of the function\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getFullCode()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"! review.microtask.submission.hasPseudo\">\n" +
    "\n" +
    "\n" +
    "    <div class=\"section section-description \" >\n" +
    "        <div class=\"section-content job-description\" >\n" +
    "\n" +
    "            Issue of the following test case for the function <strong>{{n.funct.getName()}}</strong>.\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"section section-description\">\n" +
    "        <div class=\"section-title\">\n" +
    "            <div class=\"dot bg-color\"></div>\n" +
    "            <span >FUNCTION DESCRIPTION </span>\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getSignature()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"(key, test) in n.tests\">\n" +
    "        <div class=\"section section-description\">\n" +
    "            <div class=\"section-title\" ><div class=\"dot bg-color\"></div>test case</div>\n" +
    "            <div class=\"section-content\" >\n" +
    "                {{test.getDescription()}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"section section-description\">\n" +
    "            <div  class=\"section-title\" ><div class=\"dot bg-color\"></div>TEST</div>\n" +
    "            <div class=\"section-content\" >\n" +
    "                <table style=\"width:100%\" class=\"test\">\n" +
    "                    <tr ng-repeat=\"(inputKey,input) in test.getSimpleTest().inputs track by $index\">\n" +
    "                        <td>{{n.funct.getParamNameAt($index)}}</td>\n" +
    "                        <td>\n" +
    "                            <div ace-read-json ng-model=\"input\" ></div>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                    <tr >\n" +
    "                        <td>test output</td>\n" +
    "                        <td>\n" +
    "                            <div ace-read-json ng-model=\"test.getSimpleTest().output\" ></div>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"section section-review\">\n" +
    "            <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "            <div class=\"section-content\" >\n" +
    "                {{test.disputeText}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("newsfeed/news_popover_ReuseSearch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_ReuseSearch.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        Function providing the behavior \n" +
    "        of <strong>{{n.microtask.pseudoFunctionName}}</strong> in <strong>{{n.funct.getName()}}</strong>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>REQUESTED BEHAVIOR\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-description-2\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>requesting function\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.funct.getFunctionCode()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>Function Found\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" ng-if\"n.calleeFunction\">\n" +
    "        <ace-read-js code=\"n.calleeFunction.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" ng-if\" ! n.calleeFunction\">\n" +
    "        A new function will be created\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteCall.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteCall.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        Edit of the function <strong>{{n.funct.getName()}}</strong> for revising the call to\n" +
    "        <strong>{{n.calleeFunction.getName()}}</strong>.\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.calleeFunction.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>Edits to Function\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.funct.getFullCode()\" mode=\"diff\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteFunction.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteFunction.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "           The function <strong>{{n.funct.getName()}}</strong> was not implementable.\n" +
    "        </div>\n" +
    "        <div ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.promptType == 'SKETCH'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType == 'RE_EDIT'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong> to address an issue reported by the crowd.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong> based on a change to the signature of a function it calls.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='REMOVE_CALLEE'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong> to replace the call(s) to <strong>{{n.callee.getName()}}</strong> with a new implementation.\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section section-description-2\" ng-if=\"n.microtask.disputeText.length > 0\">\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>Reported Issue\n" +
    "        </div>\n" +
    "        <div class=\"section-content\">\n" +
    "            {{n.microtask.disputeText}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div ng-if=\"n.microtask.promptType == 'REMOVE_CALLEE'\">\n" +
    "        <div class=\"section section-description-2\">\n" +
    "            <div class=\"section-title\" >\n" +
    "                <div class=\"dot bg-color\"></div>Description of Function Call to Remove\n" +
    "            </div>\n" +
    "            <div class=\"section-content no-padding\" >\n" +
    "                <ace-read-js code=\"n.callee.getSignature()\" ></ace-read-js>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div ng-if=\"n.microtask.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "        <div class=\"section section-description-2\">\n" +
    "            <div class=\"section-title\" >\n" +
    "                <div class=\"dot bg-color\"></div>Changes to Function Signature\n" +
    "            </div>\n" +
    "            <div class=\"section-content no-padding\" >\n" +
    "                <ace-read-js code=\"n.calledDiffCode\" mode=\"diff\"></ace-read-js>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"section section-review\" >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>submitted function\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getFullCode()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section section-description-2\">\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>reported function\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getFullCode()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"section section-review\">\n" +
    "        <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "        <div class=\"section-content\" >\n" +
    "            {{n.microtask.submission.disputeFunctionText}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteFunctionDescription.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteFunctionDescription.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        <div ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "            Detailed description for the following requested function.\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "            request that the following function not be implemented.\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        <span ng-if=\"! n.microtask.submission.inDispute\">Requested Function</span>\n" +
    "        <span ng-if=\"n.microtask.submission.inDispute\">Function description</span>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"section-content no-padding\" >\n" +
    "        <ace-read-js code=\"n.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\" ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        <span >Requesting function</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"section-content no-padding\" >\n" +
    "        <ace-read-js code=\"n.requestingFunction.getFunctionCode()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>Detailed Function Description\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.functionDescription\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\" ng-if=\"n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        {{n.microtask.submission.disputeFunctionText}}\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteTest.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteTest.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        <div ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.promptType=='WRITE'\">\n" +
    "                Implementation of the following test case for\n" +
    "                the function <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='CORRECT'\">\n" +
    "                Revision of the following test for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>  to address the following issue.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "                Revision test for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong> based on a change to the description of the test case.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "                Revision of the following test for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>\n" +
    "                based on the new function signature.\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.submission.disputeFunctionText!=''\" >\n" +
    "                Reported issue with the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.submission.disputeTestText!=''\" >\n" +
    "                Reported issue with the following test case for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\">\n" +
    "    <div class=\"section-title\">\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        <span ng-if=\"n.submission.disputeFunctionText!=''\">\n" +
    "            REPORTED FUNCTION DESCRIPTION\n" +
    "        </span>\n" +
    "        <span ng-if=\"n.submission.disputeFunctionText==''\">\n" +
    "            FUNCTION DESCRIPTION\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"section-content no-padding\" >\n" +
    "        <ace-read-js code=\"n.funct.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\" ng-if=\"n.microtask.submission.disputeFunctionText==''\">\n" +
    "    <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Test case</div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <span ng-if=\"n.microtask.promptType!='TESTCASE_CHANGED' || n.microtask.submission.inDispute\">\n" +
    "            {{n.microtask.owningArtifact}}\n" +
    "        </span>\n" +
    "\n" +
    "        <span ng-if=\"n.microtask.promptType=='TESTCASE_CHANGED' && ! n.microtask.submission.inDispute\">\n" +
    "            <strong>Old description: </strong><span ng-bind=\"n.microtask.oldTestCase\"></span><br />\n" +
    "            <strong>New description: </strong><span ng-bind=\"n.microtask.owningArtifact\"></span>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"n.microtask.submission.inDispute\" class=\"section section-review\">\n" +
    "    <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        {{n.microtask.submission.disputeTestText}}\n" +
    "        {{n.microtask.submission.disputeFunctionText}}\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"! n.microtask.submission.inDispute\" >\n" +
    "\n" +
    "    <div class=\"section section-review\">\n" +
    "        <div  class=\"section-title\" ><div class=\"dot bg-color\"></div>submitted TEST</div>\n" +
    "        <div class=\"section-content\" >\n" +
    "            <table style=\"width:100%\" class=\"test\">\n" +
    "                <tr ng-repeat=\"(inputKey,input) in n.microtask.submission.simpleTestInputs track by $index\">\n" +
    "                    <td>{{n.funct.getParamNameAt($index)}}</td>\n" +
    "                    <td>\n" +
    "                        <div ace-read-json ng-model=\"input\" ></div>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>test output</td>\n" +
    "                    <td>\n" +
    "                        <div ace-read-json ng-model=\"n.microtask.submission.simpleTestOutput\" ></div>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </table>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("newsfeed/news_popover_WriteTestCases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteTestCases.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        <div ng-if=\" ! n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.promptType=='WRITE'\">\n" +
    "                Test cases for the function <strong>{{n.funct.getName()}}</strong>\n" +
    "            </div>\n" +
    "            <div ng-if=\"n.microtask.promptType=='CORRECT'\">\n" +
    "               Test cases for the function <strong>{{n.funct.getName()}}</strong>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "            Reported the function <strong>{{n.funct.getName()}}</strong>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- FUNCTION CODE -->\n" +
    "<div class=\"section section-description\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        FUNCTION DESCRIPTION:\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.funct.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        SUBMITTED TEST CASES:\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ul style=\"list-style:none\">\n" +
    "            <li class=\"\" ng-repeat=\"testcase in n.testcases\"><strong>#{{$index+1}}</strong> {{testcase.text}}</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        Reported Issue:\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        {{review.microtask.submission.disputeFunctionText}}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("tutorials/DebugTestFailure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/DebugTestFailure.html",
    "<step>\n" +
    "	<div class=\"title\">Debug a test failure</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/microtask.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			In Debug a Test Failure, your goal is to find and correct any bug(s) that caused a function to fail <strong>one</strong> of its unit tests.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">	\n" +
    "		<p style=\"width:500px\">\n" +
    "			CrowdCode provides a test runner listing the result of the test to debug ( failing test panel ) \n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/failing.png\" />\n" +
    "\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			and the results of the previous passing function’s tests, if any ( other tests panel ). <br />\n" +
    "			Failing tests are marked with <strong style=\"background-color:#F7B2B2\">red</strong> and passing tests with <strong style=\"background-color:#CFF5BF;\">green</strong>\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/others.png\" />\n" +
    "\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			<strong>Your goal</strong> is to use the provided tools to make the <strong>failing test</strong> pass without letting the other tests fail!\n" +
    "		</p>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/detail.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			Each test result lists the inputs and outputs for the test, as well as information about errors (if any). \n" +
    "		</p>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			For failed tests, the default view shows you the <strong>diff</strong> between the expected and the actual return value. <br />\n" +
    "		</p>\n" +
    "\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/diff_mode.png\" />\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			Green background is the the expected field value and red background is the actual field value. \n" +
    "			The fields without a background color, have the same value.\n" +
    "		</p>\n" +
    "		\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			You can always switch to the <strong>normal</strong> mode. \n" +
    "		</p>\n" +
    "\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/normal_mode.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/code.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			The function code editor is the main tool of the CrowdCode debugger. \n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If during the execution of the current test, one exception is raised, \n" +
    "			you can see the details hovering the mouse on the <strong>x</strong> icon.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/error.png\" />\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/console.png\" />\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			You can monitor a value during the text execution using \n" +
    "			the <strong>console.log(...)</strong> function. \n" +
    "			When you use console.log(...) and re-run the tests, values are shown passing with the mouse by the <b>i</b> icon.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			What happens if the bug is not in the function itself but is in a function that it calls? \n" +
    "			All the functions called during the current test execution, are highlighted in the code editor window.\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/highlight.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">By clicking on the highlighted functions, you can see the <strong>stubs</strong> popup for that callee. It shows you all the sets of input with whom the function has been called and, for each set of input, you are allowed to edit the return value. </p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/stubs.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "		For example, here a function sum is being called with the parameters 100 and 40 and is returning the output of 142. This does not seem to match its specified behavior. To solve this problem, you can edit the return value, replacing 142 with 140. This creates a stub. <br /> When you re-run the tests, CrowdCode will use the return value specified by the stub rather than the actual return value, executing the function call as if it had returned 140. After submitting the Debug microtask, each stub will be translated into a test for the called function, expressing the desired behavior.</p>\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:400px\">\n" +
    "			After doing changes to the function code or to the stubs, re-run the tests to see the changes\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/run.png\" />\n" +
    "	\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			It might also be that the function itself is correct and the test data is wrong. \n" +
    "			In this case, you should report an issue with the test.\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/reported.png\" />\n" +
    "	\n" +
    "		<p style=\"width:300px\">\n" +
    "			Reported tests are marked with <strong style=\"background-color:#FFB280\">orange</strong>.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:300px\">\n" +
    "			<strong>Remember:</strong> you can submit the microtask only if all the tests are passing (or you disputed the failing tests).\n" +
    "		</p>\n" +
    "		\n" +
    "		<p style=\"width:300px\">\n" +
    "			If you think that the function is far to be complete, sketch some behavior with <strong>pseudocode</strong> or \n" +
    "			<strong>function stubs</strong> and submit it ( In case of pseudocode or function stubs present in the function code, you can submit with failing tests too).\n" +
    "		</p>\n" +
    "	\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/ReuseSearch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/ReuseSearch.html",
    "<step>\n" +
    "	<div class=\"title\">Reuse search</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/reusesearch/microtask.png\" />\n" +
    "		<p style=\"width:500px\">In Reuse Search, your goal is to identify a function best matching the specified function call, or determine that no such function yet exists.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<img src=\"/img/tutorial/reusesearch/searchbox.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			To search for functions, you can type text in the textbox. So, to find a sum function, you might search for <strong>“sum”</strong>. Of course, a function might be described differently, so you might need to try other queries.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<img src=\"/img/tutorial/reusesearch/nofunction.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			After finding a matching function, select the function to choose it. Or if no such functions exists, select <strong>“No function found”</strong>.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/Review.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/Review.html",
    "<step>\n" +
    "	<div class=\"title\">Review </div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/review/microtask.png\" />\n" +
    "		<p>In Review Work, your goal is to assess work submitted by the crowd.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			The submitted work is inside the orange-bordered box. <br />\n" +
    "			What rating do you think this work should receive?\n" +
    "\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/submission.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you rate work with <strong>1 to 3 stars</strong>, the work will be marked as needing revision. In this case, you must describe aspects of the work that you feel must be improved.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/revise.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you feel that the work as submitted is already of high quality, you should rate it with <strong>4 or 5 stars</strong>. In this case, the work will be accepted as is. You can also (optionally) include a message describing your assessment of the work, which will be provided back to the crowd worker that did the work.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/accepted.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteCall.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteCall.html",
    "<step>\n" +
    "	<div class=\"title\">Add call</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writecall/microtask.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			In Add a Call, your goal is to revise all the occurrences of a specified function call.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			For example, in the following code:\n" +
    "\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/writecall/before.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			the task is to replace the call <strong>doSum(...)</strong> with a call to the function <strong>sum(...)</strong>, putting the right parameters in the right places and ensuring the result has the right type and interpretation.  <br />\n" +
    "			So the code becomes: \n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/writecall/after.png\" />\n" +
    "\n" +
    "		<p  style=\"width:500px\">\n" +
    "			You might also decide that the specified call doesn’t make any sense at all and remove it. Or you might decide that a different function is required and write another </strong>function stub</strong>. Your overall goal is to replace the call and logic surrounding it with something better; you can decide how to do that. \n" +
    "\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteFunction.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteFunction.html",
    "<step>\n" +
    "	<div class=\"title\">Edit a function</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/microtask.png\" />\n" +
    "		<p  style=\"width:500px\">\n" +
    "			In Edit a Function, your goal is to improve the implementation of a function.\n" +
    "		</p>\n" +
    "		<p  style=\"width:500px\">\n" +
    "			In CrowdCode, functions may contain code, <strong>pseudocode</strong>, and other <strong>function stubs</strong>. \n" +
    "			In Edit a Function, your goal is not necessarily to finish a complete implementation of a function. Rather, you may decide to <strong>sketch</strong> some of the behavior using psuedocode and describe some operation that’s best done in another function using a <strong>function stub</strong>. \n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/code.png\" />\n" +
    "		<p style=\"width:550px\">\n" +
    "			<strong>Pseudocode</strong> (sections of a line beginning with //#) allows you to sketch algorithms or partial solutions, enabling the crowd to determine how best the algorithm or solution should be accomplished. \n" +
    "\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/code.png\" />\n" +
    "		<p style=\"width:550px\">\n" +
    "			In CrowdCode, you edit code with a local view of the codebase, seeing only the current function on which you are working.  <strong>When you need to call another function</strong>, you have to add a sketch of the called function header with an empty body at the bottom of the code editor window (eventually providing an one-line description of what the function is supposed to do). \n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:300px\">\n" +
    "			<strong>Remember</strong>: Using <strong>pseudocode</strong> and <strong>function stubs</strong> provides an opportunity for the crowd to contribute. Small contributions are encouraged!\n" +
    "			<!--For a function with large and complex behavior, sketching some of the behavior provides opportunities for the crowd to consider how it best be done. Rather than build a single monolithic function, function stubs provides an opportunity for code to be decomposed into cohesive functions that can be reused. And - most importantly - function stubs provides an opportunity for many to work on each requested function in parallel.-->\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			In editing a function code, you are allowed to add at most 10 new <a href=\"http://en.wikipedia.org/wiki/Statement_%28computer_science%29\" target=\"_blank\" >statements</a>.\n" +
    "		</p>	\n" +
    "		<img src=\"/img/tutorial/writefunction/statements.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			The bar on the bottom of the code editor window, represents the remaining number of statements you can add.<br />\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:550px\">\n" +
    "			If you think that the function signature have to be changed (i.e. an additional parameter is required, or the function itself is poorly written) you may edit the header of the function; the crowd will then update any callers of the function to match its new specification.<br />\n" +
    "			<b>Note: </b> \n" +
    "			you are not allowed to change the description of the core API functions (the functions requested by the client).\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/data_types.png\" />\n" +
    "		<p style=\"width:280px\">\n" +
    "			In CrowdCode, all parameters are specified with a data type. CrowdCode provides an Available Data Types panel enabling you to browse the description of data types and see examples.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you discover that the function is impossible or inadvisable to implement (i.e. a function that need to use global variables), you should report the issue:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writefunction/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteFunctionDescription.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteFunctionDescription.html",
    "<step>\n" +
    "	<div class=\"title\">Write function description</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/microtask.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			In Write Function Description, your goal is to write a detailed description for a function call, including its name, parameters, return value, and description.\n" +
    "\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			For example, for the sum function call, you might specify the function as: \n" +
    "\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/form.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/datatypes.png\" />\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			In CrowdCode, all parameters are specified using a data type. The Data Types panel lets you view descriptions and examples.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			In writing the function description, you may discover that the function is impossible or inadvisable to implement (i.e. a function that need to use global variables). If you feel this to be the case, you should report the issue:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteTest.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteTest.html",
    "<step>\n" +
    "	<div class=\"title\">Write test</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writetest/microtask.png\" />\n" +
    "		<p>In Write a Test, your goal is to implement a test case.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Given a description of a test case and function to be tested,\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/context.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			your task is to implement the test case, providing concrete values for the specified scenario.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/data.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			Each value is specified as either a primitive or a JSON literal describing a data structure value. Pretty easy, right?\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:300px\">\n" +
    "			JSON literals can become long and complex:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/data_advanced.png\" />\n" +
    "		<p style=\"width:300px\">\n" +
    "			But CrowdCode provides examples of each data type. \n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/example.png\" />\n" +
    "		<p style=\"width:300px\">You can use <b>Paste Example</b> to insert a default value or browse the Available Data Types panel to copy a specific example. </p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:300px\">If you discover an issue with either the function description or the test case, you should report it. </p>\n" +
    "		<img src=\"/img/tutorial/writetest/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteTestCases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteTestCases.html",
    "<step>\n" +
    "	<div class=\"title\">Write test cases</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writetestcases/microtask.png\" />\n" +
    "		<p style=\"width:500px\">In Write Test Cases, your goal is to list a set of test cases for a function.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			According to Wikipedia, a test case is a <i>“set of conditions under which a tester will determine whether an application, software system or one of its features is working as it was originally established for it to do”</i>. A test case is not a fully formed and specified test. Rather, a test case specifies - in natural language - a scenario in which a function is to be tested.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">For example, consider the <b>sum</b> function:</p>\n" +
    "		<img src=\"/img/tutorial/writetestcases/testcases.png\" />\n" +
    "		<p style=\"width:500px\"> What are some scenarios that might be valuable to test?\n" +
    "			<ol>\n" +
    "				<li>a number added to zero should return the number itself</li>\n" +
    "				<li>a number added to its opposite should return zero</li>\n" +
    "			</ol>\n" +
    "		</p>\n" +
    "		<p style=\"width:500px\"><b>Note</b>: these test cases do not specify particular values for which the function should be tested. Rather, the test cases abstractly specifies an important scenario in which the function should be tested. How many test cases a function requires ultimately depends on the complexity of a function itself. A function with straightforward behavior might have very few; a function with complex and multifaceted behavior might require several. </p>\n" +
    "\n" +
    "		<p style=\"width:500px\"><b>Remember</b>: Good test cases are short, self-explained, and non-redundant!\n" +
    "		</p>\n" +
    "		\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			In writing test cases, you may discover an issue in the description of the function. If you feel this to be the case, you should report the issue:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetestcases/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/main.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/main.html",
    "<step>\n" +
    "	<div class=\"title\">CrowdCode Tutorial</div>\n" +
    "	<div class=\"text\">\n" +
    "		Welcome to the CrowdCode tutorial. Here, we’ll help get you up to speed.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"task\" placement=\"left\" style=\"width:150px;\">\n" +
    "	<div class=\"title\">Microtask</div>\n" +
    "	<div class=\"text\">\n" +
    "		Here’s the workspace. <br />\n" +
    "		Can you do it?\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"remainingTimeBar\" placement=\"top\" style=\"width:300px;\">\n" +
    "	<div class=\"title\">Hurry up!</div>\n" +
    "	<div class=\"text\">\n" +
    "		For each microtask, you have <strong>10 minutes</strong> to submit the work\n" +
    "		or the microtask will be automatically skipped. <br /> \n" +
    "		The bar on the bottom represents the remaining time for submitting the current microtask.<br />\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"submitBtn\" placement=\"top-center\" style=\"width:150px;\" >\n" +
    "	<div class=\"title\">Submit</div>\n" +
    "	<div class=\"text\">\n" +
    "		All done? Submit your work for review.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"skipBtn\" placement=\"top-center\" style=\"width:200px;\" >\n" +
    "	<div class=\"title\">Skip</div>\n" +
    "	<div class=\"text\">\n" +
    "		Not the right microtask for you? Skip it. <br />\n" +
    "		But be careful - skipping makes it more valuable for others and <strong>you can't go back!</strong>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<!--\n" +
    "<step highlight=\"shortcutsBtn\" placement=\"top-center\" style=\"width:100px;\">\n" +
    "	<div class=\"title\">Shortcuts</div>\n" +
    "	<div class=\"text\">\n" +
    "		Wanna be a power coder? Here’s your keyboard shortcuts.\n" +
    "	</div>\n" +
    "</step>-->\n" +
    "\n" +
    "<step highlight=\"chatPanel\" placement=\"left\" style=\"width:150px;\" \n" +
    "	  on-show=\"$emit('toggleChat');\" on-hide=\"$emit('toggleChat');\">\n" +
    "	<div class=\"title\">Chat</div>\n" +
    "	<div class=\"text\">\n" +
    "		Questions? Ask the crowd.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"activityPanel\" placement=\"right-center\" style=\"width:200px;\">\n" +
    "	<div class=\"title\">Your Activity</div>\n" +
    "	<div class=\"text\">\n" +
    "		See what you’ve done, see how the crowd rated it.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"leaderboardPanel\" placement=\"right-center\" style=\"width:200px;\">\n" +
    "	<div class=\"title\">Leaderboard</div>\n" +
    "	<div class=\"text\">\n" +
    "		Don’t worry. You’re still cool, even if someone has 400 points more than you.\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"feedbackBtn\" placement=\"top-center\" style=\"width:100px;\">\n" +
    "	<div class=\"title\">Send us feedback</div>\n" +
    "	<div class=\"text\">\n" +
    "		See something wrong with CrowdCode? Let us know!\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "\n" +
    "<step on-hide=\"showProfileModal(); \" style=\"width:300px\">\n" +
    "	<div class=\"title\">Congratulations! </div>\n" +
    "	<div class=\"text\">\n" +
    "		You completed the Main UI tutorial: \n" +
    "		On the way to be a master!\n" +
    "	</div>\n" +
    "</step>\n" +
    "");
}]);

angular.module("users/user_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("users/user_popover.html",
    "<div class=\"popover user-menu-popover\">\n" +
    "	{{userData.score }} points <br />\n" +
    "	{{ popover }}\n" +
    "	<a href=\"#\" ng-click=\" $emit('showProfileModal'); close() \">change profile picture</a><br />\n" +
    "	<a href=\"#\" ng-click=\"$emit('run-tutorial', 'main', true); close();\">tutorial</a><br />\n" +
    "	<a href=\"{{logoutUrl}}\" ng-click=\"close()\">logout</a>\n" +
    "</div>");
}]);

angular.module("widgets/ace_edit_js.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/ace_edit_js.html",
    "<ng-form name=\"functionForm\">\n" +
    "	<div\n" +
    "		class=\"ace_editor js-editor\"\n" +
    "		ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme: 'twilight'  }\" \n" +
    "		ng-model=\"code\" >\n" +
    "	</div>\n" +
    "	<statements-progress-bar></statements-progress-bar>\n" +
    "	<div style=\" \" class=\"function-errors\">\n" +
    "		<textarea \n" +
    "			class=\"form-control\" \n" +
    "			name=\"code\" \n" +
    "			style=\"display:none\"\n" +
    "			function-validator \n" +
    "			max-new-statements=\"10\"\n" +
    "			function-id=\"{{functionData.getId()}}\"\n" +
    "			ng-model=\"code\">\n" +
    "		</textarea>\n" +
    "		<span class=\"recap\" ng-if=\"functionForm.code.$error.function_errors.length > 0\" > {{ functionForm.code.$error.function_errors.length }} problem(s) found: </span>\n" +
    "		<ul ng-if=\"functionForm.code.$error.function_errors.length > 0\" >\n" +
    "	        <li ng-repeat=\"error in functionForm.code.$error.function_errors track by $id($index)\">\n" +
    "	        	<span ng-bind-html=\"trustHtml(error)\"></span>\n" +
    "	        </li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</ng-form>");
}]);

angular.module("widgets/description_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/description_popover.html",
    "<div class=\"popover description-popover\">\n" +
    "    <div class=\"arrow\"></div>\n" +
    "    <h3 class=\"popover-title\">Description</h3>\n" +
    "    <div class=\"popover-content\">\n" +
    "    	 <ace-read-js code=\"code\"></ace-read-js> \n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/dropdown_main.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/dropdown_main.html",
    "<ul tabindex=\"-1\" class=\"dropdown-menu\" role=\"menu\">\n" +
    "\n" +
    "  <li role=\"presentation\" class=\"divider\" >\n" +
    "  \n" +
    "  </li>\n" +
    "<li>ciao</li>\n" +
    "  <li role=\"presentation\" class=\"divider\" >\n" +
    "  \n" +
    "  </li>\n" +
    "<li><a  data-animation=\"am-fade-and-scale\" data-placement=\"center\" \n" +
    "							    data-template=\"/html/templates/popups/popup_change_picture.html\" \n" +
    "							    bs-modal=\"modal\" container=\"body\">change profile picture</a></li>\n" +
    "  <li role=\"presentation\" class=\"divider\" >\n" +
    "  \n" +
    "  </li>\n" +
    "<li>ciao</li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("widgets/navbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/navbar.html",
    "<div class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\">\n" +
    "	<div class=\"container-fluid\">\n" +
    "\n" +
    "		<div class=\"navbar-header\">\n" +
    "	      <a class=\"navbar-brand\" href=\"#\">CrowdCode</a>\n" +
    "	    </div>\n" +
    "\n" +
    "		<ul class=\"nav navbar-nav\">\n" +
    "	        <li><a href=\"#\"><strong>project:</strong> {{ projectId }}</a></li>\n" +
    "	        <li><a href=\"#\"><project-stats></project-stats></a></li>\n" +
    "	    </ul>\n" +
    "\n" +
    "	    <ul class=\"nav navbar-nav navbar-right\">\n" +
    "	    	<li>\n" +
    "	        	<a user-menu href=\"#\">\n" +
    "					{{ workerHandle}}\n" +
    "					<img ng-src=\"{{ avatar(workerId).$value }}\" class=\"profile-picture\" />\n" +
    "					<span class=\"caret\"></span>\n" +
    "	        	</a>\n" +
    "	        </li>\n" +
    "	    </ul>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_feedback.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/popup_feedback.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div ng-init=\"sent=false; feedbackText=''\" class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-hide=\"sent\">Send feedback</h4>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "             <h4 class=\"modal-title\" ng-show=\"sent\" style=\"text-align: center\">Thank you for your feedback</h4>\n" +
    "                <ng-form name=\"feedbackForm\" ng-hide=\"sent\">\n" +
    "                    <span ng-class=\"{'has-success': feedbackForm.feedbackText.$valid}\">\n" +
    "                        <textarea type=\"text\"\n" +
    "                        class=\"col-md-8 form-control input-sm\" draggable=\"false\" name=\"feedbackText\"\n" +
    "                        placeholder=\"Give us feedback on CrowdCode! What do you like? What don't you like?\" ng-model=\"feedbackText\" required></textarea>\n" +
    "                    </span>\n" +
    "                </ng-form>\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "                <button type=\"button\" class=\"btn btn-primary\" ng-click=\"$emit('sendFeedback',[feedbackText]) ; sent=!sent\" ng-hide=\"sent\" ng-disabled=\"feedbackForm.$invalid\">Send</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_reminder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/popup_reminder.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\" >\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\">You've been working on this for a while now...</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\">\n" +
    "				<div style=\"text-align: center\"> ...maybe it's time to submit or skip and let the crowd take a look?</div>\n" +
    "        \n" +
    "        <br /> <br />\n" +
    "        <div style=\"text-align: center\">\n" +
    "          This microtask will be auto skipped in: <br />\n" +
    "          <h4>{{skipMicrotaskIn | date:'mm:ss'}}</h4>\n" +
    "        </div>\n" +
    "\n" +
    "        <br /> <br />\n" +
    "\n" +
    "        <div style=\"text-align: center\">\n" +
    "          If you don't know how to do this microtask, click on the \n" +
    "          <span class=\"tutorial-btn glyphicon glyphicon-question-sign color\"></span>\n" +
    "          on the top-right corner for opening the tutorial!\n" +
    "        </div>\n" +
    "				<!--\n" +
    "        <div ng-if=\"title=='WriteTestCases'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteFunction'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteTest'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='ReuseSearch'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteCall'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='DebugTestFailure'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='Review'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteFunctionDescription'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "          -->\n" +
    "  	  </div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_shortcuts.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/popup_shortcuts.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-hide=\"sent\">Shortcuts</h4>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <ul>\n" +
    "                    <li><kbd>ctrl</kbd> + <kbd>enter</kbd> submit microtask</li>\n" +
    "                    <!--<li><kbd>ctrl</kbd> + <kbd>backspace</kbd> skip microtask</li>-->\n" +
    "                    <li><kbd>ctrl</kbd> + <kbd>t</kbd> open tutorial </li> \n" +
    "                </ul>\n" +
    "\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/popup_template.html",
    "<!-- popup template -->\n" +
    "<div id=\"popUp\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"\" aria-hidden=\"true\">\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n" +
    "				<h4 class=\"modal-title\">{{popupTitle}}</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\">\n" +
    "				<ng-include src=\"popupContent\">\n" +
    "				 some raw popup content\n" +
    "				</ng-include>\n" +
    "	      	</div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_user_profile.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/popup_user_profile.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" ng-controller=\"UserProfileController\" >\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\">Choose an avatar!</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\" style=\"\">\n" +
    "\n" +
    "				\n" +
    "				<img ng-src=\"{{ avatar( workerId ).$value }}\" alt=\"{{workerHandle}}\" style=\"width:100px\" class=\"pull-left\" />\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "\n" +
    "				<hr />\n" +
    "\n" +
    "				<h3>Select a profile avatar</h3>\n" +
    "\n" +
    "				<img ng-src=\"{{galleryPath}}avatar{{num}}.png\" alt=\"{{workerHandle}}\" ng-click=\"selectAvatar(num)\" class=\"avatar {{selectedAvatar==num ? 'selected' : '' }} pull-left\" ng-repeat=\"num in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]\"/>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "\n" +
    "<!--\n" +
    "				<hr />\n" +
    "				<h3>Or upload a picture</h3>\n" +
    "				<input type=\"file\" file-model=\"uploadedAvatar\"/>-->\n" +
    "    			\n" +
    "			</div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-primary\" ng-click=\"saveAvatar(); $hide()\">Save</button>\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide(); \">Close</button>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/reminder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/reminder.html",
    "<div  ng-init=\"show=false\"  class=\"section-reminder\"  ng-if = \"skipMicrotaskIn\">\n" +
    "	<div ng-show=\"show\" style=\"width: {{(1-(skipMicrotaskIn / microtaskTimeout)) * 100| number :1}}%;\n" +
    "	text-align: right;\"><b class=\"label-reminder\">{{skipMicrotaskIn | date:'mm:ss'}}</b>\n" +
    "	</div>\n" +
    "    <div id=\"remainingTimeBar\" class=\"progress progress-bar-reminder\">\n" +
    "        <div ng-mouseenter=\"show=true\" data-ng-mouseleave=\"show=false\" class=\"pull-right progress-bar\" ng-class=\"{'progress-bar-success':skipMicrotaskIn > microtaskFirstWarning,'progress-bar-warning':skipMicrotaskIn > microtaskFirstWarning / 2 && skipMicrotaskIn < microtaskFirstWarning,'progress-bar-danger':skipMicrotaskIn < microtaskFirstWarning / 2}\" role=\"progressbar\" style=\"width:{{(skipMicrotaskIn / microtaskTimeout) * 100| number :1}}%\">\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    \n" +
    "</div>");
}]);

angular.module("widgets/statements_progress_bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/statements_progress_bar.html",
    "<div ng-init=\"show=false\"  class=\"section-statements\">\n" +
    "	<div ng-show=\"show\" style=\"padding-left: {{ (statements / max) * 100 | number: 0 }}%;\">\n" +
    "		<b class=\"label-reminder\">{{max-statements}} {{ (max-statements) > 2 ? 'statements left' : ''}}</b>\n" +
    "	</div>\n" +
    "    <div class=\"progress progress-bar-reminder\">\n" +
    "        <div \n" +
    "        	ng-mouseenter=\"show=true\" \n" +
    "        	data-ng-mouseleave=\"show=false\" \n" +
    "        	class=\"pull-right progress-bar\" \n" +
    "        	ng-class=\"{\n" +
    "        		'progress-bar-success' : max - statements >= max * 0.5 ,\n" +
    "        		'progress-bar-warning' : max - statements < max * 0.5 && max - statements > max * 0.25, \n" +
    "        		'progress-bar-danger'  : max - statements < max * 0.25\n" +
    "        	}\" \n" +
    "        	role=\"progressbar\" \n" +
    "        	style=\"width:{{ ( 1-statements / max ) * 100 | number :0 }}%\">\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    \n" +
    "</div>");
}]);

angular.module("widgets/stubs_modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/stubs_modal.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\">\n" +
    "  <div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "      <div class=\"modal-header\">\n" +
    "        \n" +
    "        <h4 class=\"modal-title\">Stubs for the function {{info.name}}</h4>\n" +
    "      </div>\n" +
    "      <div class=\"modal-body\" ng-form=\"stubsForm\" >\n" +
    "\n" +
    "            <ace-read-js code=\"info.signature\"></ace-read-js>\n" +
    "\n" +
    "            <div class=\"heading-1 heading-2\" ng-repeat-start=\"(sKey,stub) in stubs track by $index\">Input set {{$index+1}}</div>\n" +
    "            <table ng-repeat-end ng-form=\"stubForm\" class=\"test\">\n" +
    "                <tr ng-repeat=\"(iKey,iValue) in stub.inputs track by $index\" >\n" +
    "                    <td>{{ info.parameters[$index].name }}<br /><small>{{ info.parameters[$index].type }}</small></td>\n" +
    "                    <td><div ace-read-json ng-model=\"iValue\" ></div></td>\n" +
    "                </tr>\n" +
    "                <tr >\n" +
    "                    <td>return value <br/> <small>{{ info.returnType }}</small> </td>\n" +
    "                    <td >\n" +
    "                        <ace-edit-json \n" +
    "                          ng-model=\"stub.output\" \n" +
    "                          min-lines=\"2\"\n" +
    "                          >\n" +
    "                        </ace-edit-json>\n" +
    "\n" +
    "                        <textarea type=\"text\" \n" +
    "                          ng-model=\"stub.output\"\n" +
    "                          name=\"output\"\n" +
    "                          ng-show=\"false\"\n" +
    "                          required\n" +
    "                          json-data-type=\"{{ info.returnType }}\" />\n" +
    "\n" +
    "                        <div class=\"help-block pull-left\" ng-show=\"stubForm.$dirty\" ng-messages=\"stubForm.output.$error\">\n" +
    "                          <div ng-message=\"required\">Please, fill this field</div>\n" +
    "                          <div ng-message=\"jsonDataType\">\n" +
    "                              <span ng-repeat=\"e in stubForm.output.$error.jsonErrors\" ng-bind=\"e\"></span>\n" +
    "                          </div>\n" +
    "                        </div>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td></td>\n" +
    "                    <td>\n" +
    "                       \n" +
    "                    </td>   \n" +
    "                </tr>\n" +
    "            </table>\n" +
    "\n" +
    "      </div>\n" +
    "      <div class=\"modal-footer\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"stubsForm.$invalid\" ng-click=\"close()\">Save stubs</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("widgets/test_result.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/test_result.html",
    "<div ng-if=\"test.rec.inDispute\">\n" +
    "    <div class=\"heading-1\" >\n" +
    "        WHAT'S WRONG WITH THIS TEST ?\n" +
    "        <a ng-if=\"test.rec.inDispute\" class=\"pull-right\"\n" +
    "            ng-click=\"undoDispute(test)\"> \n" +
    "            Nothing is wrong with this test\n" +
    "        </a>\n" +
    "        <span class=\"clearfix\"></span>\n" +
    "    </div>\n" +
    "    <textarea style=\"resize:vertical\" name=\"disputeDescription\" class=\"form-control\" ng-model=\"test.rec.disputeTestText\" ng-required=\"test.rec.inDispute\" ng-pattern=\"/^[^/\\\\\\'\\&quot;]+$/\"></textarea>\n" +
    "    <ul class=\"help-block\" ng-show=\"microtaskForm.disputeDescription.$dirty && microtaskForm.disputeDescription.$invalid\">\n" +
    "        <li ng-show=\"microtaskForm.disputeDescription.$error.required\">This field is required!</li>\n" +
    "        <li ng-show=\"microtaskForm.disputeDescription.$error.pattern\">The symbols \\ / \" 'are not allowed</li>\n" +
    "    </ul>\n" +
    "    <br>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "    \n" +
    "\n" +
    "<div class=\"heading-1\" >\n" +
    "    Input Parameters\n" +
    "    <a ng-if=\" test.status() == 'failed' \" class=\"pull-right\"\n" +
    "        ng-click=\"doDispute(test)\"> \n" +
    "        Report an issue with the data of this test\n" +
    "        <span class=\"glyphicon glyphicon-exclamation-sign\"></span> \n" +
    "    </a>\n" +
    "    <div class=\"clearfix\"></div>\n" +
    "</div>\n" +
    "<table class=\"test\">\n" +
    "    <tr ng-repeat=\"(key,input) in test.rec.simpleTestInputs track by $index\">\n" +
    "        <td>\n" +
    "            {{ funct.parameters[$index].name }}\n" +
    "            <br />\n" +
    "            <small>{{ funct.parameters[$index].type }}</small>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "            <div ace-read-json ng-model=\"input\" ></div>\n" +
    "        </td>\n" +
    "    </tr>\n" +
    "</table>\n" +
    "\n" +
    "<div ng-if=\"test.errors == undefined \">\n" +
    "    <div ng-if=\"test.output.result\">\n" +
    "        <div class=\"heading-1\" >Output</div>\n" +
    "\n" +
    "        <table class=\"test\" >\n" +
    "            <tr>\n" +
    "                <td><small>{{ funct.returnType }}</small></td>\n" +
    "                <td>\n" +
    "                    <div ng-if=\"test.output.result\" ace-read-json ng-model=\"test.output.actual\" ></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>  \n" +
    "        \n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!test.output.result && diffMode\">\n" +
    "        <div class=\"heading-1\" >\n" +
    "            Output diff \n" +
    "\n" +
    "            <a class=\"pull-right\" ng-if=\"diffMode\" ng-click=\"switchMode()\">switch to normal mode</a>\n" +
    "            <span class=\"clearfix\"></span>\n" +
    "        </div>\n" +
    "        <table class=\"test\" >\n" +
    "            <tr>\n" +
    "                <td></td>\n" +
    "                <td>\n" +
    "                    <span class=\"legend\" style=\"background-color:#eaffea;\"></span>expected\n" +
    "                    <span class=\"legend\" style=\"background-color:#ffecec;\"></span>actual\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "                <td><small>{{ funct.returnType }}</small></td>\n" +
    "                <td>\n" +
    "                    <div ace-read-json-diff old=\"test.output.expected\" new=\"test.output.actual\" mode=\"diff\"></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>  \n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!test.output.result && !diffMode\">\n" +
    "        <div class=\"heading-1\" >\n" +
    "            Output\n" +
    "\n" +
    "            <a class=\"pull-right\" ng-if=\"!diffMode\" ng-click=\"switchMode()\">switch to diff mode</a>\n" +
    "            <span class=\"clearfix\"></span>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <table class=\"test\" >\n" +
    "            <tr>\n" +
    "                <td>\n" +
    "                    expected\n" +
    "                    <br />\n" +
    "                    <small>{{ funct.returnType }}</small>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <div ace-read-json ng-model=\"test.output.expected\" ></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "                <td>actual</td>\n" +
    "                <td>\n" +
    "                    <div ace-read-json ng-model=\"test.output.actual\" ></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"test.errors != undefined \">\n" +
    "    <div class=\"heading-1\" >Execution errors</div>\n" +
    "    <div ace-read-json ng-model=\"test.output.actual\" ></div>\n" +
    "    <div>{{test.errors}}</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);
