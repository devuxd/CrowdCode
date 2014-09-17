<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.googlecode.objectify.Work"%>
<%@page import="com.googlecode.objectify.ObjectifyService"%>
<%@page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@page import="com.crowdcoding.Project"%>
<%@page import="com.crowdcoding.Worker"%>
<%@page import="java.util.logging.Logger"%>

<%
    // Create the project. This operation needs to be transactional to ensure one project is only
    // created. Getting the leaderboard relies on the state of the project when it is created.
    // But data in worker may be stale or even internally inconsistent, as other operations
    // may be concurrently updating it.

    final String projectID = (String) request.getAttribute("project");
	final Logger log = Logger.getLogger(Project.class.getName());

	Project project = ObjectifyService.ofy().transact(new Work<Project>() 
	{
	    public Project run() 
	    {
			return Project.Create(projectID);
	    }
	});
	
	String workerID = UserServiceFactory.getUserService().getCurrentUser().getUserId();
	String workerHandle = UserServiceFactory.getUserService().getCurrentUser().getNickname();
%>

<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8">
	<title>CrowdCode</title>
	<link type="text/css" rel="stylesheet" href="/include/jquery.rating.css" />
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
<!-- 	<link rel="stylesheet" href="/html/animate.css" type="text/css" />  -->
	<link rel="stylesheet" href="/html/DebugTestFailure.css" type="text/css" />
	<link rel="stylesheet" href="/html/styles.css" type="text/css" /> 
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
</head>

<!--  <div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header" style="background: #1B87E0">
  </div>
  <div class="modal-body" style="background: #FFFFFF">
      <h3 id="myModalLabel"><center>Microtask complete!</center></h3>
  
  </div>
  <div class="modal-footer" style="background: #1B87E0">
  </div>
</div>-->

<body id= "mainpagebody">
 
<!-- Main content -->
<div id="titlebar" class="animated pulse">
	<table>
		<tr>
			<td>  	<h4>CrowdCode</h4> </td>
			<td class="titlebarScore"> 				
				<div id="statistics" >
					<span id="locSpan" class="badge">0</span><small>&nbsp;&nbsp;lines of code</small> &nbsp;&nbsp;
					<span id="functionCountSpan" class="badge">0</span><small>&nbsp;&nbsp;functions</small>&nbsp;&nbsp;
					<span id="testCountSpan" class="badge">0</span><small>&nbsp;&nbsp;tests</small>&nbsp;&nbsp;&nbsp;&nbsp;
					<span id="microtaskCountSpan" class="badge">0</span><small>&nbsp;&nbsp;microtasks</small>&nbsp;&nbsp;&nbsp;&nbsp;
					<font color="white" style="font-weight:bold; font-size:larger;">	<i class=" icon-user"> </i> <%=workerHandle%> </font>
				</div>  
			</td>
		</tr>
	</table>
</div>
<BR>

<div id="container">

<div class="row">

<div class="col-md-2">
	<div id= "leftbar" class="animated fadeInLeftBig">
		<div id="scoreTableAnimHolder" class="boxTitle animated flip">	<div id="scoreTableTitle" class="sidebarTitle animated wiggle" >   &nbsp;&nbsp;  Your score <i class=" icon-star"> </i> &nbsp;</div> </div>
		
		<table id="scoreTable" class="boxContent">	
			<tr>
				<td class="animated fadeInLeftBig"><b ><span id="score" >0 </span> points</b></td>
			</tr>
		</table>
		<div id="leaderboardTitle" class="boxTitle animated wiggle" >   &nbsp;&nbsp;  Leaders  &nbsp; <i class=" icon-th-list"> </i> </div>
		<div id="leaderboard" class="boxContent"><table id="leaderboardTable"><tr><td></td></tr></table></div>
	</div>
	<BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>
	<div id="chatTitle" class="boxTitle" > &nbsp;&nbsp; Ask the Crowd</div>
	<div id="chatDiv" class="chatDiv">
		<div id="chatOutput" class="chatOutput" ></div><textarea id="chatInput" class="chatInput"></textarea>
	</div>	
