///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('NoMicrotaskController', ['$scope', '$rootScope', '$firebase',  'functionsService','FunctionFactory', 'ADTService', '$interval', function($scope, $rootScope, $firebase,  functionsService, FunctionFactory, ADTService, $interval) {
    //$interval(function(){ $scope.$emit('load')}, 2000);
}]);
