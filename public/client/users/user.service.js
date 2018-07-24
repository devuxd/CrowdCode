////////////////////
// USER SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('userService', ['$window','$rootScope','$timeout','$interval','$http','$firebaseObject', 'firebaseUrl','functionsService','TestRunnerFactory', function($window,$rootScope,$timeout,$interval,$http,$firebaseObject, firebaseUrl,functionsService,TestRunnerFactory) {
    var user = {};

 	// retrieve the firebase references

 	// var fbRef = new Firebase(firebaseUrl);

	var userProfile    = firebase.database().ref().child('Workers').child(workerId);
  // fbRef.child('/workers/' + workerId);

	var isConnected    = firebase.database().ref().child('.info').child('connected');
  //new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var offsetRef 	   = firebase.database().ref().child('.info').child('serverTimeOffset');
  // new Firebase("https://crowdcode.firebaseio.com/.info/serverTimeOffset");

	var loginRef  = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedInWorkers').child(workerId);
  // fbRef.child('/status/loggedInWorkers/' + workerId);
	var logoutRef = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedOutWorkers').child(workerId);
  //fbRef.child('/status/loggedOutWorkers/'+ workerId);

	var updateLogInTime = function(){
		loginRef.setWithPriority({
			connected:true,
			name:workerHandle,
			timeStamp:Firebase.ServerValue.TIMESTAMP
		},Firebase.ServerValue.TIMESTAMP);
	};

	var timeZoneOffset;
	offsetRef.on("value", function(snap) { timeZoneOffset = snap.val(); });



	user.assignedMicrotaskKey = null;

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


	user.data = $firebaseObject(userProfile);

	user.data.$loaded().then(function(){
		if( user.data.avatarUrl === null || user.data.avatarUrl === undefined ){
			var randomAvatar = (Math.floor(Math.random() * (16 - 1)) + 1);
			user.data.avatarUrl = '/img/avatar_gallery/avatar'+randomAvatar+'.png';
		}
		user.data.workerHandle = workerHandle;
		user.data.$save();
	});

	/*user.getFetchTime = function(){ return user.data.fetchTime; };

	user.setFirstFetchTime = function (){
		user.data.fetchTime = new Date().getTime();
		console.log('saving first fetch time')
		user.data.$save();
	};*/

	user.setAvatarUrl = function(url){
		user.data.avatarUrl = url;
		console.log('saving avatar url');
		user.data.$save().then(function(){
			console.log('set avatar url: '+url);
		});
	};



	// distributed test runner
    user.listenForJobs = function(){

		var queueRef = firebase.database().ref().child('Projects').child(projectId).child('status').child('testJobQueue');
    // new Firebase(firebaseUrl+ "/status/testJobQueue/");
		new DistributedWorker( $rootScope.workerId, queueRef, function(jobData, whenFinished) {
			console.log('Receiving job ',jobData);

			var jobRef = queueRef.child(jobData.functionId);
			//console.log(jobRef,jobData);
			jobRef.onDisconnect().set(jobData);

			var funct = functionsService.get( jobData.functionId+"" );
			console.log('loaded function', jobData.functionId,funct);
			var unsynced = false;

			// CHECK THE SYNC OF THE TESTSUITE VERSION
			if( !unsynced && funct.version != jobData.functionVersion ){
				unsynced = true;
			}

			// CHECK THE SYNC OF THE FUNCTION VERSION
			if( !unsynced && funct.version != jobData.functionVersion ){
				unsynced = true;
			}

			//if this job has be done more than 20 times force unsync to false so that the test can be executed
			if( parseInt(jobData.bounceCounter) > 20) {
				unsynced = false;
			}

			// if some of the data is out of sync
			// put back the job into the queue
			if( unsynced){
				$timeout(function(){
					jobData.bounceCounter = parseInt(jobData.bounceCounter) + 1;
					jobRef.set( jobData );
					jobRef.onDisconnect().cancel();
					whenFinished();
				},500);
			} else {
				var runner = new TestRunnerFactory.instance();
				var tests = angular.copy(funct.tests);

				runner.run(tests,funct.name,funct.getFullCode()).then(function(results){
					var ajaxData = {
						areTestsPassed: true,
						failedTestId: null,
						passedTestsId: []
					};

					results.tests.map(function(test){
						if( test.result.passed ){
							ajaxData.passedTestsId.push(test.id);
						}
						else if( ajaxData.failedTestId == null){
							ajaxData.areTestsPassed = false;
							ajaxData.failedTestId = test.id;
						}
					});

					$http.post('/' + $rootScope.projectId + '/ajax/testResult?functionId='+funct.id,ajaxData)
						.success(function(data, status, headers, config) {
							console.log("test result submit success",ajaxData);
							jobRef.onDisconnect().cancel();
							whenFinished();
						}).
					  	error(function(data, status, headers, config) {
					    	console.log("test result submit error");
					    	jobRef.onDisconnect().cancel();
							whenFinished();
						});
				});


			}
		});
	};

	// distributed worker logout
	// due to synchronization problem wait 5 seconds, after check that the user is not logged any more
	// checking that is null the value i the loggedIn worker
	// and then send the logout command to the server
	// distributed logout work
    user.listenForLogoutWorker = function(){
    	var logoutQueue     = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedOutWorkers');
      // new Firebase( firebaseUrl + '/status/loggedOutWorkers/');


		new DistributedWorker($rootScope.workerId,logoutQueue, function(jobData, whenFinished) {

			//retrieves the reference to the worker to log out
			var logoutWorker = logoutQueue.child(jobData.workerId);
			//if a disconnection occures during the process reeset the element in the queue
			logoutWorker.onDisconnect().set(jobData);

			var interval = $interval( timeoutCallBack, 10000);
			function timeoutCallBack(){
				//time of the client plus the timezone offset given by firebase
				var clientTime = new Date().getTime() + timeZoneOffset;
				//retrieves the information of the login field
				var userLoginRef  = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedInWorkers').child(jobData.workerId);
        // new Firebase( firebaseUrl + '/status/loggedInWorkers/' + jobData.workerId );
				userLoginRef.once("value", function(userLogin) {
					//if the user doesn't uddate the timer for more than 30 seconds than log it out
				  	if(userLogin.val()===null || clientTime - userLogin.val().timeStamp > 30000){
				  		// $http.post('/' + $rootScope.projectId + '/logout?workerid=' + jobData.workerId)
					  	// 	.success(function(data, status, headers, config) {
					  	// 		console.log("logged out seccessfully");
					  	// 		userLoginRef.remove();
					  	// 		$interval.cancel(interval);
					  	// 		logoutWorker.onDisconnect().cancel();
					  	// 		whenFinished();
					  	// 	});
					 //if the timestamp of the login is more than the timesatmp of the logout means that the user logged in again
					 //so cancel the work
					} else if(userLogin.val()!==null && userLogin.val().timeStamp - jobData.timeStamp > 1000)
					{
						$interval.cancel(interval);
						logoutWorker.onDisconnect().cancel();
						whenFinished();
					}
				});
			}
		});
	};

    return user;
}]);
