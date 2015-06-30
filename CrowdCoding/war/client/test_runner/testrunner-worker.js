function getNowTime(){
	var now = new Date();
	return now.getTime();
}
var testedName = undefined;
var expect = undefined;
self.addEventListener('message', function(e){

	var data = e.data;
	switch ( data.cmd ) {
		// initialize the the debugger
		case 'init': 
			// retrieve the baseUrl
			if( data.baseUrl == undefined )
				throw "ERROR: base url not defined! ";

			if ( data.functions == undefined ) 
				throw "ERROR: functions array not defined ";

			if ( data.tested == undefined ) 
				throw "ERROR: tested function not defined! ";


			importScripts(data.baseUrl + '/client/test_runner/debugger.js');

			importScripts(data.baseUrl + '/include/estools.browser.js');
			importScripts(data.baseUrl + '/include/chai.js');
			

			expect = chai.expect;


			Debugger.init({ functions : data.functions });
			Debugger.setFunction(data.tested.name,{ code: data.tested.code },true);


			break;

		// run a test 
		case 'run': 

			if ( data.testCode == undefined ) 
				throw "ERROR: test code not defined! ";

			// if ( data.stubs == undefined ) 
			// 	throw "ERROR: stubs not defined";
			
			var startTime     = getNowTime();

			var resultMessage = Debugger.run(data.testCode);
			console.log('result message is ',resultMessage);
			
			resultMessage.executionTime = getNowTime()-startTime;
			self.postMessage( resultMessage );
			
			break;

		// stop 
		case 'stop': 
			self.close();
			break;

		default: // do nothing
	
	}
} , false);


