/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
angular
    .module('crowdCode')
    .factory('microtasksService', ['$window','$rootScope','$http','$q', '$firebaseObject', 'firebaseUrl', 'userService', function($window,$rootScope,$http,$q,$firebaseObject,firebaseUrl,userService) {

	// Private variables
	var microtasks;
	var service = new function(){

		this.get = get;
		this.load = load;
		this.submit = submit;
		this.fetch = fetch;
		this.fetchSpecificMicrotask = fetchSpecificMicrotask;

		// Public functions
		function get (id, type){
      var microtaskRef = firebase.database().ref().child('Projects').child(projectId).child('microtasks').child(type).child(id);
			var microtask = $firebaseObject(microtaskRef);
			return microtask;
		}

		function submit (microtask, formData, autoSkip, autoFetch){
			var deferred = $q.defer();

			var skip = formData === undefined ? 'true' : 'false' ;
			autoFetch = (autoFetch ? 'true' : 'false');
			var disablePoint = autoSkip ? 'true':'false';

			// submit to the server
			$http.post('/api/v1/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip=' + skip + '&disablepoint=' + disablePoint+ '&autoFetch=' + autoFetch, formData)
				.success(function(data, status, headers, config) {
					if( data !== "success" )
						deferred.reject();
					else
						deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});

			return deferred.promise;
		}

		function fetch (){
			var deferred = $q.defer();

			// ask the microtask id
			$http.get('/api/v1/' + projectId + '/ajax/fetch')
				.success(function(data, status, headers, config) {
					if( data.microtaskKey === undefined )
						deferred.reject();
					else
						deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});

			return deferred.promise;
		}


		function fetchSpecificMicrotask(microtaskId){
			var deferred = $q.defer();

			$http
				.get('/api/v1/' + projectId + '/ajax/pickMicrotask?id='+ microtaskId)
				.success(function(data, status, headers, config) {
					if( data.microtaskKey === undefined )
						deferred.reject();
					else
						deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});

			return deferred.promise;
		}

		function load(fetchData){
			if( fetchData.microtaskKey !== undefined ) {
				var microtask = fetchData.object;
        microtask.type = fetchData.type;
        microtask.$id = fetchData.microtaskKey;
        microtask.fetch_time = fetchData.fetch_time;
        $rootScope.$broadcast('microtaskLoaded',microtask);
        // get(fetchData.microtaskKey);
				// microtask.$loaded().then(function() {
				// 	$rootScope.$broadcast('microtaskLoaded',microtask, fetchData.firstFetch);
				// });
			}
		}



	}

	return service;
}]);
