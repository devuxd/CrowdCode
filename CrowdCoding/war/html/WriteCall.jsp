<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteCall" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteCall microtask = (WriteCall) crowdUser.getMicrotask();
    String calleeFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getCallee());
%>


<div id="microtask">
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script>
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    
	    myCodeMirror.setValue("<%= microtask.getCaller().getEscapedCode().replaceAll("[\t\n\\x0B\f\r]","") %>");
	    myCodeMirror.setValue(myCodeMirror.getValue().replace(/;/g,";\n"));
	    
	    myCodeMirror.setOption("theme", "vibrant-ink");
	
		$('#writeCallForm').submit(function() {
			var formData = { code: $("#code").val() };
			$.ajax({
			    contentType: 'application/json',
			    data: JSON.stringify( formData ),
			    dataType: 'json',
			    type: 'POST',
			    url: '/<%=projectID%>/submit?type=WriteCall&id=<%= microtask.getID() %>'
			}).done( function (data) { loadMicrotask();	});
							
			return false;
		});
	</script>


	<form id="writeCallForm" action="">
		<p><h4> Replace the psuedocode with an actual call to the function: </h4> <BR>	
		<%= calleeFormatted %>
	
		<BR>{
		<table width="100%">
			<tr>
				<td width = "20"></td>
				<td><textarea id="code"></textarea></td>
			</tr>	
		</table>
		} <BR><BR>
		<input type="submit" value="Submit" class="btn btn-primary"/>	
	</form>

</div>