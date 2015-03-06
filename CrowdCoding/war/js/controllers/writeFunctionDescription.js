
////////////////////////////////////////////
//  WRITE FUNCTION DESCRIPTION CONTROLLER //
////////////////////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteFunctionDescriptionController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService) {
    // initialization of models
    $scope.model = {};
    $scope.model.description = "";
    $scope.model.returnType = "";
    $scope.model.functionName = "";
    $scope.model.parameters = [];


    $scope.dispute = {
        active : false,
        text   : '',
        toggle : function(){
            $scope.dispute.active = ! $scope.dispute.active;
            if( $scope.dispute.active )
                $scope.dispute.text = '';
        }
    };

    // addParameter and deleteParameter
    $scope.addParameter = function() {
        var parameter = {
            name: '',
            type: '',
            description: '',
        };
        $scope.model.parameters.push(parameter);
    };
    $scope.deleteParameter = function(index) {
        event.preventDefault();
        event.stopPropagation();
        if( $scope.model.parameters.length>1 )
            $scope.model.parameters.splice(index, 1);
    };


    if(angular.isDefined($scope.microtask.reissuedFrom)){
        $scope.model.functionName = $scope.reissuedMicrotask.submission.name;
        $scope.model.description  = $scope.reissuedMicrotask.submission.description;
        $scope.model.returnType   = $scope.reissuedMicrotask.submission.returnType;
        $scope.model.parameters   = $scope.reissuedMicrotask.submission.parameters;
    }
    else{
        //Add the first parameter
        $scope.addParameter();
    }
    //prepare the codemirror Value
    $scope.code = $scope.funct.getFunctionCode();
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        //set all forms dirty to make them red if empty
        $scope.makeDirty(microtaskForm);
        //set the variables
        var error ="";
        var header="";

        //if the form is invalid throw an error
        if (microtaskForm.$invalid) {
            error = 'Fix all errors before submit';
        }
        //else retrieves the data and pass them to jshint to check that all are valid
             //   NOT SURE THAT WE NEED TO LINT THE CODE OF THE DESCRIPTION

               // allFunctionCode = functionsService.getAllDescribedFunctionCode()+ " var debug = null; " ;
               // console.log('function name',$scope.model.functionName);

            //     var functionCode = allFunctionCode + " " + header + "{}";
            //     var lintResult = -1;
            //     // try to run JSHINT or catch and print error to the console
            //     try {
            //         lintResult = JSHINT(functionCode, getJSHintGlobals());
            //     } catch (e) {
            //         console.log("Error in running JSHHint. " + e.name + " " + e.message);
            //     }

            //     if (!lintResult) {
            //         console.log(lintResult);
            //         error="You are using Javascript redserved word, please change them";
            //     }
            // }

        //if all went well submit the result
        if(error!=="") {

            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/html/templates/alert/alert_submit.html',
                container: 'alertcontainer'
            });

        } else {

            formData = {
                name        : $scope.model.functionName,
                returnType  : $scope.model.returnType,
                parameters  : $scope.model.parameters,
                description : $scope.model.description,
                header      : renderHeader($scope.model.functionName, $scope.model.parameters)
            };

            if($scope.dispute.active){
                formData.inDispute = true;
                formData.disputeFunctionText = $scope.dispute.text;
            }
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);
