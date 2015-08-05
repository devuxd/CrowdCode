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
    String projectID    = (String) request.getAttribute("project");
	User   user         = UserServiceFactory.getUserService().getCurrentUser();
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
	<link rel="stylesheet" href="/include/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css" type="text/css" />
	<link rel="stylesheet" href="/include/bootstrap-additions/dist/bootstrap-additions.min.css">
    <link rel="stylesheet" href="/include/angular-strap/libs.min.css">
	<link rel="stylesheet" href="/include/angular-toaster/toaster.min.css" type="text/css" />
	<link rel="stylesheet" href="/include/keys/keys.css" type="text/css" />

	<link rel="stylesheet" href="/include/ui-layout/src/ui-layout.css" type="text/css" />
	<link rel="stylesheet" href="/include/ng-tags-input/ng-tags-input.min.css" type="text/css" />

    
	<link rel="stylesheet" href="/client/client.css" type="text/css" />


</head>

<body disable-backspace ng-cloak >

	<header>
		<nav-bar></nav-bar>
	</header>


	<div class="wrapper" >
	    <left-bar-buttons></left-bar-buttons>

	    <div class="content">
		    <div ui-layout="{ flow: 'column', dividerSize: 2 }">
		    	<div ui-layout-container size="20%" min-size="200px" max-size="20%" >
					<left-bar></left-bar>
				</div>

			    <div ui-layout-container size="60%" style="overflow:hidden;" >
			    	<form class="form-horizontal" microtask-form name="microtaskForm" novalidate></form>
			    </div>
				<div ui-layout-container size="20%" min-size="10%" max-size="25%">
					<right-bar></right-bar>
				</div>
		    </div>
		</div>

		

	</div>

	<ng-include src="'widgets/popup_template.html'"></ng-include>
	
	<tutorial-manager></tutorial-manager>
	<toaster-container></toaster-container>

	<!-- Javascript 3rd part libraries -->
	<script src="/include/jquery-2.1.0.min.js"></script>
	<script src="/include/polyfill.js"></script>
	<script src="/include/jshint.js"></script>
	<script src="/include/simplediff/simplediff.js"></script>
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script>
	<script src="/include/bootstrap-switch/dist/js/bootstrap-switch.min.js"></script>
	<script src="/include/firebase.js"></script>
	<script src='/include/estools.browser.js'></script>
	<script src='/include/escodegen.browser.js'></script>
	<script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular-messages/angular-messages.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular/angular-animate.min.js"></script><!-- Angular animate -->
	<script src="/include/angular/angular-sanitize.min.js"></script><!-- Angular sanitize -->
	<script src="/include/angularjs-scroll-glue/src/scrollglue.js"></script><!-- scroll glue -->
	<script src="/include/angular-loading-bar/src/loading-bar.js"></script>
 	<script src="/include/ui-ace-editor/src/ui-ace.js"> </script> <!-- UI Ace Editor-->
	<script src="/include/ace-editor/src-min-noconflict/ace.js"> </script> <!-- Ace Editor-->
	<script src="/include/ace-editor/src-min-noconflict/ext-language_tools.js"> </script> <!-- Ace Editor-->
	<script src="/include/angular-strap/dist/angular-strap.min.js"></script>
	<script src="/include/angular-strap/dist/angular-strap.tpl.min.js"></script>
	<script src="/include/zeroclipboard-2.2.0/dist/ZeroClipboard.min.js"></script>
	<script src="/include/ng-clip/dest/ng-clip.min.js"></script>
	<script src="/include/lunr.min.js"></script>
	<script src="/include/timeAgo.js"></script>
	<script src="/include/angular-toaster/toaster.min.js"></script>
	<script src="/include/angularfire.min.js"></script> <!-- angularfire -->
	<script src="/include/ui-layout/src/ui-layout.js"></script>

	<script src="/include/ng-tags-input/ng-tags-input.min.js"></script>
	<script src="/include/doctrine/doctrine.browser.js"></script>

	

	<script>
	var projectId    = '<%=projectID%>';
	var workerId     = '<%=workerID%>';
	var workerHandle = '<%=workerHandle%>';
	var logoutURL    = '<%=UserServiceFactory.getUserService().createLogoutURL("/"+projectID)%>';
	</script>



	<!-- Angular Application -->
	<script src="/client/client.js"></script>
	<script src="/client/test_runner/testRunner.js"></script>
	<script src="/client/test_runner/deepCompare.js"></script>


</body>
</html>
