<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil"%>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
	String allCodeRaw = FunctionHeaderUtil.getAllActiveFunctions(null, project);
	// Has /n as newline. For running it, replace with nothing. For display, replace with <BR>
	String allCodeJS = allCodeRaw.replace("\n", "");
	String allCodeDisplay = allCodeRaw.replace("\n", "<BR>");
%>


<html>
<head>
	<title>CrowdCode Admin Interface </title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<script src="/include/jquery-1.8.2.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 	
	<script>
		$(document).ready(function()
		{
			$('#code').html('<%=allCodeDisplay%>');
			
			$('#execute').click(function()
			{
				var command = $('#command').val();
				var output = eval(command);
				$('#output').append('<BR>' + command + '<BR>');
				$('#output').append(output + '<BR>');								
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
		});	
	</script>
	<script>
		<%=allCodeJS%>
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Run the code</b></h3>
			Enter javascript commands, which will be executed against the code below.<BR><BR>
		
		   	<input type="text" class="input-xlarge" id="command">
		   	<button id="execute" class="btn btn-small">Submit</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		   	<button id="clear" class="btn btn-small">Clear Output</button><BR><BR>
		   	
		   	<h4>Output</b></h4>
			<div id="output"></div>
			<BR><BR>
			
			 <h4>Code</b></h4>
			<div id="code"></div>
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>