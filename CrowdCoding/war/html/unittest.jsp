<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.UnitTestFunction" %>
<%@ page import="com.crowdcoding.microtasks.DisputeUnitTestFunction" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>

<%
    Project project = Project.Create();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    UnitTestFunction microtask = (UnitTestFunction) crowdUser.getMicrotask();
    ObjectMapper mapper = new ObjectMapper();
    Writer strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getTestCases());
    String testCases = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunctionHeaderAssociatedWithTestCase());
    String functionHeader = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getTestDescriptions());
    String testCaseDescriptions = strWriter.toString();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunctionCode());
    String functionCode = strWriter.toString();
    System.out.println(functionCode);
    System.out.println(functionHeader);
    
%>

<body>
<div id="microtask">
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script src="/include/jslint.js"></script>
	<script src="/html/errorCheck.js"></script>
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

	});
};  
		var myCodeMirrorForDispute;
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setValue(<%= functionCode %>);

	    myCodeMirror.setValue(myCodeMirror.getValue().replace(/;/g,";\n"));
	    myCodeMirror.setOption("theme", "vibrant-ink");
		$("#sketchForm").children("input").attr('disabled', 'false');
		$('#sketchForm').submit(function() {
		test1(false);
		if($("#sketchForm").children("input").attr('disabled') == 'disabled')
		{
		return false;
		}
		debugger;
			var formData = collectFormDataForNormal();
			$.ajax({
			    contentType: 'application/json',
			    data: JSON.stringify( formData ),
			    dataType: 'json',
			    type: 'POST',
			    url: '/submit?type=unittestfunction&id=<%= microtask.getID() %>'
			}).done( function (data) { loadMicrotask();	});
							
			return false;
		});
		
		
		$('#issueForm').submit(function() {
			var formData = collectFormDataForDispute();
			$.ajax({
			    contentType: 'application/json',
			    data: JSON.stringify( formData ),
			    dataType: 'json',
			    type: 'POST',
			    url: '/submit?type=unittestfunction&id=<%= microtask.getID() %>'
			}).done( function (data) { loadMicrotask();	});						
			
			return false;
		});
		
		
		</script>
		<script>
		var javaTestCases = new Array();
		var javaTestCaseDescriptions = new Array();
		javaTestCaseDescriptions = <%= testCaseDescriptions %>;
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
	javaTestCases = <%= testCases %>;
	runUnitTests(javaTestCases,"TEST 1",isFirstTime);
}
</script>
<script>
function revertCodeAs()
{
	 myCodeMirror.setValue(<%= functionCode %>);
}
</script>
<script>
function parseTheTestCases(QunitTest)
{
	var i = 0; 
	answers = new Array();
	 var expression = ""; 
	 var patt = new RegExp("equal\\([a-zA-Z0-9\\,\\'\\(\\)\" ]*\\);",'\g');
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
</script>
<script>
function showReportInformation(testNumber)
{
	debugger;
	var TestCases = "";
	var tabName = "#A" + testNumber;
	TestCases += $(tabName).html().match("\\<br\\> [a-zA-Z0-9 \\/ \\< \\> \\: \\' \\( \\) \\,\\;]*\\<br\\>") + "";
	TestCases += "";
	var originalTestCases = <%= testCases %>;
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
</script>
<script>
function collectFormDataForDispute()
{
debugger;
	// active tab is the one disputed
	var testNumber = $(".active").children()[0].id.match("[0-9]+");
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
</script>
<script>
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
</script>
<script>
function runUnitTests(arrayOfTests, functionName,isFirstTime)
{
debugger;
var testCases2 = <%= functionHeader %>;
var functionHeader = testCases2.replace(/\"/g,"'");
var resultOfTest = new Array(); 
var htmlTab = "";
var htmlContent = "";
for(var p = 0; p < arrayOfTests.length; p++)
{
	var i = 0;
	if(arrayOfTests[p] == "")
	{
		continue;
	}
	var lintCheckFunction = functionHeader + "{"  + myCodeMirror.getValue().replace(/\n/g,"") + "}";
	var lintResult = JSLINT(lintCheckFunction,{nomen: true, sloppy: true, white: true, debug: true, evil: false, vars: true ,stupid: true});
	var errors = checkForErrors(JSLINT.errors);
	console.log(errors);
	// no errors by jslint
	if(errors == "")
	{
		var htmlTab1 = "";
		if(p == 0)
			{   
				htmlContent += "<div class='tab-pane active' id=" + "'A" + p + "'>";
				htmlTab +=  "<li class='active'>";
			}
	
			else
			{
				htmlContent += "<div class='tab-pane' id=" + "'A" + p + "'>";
				htmlTab +=  "<li>"
				
			}
			// this is a temp tab
			htmlTab1 += "<a id='TabNumber"+ p + "' href=";
			htmlTab1 += "'#A" + p + "' data-toggle='tab'"+ "class='" + true + "'>" +  "test: " + javaTestCaseDescriptions[p].substring(0,50);
			htmlTab1 +=  "</a></li>";
		var testCases = "test('" + functionName + "', function() {";
		// constructs the function header and puts code  from the above code window
		testCases += functionHeader + "{"  + myCodeMirror.getValue().replace(/\n/g,"") + "}";
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
				if(QunitTestCases.length < 1)
				{
					var originalTestCases = <%= testCases %>;
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
				htmlTab1 = htmlTab1.replace("class='true'",'class=false')
			}
			else
			{
				if(result.message != null)
				{
					htmlContent += " Passed: " + QunitTestCases[i] + "</br>";
				}
			}
			htmlTab += htmlTab1;
			i++;
		}
	
		   QUnit.testDone = function( details )
		 {
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
		htmlContent += " Error At " + errors + " </br>" ;
		htmlContent += "</p></div>";
		i++;
	}}
	$(document).ready(function()
	{
		$("#tabContent").html(htmlContent);
		$("#tabs").html(htmlTab);
		if(htmlTab.search("false") == -1 && isFirstTime)
		{
			$("#codeSubmit").submit()
		}
	});
	return testCases;
}
</script>
		<button style="float:right;"onclick="revertCodeAs();"> Revert Code </button>
<form id="sketchForm" action="">


	<BR>
	<h4>
	This function has failed a potentially rigorous test set.
Here's the function description and implementation, the test that failed, and the error message it gave.  
Can you fix it?
	<BR>
	<%= methodFormatted %>
	<BR>
	{</h4>
	<table width="100%">
		<tr>
			<td></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	<h4> } <BR><BR></h4>
	<input id = "codeSubmit" type="submit" value="Submit" class="btn btn-primary"/>
	
	</form>
	<button style="" onclick="test1(false);">Run the Unit Tests</button>
	<div class="bs-docs-example">
		<div class="tabbable tabs-left">
			<ul id="tabs"" class="nav nav-tabs">
				<li class="active">
			</ul>
			<div id="tabContent" class="tab-content">
				<div class="tab-pane active" id="lA">
					
				</div>
				<div class="tab-pane" id="lB">
				
				</div>
				<div class="tab-pane" id="lC">
					
				</div>
			</div>
		</div>
		<!-- /tabbable -->
	</div>
	<script>
    debugger;
	 test1(true);
	 </script>
	 
	 <div id = "reportInformation" style = "display:none"> 
	 <form id="issueForm" action="">
	 <h4>
	 Here is the test case code, and please note you can only dispute one test case at a time:</h4>
	 <table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="unedit"></textarea></td>
		</tr>	
	</table>
	<h4>
	Please describe what needs to be fixed:
	<br></h4>
		 <table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="userInput"></textarea></td>
		</tr>	
	</table>
	<input type="submit" value="Submit" class="btn btn-primary"/>
	</form>
	</div>
</body>
</html>
