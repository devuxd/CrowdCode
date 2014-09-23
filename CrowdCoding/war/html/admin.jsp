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
				if (command!='')
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
				$('#microtasks').append(constructMicrotaskTr(snapshot.val()));
			});
			microtasksRef.on('child_changed', function (snapshot) 
			{
				var microtask = snapshot.val();		
				$('#microtask' + microtask.id).replaceWith(constructMicrotaskTr(microtask));				
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
				$('#functions').append(constructFunctionTr(functionObj));
			});
			functionsRef.on('child_changed', function (snapshot) 
			{
				var functionObj = snapshot.val();
				$('#function' + functionObj.id).replaceWith(constructFunctionTr(functionObj));
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
				$('#tests').append(constructTestTr(test));
			});
			testsRef.on('child_changed', function (snapshot) 
			{
				var test = snapshot.val();
				$('#test' + test.id).replaceWith(constructTestTr(test));
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
				$('#workers').append(constructWorkerTr(workerID, workerHandle));
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
			
			
			function constructMicrotaskTr(microtask)
			{
				var trTag = '<tr id="microtask' + microtask.id + '">';
				var trContent =   '<td>' + microtask.id + '</td> ' 
								+ '<td>' + microtask.type + ' on ' + (microtask.hasOwnProperty('owningArtifact') ? microtask.owningArtifact : '')  + '</td> '  
								+ '<td>' + (microtask.completed ? ' completed' : ' incomplete') + '</td>'
								+ '<td>' + microtask.points + '</td>'
								+ '<td>' + (microtask.hasOwnProperty('workerHandle') ? microtask.workerHandle : 'N.A.') + '</td>' ;
				var trEnd = '</tr>';
				return trTag + trContent + trEnd;
			}
			
			function constructFunctionTr(functionObj)
			{
				var trTag = '<tr id="function' + functionObj.id + '">';
				var trContent =  '<td>'  + functionObj.id + '</td>'
					 + '<td>' + functionObj.name + '</td>' 
					 + '<td>' + functionObj.described + '</td>'
					 + '<td>' + functionObj.written + '</td>'
					 + '<td>' + functionObj.needsDebugging + '</td>'
					 + '<td>' + functionObj.queuedMicrotasks + '</td>'
					 + '<td>' + functionObj.linesOfCode + '</td>'
					//+ '<br>' + functionObj.description.replace(/\n/g, '<BR>') + functionObj.header + '<BR>'
					//+ (functionObj.hasOwnProperty('code') ? functionObj.code.replace(/\n/g, '<BR>') : '') + '<br>';				
				var trEnd = '</tr>';	
				return trTag + trContent + trEnd;
			}
			
			function constructTestTr(test)
			{
				var trTag = '<tr id="test' + test.id + '">';
				var trContent = '<td>' + test.id + '</td>'
					 + '<td>' + test.functionName + ' for "' + test.description+ '</td>'
					 + '<td>' + (test.inDispute ? 'true' : 'false')+ '</td>'
					 + '<td>' + (test.hasOwnProperty('simpleTestInputs') ? test.simpleTestInputs : '')+ '</td>'
					 + '<td>' + (test.hasOwnProperty('simpleTestOutput') ? test.simpleTestOutput.replace(/\n/g, '<BR>') : '')+ '</td>';
				var trEnd = '</tr>';	
				return trTag + trContent + trEnd;
			}		
			
			function constructWorkerTr(workerID, workerHandle)
			{
				var trTag = '<tr id="worker' + workerID + '">';
				var trContent = '<td>' + workerID + '</td><td>' + workerHandle + '</td>';
				var trEnd = '</tr>';	
				return trTag + trContent + trEnd;
			}	
		});	
	</script>
</head>
<body >
	
	<nav class="navbar navbar-default" role="navigation">
  		<div class="container-fluid">
		    <!-- Brand and toggle get grouped for better mobile display -->
		    <div class="navbar-header">
		      <a class="navbar-brand" href="#">CrowdCode Administration Service</a>
		    </div>
	    </div>
	</nav>
	
	<div class="container-fluid">
	
		<div class="row">
		  	<div class="col-md-6">
		  		<div class="panel panel-default">
				  <div class="panel-heading">Console</div>
				  <div class="panel-body"> 
					The following commands are currently available:
					<ul>
						<li><b>Reset</b> - resets the default project back to the initial state.</li>
						<li><b>Reviews on</b> - turns on generation of review microtasks (default)</li>
						<li><b>Reviews off</b> - turns off generation of review microtasks</li>
					</ul>
				
				   	<input type="text" class="input-xlarge" id="command">
				   	<button id="execute" class="btn btn-small">Submit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				   	<button id="clear" class="btn btn-small">Clear Output</button> <br />
					<div id="output"></div>
				
				  </div>
				</div>
		  	</div>
		  	
		  	<div class="col-md-6">
				<div class="panel panel-default">
				  <div class="panel-heading">Logged in Workers</div>
				  <table id="workers" class="table table-hover">
				  	<thead>
				  		<tr>
					  		<th>Id</th>
					  		<th>Name</th>
				  		</tr>
				  	</thead>
				  </table>
				</div>
			</div>
	  	</div>
		
		<div class="row">
		  	<div class="col-md-12">		
				<div class="panel panel-default">
				  <div class="panel-heading">All Microtasks</div>
				  <table id="microtasks" class="table table-hover">
				  	<thead>
				  		<tr>
					  		<th>Id</th>
					  		<th>Name</th>
					  		<th>Status</th>
					  		<th>Points</th>
					  		<th>Worker</th>
				  		</tr>
				  	</thead>
				  </table>
				</div>
			</div>
		</div>
		
		<div class="row">
		
		  	<div class="col-md-6">		
				<div class="panel panel-default">
				  <div class="panel-heading">Microtask Queue</div>
				  <div class="panel-body"> 
					<div id="microtaskQueueDiv"></div>
				  </div>
				</div>
			</div>
			
			
		  	<div class="col-md-6">	
				<div class="panel panel-default">
				  <div class="panel-heading">Review Queue</div>
				  <div class="panel-body"> 
					<div id="reviewQueueDiv"></div>
				  </div>
				</div>
			</div>
		</div>
		
		<div class="row">
				
		  	<div class="col-md-12">
				<div class="panel panel-default">
				  <div class="panel-heading">All Functions</div>
				  <table id="functions" class="table table-hover">
				  	<thead>
				  		<tr>
					  		<th>Id</th>
					  		<th>Name</th>
					  		<th>Described</th>
					  		<th>Written</th>
					  		<th>NeedsDebugging</th>
					  		<th>QueuedMicrotasks</th>
					  		<th>Lines</th>
				  		</tr>
				  	</thead>
				  </table>
				</div>
			</div>
			
		</div>
				
		<div class="row">
		  	<div class="col-md-12">
				<div class="panel panel-default">
				  <div class="panel-heading">All Tests</div>
				  <table id="tests" class="table table-hover">
				  	<thead>
				  		<tr>
					  		<th>Id</th>
					  		<th>Name</th>
					  		<th>Disputed</th>
					  		<th>Inputs</th>
					  		<th>Output</th>
				  		</tr>
				  	</thead>
				  </table>
				</div>
			</div>	
		</div>
				
		<div class="row">
		  	<div class="col-md-12">
				<div class="panel panel-default">
				  <div class="panel-heading">Review Materials</div>
				  <div class="panel-body"> 
					<div id="reviewMaterialsDiv"></div>
				  </div>
				</div>
		</div>
		
	</div>
</body>
</html>