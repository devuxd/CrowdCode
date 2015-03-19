///////////////////////////////
//  REUSE SEARCH CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReuseSearchController', ['$scope', '$alert', 'functionsService','FunctionFactory', function($scope, $alert, functionsService) {
    // set selected to -2 to initialize the default value
    //-2 nothing selected (need an action to submit)
    //-1 no function does this
    // 0- n index of the function selected
    $scope.selectedResult = -2;
    //display all the available function at the beginning
    $scope.results = functionsService.findMatches('', $scope.funct.name);

    $scope.code = $scope.funct.getFunctionCode();
    // search for all the functions that have $scope.reuseSearch.text in theirs description or header
    $scope.doSearch = function() {

        $scope.selectedResult = -2;
        $scope.results = functionsService.findMatches($scope.text, $scope.funct.name);
    };
    $scope.select = function(index) {
        $scope.selectedResult = index;
    };


    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {
        if ($scope.selectedResult == -2) {
            var error = 'Choose a function or select the checkbox "No funtion does this"';
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: '/client/microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        } else {
            //if no function selected the value of selected is ==-1 else is the index of the arrayList of function
            if ($scope.selectedResult == -1) formData = {
                functionName: "",
                functionId: 0,
                noFunction: true
            };
            else formData = {
                functionId: $scope.results[$scope.selectedResult].value.id,
                functionName: $scope.results[$scope.selectedResult].value.name,
                noFunction: false
            };
            $scope.$emit('submitMicrotask', formData);
        }
    });

    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);