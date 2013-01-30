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


	<p><h4>We are writing an application for calculating traffic tickets.
	<br>What is a single scenario that a user might wish to do with the application?
		How precisely and thoroughly can you describe it? </h4></p>

	<form id="userstoryForm" action="">
		<textarea name="userStory" id="userStory"></textarea>
		<input class="btn btn-primary" type="submit" value="Submit" />
	</form>


</div>