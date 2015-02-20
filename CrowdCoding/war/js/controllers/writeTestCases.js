
//////////////////////////////////
//  WRITE TEST CASES CONTROLLER //
//////////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteTestCasesController', ['$scope', '$rootScope', '$firebase', '$alert',  'TestList', 'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  TestList, functionsService, FunctionFactory, ADTService) {
    

    // private variables
    var alert = null;

    //if a function starts with CR cannot be disputed
    $scope.canBeDisputed=true;
    if( $scope.funct.readOnly)
        $scope.canBeDisputed=false;

    // scope variables 
    $scope.model = {};
    $scope.model.newTestcase = "";
    $scope.model.testcases   = TestList.getTestCasesByFunctionId($scope.funct.id);
    $scope.dispute = false;
    $scope.disputeText = "";

    if(angular.isDefined($scope.microtask.reissuedFrom)){
        if($scope.microtask.promptType=='FUNCTION_SIGNATURE')
            $scope.model.testcases=$scope.reissuedMicrotask.submission.testCases;
    }

    //$scope.functionDescription = functionsService.renderDescription($scope.funct) + $scope.funct.header;

    // addTestCase action 
    $scope.addTestCase = function() {
        // push the new test case and set the flag added to TRUE
        var testCase = $scope.model.newTestcase.replace(/["']/g, "");

        if ( testCase !== "") {
            var exists = false;
            angular.forEach($scope.model.testcases,function(value,index){
                if( !exists && value.text == testCase )
                    exists = true;
            });

            if( !exists ){
                 // push the new test cases
                $scope.model.testcases.push({
                    id      : null,
                    text    : testCase,
                    added   : true,
                    deleted : false
                });
            }
            // reset the new test case field
            $scope.model.newTestcase = "";
        }
    };

    //deleteTestCase actions
    $scope.removeTestCase = function(index) {
        // if the testcase was added during this microtask, remove it from the array
        if ($scope.model.testcases[index].added === true) 
            $scope.model.testcases.splice(index, 1);
        // else set the flag DELETED to true
        else $scope.model.testcases[index].deleted = true;
    };

    $scope.toggleDispute = function() {
        $scope.dispute = !$scope.dispute;
        if (!$scope.dispute) $scope.disputeText = "";
    };

    // collect form data
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {


        $scope.makeDirty(microtaskForm);

        // initialize the error
        var error = "";
        // if the new test case field is not empty,
        // add as a new test case
     
        if (microtaskForm.$invalid)  
            error = "Fix all the errors before submit";

        if (!$scope.dispute && $scope.model.testcases.length === 0 && $scope.model.newTestcase === "") 
            error = "Add at least 1 test case";

        // if there is an error 
        if (error !== "") {
            // destroy the previous alert
            if (alert !== null) alert.destroy();
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
            if($scope.dispute){
                // prepare form data for submission
                formData = {
                    isFunctionDispute : $scope.dispute,
                    disputeText :       $scope.disputeText,
                    functionVersion : $scope.funct.version
                    
                    };
            }
            else{

                if($scope.model.newTestcase !== "")
                    $scope.addTestCase();

                // prepare form data for submission
                formData = {
                        isFunctionDispute : false,
                        testCases       : $scope.model.testcases,
                        functionVersion : $scope.funct.version,
                };
            }
        
            // call microtask submission
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });

}]);