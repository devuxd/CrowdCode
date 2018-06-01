angular
    .module('crowdCode')
    .controller('dashboard2', ['$scope','projectService','AdtService','functionsService', '$firebaseObject','firebaseUrl', loadDashboard]);

        function loadDashboard($scope,projectService,AdtService,functionsService,$firebaseObject,firebaseUrl) {
                    $scope.Functions = functionsService.getAll();
                    $scope.DataTypes = AdtService.getAll();
                    $scope.projectName = projectService.getName();
                    $scope.projectDescription = projectService.getDescription();
                    $scope.buildStructure = function (adt) {
                        var struct = '{';
                        angular.forEach(adt.structure, function (field) {
                            struct += '\n  ' + field.name + ': ' + field.type;
                        })
                        struct += '\n}';
                        return struct;
                    };
        }
