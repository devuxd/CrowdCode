<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.crowdcoding.microtasks.WriteFunction" %>
<%@ page import="com.crowdcoding.microtasks.WriteFunction.PromptType" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>
<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    ObjectMapper mapper = new ObjectMapper();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteFunction microtask = (WriteFunction) crowdUser.getMicrotask();
    
    String functionHeader = microtask.getFunction().getEscapedHeader();
    String functionCode = microtask.getFunction().getEscapedFullCode();
    String allFunctionCodeInSystem = FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(), project);
    
    PromptType promptType = microtask.getPromptType();
%>


<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		var microtaskType = 'writeFunction';
		var microtaskID = <%= microtask.getID() %>;
		
		var editorCode = '<%=functionCode%>';
		var functionHeader = '<%= functionHeader %>';
		var allTheFunctionCode = '<%= allFunctionCodeInSystem %>';
		
		var showUserStoryPrompt = <%= (promptType == PromptType.IMPLEMENT_USER_STORY) %>;
		var showSketchPrompt = <%= (promptType == PromptType.SKETCH) %>;
		   	 	
   		$(document).ready(function() 
		{   			
   		    // Based on the prompt type, load and setup the appropriate prompt divs
   		    if (showUserStoryPrompt)
	   			$("#userStoryPrompt").css('display',"block");
   			if (showSketchPrompt)
	   			$("#sketchPrompt").css('display',"block");
   			   			
   			
		  	$('#skip').click(function() { skip(); });	
		  	
			$('#sketchForm').submit(function() 
			{
				doPresubmitWork();
				
				if (checkCodeForErrors())			
					submit(collectCode());
				
				// Disable default submit functionality.
				return false;
			});
		});
   	 	
	</script>
	<%@include file="/html/elements/microtaskTitle.jsp" %>


	<div id="userStoryPrompt" style="display: none">
		Implement functionality for the following user story: <BR>
		<%= microtask.getUserStoryText() %><BR><BR>
	</div>

	<div id="sketchPrompt" style="display: none">
		Implement the function below. <BR>
	</div>
	
	<h5>
	
	If you're not sure how to do something, indicate a line or portion 
	of a line as <b>pseudocode</b> by beginning it with '//#'.<BR>
	If you'd like to call a <b>function</b> to do something, describe what you'd like it to do with a line
	or portion of a line beginning with '//!'.<BR></h5>
	
	Show example<BR>
	
	<BR>
	
	<form id="sketchForm" action="">
		<%@include file="/html/elements/functionEditor.jsp" %>
		<%@include file="/html/elements/submitFooter.jsp" %>	
	</form>
</div>