angular
    .module('crowdCode')
    .factory('Function', [ 'Test', function(Test) {

	function Function(rec,key){
		this.$id = rec.id + '';
		this.update(rec);
	}

	Function.prototype = {
		update: function( rec ){
			// if the record is null or undefined, return false
			if( rec === undefined || rec === null)
				return false;

			// extend this object with the properties of the record
			angular.extend(this,rec);

			// reinitialize the tests as empty array
			// and if the function record has tests
			// create an array of Test objects from them
			this.tests = [];
			if( rec.tests !== undefined )
				for( var testId in rec.tests ){
					this.tests.push(new Test(rec.tests[testId]));
				}

			this.stubs = {};

			return true;
		},

		getHeader: function(){ 
			if( this.described !== false )
				return this.header;
			else{
				var splittedDescription =this.description.split("\n");
				if(splittedDescription && splittedDescription.length>0)
					return  splittedDescription.pop();
			}
		},

		getDescription: function(){ 
			if(this.described!==false)
				return this.description;
			else {
				var splitteDescription=this.description.replace("//", "").split("\n");
				if( splitteDescription !== null )
					splitteDescription.pop();
				return splitteDescription.join("\n");
			}
		},

		getFullDescription: function(){
			if(this.getDescription()===undefined)
				return "";
			
			var descriptionLines = this.getDescription().split('\n');

			if(this.parameters!==undefined && this.parameters.length>0){
				for(var i=0; i<this.parameters.length; i++)
					descriptionLines.push(
						[ 
							'@param',
							'{' + this.parameters[i].type + '}',
							this.parameters[i].name,
							'- ' + this.parameters[i].description
						].join(' ')
					);
			}

			if(this.returnType!=='')
				descriptionLines.push('@return {' + this.returnType + '}');

			return '/**\n'
				 + ' * '+descriptionLines.join('\n * ') + '\n'
				 + '*/\n';
		},

		//  signature is description + header
		getSignature: function(){
			return this.getFullDescription() + this.getHeader();
		},

		// 
		getFunctionCode: function(){
			return this.getSignature() + this.code;
		},

		// the full code is the code of the function
		// concatenated to the description of the pseudo functions
		getFullCode: function(){

			var fullCode = this.getFunctionCode();
			
			if(this.pseudoFunctions){
				fullCode += "\n\n";
				for(var i=0; i<this.pseudoFunctions.length; i++ )
					fullCode += this.pseudoFunctions[i].description + "\n\n";
			}
			return fullCode;
		},

	};

	return Function;
}]);