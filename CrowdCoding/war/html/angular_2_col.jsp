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
	<link rel="stylesheet" href="../include/bootstrap/css/bootstrap.min.css" type="text/css" />

	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/pastel-on-dark.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/custom.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/custom-reverse.css" type="text/css" />

	<link rel="stylesheet" href="/include/codemirror/custom-editor.css" type="text/css" />


	<link rel="stylesheet" href="/include/codemirror/console.css" type="text/css" />


	<link rel="stylesheet" href="/css/worker_2_col.css" type="text/css" />
	<link rel="stylesheet" href="/css/animations.css" type="text/css" />


 <!--    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/angular-motion.min.css">
    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/bootstrap-additions.min.css"> -->
    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/libraries.min.css">
    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/main.min.css">


</head>

<body ng-controller="AppController"  ng-cloak >

	<header tutorial="1" class="navbar navbar-default navbar-fixed-top bg-blue-dark" role="navigation">

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
			        <li class="dropdown">
			          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
		          		<img src="/user/picture?userId={{workerId}}" class="profile-picture" alt="{{workerHandle}}" />
						{{workerHandle}}
						<span class="caret"></span>
			          </a>
			          <ul class="dropdown-menu" role="menu">
			            <li>
							<a  data-animation="am-fade-and-scale" data-placement="center" 
							    data-template="/html/templates/popups/popup_change_picture.html" 
							    bs-modal="modal" container="body">change profile picture</a>
						</li>
						<li>
							<a id="logoutLink" href="<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>">logout</a>
						</li>
			          </ul>
			        </li>
			    </ul>


			</div><!-- /.container-fluid -->
		</div><!-- /. navbar -->
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
		        <a href="#" class="linkclass send-feedback" 
		           data-animation="am-fade-and-scale" data-placement="center" 
		           data-template="/html/templates/popups/popup_feedback.html" bs-modal="modal">Send Us Feedback!</a>
			</div>

	        <!-- CONTENT -->
	        <div id="content" class="order-3" ng-controller="MicrotaskController">
	        	<form name="microtaskForm" class="form-horizontal"
						  novalidate submit-hot-key="$broadcast('collectFormData', microtaskForm)">
					<div id="task"  class="task" style="" microtask >
						<ng-include src="templatePath"></ng-include>
					</div>
					<div class="button-bar">
					<!-- You can use a custom html template with the `data-template` attr -->
  						<span class="pull-left">
							<button ng-click="$broadcast('collectFormData', microtaskForm)"
								tabindex="99"
								class="btn btn-sm btn-primary">
									Submit
							</button>
							<button ng-click="$emit('skipMicrotask')" tabindex="100" class="btn btn-sm">Skip</button>
						</span>
						<span class="pull-right">
							<button ng-click="$emit('toggleChat')" tabindex="101" class="btn {{chatActive?'btn-chat-active':''}} btn-sm"  >

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

<!--
	<tutorial title="main tutorial">
		<step>
			<tag>.task</tag>
			<content>task suggestions</content>
			<content-position>left</content-position>
		</step>
		<step>
			<tag>#sidebarLeft</tag>
			<content>sidebar suggestions</content>
			<content-position>right</content-position>
		</step>
		<step>
			<tag>.button-bar</tag>
			<content>button suggestions</content>
			<content-position>top</content-position>
		</step>
		<step>
			<tag>header</tag>
			<content>header suggestions</content>
			<content-position>bottom</content-position>
		</step>
	</tutorial>
-->
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
	<!--<script src="/include/diff/diff_match_patch.js"></script>
	<script src="/include/diff/jquery.pretty-text-diff.js"></script>-->

	<script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
<!--	<script src="/include/angular/ui-bootstrap-tpls-0.11.2.min.js"></script> <!-- bootstrap ui for AngularJS -->
    <!--<script src="/include/angular-diff/angular-diff.js"></script><!-- Angular substitute of PrettyTextDiff -->
    <script src="/include/angular-animate/angular-animate.min.js"></script><!-- Angular animate -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular-sanitize.js"></script>


    <script src="/include/codemirror/codemirror.js"></script> <!-- codemirror -->
    <script src="/include/ui-codemirror-0.1.6/ui-codemirror.min.js"></script> <!-- codemirror ui for Angularjs-->
 	<script src="/include/codemirror/javascript.js"></script><!-- Codemirror Javascript Style -->



 	<script src="/include/ui-ace-editor/src/ui-ace.js"> </script> <!-- UI Ace Editor-->
	<script src="/include/ace-editor/src-min-noconflict/ace.js"> </script> <!-- Ace Editor-->



	<script src="/include/angular-strap/dist/angular-strap.min.js"></script>
	<script src="/include/angular-strap/dist/angular-strap.tpl.min.js"></script>


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



	</script>


	<!-- Angular Application -->
	<script src="/js/app.js"></script>

	<!-- Angular Services -->
	<script src="/js/services/services.js"></script>
	<script src="/js/services/ADT.js"></script>
	<script src="/js/services/microtasks.js"></script>
	<script src="/js/services/tests.js"></script>
	<script src="/js/services/functions.js"></script>
	<script src="/js/services/mocks.js"></script>
	<script src="/js/services/user.js"></script>
	<script src="/js/services/testRunner.js"></script>
    <script src="/js/services/fileUpload.js"></script>


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
