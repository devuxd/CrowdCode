////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope','$firebase','$timeout','TestRunnerFactory', function($window,$rootScope,$firebase,$timeout,TestRunnerFactory) {
    var user = {};
    var testRunner = new TestRunnerFactory.instance({
    	submitToServer: true
    });

 	// retrieve connection status and userRef

	var userProfile = new Firebase( firebaseURL + '/workers/' + workerId );
	var sync = $firebase(userProfile);
	var isConnected = new Firebase( 'https://crowdcode.firebaseio.com/.info/connected' );
	var userRef     = new Firebase( firebaseURL + '/status/loggedInWorkers/' + workerId );


	var updateUserReference = function(){
		
		userRef.setWithPriority({connected:true,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
		$timeout(updateUserReference,1000*20); // re-do every 20 secs
	
	};

	user.data = sync.$asObject();
	user.data.$loaded().then(function(){
		if( user.data.avatarUrl == null ){

			user.data.avatarUrl = '/img/avatar_gallery/avatar1.png';
			user.data.$save().then(function(){
				console.log('set avatar url: '+user.data.avatarUrl);
			});
		}

		// console.log("user data loaded ",user.data);
	});

	user.init = function(){

		// when firebase is connected
		isConnected.on('value', function(snapshot) {
		  if (snapshot.val()) {
		  	// update user reference
		    updateUserReference();
		    // on disconnect, set false to connection status
		//    userRef.onDisconnect().remove(); //set({connected:false,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP});
		  }
		});
		
	};

	user.setAvatarUrl = function(url){
		user.data.avatarUrl = url;
		user.data.$save().then(function(){
			console.log('set avatar url: '+url);
		});
	};

	user.getAvatarUrl = function(){
		return user.data.pictureUrl || '';
	}

	// logout the worker
    user.login = function(){

    	//TODO DISCONNECT USER ON BROWSER CLOSING
    	/*
    	// Subscribe to logouts by other workers and forward them to the server
    	var logoutsRef = new Firebase(firebaseURL + '/logouts');
    	logoutsRef.on('child_added', function(childSnapshot, prevChildName) {
    		if (childSnapshot.val() != null)
    		{
	    		// Build a new ref to this child in particular.
	    		var loggedoutWorkerID = childSnapshot.name();
	    	   	var workerLoggedOutRef = new Firebase(firebaseURL + '/logouts/' + loggedoutWorkerID);

	    		// Attempt to "take" the logout work item by deleting it. If the take succeeds, do the
	    		// logout work by sending a message to the server about the logout.
	    		workerLoggedOutRef.transaction(function(currentData) {
	    			if (currentData === null) {
	    				// If someone already took the logout work, abort the transaction by returning nothing.
	    		    	return;
	    			} else {
	    				// If the work item is still there, accept the work by attempting to (atomicly) remove
	    				// the work item by setting it to null.
	    		    	return null;
	    			}
	    		}, function(error, committed, snapshot) {
	    			if (error) {
	    		    	console.log('Transaction failed abnormally!', error);
	    			} else if (committed)  {
	    		  		// Successfully grabbed the work. Do the work now.
						// Except, if we are asked to log out ourself, ignore this work. Because
						// we are now logged in again, and logging us out while we are logged in
						// can cause problems.

						if (loggedoutWorkerID != <%=workerID%>)
						{
							$.ajax({
							    contentType: 'application/json',
							    type: 'POST',
							    url: '/<%=projectID%>/logout/' + loggedoutWorkerID
							}).done( function (data) { console.log('succeed logging out worker ' + loggedoutWorkerID);	});
						}
	    		  	}
	    		});
    		}
    	});*/







	}

	// logout the worker from the system
    user.logout = function(){

	}


	var executeWorkCallback = function(jobData, whenFinished) {
		//This is where we actually process the data. We need to call "whenFinished" when we're done
		//to let the queue know we're ready to handle a new job.

		testRunner.onTestsFinish(function(){
			console.log('------- tests finished received');
			whenFinished();
		});

		testRunner.runTests(jobData.functionId);
	}

	// distributed test work
    user.listenForJobs = function(){
		// worker
		var queueRef = new Firebase($rootScope.firebaseURL+ "/status/testJobQueue/");
		new DistributedWorker($rootScope.workerId,queueRef,executeWorkCallback);
	}

    return user;
}]);
