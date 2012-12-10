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
				var formData = { text: $("#userStory").val() }
				$.ajax({
				    contentType: 'application/json',
				    data: JSON.stringify( formData ),
				    dataType: 'json',
				    type: 'POST',
				    url: '/submit?type=writeuserstory&id=<%= microtask.getID() %>',
				}).done( function (data) { loadMicrotask();	});

			  	return false; 	// disable default submit behavior
			});
      });
	</script>


	<p><h4>We are working together to make the following application: app description. [description provided by application sponsor: us or client]
What is something a user might want to do with this application?
Please be as descriptive and thorough as possible, as this is all the information all the other users will have to create the program.</h4></p>

	<form id="userstoryForm" action="">
		<textarea name="userStory" id="userStory"></textarea>
		<input class="btn btn-primary" type="submit" value="Submit" />
	</form>


</div>