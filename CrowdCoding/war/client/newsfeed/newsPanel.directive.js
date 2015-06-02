angular
    .module('crowdCode').directive('newsPanel',function($rootScope,$timeout,$firebase,firebaseUrl, workerId, questionsService, functionsService, FunctionFactory, microtasksService, newsfeedService){

	return {
		scope: {},
		templateUrl: '/client/newsfeed/news_panel.html',
		link: function($scope,$element,$attrs){
			$scope.view           = 'list';
			$scope.animation      = 'from-left';
			$scope.selectedNews   = null; 

			$scope.setUiView      = setUiView;
			$scope.setSelected    = setSelected;

			$scope.$on('showNews',  onShowNews );


			// bind the array to scope.leaders
			$scope.news = newsfeedService.get();

			function onShowNews( event, microtaskId ){
			    setSelected($scope.news.$getRecord(microtaskId));
			}
			function setSelected(news){
				$scope.selectedNews = news;
				setUiView('detail');
			}
			function setUiView(view){
				var prev = $scope.view;
				if( (prev == 'list' && view == 'detail') || (prev == 'detail' && view == 'list'))
					$scope.animation = 'from-right';
				else
					$scope.animation = 'from-left';
				$timeout(function(){ 
					$scope.view = view; 
					if( view == 'list' ) 
						$scope.selectedNews = null; 
				},200);
			}

			
			


		}
	};
});