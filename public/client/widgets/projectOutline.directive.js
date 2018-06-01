angular
    .module('crowdCode')
    .directive('projectOutline', ['AdtService','functionsService','thirdPartyAPIService', projectOutline]);

function projectOutline(AdtService, functionsService, thirdPartyAPIService) {
    return {
        restrict: 'E',
        templateUrl: '/client/widgets/project_outline.template.html',
        controller: function($scope, $element) {


            $scope.functions = functionsService.getAll();
            $scope.dataTypes = AdtService.getAll();
            $scope.thirdPartyAPIs = thirdPartyAPIService.getAll();

            //console.log($scope.dataTypes);
            $scope.buildStructure = function(adt){
                var struct = '{';
                angular.forEach(adt.structure,function(field){
                    struct += '\n  '+field.name+': '+field.type;
                })
                struct += '\n}';
                return struct;
            };
        }
    };
}
