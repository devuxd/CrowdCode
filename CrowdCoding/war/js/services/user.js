////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope','$firebase','$timeout','$http','TestRunnerFactory', function($window,$rootScope,$firebase,$timeout,$http,TestRunnerFactory) {
    var user = {};

 	// retrieve the firebase references

 	var fbRef = new Firebase(firebaseURL);

	var userProfile    = fbRef.child('/workers/' + workerId);
	var isConnected    = new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var userRef        = fbRef.child('/status/loggedInWorkers/' + workerId);
	var logoutRef      = fbRef.child('/status/loggedOutWorkers/'+ workerId);


	// when firebase is connected
	isConnected.on('value', function(snapshot) {
	  if (snapshot.val()) {
	  	// update user reference
	  	userRef.onDisconnect().remove();

	    userRef.setWithPriority({connected:true,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);

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

		var testRunner = new TestRunnerFactory.instance({submitToServer: true});
		var queueRef = new Firebase($rootScope.firebaseURL+ "/status/testJobQueue/");
		new DistributedWorker( $rootScope.workerId, queueRef, function(jobData, whenFinished) {
			testRunner.onTestsFinish(function(){
				console.log('------- tests finished received');
				whenFinished();
			});
			testRunner.runTests(jobData.functionId);
		});
	}

	// distributed worker logout 
	// due to sincronization problem wait 5 seconds, after check that the user is not logged any more
	// checking that is null the value i the loggedIn worker
	// and then send the logout command to the server
	// distributed logout work
    user.listenForLogoutWorker = function(){
    	var logoutQueue     = new Firebase( firebaseURL + '/status/loggedOutWorkers/');
		new DistributedWorker($rootScope.workerId,logoutQueue, function(jobData, whenFinished) {

			var timoutCallBack=function(){
				var userLogInRef     = new Firebase( firebaseURL + '/status/loggedInWorkers/' + jobData.workerId );
				userLogInRef.once("value", function(snapshot) {
				  	if(snapshot.val()===null){
				  		$http.post('/' + $rootScope.projectId + '/logout?workerid=' + jobData.workerId)
					  		.success(function(data, status, headers, config) { whenFinished(); });
					}
				});

			};
			$timeout(timoutCallBack,10000);
		});
	};

    return user;
}]);
