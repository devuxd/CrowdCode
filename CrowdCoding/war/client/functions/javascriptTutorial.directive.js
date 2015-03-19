
//////////////////////
//  JAVA HELPER     //
//////////////////////


angular
    .module('crowdCode')
    .directive('javascriptHelper', ['$compile', '$timeout', '$http', 'ADTService', function($compile, $timeout, $http, ADTService) {

    return {
        restrict: "EA",
        templateUrl: "/client/functions/javascript_tutorial.html",

        link: function($scope, $element, $attributes) {

            $http.get('/client/functions/javascriptTutorial.txt').success(function(code) {
                $scope.javaTutorial = code;
            });

        },
        controller: function($scope, $element) {



            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });

            };
        }
    };

}]);