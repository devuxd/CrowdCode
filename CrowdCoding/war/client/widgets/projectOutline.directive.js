angular
    .module('crowdCode')
    .directive('projectOutline', ['AdtService','functionsService', projectOutline]);

function projectOutline(AdtService, functionsService) {
    return {
        restrict: 'E',
        templateUrl: '/client/widgets/project_outline.template.html',
        controller: function($scope, $element) {

            
            $scope.functions = functionsService.getAll();
            $scope.dataTypes = AdtService.getAll();

            console.log($scope.dataTypes);
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

