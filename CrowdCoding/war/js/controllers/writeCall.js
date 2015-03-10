
///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteCallController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService) {
    // INITIALIZATION OF FORM DATA MUST BE DONE HERE
    $scope.data = {};
    $scope.data.hasPseudo = false;
    $scope.data.editor = null;    //load the callee function
    $scope.data.markers=[];
    $scope.calleeFunction = functionsService.get($scope.microtask.calleeID);
    $scope.data.markers.push({ 
        regex: $scope.calleeFunction.getName()+'[\\s]*\\([\\s\\w\\[\\]\\+\\.\\,]*\\)', 
        token: 'ace_pseudo_call'
    });


    if( angular.isDefined($scope.microtask.reissuedFrom) )
        $scope.funct.updateFunction($scope.reissuedMicrotask.submission);



    //remove the pseudofunction from the code of the function
    $scope.funct.removePseudoFunction( $scope.microtask.pseudoFunctionName );


    $scope.code = $scope.funct.getFullCode();

    $scope.codemirror = null;
    $scope.$on('collectFormData', collectFormData);

    function collectFormData(event, microtaskForm) {
        var error = "";
        
        //if there are error and pseudosegments
        if ( microtaskForm.$invalid){
            $alert({
               title: 'Error!',
               content: 'Fix all errors before submit, if you don\'t know how use the pseudocode',
               type: 'danger',
               show: true,
               duration: 3,
               template: '/html/templates/alert/alert_submit.html',
               container: 'alertcontainer'
            });
        }
        else {

            formData = functionsService.parseFunctionFromAce($scope.data.editor);
            $scope.$emit('submitMicrotask', formData);
        }
    }
}]);