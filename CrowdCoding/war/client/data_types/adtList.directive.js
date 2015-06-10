angular
    .module('crowdCode')
    .directive('adtList', ['$compile', '$timeout', 'ADTService', function($compile, $timeout, ADTService) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: '/client/data_types/adt_list.html',
        link: function($scope, $element, $attributes) {
            $scope.ADTs = ADTService.getAllADTs();
            $scope.ADTs.selectedADT = -1;
            $scope.buildStructure = function(adt){
                var struct = '{';
                angular.forEach(adt.structure,function(field){
                    struct += '\n  '+field.name+': '+field.type;
                })
                struct += '\n}';
                return struct;
            };
        }
    }
}]);