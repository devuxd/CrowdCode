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
	
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
%>


<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8">
	<title>CrowdCode</title>
	<link type="text/css" rel="stylesheet" href="/include/jquery.rating.css" />
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="/html/animate.css" type="text/css" />
	<link rel="stylesheet" href="/html/DebugTestFailure.css" type="text/css" />
	<link rel="stylesheet" href="/html/styles.css" type="text/css" /> 
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
</head>

<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header" style="background: #1B87E0">
  </div>
  <div class="modal-body" style="background: #FFFFFF">
      <h3 id="myModalLabel"><center>Microtask complete!</center></h3>
  
  </div>
  <div class="modal-footer" style="background: #1B87E0">
  </div>
</div>

<body id= "mainpagebody">
 
<!-- Main content -->
<div id="titlebar" class="animated pulse">
	<h4>CrowdCode

	
			<div id="statistics" >
						<span id="loc" class="badge"></span><small>&nbsp;&nbsp;lines of code</small> &nbsp;&nbsp;
			<span id="functionsWritten" class="badge"></span><small>&nbsp;&nbsp;functions written</small>&nbsp;&nbsp;
			<span id="microtasksCompleted" class="badge"></span><small>&nbsp;&nbsp;microtasks completed</small>&nbsp;&nbsp;&nbsp;&nbsp;
	<font color="white" style="font-weight:bold; font-size:larger;">	<i class=" icon-user"> </i> <%=worker.getHandle()%> </font></div>  </h4>
</div>
<div id="container">

<div class="row-fluid">


 <div class="span2">
 
<!-- Modal -->



	<div id= "leftbar" class="animated fadeInLeftBig">
	<div id="scoreTableAnimHolder" class="animated flip">	<div id="scoreTableTitle" class="animated wiggle" >   &nbsp;&nbsp;  Your score <i class=" icon-star"> </i> &nbsp;</div> </div>
	
	<table id="scoreTable">
	
		<tr>
			<td class="animated fadeInLeftBig"><b ><p><span id="score" >0 </span> points</p></b></td>
		</tr>
	</table>
	
	
			<div id="leaderboardTitle" class="animated wiggle" >   &nbsp;&nbsp;  Leaders  &nbsp; <i class=" icon-th-list"> </i> </div>
	
			<div id="leaderboard"><table id="leaderboardTable"><tr><td></td></tr></table></div>

	
	</div>
</div>

 <div class="span8">
<div id="contentPane" class="animated bounceIn"></div>
</div>

 <div class="span2">
<div id="rightbar" class="animated fadeInRightBig ">

<div id="activityFeedTitle" class="animated wiggle" >   &nbsp;&nbsp;  Recent Activity <i class=" icon-comment"> </i> &nbsp;</div>
<div id="activityFeed">
	
			<div id="activityFeedTable" >
			
	
	
	</div>
	</div>
	

</div>
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
<script src="/include/codemirror/codemirror.js"></script>
<script src="/include/codemirror/javascript.js"></script>
<script src="/include/jslint.js"></script>
<script src="/html/errorCheck.js"></script>
<script src="/include/jquery-1.8.2.min.js"></script> 
<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
<script src="/include/stars/jquery.rating.js"></script>
<script src="/html/keybind.js"></script>
<script src='https://cdn.firebase.com/v0/firebase.js'></script>
<script>
	var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
	var eventListRef = new Firebase(firebaseURL + '/history/microtaskSubmits/');
	var feedbackRef = new Firebase(firebaseURL + '/feedback');
	
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
		
		$("#sendFeedback").click(sendFeedback);
		
		// Hook the leaderboard to Firebase		
		var leaderboardRef = new Firebase(firebaseURL + '/leaderboard');
		leaderboardRef.on('value', function(snapshot) {
			if (snapshot.val() != null)
		  		updateLeaderboardDisplay(snapshot.val());
		});
		
		// Hook the newsfeed to Firebase
		var newsfeedRef = new Firebase(firebaseURL + '/workers/<%=worker.getUserID()%>/newsfeed');
		newsfeedRef.on('child_added', function(snapshot) {
			if (snapshot.val() != null)
				newNewsfeedItem(snapshot.val());
		});		
		
		// Hook the score to Firebase
		var scoreRef = new Firebase(firebaseURL + '/workers/<%=worker.getUserID()%>/score');
		scoreRef.on('value', function(snapshot) { 
			if (snapshot.val() != null)
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
    	var stringifiedData = JSON.stringify( formData );
    	
		$.ajax({
		    contentType: 'application/json',
		    data: stringifiedData,
		    dataType: 'json',
		    type: 'POST',
		    url: '/<%=projectID%>/submit?type=' + microtaskType + '&id=' + microtaskID,
		}).done( function (data) { loadMicrotask();	});   
		
		// Push the microtask submit data onto the Firebase history stream
		var eventData = {'microtaskType': microtaskType, 
					   'microtaskID': microtaskID,
					   'workerHandle': '<%= worker.getHandle() %>',
					   'workerID': '<%= worker.getUserID() %>'};
		eventData.microtask = formData;
		eventListRef.child(microtaskID).set(eventData);
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
		$('#contentPane').load('/<%=projectID%>/fetch', 
		
		function() {
  	  		  $('#microtask').addClass('animated rollIn');
  		    		
  		    	   });
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
				$('#scoreTableAnimHolder').toggleClass('animated flip');
		
		
	}
		function newNewsfeedItem(item)
	{
	 var itemValue = item.description;
	 var itemPoints = item.points;

		$('#activityFeedTable').prepend('<tr class="animated minipulse"> <td class="animated pulse"> ' + '&nbsp;<i class="icon-thumbs-up"></i>&nbsp;&nbsp;' +"You earned " + itemPoints +  " points for "   + itemValue + "!" +  '</td> </tr> </br> </table>');					
								 
	 
	}
	function sendFeedback()
	{
		// Push the feedback to firebase
		var feedback = {'microtaskType': microtaskType, 
					   'microtaskID': microtaskID,
					   'workerHandle': '<%= worker.getHandle() %>',
					   'workerID': '<%= worker.getUserID() %>',
					   'feedback': $("#feedbackBox").val()};
		feedbackRef.push(feedback);
		$("#feedbackBox").val("");		
	}
	
</script>
</body>
</html>