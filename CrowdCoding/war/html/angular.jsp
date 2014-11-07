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
	    public Project run(){ return Project.Create(projectID); }
	});
	
	String workerID     = UserServiceFactory.getUserService().getCurrentUser().getUserId();
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
	<link rel="stylesheet" href="/css/animations.css" type="text/css" />


	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/pastel-on-dark.css" type="text/css" />



</head>

<body ng-controller="AppController" >

		<header>
			<div class="navbar navbar-default navbar-fixed-top" role="navigation">
				<div class="container-fluid">
					<div class="navbar-header">
						<span class="navbar-brand">
						CrowdCode
						</span>
					</div>



					<ul class="nav navbar-nav">
						<li id="projectSelector">
							
							<a href=""><strong>Current Project: </strong>{{ projectId }}</a>
							<!--
							<a data-toggle="dropdown" class="dropdown" href="">
								Current Project
								<span class="caret"></span>
							</a>
							<ul class="dropdown-menu" role="menu">
								<li><a href="">Project1</a></li>
								<li><a href="">Project2</a></li>
							</ul>-->
						</li>
					</ul>

					<ul class="nav navbar-nav navbar-right">
						<li>
							<a data-toggle="dropdown" class="dropdown" href="">
								<img src="/user/picture?userId={{workerId}}" class="profile-picture" alt="{{workerHandle}}" />
								{{workerHandle}}
								<span class="caret"></span>
							</a>

							<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
								<li><a href="#popUpChangePicture" data-toggle="modal" >change profile picture</a></li>
								<li><a id="logoutLink" href="<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>">logout</a></li>
							</ul>

						</li>
					</ul>
				</div>
				



<!--
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
-->
			</div>
		</header>

	<div class="main-wrapper" ng-init="leftBar=true;rightBar=true;">
	    <div class="container-flex-row">
	        
	        <!-- LEFT SIDEBAR -->
	        <div ng-show="leftBar" id="sidebarLeft" class="sidebar order-1">
	            <div class="sidebar-wrapper container-flex-column">
					<!-- LEFT SIDEBAR PANELS -->
					<ng-include src="'/html/templates/score_panel.html'" id="first"  class="order-1" style="height:33%;"></ng-include>
					<ng-include src="'/html/templates/stats_panel.html'" id="second" class="order-3" style="height:33%;"></ng-include>
					<ng-include src="'/html/templates/news_panel.html'"  id="third"  class="order-5" style="height:33%;"></ng-include> 

					<!-- LEFT SIDEBAR RESIZERS -->
					<div class="row-resizer order-2" 
			        	ng-show="true"
			        	resizer="horizontal" 
			    		resizer-width="5" 
			    		resizer-top    = "#sidebarLeft #first" 
			    		resizer-bottom = "#sidebarLeft #second"
			    		resizer-main="top"
			    		>
	    			</div>
					<div class="row-resizer order-4"
			        	ng-show="true"
			        	resizer="horizontal" 
			    		resizer-width="5" 
			    		resizer-top    = "#sidebarLeft #second" 
			    		resizer-bottom = "#sidebarLeft #third"
			    		resizer-main="top"></div>
	            </div>
	        </div>

	        <!-- RIGHT SIDEBAR -->
			<div ng-show="rightBar" id="sidebarRight" class="sidebar order-5">
	           <div class="sidebar-wrapper container-flex-column">
	           	
					<ng-include src="'/html/templates/leaderboard_panel.html'"    id="first"  class="order-1" style="height:33%;"></ng-include>
					<ng-include src="'/html/templates/online_workers_panel.html'" id="second"  class="order-3" style="height:33%;"></ng-include>
					<ng-include src="'/html/templates/chat_panel.html'"           id="third" class="order-5" style="height:33%;" ></ng-include>
					
					<!-- LEFT SIDEBAR RESIZERS -->
					<div class="row-resizer order-2" 
			        	ng-show="true"
			        	resizer="horizontal" 
			    		resizer-width="5" 
			    		resizer-top    = "#sidebarRight #first" 
			    		resizer-bottom = "#sidebarRight #second"
			    		resizer-main="top">
	    			</div>
					<div class="row-resizer order-3"
			        	ng-show="true"
			        	resizer="horizontal" 
			    		resizer-width="5" 
			    		resizer-top    = "#sidebarRight #second" 
			    		resizer-bottom = "#sidebarRight #third"
			    		resizer-main="bottom"></div>
	           </div>
	        </div>

	        <!-- CONTENT -->
	        <div id="content" class="order-3">
				<div class="wrapper" ng-controller="MicrotaskController" >
					<form id="task" name="form" novalidate ng-class="{ 'form-horizontal': inlineForm }" >
						<ng-include src="templatePath"></ng-include>
					</form>
				</div>
	        </div>



	        <div class="column-resizer order-2" 
	        	ng-show="leftBar"
	        	resizer="vertical" 
	    		resizer-width="5" 
	    		resizer-left  = "#sidebarLeft" 
	    		resizer-right = "#content"
	    		resizer-main="left"
	    		resizer-max="20"
	    		resizer-min="10"
	    		>
	    	</div>


	        <div class="column-resizer order-4" 
	        	ng-show="rightBar"
	        	resizer="vertical" 
	    		resizer-width="5" 
	    		resizer-left  = "#content" 
	    		resizer-right = "#sidebarRight"
	    		resizer-main="right"
	    		resizer-max="20"
	    		resizer-min="10">
	    	</div>

	    </div>    
	</div>
