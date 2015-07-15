
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'TestRunnerFactory',  function($scope, $timeout, $rootScope, $alert, $modal, functionsService, TestRunnerFactory) {
    console.log($scope.microtask);
    // prepare the data for the view
    $scope.data = {};
    $scope.data.dispute = { active: false, text: '' }; 
    $scope.data.isComplete = false;
    $scope.data.selected = -1;
    $scope.data.newTest = {
        description: '',
        code: '//write the test code',
        editing: true,
        added: true,
    };
    // load the tests:
    // need to store the collection as array because
    // from firebase comes as an object collection
    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.editing = false;
        test.edited = false;
        return angular.copy(test);
    });

    // expose the toggle and edit test functions to the scope
    $scope.toggleEdit   = toggleEdit;
    $scope.toggleSelect = toggleSelect;

    // register the collect form data listeners 
    // and the microtask form destroy listener
    var collectOff = $scope.$on( 'collectFormData', collectFormData );
    $scope.$on('$destroy',function(){ collectOff(); });

    function toggleSelect($event,test){
        if( $scope.data.selected == -1 )
            $scope.data.selected = test;
        else {
            $scope.data.selected.editing = false;
            $scope.data.selected = -1;
        }
            
        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleEdit($event){
        
        if( $scope.data.selected != -1 ) {
            $scope.data.selected.editing = !$scope.data.selected.editing;
            $scope.data.selected.edited = true;
        }

        $event.preventDefault();
        $event.stopPropagation();
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
            isDescribeComplete : $scope.data.isComplete,
            disputeFunctionText : ''
        };

        if( $scope.data.dispute.active ){
            formData.disputeFunctionText = $scope.data.dispute.text;
        }
        else {
            // add the current test to the list
            if( !$scope.data.isComplete )
                addTest();

            // for each of the tests, create a testDTO object
            formData.tests = $scope.data.tests.map(function(test){
                return {
                    id:          test.id,
                    description: test.description,
                    code:        test.code,
                    edited:      test.edited,
                    added:       test.added,
                    deleted:     test.deleted
                };
            }); 
        }
        

        console.log(formData);

        // tell the microtaskForm that the data is ready
        $scope.$emit('submitMicrotask', formData);

    }

}]);