</div>

<div class="col-md-8">
	<div id="contentPane" class="animated bounceIn"></div>
</div>

<div class="col-md-2">
	<div id="rightbar" class="animated fadeInRightBig ">
		<div id="activityFeedTitle" class="boxTitle animated wiggle" >   &nbsp;&nbsp;  Recent Activity &nbsp;</div>
		<div id="activityFeed"><div id="activityFeedTable" ></div></div>
		<BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>

		<div>&nbsp;	<BR><BR></div>
		<div id="feedbackThanks"><span><b>Thanks for the feedback!</b></span></div>
		<div id="feedback">
			<textarea id="feedbackBox" placeholder="Give us feedback on CrowdCode! What do you like? What don't you like?"></textarea><BR>
			<button class="btn btn-primary" id="sendFeedback" >Send feedback</button>		
		</div>
	</div>
</div>

</div>
</div>
<div id="footer">
	<!-- <table>
		<tr>
			<td><p><a href="" id="logoutLink">Log out</a></p></td>
			<td><p><a href="">Preferences</a></p></td>
			<td><p><a href="">Terms</a></p></td>
			<td><p><a href="">About</a></p></td>
		</tr>
	</table>  -->
</div>

<!-- Popups -->
<div id="logout" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" logoutLabel"" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">��</button>
		<h3 id="logoutLabel">You are now logged out.</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
		<button id="loginButton" class="btn btn-primary">Log in</button>
	</div>
</div>

<!-- Scripts --> 
<script src="/include/jquery-2.1.0.min.js"></script> 
<script src="/include/polyfill.js"></script>
<script src="/include/codemirror/codemirror.js"></script>
<script src="/include/codemirror/javascript.js"></script>
<script src="/include/jshint.js"></script>
<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
<script src="/include/stars/jquery.rating.js"></script>
<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
<script src='/include/esprima.js'></script>
<script src='/include/escodegen.browser.js'></script>
<script src="/include/diff/diff_match_patch.js"></script>
<script src="/include/diff/jquery.pretty-text-diff.js"></script>

<script src="/js/readonlyCodeBox.js"></script>
<script src="/js/reminder.js"></script>
<script src="/js/errorCheck.js"></script>
<script src="/js/keybind.js"></script>
<script src="/js/JSONEditor.js"></script>
<script src="/js/functions.js"></script>
<script src="/js/tests.js"></script>
<script src="/js/review.js"></script>

