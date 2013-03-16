<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteTest" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteTest microtask = (WriteTest) crowdUser.getMicrotask();
    ObjectMapper mapper = new ObjectMapper();
    String description = microtask.getDescription();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllActiveFunctionsHeader(microtask.getFunction(), project) + "'";
    Writer strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getFunctionHeader());
    String functionHeader = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getCode());
    String functionCode = strWriter.toString();
        strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.generateDefaultUnitTest());
    String defaultVariable = strWriter.toString();
%>



<div id="microtask">
	<script>
		var microtaskType = 'writetest';
		var microtaskID = <%= microtask.getID() %>;	
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setOption("theme", "vibrant-ink");
		debugger;
	    myCodeMirror.setValue(<%=defaultVariable%>);
	    
   		$(document).ready(function() 
   		{
   			$('#skip').click(function() { skip(); });	
   		});	    
	
		$('#testForm').submit(function() {
			 var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			// only looks at the function header not the function body for JSLINT checking
			var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
			var functionCode = "test('" + "functionCoder" + "', function() {" + allTheFunctionCode + " " + functionHeader + "{" + "}" + $("#code").val() + "});";
			var errors = "";
		    console.log(functionCode);
		    var lintResult = JSLINT(getUnitTestGlobals() + functionCode,getJSLintGlobals());
		    console.log(JSLINT.errors);
			if(!lintResult)
			{
				var errors = checkForErrors(JSLINT.errors);
				console.log(errors);
				if(errors != "")
				{
					$("#errors").html("<bold> ERRORS: </bold> <br />" + errors);
					return false; 
				}
			}
			
			submit({ code: $("#code").val() });			
			return false;
		});
	</script>


<h5>
	We are writing the following function: <br /> <%= methodFormatted %><br />
Write a unit test for the following test case:</h5>
<h4>
<%= description %>
</h4><BR>
<span class="reference">
Reference Section:<br /><br />
Assertions you can use when writing unit tests include: <br />
deepEqual( actual, expected, message ): comparing to objects <br />
equal( actual, expected, message ): check if both are equal <br />
notDeepEqual( actual, expected, message ): <br />
notEqual( actual, expected, message ): <br />
throws( actual, expected, message ): if exception is expected <br />
<br />
Examples:<br />
equal(price, qty*itemCost, "line item price looks incorrect");<br />
equal(plus(5, 3), 8, "Two positive numbers don't sum correctly");
</span>
	
	
<form id="testForm" action="">



	<BR>
	

	<BR>{
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR>
	<%@include file="/html/elements/submitFooter.jsp" %>
	
	</form>
	<div id = "errors"> </div>
</div>
