<%
	String projectID = (String) request.getAttribute("project");
%>



<html>
<head>
	<title>CrowdCode History for <%=projectID%></title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 	
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script>
	    var debugTestFailureCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var machineUnitTestCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var reuseSearchCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var writeCallCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var writeFunctionCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var writeFunctionDescriptionCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var writeTestCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    var writeTestCasesCounts = { submitted: 0, skipped: 0, totalTime: 0 };
	    
	    var totalTime = 0;
	
		$(document).ready(function()
		{
			var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
			var newsfeedRef = new Firebase(firebaseURL + '/history/events');
			newsfeedRef.on('child_added', function(snapshot) {
				if (snapshot.val() != null)
				{
					addHistoryEvent(snapshot.val());
					displayStats();
				}
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
				
				if (event.microtaskType == 'DebugTestFailure')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						debugTestFailureCounts.submitted++;
						debugTestFailureCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						debugTestFailureCounts.skipped++;					
				}
				else if (event.microtaskType == 'MachineUnitTest')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						machineUnitTestCounts.submitted++;
						machineUnitTestCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						machineUnitTestCounts.skipped++;						
				}
				else if (event.microtaskType == 'ReuseSearch')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						reuseSearchCounts.submitted++;
						reuseSearchCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						reuseSearchCounts.skipped++;						
				}
				else if (event.microtaskType == 'WriteCall')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						writeCallCounts.submitted++;
						writeCallCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						writeCallCounts.skipped++;						
				}
				else if (event.microtaskType == 'WriteFunction')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						writeFunctionCounts.submitted++;
						writeFunctionCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						writeFunctionCounts.skipped++;						
				}
				else if (event.microtaskType == 'WriteFunctionDescription')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						writeFunctionDescriptionCounts.submitted++;
						writeFunctionDescriptionCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						writeFunctionDescriptionCounts.skipped++;						
				}
				else if (event.microtaskType == 'WriteTest')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						writeTestCounts.submitted++;
						writeTestCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						writeTestCounts.skipped++;						
				}
				else if (event.microtaskType == 'WriteTestCases')
				{
					if (event.eventType == 'MicrotaskSubmitted')
					{
						writeTestCasesCounts.submitted++;
						writeTestCasesCounts.totalTime += event.timeWorkedOn / 1000 / 60;
					}
					else
						writeTestCasesCounts.skipped++;						
				}	
				
				totalTime += event.timeWorkedOn / 1000 / 60;
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
		
		function displayStats()
		{
			$('#historyStats').html('<table><tr><td>Microtask</td><td>Submitted</td><td>Skipped</td>'
				+ '<td>Total time</td><td>Average time</td></tr><tr>'
				+ '<td>DebugTestFailure</td><td>' + debugTestFailureCounts.submitted + '</td>'
				+ '<td>' + debugTestFailureCounts.skipped + '</td>'
				+ '<td>' + debugTestFailureCounts.totalTime + '</td>'
				+ '<td>' + (debugTestFailureCounts.totalTime / debugTestFailureCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>MachineUnitTest</td><td>' + machineUnitTestCounts.submitted + '</td>'
				+ '<td>' + machineUnitTestCounts.skipped + '</td>'
				+ '<td>' + machineUnitTestCounts.totalTime + '</td>'
				+ '<td>' + (machineUnitTestCounts.totalTime / machineUnitTestCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>ReuseSearch</td><td>' + reuseSearchCounts.submitted + '</td>'
				+ '<td>' + reuseSearchCounts.skipped + '</td>'
				+ '<td>' + reuseSearchCounts.totalTime + '</td>'
				+ '<td>' + (reuseSearchCounts.totalTime / reuseSearchCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>WriteCall</td><td>' + writeCallCounts.submitted + '</td>'
				+ '<td>' + writeCallCounts.skipped + '</td>'
				+ '<td>' + writeCallCounts.totalTime + '</td>'
				+ '<td>' + (writeCallCounts.totalTime / writeCallCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>WriteFunction</td><td>' + writeFunctionCounts.submitted + '</td>'
				+ '<td>' + writeFunctionCounts.skipped + '</td>'
				+ '<td>' + writeFunctionCounts.totalTime + '</td>'
				+ '<td>' + (writeFunctionCounts.totalTime / writeFunctionCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>WriteFunctionDescription</td><td>' + writeFunctionDescriptionCounts.submitted + '</td>'
				+ '<td>' + writeFunctionDescriptionCounts.skipped + '</td>'
				+ '<td>' + writeFunctionDescriptionCounts.totalTime + '</td>'
				+ '<td>' + (writeFunctionDescriptionCounts.totalTime / writeFunctionDescriptionCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>WriteTest</td><td>' + writeTestCounts.submitted + '</td>'
				+ '<td>' + writeTestCounts.skipped + '</td>'
				+ '<td>' + writeTestCounts.totalTime + '</td>'
				+ '<td>' + (writeTestCounts.totalTime / writeTestCounts.submitted) + '</td></tr><tr>'
				
				+ '<td>WriteTestCases</td><td>' + writeTestCasesCounts.submitted + '</td>'
				+ '<td>' + writeTestCasesCounts.skipped + '</td>'
				+ '<td>' + writeTestCasesCounts.totalTime + '</td>'
				+ '<td>' + (writeTestCasesCounts.totalTime / writeTestCasesCounts.submitted) + '</td></tr><tr>'
			
				+ '<BR><BR>Total time (hours): ' + (totalTime / 60)
			);
		}
		
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Welcome to the CrowdCode history for <b><%=projectID%></b></h3>

		
			<div id="historyStream"></div>
			<div id="historyStats"></div>
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>