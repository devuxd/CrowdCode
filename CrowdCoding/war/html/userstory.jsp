<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteUserStory" %>

<%
    Project project = Project.Create();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    WriteUserStory microtask = (WriteUserStory) crowdUser.getMicrotask();
%>


<div id="microtask">
	<script>
      $('document').ready(function(){
		  $('#userstoryForm').submit(function() {
				var formData = { id: <%= microtask.getID() %>, text: $("#userStory").val() }
				$.ajax({
				    contentType: 'application/json',
				    data: JSON.stringify( formData ),
				    dataType: 'json',
				    type: 'POST',
				    url: '/submit/userstory'
				}).done( function (data) 
						{ alert('request succeeded');
						    $('#contentPane').load('/fetch');
						});

			  	return false; 	// disable default submit behavior
			});
      });
	</script>


	<p><h3>This is the user story phase. Have a program you would like to create in mind, and write the 
	specifications here. Please be as descriptive and thorough as possible, as this is all the information all
	the other users will have to create the program.</h3></p>

	<form id="userstoryForm" action="">
		<textarea name="userStory" id="userStory"></textarea>
		<input type="submit" value="Submit" />
	</form>


</div>