
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

			// if in the execute message there isn't 
			// the code to execute, return error
			if ( data.code == undefined ) {
				self.postMessage("ERROR: you must define the exec code! ");
				break;
			}

			try{

				var finalCode = "";

				//add JSHint globals
				finalCode += "/* global " + JSHINT_GLOBALS.join( ", " ) + " */\n";

				//instantiate the Debug Object
				finalCode += "var debug = new Debug();\n";

				// add the stubs 
				//finalCode += "var workingStubs = " + JSON.stringify(data.stubs) + "; \n";

				//add the received code
				finalCode += data.code;

				// console.log("--- FINAL CODE : ");
				//console.log('Test worker: final code ', finalCode );


				// if Lint fails
				if ( !JSHINT( finalCode, JSHINT_CONF ) ) {

					// create array of Strings for the 
					// JSHint errors to pass back
					var errors = [];
					for( var i = 0 ; i < JSHINT.errors.length ; i++ ){
						var JError = JSHINT.errors[i];
						errors.push( "Line: " + JError.line + " - " + JError.reason );
					}
					self.postMessage( { errors: "JSHINT ERRORS: " + errors.join("\n") } );

				} else {
					// executes the tests
					eval(finalCode);

					self.postMessage( { 
						output    : assertionResults[0], 
						stubs     : stubs,
						usedStubs : usedStubs,
						debug     : debug.messages.join( "\n" ) + ""
					} );
				}

			} catch (e) {
				self.postMessage( { errors: "EXCEPTION: " + e.message } );
			}
			
			break;

		// stop 
		case 'stop': 
			self.close();
			break;

		default: // do nothing
	
	}
} , false);


