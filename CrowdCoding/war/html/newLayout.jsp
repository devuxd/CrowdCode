<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.googlecode.objectify.Work"%>
<%@page import="com.googlecode.objectify.Key"%>
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
<html lang="en">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	
	<!-- Stylesheets -->
	<link rel="stylesheet" href="../include/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
	
	
	<!-- Javascript 3rd part libraries --> 
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
	
	<!-- Javascript project libraries -->
	<script src="/js/readonlyCodeBox.js"></script>
	<script src="/js/reminder.js"></script>
	<script src="/js/errorCheck.js"></script>
	<script src="/js/keybind.js"></script>
	<script src="/js/JSONEditor.js"></script>
	<script src="/js/functions.js"></script>
	<script src="/js/tests.js"></script>
	<script src="/js/review.js"></script>
	
<style type="text/css">


html,body { height: 100%; }
body {
	background-color: rgba(211, 211, 211, 0.22);
}

header h3 { margin:0px }
header {
	background-color: #3C9764;
	color: white;
	margin: 0px;
	padding-left:10px;
	padding-right:10px;
	padding-top:10px;
	padding-bottom:5px;
	margin-bottom:10px;
	
	-webkit-box-shadow: 0px 2px 5px 0px gray;
	-moz-box-shadow:    0px 2px 5px 0px gray;
	box-shadow:         0px 2px 5px 0px gray;
}

#wrapper {
  min-height: 100%;
  height: auto;
  margin: 0 auto -40px;
  padding: 0 0 40px;
}

footer {
	bottom: 0;
	height: 40px;
	position: relative;
	width: 100%;
	background-color: #3C9764;
}

footer.navbar-default { background-color: #3C9764; }

.btn-primary { border-color:#3C9764; background-color:#3C9764;}
#feedbackBtn { margin:5px; }


.row {
	margin: 0px;
	padding-bottom:20px;
}

.row>div { padding-top: 10px;}

#leftBar, #rightBar {
	padding-left: 0px;
	padding-right: 0px;
	border: none;
}

#container {
	padding-left: 3%;
	padding-right: 3%;
}

#leftBar {
	padding-left:1%;
}

#rightBar {
	padding-right:1%;
}

#leftBar .panel, #rightBar .panel {
	margin: 0px;
	border: none;
	border-radius: 0px;
	border:0px;
	margin-bottom:10px;
	background-color:transparent;
	box-shadow: none;
}

#leftBar .panel-body, #rightBar .panel-body {
	margin: 0px;
	padding: 0px;
}

#leftBar .panel-heading, #rightBar .panel-heading {
	text-transform:uppercase;
	font-size:10px;
	background-color: transparent;
	color: gray;
	border-radius: 0px;
	border: none;
	padding: 5px;
}


#score .panel-body span:first-child {
	font-size:40px;
	margin-top:5px;
}
#stats .badge { width:50px; }

#leaderboard table {width:100%;}
#leaderboard tr {
	font-size:14px;
	font-weight:normal;
}
#leaderboard img {
	margin-bottom:1px;
}
#leaderboard td:nth-child(2) {
	font-style:italic;
}
#leaderboard td:nth-child(3) {
	font-weight:bold;
}

#recentActivity {
	font-weight:normal;
	height: 300px;
	overflow:auto;
}
#recentActivity tr {
	border-bottom:1px solid white;
}
#recentActivity td {
	text-transform: capitalize;
	padding:2px;
}
#recentActivity td:hover {
	cursor:pointer;
	background-color:bisque;
}

#chatInput{
	width: 100%;
	resize: none;
	border: none;
	background-color: lightgray;
	color:black;
	font-weight: normal;
	padding: 3px;
	height: 30px;
}
#chatOutput {
	font-weight:normal;
	height: 300px;
	overflow:auto;
	padding: 3px;
	background-color: #CDECCC;
	margin-bottom:5px;
}
#chatOutput span:first-child {
	font-weight:bold;
}


#task {
	padding:10px;
	background-color:white;
	border-radius:10px;
	border:1px solid lightgray;
	
	
	-webkit-box-shadow: 0px 2px 5px 0px gray;
	-moz-box-shadow:    0px 2px 5px 0px gray;
	box-shadow:         0px 2px 5px 0px gray;
}
#task>div {
	margin-bottom: 10px;
}

