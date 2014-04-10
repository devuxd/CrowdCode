<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="com.google.appengine.api.users.User"%>
<%@ page import="com.google.appengine.api.users.UserService"%>
<%@ page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@ page import="com.crowdcoding.Project"%>
<%@ page import="com.crowdcoding.Worker"%>
<%@ page import="com.crowdcoding.microtasks.DebugTestFailure"%>
<%@ page import="com.crowdcoding.artifacts.Test"%>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil"%>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper"%>
<%@ page import="java.io.StringWriter"%>
<%@ page import="java.io.Writer"%>

<%
	String projectID = (String) request.getAttribute("project");
    Project project = Project.Create(projectID);
	Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
	DebugTestFailure microtask = (DebugTestFailure) crowdUser.getMicrotask();
	ObjectMapper mapper = new ObjectMapper();
	Writer strWriter = new StringWriter();
	mapper.writeValue(strWriter, microtask.getTestCases());
	String testCases = strWriter.toString();
	strWriter = new StringWriter();
	mapper.writeValue(strWriter, microtask.getTestDescriptions());
	String testCaseDescriptions = strWriter.toString();
	String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());

	String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllFunctionsMocked(microtask.getFunction(), project) + "'";
	// add current header becuase of recursive issue not marked in correct state so getAllActive ignores it
	String allFunctionCodeInSystemHeader = "'" + microtask.getFunction().getHeader() + "{}" + FunctionHeaderUtil.getDescribedFunctionHeaders(null, project) + "'";
%>

