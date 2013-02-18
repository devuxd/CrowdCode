<html>
<head>
	<title>CrowdCode Admin Interface </title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<script src="/include/jquery-1.8.2.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 	
	<script>
		$(document).ready(function()
		{
			$('#execute').click(function()
			{
				var command = $('#command').val();
				$.get('/admin/' + command, function(data) 
				{
					$('#output').prepend(data);
				});
			});
			$('#clear').click(function()
			{
				$('#output').html('');
			});
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
				<li><b>Status</b> - returns a status message describing the current status of the system.</li>
			</ul><BR>
		
		   	<input type="text" class="input-xlarge" id="command">
		   	<button id="execute" class="btn btn-small">Submit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		   	<button id="clear" class="btn btn-small">Clear Output</button><BR><BR>
			<div id="output"></div>
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>