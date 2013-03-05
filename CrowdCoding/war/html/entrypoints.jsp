<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteEntrypoint" %>
<%@ page import="com.crowdcoding.artifacts.UserStory" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteEntrypoint microtask = (WriteEntrypoint) crowdUser.getMicrotask();
    UserStory userStory = microtask.getEntrypoint().getUserStory();
%>

<div id="microtask">
	<script>
		var microtaskType = 'writeentrypoint';
		var microtaskID = <%= microtask.getID() %>;
	
	    $(document).ready(function()
		{
			$("#signatureForm").submit(function() { submit(collectSignatureData()); return false; });
		  	$('#skip').click(function() { skip(); });			
		});	        
	</script>
		
	<h5> Consider the following user scenario: <BR><BR> <%=userStory.getText() %><BR><BR>
	What should the first function be that implements this scenario, 
	and what parameters does it require?</h5><BR>
	
	<form id="signatureForm" action="">	
		<%@include file="/html/elements/signatureEditor.jsp" %>
		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>
	</form>
</div>