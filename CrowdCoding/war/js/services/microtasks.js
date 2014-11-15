/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
myApp.factory('microtasksService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {

	// Private variables
	var microtasks;

	var service = new function(){



		// Public functions
		this.get = function(id) { return get(id); };
		this.submit = function(id, formData){return submit(id, formData);};



		function get(id)
		{
			var microtaskSync = $firebase(new Firebase($rootScope.firebaseURL+'/microtasks/'+id));
			var microtask = microtaskSync.$asObject();
			console.log(microtask);
			return microtask;
		}

		function submit(microtask, formData)
		{
			//var microtask=microtasks[id-1];
			microtask.submission=formData;

			microtasks.$save(microtask);
		}
	}
	return service;
}]);