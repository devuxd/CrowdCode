
//////////////////////////////////
//  WRITE TEST CASES CONTROLLER //
//////////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestCasesController', ['$scope', '$rootScope', '$firebase', '$alert',  'TestList', 'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  TestList, functionsService, FunctionFactory, ADTService) {
    

    // private variables
    var alert = null;

    // scope variables 
    $scope.inDispute = false;

    $scope.model = {};
    $scope.model.newTestcase = "";
    $scope.model.testcases   = [];
    $scope.model.disputeText = "";


    // if is not a reissued microtask, load the existent test cases
    // otherwise load the test cases from the reissued one
    var reissued = angular.isDefined($scope.microtask.reissuedFrom)

    if( ! reissued ) { 
        $scope.model.testcases = TestList.getTestCasesByFunctionId($scope.funct.id); 
    } else {
        $scope.model.testcases = $scope.reissuedMicrotask.submission.testCases;
    }

    
    $scope.addTestCase    = addTestCase;
    $scope.removeTestCase = removeTestCase;
    $scope.toggleDispute  = toggleDispute;


    function addTestCase() {

        // if is not empty string
        var newTestCase = $scope.model.newTestcase.replace(/["']/g, "");
        if ( newTestCase !== "" )  {
            
            var found = false;
            angular.forEach($scope.model.testcases,function(testCase,index){
                if( !found && testCase.text == newTestCase )
                    found = true;
            });

            if( !found ) {
                 // push the new test cases
                $scope.model.testcases.push({
                    id      : null,
                    text    : newTestCase,
                    added   : true,
                    deleted : false
                });

                // reset the new test case field
                $scope.model.newTestcase = "";
            } 
        }
    }
    
    function removeTestCase(index) {
        // if the testcase was added during this microtask, remove it from the array
        // else set the flag DELETED to true
        if ($scope.model.testcases[index].added === true) 
            $scope.model.testcases.splice(index, 1);
        else $scope.model.testcases[index].deleted = true;
    }

    function toggleDispute() {
        $scope.inDispute = !$scope.inDispute;
        if (!$scope.inDispute) 
            $scope.model.disputeText = "";
    }


    // collect form data
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

        // insert the test case in the input box if there is one
        addTestCase();

        // initialize the error
        var error = "";

        if( !$scope.inDispute &&  // if not in dispute
                $scope.model.testcases.length === 0 && // and there isn't a test case
                $scope.model.newTestcase === "") 
            error = "Add at least 1 test case";
        else if( $scope.inDispute && $scope.model.disputeText === undefined )
            error = 'The report text cannot be empty!';

        // if there is an error 
        if (error !== "") {
            // destroy the previous alert
            if (alert !== null) 
                alert.destroy();

            // build the new alert
            alert = $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        } 
        // if there isn't an error submit the form
        else {
            formData = {
                isFunctionDispute : $scope.inDispute,
                functionVersion   : $scope.funct.version,
                testCases         : $scope.model.testcases
            };

            if($scope.inDispute){
                formData.disputeText = $scope.model.disputeText;
            } 
            // call microtask submission
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });

}]);