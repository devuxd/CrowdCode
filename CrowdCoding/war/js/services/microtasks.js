/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
myApp.factory('microtasksService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {




	var service = new function(){

		// Private variables
		var microtasks;
		var t=this;
		this.loaded= false;
		// Public functions
		this.init = function() { return init(); };
		this.get = function(id) { return get(id); };
		this.submit = function(id, formData){return submit(id, formData);};


		// Function bodies
		function init()
		{
			var microtasksSync = $firebase(new Firebase($rootScope.firebaseURL+'/microtasks'));
			microtasks = microtasksSync.$asArray();
			microtasks.$loaded().then(function(){ 
				console.log("MICROTASK INITIALIZED");
				$rootScope.loaded.microtasks=true;	});

		}

		function get(id)
		{
			console.log("id microtask"+ id)
			return microtasks[id-1];
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