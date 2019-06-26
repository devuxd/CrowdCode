var testedName = undefined;
var expect = undefined;
var should = undefined;

self.addEventListener('message', function(message){

	var data = message.data;

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


			importScripts(data.baseUrl + '/clientDist/test_runner/debugger.js');
			importScripts(data.baseUrl + '/include/estools.browser.js');
			importScripts(data.baseUrl + '/include/chai.js');
			

			expect = chai.expect;
			should = chai.should();
			testedName = data.tested.name;

			Debugger.init({ functions : data.functions, stubs: data.stubs });
			Debugger.setFunction(data.tested.name,{ code: data.tested.code },true);

			self.postMessage('initComplete');

			break;

		// run a test 
		case 'run': 

			if ( data.testCode == undefined ) 
				throw "ERROR: test code not defined! ";


			var sendData = {};
			// console.log('all stub before run',Debugger.getAllStubs());
			sendData.result = Debugger.run(data.testCode);
			sendData.logs   = Debugger.logs.values[testedName] === undefined ? [] : Debugger.logs.values[testedName];
			self.postMessage( JSON.stringify( sendData ) );

			break;

		// stop 
		case 'stubs': 
			// console.log('worker is sending stubs', Debugger.getAllStubs());
			self.postMessage( JSON.stringify( Debugger.getAllStubs() ) );
			break;
		// stop 
		case 'stop': 
			self.close();
			break;

		default: // do nothing
	
	}
} , false);


