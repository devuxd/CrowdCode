angular
    .module('crowdCode')
    .directive('stubsModal', stubsList); 

function stubsList($modal,functionsService) {
    return {
        restrict: 'E',
        scope: { 
            functionName: '=',
            stubs: '='
        },
        replace:true,
        templateUrl:'/client/widgets/stubs_modal.html',
        controller: function($scope,$element){
            $scope.$watch('functionName',function(){
                var callee = functionsService.getByName( $scope.functionName );
                $scope.info = {
                    name        : callee.name,
                    signature   : callee.getSignature(),
                    parameters  : callee.getParameters(),
                    returnType  : callee.returnType
                };
            });
            $scope.close = function(){
                $element.modal('hide');
            };
            
            $scope.$on('open-stubs-'+$scope.functionName,function(){
                $element.modal('show');
            })
        	
        }
    };
};