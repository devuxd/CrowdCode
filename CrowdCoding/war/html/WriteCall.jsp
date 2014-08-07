<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteCall" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteCall microtask = (WriteCall) this.getServletContext().getAttribute("microtask");
    
    String functionCode = microtask.getCaller().getEscapedFullCode();
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getCaller(), project) + "'";
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		var microtaskType = 'WriteCall';
		var microtaskID = <%= microtask.getID() %>;	
		
		// Description for the description box of the callee
		var codeBoxCode = '<%= microtask.getEscapedCalleeFullDescription() %>';
		
		var editorCode = '<%=functionCode%>';
		var functionName = '<%= microtask.getCaller().getName() %>';
		var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
		var highlightPseudoCall = '//!<%= microtask.getEscapedPseudoCall() %>';
		    
   		$(document).ready(function() 
   		{
   			setupReadonlyCodeBox(readonlyCodeBox);
   			
   			$('#skip').click(function() { skip(); });
   			
   			$('#writeCallForm').submit(function() {
				var result = checkAndCollectCode();
				if (!result.errors)
					submit(result.code);
   				return false;
   			});
   		});	    
	</script>

	<form id="writeCallForm" action="">
		<%@include file="/html/elements/microtaskTitle.jsp" %>
		The crowd found the following function for the <span class="highlightPseudoCall">
		   pseudocall below</span>:<BR><BR>
		<div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div><BR>
		
		Can you replace the pseudocall with a call to this function, or find another way to do it?
		<BR><BR>
		
		<%@include file="/html/elements/typeBrowser.jsp" %>		
		<%@include file="/html/elements/functionEditor.jsp" %>		
		<%@include file="/html/elements/submitFooter.jsp" %>
	</form>
</div>