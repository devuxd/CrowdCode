


angular
    .module('crowdCode')
    .factory('Test', [ function() {

	function Test(rec){
		if( rec === undefined || rec === null )
			return false;
		angular.extend(this,rec);
	}

	Test.prototype = {
		asd : function(){ return 'asd'; }

	};

	return Test;
}]);