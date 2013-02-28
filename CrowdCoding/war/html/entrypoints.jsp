<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteEntrypoint" %>
<%@ page import="com.crowdcoding.artifacts.UserStory" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteEntrypoint microtask = (WriteEntrypoint) crowdUser.getMicrotask();
    UserStory userStory = microtask.getEntrypoint().getUserStory();
%>

<div id="microtask">
	<script>
		var microtaskType = 'writeentrypoint';
		var microtaskID = <%= microtask.getID() %>;
		var nextParam = 2;
	
	    $(document).ready(function()
		{
			$("#addParameter").click(function()
			{
				$("#addParamRow").before('<tr id="params' + nextParam + '"><td></td><td>' +						
					    '<input type="text" placeholder = "paramName" class="input-small">,&nbsp;&nbsp;//' + 
						'&nbsp;<input type="text" placeholder = "type" class="input-small">&nbsp;&nbsp;-&nbsp;&nbsp;' + 
						'<input type="text" placeholder = "what is it for?" class="input-xlarge"> ' +	
						'<a href="#" onclick="deleteParams(\'#params' + nextParam + '\')" class="closeButton">x</a>' +	
						'</td>');
				nextParam++;
				return false;
			});
			
			$("#entrypointsForm").submit(function() { submit(collectFormData()); return false; });
		  	$('#skip').click(function() { skip(); });			
		});
	        
	    $("input[type=text]").focus(function(){
	        // Select field contents
	        this.select();
	    });
	      
		function deleteParams(params)
		{
			$(params).remove();
		}
		
		function collectFormData()
		{
			var formData = { name: $("#name").val(),
						     description: $("#functionDescription").val(),
						     returnType: $("#returnType").val(),
					         event: $("#event").val(),
						     parameters: [] };			
		    $("tr[id^=params]").each(function(){	    		    	
		    	formData.parameters.push( { name: $(this).find("input").eq(0).val(), 
		    								 type: $(this).find("input").eq(1).val(),
		    								 description: $(this).find("input").eq(2).val() });
		    });
		    return formData;
		}
	</script>
		
	<h5> Consider the following user scenario: <BR><BR> <%=userStory.getText() %><BR><BR>
	What framework event should be used to initially trigger this user scenario to occur? What should the function
	that listens for this event do, and what parameters does it require?</h5><BR>
	
	<form id="entrypointsForm" action="">
		<textarea id="functionDescription" draggable="true" placeholder="What does the function do?"></textarea>
		returns &nbsp;&nbsp;<input type="text" id="returnType" value = "void" class="input-medium"><BR>
		<input type="text" id="event" value="$(document).ready(" class="input-large">
		function 
		<input type="text" id="name" placeholder = "functionName" class="input-medium">(
		<BR>
		<table>
			<tr id="params1">
				<td width="20">
				<td>
					<input type="text" placeholder = "paramName" class="input-small">,&nbsp;&nbsp;// 
					<input type="text" placeholder = "type" class="input-small">&nbsp;&nbsp;-&nbsp; 
					<input type="text" placeholder = "what's it for?" class="input-xlarge">
					<!--  <button class="close" onclick="deleteParams('#params1')">&times;</button> -->
					<a href="#" onclick="deleteParams('#params1')" class="closeButton">x</a>		
				<td>
			<tr>
			<tr id="addParamRow">
				<td></td>					
				<td><button id="addParameter" class="btn btn-small">Add parameter</button></td>			
			</tr>
		</table>
		);
		<BR>	
		<BR>	
		<%@include file="/html/elements/submitFooter.jsp" %>
	</form>	

</div>