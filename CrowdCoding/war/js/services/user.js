////////////////////
// USER SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('userService', ['$window','$rootScope','$firebase','$timeout','$interval','$http','TestRunnerFactory', function($window,$rootScope,$firebase,$timeout,$interval,$http,TestRunnerFactory) {
    var user = {};

 	// retrieve the firebase references

 	var fbRef = new Firebase(firebaseURL);

	var userProfile    = fbRef.child('/workers/' + workerId);
	var isConnected    = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var userRef        = fbRef.child('/status/loggedInWorkers/' + workerId);
	var logoutRef      = fbRef.child('/status/loggedOutWorkers/'+ workerId);

	var updateLogInTime=function(){
		userRef.setWithPriority({connected:true,name:workerHandle,timeStamp:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);
	};

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
		var fetchTime= user.data.status.fetchTime;
		if(fetchTime)
			return parseFloat(fetchTime);
		else
			return 0;
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
			var testRunner = new TestRunnerFactory.instance({submitToServer: true});
			testRunner.setTestedFunction( jobData.functionId );
			if( testRunner.runTests() == -1){
				jobRef.onDisconnect().cancel();
				whenFinished();
			} else {
				testRunner.onTestsFinish(function(){
					console.log('------- tests finished received');
					jobRef.onDisconnect().cancel();
					whenFinished();
				});
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
				//retrieves the information of the loGin field
				var userLoginRef     = new Firebase( firebaseURL + '/status/loggedInWorkers/' + jobData.workerId );
				userLoginRef.once("value", function(userLogin) {
					//if the user doesn't uddate the timer for more than 20 seconds than log it out
				  	if(userLogin.val()===null || new Date().getTime() - userLogin.val().timeStamp > 30000){
				  		$http.post('/' + $rootScope.projectId + '/logout?workerid=' + jobData.workerId)
					  		.success(function(data, status, headers, config) {
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
