////////////////////
// USER SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('userService', ['$window','$rootScope','$firebase','$timeout','$interval','$http','TestList','functionsService','TestRunnerFactory', function($window,$rootScope,$firebase,$timeout,$interval,$http,TestList,functionsService,TestRunnerFactory) {
    var user = {};

 	// retrieve the firebase references

 	var fbRef = new Firebase(firebaseURL);

	var userProfile    = fbRef.child('/workers/' + workerId);

	var isConnected    = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var offsetRef 	   = new Firebase("https://crowdcode.firebaseio.com/.info/serverTimeOffset");
	
	var userRef        = fbRef.child('/status/loggedInWorkers/' + workerId);
	var logoutRef      = fbRef.child('/status/loggedOutWorkers/'+ workerId);

	var userFetchTime  =fbRef.child('/workers/' + workerId + '/fetchTime' );

	var updateLogInTime=function(){
		userRef.setWithPriority({connected:true,name:workerHandle,timeStamp:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
	};
	var offset;
	offsetRef.on("value", function(snap) {
	  offset = snap.val();
	});


	// when firebase is connected
	isConnected.on('value', function(snapshot) {
	  if (snapshot.val()) {
	  	// update user reference
	  	updateLogInTime();
	  	$interval(updateLogInTime,10000);

	    // on disconnect, set false to connection status
	    logoutRef.onDisconnect().set({workerId: workerId, timeStamp:Firebase.ServerValue.TIMESTAMP});
	    logoutRef.set(null);
	  }
	});


	user.data = $firebase(userProfile).$asObject();

	user.fetchTime= $firebase( userFetchTime).$asObject();

	user.data.$loaded().then(function(){
		if( user.data.avatarUrl === null || user.data.avatarUrl === undefined ){
			user.data.avatarUrl = '/img/avatar_gallery/avatar1.png';
			user.data.$save().then(function(){});
		}
		user.data.workerHandle = workerHandle;
		user.data.$save();
	});
	user.assignedMicrotaskKey = null;

	user.getFetchTime = function(){
		return user.fetchTime;
	};

	user.setFirstFetchTime = function (){
		user.fetchTime.$value=new Date().getTime();
		user.fetchTime.$save();

	};
	user.setAvatarUrl = function(url){
		user.data.avatarUrl = url;
		user.data.$save().then(function(){
			console.log('set avatar url: '+url);
		});
	};

	user.getAvatarUrl = function(){
		return user.data.pictureUrl || '';
	};

	// distributed test work
    user.listenForJobs = function(){
		// worker

		var queueRef = new Firebase($rootScope.firebaseURL+ "/status/testJobQueue/");
		new DistributedWorker( $rootScope.workerId, queueRef, function(jobData, whenFinished) {
			console.log('Receiving job ',jobData);

			var jobRef = queueRef.child('/'+jobData.functionId);
			//console.log(jobRef,jobData);
			jobRef.onDisconnect().set(jobData);

			var implementedIdsJob    = jobData.implementedIds.split(',');
			var implementedIdsClient = TestList.getImplementedIdsByFunctionId( jobData.functionId );
			var functionClient = functionsService.get( jobData.functionId );
			var unsynced = false;

			// CHECK THE SYNC OF THE IMPLEMENTED TESTS
			if( implementedIdsJob.length != implementedIdsClient.length ){
				unsynced = true;
			} else {
				for( var v in implementedIdsJob ){
					if( implementedIdsClient.indexOf( parseFloat(implementedIdsJob[v]) ) == -1 ){
						unsynced = true;
					}
				}
			}

			// CHECK THE SYNC OF THE FUNCTION VERSION
			if( !unsynced && functionClient.version != jobData.functionVersion ){
				unsynced = true;
			}
			//if this job has be done more than 20 times force unsync to false so that the test can be executed
			if( parseInt(jobData.bounceCounter) > 20) {
				unsynced = false;
				console.log(parseInt(jobData.bounceCounter));
			}

			// if some of the data is out of sync
			// put back the job into the queue
			if( unsynced){
				console.log('REBOUNCING');
				$timeout(function(){
					jobData.bounceCounter = parseInt(jobData.bounceCounter) + 1;
					jobRef.set( jobData );
					jobRef.onDisconnect().cancel();
					whenFinished();
				},500);
			} else {
				var testRunner = new TestRunnerFactory.instance({submitToServer: true});
				testRunner.setTestedFunction( jobData.functionId );
				try {
					testRunner.runTests();
					testRunner.onTestsFinish(function(){
						console.log('------- tests finished received');
						jobRef.onDisconnect().cancel();
						whenFinished();
					});
				} catch(e){
					console.log('Exception in the TestRunner',e.stack);
					jobRef.set( jobData );
					jobRef.onDisconnect().cancel();
					whenFinished();
				}
			}
		});
	};

	// distributed worker logout
	// due to sincronization problem wait 5 seconds, after check that the user is not logged any more
	// checking that is null the value i the loggedIn worker
	// and then send the logout command to the server
	// distributed logout work
    user.listenForLogoutWorker = function(){
    	var logoutQueue     = new Firebase( firebaseURL + '/status/loggedOutWorkers/');

		new DistributedWorker($rootScope.workerId,logoutQueue, function(jobData, whenFinished) {

			//retrieves the reference to the worker to log out
			var logoutWorker = logoutQueue.child('/'+jobData.workerId);
			//if a disconnection occures during the process reeset the element in the queue
			logoutWorker.onDisconnect().set(jobData);

			var timeoutCallBack = function(){
				//time of the client plus the timezone offset given by firebase
				var clientTime = new Date().getTime() + offset;
				//retrieves the information of the login field
				var userLoginRef     = new Firebase( firebaseURL + '/status/loggedInWorkers/' + jobData.workerId );

				userLoginRef.once("value", function(userLogin) {

					//if the user doesn't uddate the timer for more than 30 seconds than log it out
				  	if(userLogin.val()===null || clientTime - userLogin.val().timeStamp > 30000){
				  		$http.post('/' + $rootScope.projectId + '/logout?workerid=' + jobData.workerId)
					  		.success(function(data, status, headers, config) {
					  			console.log("logged out seccessfully");
					  			userLoginRef.remove();
					  			$interval.cancel(interval);
					  			logoutWorker.onDisconnect().cancel();
					  			whenFinished();
					  		});
					 //if the timestamp of the login is more than the timesatmp of the logout means that the user logged in again
					 //so cancel the work
					} else if(userLogin.val()!==null && userLogin.val().timeStamp - jobData.timeStamp > 1000)
					{
						$interval.cancel(interval);
						logoutWorker.onDisconnect().cancel();
						whenFinished();
					}
				});

			};

			var interval = $interval(timeoutCallBack,10000);
		});
	};

    return user;
}]);
