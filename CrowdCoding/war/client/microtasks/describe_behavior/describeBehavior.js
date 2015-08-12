
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'TestRunnerFactory', 'Test',  function($scope, $timeout, $rootScope, $alert, $modal, functionsService, TestRunnerFactory, Test) {
    
    // prepare the data for the view
    $scope.data = {};
    $scope.data.dispute = { active: false, text: '' }; 
    $scope.data.tests = [];
    $scope.data.isComplete = false;
    $scope.data.numDeleted = 0;
    $scope.data.selected = -1;
    
    var newTest = {
        description: '',
        isSimple : false,
        inputs: $scope.funct.parameters.map(function(par){ return ""; }),
        output: "",
        code: '//write the test code',
        added: true,
        deleted: false
    };


    // if the microtask is reissued
    if( $scope.microtask.reissuedSubmission != undefined ){

        $scope.data.isComplete = $scope.microtask.reissuedSubmission.isDescribeComplete;

        if( $scope.microtask.reissuedSubmission.disputeFunctionText.length > 0 ){
            $scope.data.dispute.active = true;
            $scope.data.dispute.text   = $scope.microtask.reissuedSubmission.disputeFunctionText;
        }


        // load tests from the previous submission
        var reissuedTests = $scope.microtask.reissuedSubmission.tests ;
        for( var i = 0 ; i < reissuedTests.length ; i++ ){
            var test = new Test(reissuedTests[i]);

            $scope.data.tests.push(test);
        }
    }
    // otherwise 
    else {

        // load tests from the function 
        for( var i = 0; i < $scope.funct.tests.length ; i++ ){
            if( $scope.funct.tests[i].isDeleted )
                continue;
            
            var test = angular.copy($scope.funct.tests[i]);
            test.edited  = false;
            test.deleted = false;
            
            $scope.data.tests.push(test);
        } 
    }


    // flag the disputed test

    if( $scope.microtask.disputedTests !== undefined ){
        for( var a = 0; a < $scope.microtask.disputedTests.length ; a++ ){
            for( var t = 0 ; t < $scope.data.tests.length; t++ ){
                var test = $scope.data.tests[t];
                if( $scope.microtask.disputedTests[a].id == test.id ){
                    test.dispute = { 
                        active:true, 
                        text: $scope.microtask.disputedTests[a].disputeText  
                    };
                }
            }
        } 
    }


    // expose the toggle and edit test functions to the scope
    $scope.toggleEdit   = toggleEdit;
    $scope.toggleDelete = toggleDelete;
    $scope.toggleSelect = toggleSelect;
    $scope.addNew       = addNew;

    // register the collect form data listeners 
    // and the microtask form destroy listener
    $scope.taskData.collectFormData = collectFormData;


    function addNew($event){
        var lastAdded = angular.copy(newTest);
        $scope.data.tests.push(lastAdded);
        toggleSelect($event,lastAdded);
    }

    function toggleSelect($event,test){
        if( $scope.data.selected == -1 )
            $scope.data.selected = test;
        else {
            $scope.data.selected.editing = false;
            $scope.data.selected = -1;
        }
            
        // $event.preventDefault();
        // $event.stopPropagation();
    }

    var tmpTestData = { };
    function toggleEdit($event){
        
        if( $scope.data.selected != -1 ) {
            $scope.data.selected.editing = !$scope.data.selected.editing;

            $scope.data.selected.edited = true;
        }

        $event.preventDefault();
        $event.stopPropagation();
    }


    function toggleDelete($event){
        console.log('toggle delete');
        if( $scope.data.selected != -1 ) {
            $scope.data.selected.deleted = !$scope.data.selected.deleted;

            if( $scope.data.selected.deleted ){
                $scope.data.numDeleted ++;
                $scope.data.selected = -1;
            } else {
                $scope.data.numDeleted --;
            }
                
        }



        $event.preventDefault();
        $event.stopPropagation();
    }


    function collectFormData(form) {

        $scope.data.selected = -1 ;

        if( form.$invalid ){
            $modal({template : '/client/microtasks/modal_form_invalid.html' , show: true});
            form.$setDirty();
            return;
        }

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
            // if( !$scope.data.isComplete )
            //     addTest();

            // for each of the tests, create a testDTO object
            for( var idx = 0 ; idx < $scope.data.tests.length ; idx++ ){
                var test = $scope.data.tests[idx];



                var testDto = {
                    id:          test.id,
                    description: test.description,
                    isSimple:    test.isSimple,
                    code:        !test.isSimple  ? "" : test.code,
                    inputs:      test.isSimple ? test.inputs : [] ,
                    output:      test.isSimple ? test.output : "" 
                };

                if( test.added && test.deleted )
                    continue;

                if( test.added ) 
                    testDto.added    = true;
                else if( test.deleted )
                    testDto.deleted  = true;
                else if( form['testForm_'+idx].$dirty )
                    testDto.edited = true;

                formData.tests.push(testDto);
            } 
        }
        console.log(formData.tests);
        
        return formData;

    }

}]);