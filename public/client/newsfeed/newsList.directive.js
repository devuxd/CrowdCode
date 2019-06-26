angular
    .module('crowdCode').directive('newsList',function($rootScope,$timeout,firebaseUrl, workerId, questionsService, functionsService, microtasksService){

	return {
		scope: false,
		restrict: "AEC",
		templateUrl: '/client/newsfeed/news_list.html',
		link: function($scope,$element,$attrs){
		}
	};
});