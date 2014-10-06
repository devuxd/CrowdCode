
//////////////////////
// WORKER SERVICE   //
//////////////////////
myApp.factory('worker', ['$window','$rootScope', function($window,$rootScope) {
    var worker = {};
    
	// logout the worker
    worker.login = function(){
		
	}
	
	// logout the worker from the system
	worker.logout = function(){
		
	}
	
	// distributed test work
	worker.listenForJobs = function(){
		console.log('listening from jobs');
	}
	
    return worker;
}]); 