
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ImplementBehavior', ['$scope', '$q', 'functionsService', 'functionUtils', 'TestRunnerFactory', function($scope, $q, functionsService, functionUtils, TestRunnerFactory) {
    
    var runner = new TestRunnerFactory.instance();

    // dto empty object, it's updated
    // every time the functionEditor performs
    // a successful validation of the code
    $scope.dto = {};


    // the data object is used inside the view
    $scope.data = {};
    $scope.data.running = false;
    $scope.data.changedSinceLastRun  = null;
    $scope.data.inspected  = null;
    $scope.data.stubs = {};
    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.expanded = false;
        test.editing = true;
        test.running = true;
        return angular.copy(test);
    });

    // methods used inside the microtask view
    $scope.toggleTest    = toggleTest;
    $scope.inspectTest   = inspectTest;
    $scope.run = run;

    // functionEditor callbacks
    $scope.editorCallbacks = {
        onCodeChanged : onCodeChanged,
        onFunctionParsed : onFunctionParsed,
        onEditStub : onEditStub
    };

    // listener to the submit button click
    $scope.$on('collectFormData', collectFormData );


    // run the tests for the first time
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
        runner
            .run(
                $scope.data.tests,
                $scope.funct.name,
                code,
                $scope.data.stubs, 
                $scope.dto.requestedFunctions
                )
            .then(function(result){
                $scope.data.stubs = result.stubs;
                $scope.data.tests = result.tests;
                $scope.data.running = false;
                $scope.data.changedSinceLastRun = false;
                deferred.resolve();
            });
        return deferred.promise;
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

    function onEditStub(functionName,inputs){
        $scope.data.editingStub = $scope.data.stubs[functionName][JSON.stringify(inputs)];
    }

    function onFunctionParsed(dto){
        $scope.dto = dto;
    }

    function onCodeChanged(){
        $scope.data.inspected  = null;
        $scope.data.changedSinceLastRun = true;
    }


}]);