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
<html lang="en">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	
	<!-- Stylesheets -->
	<link rel="stylesheet"  href="/include/jquery.rating.css" />
	<link rel="stylesheet" href="../include/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/codemirror.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/vibrant-ink.css" type="text/css" />
	<link rel="stylesheet" href="/include/codemirror/solarized.css" type="text/css" />
	
	<!-- Javascript 3rd part libraries --> 
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/polyfill.js"></script>
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script src="/include/jshint.js"></script>
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
	<script src="/include/stars/jquery.rating.js"></script>
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script src='/include/esprima.js'></script>
	<script src='/include/escodegen.browser.js'></script>
	<script src="/include/diff/diff_match_patch.js"></script>
	<script src="/include/diff/jquery.pretty-text-diff.js"></script>
	
	<!-- Javascript project libraries -->
	<script src="/js/readonlyCodeBox.js"></script>
	<script src="/js/reminder.js"></script>
	<script src="/js/errorCheck.js"></script>
	<script src="/js/keybind.js"></script>
	<script src="/js/JSONEditor.js"></script>
	<script src="/js/functions.js"></script>
	<script src="/js/tests.js"></script>
	<script src="/js/review.js"></script>
	<script src="/js/workqueue.js"></script>
	
</head>

<body>
	
	<div id="wrapper" class="container-fluid">

		<div class="row row-eq-twelve">

			<div id="leftBar" class="col-md-2 col-xs-2">

			</div>

			<div id="container" class="col-md-10 col-xs-8">
				<div id="content">
					<h2>DistributedJS! Admin</h2>
					<p><strong>WorkerID: </strong><%=workerID%></p>
					<p><strong>WorkerHandle: </strong><%=workerHandle%></p>

					<div class="panel panel-default">
					  <div class="panel-heading">
					    <h3 class="panel-title">Current Queue:</h3>
					  </div>
					  
					  <div class="panel-body"></div> 
					  
					  <table class="table" id="queueTable"> </table>
					</div>
					
					<div class="panel panel-default">
					  <div class="panel-heading">
					    <h3 class="panel-title">Enqueue Job:</h3>
					  </div>
					  
					  <div class="panel-body">
					    <span id="enqueueStatus"></span>
					  	<form id="enqueueJob">
					  		<input type="text" name="job"/>
					  		<input type="submit" value="Enqueue" />
					  	</form>
					  </div> 
					</div>
				</div>
			</div>

		</div>
	</div>
	




<!-- Popup  -->
<div id="popUp" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<span></span>
				<button type="button" class="close" data-dismiss="modal">X</button>
			</div>
			<div class="modal-footer">
			    <img src="/user/picture?userId=<%=workerID%>" alt="<%=workerHandle%>" class="pull-left profile-picture" />	
			    <div class="pull-left">
			    	<form  enctype='multipart/form-data' method="post" >
			    		<input type="file" name="picture" accept="image/*" /><br/>
			    		<input type="submit" class="btn btn-primary" value="change picture" />
			    	</form>
			    </div>
			    <span class="clearfix"></span>
			</div>	
		</div>
	</div>
</div>

<script>

    $(document).ready(function(){
    	startQueue();
	});
	
	// generator
	var workSpawnInterval = Math.random() * (2000 - 500) + 500; // from 500 to 3000 ms;
	var queueRef = new Firebase("https://crowdcode.firebaseio.com/distributed/<%=projectID%>/queue");
	
	// startQueue
	function startQueue(){
		// 
    	queueRef.on('value', function(snapshot) {
    		if (snapshot.val() != null){	 
    			var newHTML = '';
				$.each(snapshot.val(), function(index, item){
					newHTML += '<tr id="job'+index+'">'+
							   '<td>'+item.name+'</td>'+
							   '<td>' + item.time	 + '</td>'+
							   '</tr>';
				});
				$('#queueTable').html(newHTML);
    		}
    	});   				
	}
	
	var i = 0;
	setInterval(function() {
		queueRef.push({name: 'job'+i, time: Date.now()});
		console.log("Spawning a new job with id="+i);
		i++;
	}, workSpawnInterval);
	
	
</script>

</body>
</html>