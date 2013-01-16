<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.DisputeUnitTestFunction" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>

<%
    Project project = Project.Create();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
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
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script src="/include/jslint.js"></script>
	<script src="/html/errorCheck.js"></script>
	<script>
		debugger;
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    console.log(<%= unitTests %>);
	    myCodeMirror.setValue(<%= unitTests %>);
	    myCodeMirror.setOption("theme", "vibrant-ink");
		//myCodeMirror.setValue("<%= unitTests.replaceAll("[\t\n\\x0B\f\r]","") %>");
		//myCodeMirror.setValue(myCodeMirror.getValue().replace(/;/g,";\n"));
		
		$('#testForm').submit(function() {
			var equal
		 	var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			var functionCode = functionHeader + "{"  + <%= functionCode %> + "}" + $("#code").val();
			var errors = "";
		    console.log(functionCode);
		    var jQueryLint = "/*global window: false, document: false, $: false, log: false, bleep: false, QUnit: false, test: false, asyncTest: false, expect: false,module: false,ok: false,equal: false,notEqual: false,deepEqual: false,notDeepEqual: false,strictEqual: false,notStrictEqual: false,raises: false,start: false,stop: false*/";
		    var lintResult = JSLINT(jQueryLint + functionCode,{nomen: true, sloppy: true, white: true, debug: true, evil: false, vars: true ,stupid: true, equal: false});
			debugger;
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
			    url: '/submit?type=disputeunittestfunction&id=<%= microtask.getID() %>'
			}).done( function (data) { loadMicrotask();	});
							
			return false;
		});
	</script>


	<h4>
	DIPUTED TASK
	</br>
	This unit test suite was disputed for the following reason:
	</br>
	<%= disputeDescription %>
	</br>
	</br>
	
	
	Unit tests can be: 	</br>
	deepEqual: comparing to objects </br>
	equal: check if both are equal </br>
	notDeepEqual: </br>
	notEqual: </br>
	notStrickEqual: </br>
	ok: boolean assertion </br>
	strictEqual: strict type and value comparision</br>
	throws: if exception is expected </br>
	</br>
	A sample test has form:</br>
	( actual, expected, message )</br>
	Please place code you write in the message:</br>
	example: equal(1,'1',"equal 1,'1'");</br>
	</p></br>
	<h4> Write a unit test for the following method:
	
	
	
	<form id="testForm" action="">



	<BR>
	
	<%= methodFormatted %>
	<BR>{</h4>
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR> </h4>
	<input type="submit" value="Submit" class="btn btn-primary"/>
	
	</form>
	<div id = "errors"> </div>
</div>