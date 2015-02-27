
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
            text: '',
            added: true,
            deleted: false,
            id: $scope.model.parameters.length
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
        $scope.model.functionName=$scope.reissuedMicrotask.submission.name;
        $scope.model.description=$scope.reissuedMicrotask.submission.description;
        $scope.model.returnType=$scope.reissuedMicrotask.submission.returnType;
        for (var i = 0; i < $scope.reissuedMicrotask.submission.paramNames.length; i++) {

            $scope.model.parameters[i]={
                paramName: $scope.reissuedMicrotask.submission.paramNames[i],
                paramType: $scope.reissuedMicrotask.submission.paramTypes[i],
                paramDescription:$scope.reissuedMicrotask.submission.paramDescriptions[i]
            };
        }
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

        var paramNames = [];
        var paramTypes = [];
        var paramDescriptions = [];
        //if the form is invalid throw an error
        if (microtaskForm.$invalid) {
            error = 'Fix all errors before submit';
        }
        //else retrieves the data and pass them to jshint to check that all are valid
        else {
            if( ! $scope.dispute.active ){
                for (var i = 0; i < $scope.model.parameters.length; i++) {
                    paramNames.push($scope.model.parameters[i].paramName);
                    paramTypes.push($scope.model.parameters[i].paramType);
                    paramDescriptions.push($scope.model.parameters[i].paramDescription);
                }

                header = functionsService.renderHeader($scope.model.functionName, paramNames);
                allFunctionCode = functionsService.getAllDescribedFunctionCode()+ " var debug = null; " ;
                console.log('function name',$scope.model.functionName);

                var functionCode = allFunctionCode + " " + header + "{}";
                var lintResult = -1;
                // try to run JSHINT or catch and print error to the console
                try {
                    lintResult = JSHINT(functionCode, getJSHintGlobals());
                } catch (e) {
                    console.log("Error in running JSHHint. " + e.name + " " + e.message);
                }

                if (!lintResult) {
                    console.log(lintResult);
                    error="You are using Javascript redserved word, please change them";
                }
            }
                

        }

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
                name: $scope.model.functionName,
                returnType: $scope.model.returnType === undefined ? '' : $scope.model.returnType,
                paramNames: paramNames,
                paramTypes: paramTypes,
                paramDescriptions: paramDescriptions,
                description: $scope.model.description,
                header: header
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
