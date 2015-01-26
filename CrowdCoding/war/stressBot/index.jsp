

<!DOCTYPE html>
<html lang="en" ng-app="stressBot">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

	<link href='http://fonts.googleapis.com/css?family=Merriweather:300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic|Lato:100normal,100italic,300normal,300italic,400normal,400italic,700normal,700italic,900normal,900italic' rel='stylesheet' type='text/css'>

	<!-- Stylesheets -->
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="http://rawgithub.com/mgcrea/bootstrap-additions/master/dist/bootstrap-additions.min.css">

    <link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/libraries.min.css">
	<link rel="stylesheet" href="//mgcrea.github.io/angular-strap/styles/main.min.css">
 
</head>

<body ng-controller="MainController">

	<header>
		<div class="navbar navbar-default navbar-fixed-top" role="navigation">
			<div class="container-fluid">

				<div class="navbar-header">
			      <a class="navbar-brand" href="#">Stress Bot</a>
			    </div>

				<ul class="nav navbar-nav">
			        <li><a href="#"><strong>project:</strong> {{ projectId }}</a></li>
			        <li><a href="#"><project-stats></project-stats></a></li>
			    </ul>
			</div>
		</div>
	</header>

	<div class="main-wrapper">
	    <div class="container-fluid">

	        <!-- CONTENT -->
	        <div id="content" class="col-md-12" >

				stress bot
	        </div>

	    </div>
	</div>



	<ng-include src="'/html/templates/popups/popup_template.html'"></ng-include>
	
	<tutorial-manager></tutorial-manager>

	<script>var projectId    = '<%=(String) request.getAttribute("project") %>';</script> 

	<!-- Javascript 3rd part libraries -->
	<script src="/include/jquery-2.1.0.min.js"></script>
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script>
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>


	<script src="/include/angular/angular.min.js"></script> <!-- AngularJS -->
	<script src="/include/angular/angular-animate.min.js"></script><!-- Angular animate -->
	<script src="/include/angular/angular-sanitize.min.js"></script><!-- Angular sanitize -->

 	<script src="/include/ui-ace-editor/src/ui-ace.js"> </script> <!-- UI Ace Editor-->
	<script src="/include/ace-editor/src-min-noconflict/ace.js"> </script> <!-- Ace Editor-->


	<script src="/include/angular-strap/dist/angular-strap.min.js"></script>
	<script src="/include/angular-strap/dist/angular-strap.tpl.min.js"></script>

	<script src="/include/zeroclipboard-2.2.0/dist/ZeroClipboard.min.js"></script>
	<script src="/include/ng-clip/dest/ng-clip.min.js"></script>

	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script> <!-- firebase -->

	<script src="https://cdn.firebase.com/libs/angularfire/0.8.2/angularfire.min.js"></script> <!-- angularfire -->

	<script src="/stressBot/app.js"></script>


</body>
</html>
