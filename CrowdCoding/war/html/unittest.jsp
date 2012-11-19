<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.UnitTestFunction" %>
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
    for(String s: microtask.getTestCases())
    {
    System.out.println(s);
    }
    System.out.println(microtask.getTestCases());
    System.out.println(testCases);
    System.out.println("header:" + functionHeader);
%>

<body>
<div id="microtask">
	<script src="/include/codemirror/codemirror.js"></script>
	<script src="/include/codemirror/javascript.js"></script>
	<script>
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setValue("<%= microtask.getFunctionCode()%> ");
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
function runUnitTests(arrayOfTests, functionName)
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

	var testCases = "test('" + functionName + "', function() {";
	// constructs the function header and puts code  from the above code window
	testCases += functionHeader + myCodeMirror.getValue() + "}"
	for(var p = 0; p < arrayOfTests.length; p++)
	{
		testCases += arrayOfTests[p];
	}
	
	testCases+= "});";
	var dynamicCreate = " test( 'functionName', function() {   equal( 1 == '2', 'Fail!' ); }); alert('hi there');";
//	test( 'functionName', function() {   equal( 1 == '2', 'Fail!' ); });
	QUnit.log = function(result, message)

	{
		console.log(result);
		resultOfTest[i]= result;   
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
		htmlTab += "'#A" + i + "' data-toggle='tab'"+ "class='" + result.result + "'>" +  "test: " + result.message;
		htmlTab +=  "</a></li>";
		htmlContent += "<p>" + "Function Name: " + result.name + "</br>"; 
		if(!result.result)
		{
			htmlContent += " Error At " + result.message + " </br>" ;
			htmlContent += " Expected " + result.expected + " actual: " + result.actual + "</br>";
		}
		else
		{
			if(result.message != null)
			{
				htmlContent += " Outcome Message " + result.message + "</br>";
			}
		}
		htmlContent += "</p></div>";
		i++;
	}

	   QUnit.testDone = function( details )
	 {
	 	alert(details.failed);
	     if(details.failed > 0)
	     {
	     	$("input").attr('disabled', 'false');
	     }
	     else
	     {
	     	$("input").removeAttr("disabled");
	     }
	   }
	eval(testCases);

	$(document).ready(function()
	{
		$("#alltestcases").html("All the test cases together: </br>" + testCases + "</br>");
		$("#tabContent").html(htmlContent);
		$("#tabs").html(htmlTab);
	});
	return testCases;
}
function test1()
{
debugger;
var testCasess = new Array();
testCasess = <%= testCases %>;
//arrayOfTests = new Array(); arrayOfTests[0] = "var a = 1; var b = 2; function plus(a,b) { return a + b; } equal(plus(a,b), 3); equal( 1 == '2', 'Fail!' );"; arrayOfTests[1] = "equal( 1 == '1', true );"; runUnitTests(arrayOfTests,"TEST 1");
runUnitTests(testCasess,"TEST 1");
}
function resetScrollbar(area)
{
window.scroll(300,0);
}
</script>
<form id="sketchForm" action="">


	<BR>
	
	<%@include file="/html/elements/methodDescription.jsp"%>

	{ <BR>
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR>
	<input type="submit" value="Submit" class="btn btn-primary"/>
	
	</form>
	<button style="float:right;"> Dispute Unit Tests </button>
				<div id="alltestcases" style="margin: 25px;"> </div>
	<button style="float:right;" onclick="test1();">Run the Unit Tests</button>
	<div class="bs-docs-example">
		<div class="tabbable tabs-left">
			<ul id="tabs" onclick="resetScrollbar(this)" class="nav nav-tabs">
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
	 test1();
	 </script>
</body>
</html>