#taskHeader {
	padding: 0px;
	margin: 0px;
}

#taskDate {
	font-size: 12px;
	font-weight: normal;
}

#taskDescription {
	font-weight:normal;
	padding:5px;
}

#taskForm {
	
}

#taskButtons {
	float:right;
}


/* Styles for the readonly code mirror box */
.codemirrorBox .CodeMirror { height: auto; font-size: small; }
#codemirrorBox .CodeMirror-scroll { overflow-y: hidden; overflow-x: auto; }

/* Style for highlighted lines in CodeMirror */
.pseudoCall { background-color: white; color: gray; font-weight: bold; }
.pseudoCode { background-color: yellow;	}
.highlightPseudoCall { background-color: lime; }


</style>
</head>

<body>
	
	<div id="wrapper" class="container-fluid">
		<header>
			<div>
				<div class="pull-left">
					<h3>CrowdCode</h3>
				</div>
				
				<div class="pull-right" type="button" id="dropdownMenu1" data-toggle="dropdown">
				    <img src="http://placehold.it/40x40" alt="worker1" />
					<span>&nbsp;&nbsp;</span> 
					<strong>worker1@crowdcode.com</span>
				  </div>
				  <!-- 
				<div class="dropdown pull-right">
				  <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">
				    <img src="http://placehold.it/40x40" alt="worker1" />
					<span>&nbsp;&nbsp;</span> 
					<strong>worker1@crowdcode.com</span>
				  </button>
				  <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
				    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Settings</a></li>
				    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Stats</a></li>
				    <li role="presentation" class="divider"></li>
				    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Logoutk</a></li>
				  </ul>
				</div> -->
				
				<div class="clearfix"></div>
			</div>
		</header>
		<div class="row row-eq-height">

			<div id="leftBar" class="col-md-2 col-xs-2">

				<%@include file="/html/elements/scorePanel.jsp"%>
				<%@include file="/html/elements/statsPanel.jsp"%>
				<%@include file="/html/elements/recentActivitiesPanel.jsp"%>
			</div>

			<div id="container" class="col-md-8 col-xs-8">
				<div id="task"></div>
			</div>

			<div id="rightBar" class="col-md-2 col-xs-2">
				<%@include file="/html/elements/leaderboardPanel.jsp"%>
				<%@include file="/html/elements/chatPanel.jsp"%>
			</div>

		</div>
	</div>

	<footer class="navbar-default navbar-fixed-bottom"> 
        	<button id="sendFeedbackBtn" type="button" class="btn btn-primary pull-right">Send Us Feedback!</button>
			<span class="clearfix"></span>
	</footer>
	
	



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

<!-- Popup for feedback. -->
<div id="popUpFeedback" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<span>Send us your opinions about CrowdCode</span>
				<button type="button" class="close" data-dismiss="modal">X</button>
			</div>
			<div class="modal-footer">
			    <textarea id="textFeedback" rows="" cols="" style="width:100%;"></textarea><br />
				<button id="submitFeedback" class="btn" data-dismiss="modal" aria-hidden="true">Submit</button>
			</div>	
		</div>
	</div>
</div>



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
    	//var onLogoutRef = new Firebase(firebaseURL + '/logouts/<%=workerID%>');
    	//onLogoutRef.onDisconnect().set(true);
    	
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

		/*
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
		});*/
		
		 $("#sendFeedbackBtn").click(function(){
			$("#popUpFeedback").modal('show');
			$("#submitFeedback").click(sendFeedback());
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
		$('#task').load('/<%=projectID%>/fetch', function() 
		{
		
  		});
    	resetSubmitButtons();	
    	resetStartTime();
	}

	
	       
			
	function sendFeedback()
	{
		// Push the feedback to firebase
		var feedback = {  'microtaskType': microtaskType, 
						  'microtaskID': microtaskID,
						  'workerHandle': '<%= workerHandle %>',
						  'workerID': '<%= workerID %>',
						  'feedback': $("#textFeedback").val()};
		feedbackRef.push(feedback);
		$("#textFeedback").val("");
		console.log("feedback sent!");
		//$('#feedbackThanks').css('visibility','visible');
		//setTimeout(function() 
		//{
		//    $('#feedbackThanks').css('visibility','hidden');
		//}, 10000);   
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
	
	
</script>

</body>
</html>