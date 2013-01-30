<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@page import="com.crowdcoding.artifacts.Project"%>
<%@page import="com.crowdcoding.Worker"%>
<%@page import="java.util.logging.Logger"%>


<%
	Logger log = Logger.getLogger(Project.class.getName());

	log.severe("Maingpage loading");
	log.severe("Creating project");

	Project project = Project.Create();

	log.severe("Loading worker");
	Worker worker = Worker.Create(UserServiceFactory.getUserService()
			.getCurrentUser());

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
			<td><p><a href="" id="Reset">Reset</a></p></td>
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
<script>
	var points = <%=worker.getScore()%>;

    $(document).ready(function()
    {
        updateScoreDisplay(points);
        updateLeaderboardDisplay(<%=leaderboard%>);
		loadMicrotask();

		$("#Reset").click(function() {
			$.post('/reset');
			// Default action of clicking on the link (with no href) will now cause
			// the page to be reloaded.
			
			// TODO: the server is resetting and is not really ready yet. Would logging out help?
			// Or can we pause requests to server while reset is in progress?
					
			window.location.href = 'about:blank';
			return false;
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
	});
   
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
		//setTimeout(fetchMessages, 10 * 1000);
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
		$('#contentPane').load('/fetch', fetchMessages);
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