<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.googlecode.objectify.Work"%>
<%@page import="com.googlecode.objectify.ObjectifyService"%>
<%@page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@page import="com.crowdcoding.artifacts.Project"%>
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
	
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
%>


<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8">
	<title>CrowdCode</title>
	<link type="text/css" rel="stylesheet" href="/include/jquery.rating.css" />
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="/html/DebugTestFailure.css" type="text/css" />
	<link rel="stylesheet" href="/html/styles.css" type="text/css" /> 
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
</head>

<body id= "mainpagebody">
 
<!-- Main content -->
<div id="titlebar">
	<h4>CrowdCode</h4>
</div>
<div id="container">
	<div id= "leftbar">
	<table id="scoreTable">
		<tr>
			<td><%=worker.getHandle()%></td>
		</tr>
		<tr>
			<td><p><span id="score">0 points</span></p></td>
		</tr>
	</table>
	</div>
	<div id="contentPane"></div>
	<div id="rightbar">
		<div id="leaderboard"><table id="leaderboardTable"></table></div><BR><BR><BR>
		<div id="statistics">
			<p><B>Project</B></p>
			<p><span id="loc"></span><small>&nbsp;&nbsp;&nbsp;lines of code</small></p>
			<p><span id="functionsWritten"></span><small>&nbsp;&nbsp;&nbsp;functions written</small></p>
			<p><span id="microtasksCompleted"></span><small>&nbsp;&nbsp;&nbsp;microtasks completed</small></p>
		</div>
	</div>
</div>
<div id="footer">
	<table>
		<tr>
			<td><p><a href="" id="logoutLink">Log out</a></p></td>
			<td><p><a href="">Preferences</a></p></td>
			<td><p><a href="">Terms</a></p></td>
			<td><p><a href="">About</a></p></td>
		</tr>
	</table>
</div>

<!-- Popups -->
<div id="logout" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" logoutLabel"" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
		<h3 id="logoutLabel">You are now logged out.</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
		<button id="loginButton" class="btn btn-primary">Log in</button>
	</div>
</div>

<!-- Scripts --> 
<script src="/include/qunit.js"> </script> 
<script src="/include/jquery-1.8.2.min.js"></script> 
<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
<script src="/_ah/channel/jsapi"></script> 
<script src="/include/stars/jquery.rating.js"></script>
<script src="/html/keybind.js"></script>
<script src='https://cdn.firebase.com/v0/firebase.js'></script>
<script>
	var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';

    $(document).ready(function()
    {
        loadMicrotask();

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
		
		// Hook the leaderboard to Firebase		
		var leaderboardRef = new Firebase(firebaseURL + '/leaderboard');
		leaderboardRef.on('value', function(snapshot) {
		  	updateLeaderboardDisplay(snapshot.val());
		});
		
		// Hook the newsfeed to Firebase
		var newsfeedRef = new Firebase(firebaseURL + '/workers/<%=worker.getUserID()%>/newsfeed');
		newsfeedRef.on('child_added', function(snapshot) {
			newNewsfeedItem(snapshot.val());
		});		
		
		// Hook the score to Firebase
		var scoreRef = new Firebase(firebaseURL + '/workers/<%=worker.getUserID()%>/score');
		scoreRef.on('value', function(snapshot) { 
			updateScoreDisplay(snapshot.val());
		});		
		
		// Hook stats to firebase
		var locRef = new Firebase(firebaseURL + '/statistics/linesOfCode');
		locRef.on('value', function(snapshot) { $('#loc').html(snapshot.val()); });
		var locRef = new Firebase(firebaseURL + '/statistics/functionsImplemented');
		locRef.on('value', function(snapshot) { $('#functionsWritten').html(snapshot.val()); });
		var locRef = new Firebase(firebaseURL + '/statistics/microtasksCompleted');
		locRef.on('value', function(snapshot) { $('#microtasksCompleted').html(snapshot.val()); });		
	});
    
    function submit(formData)
    {
		$.ajax({
		    contentType: 'application/json',
		    data: JSON.stringify( formData ),
		    dataType: 'json',
		    type: 'POST',
		    url: '/<%=projectID%>/submit?type=' + microtaskType + '&id=' + microtaskID,
		}).done( function (data) { loadMicrotask();	});   	 
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
		$('#contentPane').load('/<%=projectID%>/fetch');
    	resetSubmitButtons();
	}
	
	function updateLeaderboardDisplay(leaderboard)
	{
		var newHTML = '<tr><td colspan=2 id="leaderboardTableTitle"><p>High Scores</p></td></tr>';
		$.each(leaderboard.leaders, function(index, leader)
		{
			newHTML += '<tr><td>' + leader.score + '</td><td>' + leader.name + '</td></tr>';
		});
		$('#leaderboardTable').html(newHTML);
	}

	function updateScoreDisplay(points)
	{
		$('#score').html(points);
	}
	
	function newNewsfeedItem(item)
	{
	}	
	
</script>
</body>
</html>