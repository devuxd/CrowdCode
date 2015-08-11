


angular
    .module('crowdCode')
    .factory('Test', [ function() {

	function Test(rec, functionName){
		if( rec === undefined || rec === null )
			return false;


		if(rec.isSimple)
			rec.code = 'expect(' + functionName + '(' + rec.inputs.join(',') + ')).to.deep.equal(' + rec.output + ');';

		angular.extend(this,rec);
	}

	Test.prototype = {
		getInputsKey: function(){
			return this.inputs.join(',');
		}
	};

	return Test;
}]);