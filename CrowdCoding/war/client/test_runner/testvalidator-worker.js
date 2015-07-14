var expect = undefined;
var should = undefined;

self.addEventListener('message', function(message){

	var data = message.data;

	if( data.baseUrl == undefined )
		throw "ERROR: base url not defined! ";

	importScripts(data.baseUrl + '/include/chai.js');
			
	expect = chai.expect;
	should = chai.should();
	
	var sendData = { };

	try{
		eval(data.code);
	} catch(e){
		if( !( e instanceof chai.AssertionError ) ){
			sendData.error = e.message;
		}
		else console.log(e);
	}

	self.postMessage( JSON.stringify( sendData) );
		
} , false);


