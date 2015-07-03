
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ImplementBehavior', ['$scope', '$q', 'functionsService', 'functionUtils', 'TestRunnerFactory', function($scope, $q, functionsService, functionUtils, TestRunnerFactory) {
    
    var runner = new TestRunnerFactory.instance();

    $scope.firstRun = false;
    $scope.data = {};
    $scope.data.running = false;
    $scope.data.inspected  = null;
    $scope.data.inspecting = false;

    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.expanded = false;
        test.editing = true;
        test.running = true;
        return angular.copy(test);
    });

    $scope.toggleTest    = toggleTest;
    $scope.toggleInspect = toggleInspect;
    $scope.inspectTest   = inspectTest;
    $scope.run = run;

    $scope.$on('collectFormData', collectFormData );


    run().then(function(){
        $scope.data.tests.sort(function(tA,tB){
            if( tA.result.passed && !tB.result.passed ) return -1;
            if( !tA.result.passed && tB.result.passed ) return 1;
            return 0;
        });
    });

    function run(){
        var deferred = $q.defer();
        $scope.data.running = true;
        $scope.data.inspecting = false;
        var code = $scope.data.editor ? $scope.data.editor.getValue() : $scope.funct.getFullCode();
        runner.run($scope.data.tests,$scope.funct.name,code).then(function(tests){
            $scope.data.tests = tests;
            $scope.data.running = false;
            deferred.resolve();
        });
        return deferred.promise;
    }

    function toggleTest($event,test){
        test.expanded = !test.expanded;
        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleInspect(){
        $scope.data.inspecting = !$scope.data.inspecting;
    }

    function inspectTest($event,test){
        $scope.data.inspected  = test;
        $scope.data.inspecting = true;

        $event.preventDefault();
        $event.stopPropagation();
    }

    function collectFormData(event, microtaskForm) {
    	formData = {
            'function': {},
            addedFunctions: [],
            ADT: [],
            disputedTests: [],
            disputeFunctionText: '',
            functionNotImplementable: false
        };

        formData.function = functionUtils.parse($scope.data.editor.getValue());

        
        // $scope.$emit('submitMicrotask', formData);
    }

}]);