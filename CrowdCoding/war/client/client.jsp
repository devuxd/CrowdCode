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
<html lang="en" ng-app="crowdCode">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

	<link href='http://fonts.googleapis.com/css?family=Merriweather:300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic|Lato:100normal,100italic,300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic' rel='stylesheet' type='text/css'>

	<!-- Stylesheets -->
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="http://rawgithub.com/mgcrea/bootstrap-additions/master/dist/bootstrap-additions.min.css">
    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/libraries.min.css">
	<link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/main.min.css">
	<link rel="stylesheet" href="/include/keys/keys.css" type="text/css" />

    
	<link rel="stylesheet" href="/clientDist/client.css" type="text/css" />


</head>

<body disable-backspace ng-cloak >

	<header>
		<navbar></navbar>
	</header>

	<div class="main-wrapper" ng-init="leftBar=true;rightBar=true;" >
	    <div class="container-flex-row">

	        <!-- LEFT SIDEBAR -->
	        <div ng-show="leftBar" id="sidebarLeft" class="sidebar order-1" >
				<div class="sidebar-panels" >
		        	<news></news>
		        	<leaderboard></leaderboard>
		        </div>

		        <div class="sidebar-buttons">
			        <!--<button href="#" class=""
			           id="shortcutsBtn"
			           data-animation="am-fade-and-scale"
			           data-placement="center"
			           data-template="/html/templates/popups/popup_shortcuts.html"
			           bs-modal="modal"
			           data-container="body"
			           >shortcuts</button>-->
			           
			        <button href="#" class=""
			           id="feedbackBtn"
			           data-animation="am-fade-and-scale"
			           data-placement="center"
			           data-container="body"
			           data-template="widgets/popup_feedback.html" bs-modal="modal">Send Us Feedback!</button>
		        </div>
			</div>

	        <!-- CONTENT -->
	        <div id="content" class="order-3" >

				<chat></chat>

	        	<microtask-form></microtask-form>

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



	<ng-include src="'widgets/popup_template.html'"></ng-include>
	
	<tutorial-manager></tutorial-manager>

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
	<script src="/include/angular-messages/angular-messages.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular/angular-animate.min.js"></script><!-- Angular animate -->
	<script src="/include/angular/angular-sanitize.min.js"></script><!-- Angular sanitize -->
	<script src="/include/angularjs-scroll-glue/src/scrollglue.js"></script><!-- scroll glue -->
	<script src="/include/angular-loading-bar/src/loading-bar.js"></script>
 	<script src="/include/ui-ace-editor/src/ui-ace.js"> </script> <!-- UI Ace Editor-->
	<script src="/include/ace-editor/src-min-noconflict/ace.js"> </script> <!-- Ace Editor-->
	<script src="/include/angular-strap/dist/angular-strap.min.js"></script>
	<script src="/include/angular-strap/dist/angular-strap.tpl.min.js"></script>
	<script src="/include/zeroclipboard-2.2.0/dist/ZeroClipboard.min.js"></script>
	<script src="/include/ng-clip/dest/ng-clip.min.js"></script>
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script> <!-- firebase -->
	<script src="https://cdn.firebase.com/libs/angularfire/0.8.2/angularfire.min.js"></script> <!-- angularfire -->





	<script>
	var projectId    = '<%=projectID%>';
	var workerId     = '<%=workerID%>';
	var workerHandle = '<%=workerHandle%>';
	var firebaseURL  = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
	var logoutURL    = '<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>';



	</script>


	<!-- Angular Application -->
	<script src="/clientDist/client.js"></script>
	<script src="/clientDist/test_runner/testRunner.js"></script>


</body>
</html>
