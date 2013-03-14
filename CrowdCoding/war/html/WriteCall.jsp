<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteCall" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    ObjectMapper mapper = new ObjectMapper();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteCall microtask = (WriteCall) crowdUser.getMicrotask();
    String calleeFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getCallee());
    String functionCode = microtask.getCaller().getEscapedCode();
    
    StringWriter strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getCaller().getFunctionHeader());
    String functionHeader = strWriter.toString();
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllActiveFunctionsHeader(microtask.getCaller(), project) + "'";
%>

<div id="microtask">
	<script>
		var microtaskType = 'WriteCall';
		var microtaskID = <%= microtask.getID() %>;	
		    
   		$(document).ready(function() 
   		{
   			$('#skip').click(function() { skip(); });
   			
   			$('#writeCallForm').submit(function() {
				doPresubmitWork();
   				submit( { code: $("#code").val() } );
   				return false;
   			});
   		});	    
	</script>

	<form id="writeCallForm" action="">
		<p><h4> Replace the psuedocode with an actual call to the function: </h4> <BR>	
		<%= calleeFormatted %><BR>
		<%@include file="/html/elements/functionEditor.jsp" %>		
		<%@include file="/html/elements/submitFooter.jsp" %>
	</form>
</div>