<!--
<div id="wrapper" ng-init="leftBar=true;rightBar=true;">
    <div class="container-fluid fullwidth no-margin no-padding">
        <div class="row" >
            <div ng-show="leftBar" class="col-md-2 sidebar sidebar-left no-padding ">
               <div class="sidebar-controls">
               	<div class="control glyphicon glyphicon-remove"ng-click="leftBar=!leftBar" ></div>
               </div>
               <div class="sidebar-wrapper">
               	<ng-include src="'/html/templates/score_panel.html'"></ng-include>
				<ng-include src="'/html/templates/stats_panel.html'"></ng-include>
				<ng-include src="'/html/templates/news_panel.html'"></ng-include>
               </div>
            </div>
            <div class="middle col-md-{{ 8+((leftBar)?0:2)+((rightBar)?0:2)}} "
                 ng-class="{'col-md-offset-2': leftBar}">
                 <div class="middle-wrapper">

               <button ng-click="leftBar=!leftBar" >left</button>
               <button ng-click="rightBar=!rightBar" >right</button>
                 </div>
            </div>
            <div ng-show="rightBar" class="col-md-2 sidebar sidebar-right no-padding">
               <div class="sidebar-controls">
               	<div class="control glyphicon glyphicon-remove"ng-click="rightBar=!rightBar" ></div>
               </div>
               <div class="sidebar-wrapper"></div>
            </div>
        </div>
    </div>    
