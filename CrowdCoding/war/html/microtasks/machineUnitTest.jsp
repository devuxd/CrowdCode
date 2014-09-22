<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="com.google.appengine.api.users.User"%>
<%@ page import="com.google.appengine.api.users.UserService"%>
<%@ page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@ page import="com.crowdcoding.Project"%>
<%@ page import="com.crowdcoding.Worker"%>
<%@ page import="com.crowdcoding.microtasks.MachineUnitTest"%>
<%@ page import="com.crowdcoding.artifacts.Test"%>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil"%>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper"%>
<%@ page import="java.io.StringWriter"%>
<%@ page import="java.io.Writer"%>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
	Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
	MachineUnitTest microtask = (MachineUnitTest) this.getServletContext().getAttribute("microtask");
	ObjectMapper mapper = new ObjectMapper();
	Writer strWriter = new StringWriter();
	// get all test cases in system
	mapper.writeValue(strWriter, microtask.getAllTestCodeInSystem());
	String testCases = strWriter.toString();
	// get all active functions
	String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllFunctionsMocked(null, project) + "'";
	String allFunctionCodeInSystemHeader = "'" + FunctionHeaderUtil.getDescribedHeadersAndMocks(null, project) + "'";
%>

<body>
	<div id="microtask">
		<script src="/include/bootbox.min.js"></script>
		<script src="/include/spin.js"></script>
		<script src='/js/instrumentFunction.js'></script>
		
<script>
	window.onerror = function(err, url, lineNumber) {  
		// todo: on error need to get the test case number that caused error 
		 //save error and send to server for example.
		console.log(err);
	};  
</script>
<script>
	var timeOutTime = 1500;
	var microtaskType = 'MachineUnitTest';
	var microtaskID = <%=microtask.getID()%>;
    var javaTestCases = <%=testCases%>;
    var allPassedTestCases = new Array();
    var allFailedTestCases = new Array();
	var allTheFunctionCode = <%=allFunctionCodeInSystemHeader%> + <%=allFunctionCodeInSystem%>;
    
	var mocks = {};
	var mockData = JSON.parse('<%= Test.allMocksInSystemEscaped(project) %>');
	loadMocks(mockData.mocks);
	
	var worker;
	var testRunTimeout;
	var p = 0;
    
    $("#machineSubmit").children("input").attr('disabled', 'false');
	$('#machineSubmit').submit(function() {
		debugger;
		if($("#machineSubmit").children("input").attr('disabled') == 'disabled')
		{
			return false;
		}
		submit(collectFormDataForNormal(allFailedTestCases));
		return false;
	});
		
	function test1(isFirstTime)
	{
		runTest(p);
	}
					
	function finishTesting()
	{		
		$("#machineSubmit").children("input").removeAttr("disabled");
		$("#machineSubmit").children("input").click();
	}
	
	function runTest(p)
	{
		// If we've run out of tests
		if (p >= javaTestCases.length)
			finishTesting();
		
		javaTestCases[p] = javaTestCases[p].replace(/\n/g,"");

		var extraDefs = "var mocks = {}; function hasMockFor(){} function printDebugStatement (){} ";		
		var lintCheckFunction = extraDefs + allTheFunctionCode + javaTestCases[p];
		console.log("MachineUnitTest linting on: " + lintCheckFunction);
		var lintResult = JSHINT(getUnitTestGlobals()+lintCheckFunction,getJSHintGlobals());
		var errors = checkForErrors(JSHINT.errors);
		console.log("errors: " + JSON.stringify(errors));
		
		var testResult;
		
		if(errors == "")
		{
			testRunTimeout = setTimeout(function(){stopTest(p);},1000);

			var testCases = allTheFunctionCode + javaTestCases[p];

			// call the worker with test cases
			window.URL = window.URL || window.webkiURL;
		    var blob = new Blob([document.querySelector('#worker1').textContent]);
		    worker = new Worker(window.URL.createObjectURL(blob));
		    worker.onmessage = function(e) 
		    {
			    clearTimeout(testRunTimeout);					    	
			    console.log("Received: " + e.data);
				processTestFinished(false, e.data);
		    }
		    
			// load the script and start the worker
			worker.postMessage({url: document.location.origin});					
			worker.postMessage({number: p, testCase: testCases, mocks: mocks});			
		}
		else
		{
			// jshint found errors
			testCaseNumberThatFailed = p;
			console.log(testCaseNumberThatFailed);
			allFailedTestCases.push(testCaseNumberThatFailed);
			
			p++;
			runTest(p);	
		}
	}
	
	function stopTest()
	{
		console.log("Hit timeout in MachineUnit test on test " + p);
		
		worker.terminate();
		processTestFinished(true, null);
	}
		
	function processTestFinished(testStopped, testResult)
	{
		// If the code is unimplemented, the test neither failed nor passed. If the test
		// did not pass or timed out, it failed. Otherwise, it passed.
		if(!testResult.codeUnimplemented)
		{
			if (testStopped || !testResult.passed)
				allFailedTestCases.push(p);
			else
				allPassedTestCases.push(p);
		}
		
		// Increment the test and run the next one.
		p++;
		runTest(p);		
	}
		
	function collectFormDataForNormal()
	{
			var formData = { passingTestCases: allPassedTestCases, failingTestCases: allFailedTestCases };
			return formData;
	}
</script>
		<div style='display: none'>
			<form id="machineSubmit" action="">
				<input id="codeSubmit" type="submit" value="Submit" class="btn btn-primary" />
			</form>
		</div>
		<script>

	 	test1(true);
	 </script>
		<div style='margin-top: 30%;' id='foo'></div>

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


<script id="worker1" type="javascript/worker">
    // This script won't be parsed by JS engines because its type is javascript/worker.
    var testCasedPassed = true;
	var codeUnimplemented = false;		// is any of the code under test unimplemented?
    self.onmessage = function(e) 
    {
    	var data = e.data;
 		if (data.url)
		{
			    var url = data.url;
			    var index = url.indexOf('index.html');
			    if (index != -1)
			     {
			      url = url.substring(0, index);
			     }
			    importScripts(url + '/js/assertionFunctions.js');
			    importScripts(url + '/js/instrumentFunction.js');
		 }
		 else
		 {
		   		// Rest of your worker code goes here.
				try
				{
					var finalCode = 'var mocks = ' + JSON.stringify(data.mocks) + '; ' + data.testCase;
					eval(finalCode);
					for(var index = 0; index < results.length; index++)
					{
						//self.postMessage("this is from worker" + results[index].message + " " + results[index].actual + results[index].expected + results[index].result + "is it passed" + testCasedPassed);
						if(!results[index].result)
						{
							//self.postMessage("this is from worker ERROR" + results[index].message + " " + results[index].actual + results[index].expected + results[index].result + "is it passed" + testCasedPassed);
							testCasedPassed = false;
							break;
						}
					}
				}
				catch (err)
				{
					testCasedPassed = false;
					if (err instanceof NotImplementedException)					
						codeUnimplemented = true;	

				}
				self.postMessage({number:data.number, passed:testCasedPassed, codeUnimplemented: codeUnimplemented});
		 }
   };
  </script>

		<div class="bootbox modal fade in" tabindex="-1"
			style="overflow: hidden;" aria-hidden="false">
			<div class="modal-body">Unit Tests are Running Please Wait</div>
		</div>
		<div class="modal-backdrop fade in"></div>
</body>
</html>