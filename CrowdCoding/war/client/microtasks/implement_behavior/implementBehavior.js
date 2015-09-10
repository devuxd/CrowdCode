
///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ImplementBehavior', ['$scope', '$q', 'functionsService', 'functionUtils', 'Function', 'TestRunnerFactory', function($scope, $q, functionsService, functionUtils, Function, TestRunnerFactory) {
    
    var runner = new TestRunnerFactory.instance();

    // dto empty object, it's updated
    // every time the functionEditor performs
    // a successful validation of the code
    var functionDto = {};
    var requestedFunctions = [];
    var stubs;
    var editedStubs = {};


    // the data object is used inside the view
    $scope.data = {};
    $scope.data.running = false;
    $scope.data.changedSinceLastRun  = null;
    $scope.data.inspecting = false;
    $scope.data.selected = -1;

    $scope.data.tests = [];
    for( var i = 0; i < $scope.funct.tests.length ; i++ ){
        if( $scope.funct.tests[i].isDeleted )
            continue;

        var test = angular.copy($scope.funct.tests[i]);
        test.editing = true;
        test.running = true;
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

    

    // methods used inside the microtask view
    $scope.toggleSelect   = toggleSelect;
    $scope.toggleInspect  = toggleInspect;
    $scope.toggleDispute  = toggleDispute;
    $scope.saveStub       = saveStub;
    $scope.cancelStub     = cancelStub;
    $scope.run = run;

    // functionEditor callbacks
    $scope.editorCallbacks = {
        onCodeChanged : onCodeChanged,
        onFunctionParsed : onFunctionParsed,
        onEditStub : onEditStub
    };

    // listener to the submit button click
    $scope.taskData.collectFormData = collectFormData ;


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


    function toggleSelect($event,test){
        if( $scope.data.selected == -1 )
            $scope.data.selected = test;
        else {
            $scope.data.inspecting = false;
            $scope.data.selected = -1;
        }
            

        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleInspect($event){
        if( !$scope.data.changedSinceLastRun ){
            $scope.data.inspecting = !$scope.data.inspecting;
        }
           
        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleDispute($event){
        $scope.data.selected.dispute.active = !$scope.data.selected.dispute.active;

        if( $scope.data.selected.dispute.active ){
            $scope.data.selected.dispute.text = "";
        }
           
        $event.preventDefault();
        $event.stopPropagation();
    }

    function collectFormData(microtaskForm) {
    	formData = {
            'function': functionDto,
            requestedFunctions: requestedFunctions,
            requestedADTs: [],
            disputedTests: []
        };

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
        console.log('submitted function',formData);
        return formData;
    }

    function inputsKeyToInputs(inputsKey){
        return JSON.parse('['+inputsKey+' ]');
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


}]);