////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope','$firebase','$timeout','testRunnerService', function($window,$rootScope,$firebase,$timeout,testRunnerService) {
    var user = {};



 	// retrieve connection status and userRef
	var isConnected = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var userRef     = new Firebase(firebaseURL + '/status/presences/' + workerId);


	var updateUserReference = function(){
		userRef.setWithPriority({connected:true,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
		console.log("update user reference");
		$timeout(updateUserReference,1000*60*2); // re-do every 2 minutes
	}

	user.statusEnum = {
		'WAITING':1,
		'WORKING':2,
		'IDLE':3
	};

	user.status = 0;

	user.init = function(){
		user.status = user.statusEnum.WAITING;
		// when firebase is connected
		isConnected.on('value', function(snapshot) {
		  if (snapshot.val()) {
		  	// update user reference
		    updateUserReference();
		    // on disconnect, set false to connection status
		    userRef.onDisconnect().remove();//setWithPriority({connected:false,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
		  }
		});
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
		console.log("Trying to run tests for function "+jobData.functionId);
		testRunnerService.runTestsForFunction(jobData.functionId).then(function(data){
		   console.log("tests executed!");
		   testRunnerService.submitResultsToServer();
		}, function(error) {
		   console.log("Error running the tests for functionId="+jobData.functionId);
	    });


		whenFinished();
	}

	// distributed test work
    user.listenForJobs = function(){
		// worker
		var queueRef = new Firebase($rootScope.firebaseURL+ "/status/testJobQueue/");
		new DistributedWorker($rootScope.workerId,queueRef,executeWorkCallback);
	}

    return user;
}]);