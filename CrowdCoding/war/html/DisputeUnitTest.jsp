<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.DisputeUnitTestFunction" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>

<%
    String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    ObjectMapper mapper = new ObjectMapper();
    Writer strWriter = new StringWriter();
    DisputeUnitTestFunction microtask = (DisputeUnitTestFunction) crowdUser.getMicrotask();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getFunctionHeader());
    String functionHeader = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getCode());
    String functionCode = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getTestCode());
    String unitTests = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getDescription());
    String disputeDescription = strWriter.toString();
    System.out.println(unitTests);
    System.out.println(unitTests.replaceAll("[\t\n\\x0B\f\r]",""));
%>

<div id="microtask">
	<script src="/html/assertionFunctions.js"></script>
	<script>
		debugger;
		
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		
		var microtaskType = 'disputeunittestfunction';
		var microtaskID = <%= microtask.getID() %>;
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    console.log(<%= unitTests %>);
	    myCodeMirror.setValue(<%= unitTests %>);
	    myCodeMirror.setOption("theme", "vibrant-ink");
		//myCodeMirror.setValue("<%= unitTests.replaceAll("[\t\n\\x0B\f\r]","") %>");
		//myCodeMirror.setValue(myCodeMirror.getValue().replace(/;/g,";\n"));
		
		$('document').ready(function()
		{
			$('#skip').click(function() { skip(); });
		});    	
		
		$('#testForm').submit(function() {
			var equal
		 	var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			var functionCode = functionHeader + "{"  + <%= functionCode %> + "}" + $("#code").val();
			var errors = "";
		    console.log(functionCode);
		    var lintResult = JSHINT(getUnitTestGlobals() + functionCode,getJSHintGlobals());
			console.log(JSHINT.errors);
			if(!lintResult)
			{
				var errors = checkForErrors(JSHINT.errors);
				console.log(errors);
				if(errors != "")
				{
					$("#errors").html("<bold> ERRORS: </bold> </br>" + errors);
					return false; 
				}
			}
						
			submit({ code: $("#code").val() });
			return false;
		});
	</script>

	<%@include file="/html/elements/microtaskTitle.jsp" %>
	<br>
	The following issue was reported with this unit test:
	
	<blockquote><%= disputeDescription %></blockquote>
	
	Can you fix the test to address this issue?<BR><BR>
			
	<span class="reference">
	<b>Reference</b><BR>
	Unit tests can be: 	<br>
	deepEqual: comparing to objects <br>
	equal: check if both are equal <br>
	notDeepEqual: <br>
	notEqual: <br>
	notStrickEqual: <br>
	ok: boolean assertion <br>
	strictEqual: strict type and value comparision<br>
	throws: if exception is expected <br>
	<br>
	A sample test has form:<br>
	( actual, expected, message )<br>
	Please place code you write in the message:<br>
	example: equal(1,'1',"equal 1,'1'");<br>
	<br>
	</span>
	

	
	<form id="testForm" action="">

	<BR>
	
	<%= methodFormatted %>
	<BR>{
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR></h4>
	<%@include file="/html/elements/submitFooter.jsp" %>
	
	</form>
	<div id = "errors"> </div>
</div>
