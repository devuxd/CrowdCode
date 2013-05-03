<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteTest" %>
<%@ page import="com.crowdcoding.microtasks.WriteTest.PromptType" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteTest microtask = (WriteTest) crowdUser.getMicrotask();
    
    Function function = microtask.getFunction();
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(), project) + "'";
	PromptType promptType = microtask.getPromptType();
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;	
		var microtaskType = 'writetest';
		var microtaskID = <%= microtask.getID() %>;			
		
		// Determine the prompt type
		var showWritePrompt = <%= (promptType == PromptType.WRITE) %>;
		var showCorrectPrompt = <%= (promptType == PromptType.CORRECT) %>;
		var showFunctionChangedPrompt = <%= (promptType == PromptType.FUNCTION_CHANGED) %>;				
		
		// Load test data
		var fullDescription = <%=function.getDescriptionDTO().json() %>; 		
		var paramNames = fullDescription.paramNames;
		var codeBoxCode = '<%= function.getEscapedFullDescription() %>';
		
		var testData = <%= microtask.getTest().getTestDTO() %>;
		var simpleModeActive = testData.hasSimpleTest;		
		
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setOption("theme", "vibrant-ink");
	    myCodeMirror.setValue(testData.code);
	    
   		$(document).ready(function() 
   		{    			
   			$('#skip').click(function() { skip(); });	
   			
   			// Generate input elements for the simple test editor
   			$.each(paramNames, function(index, value) 
   			{
   				$('#parameterValues').append(value + ': &nbsp;&nbsp;<input type="text" class="input-xlarge"><BR>');
   			});   
   			
   			// Track whether we are currently in simple or advanced test writing mode
			$('a[data-toggle="tab"]').on('shown', function (e) 
			{
				if (e.target.id == 'simpleTestTab')
					simpleModeActive = true;
				else if (e.target.id == 'advancedTestTab')
					simpleModeActive = false;
			});
   			
   			showPrompt();
   			loadSimpleTestData(testData);			
   		});	    
	
		$('#writeTestForm').submit(function() {
			var formData = collectTestData();

			var functionHeader = '<%= function.getEscapedHeader() %>';
			// only looks at the function header not the function body for JSHINT checking
			var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
			var functionCode = allTheFunctionCode + " " + functionHeader + "{" + formData.code + "}";
			var errors = "";
		    console.log(functionCode);
		    var lintResult = JSHINT(getUnitTestGlobals() + functionCode,getJSHintGlobals());
		    console.log(JSHINT.errors);
			if(!lintResult && !simpleModeActive)
			{
				var errors = checkForErrors(JSHINT.errors);
				console.log(errors);
				if(errors != "")
				{
					$("#errors").html("<bold> ERRORS: </bold> <br />" + errors);
					return false; 
				}
			}
			
			submit(formData);			
			return false;
		});
		
		// Shows the appropriate prompt
		function showPrompt()
		{
			if (showWritePrompt)
	   			$("#writePrompt").css('display',"block");
			else if (showCorrectPrompt)
	   			$("#correctPrompt").css('display',"block");
			else if (showFunctionChangedPrompt)
   			{
   				$('#functionChangedPrompt').prettyTextDiff();
	   			$("#functionChangedPrompt").css('display',"block");	   			
   			}  				
		}
		
		// Configures the form based on the state from the testData object (in TestDTO format)
		function loadSimpleTestData(testData)
		{
			if (simpleModeActive)
			{
				$('#testTabs a[href="#simpleTest"]').tab('show');
				
				// For each of the parameters we have (up to the number of params we expect - which
				// might be smaller), populate it into the param textbox
				$.each(testData.simpleTestInputs, function(index, value)
				{
					// If we've exceeded the number of params we expect, stop populating
					if (index >= paramNames.length)
						return false;
					
					// Get the corresponding input element for this param and populate it
					$('#parameterValues').children('input').get(index).value = value;
				});
				$('#expectedOutput').val(testData.simpleTestOutput);
			}
			else
			{
				$('#testTabs a[href="#advancedTest"]').tab('show');		
			}			
		}		
		
		// Collects form data from simple and advanced tests (as appropriate) into an 
		// object in TestDTO format
		function collectTestData()
		{
			var code = buildTestCode();
			var simpleTestInputs = [];
			var simpleTestOutput = '';
			
			if (simpleModeActive)
			{			
				$.each($('#parameterValues').children('input'), function(index, inputElement)
				{
					simpleTestInputs.push(inputElement.value);
				});						
				simpleTestOutput = $('#expectedOutput').val();
			}
			
			return { code: code, hasSimpleTest: simpleModeActive, simpleTestInputs: simpleTestInputs, 
					 simpleTestOutput: simpleTestOutput };
		}
		
		function buildTestCode()
		{
			var code;
			
			if (simpleModeActive)
			{				
				// Build code corresponding to the values entered in simple mode.
				code = 'equal(<%= function.getName() %>(';
				
				// Add a parameter for each input element ni the parameterValues div				
				$.each($('#parameterValues').children('input'), function(index, inputElement)
				{
					// Add a comma for any but the first param
					if (index != 0)
						code = code + ', ';
					
					code = code + inputElement.value;
				});
				
				// TODO: this may not work for single quotes in the test descrption...
				code = code + '), ' + $('#expectedOutput').val() 
					+ ", '<%= StringEscapeUtils.escapeEcmaScript(microtask.getDescription()) %>'" + ");";
			}	
			else
			{
				code = $('#code').val();	
			}
			
			return code;
		}
	</script>


	<%@include file="/html/elements/microtaskTitle.jsp" %>
	
	<div id="writePrompt" style="display: none">
		Write a simple or advanced test for<BR>			
		<span class="label label-inverse"><%= microtask.getDescription() %></span><BR>
	</div>

	<div id="correctPrompt" style="display: none">
		The following issue was reported with this test:<BR>		
		<span class="label label-important"><%= microtask.getIssueDescription() %></span><BR>		
		Can you fix the test to address this issue?<BR>
	</div>
	
	<div id="functionChangedPrompt" style="display: none">
		The description of the function being tested has changed. Can you update the test below,
		if necessary? <BR>
		
		<span class="original" style="display: none"><%=microtask.getOldFunctionDescription() %></span>
   		<span class="changed" style="display: none"><%=microtask.getNewFunctionDescription() %></span>
		<span id="diff" class="diff"></span><BR>
	</div>
	
	<BR>Here's the description of the function to test:
	<%@include file="/html/elements/readonlyCodeBox.jsp" %>	
		
	<form id="writeTestForm" action="">
		<BR><BR><ul class="nav nav-tabs" id="testTabs">
		  <li><a href="#simpleTest" data-toggle="tab" id="simpleTestTab">Simple Test</a></li>
		  <li><a href="#advancedTest" data-toggle="tab" id="advancedTestTab">Advanced Test</a></li>
		</ul>		
		
		<div class="tab-content">
		  <div class="tab-pane active" id="simpleTest">
			<b>Parameter Values</b><BR>
				<div id="parameterValues"></div>
			<b>Expected Output</b><BR>
				<input type="text" id="expectedOutput" class="input-xlarge"><BR>
		  </div>
		  <div class="tab-pane" id="advancedTest">
			  <span class="reference">
						Reference Section:<br /><br />
						Assertions you can use when writing unit tests include: <br />
						deepEqual( actual, expected, message ): comparing to objects <br />
						equal( actual, expected, message ): check if both are equal <br />
						notDeepEqual( actual, expected, message ): <br />
						notEqual( actual, expected, message ): <br />
						throws( 'actual', expected, message ): if exception is expected, actual needs to be in ' <br />
						<br />
						Examples:<br />
						equal(price, qty*itemCost, "line item price looks incorrect");<br />
						equal(plus(5, 3), 8, "Two positive numbers don't sum correctly");
						</span><BR><BR>		      	
					{
					<table width="100%">
						<tr>
							<td width = "20"></td>
							<td><textarea id="code"></textarea></td>
						</tr>	
					</table>
					} <BR><BR>
		  </div>
		</div>				

		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>	
	</form>
	<div id = "errors"> </div>
</div>
