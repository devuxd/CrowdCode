
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
    
    var newTest = {
        description: '',
        type : 'advanced',
        code: '//write the test code',
        added: true,
        deleted: false
    };
    // load the tests:
    // need to store the collection as array because
    // from firebase comes as an object collection
    $scope.data.tests = $scope.funct.tests.map(function(test){
        test.edited  = false;
        test.deleted = false;
        test.type = 'simple';
        if( $scope.microtask.disputedTests !== undefined )

            for( var i = 0; i < $scope.microtask.disputedTests.length ; i++ ){
                if( $scope.microtask.disputedTests[i].id == test.id ){
                    test.dispute = { 
                        active:true, 
                        text: $scope.microtask.disputedTests[i].disputeText  
                    };
                }
            }

        return angular.copy(test);
    });

    // expose the toggle and edit test functions to the scope
    $scope.toggleEdit   = toggleEdit;
    $scope.toggleDelete = toggleDelete;
    $scope.toggleSelect = toggleSelect;
    $scope.addNew       = addNew;

    // register the collect form data listeners 
    // and the microtask form destroy listener
    $scope.taskData.collectFormData = collectFormData;

    
    // addNew();
    // $scope.data.selected = -1;

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

            if( $scope.data.selected.deleted )
                $scope.data.selected = -1;
        }



        $event.preventDefault();
        $event.stopPropagation();
    }


    function collectFormData(form) {

        // console.log('collecting form data',form.$valid,form);
        // console.log('how many tests',$scope.data.tests.length);
        // for( var i = 0 ; i < $scope.data.tests.length; i++ ){
        //     if( !form['testForm_'+i].$valid )
        //         console.error('test form '+i+' is INVALID!');
        //     else 
        //         console.log('test form '+i+' is VALID!');
        // }

        // $modal({template : '/client/microtasks/modal_form_invalid.html' , show: true});

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
        

        // tell the microtaskForm that the data is ready
        $scope.$emit('submitMicrotask', formData);

    }

}]);