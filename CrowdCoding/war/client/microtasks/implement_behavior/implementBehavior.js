
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
    $scope.data.changedSinceLastRun  = null;
    $scope.data.inspected  = null;


    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.expanded = false;
        test.editing = true;
        test.running = true;
        return angular.copy(test);
    });

    $scope.toggleTest    = toggleTest;
    $scope.inspectTest   = inspectTest;
    $scope.editStub      = editStub;
    $scope.run = run;

    $scope.codeChanged = function(){
        $scope.data.inspected  = null;
        $scope.data.changedSinceLastRun = true;
    }

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
        $scope.data.inspected = null;
        var code = $scope.data.editor ? $scope.data.editor.getValue() : $scope.funct.getFullCode();
        runner.run($scope.data.tests,$scope.funct.name,code).then(function(tests){
            $scope.data.tests = tests;
            $scope.data.running = false;
            $scope.data.changedSinceLastRun = false;
            deferred.resolve();
        });
        return deferred.promise;
    }

    function editStub(functionName,inputs){
        console.log(arguments);
    }
    function toggleTest($event,test){
        test.expanded = !test.expanded;
        $event.preventDefault();
        $event.stopPropagation();
    }

    function inspectTest($event,test){

        if( !$scope.data.changedSinceLastRun ){
             if( $scope.data.inspected == test){
                console.log('toggle off');
                $scope.data.inspected  = null;
            } 
            else {
                console.log('toggle on',test.logs);
                $scope.data.inspected  = test;
            }    
        }
           
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