<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteEntrypoint" %>

<%
    Project project = Project.Create();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    WriteEntrypoint microtask = (WriteEntrypoint) crowdUser.getMicrotask();
%>

<div id="microtask">
	<script>
		var nextParam = 2;
	
	    $(document).ready(function()
		{
			$("#addParameter").click(function()
			{
				$("#addParamRow").before('<tr id="params' + nextParam + '"><td></td><td>' +						
					    '<input type="text" value = "param1" class="input-small">,&nbsp;&nbsp;//' + 
						'&nbsp;<input type="text" value = "type" class="input-small">&nbsp;&nbsp;-&nbsp;&nbsp;' + 
						'<input type="text" value = "what is it for?" class="input-xlarge"> ' +	
						'<a href="#" onclick="deleteParams(\'#params' + nextParam + '\')" class="closeButton">x</a>' +	
						'</td>');
				nextParam++;
				return false;
			});
			
			$("#entrypointsForm").submit(function()
			{
				var formData = collectFormData();
				$.ajax({
				    contentType: 'application/json',
				    data: JSON.stringify( formData ),
				    dataType: 'json',
				    type: 'POST',
				    url: '/submit?type=writeentrypoint&id=<%= microtask.getID() %>'
				}).done( function (data) { loadMicrotask();	});
								
				return false;
			});
			
			
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
		
	<h4> We are working together to make the following application: app descrpition.
Here’s a user story: user story.
To make this happen, a function must be called to do the action.
What should that function be called?
When (under what conditions) should it be called? What event should trigger this function (dropdown)? [should that be a separate microtask?]
What parameters does it need? What will it return?
For each parameter or return type, please also specify its type and what it means (to guide somebody trying to interpret it).  </h4>
	
	<form id="entrypointsForm" action="">
		<textarea id="functionDescription" draggable="true">What does the function do?</textarea>
		returns &nbsp;&nbsp;<input type="text" id="returnType" value = "void" class="input-medium"><BR>
		<input type="text" id="event" value="$(document).ready(" class="input-large">
		function 
		<input type="text" id="name" value = "functionName" class="input-medium">(
		<BR>
		<table>
			<tr id="params1">
				<td width="20">
				<td>
					<input type="text" value = "param1" class="input-small">,&nbsp;&nbsp;// 
					<input type="text" value = "type" class="input-small">&nbsp;&nbsp;-&nbsp; 
					<input type="text" value = "what's it for?" class="input-xlarge">
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
		<input type="submit" value="Submit" class="btn btn-primary"/>
	</form>	

</div>