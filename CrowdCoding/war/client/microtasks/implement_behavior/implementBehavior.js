
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ImplementBehavior', ['$scope', 'functionsService', 'TestRunnerFactory', function($scope, functionsService, TestRunnerFactory) {
    
    var runner = new TestRunnerFactory.instance();

    $scope.data = {};
    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.editing  = false;
        test.expanded = false;
        return angular.copy(test);
    });
    
    $scope.data.currentTest = $scope.data.tests[0];
    $scope.toggleTest = toggleTest;
    $scope.run = run;

    run();

    function run(){
        var code = $scope.data.editor ? $scope.data.editor.getValue() : $scope.funct.getFullCode();
        runner.run($scope.data.tests,$scope.funct.name,code).then(function(tests){
            $scope.data.tests = tests;
            $scope.data.currentTest = $scope.data.tests[0];
        });
    }

    function toggleTest(test){
        test.expanded = !test.expanded;
    }


    function collectFormData(event, microtaskForm) {
    	
    }

}]);