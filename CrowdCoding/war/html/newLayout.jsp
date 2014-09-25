<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.googlecode.objectify.Work"%>
<%@page import="com.googlecode.objectify.Key"%>
<%@page import="com.googlecode.objectify.ObjectifyService"%>
<%@page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@page import="com.crowdcoding.entities.Project"%>
<%@page import="com.crowdcoding.entities.Worker"%>
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
	<link rel="stylesheet" href="/css/worker.css" type="text/css" />
	
	
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
	
</head>

<body>
	
	<div id="wrapper" class="container-fluid">
		<header>
			<div>
				<div class="pull-left">
					<h3>CrowdCode</h3>
				</div>
				
				<!--
				<div class="pull-right" type="button" id="userProfile" data-toggle="dropdown">
				    <img src="/user/picture?userId=<%=workerID%>" alt="<%=workerHandle%>" />
					<span>&nbsp;&nbsp;</span> 
					<strong><%=workerHandle%></span>
					(<a href="<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>">LogOut</a>)
				  </div>-->
				 
				<div id="userProfile" class="dropdown pull-right">
				  <a id="dLabel" role="button" data-toggle="dropdown" data-target="#">
				    <img src="/user/picture?userId=<%=workerID%>" class="profile-picture" alt="<%=workerHandle%>" />
					<%=workerHandle%>
				    <span class="caret"></span>
				  </a>
				
				
				  <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
				  	<li><a href="#popUpChangePicture" data-toggle="modal" >change profile picture</a></li>
				  	<li><a href="<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>">logout</a></li>
				  </ul>
				</div>
				
				
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


<!-- Popup for changing profile picture. -->
<div id="popUpChangePicture" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<span>change your profile picture!</span>
				<button type="button" class="close" data-dismiss="modal">X</button>
			</div>
			<div class="modal-footer">
			    <img src="/user/picture?userId=<%=workerID%>" alt="<%=workerHandle%>" class="pull-left profile-picture" />	
			    <div class="pull-left">
			    	<form  enctype='multipart/form-data' method="post" >
			    		<input type="file" name="picture" accept="image/*" /><br/>
			    		<input type="submit" class="btn btn-primary" value="change picture" />
			    	</form>
			    </div>
			    <span class="clearfix"></span>
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
		});

		$("#loginButton").click(function() {
			alert('login');

			// Tell server to login
			// Fetch microtask

			$('#logout').modal('hide');

			return false;
		});*/
		
		
		$('#popUpChangePicture form').submit(function(){
			var formData = new FormData($(this)[0]);

		    $.ajax({
		        url: '/user/picture/change',
		        type: 'POST',
		        data: formData,
		        async: false,
		        success: function (data) {
		            $('#popUpChangePicture').modal('hide');
		            if(data=="success"){
			            location.reload();
		            }
		        },
		        cache: false,
		        contentType: false,
		        processData: false
		    });
		
		    return false;
		});
		
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