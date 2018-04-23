var expect = undefined;
var should = undefined;
var functionEmptyBody, functionName;

self.addEventListener('message', function(message){

	var data = message.data;

	if( data.command == 'init'){
		if( data.baseUrl == undefined )
			throw "ERROR: base url not defined! ";
		
		functionName = data.functionName;
		functionEmptyBody = 'function '+data.functionName+'(){ _calls++; }\n';

		importScripts(data.baseUrl + '/include/chai.js');
	} 
	else {


		var sendData = { error : '' };

		var _assertions = 0; // counts the assertions in the code
		var _calls    = 0; // counts the time the function is called

		// wrap chai.expect for counting the assertions
		function expect(){
			_assertions ++;
			return chai.expect(arguments);
		}

		// build the running code
		var evalCode = '';

		// if a function is defined create an empty body 
		// that counts the time the function is called
		evalCode += functionEmptyBody;
		

		// add the test code
		evalCode += data.code;

		try{
			console.log('testValidotr',evalCode);
			eval(evalCode);
		} catch(e){
			// if it not an assertion error, show it
			if( !( e instanceof chai.AssertionError ) ){
				sendData.error = e.message;
			}
			// else console.log(e);
		} finally {

			if( sendData.error == "" ){
				if( _calls == 0 ){
				sendData.error = 'the function '+functionName+' is never called!';
				} 
				else if( _calls > 1 ){
					sendData.error = 'the function '+functionName+' should be called one time!';
				}
				else if( _assertions == 0 ){
					sendData.error = 'express at lest one assertion!'
				}
			}
		}

		self.postMessage( sendData );
	}
	
} , false);


