<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="com.google.appengine.api.users.User"%>
<%@ page import="com.google.appengine.api.users.UserService"%>
<%@ page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@ page import="com.crowdcoding.artifacts.Project"%>
<%@ page import="com.crowdcoding.Worker"%>
<%@ page import="com.crowdcoding.microtasks.MachineUnitTest"%>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil"%>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper"%>
<%@ page import="java.io.StringWriter"%>
<%@ page import="java.io.Writer"%>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
	Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
	MachineUnitTest microtask = (MachineUnitTest) crowdUser.getMicrotask();
	ObjectMapper mapper = new ObjectMapper();
	Writer strWriter = new StringWriter();
	// get all test cases in system
	mapper.writeValue(strWriter, microtask.getAllTestCodeInSystem());
	String testCases = strWriter.toString();
	// get all active functions
	String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllActiveFunctions(null, project) + "'";
%>

<body>
	<div id="microtask">
		<script src="/include/codemirror/codemirror.js"></script>
		<script src="/include/codemirror/javascript.js"></script>
		<script src="/include/bootbox.min.js"></script>
		<script src="/include/jslint.js"></script>
		<script src="/html/errorCheck.js"></script>
		<script src="/include/spin.js"></script>
		<script>
			window.onerror = function(err, url, lineNumber) {  
			// todo: on error need to get the test case number that caused error 
			 //save error and send to server for example.
			console.log(err);
	};  
	</script>
	<script>
		var microtaskType = 'MachineUnitTest';
		var microtaskID = <%= microtask.getID() %>;
		var testCaseNumberThatFailed = -1;
	    var javaTestCases = new Array();
	    $("#machineSubmit").children("input").attr('disabled', 'false');
		$('#machineSubmit').submit(function() {
			debugger;
			if($("#machineSubmit").children("input").attr('disabled') == 'disabled')
			{
				return false;
			}
			submit(collectFormDataForNormal(testCaseNumberThatFailed));
			return false;
		});
		
		
		function test1(isFirstTime)
		{
			debugger;
			javaTestCases = <%=testCases%>;
			runUnitTests(javaTestCases,"TEST 1",isFirstTime);
		}

	function runUnitTests(arrayOfTests, functionName,isFirstTime)
	{
		debugger;
		var resultOfTest = new Array(); 
		var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
		for(var p = 0; p < arrayOfTests.length; p++)
		{
			if(arrayOfTests[p] == "")
			{
				continue;
			}
			var lintCheckFunction = "function printDebugStatement (){} " + allTheFunctionCode;
			var lintResult = JSLINT(lintCheckFunction,getJSLintGlobals());
			var errors = checkForErrors(JSLINT.errors);
			console.log(errors);
			// no errors by jslint
			if(errors == "")
			{
				var testCases = "test('" + functionName + "', function() {";
				// constructs the function header and puts code  from the above code window
				testCases += allTheFunctionCode;
				testCases += arrayOfTests[p];
				testCases+= "});";
				QUnit.log = function(result, message)
				{
					if(!result.result)
					{
						testCaseNumberThatFailed = p;
					}
					debugger;
				}
			
				try
				{
				eval(testCases);
				}
				catch (err)
				{
					testCaseNumberThatFailed = p;
				}
			}
			else
			{
			// jslint found errors
			testCaseNumberThatFailed = p;
			}
		}
		$("#machineSubmit").children("input").removeAttr("disabled");
		$("#machineSubmit").children("input").click();
	}
	
	
	function collectFormDataForNormal(testCaseThatFailed)
	{
			var formData = { errorTestCase: testCaseThatFailed};
			return formData;
	}
</script>
<div style = 'display:none'>
		<form id="machineSubmit" action="">
			<input id="codeSubmit" type="submit" value="Submit"
				class="btn btn-primary" />

		</form>
		</div>
	<script>
    	debugger;
	 	test1(true);
	 </script>
<div style= 'margin-top:30%;' id = 'foo' > </div>

<script>
var opts = {
  lines: 15, // The number of lines to draw
  length: 7, // The length of each line
  width: 4, // The line thickness
  radius: 10, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 49, // The rotation offset
  color: '#000', // #rgb or #rrggbb
  speed: 0.7, // Rounds per second
  trail: 88, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};
var target = document.getElementById('foo');
var spinner = new Spinner(opts).spin(target);

</script>
<div class="modal-backdrop fade in"></div>
</body>
</html>