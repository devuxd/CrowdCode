function getNowTime(){
	var now = new Date();
	return now.getTime();
}

self.addEventListener('message', function(e){

	var data = e.data;
	switch ( data.cmd ) {
		// initialize the the debugger
		case 'init': 
			// retrieve the baseUrl
			if( data.baseUrl == undefined )
				throw "ERROR: base url not defined! ";

			if ( data.name == undefined ) 
				throw "ERROR: tested function name not defined! ";

			if ( data.functions == undefined ) 
				throw "ERROR: functions array not defined ";
			

			importScripts(data.baseUrl + '/clientDist/test_runner/debugger.js');
			importScripts(data.baseUrl + '/clientDist/test_runner/utils.js');


			Debugger.init({
			    functions : data.functions,
			    tracedFunctions   : [data.testedFunctionName]
			});

			break;

		// run a test 
		case 'run': 

			var startTime = getNowTime()
			var fName = data.functionName;

			if ( data.testCode == undefined ) 
				throw "ERROR: test code not defined! ";
			
			if ( data.stubs == undefined ) 
				throw "ERROR: stubs not defined";
			
			// initialize the result message
			var resultMessage = {};

    		Debugger.setFunction('loggingFunction',{ code: fCode });

			try{
				Debugger.run(testCode);
			}
			catch (e) {
				console.log(e);
			}

			finally{
				resultMessage.executionTime = getNowTime()-startTime;
				// resultMessage.logs = JSON.stringify(Debugger.logs);

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


