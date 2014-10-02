<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="com.google.appengine.api.users.User"%>
<%@ page import="com.google.appengine.api.users.UserService"%>
<%@ page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@ page import="com.crowdcoding.entities.Project"%>
<%@ page import="com.crowdcoding.entities.Worker"%>
<%@ page import="com.crowdcoding.entities.Function"%>
<%@ page import="com.crowdcoding.entities.microtasks.WriteFunction"%>
<%@ page import="com.crowdcoding.entities.microtasks.WriteFunction.PromptType"%>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil"%>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper"%>
<%@ page import="java.io.StringWriter"%>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils"%>
<%@ page import="java.io.Writer"%>
<%
	String projectID        = (String) request.getAttribute("project");
	Project project         = Project.Create(projectID);
	ObjectMapper mapper     = new ObjectMapper();
	Worker crowdUser        = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
	WriteFunction microtask = (WriteFunction) this.getServletContext().getAttribute("microtask");

	String functionCode            = microtask.getFunction().getEscapedFullCode();
	String allFunctionCodeInSystem = FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(),project);
	PromptType promptType          = microtask.getPromptType();
%>


<script>
	// get microtask informations
	var microtaskTitle       = '<%=microtask.microtaskTitle()%>';
	var microtaskSubmitValue = <%=microtask.getSubmitValue()%>;
	var microtaskType        = 'writeFunction';	
	var microtaskID          = <%=microtask.getID()%>;
	
	var editorCode          = '<%=functionCode%>';
	var functionName        = '<%=microtask.getFunction().getName()%>';
	var allTheFunctionCode  = '<%=allFunctionCodeInSystem%>';
	var highlightPseudoCall = false;
	var showSketchPrompt    = <%=(promptType == PromptType.SKETCH)%>;
	var showDescriptionChangedPrompt = <%=(promptType == PromptType.DESCRIPTION_CHANGE)%>;

	$(document).ready(function() {
		// Based on the prompt type, load and setup the appropriate prompt divs
		if (showSketchPrompt)
			$("#sketchPrompt").css('display', "block");
		if (showDescriptionChangedPrompt) {
			$('#descriptionChangedPrompt').prettyTextDiff();
			$("#descriptionChangedPrompt").css('display', "block");
		}

		$('#skipBtn').click(function() {
			skip();
		});

		$('#taskForm').submit(function() {
			var result = checkAndCollectCode();
			if (!result.errors)
				submit(result.code);
			else {
				$("#popUp").modal();
			}
			// Disable default submit functionality.
			return false;
		});
	});
</script>


<%@include file="/html/elements/microtaskTitle.jsp"%>

<!-- infos -->
<div id="taskDescription" class="bg-success"><!-- title -->


	<div id="sketchPrompt" style="display: none">
		Can you implement the function below? <BR><BR>
	</div>
	
	<div id="descriptionChangedPrompt" style="display: none">
		The description of a function called in the code below has changed. Can you update the code
		(if necessary)? <BR>
		
		<span class="original" style="display: none;background-color:white;color:black;"><%=microtask.getOldFullDescription()%></span>
	  	<span class="changed" style="display: none;background-color:white;color:black;"><%=microtask.getNewFullDescription()%></span>
		<div id="diff" class="diff" style="background-color:white;color:black;"></div><BR><BR>
	</div>	
	
	<p>
	
		<strong>Not sure how to do something? </strong> Indicate a line as <span
			class="pseudoCode">pseudocode</span> by beginning it with <span
			class="pseudoCode">'//#'</span>.
	</p>

	<p>
		<strong>Want to call a function? </strong>Write a <span
			class="pseudoCall">pseudocall</span> beginning it with <span
			class="pseudoCall">'//! functionName(arguments,..)'</span>
	</p>

	<p>
		Note that all function calls are pass by value (i.e., if you pass an
		object to a function and the function changes the object you will not
		see the change).
	</p>

	<p>
		<strong>IMPORTANT:</strong> If you think the function may require more
		than a few minutes to write, please use pseudocode and psuedocalls to
		break up the function into smaller pieces that others can work on. If
		you've gotten two or more reminders to submit, YOU SHOULD SUBMIT NOW!
	</p>
	
	<%@include file="/html/elements/typeBrowser.jsp" %><BR>
</div>

<form id="taskForm" action="#">
	<div class=" bg-warning">
		<%@include file="/html/elements/functionEditor.jsp"%>
		<%@include file="/html/elements/javascriptTutorial.jsp"%>
		<span class="clearfix"></span>
	</div>
	<br />
	<%@include file="/html/elements/microtaskFormButtons.jsp"%>
</form>
					

<script>

</script>

<!--

<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog"
	aria-labelledby="" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal"
			aria-hidden="true">×</button>
		<h3 id="logoutLabel">Please fix the listed errors and try again!</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
</div>
-->
