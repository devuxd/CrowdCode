/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
angular
    .module('crowdCode')
    .factory('microtasksService', ['$window','$rootScope','$firebase','$http','$q', 'userService', function($window,$rootScope,$firebase,$http,$q, userService) {

	// Private variables
	var microtasks;
	var service = new function(){
		var fetchedMicrotaskKey;

		//this.fetchedMicrotaskKey
		this.getFetchedMicrotask = getFetchedMicrotask;
		this.get = get;
		this.submit = submit;
		this.fetch = fetch;

		function getFetchedMicrotask()
		{
			return fetchedMicrotaskKey;
		}
		// Public functions
		function get (id){
			var microtaskSync = $firebase(new Firebase($rootScope.firebaseURL+'/microtasks/'+id));
			var microtask = microtaskSync.$asObject();

			return microtask;
		}

		function submit (microtask, formData, autoSkip){
			var deferred = $q.defer();

			if( microtask == undefined )
				deferred.reject();

			var skip = formData == null;
			var disablePoint = autoSkip||false;

			console.log(JSON.stringify(formData));
			
			// submit to the server
			$http.post('/' + $rootScope.projectId + '/ajax/enqueue?key=' + microtask.$id+ '&skip='+(skip? 'true' : 'false') + '&disablepoint=' +(disablePoint ? 'true':'false'), formData)
				.success(function(data, status, headers, config) {
					// submit to Firebase
					microtask.submission = formData;
					microtask.$save();

					deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject(data);
				});

			return deferred.promise;
		}

		function fetch (){
			var deferred = $q.defer();
			console.log('FETCHING');
			// ask the microtask id
			$http.get('/' + projectId + '/ajax/fetch')
				.success(function(data, status, headers, config) {
					if(data!==undefined && data.microtaskKey!==undefined)
					{
						console.log(data.microtaskKey);
						fetchedMicrotaskKey= data.microtaskKey;
					}
					deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject(data);
				});

			return deferred.promise;
		}
	}
	return service;
}]);