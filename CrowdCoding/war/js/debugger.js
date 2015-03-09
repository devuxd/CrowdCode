
function Debugger() {}

Debugger.init = function(stubs){

	if( stubs === undefined ) 
		throw new Error('define stubs for the debugger!');

	Debugger.stubs    = stubs;
	Debugger.callLogs = {};
	Debugger.logs     = [];
};

Debugger.logCall = function( functionName, inputs, output ){
	// generate the key (unique for same set of inputs)
	var key = JSON.stringify(inputs);

	// create and populate the record
	var record = {};
	// record.isEdited
	record.inputs = [];
	for( var i in inputs )
		record.inputs[i] = JSON.stringify( inputs[i] );
	record.output = JSON.stringify( output );

	// add the record to the calls log (or update the existing one)
	var callLogs = Debugger.callLogs;
	if( callLogs[functionName] === undefined ) callLogs[functionName] = {};
	callLogs[functionName][key] = record;

	// add the record to the stubs (or update the existing one)
	var stubs = Debugger.stubs;
	if( stubs[functionName] === undefined ) stubs[functionName] = {};
	stubs[functionName][key] = record;
};

Debugger.getStubOutput = function( functionName, inputs ){
	var stubs = Debugger.stubs;
	if( stubs[ functionName ] !== undefined ){
		var key = JSON.stringify(inputs) ;
		if ( stubs[ functionName ][ key ] !== undefined ){
			return {
				output: stubs[ functionName ][ key ].output
			};	
		}		
	}
	return -1;
};

Debugger.log = function(){
	var logs = Debugger.logs;
	var statement = '';
	for( var v in arguments ){
		if( v > 0 ){
			var value = arguments[v];
			if( value === null || value === undefined )
				statement =  value + '' ;
			else if( typeof value == 'number' || typeof value == 'string' )
				statement =  value ;
			else
				statement = JSON.stringify(value, "\t") ;
			logs.push({ timestamp: Date.now(), line: arguments[0], statement: statement, position: v});
		}
	}	
};