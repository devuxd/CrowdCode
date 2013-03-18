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
	Worker crowdUser = Worker.Create(UserServiceFactory
			.getUserService().getCurrentUser(), project);
	MachineUnitTest microtask = (MachineUnitTest) crowdUser
			.getMicrotask();
	ObjectMapper mapper = new ObjectMapper();
	Writer strWriter = new StringWriter();
	// get all test cases in system
	mapper.writeValue(strWriter, microtask.getAllTestCodeInSystem());
	String testCases = strWriter.toString();
	// get all active functions
	String allFunctionCodeInSystem = "'"
			+ FunctionHeaderUtil.getAllActiveFunctions(null, project)
			+ "'";
%>

<body>
	<div id="microtask">
		<script src="/include/bootbox.min.js"></script>
		<script src="/include/spin.js"></script>
		
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
	    var javaTestCases = new Array();
	    var allFailedTestCases = new Array();
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
			debugger;
			javaTestCases = <%=testCases%>;
			runUnitTests(javaTestCases,"TEST 1",isFirstTime);
		}

 					
	function runUnitTests(arrayOfTests, functionName,isFirstTime)
	{
		debugger;
		var allTheFunctionCode = <%=allFunctionCodeInSystem%>;
		// set interval so only run it once per 1500 milliseconds
		var p = 0;
		var myInterval = setInterval(function(){
			if(arrayOfTests[p] != "")
			{
				arrayOfTests[p] = arrayOfTests[p].replace(/\n/g,"");
				var timedOut = true;
				//console.log(arrayOfTests);
				var lintCheckFunction = "function printDebugStatement (){} " + allTheFunctionCode + arrayOfTests[p];
				var lintResult = JSLINT(getUnitTestGlobals()+lintCheckFunction,getJSLintGlobals());
				var errors = checkForErrors(JSLINT.errors);
				var isTestCasePassed = false;
				console.log(errors);
				// no errors by jslint
				if(errors == "")
				{
					var testCases = "";
					// constructs the function header and puts code  from the above code window
					testCases += allTheFunctionCode;
					testCases += arrayOfTests[p];
					// call the worker with test cases
					window.URL = window.URL || window.webkiURL;
				    var blob = new Blob([document.querySelector('#worker1').textContent]);
				    var worker = new Worker(window.URL.createObjectURL(blob));
				    var done = false;
				    worker.onmessage = function(e) {
				      console.log("Received: " + e.data);
					  isTestCasePassed = e.data;
					  timedOut = false;
					  console.log(e.data);
				    }
				    // var b = "hello there";
				    // worker.postMessage(b); // Start the worker.
				
					function stop()
					{
						worker.terminate();
					}
					// load the script
					worker.postMessage({url: document.location.origin});
					// load the test cases
					worker.postMessage({number: p, testCase: testCases});
					setTimeout(function(){stop();},1000);
					console.log(done);
					setTimeout(function(){
							if(!isTestCasePassed.result || timedOut)
							{
								allFailedTestCases.push(p);
							}
					},timeOutTime);
				}
				else
				{
					// jslint found errors
					testCaseNumberThatFailed = p;
					console.log(testCaseNumberThatFailed);
					allFailedTestCases.push(testCaseNumberThatFailed);
				}
			}
			p++;
			if(p >= arrayOfTests.length)
			{
			  clearInterval(myInterval);
			  $("#machineSubmit").children("input").removeAttr("disabled");
			  $("#machineSubmit").children("input").click();
			}
		},timeOutTime+200);

	}
	
	
	function collectFormDataForNormal(testCaseThatFailed)
	{
			var formData = { errorTestCase: allFailedTestCases};
			return formData;
	}
</script>
		<div style='display: none'>
			<form id="machineSubmit" action="">
				<input id="codeSubmit" type="submit" value="Submit"
					class="btn btn-primary" />

			</form>
		</div>
		<script>
    	debugger;
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
    self.onmessage = function(e) 
    {
    	var data = e.data;
     	//self.postMessage(e.data);
		if (data.url)
		{
			    var url = data.url;
			    var index = url.indexOf('index.html');
			    if (index != -1)
			     {
			      url = url.substring(0, index);
			     }
			    importScripts(url + '/html/assertionFunctions.js');
		 }
		 else
		 {
		   		// Rest of your worker code goes here.
				try
				{
					eval(data.testCase);
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
					//self.postMessage(err.message);
				}
				self.postMessage({number:data.number, result:testCasedPassed});
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