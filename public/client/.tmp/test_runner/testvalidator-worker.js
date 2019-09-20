var expect = undefined;
var should = undefined;
var functionEmptyBody, functionName;
var thirdPartyAPIsCode= ' function SaveObjectImplementation() {};  function FetchObjectsImplementation() {};' +
    '  function DeleteObjectImplementation() {};  function UpdateObjectImplementation() {};  \n';

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

		//console.log('test validator worker');

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
		//add empty function for avoiding show the error because of third party API
		evalCode +=thirdPartyAPIsCode;
		try{
			eval(evalCode);
		} catch(e){
			console.log('testvalidator-worker excption: ',e);
			// if it not an assertion error, show it
            // ignore errors from calling third party APIs, Their names finish with implementation
         	if( !( e instanceof chai.AssertionError ) && !(e instanceof TypeError)){

                    sendData.error = e.message;

			}

		} finally {

            // if(e.message.endsWith('SaveObjectImplementation is not defined') || e.message.endsWith('FetchObjectsImplementation is not defined')
            //     || e.message.endsWith('DeleteObjectImplementation is not defined') || e.message.endsWith('UpdateObjectImplementation is not defined')){
            //     console.log('ThirdpartyAPI is ignored',sendData.error);
            //     sendData.error="";
            //     //if()
            // }

            if( _calls == 0 && !data.code.includes(functionName)){
				sendData.error = 'the function '+functionName+' is never called!';
				}
				/*else if( _calls > 1 ){
					sendData.error = 'the function '+functionName+' should be called one time!';
				}*/
				else if( _assertions == 0  && !data.code.includes('expect(')){
					sendData.error = 'express at lest one assertion!'
				}

		}

		self.postMessage( sendData );
	}
	
} , false);


