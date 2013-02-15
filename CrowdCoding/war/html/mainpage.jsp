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

	final Logger log = Logger.getLogger(Project.class.getName());
	log.severe("Maingpage loading");
	log.severe("Creating project");

	Project project = ObjectifyService.ofy().transact(new Work<Project>() 
	{
	    public Project run() 
	    {
			return Project.Create();
	    }
	});
	
	log.severe("Loading worker");
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);

	log.severe("Loading leaderboard");
	String leaderboard = project.getLeaderboard().buildDTO();

	log.severe("Done loading leaderboard");
	log.severe(worker.toString());
	log.severe(leaderboard);
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
	<div id="leaderboard"><table id="leaderboardTable"></table></div>
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
<script>
	var points = <%=worker.getScore()%>;

    $(document).ready(function()
    {
        updateScoreDisplay(points);
        updateLeaderboardDisplay(<%=leaderboard%>);
        loadAndFetchMessages();

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
	});
   
    // Fetches messages every 10 seconds. Should only be called a single time.
	function fetchMessages()
	{
		$.getJSON('/fetchMessages', function(messages) 
		{
			$.each(messages.messages, function(index, message)
			{
				handleMessage(message);
			});

		});

		// Fetch messages again in 10 seconds
		setTimeout(fetchMessages, 10 * 1000);
	}

	function resetSubmitButtons()
	{
			defaultSubmitButtonArray = new Array();
			hasBeenIntialized = false;
	}
	function handleMessage(wrappedMessage) 
	{
		var message = jQuery.parseJSON(wrappedMessage);
		if (message.messageType == 'PointEventDTO') 
		{
			points += message.points;
			updateScoreDisplay(points);
		} else if (message.messageType == 'LeaderboardDTO') 
		{
			updateLeaderboardDisplay(message);
		}
	}

	function loadMicrotask() 
	{
		$('body').scrollTop(0);
		$('#contentPane').load('/fetch');
    	resetSubmitButtons();
	}
	
	// Loads a microtask and then fetches messages
	// Makes sure the microtask is loaded before messages are fetched
	function loadAndFetchMessages()
	{
		$('body').scrollTop(0);
		$('#contentPane').load('/fetch', fetchMessages);
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
	
</script>
</body>
</html>