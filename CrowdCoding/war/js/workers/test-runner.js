
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


self.addEventListener('message', function(e){
	// gets the data
	// data is json object { cmd : 'cmd', payload: 'payload'}
	var data = e.data;
	var baseUrl;
	var debug;


	switch ( data.cmd ) {
		// initialize the worker
		case 'initialize': 
			// retrieve the baseUrl
			if( data.baseUrl == undefined ){
				self.postMessage("ERROR: you should define a baseUrl");
				break;
			}
			baseUrl = data.baseUrl;


			// import test helper libraries
			importScripts(baseUrl + '/include/jshint.js');
			importScripts(baseUrl + '/js/assertionFunctions.js');
			importScripts(baseUrl + '/js/instrumentFunction.js');

			break;

		// start to evaluate the code
		case 'exec': 

			var startTime = getNowTime()


			// if in the execute message there isn't 
			// the code to execute, return error
			if ( data.code == undefined ) {
				self.postMessage("ERROR: you must define the exec code! ");
				break;
			}

			// initialize the result message
			var resultMessage = {};

			/* BUILD THE FINAL CODE */
			var finalCode = "";
			finalCode += "/* global " + JSHINT_GLOBALS.join( ", " ) + " */\n"; //add JSHint globals		
			finalCode += "var debug = new Debug();\n"; //instantiate the Debug Object
			finalCode += "var stubMap = {};\n";        //instantiate the test stub map

			//add the received code
			finalCode += data.code;

			// 1) try to LINT the code
			// 2) try to execute the code
			try{

				// // set the initial start time 
				// // before LINTING the code
				// startTime = getNowTime();

				// // if Lint fails
				if ( !JSHINT( finalCode, JSHINT_CONF ) ) {

					// create array of Strings for the 
					// JSHint errors to pass back
					var errors = [];
					for( var i = 0 ; i < JSHINT.errors.length ; i++ ){
						var JError = JSHINT.errors[i];
						errors.push( "Line: " + JError.line + " - " + JError.reason );
					}

					throw "JSHINT ERRORS: " + errors.join("\n");

				} 

				// if the execution arrives here, 
				// it means that there weren't throw LINT 
				// exception, so set again the startTime 
				// for measuring the eval() execution time
				startTime = getNowTime();

				// executes the tests
				eval(finalCode);

				// console.log("end ok!",getNowTime()-startTime);

				resultMessage = { 
					errors        : false,
					output        : assertionResults[0], 
					stubMap       : stubMap,
					debug         : debug.messages.join( "\n" ) + "",
					stubs         : stubs,
					usedStubs     : usedStubs
				};

			}

			catch (e) {
				// console.log(e);
				resultMessage = { 
					errors     : true,
					output     : { 'expected': "", 'actual': "", 'message': "", 'result':  false},
					debug      : "EXCEPTION: " + e.message
				};
			}

			finally{

				// console.log("FINALLY!",getNowTime(),startTime);

				resultMessage.executionTime = getNowTime()-startTime;

				self.postMessage( resultMessage );
			}
			
			break;

		// stop 
		case 'stop': 
			self.close();
			break;

		default: // do nothing
	
	}
} , false);


