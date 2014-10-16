////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope','$firebase','$timeout', function($window,$rootScope,$firebase,$timeout) {
    var user = {};
    


 	// retrieve connection status and userRef
	var isConnected = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var userRef     = new Firebase(firebaseURL + '/presence/' + workerId);
	

	var updateUserReference = function(){
		userRef.setWithPriority({connected:true,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
		console.log("update user reference");
		$timeout(updateUserReference,1000*60*2); // re-do every 2 minutes
	}
	
	user.init = function(){	
		// when firebase is connected
		isConnected.on('value', function(snapshot) {
		  if (snapshot.val()) {
		  	// update user reference
		    updateUserReference();
		    // on disconnect, set false to connection status
		    userRef.onDisconnect().setWithPriority({connected:false,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
		  }
		});
	}

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
