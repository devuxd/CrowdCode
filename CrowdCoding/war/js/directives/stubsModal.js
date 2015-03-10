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
            $scope.$watch('stubs',function(){
                console.log($scope.stubs);
            });

            var callee = functionsService.getByName( $scope.functionName );
            $scope.info = {
                name        : callee.name,
                signature   : callee.getSignature(),
                parameters  : callee.getParameters(),
                returnType  : callee.returnType
            };

            $scope.$on('open-stubs-'+$scope.functionName,function(){
                var myModal = $modal({
                    template:'/html/templates/ui/stubs_modal.html',
                    scope: $scope 
                });
                myModal.$promise.then(myModal.show);
            })
        	
        }
    };
};