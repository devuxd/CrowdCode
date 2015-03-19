angular
    .module('crowdCode')
    .directive('news', news);

function news($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService) {
    return {
        restrict: 'E',
        templateUrl: '/client/newsfeed/news_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        controller: function($scope, $element) {
            $scope.popover=[];
           
            // create the reference and the sync
            var ref = new Firebase($rootScope.firebaseURL + '/workers/' + $rootScope.workerId + '/newsfeed');
            var sync = $firebase(ref);

            // bind the array to scope.leaders
            $scope.news = sync.$asArray();
        }
    };
}