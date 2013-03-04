<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="com.google.appengine.api.users.User"%>
<%@ page import="com.google.appengine.api.users.UserService"%>
<%@ page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@ page import="com.crowdcoding.artifacts.Project"%>
<%@ page import="com.crowdcoding.Worker"%>
<%@ page import="com.crowdcoding.microtasks.DebugTestFailure"%>
<%@ page import="com.crowdcoding.microtasks.DisputeUnitTestFunction"%>
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
	mapper.writeValue(strWriter, microtask.getFunctionHeaderAssociatedWithTestCase());
	String functionHeader = strWriter.toString();
	strWriter = new StringWriter();
	mapper.writeValue(strWriter, microtask.getTestDescriptions());
	String testCaseDescriptions = strWriter.toString();
	String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
	strWriter = new StringWriter();
	//mapper.writeValue(strWriter, microtask.getFunctionCode());
	//String functionCode = strWriter.toString();
	String functionCode = "'"+microtask.getFunctionCode()+"'";
	String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getAllActiveFunctions(microtask.getFunction(), project) + "'";
	System.out.println(functionCode);
	System.out.println(functionHeader);
%>

<body>
	<div id="microtask">
		<script src="/include/bootbox.min.js"></script>
		<script>
			window.onerror = function(err, url, lineNumber) {  
			 //save error and send to server for example.
			console.log(err);
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
			  	$('#skip').click(function() { skip(); });
			});
	};  
	</script>
	<script>
		debugger;
		var microtaskType = 'DebugTestFailure';
		var microtaskID = <%= microtask.getID() %>;
		var myCodeMirrorForDispute;
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    var myCodeMirrorForConsoleOutPut = CodeMirror.fromTextArea(debugconsole);
	    myCodeMirror.setValue(/*'"'+*/<%=functionCode%>/*+'"'*/);
	    //myCodeMirror.setValue(myCodeMirror.getValue().replace(/;/g,";\n"));
	    myCodeMirror.setOption("theme", "vibrant-ink");
		$("#sketchForm").children("input").attr('disabled', 'false');
		$('#sketchForm').submit(function() {
		debugger;
		if(myCodeMirror.getValue().indexOf("printDebugStatement") != -1)
		{
			myCodeMirror.setValue(myCodeMirror.getValue().replace(/printDebugStatement\([a-zA-Z0-9\\,\\'\\(\\) \" ]*[ ]*\);/g,"[Please Remove debug statements before submission]"));
			return false;
		}
		test1(false);
		if($("#sketchForm").children("input").attr('disabled') == 'disabled')
		{
			return false;
		}
		debugger;
			submit(collectFormDataForNormal());
			return false;
		});
		
		
		$('#issueForm').submit(function() {
			if(myCodeMirror.getValue().indexOf("printDebugStatement") != -1)
			{
				myCodeMirror.setValue(myCodeMirror.getValue().replace(/printDebugStatement\([a-zA-Z0-9\\,\\'\\(\\) \" ]*[ ]*\);/g,"[Please Remove debug statements before submission]"));
				alert("please remove debug statements from code ");
				return false;
			}
			submit(collectFormDataForDispute());
			return false;
		});
		
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
			debugger;
			allTestPassed = true;
			javaTestCases = <%=testCases%>;
			runUnitTests(javaTestCases,"TEST 1",isFirstTime);
		}
		function revertCodeAs()
		{
			 myCodeMirror.setValue(<%=functionCode%>);
		}
			function parseTheTestCases(QunitTest)
			{
				var i = 0; 
				answers = new Array();
				 var expression = ""; 
				 var patt = new RegExp("equal\\([a-zA-Z0-9\\,\\'\\ \" (\\)\" ]*\\);",'\g');
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
		debugger;
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
		debugger;
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

		function collectFormDataForNormal()
		{
			// active tab is the one disputed
			debugger;
			var testNumber = null;
			var name = null;
			var description = null;
			var codes = myCodeMirror.getValue();
			var formData = { name: name,
					     description: description,
						 testCaseNumber: testNumber,
						 code: codes};
			return formData;
		}
	function runUnitTests(arrayOfTests, functionName,isFirstTime)
	{
		debugger;
		var unStringEscapedFunctionHeader = <%=functionHeader%>;
		var functionHeader = unStringEscapedFunctionHeader.replace(/\"/g,"'");
		var resultOfTest = new Array(); 
		var htmlTab = "";
		var htmlContent = "";
		var hasAtLeast1Test = false;
		var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
		// keep an array of html tabs which we concanate at the end
		// do it this way so we can make some tabs with mulitple tests
		// reflect correct color
		var tabHtml = new Array(arrayOfTests.length);
		console.log(allTheFunctionCode);
		for(var p = 0; p < arrayOfTests.length; p++)
		{
			var i = 0;
			if(arrayOfTests[p] == "")
			{
				continue;
			}
			hasAtLeast1Test = true;
			var lintCheckFunction = "function printDebugStatement (){} " + allTheFunctionCode + " " + functionHeader + "{"  + myCodeMirror.getValue().replace(/\n/g,"") + "}";
			var lintResult = JSLINT(lintCheckFunction,getJSLintGlobals());
			var errors = checkForErrors(JSLINT.errors);
			console.log(errors);
			// no errors by jslint
			if(errors == "")
			{
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
				var testCases = "test('" + functionName + "', function() {";
				// constructs the function header and puts code  from the above code window
				testCases += "" + allTheFunctionCode + " " + functionHeader + "{"  + myCodeMirror.getValue().replace(/\n/g,"") + "}";
				testCases += arrayOfTests[p];
				testCases+= "});";
				console.log(testCases);
				var QunitTestCases = parseTheTestCases(testCases);
				console.log(QunitTestCases);
				QUnit.log = function(result, message)
			
				{
					debugger;
					console.log(result);
					resultOfTest[i]= result;   
					atLeastOneTestCase = true;
					htmlContent += "<p>" + "</br>"; 
					if(!result.result)
					{
					debugger;
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
						htmlContent += " Expected " + result.expected + " actual: " + result.actual + "</br>";
						htmlContent += " Outcome Message: " + result.message + "</br>";
						}
						tabHtml[p] = tabHtml[p].replace("class='true'",'class=false')
					}
					else
					{
						if(result.message != null)
						{
							htmlContent += " Passed: " + QunitTestCases[i] + "</br>";
						}
					}
					// make sure only add the tab(html code for the tab) once
					// I do it by keep an array
					debugger;
					i++;
				}
			
				 QUnit.testDone = function( details )
				 {
					 // make sure only execute once, we loop through the array that holds
					 //the html code for the tabs once at the very end. each cell in 
					 // array has html code for that tab
					 if(p == arrayOfTests.length-1)
					 {
					 	for(var z = 0; z < tabHtml.length; z++)
					 	{
					 	    htmlTab += tabHtml[z];
					 	}
					 }
					 	console.log(details);
					 	console.log("iteraton" + p + "size" + arrayOfTests.length);
					     if(details.failed > 0)
					     {
					     	$("#sketchForm").children("input").attr('disabled', 'false');
					     	allTestPassed = false;
					     }
					     else if(details.failed == 0 && allTestPassed)
					     {
					     	$("#sketchForm").children("input").removeAttr("disabled");
					     }
					     javaTestCases = resultOfTest;
				   }
				try
				{
				eval(testCases);
				}
				catch (err)
				{
					debugger;
					if(i == 0)
					{   
						htmlContent += "<div class='tab-pane active' id=" + "'A" + i + "'>";
						htmlTab +=  "<li class='active'><a href=";
					}
					else
					{
						htmlContent += "<div class='tab-pane' id=" + "'A" + i + "'>";
						htmlTab +=  "<li><a href=";
					}
					htmlTab += "'#A" + i + "' data-toggle='tab'"+ "class='" + "false" + "'>" +  "test: " + "error";
					htmlTab +=  "</a></li>";
					htmlContent += "<p>" + "</br>"; 
					htmlContent += " Error At " + err.message + " </br>" ;
					htmlContent += "</p></div>";
					i++;
				}
				htmlContent += "<button onclick='showReportInformation(" + p + ")'> Report Issue In Test </button>" + "</p></div>";
			}
			else
			{
			// jslint found errors
				if(p == 0)
				{   
					htmlContent += "<div class='tab-pane active' id=" + "'A" + i + "'>";
					htmlTab +=  "<li class='active'><a href=";
				}
				else
				{
					htmlContent += "<div class='tab-pane' id=" + "'A" + i + "'>";
					htmlTab +=  "<li><a href=";
				}
				htmlTab += "'#A" + i + "' data-toggle='tab'"+ "class='" + "false" + "'>" +  "test: " + "error";
				htmlTab +=  "</a></li>";
				htmlContent += "<p>" + "</br>"; 
				htmlContent += " Syntax Error: </br> " + errors + " </br>" ;
				htmlContent += "</p></div>";
				i++;
			}}
			
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
				$("#tabContent").html(htmlContent);
				$("#tabs").html(htmlTab);
				if(htmlTab.search("false") == -1 && isFirstTime)
				{
					$("#codeSubmit").submit()
				}
			});
			
			if(myCodeMirror.getValue().indexOf("printDebugStatement") != -1)			
			{
				var existingText = myCodeMirrorForConsoleOutPut.getValue();
				myCodeMirrorForConsoleOutPut.setValue(existingText + "\n" + new Date());	
			}
			return testCases;
	}
	// for debuggin purposes
	function printDebugStatement(statement)
	{
		debugger;
		var existingText = myCodeMirrorForConsoleOutPut.getValue();
		//var existingText = "";
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
		<button style="float: right;" onclick="revertCodeAs();">
			Revert Code</button>
		<form id="sketchForm" action="">


			<BR>
			<h5>
				This function has failed a potentially rigorous test set. Here's the
				function description and implementation, the test that failed, and
				the error message it gave. Can you fix it? As a note you may use the function:<BR>
				printDebugStatement(...);
				<br>
				to print data to the console
				<%=methodFormatted%>
				<BR> {
			</h5>
			<table width="100%">
				<tr>
					<td></td>
					<td><textarea id="code"></textarea></td>
				</tr>
			</table>
			<h5>
				} <BR> <BR>
			</h5>
			<input id="codeSubmit" type="submit" value="Submit"
				class="btn btn-primary" />

		</form>
		<br>
		<div style = 'display:none;' id = 'consoleDiv'>
		<h5> Debug Console Output:
		</h5>
			<table width="100%">
				<tr>
					<td></td>
					<td><textarea id="debugconsole"></textarea></td>
				</tr>
			</table>
					<br>
			</div>
		

		<button id = 'unittest' style="" onclick="test1(false);">Run the Unit Tests</button>
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
    debugger;
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
		
		
		
		
<span id = 'submissionBox' style = 'display:none'> 		
		<div class="bootbox modal fade in" tabindex="-1" style="overflow: hidden;" aria-hidden="false">
<div class="modal-body">There is no auto submit, please either enter a dispute description or if you passed all the test cases submit </div>
<div class="modal-footer"><button style="" onclick="hideThePopUp();"> Confirm </button></div>
</div>
<div class="modal-backdrop fade in"></div>
</span>
</body>
</html>