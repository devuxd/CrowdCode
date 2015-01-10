<%@page contentType="text/html;charset=UTF-8" language="java"%>
<%@page import="com.googlecode.objectify.Work"%>
<%@page import="com.googlecode.objectify.Key"%>
<%@page import="com.googlecode.objectify.ObjectifyService"%>
<%@page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@page import="com.google.appengine.api.users.User"%>
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
	User user = UserServiceFactory.getUserService().getCurrentUser();
	Project project = ObjectifyService.ofy().transact(new Work<Project>()
	{
	    public Project run(){ return Project.Create(projectID); }
	});

	Worker worker = Worker.Create(user, project);

	String workerID     = user.getUserId();
	String workerHandle = user.getNickname();

%>

<!DOCTYPE html>
<html lang="en" ng-app="crowdCodeWorker">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

	<link href='http://fonts.googleapis.com/css?family=Merriweather:300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic|Lato:100normal,100italic,300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic' rel='stylesheet' type='text/css'>

	<!-- Stylesheets -->
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="http://rawgithub.com/mgcrea/bootstrap-additions/master/dist/bootstrap-additions.min.css">
	<link rel="stylesheet" href="/include/keys/keys.css" type="text/css" />

	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/pastel-on-dark.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/custom.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/custom-reverse.css" type="text/css" />

	<link rel="stylesheet" href="/include/codemirror/custom-editor.css" type="text/css" />

	<link rel="stylesheet" href="/include/codemirror/console.css" type="text/css" />


    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/libraries.min.css">
	<link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/main.min.css">
 
    <link rel="stylesheet" href="/include/angular-loading-bar/src/loading-bar.css"/>

    
	<link rel="stylesheet" href="/css/worker_2_col.css" type="text/css" />
	<link rel="stylesheet" href="/css/animations.css" type="text/css" />


</head>

