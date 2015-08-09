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
		this.submit = submit;
		this.fetch = fetch;
		this.fetchSpecificMicrotask = fetchSpecificMicrotask;
		// Public functions
		function get (id){
			var microtask = $firebaseObject(new Firebase(firebaseUrl+'/microtasks/'+id));
			return microtask;
		}

		function submit (microtask, formData, autoSkip, autoFetch){
			var skip = formData === undefined ? 'true' : 'false' ;
			autoFetch = (autoFetch ? 'true' : 'false');
			var disablePoint = autoSkip ? 'true':'false';
			// submit to the server
			$http.post('/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip=' + skip + '&disablepoint=' + disablePoint+ '&autoFetch=' + autoFetch, formData)
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


		function fetchSpecificMicrotask(microtaskId){
			console.log('ask for loading '+microtaskId)
			$http.get('/' + projectId + '/ajax/pickMicrotask?id='+ microtaskId)
				.success(function(data, status, headers, config) {
					console.log('task  '+microtaskId + " loaded",data)
					loadMicrotask(data);
			})
			.error(function(data, status, headers, config) {
					console.log('task '+microtaskId + " error loading")
					$rootScope.$broadcast('noMicrotask');
			});
		}

		function loadMicrotask (data){
			console.log('LOADING ',data);
			if( data.microtaskKey === undefined ) {
				$rootScope.$broadcast('noMicrotask');
			} else {
				var microtask = get(data.microtaskKey);
				microtask.$loaded().then(function() {
					$rootScope.$broadcast('microtaskLoaded',microtask, data.firstFetch);
				});
			}
		}
		
		

	}

	return service;
}]);