<body>
	<div id="microtask">
		<script src="/include/bootbox.min.js"></script>
		<script src="/js/assertionFunctions.js"></script>
		<script src="/include/spin.js"></script>
		<script>
			var microtaskTitle = '<%= microtask.microtaskTitle() %>';
			var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		
			var windowErrorFound = false;
			window.onerror = function(err, url, lineNumber) 
			{  
				 //save error and send to server for example.
				console.log(err);
				windowErrorFound = true;
				i = 0;
				var htmlContent = "";
				var htmlTab= "";
				htmlContent += "<div class='tab-pane active' id=" + "'A" + i + "'>";
				htmlTab +=  "<li class='active'><a href=";
				
				htmlTab += "'#A" + i + "' data-toggle='tab'"+ "class='" + "false" + "'>" +  "test: " + "error";
				htmlTab +=  "</a></li>";
				htmlContent += "<p>" + "</br>"; 
				htmlContent += " Error At " + err + " </br>" ;
				htmlContent += "</p></div>";
				i++;
				htmlContent += "<button onclick='showReportInformation(" + i + ")'> Report Issue In Test </button>" + "</p></div>";
				$(document).ready(function() 
				{
					$("#tabContent").html(htmlContent);
					$("#tabs").html(htmlTab);
				});
			};  
	</script>
	<script>
		var timeOutPeriod = 500;
		var microtaskType = 'DebugTestFailure';
		var microtaskID = <%= microtask.getID() %>;
		
		var myCodeMirrorForDispute;
	    var myCodeMirrorForConsoleOutPut = CodeMirror.fromTextArea(debugconsole);
	    
	    // Code for the function editor
	    var editorCode = '<%= microtask.getFunction().getEscapedFullCode() %>';
		var functionName = '<%= microtask.getFunction().getName() %>';	   
		var highlightPseudoCall = false;
		var allTheFunctionCode = <%= "'" + FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(), project) + "'" %>;
	    allTheFunctionCode = allTheFunctionCode.replace(/\n/g, "").replace(/\t/g, "");
	    
		var functionToDescription = <%= FunctionHeaderUtil.getAllFullEscapedDescriptions(project) %>.functionNameToDescription;
		var functionToReturnType = <%= FunctionHeaderUtil.getAllReturnTypes(project) %>.functionNameToReturnType;
		
		var mocks = {};
		
		$('#sketchForm').submit(function() 
		{
			var result = checkAndCollectCode();
			if (!result.errors)
			{			
				if(myCodeMirror.getValue().indexOf("printDebugStatement") != -1)
				{
					myCodeMirror.setValue(myCodeMirror.getValue().replace(/printDebugStatement\([a-zA-Z0-9\\,\\'\\(\\) \" ]*[ ]*\);/g,"[Please Remove debug statements before submission]"));
					$('#popUp').modal();
					return false;
				}
	
				
				// Add the mocks to the code pieces
				var codePieces = result.code;
				codePieces.mocks = collectMocks();				
				submit(codePieces);
			}

			return false;
		});		
		
		$('#issueForm').submit(function() {
			if(myCodeMirror.getValue().indexOf("printDebugStatement") != -1)
			{
				myCodeMirror.setValue(myCodeMirror.getValue().replace(/printDebugStatement\([a-zA-Z0-9\\,\\'\\(\\) \" ]*[ ]*\);/g,"[Please Remove debug statements before submission]"));
				$('#popUp').modal();
				return false;
			}
			submit(collectFormDataForDispute());
			return false;
		});
		
	  	$('#skip').click(function() { skip(); });
		
		var javaTestCases = new Array();
		var javaTestCaseDescriptions = new Array();
		javaTestCaseDescriptions = <%=testCaseDescriptions%>;
		// i made this so we can have global state of whether all test cases passed
		var allTestPassed = true;
		var atLeastOneTestCase = false;
		// this has boolean to tell it if it is the first time
		// we are running tests, if it is then we will auto 
		// submit
		function test1(isFirstTime)
		{
			allTestPassed = true;
			javaTestCases = <%=testCases%>;
			runUnitTests(javaTestCases,"TEST 1",isFirstTime);
		}
		function revertCodeAs()
		{
			myCodeMirror.setValue('<%= microtask.getFunction().getEscapedFullCode() %>');
		}
		function parseTheTestCases(QunitTest)
		{
			var i = 0; 
			answers = new Array();
			var expression = ""; 
			var patt = new RegExp("(equal|notEqual|deepEqual|notDeepEqual)\\([a-zA-Z0-9\\,\\'\\ \" (\\)\" \\- ]*\\)[;]",'\g');
			while(expression != null)
			{
			  expression = patt.exec(QunitTest);
			  if(expression == null) 
			  {
			     break;
			  }
			  answers[i] = expression[0];
			  i = i + 1; 
			}
			return answers;
		}
		
		function showReportInformation(testNumber)
		{
			var TestCases = "";
			var tabName = "#A" + testNumber;
			TestCases += $(tabName).html().match("\\<br\\> [a-zA-Z0-9 \\/ \\< \\> \\: \\' \\( \\) \\,\\;]*\\<br\\>") + "";
			TestCases += "";
			var originalTestCases = <%=testCases%>;
			var myTest = originalTestCases[testNumber] + " ";
			
			if(javaTestCases.length == 0)
			{
			 alert("No TEST CASES");
			}
			else if($("#reportInformation").css('display') == 'block')
			{
			    myCodeMirrorForDispute.setValue(myTest);	
			   $("#userInput").val("");
			}
			else
			{
				$("#reportInformation").css('display',"block");
				myCodeMirrorForDispute = CodeMirror.fromTextArea(unedit);
			    myCodeMirrorForDispute.setValue(myTest);
			    myCodeMirrorForDispute.setOption("readOnly", "true");
			    myCodeMirrorForDispute.setOption("theme", "vibrant-ink");
				//$("#reportInformation").html(TestCases);
			}
		}
		
		function collectFormDataForDispute()
		{
			// active tab is the one disputed
			var testNumber = $("div.active")[0].id.match("[0-9]+");
			var name = javaTestCaseDescriptions[testNumber] + " ";
			var codes = myCodeMirror.getValue();
			var theCode = $("#code").val();
			var description = $("#userInput").val();
			var formData = { name: name,
					     description: description,
						 testCaseNumber: testNumber[0],
						 code: codes};
			return formData;
		}

	function runUnitTests(arrayOfTests, functionName,isFirstTime)
	{
 		$("#foo").css("display","block");
		var resultOfTest = new Array(); 
		var htmlTab = "";
		var htmlContent = "";
		var hasAtLeast1Test = false;
		var i = 0;
		var allTheFunctionCode = <%=allFunctionCodeInSystemHeader%> + <%=allFunctionCodeInSystem%>;
		// keep an array of html tabs which we concanate at the end
		// do it this way so we can make some tabs with mulitple tests
		// reflect correct color
		var tabHtml = new Array(arrayOfTests.length);
		console.log(allTheFunctionCode);
		var p = 0;
		var myInterval = setInterval(function()
		{
			if(arrayOfTests[p] != "")
			{
				hasAtLeast1Test = true;
				
				// run the tests if there are no errors
				if(doErrorCheck())
				{
					console.log("Passed error check");
					
					if(p == 0)
					{   
						htmlContent += "<div class='tab-pane active' id=" + "'A" + p + "'>";						
					}
					else
					{
						htmlContent += "<div class='tab-pane' id=" + "'A" + p + "'>";
						
					}
					// checking if tab has been intialized, only intialize once
					if(tabHtml[p] == undefined)
					{
						tabHtml[p] = "";
						if(p==0)
						{
							tabHtml[p] +=  "<li class='active'>";
						}
						else
						{
							tabHtml[p] +=  "<li>"
						}
						tabHtml[p] += "<a id='TabNumber"+ p + "' href=";
						tabHtml[p] += "'#A" + p + "' data-toggle='tab'"+ "class='" + true + "'>" +  "test: " + javaTestCaseDescriptions[p].substring(0,50);
						tabHtml[p] +=  "</a></li>";
					}
					// change to asyncTest if you want try that, but that broke stuff when i changed it
					var testCases = "";
					// constructs the function header and puts code  from the above code window
					console.log("Building test code");
					
					testCases += ("" + allTheFunctionCode + " " + 
					      instrumentCallerForLogging(myCodeMirror.getValue())).replace(/\n/g,"").replace(/\t/g,"");
					testCases += arrayOfTests[p];
					var QunitTestCases = parseTheTestCases(testCases);
					console.log("the test before");
					console.log(QunitTestCases);
					console.log("the tests after");					
					console.log("Final code to run: " + testCases);
							
					var results;
					resetAssertions();
					// worker code
					window.URL = window.URL || window.webkiURL;
				    var blob = new Blob([document.querySelector('#worker1').textContent]);
				    var worker = new Worker(window.URL.createObjectURL(blob));
				    var done = false;
				    worker.onmessage = function(e) 
				    {
				      console.log("Received: " + JSON.stringify(e.data));
					  results = e.data;
					  console.log(e.data);
					  // print out the debug statements only once, since it is not dependent on the test
					  // cases it only gets printed once so when p = 0
					  for(var g = 0; g < e.data.debugStatements.length && p==0; g++)
					  {
					  	printDebugStatementOuter(e.data.debugStatements[g] + g);
					  }
				    }
				
					function stop()
					{
						worker.terminate();
					}
					// load the script
					worker.postMessage({url: document.location.origin});
					// load the test cases
					worker.postMessage({number: p, testCase: testCases, mocks: mocks});
					setTimeout(function(){stop();},timeOutPeriod-200);
					console.log(done);
					setTimeout(function()
					{
						if(results == null)
						{
							var tempResult = new Array();
							tempResult.push({'expected': "", 'actual': "", 'message': "Test case Timeout, no debug statements printed", 'result':  false});
							results = {'number':p, 'result':tempResult, 'detail':1, 'debugStatements':new Array()};
						}
						else
						{
							// If the function did not time out, we get a result that has the list of callees and their
							// inputs and outputs.
							// Display this data to the user.
							console.log("calleeMap before displayDebugFields");
							console.log(results.calleeMap);
							displayDebugFields(calleeList, results.calleeMap);								
						}
						$.each(results.result, function(index, result)		
						{
							i = p;
							resultOfTest[i]= result;   
							atLeastOneTestCase = true;
							if(!result.result)
							{
								if(QunitTestCases.length < 1)
								{
									var originalTestCases = <%=testCases%>;
									htmlContent += "Error At: " + originalTestCases[i] + " </br>";
								}
								else
								{
									htmlContent += " Error At " + QunitTestCases[i] + " </br>" ;
								}
								if(result.expected == null)
								{
									var errorMessage = result.message.match("\\:[a-zA-Z0-9\\,\\'\\(\\) ]+$");
									if(errorMessage == null)
									{
										errorMessage = result.message;
									}
									htmlContent += " Message: " + errorMessage + "</br>";
								}
								else
								{
									htmlContent += " <b>Expected</b> <pre>" + JSON.stringify(result.expected, null, 4) 
									       + "</pre> <b>Actual</b> <pre>" + JSON.stringify(result.actual, null, 4) 
									       + "</pre> <b>Test case description</b> " + result.message + "<br>";
								}
								console.log(tabHtml[p] + " " + p);
								tabHtml[p] = tabHtml[p].replace("class='true'",'class=false')
							}
							else
							{
								if(result.message != null)
								{
									// I dont think we should show them a passed test case 
									htmlContent += " Passed: " + QunitTestCases[index] + "</br>";
								}
							}
						});
						// make sure only add the tab(html code for the tab) once
						// I do it by keep an array
						htmlContent += "<button onclick='showReportInformation(" + p + ")'> Report Issue In Test </button>" + "</p></div>";
					
						// Change the color of the tab based on the result of running all of 
						// the assertions within the tab
						
						// make sure only execute once, we loop through the array that holds
						//the html code for the tabs once at the very end. each cell in 
						// array has html code for that tab
						if(p == arrayOfTests.length-1)
						{
						 	for(var z = 0; z < tabHtml.length; z++)
						 	{
						 		console.log(tabHtml);
						 	    htmlTab += tabHtml[z];
						 	}
	
							details = results.detail;
						 	console.log(details);
						 	console.log("iteraton" + p + "size" + arrayOfTests.length);
						    if(details.failed > 0)
						    {
						     	allTestPassed = false;
						    }
						    javaTestCases = resultOfTest;	
							i++;
						}
					},timeOutPeriod);	
				}
				else
				{
					console.log("errors found");
					setTimeout(function()
					{
						i++;
						allTestPassed = false;					
					} ,timeOutPeriod);
				}
			}
			setTimeout(function()
			{
				p++;
				// the closing section if it enters
				if(p >= arrayOfTests.length)
				{	
					if(!hasAtLeast1Test)
					{
						debugger;
						htmlContent += "<div class='tab-pane active' id=" + "'A" + i + "'>";
						htmlTab +=  "<li class='active'><a href=";
						htmlTab += "'#A" + i + "' data-toggle='tab'"+ "class='" + "false" + "'>" +  "test: " + "error";
						htmlTab +=  "</a></li>";
						htmlContent += "<p>" + "</br>"; 
						htmlContent += " No Unit Tests Exist for this function" + " </br>" ;
						htmlContent += "</p></div>";
						i++;
						$("#reportInformation").css('display',"block");
						myCodeMirrorForDispute = CodeMirror.fromTextArea(unedit);
				    	myCodeMirrorForDispute.setValue("No Unit Test Exist For this Function");
				    	myCodeMirrorForDispute.setOption("readOnly", "true");
				    	myCodeMirrorForDispute.setOption("theme", "vibrant-ink");
				    	$("#unittest").attr('disabled', 'false');
					}
					
					$(document).ready(function()
					{
						if(!windowErrorFound)
						{
							$("#tabContent").html(htmlContent);
							$("#tabs").html(htmlTab);
						}
						// stop the interval before submission
						clearInterval(myInterval);
						if(htmlTab.search("false") == -1 && isFirstTime && !windowErrorFound)
						{
							$("#codeSubmit").click()
						}
					});
					
					if(myCodeMirror.getValue().indexOf("printDebugStatement") != -1)			
					{
						var existingText = myCodeMirrorForConsoleOutPut.getValue();
						myCodeMirrorForConsoleOutPut.setValue(existingText + "\n" + new Date());	
					}
					//return testCases;
						
				  	clearInterval(myInterval);
				 	$("#foo").css("display","none");
				}
			},timeOutPeriod);
		},timeOutPeriod+50);
	}
	
	// for debuggin purposes
	function printDebugStatementOuter(statement)
	{
		var existingText = myCodeMirrorForConsoleOutPut.getValue();

		if($("#consoleDiv").css('display') == 'block')
		{
		    myCodeMirrorForConsoleOutPut.setValue(existingText + "\n" + statement);	
		}
		else
		{
			$("#consoleDiv").css('display',"block");
			
		    myCodeMirrorForConsoleOutPut.setValue(existingText + "\n" + statement);
		    myCodeMirrorForConsoleOutPut.setOption("readOnly", "true");
		    myCodeMirrorForConsoleOutPut.setOption("theme", "vibrant-ink");
		}
	}
	
	function hideThePopUp()
	{
	    $("#submissionBox").css('display',"none");
	}
</script>

<script id="worker1" type="javascript/worker">
    // This script won't be parsed by JS engines because its type is javascript/worker.
    var isFirstTimeThrough = 1;
    var testCasedPassed = true;
    // since debug statements require the dom and eval goes inside the worker
    var debugStatementToRun = new Array();
    // for debuggin purposes
	function printDebugStatement(statement)
	{
		// eval is called for each test case but debug statement wont change		
		if(isFirstTimeThrough == 0)
		{
			debugStatementToRun.push(statement);
			isFirstTimeThrough = 1;
		}
	}    
    
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
			try
			{
				var finalCode = 'var mocks = ' + JSON.stringify(data.mocks) + '; ' + data.testCase;
				isFirstTimeThrough = data.number;
				eval(finalCode);
			}
			catch (err)
			{
				details.failed++;				
				results.push({ 'expected': '', 'actual': 'ERROR EXECUTING CODE: ' + JSON.stringify(err.message), 'message': '', 'result': false});

				self.postMessage({number:data.number, result:results, detail:details, debugStatements:debugStatementToRun,
					calleeList: calleeList, calleeMap: calleeMap});
			}
			self.postMessage({number:data.number, result:results, detail:details, debugStatements:debugStatementToRun,
				calleeList: calleeList, calleeMap: calleeMap});
		 }
   };
  </script>


	<%@include file="/html/elements/microtaskTitle.jsp" %>
	This function has failed its tests. Can you fix it?
	You can 1) edit the function to fix issues with the code, 2) report a problem with the tests, and 3) 
	edit the output of function calls to fix problems with other functions. 
	To check if you've fixed the issue, run the unit tests.
	You may use the function <I>printDebugStatement(...); </I> to print data to the console. <BR>
	
	<button style="float: right;" onclick="revertCodeAs();">Revert Code</button><BR><BR>
	
	<%@include file="/html/elements/typeBrowser.jsp" %>	
	<%@include file="/html/elements/functionEditor.jsp" %>	
	
	<div style = 'display:none;' id = 'consoleDiv'>
		<h5> Debug Console Output:</h5>
			<table width="100%">
				<tr>
					<td></td>
					<td><textarea id="debugconsole"></textarea></td>
				</tr>
			</table><br>
	</div>		
	
	<button id = 'unittest' style="" onclick="test1(false);">Run the Unit Tests</button><BR><BR>
	
	Here's the list of test cases (on the left) and the error for the currently selected test (on the right). Tests
	that are green are currently passing while those that are red are failing. You can switch between 
	tests by clicking on a test on the left.<BR><BR>
	
	
	<div class="bs-docs-example">
		<div class="tabbable tabs-left">
			<ul id="tabs" " class="nav nav-tabs">
				<li class="active">
			</ul>
			<div id="tabContent" class="tab-content">
				<div class="tab-pane active" id="lA"></div>
				<div class="tab-pane" id="lB"></div>
				<div class="tab-pane" id="lC"></div>
			</div>
		</div>
		<!-- /tabbable -->
	</div>
		<script>
	 test1(true);
	 </script>

		<div id="reportInformation" style="display: none">
			<form id="issueForm" action="">
				<h5>Here is the test case code, and please note you can only
					dispute one test case at a time:</h5>
				<table width="100%">
					<tr>
						<td width="20"></td>
						<td><textarea id="unedit"></textarea></td>
					</tr>
				</table>
				<h5>
					Please describe what needs to be fixed: <br>
				</h5>
				<table width="100%">
					<tr>
						<td width="20"></td>
						<td><textarea id="userInput"></textarea></td>
					</tr>
				</table>
				<%@include file="/html/elements/submitFooter.jsp" %>
			</form>
		</div>
		
	<div>
		<BR><%@include file="/html/elements/calleeDebugOutputEditor.jsp" %>
	</div>
	
	<br><br><form id="sketchForm" action="">
		<%@include file="/html/elements/submitFooter.jsp" %>
	</form>
		
	<script>
		$(document).ready(function()
		{
			var mockData = JSON.parse('<%= Test.allMocksInSystemEscaped(project) %>');
			loadMocks(mockData.mocks);
		});
	</script>	
		
		
<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">Ã—</button>
		<h3 id="logoutLabel">Please Remove Debug Statements</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
</div>		
<span id = 'submissionBox' style = 'display:none'> 		
		<div class="bootbox modal fade in" tabindex="-1" style="overflow: hidden;" aria-hidden="false">
<div class="modal-body">There is no auto submit, please either enter a dispute description or if you passed all the test cases submit </div>
<div class="modal-footer"><button style="" onclick="hideThePopUp();"> Confirm </button></div>
</div>
<div class="modal-backdrop fade in"></div>
</span>
</div>
		<div style='display:none' id='foo'></div>

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
</body>
</html>
