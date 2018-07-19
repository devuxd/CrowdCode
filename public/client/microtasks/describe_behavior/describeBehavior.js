
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'TestRunnerFactory', 'Test', 'functionUtils', 'Function', '$q',
    function($scope, $timeout, $rootScope, $alert, $modal, functionsService, TestRunnerFactory, Test, functionUtils, Function, $q) {

    // prepare the data for the view
    $scope.data = {};
    $scope.data.dispute = { active: false, text: '' };
    $scope.data.tests = [];
    $scope.data.isComplete = false;
    $scope.data.numDeleted = 0;
    $scope.data.selected = -1;
    $scope.data.running = false;
    $scope.data.changedSinceLastRun  = null;
    $scope.data.inspecting = false;
    $scope.data.selected1 = -1;

    var newTest = {
        description: '',
        isSimple : false,
        inputs: $scope.funct.parameters.map(function(par){ return ""; }),
        output: "",
        code: '//write the test code.',
        added: true,
        deleted: false
    };

    var runner = new TestRunnerFactory.instance();

    // dto empty object, it's updated
    // every time the functionEditor performs
    // a successful validation of the code
    var functionDto = {};
    var requestedFunctions = [];
    var stubs;
    var editedStubs = {};


    // if the microtask is reissued
    if( $scope.microtask.reissuedSubmission != undefined ){

        $scope.data.isComplete = $scope.microtask.reissuedSubmission.isDescribeComplete;

        // if( $scope.microtask.reissuedSubmission.disputeFunctionText.length > 0 ){
        //     $scope.data.dispute.active = true;
        //     $scope.data.dispute.text   = $scope.microtask.reissuedSubmission.disputeFunctionText;
        // }

        if( $scope.microtask.reissuedSubmission.disputedTests != undefined ){
            var disputed = $scope.microtask.reissuedSubmission.disputedTests;
        }

        // load tests from the previous submission
        var reissuedTests = $scope.microtask.reissuedSubmission.tests ;
        if(angular.isDefined(reissuedTests)) {
          for( var i = 0 ; i < reissuedTests.length ; i++ ){
              var test = new Test(reissuedTests[i], $scope.funct.name);
              // flag the test if is disputed
              if( disputed != undefined ){
                  for( var d = 0 ; d < disputed.length ; d++ ){
                      if( disputed[d].id == test.id ){
                          test.dispute = {
                              active: true,
                              text  : disputed[d].disputeText
                          }
                      } else {
                        test.dispute = {
                            active: false,
                            text  : 'aa'
                        }
                      }
                  }

              } else {
                test.dispute = {
                    active: false,
                    text  : 'aa'
                }
              }
              test.edited  = false;
              test.deleted = false;
              test.added = false;

              $scope.data.tests.push(test);
          }
        }
    }
    // otherwise
    else {
        // load tests from the function
        for( var i = 0; i < $scope.funct.tests.length ; i++ ){
            if( $scope.funct.tests[i].deleted )
                continue;

            var test = angular.copy($scope.funct.tests[i]);
            test.edited  = false;
            test.deleted = false;
            test.added = false;
            test.dispute = { active:false, text: 'aa' };

            // flag the test if is disputed
            if( $scope.microtask.reissuedSubmission != undefined ){
                var disputed = $scope.microtask.reissuedSubmission.disputedTests;
                if( disputed != undefined ){
                    for( var d = 0 ; d < disputed.length ; d++ ){
                        if( disputed[d].id == test.id ){
                            test.dispute = {
                                active: true,
                                text  : disputed[d].disputeText
                            }
                        }
                    }

                }

            }

            $scope.data.tests.push(test);
        }
    }

    // flag the disputed test

    // if( $scope.microtask.disputedTests !== undefined ){
    //     for( var a = 0; a < $scope.microtask.disputedTests.length ; a++ ){
    //         for( var t = 0 ; t < $scope.data.tests.length; t++ ){
    //             var test = $scope.data.tests[t];
    //             if( $scope.microtask.disputedTests[a].id == test.id ){
    //                 test.dispute = {
    //                     active:true,
    //                     text: $scope.microtask.disputedTests[a].disputeText
    //                 };
    //             }
    //         }
    //     }
    // }


    // expose the toggle and edit test functions to the scope
    $scope.toggleEdit   = toggleEdit;
    $scope.toggleDelete = toggleDelete;
    $scope.toggleSelect = toggleSelect;
    $scope.toggleSelect1 = toggleSelect1;
    $scope.addNew       = addNew;
    $scope.toggleInspect  = toggleInspect;
    $scope.toggleDispute  = toggleDispute;
    $scope.saveStub       = saveStub;
    $scope.cancelStub     = cancelStub;
    $scope.run = run;

    // run the tests for the first time
    run().then(function(){
        $scope.data.tests.sort(function(tA,tB){
            if( tA.result.passed && !tB.result.passed ) return -1;
            if( !tA.result.passed && tB.result.passed ) return 1;
            return 0;
        });
    });

    function run(){

        var deferred = $q.defer();
        $scope.data.running = true;
        $scope.data.inspecting = false;

        var code = $scope.data.editor ? $scope.data.editor.getValue() : $scope.funct.getFullCode();
        var tobeTested = [];
        angular.forEach($scope.data.tests, function(value, key) {
          if(value.isSimple && value.added == true) {
            this.push(new Test(value, $scope.funct.name));
          } else {
            this.push(value);
          }
        }, tobeTested);
        runner
            .run(
                $scope.data.tests,
                $scope.funct.name,
                code,
                stubs,
                requestedFunctions
                )
            .then(function(result){
                stubs = result.stubs;
                $scope.data.tests = result.tests;
                $scope.data.running = false;
                $scope.data.changedSinceLastRun = false;
                deferred.resolve();
            });
        return deferred.promise;
    }

    // functionEditor callbacks
    $scope.editorCallbacks = {
        onCodeChanged : onCodeChanged,
        onFunctionParsed : onFunctionParsed,
        onEditStub : onEditStub
    };

    function toggleInspect($event){
        if( !$scope.data.changedSinceLastRun ){
            $scope.data.inspecting = !$scope.data.inspecting;
        }

        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleDispute($event){
        $scope.data.selected1.dispute.active = !$scope.data.selected1.dispute.active;

        if( $scope.data.selected1.dispute.active ){
            $scope.data.selected1.dispute.text = "";
        }

        $event.preventDefault();
        $event.stopPropagation();
    }

    function cancelStub(){
        $scope.data.editingStub = false;
    }

    function onFunctionParsed(_functionDto,_requestedFunctions){
            functionDto = _functionDto;
        requestedFunctions = _requestedFunctions;
    }

    function onCodeChanged(){
        $scope.data.inspecting = false;
        $scope.data.changedSinceLastRun = true;
    }

    function onEditStub(functionName,inputsKey){
        console.log(stubs);
        var funct = functionsService.getByName(functionName);
        if( funct === null ){
            for( var i = 0; i < requestedFunctions.length ; i++ ){
                if( requestedFunctions[i].name == functionName )
                    funct = new Function( requestedFunctions[i] );
            }
        }
        if( funct === null ) throw 'Cannot find the function '+functionName;

        var inputs = inputsKeyToInputs(inputsKey);
        $scope.data.editingStub = {
            functionName : functionName,
            inputsKey    : inputsKey,
            functionDescription : funct.getSignature(),
            parameters   : funct.parameters.map(function(par,index){
                return {
                    name: par.name,
                    type: par.type,
                    value: angular.toJson(inputs[index])
                };
            }),
            output       : {
                type  : funct.returnType,
                value : JSON.stringify(stubs[functionName][inputsKey].output)
            }
        };

        console.log('editing stub',$scope.data.editingStub.id);
    }

    function saveStub(){
        var output       = eval('('+$scope.data.editingStub.output.value+')') || null;
        var functionName = $scope.data.editingStub.functionName;
        var inputsKey    = $scope.data.editingStub.inputsKey;

        if( !editedStubs.hasOwnProperty(functionName) )
            editedStubs[functionName] = {};

        stubs[functionName][inputsKey].output = output;
        editedStubs[functionName][inputsKey]  = stubs[functionName][inputsKey];

        console.log('saving stub ',stubs[functionName][inputsKey].id);

        $scope.data.editingStub = false;
    }

    function inputsKeyToInputs(inputsKey){
        return JSON.parse('['+inputsKey+' ]');
    }

    // register the collect form data listeners
    // and the microtask form destroy listener
    $scope.taskData.collectFormData = collectFormData;

    function toggleSelect1($event,test){
        if( $scope.data.selected1 == -1 ) {
          if(test.isSimple === true)
            test.code = (new Test(test, $scope.funct.name)).code;
          $scope.data.selected1 = test;
        }
        else {
            $scope.data.inspecting = false;
            $scope.data.selected1 = -1;
        }


        $event.preventDefault();
        $event.stopPropagation();
    }


    function addNew($event){
        var lastAdded = angular.copy(newTest);
        lastAdded.dispute = { active:false, text: 'aa' };
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

    // function toggleSelect($event,test){
    //     if( $scope.data.selected == -1 )
    //         $scope.data.selected = test;
    //     else {
    //         $scope.data.inspecting = false;
    //         $scope.data.selected = -1;
    //     }
    //
    //
    //     $event.preventDefault();
    //     $event.stopPropagation();
    // }

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
        $scope.data.selected1 = -1 ;

        if( form.$invalid ){
          console.log("form is invalid ----", form.$error);
            $modal({template : '/client/microtasks/modal_form_invalid.html' , show: true});
            form.$setDirty();
            return;
        }

        // prepare the microtask submit data
        var formData = {
            functionVersion    : $scope.funct.version,
            tests              : [],
            isDescribeComplete : $scope.data.isComplete,
            disputeFunctionText : '',
            'function': functionDto,
            requestedFunctions: requestedFunctions,
            requestedADTs: [],
            disputedTests: []
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
                    code:        test.isSimple ? "" : test.code,
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
                // else if(formData.disputeFunctionText.length > 0 || test.dispute.active === true) {
                //   if(!angular.isDefined(testDto.added) && !angular.isDefined(testDto.deleted) && !angular.isDefined(testDto.edited)) {
                //     testDto.added    = true;
                //   }
                // }

                formData.tests.push(testDto);
            }
        }
        console.log(formData.tests);

        // add the disputed tests
        $scope.data.tests.map(function(test){
            if( test.dispute.active ){
                formData.disputedTests.push({
                    id: test.id,
                    disputeText: test.dispute.text
                });
            }
        });

        // add the callee stubs
        formData.function.callees.map(function(callee){

            if( !editedStubs.hasOwnProperty(callee.name) )
                return;

            var cStubs = editedStubs[callee.name];
            callee.tests = [];
            for( var inputsKey in cStubs ){
                console.log('stub id ' + cStubs[inputsKey].id + ' is undefined?',cStubs[inputsKey].id == undefined);
                callee.tests.push({
                    id      : cStubs[inputsKey].id,
                    added   : cStubs[inputsKey].id == undefined ? true : false,
                    edited  : cStubs[inputsKey].id == undefined ? false : true,
                    isSimple: true,
                    description: cStubs[inputsKey].id == undefined ? 'auto generated' : cStubs[inputsKey].description,
                    inputs : inputsKeyToInputs(inputsKey),
                    output : JSON.stringify(cStubs[inputsKey].output),
                });
            }
        });

        // add the requested functions stubs
        formData.requestedFunctions.map(function(requested){
            if( !editedStubs.hasOwnProperty(requested.name) )
                return;

            var rStubs = editedStubs[requested.name];
            requested.tests = [];
            for( var inputsKey in rStubs ){
                requested.tests.push({
                    id          : rStubs[inputsKey].id,
                    added       : true,
                    isSimple    : true,
                    description : 'auto generated',
                    inputs      : inputsKeyToInputs(inputsKey),
                    output      : JSON.stringify(rStubs[inputsKey].output)
                });
            }
        });
        console.log('submitted form data',formData);

        return formData;

    }

}]);
