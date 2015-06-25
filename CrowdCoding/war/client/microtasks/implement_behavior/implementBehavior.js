
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ImplementBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    

    $scope.data = {};
    $scope.data.tests = [];
    if( $scope.funct.rec.tests ){
        for( var testId in $scope.funct.rec.tests ){
            var test = $scope.funct.rec.tests[testId];
            test.editing  = false;
            test.expanded = false;
            $scope.data.tests.push(test);
        }
    }

    $scope.data.currentTest = $scope.data.tests[0];

    $scope.toggleTest = toggleTest;

    function toggleTest(test){
        test.expanded = !test.expanded;
    }


    function collectFormData(event, microtaskForm) {
    	
    }

}]);