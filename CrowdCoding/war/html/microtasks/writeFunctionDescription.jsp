<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.entities.Project" %>
<%@ page import="com.crowdcoding.entities.Worker" %>
<%@ page import="com.crowdcoding.entities.Function" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.crowdcoding.entities.microtasks.WriteFunctionDescription" %>

<%
String projectID = (String) request.getAttribute("project");
Project project = Project.Create(projectID);
Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
WriteFunctionDescription microtask = (WriteFunctionDescription) this.getServletContext().getAttribute("microtask");    

Function caller = microtask.getCaller();
String allFunctionCodeInSystem = FunctionHeaderUtil.getDescribedFunctionHeaders(null, project);
%>


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
    	
 		$('#skipBtn').click(function() { skip(); });
 			
		$("#taskForm").submit(function(){
			if (validateAll(false))
				submit(collectSignatureData());	
			else					
				$("#popUpErrors").modal();
			
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


<div id="taskDescription" class="bg-success">
	Can you write a description for a function that<BR>
	<strong><%= microtask.getCallDescription() %></strong><BR>	
	
	<a id="showContext" data-toggle="collapse" data-target="#callContext">Show context</a> 
	<div id="callContext" class="collapse"><div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div></div>
	
	
	<%@include file="/html/elements/typeBrowser.jsp" %><BR>
</div>

<form id="taskForm" action="#">
	<div class=" bg-warning">
		<%@include file="/html/elements/signatureEditor.jsp" %>
	</div>
	<br />
	
	<%@include file="/html/elements/microtaskFormButtons.jsp"%>
</form>

<!-- Popup -->
<div id="popUpErrors" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<span>Please, fix the listed errors!</span>
				<button type="button" class="close" data-dismiss="modal">X</button>
			</div>
			<div class="modal-footer">
			    
			</div>	
		</div>
	</div>
</div>