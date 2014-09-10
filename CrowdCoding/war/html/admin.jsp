<%
	String projectID = (String) request.getAttribute("project");
%>

<html>
<head>
	<title>CrowdCode Admin Interface </title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"></script> 	
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script>
		$(document).ready(function()
		{
			var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
			
			$('#execute').click(function()
			{
				var command = $('#command').val();
				$.get('/' + '<%=projectID%>/admin/' + command, function(data) 
				{
					$('#output').prepend(data);
				});
			});
			$('#clear').click(function()
			{
				$('#output').html('');
			});
			$('#command').keypress(function (e) 
			{
				// When user hits enter in input box, do the execute action
			  	if (e.which == 13)
			    	$('#execute').click();
			});
			
			// Link the workers, microtasks, functions, and tests to Firebase
			var microtasksRef = new Firebase(firebaseURL + '/microtasks');
			microtasksRef.on('child_added', function (snapshot) 
			{
				$('#microtasks').append(constructMicrotaskDiv(snapshot.val()));
			});
			microtasksRef.on('child_changed', function (snapshot) 
			{
				var microtask = snapshot.val();		
				$('#microtask' + microtask.id).replaceWith(constructMicrotaskDiv(microtask));				
			});
			microtasksRef.on('child_removed', function (snapshot) 
			{
				var microtask = snapshot.val();				
				$('#microtask' + microtask.id).remove();
			});
			
			var functionsRef = new Firebase(firebaseURL + '/artifacts/functions');
			functionsRef.on('child_added', function (snapshot) 
			{
				var functionObj = snapshot.val();
				$('#functions').append(constructFunctionDiv(functionObj));
			});
			functionsRef.on('child_changed', function (snapshot) 
			{
				var functionObj = snapshot.val();
				$('#function' + functionObj.id).replaceWith(constructFunctionDiv(functionObj));
			});
			functionsRef.on('child_removed', function (snapshot) 
			{
				var functionObj = snapshot.val();
				$('#function' + functionObj.id).remove();
			});
			
			var testsRef = new Firebase(firebaseURL + '/artifacts/tests');
			testsRef.on('child_added', function (snapshot) 
			{
				var test = snapshot.val();
				$('#tests').append(constructTestDiv(test));
			});
			testsRef.on('child_changed', function (snapshot) 
			{
				var test = snapshot.val();
				$('#test' + test.id).replaceWith(constructTestDiv(test));
			});
			testsRef.on('child_removed', function (snapshot) 
			{
				var test = snapshot.val();
				$('#test' + test.id).remove();
			});
			
			var workersRef = new Firebase(firebaseURL + '/status/loggedInWorkers');
			workersRef.on('child_added', function (snapshot) 
			{
				var workerID = snapshot.name();
				var workerHandle = snapshot.val().workerHandle;
				$('#workers').append(constructWorkerDiv(workerID, workerHandle));
			});
			workersRef.on('child_removed', function (snapshot) 
			{
				var workerID = snapshot.name();
				$('#worker' + workerID).remove();
			});
			
			var microtaskQueueRef = new Firebase(firebaseURL + '/status/microtaskQueue');
			microtaskQueueRef.on('value', function (snapshot) 
			{
				if (snapshot.val() != null && snapshot.val().hasOwnProperty('queue'))
				{				
					var microtaskQueue = snapshot.val().queue;
					$('#microtaskQueueDiv').html(JSON.stringify(microtaskQueue));
				}
				else
				{
					$('#microtaskQueueDiv').html('');					
				}
			});

			var reviewQueueRef = new Firebase(firebaseURL + '/status/reviewQueue');
			reviewQueueRef.on('value', function (snapshot) 
			{
				if (snapshot.val() != null && snapshot.val().hasOwnProperty('queue'))
				{	
					var reviewQueue = snapshot.val().queue;
					$('#reviewQueueDiv').html(JSON.stringify(reviewQueue));
				}
				else
				{
					$('#reviewQueueDiv').html('');					
				}
			});
			
			var reviewMaterialsRef = new Firebase(firebaseURL + '/history/reviewMaterials');
			reviewMaterialsRef.on('child_added', function (snapshot) 
			{
				var reviewMaterials = snapshot.val();
				$('#reviewMaterialsDiv').append(reviewMaterials.workOutput);
			});
			
			
			function constructMicrotaskDiv(microtask)
			{
				var divTag = '<div id="microtask' + microtask.id + '">';
				var divContent = '' + microtask.id + ' ' + microtask.type + ' on ' 
					+ (microtask.hasOwnProperty('owningArtifact') ? microtask.owningArtifact : '') + ':' 
					+ (microtask.completed ? ' completed' : ' incomplete')
					+ ' points: ' + microtask.points
					+ (microtask.hasOwnProperty('workerHandle') ? ' worker: ' + microtask.workerHandle : '' );
				var divEnd = '</div>';
				return divTag + divContent + divEnd;
			}
			
			function constructFunctionDiv(functionObj)
			{
				var divTag = '<div id="function' + functionObj.id + '">';
				var divContent = '' + functionObj.id + ' <b>' + functionObj.name + '</b>' 
					+ ' described: ' + functionObj.described
					+ ' written: ' + functionObj.written
					+ ' needsDebugging: ' + functionObj.needsDebugging
					+ ' queuedMicrotasks: ' + functionObj.queuedMicrotasks
					+ ' lines: ' + functionObj.linesOfCode
					+ '<br>' + functionObj.description.replace(/\n/g, '<BR>') + functionObj.header + '<BR>'
					+ (functionObj.hasOwnProperty('code') ? functionObj.code.replace(/\n/g, '<BR>') : '') + '<br>';				
				var divEnd = '</div>';	
				return divTag + divContent + divEnd;
			}
			
			function constructTestDiv(test)
			{
				var divTag = '<div id="test' + test.id + '">';
				var divContent = '' + test.id + ' ' + test.functionName + ' for "' + test.description + '"'
					+ ' disputed: ' + (test.inDispute ? 'true' : 'false') 
					+ (test.hasOwnProperty('simpleTestInputs') ? '<BR>Inputs:<BR>' + test.simpleTestInputs : '')
					+ (test.hasOwnProperty('simpleTestOutput') ? '<BR>Outputs:<BR>' + test.simpleTestOutput.replace(/\n/g, '<BR>') : '');
				var divEnd = '</div>';	
				return divTag + divContent + divEnd;
			}		
			
			function constructWorkerDiv(workerID, workerHandle)
			{
				var divTag = '<div id="worker' + workerID + '">';
				var divContent = 'ID: ' + workerID + ' name: ' + workerHandle + '<BR>';
				var divEnd = '</div>';	
				return divTag + divContent + divEnd;
			}	
		});	
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Welcome to the <b>CrowdCode Administration Service</b></h3>
			Commands can be invoked by 1) directly submitting a post or get request containing a command 
			(e.g., "http://[...]/admin/Status") or 2) by using the textbox below to submit a 
			command (e.g., "Status").<BR><BR>
			The following commands are currently available:
			<ul>
				<li><b>Reset</b> - resets the default project back to the initial state.</li>
				<li><b>Reviews on</b> - turns on generation of review microtasks (default)</li>
				<li><b>Reviews off</b> - turns off generation of review microtasks</li>
			</ul><BR>
		
		   	<input type="text" class="input-xlarge" id="command">
		   	<button id="execute" class="btn btn-small">Submit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		   	<button id="clear" class="btn btn-small">Clear Output</button><BR><BR>
			<div id="output"></div><BR><BR>
			<b>Logged in Workers</b><BR><div id="workers"></div>
			<b>All Microtasks</b><BR><div id="microtasks"></div>
			<b>Microtask Queue</b><BR><div id="microtaskQueueDiv"></div>
			<b>Review Queue</b><BR><div id="reviewQueueDiv"></div>
			<b>All Functions</b><BR><div id="functions"></div>
			<b>All Tests</b><BR><div id="tests"></div>
			<b>Review Materials</b><BR><div id="reviewMaterialsDiv"></div>
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>