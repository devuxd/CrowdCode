////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope','$firebase', function($window,$rootScope,$firebase) {
    var user = {};
    


 	// retrieve connection status and userRef
	var isConnected = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var userRef     = new Firebase(firebaseURL + '/presence/' + workerId);
	// when firebase is connected
	isConnected.on('value', function(snapshot) {
	  if (snapshot.val()) {
	  	// set true to connection status
	    userRef.setWithPriority({connected:true,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
	    // on disconnect, set false to connection status
	    userRef.onDisconnect().setWithPriority({connected:false,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
	  }
	});

	user.onlineWorkers = 


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
