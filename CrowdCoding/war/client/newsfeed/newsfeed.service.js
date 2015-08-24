/////////////////////////
//   NEWSFEED SERVICE   //
/////////////////////////
angular
    .module('crowdCode')
    .factory('newsfeedService', ['$window','$rootScope', '$http','$q','$firebaseArray', 'firebaseUrl', 'workerId', function($window, $rootScope,  $http, $q,$firebaseArray, firebaseUrl, workerId) {

	// Private variables
	var newsfeed;
	var service = new function(){

		this.get = get;
		this.init = init;
		this.challengeReview=challengeReview;
		
		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
		   	var ref = new Firebase(firebaseUrl + '/workers/' + workerId + '/newsfeed');
			newsfeed =$firebaseArray(ref);
			newsfeed.$loaded().then(function(){
				// tell the others that the newsfeed services is loaded
				$rootScope.$broadcast('serviceLoaded','newsfeed');
			});
		}

		function get (){
			return newsfeed;
		}
		
		function challengeReview(reviewKey, challengeText)
		{
			console.log(reviewKey);
			console.log(challengeText);
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/ajax/challengeReview?reviewKey=' + reviewKey, challengeText)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}
	}

	return service;
}]);