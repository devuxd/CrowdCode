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
		var returnType = fullDescription.returnType;
		var paramNames = fullDescription.paramNames;
		var paramTypes = fullDescription.paramTypes;
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
   			
   			// Track whether we are currently in simple or advanced test writing mode
			$('a[data-toggle="tab"]').on('shown', function (e) 
			{
				if (e.target.id == 'simpleTestTab')
					simpleModeActive = true;
				else if (e.target.id == 'advancedTestTab')
				{
					simpleModeActive = false;
				    myCodeMirror.refresh();
				}
			});
   			
   			showPrompt();
   			loadTestData(testData);		
   			
   			// Setup TestEditor instances (has to be done after data loaded)
   			for (var index = 0; index < paramNames.length; index++)
   			{
  				var paramID = "param" + index;   
   				var testErrorsDiv = "testErrors" + index; 
  				var type = paramTypes[index];  
   				jsonEditor = new JSONEditor();
   				jsonEditor.initialize($('#' + paramID)[0], $('#' + testErrorsDiv), type);
   			}
   			
   			// Generate a TestEditor for the expectedOutput
   			$('#expectedOutputTitle').html("Expected Return Value (" + returnType + ")");
   			var outputEditor = new JSONEditor();
			outputEditor.initialize($('#expectedOutput')[0], $('#expectedOutputErrors'), returnType);    			
   		});	    
	
		$('#writeTestForm').submit(function() {
			var formData = collectTestData();

			var hasErrors = false;
			
			if (simpleModeActive)
			{
				// Loop over all the values. If any are empty or have errors, show an error message
				// and do not submit.
				
				$.each($('#parameterValues').children('textarea'), function(index, inputElement)
				{
					// Parse empty textboxes as empty strings
					var testInput = inputElement.value;
					if (testInput == "")
						hasErrors = true;
				});						
				if ($('#expectedOutput').val() == "")				
					hasErrors = true;
			}
			else
			{			
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
						hasErrors = true;
					}
				}
			}
			
			if (hasErrors)
			{
				$("#popUp").modal();
			}
			else
			{
				submit(formData);
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
		}
		
		// Configures the form based on the state from the testData object (in TestDTO format)
		function loadTestData(testData)
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
					
					// Get the corresponding textArea element for this param and populate it
					$('#parameterValues').children('textarea').get(index).value = value;
				});
				$('#expectedOutput').val(testData.simpleTestOutput);
			}
			else
			{
				$('#testTabs a[href="#advancedTest"]').tab('show');		
			    myCodeMirror.refresh();
			}			
		}		
		
		// Collects form data from simple and advanced tests (as appropriate) into an 
		// object in TestDTO format
		function collectTestData()
		{
			var simpleTestInputs = [];
			var simpleTestOutput = '';
			
			if (simpleModeActive)
			{			
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
			}
			var code = buildTestCode(simpleTestInputs, simpleTestOutput);
			return { code: code, hasSimpleTest: simpleModeActive, simpleTestInputs: simpleTestInputs, 
					 simpleTestOutput: simpleTestOutput };
		}
		
		function buildTestCode(simpleTestInputs, simpleTestOutput)
		{
			var code;
			
			if (simpleModeActive)
			{				
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
		Write a simple or advanced test for<BR>		<BR>
		<div class="alert alert-info"><%= microtask.getDescription() %></div>
		
		<BR>Here's the description of the function to test:
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
	
	<div id="functionChangedPrompt" style="display: none">
		The description of the function being tested has changed. Can you update the test below,
		if necessary? <BR>
		
		<span class="original" style="display: none"><%=microtask.getOldFunctionDescription() %></span>
   		<span class="changed" style="display: none"><%=microtask.getNewFunctionDescription() %></span>
		<span id="diff" class="diff"></span><BR>
		
		Here's the test description:
		<div class="alert alert-info"><%= microtask.getDescription() %></div>
	</div><BR>
	
	<%@include file="/html/elements/typeBrowser.jsp" %>
	
	<form id="writeTestForm" action="">
		<BR><ul class="nav nav-tabs" id="testTabs">
		  <li><a href="#simpleTest" data-toggle="tab" id="simpleTestTab">Simple Test</a></li>
		  <li><a href="#advancedTest" data-toggle="tab" id="advancedTestTab">Advanced Test</a></li>
		</ul>		
		
		<div class="tab-content">
		  <div class="tab-pane active" id="simpleTest">
		    Provide a JSON object literal of the specified type for each parameter and the expected 
		    return value (e.g., { "propertyName": "String value" } ).<BR><BR>  
		  
			<b>Parameter Values</b><BR>
				<div id="parameterValues"></div>
			<b><span id="expectedOutputTitle"></span></b><BR>
				<textarea id="expectedOutput"></textarea>
				<div class="alert alert-error" id="expectedOutputErrors"></div>
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
	
	<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
		<h3 id="logoutLabel">Please fix the listed errors and ensure all values have been provided and try again!</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
	
</div>
