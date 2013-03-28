<%
	String projectID = (String) request.getAttribute("project");
%>



<html>
<head>
	<title>CrowdCode History for <%=projectID%></title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<script src="/include/jquery-1.8.2.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 	
	<script src='https://cdn.firebase.com/v0/firebase.js'></script>
	<script>
		$(document).ready(function()
		{
			var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
			var newsfeedRef = new Firebase(firebaseURL + '/history/events');
			newsfeedRef.on('child_added', function(snapshot) {
				if (snapshot.val() != null)
					addHistoryEvent(snapshot.val());
			});	
			
			

		});	
		
		function addHistoryEvent(event)
		{
			$('#historyStream').append(event.timeInMillis + ' ' + event.artifactType + event.artifactID +
					': ' + event.artifactName + '<BR>');			
		}
		
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Welcome to the CrowdCode history for <b><%=projectID%></b></h3>

		
			<div id="historyStream"></div>
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>