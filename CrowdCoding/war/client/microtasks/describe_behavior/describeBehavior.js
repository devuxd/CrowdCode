
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    
    $scope.data = {};
    $scope.data.tests = [];
    if( $scope.funct.rec.tests ){
        for( var testId in $scope.funct.rec.tests ){
            $scope.data.tests.push($scope.funct.rec.tests[testId]);
        }
    }
    $scope.data.expanded = [];
    $scope.data.isComplete = false;
    $scope.data.newTest = {
        description: 'should be the new test',
        code: '//code of the new test',
        editing: true
    };

    $scope.editTest = function(index){
        var test = $scope.data.tests[index]
        test.editing = !test.editing;
    };


    var collectOff = $scope.$on( 'collectFormData', collectFormData );
    $scope.$on('$destroy',function(){ collectOff(); });

    if( $scope.microtask.promptType === 'edit' )
        editTest(null,$scope.behaviors.length-1);

    function addTest(){
        $scope.data.newTest.added = true;
        $scope.data.tests.push($scope.data.newTest);
    }

    function collectFormData(event, microtaskForm) {
        addTest();
        var formData = {
            functionVersion    : $scope.funct.rec.version,
            tests              : [],
            isDescribeComplete : $scope.isComplete
        };

        $scope.data.tests.map(function(test){
            formData.tests.push({
                id:          test.id,
                description: test.description,
                code:        test.code,
                added:       test.added,
                deleted:     test.deleted
            });
        });
        console.log(formData);
        $scope.$emit('submitMicrotask', formData);
    }

}]);