<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.channel.ChannelService" %>
<%@ page import="com.google.appengine.api.channel.ChannelServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>

<%
	Project project = Project.Create();
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());

     //UserService userService = UserServiceFactory.getUserService();
    //User user = userService.getCurrentUser();


    //ChannelService channelService = ChannelServiceFactory.getChannelService();


	// TODO: should have a better channel key that is not the email.
	// TODO: only want to do this the first time. Not on any subsequent page requests....
    //String token = channelService.createChannel(user.toString());
%>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>CrowdCode</title>
    <link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css" >
	<link rel="stylesheet" href="/html/styles.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
</head>

<body>
	<div id = "titlebar">
		<h4>CrowdCode</h4>		
	</div>
		
	<div id="container">		
		<div id = "leftbar">
		    <span><br><br><br><br><br><br><br><br></span>
			<table id="scoreTable">
				<tr><td><%= worker.getNickname() %></td></tr>		
				<tr><td id="score"><p>0 points</p> </td></tr>
			</table>
		</div>			
		<div id = "contentPane"></div>	
		<div id = "rightbar">
            <span><br><br><br><br><br><br><br><br></span>		  		
			<div id="leaderboard">	
				<table id="leaderboardTable">
					<tr><td colspan=2 id="leaderboardTableTitle"><p>High Scores</p></td></tr>
					<tr><td>500</td><td>Patrick</td>
					<tr><td>450</td><td>Ben</td>
					<tr><td>320</td><td>Steven</td>
					<tr><td>270</td><td>Andre</td>
					<tr><td>210</td><td>Thomas</td>
				</table>
			</div>
		</div>		
	</div>	
	<div id = "footer">
		<table><tr>
			<td><p><a href="">Sign Out</a></p></td>	
			<td><p><a href="">Preferences</a></p></td>	
			<td><p><a href="">Terms</a></p></td>
			<td><p><a href="">About</a></p></td>		
		</tr></table>
	</div>		
		
	<script src="/include/jquery-1.8.2.min.js"></script> 
    <script src="/include/bootstrap/js/bootstrap.min.js"></script>
  	<script src="/_ah/channel/jsapi"></script>

	<!--	
			
			var channel = new goog.appengine.Channel('{{<= token >}}');			
			var socket = channel.open();
			socket.onopen = function() { 
				alert("socket opened!");
			};
			socket.onmessage = function(message) {
				alert(message.data);				
			}
	 -->

	<script>
		$(document).ready(function(){
			loadMicrotask();
		});
		
		function loadMicrotask()
		{
			$('#contentPane').load('/fetch');		
		}
	</script>			
</body>
</html>