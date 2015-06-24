angular
    .module('crowdCode')
    .directive('projectOutline', ['ADTService','functionsService', projectOutline]);

function projectOutline(ADTService, functionsService) {
    return {
        restrict: 'E',
        templateUrl: '/client/widgets/project_outline.template.html',
        controller: function($scope, $element) {
            console.log(functionsService);
            $scope.functions = functionsService.getAll();
            $scope.dataTypes = ADTService.getAll();

            $scope.buildAdtDetail = function(adt){
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

