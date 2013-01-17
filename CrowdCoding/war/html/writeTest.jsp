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
    Project project = Project.Create();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    WriteTest microtask = (WriteTest) crowdUser.getMicrotask();
    ObjectMapper mapper = new ObjectMapper();
    String description = microtask.getDescription();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    Writer strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getFunctionHeader());
    String functionHeader = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getCode());
    String functionCode = strWriter.toString();
%>



<div id="microtask">
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script src="/include/jslint.js"></script>
	<script src="/html/errorCheck.js"></script>
	<script>
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setOption("theme", "vibrant-ink");
	
		$('#testForm').submit(function() {
			 var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			var functionCode = "test('" + "functionCoder" + "', function() {" + functionHeader + "{"  + <%= functionCode %> + "}" + $("#code").val() + "});";
			var errors = "";
		    console.log(functionCode);
		    var jQueryLint = "/*global window: false, document: false, $: false, log: false, bleep: false, QUnit: false, test: false, asyncTest: false, expect: false,module: false,ok: false,equal: false,notEqual: false,deepEqual: false,notDeepEqual: false,strictEqual: false,notStrictEqual: false,raises: false,start: false,stop: false*/";
		    var lintResult = JSLINT(jQueryLint + functionCode,{nomen: true, sloppy: true, white: true, debug: true, evil: false, vars: true ,stupid: true});
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
			    url: '/submit?type=writetest&id=<%= microtask.getID() %>'
			}).done( function (data) { loadMicrotask();	});
							
			return false;
		});
	</script>


<h4>
	We are writing the following function: </br> <%= methodFormatted %></br>
Write a unit test for the following test case: <%= description %></br>
</br>
Reference Section:</br></br>
Assertions you can use when writing unit tests include: </br>
deepEqual( actual, expected, message ): comparing to objects </br>
equal( actual, expected, message ): check if both are equal </br>
notDeepEqual( actual, expected, message ): </br>
notEqual( actual, expected, message ): </br>
notStrickEqual( actual, expected, message ): </br>
ok( actual, expected, message ): boolean assertion </br>
strictEqual( actual, expected, message ): strict type and value comparision</br>
throws( actual, expected, message ): if exception is expected </br>

Examples:</br></br>
equal(price, qty*itemCost, "line item price looks incorrect");</br>
equal(plus(5, 3), 8, "Two positive numbers don't sum correctly");
</h4>
	
	
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
	<input type="submit" value="Submit" class="btn btn-primary"/>
	
	</form>
	<div id = "errors"> </div>
</div>