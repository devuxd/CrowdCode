<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.crowdcoding.microtasks.WriteFunctionDescription" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteFunctionDescription microtask = (WriteFunctionDescription) this.getServletContext().getAttribute("microtask");    

    Function caller = microtask.getCaller();
    String allFunctionCodeInSystem = FunctionHeaderUtil.getDescribedFunctionHeaders(null, project);
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
	
		var microtaskType = 'WriteFunctionDescription';
		var microtaskID = <%= microtask.getID() %>;	
		
		var allTheFunctionCode = '<%= allFunctionCodeInSystem %>';
		
		var codeBoxCode = '<%= caller.getEscapedCode() %>';
	
	    $(document).ready(function()
		{
			setupReadonlyCodeBox(readonlyCodeBox, codeBoxCode);
	    	
   			$('#skip').click(function() { skip(); });	
			$("#signatureForm").submit(function()
			{
				if (validateAll(false))
					submit(collectSignatureData());	
				else					
					$("#popUp").modal();
				
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
	<span class="label label-inverse"><%= microtask.getCallDescription() %></span><BR>	

	<a id="showContext" data-toggle="collapse" data-target="#callContext">Show context</a> 
	<div id="callContext" class="collapse"><div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div></div><BR>
	
	<BR><%@include file="/html/elements/typeBrowser.jsp" %><BR>
	
	
	<form id="signatureForm" action="">	
		<%@include file="/html/elements/signatureEditor.jsp" %>
		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>
	</form>
	
	<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
		<h3 id="logoutLabel">Please fix the listed errors and try again!</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
</div>	