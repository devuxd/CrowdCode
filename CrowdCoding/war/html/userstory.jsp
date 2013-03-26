<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteUserStory" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteUserStory microtask = (WriteUserStory) crowdUser.getMicrotask();
%>


<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
	
		var microtaskType = 'writeuserstory';
		var microtaskID = <%= microtask.getID() %>;
	
      	$('document').ready(function(){
		  	$('#userstoryForm').submit(function() { submit({ text: $("#userStory").val() }); return false; });
		  	$('#skip').click(function() { skip(); });
      	});
	</script>


	<%@include file="/html/elements/microtaskTitle.jsp" %>
	<p><h5>Imagine a traffic officer's mobile management system.
	<br><BR>What is a single scenario that a user might wish to do with it?
		How specifically and thoroughly can you describe it? </h5></p>

	<form id="userstoryForm" action="">
		<textarea name="userStory" id="userStory"></textarea>
		<%@include file="/html/elements/submitFooter.jsp" %>
	</form>


</div>