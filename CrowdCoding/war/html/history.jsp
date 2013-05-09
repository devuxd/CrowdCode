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
			var feedbackFeedRef = new Firebase(firebaseURL + '/feedback');
			feedbackFeedRef.on('child_added', function(snapshot) {
				if (snapshot.val() != null)
					addFeedbackEvent(snapshot.val());
			});	
		});	
		
		function addHistoryEvent(event)
		{
			$('#historyStream').append(event.timestamp + '&nbsp;&nbsp;&nbsp;' + event.eventType + ' on ' + 
					'"' + event.artifactName + '"(' + event.artifactType + event.artifactID + ') ');
			if ( event.eventType == 'MicrotaskSpawned')
			{
				$('#historyStream').append(' ' + event.microtaskID + ' ' + event.microtaskType);
			}
			else if (event.eventType == 'MicrotaskSubmitted' || event.eventType == 'MicrotaskSkipped')
			{
				$('#historyStream').append(' by ' + event.workerHandle + 
						' in ' + (event.timeWorkedOn / 1000) + ' sec '   
						+ event.microtaskID + ' ' + event.microtaskType);
			}
			else if (event.eventType == 'PropertyChange')
			{
				$('#historyStream').append(' ' + event.propertyName + ' became ' + event.propertyValue);
			}
			
			$('#historyStream').append('<BR>');
		}
		
		function addFeedbackEvent(event)
		{
			$('#historyStream').append(event.workerHandle + ' gave feedback on ' + event.microtaskID + ' ' + 
					event.microtaskType + ': "' + event.feedback + '"<BR>');
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