<script>
	var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
	var reviews = new Firebase(firebaseURL + '/history/reviews/');
	var feedbackRef = new Firebase(firebaseURL + '/feedback');
	
	var allADTs = [];
	var typeNames = [];
	var nameToADT = {};
	var functions;
	var tests;
	
    $(document).ready(function()
    {
    	// Notify firebase when this worker (eventually) logs out
    	var onLogoutRef = new Firebase(firebaseURL + '/logouts/<%=workerID%>');
    	onLogoutRef.onDisconnect().set(true);
    	
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
    	});
    	
		// Load the ADTs from firebase
		var adtRef = new Firebase(firebaseURL + '/ADTs');
		adtRef.on('value', function(snapshot) {
			if (snapshot.val() != null)
			{
				allADTs = snapshot.val().ADTs;		
		    	setupADTData();		    	
			}
			
			// Wait for the ADTs to load before loading the microtask!
	        loadMicrotask();
		});

		$("#logoutLink").click(function() {
			// Tell server to logout
			// Clear the microtask div of content
			// Need to stop fetching messages!!!

			$('#logout').modal();
			return false;
		});

		$("#loginButton").click(function() {
			alert('login');

			// Tell server to login
			// Fetch microtask

			$('#logout').modal('hide');

			return false;
		});
		
		$("#sendFeedback").click(sendFeedback);
		
		// Hook the leaderboard to Firebase		
		var leaderboardRef = new Firebase(firebaseURL + '/leaderboard');
		leaderboardRef.on('value', function(snapshot) {
			if (snapshot.val() != null)
		  		updateLeaderboardDisplay(snapshot.val());
		});
		
		// Hook the newsfeed to Firebase
		var newsfeedRef = new Firebase(firebaseURL + '/workers/<%=workerID%>/newsfeed');
		newsfeedRef.on('child_added', function(snapshot) {
			if (snapshot.val() != null)
				newNewsfeedItem(snapshot.val());
		});		
		
		// Hook the score to Firebase
		var scoreRef = new Firebase(firebaseURL + '/workers/<%=workerID%>/score');
		scoreRef.on('value', function(snapshot) { 
			if (snapshot.val() != null)
				updateScoreDisplay(snapshot.val());
		});		
		
		// Setup chat service
		var chatRef = new Firebase(firebaseURL + '/chat');

		// When the user presses enter on the message input, write the message to firebase.
		$('#chatInput').keypress(function (e) {
		    if (e.keyCode == 13) 
		    {
		      chatRef.push({text: $('#chatInput').val(), workerHandle: '<%=workerHandle%>'});
		      $('#chatInput').val('');
		      return false;
		    }
		});

		// Add a callback that is triggered for each chat message.
		chatRef.on('child_added', function (snapshot) 
		{
			var message = snapshot.val();
			$('#chatOutput').append("<b>" + message.workerHandle + "</b> " + message.text + "<BR>");
			$('#chatOutput').scrollTop($('#chatOutput')[0].scrollHeight);
		});
		
		// Create the Functions and Tests services, creating a local repository of functions
		// and tests synced to firebase
		functions = new Functions();       
    	functions.init(updateFunctionStats);
		
		var functionsRef = new Firebase(firebaseURL + '/artifacts/functions');
		functionsRef.on('child_added', function (snapshot) 
		{
			functions.functionAdded(snapshot.val());
		});
		functionsRef.on('child_changed', function (snapshot) 
		{
			functions.functionChanged(snapshot.val());
		});
		
		tests = new Tests();       
    	tests.init(updateTestStats);
		
		var testsRef = new Firebase(firebaseURL + '/artifacts/tests');
		testsRef.on('child_added', function (snapshot) 
		{
			tests.testAdded(snapshot.val());
		});
		testsRef.on('child_changed', function (snapshot) 
		{
			tests.testChanged(snapshot.val());
		});
		testsRef.on('child_removed', function (snapshot) 
		{
			tests.testDeleted(snapshot.val());
		});
		
		// Track microtasks so that we can update the total count of microtasks.
		var microtasksRef = new Firebase(firebaseURL + '/status/microtaskCount');
		microtasksRef.on('value', function (snapshot) 
		{
			$('#microtaskCountSpan').html(snapshot.val());
		});
	});
    
    function submit(formData)
    {
    	var stringifiedData = JSON.stringify( formData );
    	
		$.ajax({
		    contentType: 'application/json',
		    data: stringifiedData,
		    type: 'POST',
		    url: '/<%=projectID%>/submit?type=' + microtaskType + '&id=' + microtaskID,
		}).done( function (data) { loadMicrotask();	});   
		
		// Push the microtask submit data onto the Firebase history stream
		var submissionRef = new Firebase(firebaseURL + '/microtasks/' + microtaskID + '/submission');
		submissionRef.set(formData);
    }

	function skip() 
	{
		$.ajax('/<%=projectID%>/submit?type=' + microtaskType + '&id=' + microtaskID + '&skip=true')
	  		.done( function (data) { loadMicrotask(); });
	}    
   
	function resetSubmitButtons()
	{
		defaultSubmitButtonArray = new Array();
		hasBeenIntialized = false;
	}

	function loadMicrotask() 
	{
		$('body').scrollTop(0);
		$('#contentPane').load('/<%=projectID%>/fetch', function() 
		{
  	    	$('#microtask').addClass('animated rollIn');  		
  		});
    	resetSubmitButtons();	
    	resetStartTime();
	}
	
	function updateLeaderboardDisplay(leaderboard)
	{
		var newHTML = '';
		$.each(leaderboard.leaders, function(index, leader)
		{
			newHTML += '<tr><td>' + leader.score + '</td><td>' + leader.name + '</td></tr>';
		});
		$('#leaderboardTable').html(newHTML);
	}

	function updateScoreDisplay(points)
	{
		$('#score').html(points);
		$('#scoreTableAnimHolder').toggleClass('animated flip');
	}
	
	function newNewsfeedItem(item)
	{
		var itemValue = item.description;
		var itemPoints = item.points;
		var iconHTML = (item.points > 0) ? '<i class="icon-thumbs-up"></i>' : '<i class="icon-thumbs-down"></i>';
		
		$('#activityFeedTable').prepend('<tr class="animated minipulse"> <td class="animated pulse" '
				+ 'onclick="viewReview(1)"> ' 
				+ '&nbsp;' + iconHTML + '&nbsp;&nbsp;' + itemValue +  '</td> </tr> </br> </table>');
	}
	
	function viewReview(microtaskID)
	{
		var microtaskRef = new Firebase(firebaseURL + '/microtasks/' + microtaskID);
		microtaskRef.once('value', function (snapshot) 
		{
			displayWriteTestCases(viewReviewDiv, snapshot.val());
			$("#viewReviewModal").modal();
		});
	}

	function sendFeedback()
	{
		// Push the feedback to firebase
		var feedback = {'microtaskType': microtaskType, 
						  'microtaskID': microtaskID,
						  'workerHandle': '<%= workerHandle %>',
						  'workerID': '<%= workerID %>',
						  'feedback': $("#feedbackBox").val()};
		feedbackRef.push(feedback);
		$("#feedbackBox").val("");
		$('#feedbackThanks').css('visibility','visible');
		setTimeout(function() 
		{
		    $('#feedbackThanks').css('visibility','hidden');
		}, 10000);   
	}
	
	// Generate the list of typenames based on the list of allADTs, adding type names for primitives
	function setupADTData()
	{
		// Build a type name (String) to structure map and a list of type names
		
		for (var i = 0; i < allADTs.length; i++)
		{
			typeNames.push(allADTs[i].name);
			nameToADT[allADTs[i].name] = allADTs[i];	
		}
		
		typeNames.push('String');
		typeNames.push('Number');
		typeNames.push('Boolean');		
	}	
	
	// Returns true if name is a valid type name and false otherwise.
	function isValidTypeName(name)
	{
		var simpleName;
		
		// Check if there is any array characters at the end. If so, split off that portion of the string. 
		var arrayIndex = name.indexOf('[]');
		if (arrayIndex != -1)
			simpleName = name.substring(0, arrayIndex);
		else
			simpleName = name;
		
		if (typeNames.indexOf(simpleName) == -1)
			return false;
		else if (arrayIndex != -1)
		{
			// Check that the array suffix contains only matched brackets..
			var suffix = name.substring(arrayIndex);
			if (suffix != '[]' && suffix != '[][]' && suffix != '[][][]' && suffix != '[][][][]')
				return false;			
		}
			
		return true;		
	}
	
	function updateFunctionStats(linesOfCode, functionCount)
	{
		$('#locSpan').html(linesOfCode);
		$('#functionCountSpan').html(functionCount);
	}
	
	function updateTestStats(testCount)
	{
		$('#testCountSpan').html(testCount);
	}
	
</script>

	<!-- Popup for reminder to submit soon. -->
	<div id="popUpReminder" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
					<h3 id="logoutLabel" class="popupReminderHeading"></h3>
				</div>
				<div class="modal-footer">
					<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
				</div>	
			</div>
		</div>
	</div>
	
	<!-- Popup for viewing review. -->
	<div id="viewReviewModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
					<h3 id="logoutLabel" class="popupReminderHeading"></h3>
				</div>
				<div class="modal-footer">
					<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
				</div>	
			</div>
		</div>
	</div>
	
	

</body>
</html>