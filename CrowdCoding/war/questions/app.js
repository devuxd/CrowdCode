// create CrowdCodeWorker App and load modules
var myApp = angular.module('statistics',[ 
	'ngAnimate', 
	'firebase', 
	'ui.ace', 
	'mgcrea.ngStrap'
]);

// configure app modules
myApp.config(function() {


});

// define app constants
myApp.constant('projectId',projectId);
myApp.constant('workerId',workerId);
myApp.constant('firebaseUrl','https://crowdcode.firebaseio.com/projects/'+projectId);

myApp.directive('statisticsPanel',function($timeout,$firebase,firebaseUrl){

	return {
		scope: {},
		templateUrl: '/statistics/statisticsPanel.html',
		link: function($scope,$element,$attrs){
		}		
	};
});

myApp.directive('questionList',function($timeout,$firebase,firebaseUrl){
	return {
		scope: false,
		templateUrl: '/statistics/statisticsList.html',
		link: function($scope,$element,$attrs){
			$scope.search    = '';
			$scope.statisticsArray.$loaded().then(function(){
				$scope.statistics = $scope.statisticsArray;
			});

			var searchTimeout;
			$scope.$watch('search',function( val ){

				if (searchTimeout) $timeout.cancel(searchTimeout);	
		        searchTimeout = $timeout(function() {
		        	if( val.length == 0)
		        		$scope.statistics = $scope.statisticsArray;
		        	else {
		        		$scope.statistics = $scope.searchResults( val );
		        	}
		        }, 250); // delay 250 ms
			});
		}
	};
});

myApp.directive('questionDetail',function($timeout,$firebase,firebaseUrl){
	return {
		scope: false,
		templateUrl: '/statistics/questionDetail.html',
		link: function($scope,$element,$attrs){

			$scope.a = {
				text: ''
			};

			$scope.postAnswer = postAnswer;

			function postAnswer(){
				$scope.statisticsArray.$loaded().then(function(){
					if( $scope.sel.answers === undefined )
						$scope.sel.answers = [];

					$scope.a.id = $scope.sel.answers.length;
					$scope.a.workerId  = workerId;
					$scope.a.timestamp = Date.now();
					$scope.sel.answers.push($scope.a);
					$scope.statisticsArray.$save($scope.sel).then(function(){
						$scope.a = {
							text: ''
						};
					});
				});
			}
		}
	};
});

myApp.directive('questionForm',function($firebase,firebaseUrl,workerId){
	return {
		scope: false,
		templateUrl: '/statistics/questionForm.html',
		link: function($scope,$element,$attrs){
			console.log('init question form');
			$scope.q = {
				title: '',
				text: '',
				tags: [],
				answers: [],
				votes: []
			};
			$scope.newTag = '';

			$scope.postQuestion = postQuestion;
			$scope.addTag       = addTag;

			function addTag(){
				if( $scope.q.tags.indexOf($scope.newTag) == -1 )
					$scope.q.tags.push($scope.newTag);

				$scope.newTag = '';
			}

			function postQuestion(){
				$scope.statisticsArray.$loaded().then(function(){
					$scope.q.id = $scope.statisticsArray.length;
					$scope.q.workerId = workerId;
					$scope.q.timestamp = Date.now();
					$scope.statisticsArray.$add($scope.q).then(function(){
						$scope.q = {
							title: '',
							text: '',
							tags: []
						};
						$scope.setView('question_list');
					});
				});
			}

		}
	};
});
// run the app
myApp.run();