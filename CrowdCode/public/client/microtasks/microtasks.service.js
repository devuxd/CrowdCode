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
		function get (id){
			var microtask = $firebaseObject(new Firebase(firebaseUrl+'/microtasks/'+id));
			return microtask;
		}

		function submit (microtask, formData, autoSkip, autoFetch){
			var deferred = $q.defer();

			var skip = formData === undefined ? 'true' : 'false' ;
			autoFetch = (autoFetch ? 'true' : 'false');
			var disablePoint = autoSkip ? 'true':'false';

			// submit to the server
			$http.post('/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip=' + skip + '&disablepoint=' + disablePoint+ '&autoFetch=' + autoFetch, formData)
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

		function fetch (){
			var deferred = $q.defer();

			// ask the microtask id
			$http.get('/' + projectId + '/ajax/fetch')
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
				.get('/' + projectId + '/ajax/pickMicrotask?id='+ microtaskId)
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
				var microtask = get(fetchData.microtaskKey);
				microtask.$loaded().then(function() {
					$rootScope.$broadcast('microtaskLoaded',microtask, fetchData.firstFetch);
				});
			}
		}
		
		

	}

	return service;
}]);