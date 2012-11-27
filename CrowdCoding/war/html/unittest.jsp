<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.UnitTestFunction" %>
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
    for(String s: microtask.getTestCases())
    {
    System.out.println(s);
    }
    System.out.println(testCases);
    System.out.println("header:" + functionHeader);
    System.out.println(microtask.getFunctionCode().replaceAll("[\t\n\\x0B\f\r]"," "));
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
%>

<body>
<div id="microtask">
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script>
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setValue("<%= microtask.getFunctionCode().replaceAll("[\t\n\\x0B\f\r]"," ") %>");
	    myCodeMirror.setOption("theme", "vibrant-ink");
		$("input").attr('disabled', 'false');
		$('#sketchForm').submit(function() {
			var formData = { code: $("#code").val() };
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
function runUnitTests(arrayOfTests, functionName,isFirstTime)
{
debugger;
var testCases2 = <%= functionHeader %>;
var functionHeader = testCases2.replace(/\"/g,"'");

//chooses Thomas needs to make, if I leave these as global then 
//we can continously add to the tabs, but if I put them inside
//the function then we will replace the tabs with last call
//to runUnitTests. also if we have alot of test cases it is going to
// be annoying ot have to scroll up then down to change the test case

var resultOfTest = new Array(); 
var i = 0;;
var htmlTab = "";
var htmlContent = "";
for(var p = 0; p < arrayOfTests.length; p++)
{
if(arrayOfTests[p] == "")
{
continue;
}
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
		htmlTab += "<a id='TabNumber"+ p + "' href=";
		htmlTab += "'#A" + p + "' data-toggle='tab'"+ "class='" + true + "'>" +  "test: " + javaTestCaseDescriptions[p].substring(0,50);
		htmlTab +=  "</a></li>";
	var testCases = "test('" + functionName + "', function() {";
	// constructs the function header and puts code  from the above code window
	testCases += functionHeader + "{"  + myCodeMirror.getValue().replace('\n',"") + "}";
	
	//{
		testCases += arrayOfTests[p].replace(/\"/g,"'");
	//}
	testCases+= "});";
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
			htmlContent += " Error At " + QunitTestCases[i] + " </br>" ;
			if(result.expected == null)
			{
				htmlContent += " Message: " + result.message.match("\\)\\:[a-zA-Z0-9\\,\\'\\(\\) ]*") + "</br>";
			}
			else
			{
			htmlContent += " Expected " + result.expected + " actual: " + result.actual + "</br>";
			htmlContent += " Outcome Message: " + result.message + "</br>";
			}
			htmlTab = htmlTab.replace("class='true'",'class=false')
		}
		else
		{
			if(result.message != null)
			{
				htmlContent += " Passed: " + QunitTestCases[i] + "</br>";
			}
		}
		i++;
	}

	   QUnit.testDone = function( details )
	 {
	 	console.log(details);
	     if(details.failed > 0)
	     {
	     	$("input").attr('disabled', 'false');
	     	allTestPassed = false;
	     }
	     else if(details.failed == 0 && allTestPassed)
	     {
	     	$("input").removeAttr("disabled");
	     	if(isFirstTime)
	     	{
	     	  alert("submitted");
	     	  }
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
		htmlContent += "<p>" + "Function Name: " + result.name + "</br>"; 
		htmlContent += " Error At " + err.message + " </br>" ;
		htmlContent += "</p></div>";
		i++;
	}
			htmlContent += "<button onclick='showReportInformation(" + p + ")'> Report Issue In Test </button>" + "</p></div>";
}
	$(document).ready(function()
	{
		$("#tabContent").html(htmlContent);
		$("#tabs").html(htmlTab);
	});
	return testCases;
}
function test1(isFirstTime)
{
debugger;
allTestPassed = true;
javaTestCases = <%= testCases %>;
runUnitTests(javaTestCases,"TEST 1",isFirstTime);
}
function revertCodeAs()
{
myCodeMirror.setValue("<%= microtask.getFunctionCode().replaceAll("[\t\n\\x0B\f\r]"," ") %>");
}
function parseTheTestCases(QunitTest)
{
var i = 0; 
answers = new Array();
 var expression = ""; 
 var patt = new RegExp("equal\\([a-zA-Z0-9\\,\\'\\(\\) ]*\\);",'\g');
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
	//debugger;
	//if(javaTestCases.length == 0)
	//{
	//  alert("No TEST CASES");
	//}
	//else
	//{
	//	$("#reportInformation").css('display',"block");
	//	var TestCases = "";
	//	var tabName = "#A" + testNumber;
	//	TestCases += $(tabName).html().match("\\<br\\> [a-zA-Z0-9 \\/ \\< \\> \\: \\' \\( \\) \\,\\;]*\\<br\\>") + "";
	//	TestCases += "";
	//	$("#reportInformation").html(TestCases);
	//}
	
}
</script>
		<button style="float:right;"onclick="revertCodeAs();"> Revert Code </button>
<form id="sketchForm" action="">


	<BR>
	
	<%= methodFormatted %>
	<BR>
	{
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR>
	<input type="submit" value="Submit" class="btn btn-primary"/>
	
	</form>
				<div id="alltestcases" style="margin: 25px;"> </div>
	<button style="float:right;" onclick="test1(false);">Run the Unit Tests</button>
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
	<div id = "reportInformation" style = "display:none"> </div>
	<script>
	 test1(true);
	 </script>
</body>
</html>
