
//////////////////////////////////
//  WRITE TEST CASES CONTROLLER //
//////////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestCasesController', ['$scope', '$alert',  'TestList', 'functionsService','FunctionFactory', 'ADTService', function($scope, $alert,  TestList, functionsService, FunctionFactory, ADTService) {
    

    // private variables
    var alert = null;

    // scope data 
    $scope.dispute = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.dispute.active = ! $scope.dispute.active;
            if( $scope.dispute.active )
                $scope.dispute.text = '';
        } 
    };

    // if is not a reissued microtask, load the existent test cases
    // otherwise load the test cases from the reissued one
    var reissued = angular.isDefined($scope.microtask.reissuedFrom);
    $scope.model = {
        newTestCase : "",
        testcases   : reissued ? $scope.reissuedMicrotask.submission.testCases 
                               : TestList.getTestCasesByFunctionId($scope.funct.id)
    };

    // scope methods
    $scope.addTestCase    = addTestCase;
    $scope.removeTestCase = removeTestCase;

    // event listeners
    var collectOff = $scope.$on('collectFormData', collectFormData);
    $scope.$on('$destroy',collectOff);


    function addTestCase() {   
        var newTestCase = $scope.model.newTestCase !== undefined ? 
                            $scope.model.newTestCase.replace(/["']/g, "") : '' ;

        if( newTestCase.match(/(\{|\}|\[|\])/g) !== null ) {
            if (alert !== null) 
                alert.destroy();

            alert = $alert({
                title: 'Error!',
                content: 'brackets are not allowed in the test case description!',
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });
        } else if ( newTestCase !== '' )  {
            
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
                $scope.model.newTestCase = "";
            } else {
                if (alert !== null) 
                alert.destroy();

                alert = $alert({
                    title: 'Error!',
                    content: 'another test case with the same description exists!',
                    type: 'danger',
                    show: true,
                    duration: 3,
                    template: '/html/templates/alert/alert_submit.html',
                    container: 'alertcontainer'
                });
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

    function collectFormData(event, microtaskForm) {

        // insert the test case in the input box if there is one
        addTestCase();

        // initialize the error
        var error = "";

        if( !$scope.dispute.active && $scope.model.testcases.length === 0 ) 
            error = "Add at least 1 test case";
        else if( $scope.dispute.active && $scope.dispute.text == "" )
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
                inDispute         : $scope.dispute.active,
                functionVersion   : $scope.funct.version,
                testCases         : $scope.model.testcases
            };

            if($scope.dispute.active){
                formData.functionDisputeText = $scope.dispute.text;
            } 

            // call microtask submission
            $scope.$emit('submitMicrotask', formData);
        }
    }

}]);