<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.channel.ChannelService" %>
<%@ page import="com.google.appengine.api.channel.ChannelServiceFactory" %>

<%
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();


    ChannelService channelService = ChannelServiceFactory.getChannelService();


	// TODO: should have a better channel key that is not the email.
	// TODO: only want to do this the first time. Not on any subsequent page requests....
    String token = channelService.createChannel(user.toString());




%>





<html>
<head>
	<meta charset="UTF-8">
	<title>CrowdCoding</title>
	<link rel="stylesheet" href="styles.css" type="text/css" />
	<link rel="stylesheet" href="codemirror.css" type="text/css" />
	<link rel="stylesheet" href="vibrant-ink.css" type="text/css" />
  	<script src="jquery.min.js"></script> 
<!--	<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script> -->
	<script src="/_ah/channel/jsapi"></script>

	<script>
		$(document).ready(function(){
			$('#contentPane').load('testcases.jsp');
			
			var channel = new goog.appengine.Channel('{{<%= token %>}}');			
			var socket = channel.open();
			socket.onopen = function() { 
				alert("socket opened!");
			};
			socket.onmessage = function(message) {
				alert(message.data);				
			}
			$.post('/test');
			
		 });
	</script>
</head>

<body>






	<div id = "titlebar">
		<h3>CrowdCoding</h3>		
	</div>
		
	<div id="container">
		
		<div id = "leftbar">
			<table id="scoreTable">
				<tr><td><%= user.getNickname() %></td></tr>		
				<tr><td id="score"><p>333 points</p> </td></tr>
			</table>
		</div>
			
		<div id = "contentPane"></div>
	
		<div id = "rightbar">
		
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
				<td><p>Editor by daveho@Github</p></td>
				<td><p><a href="">Sign Out</a></p></td>	
				<td><p><a href="">Preferences</a></p></td>	
				<td><p>You are signed in as <%= user.getNickname() %></p></td>
			</tr></table>
		</div>


</body>
</html>