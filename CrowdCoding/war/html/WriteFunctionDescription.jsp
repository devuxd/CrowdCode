<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteFunctionDescription" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteFunctionDescription microtask = (WriteFunctionDescription) crowdUser.getMicrotask();
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
	
		var microtaskType = 'WriteFunctionDescription';
		var microtaskID = <%= microtask.getID() %>;	
	
	    $(document).ready(function()
		{
   			$('#skip').click(function() { skip(); });	
			$("#signatureForm").submit(function()
			{
				submit(collectSignatureData());			
				return false;
			});
		});

	</script>
	
	<%@include file="/html/elements/microtaskTitle.jsp" %>
	<h5> Please write a description for the following function: </h5>	
	<blockquote><%= microtask.getCallDescription() %></blockquote>
	
	
	<form id="signatureForm" action="">	
		<%@include file="/html/elements/signatureEditor.jsp" %>
		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>
	</form>
</div>	