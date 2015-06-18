
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    
    $scope.behaviors = $scope.funct.rec.testsuite || [];
    console.log($scope.behaviors);

    $scope.activeDescriptions = [];
    $scope.currentIndex  = -1;
    $scope.noMore        = false;
    $scope.editBehavior  = editBehavior;

    $scope.newBehavior = {
        description: 'should be the new behavior',
        code: '//code of the new behavior'
    };

    $scope.$on( 'collectFormData', collectFormData );

    if( $scope.microtask.promptType === 'edit' )
        editBehavior($scope.behaviors.length-1);

    function editBehavior(index){
        if( $scope.activeDescriptions.indexOf(index) == -1 )
            $scope.activeDescriptions.push(index);

        $scope.currentIndex = index;
    }

    function collectFormData(event, microtaskForm) {
        if( !$scope.funct.rec.testsuite )
            $scope.funct.rec.testsuite = [];

        $scope.funct.rec.testsuite.push($scope.newBehavior);
        functionsService.getAll().$save($scope.funct.rec).then(function(){
            console.log('saved succesfully');
        });
    }

}]);