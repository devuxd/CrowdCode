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
					<h2>DistributedJS! Worker</h2>
					<p><strong>WorkerID: </strong><%=workerID%></p>
					<p><strong>WorkerHandle: </strong><%=workerHandle%></p>
				</div>
			</div>

		</div>
	</div>
	




<script>

    $(document).ready(function(){
   
	});
	
	// worker
	var queueRef = new Firebase("https://crowdcode.firebaseio.com/distributed/<%=projectID%>/queue");
	
	var executeWorkCallback = function(data, whenFinished) {
	  //This is where we actually process the data. We need to call "whenFinished" when we're done
	  //to let the queue know we're ready to handle a new job.
	  console.log("<%=workerID%> started processing: " + data.name);
	
	  //This demo task simply pauses for the amount of time specified in data.time
	  var executionTime = Math.random() * (300 - 10) + 10; // from 10 to 300 ms
	  setTimeout(function() {
	  	console.log("<%=workerID%> finished processing: " + data.name );
	  	whenFinished();
	  }, executionTime);
	}
	
	new Worker(<%=workerID%>,queueRef	, executeWorkCallback);
	
	
</script>

</body>
</html>