////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope', function($window,$rootScope) {
    var user = {};
    
	// logout the worker
    user.login = function(){
		
	}
	
	// logout the worker from the system
    user.logout = function(){
		
	}
	
	// distributed test work
    user.listenForJobs = function(){
		console.log('listening from jobs');
	}
	
    return user;
}]); 
