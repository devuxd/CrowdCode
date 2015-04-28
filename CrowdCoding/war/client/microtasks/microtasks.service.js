/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
angular
    .module('crowdCode')
    .factory('microtasksService', ['$window','$rootScope','$firebase','$http','$q', 'userService', function($window,$rootScope,$firebase,$http,$q, userService) {

	// Private variables
	var microtasks;
	var service = new function(){

		this.get = get;
		this.submit = submit;
		this.fetch = fetch;

		// Public functions
		function get (id){
			var microtaskSync = $firebase(new Firebase($rootScope.firebaseURL+'/microtasks/'+id));
			var microtask = microtaskSync.$asObject();
			return microtask;
		}

		function submit (microtask, formData,autoSkip){
			var skip = formData === undefined ? 'true' : 'false' ;
			var disablePoint = autoSkip ? 'true':'false';
			// submit to the server
			$http.post('/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip=' + skip + '&disablepoint=' + disablePoint, formData)
				.success(function(data, status, headers, config) {
					loadMicrotask(data);
				})
				.error(function(data, status, headers, config) {
					$rootScope.$broadcast('noMicrotask');
				});
		}

		function fetch (){
			// ask the microtask id
			$http.get('/' + projectId + '/ajax/fetch')
				.success(function(data, status, headers, config) {
					loadMicrotask(data);
				})
				.error(function(data, status, headers, config) {
					$rootScope.$broadcast('noMicrotask');
				});
		}

		function loadMicrotask (data){
			if(data.microtaskKey===undefined) {
				$rootScope.$broadcast('noMicrotask');
			} else {
				var microtask = get(data.microtaskKey);
				microtask.$loaded().then(function() {
					console.log(microtask);
					$rootScope.$broadcast('loadMicrotask',microtask, data.firstFetch);
				});
			}
		}

	}

	return service;
}]);