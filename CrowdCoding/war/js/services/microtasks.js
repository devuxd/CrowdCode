/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
myApp.factory('microtasksService', ['$window','$rootScope','$firebase','$http','$q', function($window,$rootScope,$firebase,$http,$q) {

	// Private variables
	var microtasks;

	var service = {

		// Public functions
		get : function(id){
			var microtaskSync = $firebase(new Firebase($rootScope.firebaseURL+'/microtasks/'+id));
			var microtask = microtaskSync.$asObject();
			
			return microtask;
		},

		submit : function(microtask, formData){	
			var deferred = $q.defer();

			if( microtask == undefined )
				deferred.reject();
			
			var skip = formData == null;
			// submit to the server
			$http.post('/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip='+(skip? 'true' : 'false'), formData)
				.success(function(data, status, headers, config) {
					// submit to Firebase
					microtask.submission = formData;
					microtask.$save();
					deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		},

		fetch : function(){
			var deferred = $q.defer();

			// ask the microtask id
			$http.get('/' + projectId + '/ajax/fetch')
			.success(function(data, status, headers, config) {
				deferred.resolve(data);	
			})
			.error(function(data, status, headers, config) {
				deferred.reject();
			});

			return deferred.promise;
		}
	}
	return service;
}]);