<body disable-backspace ng-controller="AppController"  ng-cloak >

	<header>

		<div class="navbar navbar-default navbar-fixed-top" role="navigation">
			<div class="container-fluid">

				<div class="navbar-header">
			      <a class="navbar-brand" href="#">CrowdCode</a>
			    </div>

				<ul class="nav navbar-nav">
			        <li><a href="#"><strong>project:</strong> {{ projectId }}</a></li>
			        <li><a href="#"><project-stats></project-stats></a></li>
			    </ul>

			    <ul class="nav navbar-nav navbar-right">
			    	<li>
			        	<a user-menu href="#" />
							
							{{ workerHandle}}
							<img ng-src="{{ avatar(workerId).$value }}" class="profile-picture" />
							<span class="caret"></span>
			        	</a>
			        </li>
			    </ul>


			</div>
		</div>
	</header>

	<div class="main-wrapper" ng-init="leftBar=true;rightBar=true;">
	    <div class="container-flex-row">

	        <!-- LEFT SIDEBAR -->
	        <div ng-show="leftBar" id="sidebarLeft" class="sidebar order-1" >
				<div class="sidebar-panels">
		        	<h3 class="toggler">News</h3>
		        	<div class="element active"  style="height:40%">
		        		<div class="element-body scrollable">
							<news-panel></news-panel>
		        		</div>
		        	</div>
		        	<h3 class="toggler">Leaderboard</h3>
		        	<div class="element active" style="height:40%">
		        		<div class="element-body scrollable">
							<ng-include src="'/html/templates/panels/leaderboard_panel.html'"></ng-include>
		        		</div>
		        	</div>
		        </div>

		        <div class="sidebar-buttons">
			        <button href="#" class=""
			           data-animation="am-fade-and-scale"
			           data-placement="center"
			           data-template="/html/templates/popups/popup_shortcuts.html"
			           bs-modal="modal"
			           data-container="body"
			           >shortcuts</button>
			           
			        <button href="#" class=""
			           data-animation="am-fade-and-scale"
			           data-placement="center"
			           data-container="body"
			           data-template="/html/templates/popups/popup_feedback.html" bs-modal="modal">Send Us Feedback!</button>
		        </div>
			</div>

	        <!-- CONTENT -->
	        <div id="content" class="order-3" ng-controller="MicrotaskController" >
	        	<form name="microtaskForm" class="form-horizontal" novalidate microtask-shortcuts>
					<div id="task" class="task" microtask >
						<ng-include class="task-{{ microtask.type | lowercase }}" src="templatePath"></ng-include>
					</div>
					<div class="button-bar">
						<div class="btn-group pull-left" role="group"  >
						  <button type="button" ng-click="$emit('skipMicrotask')" tabindex="100" class="btn btn-default btn-sm">Skip</button>
						  <button type="button" ng-click="$broadcast('collectFormData', microtaskForm) " tabindex="99" class="btn btn-primary btn-sm">Submit</button>
						</div>


						<span class="pull-right">
							<span ng-if="unreadMessages > 0" class="unread-messages">{{unreadMessages}}</span>
							<button ng-click="$emit('toggleChat')" tabindex="101" class="btn btn-chat-toggle {{chatActive?'opened':''}} btn-sm"  >

								<span class="glyphicon glyphicon-comment"></span>
							</button>
						</span>
						<span class="clearfix"></span>
					</div>
				</form>
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

	    </div>
	</div>


	<chat></chat>

	<ng-include src="'/html/templates/popups/popup_template.html'"></ng-include>

	<!-- Javascript 3rd part libraries -->
	<script src="/include/jquery-2.1.0.min.js"></script>
	<script src="/include/polyfill.js"></script>
	<script src="/include/jshint.js"></script>
	<script src="/include/simplediff/simplediff.js"></script>
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script>
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script src='/include/esprima.js'></script>
	<script src='/include/escodegen.browser.js'></script>

	<script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular/angular-animate.min.js"></script><!-- Angular animate -->
	<script src="/include/angular/angular-sanitize.min.js"></script><!-- Angular sanitize -->

	<script src="/include/angularjs-scroll-glue/src/scrollglue.js"></script><!-- scroll glue -->

	<!-- loadingbar -->
	<script src="/include/angular-loading-bar/src/loading-bar.js"></script>

    <script src="/include/codemirror/codemirror.js"></script> <!-- codemirror -->
    <script src="/include/ui-codemirror-0.1.6/ui-codemirror.min.js"></script> <!-- codemirror ui for Angularjs-->
 	<script src="/include/codemirror/javascript.js"></script><!-- Codemirror Javascript Style -->
 	<script src="/include/codemirror/diff.js"></script><!-- Codemirror Javascript Style -->




 	<script src="/include/ui-ace-editor/src/ui-ace.js"> </script> <!-- UI Ace Editor-->
	<script src="/include/ace-editor/src-min-noconflict/ace.js"> </script> <!-- Ace Editor-->



	<script src="/include/angular-strap/dist/angular-strap.min.js"></script>
	<script src="/include/angular-strap/dist/angular-strap.tpl.min.js"></script>


	<script src="/include/zeroclipboard-2.2.0/dist/ZeroClipboard.min.js"></script>
	<script src="/include/ng-clip/dest/ng-clip.min.js"></script>

	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script> <!-- firebase -->

	<script src="https://cdn.firebase.com/libs/angularfire/0.8.2/angularfire.min.js"></script> <!-- angularfire -->


	<!--<script src="/js/instrumentFunction.js"></script> <!-- to refactor -->

	<script src="/js/errorCheck.js"></script> <!-- to refactor -->
	<script src="/js/functionSupport.js"></script> <!-- to refactor -->


	<script src="/js/JSONValidator.js"></script>

	<script src="/js/workqueue.js"></script>




	<script>
	var projectId    = '<%=projectID%>';
	var workerId     = '<%=workerID%>';
	var workerHandle = '<%=workerHandle%>';
	var firebaseURL  = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
	var logoutURL    = '<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>';


	</script>


	<!-- Angular Application -->
	<script src="/js/app.js"></script>

	<!-- Angular Services -->
	<script src="/js/services/services.js"></script>
	<script src="/js/services/avatarFactory.js"></script>
	<script src="/js/services/ADT.js"></script>
	<script src="/js/services/microtasks.js"></script>
	<script src="/js/services/tests.js"></script>
	<script src="/js/services/functions.js"></script>
	<script src="/js/services/user.js"></script>
	<script src="/js/services/testRunner.js"></script>
    <script src="/js/services/fileUpload.js"></script>
    <script src="/js/services/TestNotificationChannel.js"></script>


	<script src="/js/services/testFactory.js"></script>

	<!-- Angular Directives -->
	<script src="/js/directives/directives.js"></script>
	<script src="/js/directives/codemirror-directives.js"></script>

	<script src="/js/directives/ace-editor-directives.js"></script>

	<!-- Angular Filter -->
	<script src="/js/filters/filter.js"></script>

	<!-- Angular Controllers -->
	<script src="/js/controllers/controllers.js"></script>
	<script src="/js/controllers/microtasks.js"></script>



</body>
</html>
