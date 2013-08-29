<%
	String projectID = (String) request.getAttribute("project");
	if (projectID == null || projectID.equals(""))
		projectID = "publicDemo";
%>


<html>
<head>
	<title>CrowdCode</title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="/html/welcomeStyles.css">
	<script src="/include/jquery-1.8.2.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 	
</head>
<body>
	<div class="container">	
		 <div class="masthead">
		   <h3 class="muted">CrowdCode</h3>  
		 </div>
	</div>

	<div class="jumbotron jumbotronCentered">
        <h1><BR>Build software with a crowd!<BR><BR></h1>
	</div>

	<div class="row-fluid">
		<div class="span1"></div>
	  	<div class="span5">
	      <div class="jumbotron">
	        <p class="lead">	        
	        	CrowdCode organizes work into <b>microtasks</b>,
				small, self-describing bits like writing psuedocode or brainstorming 
				test cases. After you finish a microtask, CrowdCode figures out what to do next,
				generating and distributing microtasks to the <b>crowd</b>.
	 			So you might write a description for function one, debug a test failure for another, and then 
	 			edit the pseudocode the crowd wrote for function one to add a call.
				As you complete microtasks, you earn <b>points</b>, and can see how you're doing on the leaderboard.
	        	        
	        </p>
	      </div>
		</div>
		<div class="span5"><BR><img src="/html/workflow.png"></img></div>
		<div class="span1"></div>
	</div>
	
	<div class="jumbotron jumbotronCentered">
		  <a class="btn btn-large btn-success bigButton" href="/<%= projectID %>">Let's get started!</a>
	</div>
</body>
</html>