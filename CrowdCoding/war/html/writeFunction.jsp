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
		var functionName = '<%= microtask.getFunction().getName() %>';
		var allTheFunctionCode = '<%= allFunctionCodeInSystem %>';
		
		var showUserStoryPrompt = <%= (promptType == PromptType.IMPLEMENT_USER_STORY) %>;
		var showSketchPrompt = <%= (promptType == PromptType.SKETCH) %>;
		var showDescriptionChangedPrompt = <%= (promptType == PromptType.DESCRIPTION_CHANGE) %>;   	 
		
   		$(document).ready(function() 
		{   			
   		    // Based on the prompt type, load and setup the appropriate prompt divs
   		    if (showUserStoryPrompt)
	   			$("#userStoryPrompt").css('display',"block");
   			if (showSketchPrompt)
	   			$("#sketchPrompt").css('display',"block");
   			if (showDescriptionChangedPrompt)
   			{
   				$('#descriptionChangedPrompt').prettyTextDiff();
	   			$("#descriptionChangedPrompt").css('display',"block");	   			
   			}  			
   			
		  	$('#skip').click(function() { skip(); });	
		  	
			$('#sketchForm').submit(function() 
			{
				var result = checkAndCollectCode();
				if (!result.errors)
					submit(result.code);
				
				// Disable default submit functionality.
				return false;
			});
		});
   	 	
	</script>
	<%@include file="/html/elements/microtaskTitle.jsp" %>

	<div id="userStoryPrompt" style="display: none">
		Can you figure out how this user story should be implemented: <BR>
		<span class="label label-inverse"><%= microtask.getUserStoryText() %></span><BR><BR>
		
		The main function - the entrypoint into the application - is below. Sketch a design
		of this user story by editing the function. Use <b>pseudocalls</b> to describe behavior that
		should be implemented in another function. Try not to break other user stories that may already
		be implemented. But don't worry too much - it'll all be tested.<BR><BR>
	</div>
	
	<div id="sketchPrompt" style="display: none">
		Implement the function below. <BR><BR>
	</div>
	
	<div id="descriptionChangedPrompt" style="display: none">
		The description of a function called in the code below has changed. Can you update the code
		(if necessary)? <BR>
		
		<span class="original" style="display: none"><%=microtask.getOldFullDescription()%></span>
   		<span class="changed" style="display: none"><%=microtask.getNewFullDescription()%></span>
		<span id="diff" class="diff"></span><BR><BR>
	</div>	
	
	If you're not sure how to do something, indicate a line or portion 
	of a line as <b>pseudocode</b> by beginning it with '//#'.
	If you'd like to call a <b>function</b> to do something, describe what you'd like it to do with a
	<b>pseudocall</b> - a line or portion of a line beginning with '//!'.
	Update the description and header to reflect the function's actual behavior - the crowd will
	refactor callers and tests to match the new behavior (but you can't change the description
	or signature of main).<BR><BR>
	
	Show example<BR>
	
	<BR>
	
	<form id="sketchForm" action="">
		<%@include file="/html/elements/functionEditor.jsp" %>
		<%@include file="/html/elements/submitFooter.jsp" %>	
	</form>
</div>