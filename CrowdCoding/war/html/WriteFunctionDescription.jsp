<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.crowdcoding.microtasks.WriteFunctionDescription" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteFunctionDescription microtask = (WriteFunctionDescription) crowdUser.getMicrotask();
    Function caller = microtask.getCaller();
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
	
		var microtaskType = 'WriteFunctionDescription';
		var microtaskID = <%= microtask.getID() %>;	
		
		var codeBoxCode = '<%= caller.getEscapedCode() %>';
	
	    $(document).ready(function()
		{
			setupReadonlyCodeBox(readonlyCodeBox);
	    	
   			$('#skip').click(function() { skip(); });	
			$("#signatureForm").submit(function()
			{
				submit(collectSignatureData());			
				return false;
			});
			
			// Toggle show context text when user clicks on it
			$('#callContext').on('show', function () 
			{
				$('#showContext').text('Hide context');
			});
			$('#callContext').on('hide', function () 
			{
				$('#showContext').text('Show context');
			});				
		});

	</script>
	
	<%@include file="/html/elements/microtaskTitle.jsp" %>
	
	Can you write a description for a function that<BR>
	<span class="label label-inverse"><%= microtask.getCallDescription() %></span><BR><BR>
	
	Show example:<BR><BR>

	<a id="showContext" data-toggle="collapse" data-target="#callContext">Show context</a> 
	<div id="callContext" class="collapse"><div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div></div><BR>
	
	<form id="signatureForm" action="">	
		<%@include file="/html/elements/signatureEditor.jsp" %>
		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>
	</form>
</div>	