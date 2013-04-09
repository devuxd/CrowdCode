<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.crowdcoding.microtasks.SketchFunction" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>
<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    ObjectMapper mapper = new ObjectMapper();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    SketchFunction microtask = (SketchFunction) crowdUser.getMicrotask();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    StringWriter strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getFunctionHeader());
    String functionHeader = strWriter.toString();
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(), project) + "'";
    Function function = microtask.getFunction();
    String functionCode = function.getEscapedCode();
%>


<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		var microtaskType = 'sketchfunction';
		var microtaskID = <%= microtask.getID() %>;
		
		var editorCode = '<%=functionCode%>';
		var functionHeader = <%= functionHeader %>;
		var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
		   	 	
   		$(document).ready(function() 
		{
		  	$('#skip').click(function() { skip(); });	
		  	
			$('#sketchForm').submit(function() 
			{
				doPresubmitWork();
				
				if (checkCodeForErrors())			
					submit({ code: $("#code").val()});
				
				// Disable default submit functionality.
				return false;
			});
		});
   	 	
	</script>
	<%@include file="/html/elements/microtaskTitle.jsp" %>

	<h5> <%= methodFormatted %><BR>

	Implement the function below. If you're not sure how to do something, indicate a line or portion 
	of a line as <b>pseudocode</b> by beginning it with '/#'.<BR>
	If you'd like to call a <b>function</b> to do something, describe what you'd like it to do with a line
	or portion of a line beginning with '/!'.<BR></h5>
	
	Show example<BR>
	
	<BR>
	
	<form id="sketchForm" action="">
		<%@include file="/html/elements/functionEditor.jsp" %>
		<%@include file="/html/elements/submitFooter.jsp" %>	
	</form>
</div>