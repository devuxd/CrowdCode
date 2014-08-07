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
    WriteTest microtask = (WriteTest) this.getServletContext().getAttribute("microtask");    
    
    Function function = microtask.getFunction(project);
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(project), project) + "'";
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
		var showTestCaseChangedPrompt = <%= (promptType == PromptType.TESTCASE_CHANGED) %>;	
		
		// Whether or not dispute mode is active
		var testInDispute = false;
		
		// Load test data
		var fullDescription = <%=function.getDescriptionDTO().json() %>;
		var returnType = fullDescription.returnType;
		var paramNames = fullDescription.paramNames;
		var paramTypes = fullDescription.paramTypes;
		var codeBoxCode = '<%= function.getEscapedFullDescription() %>';
		
		var testData = <%= microtask.getTest().getTestDTO() %>;
		
		var paramEditors = [];
		var outputEditor;
			    
   		$(document).ready(function() 
   		{    			
   			$('#skip').click(function() { skip(); });	
   			
   			// Generate input elements for the simple test editor
   			for (var index = 0; index < paramNames.length; index++)
   			{
   				var name = paramNames[index];
   				var type = paramTypes[index];   				
   				var paramID = "param" + index;   	
   				var testErrorsDiv = "testErrors" + index;    				
   				$('#parameterValues').append(name + ' (' + type + '): &nbsp;&nbsp;<textarea id="' 
   				    + paramID + '"></textarea>'
   					+ '<div class="alert alert-error" id="' + testErrorsDiv + '"></div>');
   			}  
   			   			
   			showPrompt();
   			loadTestData(testData);		
   			
   			// Setup TestEditor instances (has to be done after data loaded)
   			for (var index = 0; index < paramNames.length; index++)
   			{
  				var paramID = "param" + index;   
   				var testErrorsDiv = "testErrors" + index; 
  				var type = paramTypes[index];  
   				var jsonEditor = new JSONEditor();
   				jsonEditor.initialize($('#' + paramID)[0], $('#' + testErrorsDiv), type);
   				paramEditors.push(jsonEditor); 				
   			}
   			
   			// Generate a TestEditor for the expectedOutput
   			$('#expectedOutputTitle').html("Expected Return Value (" + returnType + ")");
   			outputEditor = new JSONEditor();
			outputEditor.initialize($('#expectedOutput')[0], $('#expectedOutputErrors'), returnType);    			
   		});	  
   		
   		$('#reportTestCase').click(function() { showDisputeForm(); });
   		$('#cancelDispute').click(function() { hideDisputeForm(); });   		
	
		$('#writeTestForm').submit(function() {
			if (testInDispute)				
			{
				// Submit empty test data for the test
				var formData = { code: '', inDispute: true, disputeText: $('#disputeText').val(), 
						hasSimpleTest: true, simpleTestInputs: [], simpleTestOutput: '' };
				submit(formData);				
			}
			else
			{
				var formData = collectTestData();
				var hasErrors = false;			

				// Loop over all the values. If any are empty or have errors, show an error message
				// and do not submit.			
				$.each(paramEditors, function(index, paramEditor)
				{
					paramEditor.errorCheck();
					if (!paramEditor.isValid())				
						hasErrors = true;
				});
				
				outputEditor.errorCheck();
				if (!outputEditor.isValid())				
					hasErrors = true;

				if (hasErrors)
				{
					$("#popUp").modal();
				}
				else
				{
					submit(formData);
				}
			}

			return false;			
		});
		
		// Shows the appropriate prompt
		function showPrompt()
		{
			if (showWritePrompt)
			{
	   			$("#writePrompt").css('display',"block");
	   			setupReadonlyCodeBox(writeCodeBox);
			}
			else if (showCorrectPrompt)
			{
	   			$("#correctPrompt").css('display',"block");
	   			setupReadonlyCodeBox(correctCodeBox);
			}
			else if (showFunctionChangedPrompt)
   			{
   				$('#functionChangedPrompt').prettyTextDiff();
	   			$("#functionChangedPrompt").css('display',"block");	   			
   			}
			else if (showTestCaseChangedPrompt)
   			{
	   			$("#testCaseChangedPrompt").css('display',"block");	 
	   			setupReadonlyCodeBox(testCaseChangedCodeBox);
   			}  	
		}
		
		// Configures the microtask to show information for disputing the test, hiding 
		// other irrelevant portions of the microtask.
		function showDisputeForm()
		{
			testInDispute = true;
   			$("#disputeDiv").css('display',"block");			
			$('#simpleTest').hide();
			$('#submitFooter').hide();
		}
		
		// Configures the microtask to hide the information for disputing the test, showing
		// other relevant information that may be hidden.
		function hideDisputeForm()
		{
			testInDispute = false;
   			$("#disputeDiv").css('display',"none");			
			$('#simpleTest').show();
			$('#submitFooter').show();
		}
		
		// Configures the form based on the state from the testData object (in TestDTO format)
		function loadTestData(testData)
		{
			// For each of the parameters we have (up to the number of params we expect - which
			// might be smaller), populate it into the param textbox
			$.each(testData.simpleTestInputs, function(index, value)
			{
				// If we've exceeded the number of params we expect, stop populating
				if (index >= paramNames.length)
					return false;
				
				// Get the corresponding textArea element for this param and populate it
				$('#parameterValues').children('textarea').get(index).value = value;
			});
			$('#expectedOutput').val(testData.simpleTestOutput);					
		}		
		
		// Collects form data from simple and advanced tests (as appropriate) into an 
		// object in TestDTO format
		function collectTestData()
		{
			var simpleTestInputs = [];
			var simpleTestOutput = '';
			
			$.each($('#parameterValues').children('textarea'), function(index, inputElement)
			{
				// Parse empty textboxes as empty strings
				var testInput = inputElement.value;
				if (testInput == "")
					testInput = "''";
				
				simpleTestInputs.push(testInput);
			});						
			
			simpleTestOutput = $('#expectedOutput').val();
			if (simpleTestOutput == "")				
				simpleTestOutput = "''";

			var code = buildTestCode(simpleTestInputs, simpleTestOutput);
			return { code: code, hasSimpleTest: true, inDispute: false, disputeText: '', 
				     simpleTestInputs: simpleTestInputs, simpleTestOutput: simpleTestOutput };
		}
		
		function buildTestCode(simpleTestInputs, simpleTestOutput)
		{
			var code;
			
			// Build code corresponding to the values entered in simple mode.
			code = 'equal(<%= function.getName() %>(';
			
			// Add a parameter for each input element in the parameterValues div				
			$.each(simpleTestInputs, function(index, input)
			{
				// Add a comma for any but the first param
				if (index != 0)
					code = code + ', ';
				
				code = code + input;
			});
			
			code = code + '), ' + simpleTestOutput 
				+ ", " + "'<%= StringEscapeUtils.escapeEcmaScript(microtask.getDescription()) %>'" + ");";
						
			return code;
		}
	</script>

	<%@include file="/html/elements/microtaskTitle.jsp" %>
	
	<form id="writeTestForm" action="">			
		<div id="writePrompt" style="display: none">
			Can you write a test for<BR>		<BR>
			<div class="alert alert-info"><%= microtask.getDescription() %>
	   		    <button class="btn btn-mini pull-right" type="button" id="reportTestCase">
	   		    	Report as incorrect test case</button>			
			</div>
			<BR>Here's the description of the function to test:<BR><BR>
			<div class="codemirrorBox"><textarea id="writeCodeBox"></textarea></div>
		</div>
	
		<div id="correctPrompt" style="display: none">
			The following issue was reported with this test:<BR><BR>
			<div class="alert alert-info"><%= microtask.getDescription() %></div>		
			<div class="alert alert-error"><%= microtask.getIssueDescription() %></div>	
			Can you fix the test to address this issue?<BR>
			
			<BR>Here's the description of the function to test:
			<div class="codemirrorBox"><textarea id="correctCodeBox"></textarea></div>
		</div>
		
		<div id="testCaseChangedPrompt" style="display: none">
			The test case for this has change from <BR><BR>
			<div class="alert alert-info"><%= microtask.getOldTestCase() %></div>	
			to <BR><BR>	
			<div class="alert alert-info"><%= microtask.getDescription() %></div>	
			Can you update the test below, if necessary?<BR>
			
			<BR>Here's the description of the function to test:
			<div class="codemirrorBox"><textarea id="testCaseChangedCodeBox"></textarea></div>
		</div>
		
		<div id="functionChangedPrompt" style="display: none">
			The description of the function being tested has changed. Can you update the test below,
			if necessary? <BR>
			
			<span class="original" style="display: none"><%=microtask.getOldFunctionDescription() %></span>
	   		<span class="changed" style="display: none"><%=microtask.getNewFunctionDescription() %></span>
			<span id="diff" class="diff"></span><BR>
			
			Here's the test description:
			<div class="alert alert-info"><%= microtask.getDescription() %></div>
		</div><BR>
		
		<div id="disputeDiv" style="display: none">
			What's wrong with this test case? <BR>			
			<textarea id="disputeText"></textarea><BR>
			<input class="btn btn-primary" type="submit" id="submitDispute" value="Submit"> 
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;			
			<a id="cancelDispute">Nothing is wrong with the test case.</a><BR><BR><BR>
		</div>
		
		<%@include file="/html/elements/typeBrowser.jsp" %><BR>

		<div id="simpleTest">
		    Provide a JSON object literal of the specified type for each parameter and the expected 
		    return value (e.g., { "propertyName": "String value" } ). To get started, you might want to copy
		    an example from the description of a type above.<BR><BR>  
		  
			<b>Parameter Values</b><BR>
				<div id="parameterValues"></div>
			<b><span id="expectedOutputTitle"></span></b><BR>
				<textarea id="expectedOutput"></textarea>
				<div class="alert alert-error" id="expectedOutputErrors"></div>
		</div>

		<div id="submitFooter"><BR><BR><%@include file="/html/elements/submitFooter.jsp" %></div>	
	</form>
	
	<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
		<h4 id="logoutLabel">You need to fix the errors before you submit.</h4>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>	
</div>
