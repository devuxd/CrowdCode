myApp.factory("FunctionFactory", function () {


	function FunctionFactory(rec){
		//console.log("asfasfasf"+rec);
		if( rec === undefined )
			this.rec = {};
		else{

			this.rec = rec;
			this.name 			    = this.rec.name;
			this.code               = this.rec.code;
			this.description 		= this.rec.description;
			this.header 			= this.rec.header;
			this.paramDescription 	= this.rec.paramDescription;
			this.paramNames 		= this.rec.paramNames;
			this.paramTypes 		= this.rec.paramTypes;
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
		getParamDescription : function(){ return this.rec.paramDescription; },
		getParamNames 		: function(){ return this.rec.paramNames; },
		getParamTypes 		: function(){ return this.rec.paramTypes; },
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
		getHeader 			: function(){ 
			if(this.rec.described!==false)
				return this.rec.header;
			else
				return  this.rec.description.split("\n").pop();
		},
		getDescription 		: function(){ 
			if(this.rec.described!==false)
				return this.rec.description;
			else
			{
				var splitteDescription=this.rec.description.replace("//", "").split("\n");
				splitteDescription.pop();
				return splitteDescription.join("\n");
			}
		},
		getFullDescription	: function(){
			if(this.getDescription()===undefined||this.getDescription()==="")
				return "";
			var numParams = 0;

			var fullDescription = '/**\n' + this.getDescription() + '\n';

			if(this.rec.paramNames!==undefined && this.rec.paramNames.length>0)
			{
	    		for(var i=0; i<this.rec.paramNames.length; i++)
				{
					if(this.rec.paramDescriptions!==undefined && this.rec.paramDescriptions.length>i)
						fullDescription += '  @param ' + this.rec.paramTypes[i] + ' ' + this.rec.paramNames[i] + ' , ' + this.rec.paramDescriptions[i] + '\n';

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
			if(this.rec.pseudoFunctions===undefined)
				return "";
			else if(typeof this.rec.pseudoFunctions[0]==="string")
			 	return "\n\n" + this.rec.pseudoFunctions.join("{}\n\n")+"{}";
			else if(typeof this.rec.pseudoFunctions[0]==="object") {
				var pseudoFunctionsStringified="\n\n";
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ )
					pseudoFunctionsStringified+=this.rec.pseudoFunctions[i].description+"{}\n\n";
				return pseudoFunctionsStringified;
			}
			return "";
		},
		getPseudoFunctionsList 	: function(){
			if(this.rec.pseudoFunctions===undefined)
				return [];
			else if(typeof this.rec.pseudoFunctions[0]==="string")
			 	return this.rec.pseudoFunctions;
			else if(typeof this.rec.pseudoFunctions[0]==="object") {
				var pseudoFunctionsDescription;
				for(var i=0; i<this.rec.pseudoFunctions.length; i++ )
					pseudoFunctionsStringified.push(this.rec.pseudoFunctions[i].description);
				return pseudoFunctionsDescription;
			}
			return "";
		},
		getFullCode: function(pseudocall){
			if(pseudocall!==undefined && this.getPseudoFunctionsList().indexOf(pseudocall)!==-1)
				this.pseudoFunctions.splice(this.pseudoFunctions.indexOf(pseudocall),1);
			return this.getFunctionCode() + this.getPseudoFunctions();
		},
		

	};

	return FunctionFactory;
});