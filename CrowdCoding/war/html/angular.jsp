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
<html lang="en" ng-app="crowdCodeWorker">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	
	<!-- Stylesheets -->
	<link rel="stylesheet"  href="/include/jquery.rating.css" />
	<link rel="stylesheet" href="../include/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="/css/worker.css" type="text/css" />
	
	  
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/pastel-on-dark.css" type="text/css" />
	
	
	
</head>

<body ng-controller="AppController">
	
	<div id="wrapper" class="container-fluid">
		<header>
			<div>
				<div class="pull-left">
					<h3>CrowdCode</h3>
				</div>
				
				<div id="userProfile" class="dropdown pull-right" >
				  <a id="dLabel" role="button" data-toggle="dropdown" data-target="#" >
				    <img src="/user/picture?userId={{workerId}}" class="profile-picture" alt="{{workerHandle}}" />
						{{workerHandle}}
				    <span class="caret"></span>
				  </a>
				
				  <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
				  	<li><a href="#popUpChangePicture" data-toggle="modal" >change profile picture</a></li>
				  	<li><a id="logoutLink" href="<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>">logout</a></li>
				  </ul>
				</div>
				
				<div class="clearfix"></div>
			</div>
		</header>
		<div class="row row-eq-height">

			<div id="leftBar" class="col-md-2 col-xs-2">
				<ng-include src="'/html/templates/score_panel.html'"></ng-include>
				<ng-include src="'/html/templates/stats_panel.html'"></ng-include>
				<ng-include src="'/html/templates/news_panel.html'"></ng-include>
			</div>

			<div id="container" class="col-md-8 col-xs-8" ng-controller="MicrotaskController" >
				<form id="task" name="form" novalidate ng-class="{ 'form-horizontal': inlineForm }">
					<ng-include src="templatePath"></ng-include>
				</form>
			</div>

			<div id="rightBar" class="col-md-2 col-xs-2">
				<ng-include src="'/html/templates/online_workers_panel.html'"></ng-include>
				<ng-include src="'/html/templates/leaderboard_panel.html'"></ng-include>
				<ng-include src="'/html/templates/chat_panel.html'"></ng-include>
				<ng-include src="'/html/templates/functions_reference_panel.html'"></ng-include>
			</div>

		</div>
	</div>

	<footer class="navbar-default navbar-fixed-bottom"> 
        	<button id="sendFeedbackBtn" type="button" class="btn btn-primary pull-right">Send Us Feedback!</button>
			<span class="clearfix"></span>
	</footer>
	
	

	<!-- Javascript 3rd part libraries --> 
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/polyfill.js"></script>
	<script src="/js/errorCheck.js"></script>
	<script src="/include/jshint.js"></script>
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
	<script src="/include/stars/jquery.rating.js"></script>
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script src='/include/esprima.js'></script>
	<script src='/include/escodegen.browser.js'></script>
	<script src="/include/diff/diff_match_patch.js"></script>
	<script src="/include/diff/jquery.pretty-text-diff.js"></script>
	
	<script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular/ui-bootstrap-tpls-0.11.2.min.js"></script> <!-- bootstrap ui for AngularJS -->
    <script src="/include/codemirror/codemirror.js"></script> <!-- codemirror -->
 	<script src="/include/codemirror/javascript.js"></script> 
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script> <!-- firebase -->
	<script src="https://cdn.firebase.com/libs/angularfire/0.8.2/angularfire.min.js"></script> <!-- angularfire -->
	
	
	
	
	
	<script src="/js/functionSupport.js"></script>
	<script src="/js/errorCheck.js"></script>

	<script src="/js/JSONValidator.js"></script>
	<script src="/js/workqueue.js"></script>
	
	<script src="/js/app.js"></script>
	
	<script src="/js/services/services.js"></script>
	<script src="/js/services/ADT.js"></script>
	
	<script src="/js/services/tests.js"></script>
	<script src="/js/services/functions.js"></script>
	<script src="/js/services/user.js"></script>
	<script src="/js/services/testRunner.js"></script>
	<script src="/js/directives/directives.js"></script>
	<script src="/js/controllers/controllers.js"></script>
	<script src="/js/controllers/microtasks.js"></script>
    <script src="/include/ui-codemirror-0.1.6/ui-codemirror.min.js"></script>  
		
   
<script>
var projectId    = '<%=projectID%>';
var workerId     = '<%=workerID%>';
var workerHandle = '<%=workerHandle%>';
var firebaseURL  = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';



</script>

</body>
</html>
