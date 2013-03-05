<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
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
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllActiveFunctionsHeader(microtask.getFunction(), project) + "'";
    Function function = microtask.getFunction();
    String functionCode = function.getEscapedCode();
%>



<div id="microtask">
	<script>
		var microtaskType = 'sketchfunction';
		var microtaskID = <%= microtask.getID() %>;
		   	 	
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

	<p><h5> <%= methodFormatted %><BR>

Your mission is to implement the above function. You may choose to either completely
implement the function or to leave portions as <i>pseudocode</i>.<BR>
Lines beginning with '#' are considered pseudocode.<BR>
Line beginning with '!' are treated as a <i>single</i> function call pseudocode line.<BR>
</h5>
	<BR>
	
	<form id="sketchForm" action="">
		<%@include file="/html/elements/functionEditor.jsp" %>
		<%@include file="/html/elements/submitFooter.jsp" %>	
	</form>
</div>