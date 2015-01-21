////////////////////
// USER SERVICE   //
////////////////////
myApp.factory('userService', ['$window','$rootScope','$firebase','$timeout','$http','TestRunnerFactory', function($window,$rootScope,$firebase,$timeout,$http,TestRunnerFactory) {
    var user = {};

 	// retrieve connection status and userRef

	var userProfile = new Firebase( firebaseURL + '/workers/' + workerId );
	var sync = $firebase(userProfile);
	var isConnected = new Firebase( 'https://crowdcode.firebaseio.com/.info/connected' );
	var userRef     = new Firebase( firebaseURL + '/status/loggedInWorkers/' + workerId );
	var logoutRef     = new Firebase( firebaseURL + '/status/loggedOutWorkers/'+ workerId);

	var updateUserReference = function(){

		userRef.setWithPriority({connected:true,name:workerHandle,time:Firebase.ServerValue.TIMESTAMP},Firebase.ServerValue.TIMESTAMP);

	};

	user.data = sync.$asObject();
	user.data.$loaded().then(function(){
		if( user.data.avatarUrl === null || user.data.avatarUrl === undefined ){

			user.data.avatarUrl = '/img/avatar_gallery/avatar1.png';
			user.data.$save().then(function(){});
		}
	});

	//This is where we actually process the data. We need to call "whenFinished" when we're done
	//to let the queue know we're ready to handle a new job.
	//due to sincronization problem wait 5 seconds, after check that the user is not logged any more
	//checking that is null the value i the loggedIn worker
	// and then send the logout command to the server
	var executeLogoutCallback = function(jobData, whenFinished) {

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
	};

	// distributed logout work
    var listenForLogoutWorker = function(){
    	var logoutQueue     = new Firebase( firebaseURL + '/status/loggedOutWorkers/');
		new DistributedWorker($rootScope.workerId,logoutQueue,executeLogoutCallback);
	};

	user.init = function(){

		// when firebase is connected
		isConnected.on('value', function(snapshot) {
		  if (snapshot.val()) {
		  	// update user reference
		  	userRef.onDisconnect().remove();
		    updateUserReference();

		    // on disconnect, set false to connection status
		    logoutRef.onDisconnect().set({workerId: workerId, timeStamp:Firebase.ServerValue.TIMESTAMP});
		    logoutRef.set(null);
		    //start listen the logoutQueue
		    listenForLogoutWorker();
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
	};


	var testRunner = new TestRunnerFactory.instance({
    	submitToServer: true
    });


	//This is where we actually process the data. We need to call "whenFinished" when we're done
	//to let the queue know we're ready to handle a new job.
	var executeWorkCallback = function(jobData, whenFinished) {

		testRunner.onTestsFinish(function(){
			console.log('------- tests finished received');
			whenFinished();
		});
		testRunner.runTests(jobData.functionId);
	};

	// distributed test work
    user.listenForJobs = function(){
		// worker
		var queueRef = new Firebase($rootScope.firebaseURL+ "/status/testJobQueue/");
		new DistributedWorker($rootScope.workerId,queueRef,executeWorkCallback);
	};

    return user;
}]);
