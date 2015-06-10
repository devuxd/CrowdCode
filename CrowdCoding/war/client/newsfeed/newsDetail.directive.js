
angular
    .module('crowdCode')
    .directive('newsDetail', function($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService,FunctionFactory, TestList){
    return {
        templateUrl: "/client/newsfeed/news_detail.html",
        restrict:"AEC",
        scope: false,
        link: function($scope, iElm, iAttrs, controller) {

        }
    };
});