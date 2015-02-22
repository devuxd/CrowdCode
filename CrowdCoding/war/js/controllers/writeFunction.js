
///////////////////////////////
//  WRITE FUNCTION CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteFunctionController', ['$scope', '$rootScope', '$firebase',  'functionsService','FunctionFactory', 'ADTService', '$alert', function($scope, $rootScope, $firebase,  functionsService, FunctionFactory, ADTService, $alert) {
    
    $scope.codemirror = undefined;
    $scope.$on('collectFormData', collectFormData);

    if ($scope.microtask.promptType == 'DESCRIPTION_CHANGE') {
        var oldCode = $scope.microtask.oldFullDescription.split("\n");
        var newCode = $scope.microtask.newFullDescription.split("\n");
        var diffRes = diff(oldCode, newCode);
        var diffCode = "";
        angular.forEach(diffRes, function(diffRow) {
            if (diffRow[0] == "=") {
                diffCode += diffRow[1].join("\n");
            } else {
                for (var i = 0; i < diffRow[1].length; i++)
                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
            }
            diffCode += "\n";
        });
        $scope.diffCode = diffCode;
    }

    if( angular.isDefined($scope.microtask.reissuedFrom) )
            $scope.code = (new FunctionFactory($scope.reissuedMicrotask.submission)).getFullCode();
        else
            $scope.code = $scope.funct.getFullCode();


    function collectFormData(event, microtaskForm) {
        var error = "";
        var text= $scope.codemirror.getValue();

        //if there are error and pseudosegments
        if ( microtaskForm.$invalid){
            $alert({
               title: 'Error!',
               content: 'Fix all errors before submit!',
               type: 'danger',
               show: true,
               duration: 3,
               template: '/html/templates/alert/alert_submit.html',
               container: 'alertcontainer'
            });
        }
        else {
            //     description: functionParsed.description,
            //     header: functionParsed.header,
            //     name: functionName,
            //     code: body,
            //     returnType: functionParsed.returnType,
            //     paramNames: functionParsed.paramNames,
            //     paramTypes: functionParsed.paramTypes,
            //     paramDescriptions: functionParsed.paramDescriptions,
            //     calleeIds: calleeIds


            formData = functionsService.parseFunction($scope.codemirror);
            //add the dispute text to the submit
            if($scope.microtask.promptType==='RE_EDIT')
                formData.disputeText=$scope.microtask.disputeText;
            
            $scope.$emit('submitMicrotask', formData);
        }
    };


}]);