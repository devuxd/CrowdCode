
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    
    $scope.tests = $scope.funct.rec.tests || [];

    $scope.activeDescriptions = [];
    $scope.currentIndex  = -1;
    $scope.isComplete    = false;
    $scope.editTest      = editTest;

    $scope.newTest = {
        description: 'should be the new test',
        code: '//code of the new test'
    };

    var collectOff = $scope.$on( 'collectFormData', collectFormData );
    $scope.$on('$destroy',function(){ collectOff(); });

    if( $scope.microtask.promptType === 'edit' )
        editBehavior($scope.behaviors.length-1);

    function editTest(index){
        if( $scope.activeDescriptions.indexOf(index) == -1 )
            $scope.activeDescriptions.push(index);

        $scope.currentIndex = index;
    }

    function addTest(){
        $scope.newTest.added = true;
        $scope.tests.push($scope.newTest);
    }

    function collectFormData(event, microtaskForm) {
        addTest();
        var formData = {
            functionVersion    : $scope.funct.rec.version,
            tests              : $scope.tests,
            isDescribeComplete : $scope.isComplete
        };
        console.log(formData);
        $scope.$emit('submitMicrotask', formData);
    }

}]);