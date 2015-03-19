angular
    .module('crowdCode')
    .factory("FunctionFactory", function () {


	function FunctionFactory(rec){
		//console.log("asfasfasf"+rec);
		if( rec === undefined || rec === null )
			this.rec = {};
		else{

			this.rec = rec;
			this.name 			    = this.rec.name;
			this.code               = this.rec.code;
			this.description 		= this.rec.description;
			this.header 			= this.rec.header;
			this.parameters 		= this.rec.parameters;
			this.pseudoFunctions 	= this.rec.pseudoFunctions;
			this.returnType 		= this.rec.returnType;
			this.described			= this.rec.described;
			this.id 				= this.rec.id;
			this.linesOfCode 		= this.rec.linesOfCode;
			this.messageType 		= this.rec.messageType;
			this.needsDebugging  	= this.rec.needsDebugging;
			this.queuedMicrotasks 	= this.rec.queuedMicrotasks;
			this.readOnly 			= this.rec.readOnly;
			this.version 			= this.rec.version;
			this.written 			= this.rec.written;
			this.fullDescription 	= this.getFullDescription();
			this.signature			= this.getSignature();
			this.functionCode 		= this.getFunctionCode();
			this.fullCode 			= this.getFullCode();
		}

	}

	FunctionFactory.prototype = {
		//Compatibility Mode

		getName             : function(){ return this.rec.name; } ,
		getCode 			: function(){ return this.rec.code; } ,
		getParameters 	    : function(){ return this.rec.parameters; },
		getReturnType 		: function(){ return this.rec.returnType; },
		isDescribed			: function(){ return this.rec.described; },
		getId 				: function(){ return this.rec.id; },
		getLinesOfCode 		: function(){ return this.rec.linesOfCode; },
		getMessageType 		: function(){ return this.rec.messageType; },
		getNeedsDebugging  	: function(){ return this.rec.needsDebugging; },
		getQueuedMicrotasks : function(){ return this.rec.queuedMicrotasks; },
		isReadOnly 			: function(){ return this.rec.readOnly; },
		getVersion 			: function(){ return this.rec.version; },
		isWritten 			: function(){ return this.rec.written; },
		getParamNames        : function(){
			var paramNames=[];
			for(var index in this.rec.parameters)
			{
				paramNames.push(this.rec.parameters[index].name);
			}
			return paramNames;
		},
		getParamNameAt      : function( index ){
			if( this.rec.parameters && this.rec.parameters[index] )
				return this.rec.parameters[index].name;
			else
				return '';
		},
		getParamTypes        : function(){
			var paramTypes=[];
			for(var index in this.rec.parameters)
			{
				paramTypes.push(this.rec.parameters[index].type);
			}
			return paramTypes;
		},
		getHeader 			: function(){ 
			if( this.rec.described !== false )
				return this.rec.header;
			else{
				var splittedDescription =this.rec.description.split("\n");
				if(splittedDescription && splittedDescription.length>0)
					return  splittedDescription.pop();
			}
		},
		getDescription 		: function(){ 
			if(this.rec.described!==false)
				return this.rec.description;
			else
			{
				var splitteDescription=this.rec.description.replace("//", "").split("\n");
				if( splitteDescription !== null )
					splitteDescription.pop();
				return splitteDescription.join("\n");
			}
		},
		getFullDescription	: function(){
			if(this.getDescription()===undefined)
				return "";
			
			var numParams = 0;

			var fullDescription = '/**\n' + this.getDescription() + '\n';

			if(this.rec.parameters!==undefined && this.rec.parameters.length>0)
			{
	    		for(var i=0; i<this.rec.parameters.length; i++)
				{
					fullDescription += '  @param ' + this.rec.parameters[i].type + ' ' + this.rec.parameters[i].name + ', ' + this.rec.parameters[i].description + '\n';

				}
			}

			if(this.rec.returnType!=='')
				fullDescription += '\n  @return ' + this.rec.returnType + ' \n';

			fullDescription+='**/\n';
			return fullDescription;
		},
		getSignature: function(){
			return this.getFullDescription() + this.getHeader();
		},

		getFunctionCode: function(){
			return this.getSignature() + this.rec.code;
		},
		getPseudoFunctions 	: function(){
			if(this.rec.pseudoFunctions){
				var pseudoFunctionsStringified="\n\n";
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ )
					pseudoFunctionsStringified+=this.rec.pseudoFunctions[i].description+"{}\n\n";
				return pseudoFunctionsStringified;
			} else
				return "";
		},
		getPseudoFunctionsList 	: function(){
			if(this.rec.pseudoFunctions){
				var pseudoFunctionsDescription;
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ )
					pseudoFunctionsDescription.push(this.rec.pseudoFunctions[i].description);
				return pseudoFunctionsDescription;
			} else
				return [];

		},
		getFullCode: function(){
			return this.getFunctionCode() + this.getPseudoFunctions();
		},
		getCalleeList: function(){
			var self = this;
			var esprimaCode = this.getHeader() + this.rec.code;
			var ast = esprima.parse( esprimaCode , {loc: true});
			var callees = [];
			traverse(ast, function (node)
			{
				if((node!=null) && (node.type === 'CallExpression'))
				{
					// Add it to the list of callee names if we have not seen it before
					if (callees.indexOf(node.callee.name) == -1)
						callees.push(node.callee.name);
				}
			});
			for(var prop in ast) { delete ast[prop]; }
			return callees;
		},
		removePseudoFunction: function(pseudoFunctionName) {
			if(this.rec.pseudoFunctions!==undefined)
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ ){
					if(this.rec.pseudoFunctions[i].name===pseudoFunctionName)
						this.rec.pseudoFunctions.splice(i,1);
				}
		},
		updateFunction : function(newFunction) {
			this.rec.pseudoFunctions 	= [];
			this.rec.description="";
			angular.forEach(newFunction, function(value, key) {
			 	this.rec[key]=value;
			},this);
		},
		getMockCode: function(){
			var returnCode = '';
			var logEnabled = true;
			var functionObj = this;
			if (functionObj === null)
				return '';

			// create the instrumented function
			var cutFrom = instrumentedFunction.toString().search('{');
			var instrumentedBody = instrumentedFunction.toString().substr(cutFrom);
			returnCode += functionObj.header;
			returnCode += instrumentedBody
						  .replace(/'%functionName%'/g, functionObj.name )
						  .replace(/'%functionNameStr%'/g, "'" + functionObj.name + "'")
						  .replace(/'%functionMockName%'/g, functionObj.name + 'ActualIMP');
			returnCode += '\n';

			// Third, create the ActualImplementation function
			returnCode += functionObj.getMockHeader();
			if( functionObj.written )
				returnCode += '\n' + functionObj.code + '\n';
			else
				returnCode += '\n{ return null; }\n';

			return returnCode;
		},
		getMockHeader: function(){
			var mockHeader = 'function ' 
			    + this.name + 'ActualIMP'
				+ this.header.substring(this.header.indexOf('('));
			return mockHeader;
		}

	};

	return FunctionFactory;
});

function instrumentedFunction(){
	var args        = Array.prototype.slice.call(arguments);
	var stubFor     = Debugger.getStubOutput( '%functionNameStr%', args );
	var returnValue = null;
	var argsCopy    = [];
	for( var a in args )
		argsCopy[a] = JSON.parse(JSON.stringify(args[a]));
	
	if( stubFor != -1 ){
		returnValue = stubFor.output;
	} else {
		try {
			returnValue = '%functionMockName%'.apply( null, argsCopy );
		} catch(e) {
			Debugger.log(-1,'There was an exception in the callee \'' + '%functionNameStr%' + '\': '+e.message);
			Debugger.log(-1,"Use the CALLEE STUBS panel to stub this function.");
		}
	}

	if( calleeNames.search( '%functionNameStr%' ) > -1 ){
		Debugger.logCall( '%functionNameStr%', args, returnValue ) ;
	}

	return returnValue;
}