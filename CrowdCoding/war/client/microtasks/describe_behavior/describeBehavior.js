
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'TestRunnerFactory',  function($scope, $timeout, $rootScope, $alert, $modal, functionsService, TestRunnerFactory) {
    
    // prepare the data for the view
    $scope.data = {};
    $scope.data.isComplete = false;
    $scope.data.newTest = {
        description: 'should be the new test',
        code: '//code of the new test',
        editing: true,
        added: true
    };
    // load the tests:
    // need to store the collection as array because
    // from firebase comes as an object collection
    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.editing  = false;
        test.expanded = false;
        return angular.copy(test);
    });

    // expose the toggle and edit test functions to the scope
    $scope.toggleTest = toggleTest;
    $scope.editTest   = editTest;

    // register the collect form data listeners 
    // and the microtask form destroy listener
    var collectOff = $scope.$on( 'collectFormData', collectFormData );
    $scope.$on('$destroy',function(){ collectOff(); });

    function toggleTest(test){
        test.expanded = !test.expanded;
        if( !test.expanded && test.editing )
            test.editing = false;
    }

    function editTest(test,form){
        test.edited = true;
        test.editing = !test.editing;
        if( test.editing && !test.expanded )
            test.expanded = true;
        else if( !test.editing ){
            // check if the test was edited
        }
        
    }

    function addTest(){
        $scope.data.newTest.added = true;
        $scope.data.tests.push($scope.data.newTest);
    }

    function collectFormData(event, microtaskForm) {

        // prepare the microtask submit data
        var formData = {
            functionVersion    : $scope.funct.version,
            tests              : [],
            isDescribeComplete : $scope.isComplete
        };


        // add the current test to the list
        addTest();

        // for each of the tests, create a testDTO object
        formData.tests = $scope.data.tests.map(function(test){
            return {
                id:          test.id,
                description: test.description,
                code:        test.code,
                added:       test.added,
                deleted:     test.deleted
            };
        });

        console.log(formData);

        // tell the microtaskForm that the data is ready
        $scope.$emit('submitMicrotask', formData);

    }

}]);