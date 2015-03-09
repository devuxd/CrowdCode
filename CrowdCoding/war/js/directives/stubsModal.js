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
        controller: function($scope,$element){

            var callee = functionsService.getByName( $scope.functionName );
            $scope.info = {
                name        : callee.name,
                signature   : callee.getSignature(),
                inputs      : callee.getParamNames(),
                returnType  : callee.returnType
            };

            $scope.$on('open-stubs-'+$scope.functionName,function(){
                console.log('open stubs!',$scope.info,$scope.functionName);
                var myModal = $modal({
                    template:'/html/templates/ui/stubs_modal.html',
                    scope: $scope 
                });
                myModal.$promise.then(myModal.show);
            })
        	
        }
    };
};