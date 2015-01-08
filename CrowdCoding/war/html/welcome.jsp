<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.googlecode.objectify.Work"%>
<%@page import="com.googlecode.objectify.Key"%>
<%@page import="com.googlecode.objectify.ObjectifyService"%>
<%@page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@page import="com.google.appengine.api.users.UserService" %>
<%@page import="com.google.appengine.api.users.User"%>
<%@page import="com.crowdcoding.entities.Project"%>
<%@page import="com.crowdcoding.entities.Worker"%>
<%@page import="java.util.logging.Logger"%>

<%
/*
	String projectID = (String) request.getAttribute("project");
	if (projectID == null || projectID.equals(""))
		projectID = "publicDemo";*/
		
%>

<html>
<head>
	<title>CrowdCode</title>

	<link href='http://fonts.googleapis.com/css?family=Merriweather:300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic|Lato:100normal,100italic,300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">


	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 	

<style type="text/css">


.navbar {
	font-family: 'Lato' !important;
	background-color:#555;
}
.navbar .navbar-brand { color:white; }

.container-fluid {

}
</style>
</head>
<body>

	<!-- Static navbar -->
    <nav class="navbar navbar-default navbar-static-top">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">Crowd Code</a>
        </div>
      </div>
    </nav>


    <div class="container-fluid">

      <!-- Main component for a primary marketing message or call to action -->
      <div class="jumbotron">
      	<div class="container">
			<div class="row">
				<div class="col-md-12">
					<img src="/img/welcome_first.png" />
					<img src="/img/welcome_second.png" />
					<img src="/img/welcome_third.png" />
				</div>
			</div>
      	</div>
      </div>


      <!-- Main component for a primary marketing message or call to action -->
      <div class="jumbotron">
        <div class="container">
        	<h2>Join a project!</h2>
	        <p>This example is a quick exercise to illustrate how the default, static and fixed to top navbar work. It includes the responsive CSS and HTML, so it also adapts to your viewport and device.</p>
	        <p>To see the difference between static and fixed top navbars, just scroll.</p>
	        <p>
	          <a class="btn btn-lg btn-primary" href="../../components/#navbar" role="button">View navbar docs &raquo;</a>
	        </p>
    	</div>
      </div>

    </div> 

<!--
	<div class="row">
		<div class="col-md-1"></div>
	  	<div class="col-md-5">
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
		<div class="col-md-5"><BR><img src="/html/workflow.png"></img></div>
		<div class="col-md-1"></div>
	</div>
	
	<div class="jumbotron jumbotronCentered">
		  <a class="btn btn-large btn-success bigButton" >Let's get started!</a>
	</div>-->
</body>
</html>