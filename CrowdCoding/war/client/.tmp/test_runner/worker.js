
// console.log("worker included!");

var JSHINT_CONF =  {
	latedef   : true,  // proibite use of vars before being declared
	camelcase : true,  // proibite use of not camelCase not UPPER_CASE vars name
	undef     : true,  // prohibite use of undefined vars
	unused    : false, // suppress warnings on unused vars
	boss      : true,  // suppress warnings of assignments in conditions 
	eqnull    : true,  // suppress warnings of == null
	laxbreak  : true,  // suppress warning of unsafe line breaking
	laxcomma  : true,  // suppress warnings about comma-first coding
	shadow    : true,  // suppress warnings about re-declaring variables 
	jquery    : true,  // define exposed globals of jQuery 
	worker    : true,  // globals availables if running in web worker
	browser   : true   // expose globals for browsers API
}

var JSHINT_GLOBALS = [
	"window: false",
	"Debug: true",
	"equal: true",
	"hasStubFor: true",
	"logCall: true",
	"deepCopy: true"
]; 

function getNowTime(){
	var now = new Date();
	return now.getTime();
}

function getFirstLine(functionCode,allCode){
	var firstFunctionLine  = functionCode.split('\n')[0];
	var codeLines = allCode.split('\n');
	for( var l in codeLines ){
		console.log(codeLines[l],firstFunctionLine,codeLines[l].search(firstFunctionLine));
		if( codeLines[l].search(firstFunctionLine)  > -1 )
			return l;
	}
		
	return -1;
}

var allCode;
var allDefs;
var testedCode;
var baseUrl;

self.addEventListener('message', function(e){
	// gets the data
	// data is json object { cmd : 'cmd', payload: 'payload'}
	var data = e.data;

	switch ( data.cmd ) {
		// initialize the worker
		case 'init': 
			// retrieve the baseUrl
			if( data.baseUrl == undefined ){
				self.postMessage("ERROR: you should define a baseUrl");
				break;
			}
			baseUrl    = data.baseUrl;
			allDefs    = data.allDefs;
			allCode    = data.allCode;
			testedCode = data.testedCode;


			var lines = testedCode.split('\n');
			for( var l = 0; l < lines.length ; l++ ){
				lines[l] = lines[l].replace(/console\.log\(\)/g,'Debugger.log('+l+')');
				lines[l] = lines[l].replace(/console\.log\(/g,'Debugger.log('+l+',');
			}
			testedCode = lines.join('\n');


			// import test helper libraries
			// importScripts(baseUrl + '/include/jshint.js');
			importScripts(baseUrl + '/clientDist/test_runner/deepCompare.js');
			importScripts(baseUrl + '/clientDist/test_runner/utils.js');
			importScripts(baseUrl + '/clientDist/test_runner/assertions.js');
			importScripts(baseUrl + '/clientDist/test_runner/debugger.js');
			importScripts(baseUrl + '/clientDist/test_runner/utils.js');

			break;

		// start to evaluate the code
		case 'exec': 

			var startTime = getNowTime()
			var fName = data.functionName;

			// if in the execute message there isn't 
			// the code to execute, return error
			if ( data.testCode == undefined ) {
				self.postMessage("ERROR: you must define the exec code! ");
				break;
			} else if ( data.stubs == undefined ) {
				self.postMessage("ERROR: you must define the stubs code! ");
				break;
			} else {

				// initialize the result message
				var resultMessage = {};

				/* BUILD THE FINAL CODE */
				var globalDef = "";
				// globalDef += "/* global " + JSHINT_GLOBALS.join( ", " ) + " */\n"; //add JSHint globals
				globalDef += "var calleeNames    = '" + data.calleeNames + "'; \n";
				globalDef += "Debugger.init(" + JSON.stringify(data.stubs) + "); \n";    

				//add the received code
				var finalCode = '';
				finalCode += globalDef;
				finalCode += testedCode;
				finalCode += allCode;
				finalCode += data.testCode ;
				finalCode += '//# sourceURL=test-runner.js';


				var firstLine = globalDef.split('\n').length - 1;


				// console.log('tested code', finalCode);
				//console.log(finalCode);

				try{

					// 1) try to LINT the code 
					// THE LINTING IS COMMENTED BECAUSE THERE'S NO REASON TO LINT
					// THE CODE BECAUSE IF IT'S IN THE SYSTEM, IT's ALREDY BEEN LINTED
					// KEEP THE LINT CODE HERE, CAN BE USEFUL 

					// // set the initial start time 
					// // before LINTING the code
					// startTime = getNowTime();

					// // // if Lint fails
					// var codeToLint = finalCode + '\na=98;';
					// var lintResult = JSHINT( codeToLint, JSHINT_CONF ) ;
					// console.log(codeToLint,lintResult);
					// if ( !lintResult ) {
					// 	// create array of Strings for the 
					// 	// JSHint errors to pass back
					// 	var errors = [];
					// 	for( var i = 0 ; i < JSHINT.errors.length ; i++ ){
					// 		var JError = JSHINT.errors[i];
					// 		console.log(JSON.stringify(JError));
					// 		errors.push( "Line: " + JError.line + " - " + JError.reason );
					// 	}




					// 	throw new Error("JSHINT ERRORS: " + errors.join("\n"));

					// } 

					// if the execution arrives here, 
					// it means that there weren't throw LINT 
					// exception, so set again the startTime 
					// for measuring the eval() execution time
					startTime = getNowTime();


					// 2) try to execute the code
					eval(finalCode);
					// executes the tests

					// console.log("end ok!",getNowTime()-startTime);
					resultMessage = { 
						errors        : undefined,
						output        : assertionResults[ assertionResults.length -1 ], 
						stubMap       : Debugger.callStubsMap,
						stubs         : Debugger.stubs,
						usedStubs     : Debugger.callLogs,
					};

				}

				catch (e) {

					// var pos = e.stack.search(/<anonymous>\:(\d+)/gm);
				 //    var matches = e.stack.match(/<anonymous>\:(\d+)\:(\d+)/gm);
				 //    var str = matches[0].substr("<anonymous>".length);
				 //    var numbers = str.match(/(\d+)/g);
				 //    var line = numbers[0] - firstLine;
				 //    var col  = numbers[1];
				    
				    var split = e.stack.split(/\(test-runner.js\:(.*)\)/gm);
				    var line = undefined, col = undefined;
				    if( split.length > 1){
				    	line = parseInt(split[1]) - firstLine  ;
				    	col  = parseInt(split[2]) ;
				    }
				    console.log(firstLine,line,e.stack);
					resultMessage = { 
						errors     : { line: line-1, message: e.message }, // " + e.message + " at line "+line,						
						output     : { 'expected': "", 'actual': "", 'message': "", 'result':  false}
					};
				}

				finally{

					// console.log("FINALLY!",getNowTime(),startTime);

					resultMessage.executionTime = getNowTime()-startTime;
					resultMessage.debug = JSON.stringify(Debugger.logs);

					self.postMessage( resultMessage );
				}

			}

			
			
			break;

		// stop 
		case 'stop': 
			self.close();
			break;

		default: // do nothing
	
	}
} , false);


