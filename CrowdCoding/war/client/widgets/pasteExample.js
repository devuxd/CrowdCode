
angular
    .module('crowdCode')
    .directive('pasteExample', ['$dropdown','AdtUtils','AdtService',function($dropdown,AdtUtils,AdtService) {

    	return {
    		require: 'ngModel',
    		restrict: 'AE',
    		scope: {
    			paramType: '@',
    			pasteExample: '='
    		},
    		link: function($scope,iElem,iAttrs,ngModelCtrl){
    			var param = AdtUtils.getNameAndSuffix($scope.pasteExample.type);
    			var adt   = AdtService.getByName(param.name);

	            var dropdown = $dropdown(iElem, { placement: 'bottom' });

	            dropdown.$scope.pasteExample = function(value){
	            	if(param.suffix.length == 0)
	            		ngModelCtrl.$setViewValue(value);
	            	else 
	            		ngModelCtrl.$setViewValue('['+value+']');

	            };

	            dropdown.$scope.content = [];
	            if( adt.examples ) {
	            	adt.examples.map(function(e){
		            	dropdown.$scope.content.push({
		            		text  : e.name,
		            		click : 'pasteExample(\''+e.value+'\')'
		            	});
	            	});
	            } else {
	            	dropdown.$scope.content.push({
	            		text: 'no examples',
	            		click : 'noop()'
	            	});
	            }

    		}
    	};


	}]);