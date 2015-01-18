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

body {
	font-size:18px;
	text-align: center;
	font-family: 'Lato' !important;
}
.navbar {
	font-family: 'Lato' !important;
	background-color:#555;
}
.navbar .navbar-brand { color:white; }

.container-fluid {

}
h1 {
	font-size:2.0em;
	font-weight:800;
	line-height:2.5em;
}
h2 {
	font-size:1.4em;
	font-weight:800;
	text-transform: uppercase;
}
img { width:100%;}
</style>
</head>
<body>


    <div class="container-fluid">


    <div class="row">
      	<div class="col-md-12 col-sm-12">

		  <div class="row">
		  	<div class="col-md-offset-1 col-md-10 col-sm-12">
		  		<h1>Write code, with the crowd. </h1>
				<img src="/img/screenshot.png" style="box-shadow: 0px 0px 5px 5px #CBCBCB;"/>
		  	</div>
		  </div>
      	</div>
    </div>

    <hr />

    <div class="row">
      	<div class="col-md-12 col-sm-12">

		  <div class="row">
		  	<div class="col-md-offset-1 col-md-10 col-sm-12">
		  		<h1>Programming, re-envisioned</h1>
				<img src="/img/welcome_first.png" />
				<img src="/img/welcome_second.png" />
		  	</div>
		  </div>
		  <div class="row">
		  	<div class="col-md-offset-1 col-md-5 col-sm-12">
		  		<h2>Microtasks</h2>
				<p>
					CrowdCode organizes programming into microtasks, small units you can pick and do like writing a few lines of code or brain- storming test cases. 
				</p>
		  	</div>
		  	<div class="col-md-5 col-sm-12">
				<h2>Start it, or finish it!</h2>
				<p>
					Write some pseudocode, leave it for the crowd. Look at a test case written by the crowd, implement a test. See a request for a function, find the right one.
				</p>
		  	</div>
		  </div>
		  <div class="row">
		  	<div class="col-md-offset-1 col-md-5 col-sm-12">
		  		<h2>Automatic task generation</h2>
				<p>
					CrowdCode tracks what needs to be done, generating and managing microtasks.
				</p>
		  	</div>
		  	<div class="col-md-5 col-sm-12">
				<h2>Code, Tested</h2>
				<p>
					All code is unit tested. <br />When the tests pass, it’s ready to go.
				</p>
		  	</div>
		  </div>

      	</div>
    </div>

    <hr />

	<div class="row">
		<div class="col-md-12 col-sm-12">
			<div class="row">
		      	<div class="col-md-offset-1 col-md-10 col-sm-12">
		      		<h1>Your work, your credit</h1>
					<img src="/img/welcome_third.png" />
		      	</div>
		   	</div>
	      	<div class="row">
		      	<div class="col-md-offset-1 col-md-5 col-sm-12">
		      		<h2>Points</h2>
					<p>
						Microtasks are worth points; the harder the work, the more points it’s worth.
					</p>
		      	</div>
		      	<div class="col-md-5 col-sm-12">
					<h2>Reviews</h2>
					<p>
						Microtasks you submit are reviewed by the crowd. If accepted, you get the points; if rejected, you get nothing. If the crowd decides to revise, you get some points.
					</p>
		      	</div>
	      	</div>
		</div>
	</div>


	<div class="row">
      <div class="jumbotron" style="text-align:center;">
        	<a class="btn btn-lg btn-primary" href="/allTogetherDraw" role="button">Get Started!</a>
      </div>
	</div>
      
    </div> 


</body>
</html>