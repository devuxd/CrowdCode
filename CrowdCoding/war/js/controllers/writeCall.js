
///////////////////////////////
//  WRITE CALL CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('WriteCallController', ['$scope', '$rootScope', '$firebase', '$alert',  'functionsService','FunctionFactory', 'ADTService', function($scope, $rootScope, $firebase, $alert,  functionsService, FunctionFactory, ADTService) {
    // INITIALIZATION OF FORM DATA MUST BE DONE HERE

    //load the callee function
    $scope.calleeFunction = functionsService.get($scope.microtask.calleeID);


    if( angular.isDefined($scope.microtask.reissuedFrom) )
        $scope.funct.updateFunction($scope.reissuedMicrotask.submission);



    //remove the pseudofunction from the code of the function
    $scope.funct.removePseudoFunction( $scope.microtask.pseudoFunctionName );


    $scope.code = $scope.funct.getFullCode();

    $scope.codemirror = null;
    $scope.$on('collectFormData', collectFormData);

    function collectFormData(event, microtaskForm) {
        var error = "";
        var text = $scope.codemirror.getValue();
        var hasPseudosegment = text.search('//!') !== -1 || text.search('//#') !== -1;

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

            formData = functionsService.parseFunction($scope.codemirror);
            $scope.$emit('submitMicrotask', formData);
        }
    }
}]);