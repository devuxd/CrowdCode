angular
    .module('crowdCode')
    .directive('functionEditor', functionEditor); 

function functionEditor($sce) {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/ui/function_editor.html',
        link: function(scope,element,attrs){
        	scope.trustHtml = function (unsafeHtml){
        		return $sce.trustAsHtml(unsafeHtml);
        	};
        }
    };
};