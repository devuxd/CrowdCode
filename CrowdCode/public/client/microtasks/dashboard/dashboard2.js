angular
    .module('crowdCode')
    .directive('dashboard2', ['AdtService','functionsService', '$firebaseArray','firebaseUrl', loadDashboard]);

function loadDashboard($scope,AdtService,functionsService,$firebaseArray,firebaseUrl) {
    $scope.projectName = projectId;
    return {
        restrict: 'E',
        templateUrl: '/client/dashboard/dashboard2.html',
        controller: function($scope) {
            $scope.projectName = projectId;
            projectRef = firebase.database().ref().child('Projects').child(projectId);
            var projectData = $firebaseArray(projectRef);
            projectData.$loaded().then(function (data) { console.log(data);
                $scope.projectDescription = data.description;


            $scope.functions = functionsService.getAll();
            $scope.dataTypes = AdtService.getAll();

            //console.log($scope.dataTypes);
            $scope.buildStructure = function(adt){
                var struct = '{';
                angular.forEach(adt.structure,function(field){
                    struct += '\n  '+field.name+': '+field.type;
                })
                struct += '\n}';
                return struct;
            };
            });
        }
    };
}