</div>-->
    <!--
	<div id="wrapper" class="container-fluid">
		<div class="row row-eq-height">

			<div id="leftBar" class="col-md-2 col-xs-2">
				<ng-include src="'/html/templates/score_panel.html'"></ng-include>
				<ng-include src="'/html/templates/stats_panel.html'"></ng-include>
				<ng-include src="'/html/templates/news_panel.html'"></ng-include>
				<ng-include src="'/html/templates/functions_reference_panel.html'"></ng-include>
			</div>

			<div id="container" class="col-md-8 col-xs-8" ng-controller="MicrotaskController" >
				<form id="task" name="form" novalidate ng-class="{ 'form-horizontal': inlineForm }">
					<ng-include src="templatePath"></ng-include>
				</form>
			</div>

			<div id="rightBar" class="col-md-2 col-xs-2">
			</div>

		</div>
	</div>-->

	<footer class="navbar-default navbar-fixed-bottom">
        	<button id="sendFeedbackBtn" type="button" class="btn btn-primary pull-right">Send Us Feedback!</button>
			<span class="clearfix"></span>
	</footer>

	<ng-include src="'/html/templates/popups/popup_template.html'"></ng-include>

	<!-- Javascript 3rd part libraries -->
	<script src="/include/jquery-2.1.0.min.js"></script>
	<script src="/include/polyfill.js"></script>
	<script src="/include/jshint.js"></script>
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script>
	<script src="/include/stars/jquery.rating.js"></script>
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script src='/include/esprima.js'></script>
	<script src='/include/escodegen.browser.js'></script>
	<!--<script src="/include/diff/diff_match_patch.js"></script>
	<script src="/include/diff/jquery.pretty-text-diff.js"></script>-->








	<script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular/ui-bootstrap-tpls-0.11.2.min.js"></script> <!-- bootstrap ui for AngularJS -->
    <script src="/include/angular-diff/angular-diff.js"></script><!-- Angular substitute of PrettyTextDiff -->
    <script src="/include/angular-animate/angular-animate.min.js"></script><!-- Angular animate -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular-sanitize.js"></script>


    <script src="/include/codemirror/codemirror.js"></script> <!-- codemirror -->
    <script src="/include/ui-codemirror-0.1.6/ui-codemirror.min.js"></script> <!-- codemirror ui for Angularjs-->
 	<script src="/include/codemirror/javascript.js"></script><!-- Codemirror Javascript Style -->

	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script> <!-- firebase -->
	<script src="https://cdn.firebase.com/libs/angularfire/0.8.2/angularfire.min.js"></script> <!-- angularfire -->

	<script src="/js/errorCheck.js"></script> <!-- to refactor -->
	<script src="/js/functionSupport.js"></script> <!-- to refactor -->



	<script src="/js/JSONValidator.js"></script>

	<script src="/js/workqueue.js"></script>

<link rel="stylesheet" type="text/css" href="/include/jsoneditor/jsoneditor.min.css">
<script type="text/javascript" src="/include/jsoneditor/jsoneditor.js"></script>

<meta http-equiv="Content-Type" content="text/html;charset=utf-8">

<script type="text/javascript" src="/include/jsoneditor/asset/ace/ace.js"></script>



<script src="/include/json-tree/json-tree.js"></script>
<link rel="stylesheet" href="/include/json-tree/json-tree.css">


<!-- include JSONedit files -->
<script src="/include/JSONedit-gh-pages/js/directives.js"></script>
<link  href="/include/JSONedit-gh-pages/css/styles.css" rel="stylesheet" type="text/css" />



<script src="/include/JSONedit-gh-pages/bower_components/angular-ui-sortable/sortable.min.js"></script>



	<!-- Angular Application -->
	<script src="/js/app.js"></script>

	<!-- Angular Services -->
	<script src="/js/services/services.js"></script>
	<script src="/js/services/ADT.js"></script>
	<script src="/js/services/microtasks.js"></script>
	<script src="/js/services/tests.js"></script>
	<script src="/js/services/functions.js"></script>
	<script src="/js/services/user.js"></script>
	<script src="/js/services/testRunner.js"></script>

	<!-- Angular Directives -->
	<script src="/js/directives/directives.js"></script>
	<script src="/js/my_rating.js"></script>

	<!-- Angular Filter -->
	<script src="/js/filters/filter.js"></script>

	<!-- Angular Controllers -->
	<script src="/js/controllers/controllers.js"></script>
	<script src="/js/controllers/microtasks.js"></script>



<script>
var projectId    = '<%=projectID%>';
var workerId     = '<%=workerID%>';
var workerHandle = '<%=workerHandle%>';
var firebaseURL  = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';



</script>

</body>
</html>
