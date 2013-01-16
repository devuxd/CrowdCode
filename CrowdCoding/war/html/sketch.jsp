<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.SketchFunction" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>
<%
    Project project = Project.Create();
    ObjectMapper mapper = new ObjectMapper();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    SketchFunction microtask = (SketchFunction) crowdUser.getMicrotask();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());;
    StringWriter strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getFunctionHeader());
    String functionHeader = strWriter.toString();
%>



<div id="microtask">
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script src="/include/jslint.js"></script>
	<script src="/html/errorCheck.js"></script>
	<script>
	    	var myCodeMirror = CodeMirror.fromTextArea(code);
	   	 	myCodeMirror.setOption("theme", "vibrant-ink");

		$('#sketchForm').submit(function() {
		    var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			var functionCode = functionHeader + "{"  + $("#code").val() + "}";
			var errors = "";
		    console.log(functionCode);
		    var lintResult = JSLINT(functionCode,{nomen: true, sloppy: true, white: true, debug: true, evil: false, vars: true ,stupid: true});
			console.log(JSLINT.errors);
			if(!lintResult)
			{
				var errors = checkForErrors(JSLINT.errors);
				console.log(errors);
				if(errors != "")
				{
					$("#errors").html("<bold> ERRORS: </bold> </br>" + errors);
					return false; 
				}
			}
			var formData = { code: $("#code").val() };
			$.ajax({
			    contentType: 'application/json',
			    data: JSON.stringify( formData ),
			    dataType: 'json',
			    type: 'POST',
			    url: '/submit?type=sketchfunction&id=<%= microtask.getID() %>'
			}).done( function (data) { loadMicrotask();	});
							
			return false;
		});
	</script>


	<p><h4> <%= methodFormatted %><BR>

Your mission is to implement the following function. You can implement the whole function or you can write pseudocode [warning: not yet!].
Flag pseudocode by starting a line with the octothorpe '#', comment with //.
If your method is not done, make sure one of your lines starts with # so it is not flagged as complete!</h4>
	
	
	<form id="sketchForm" action="">



	<BR>
	

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
	<div id = "errors"> </div>

</div>