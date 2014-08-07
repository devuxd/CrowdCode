<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteTestCases" %>
<%@ page import="com.crowdcoding.microtasks.WriteTestCases.PromptType" %> 
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    WriteTestCases microtask = (WriteTestCases) this.getServletContext().getAttribute("microtask");
    PromptType promptType = microtask.getPromptType();
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		var microtaskType = 'writetestcases';
		var microtaskID = <%= microtask.getID() %>;	
		
		// Function description for the function description box.
		var codeBoxCode = '<%= microtask.getFunction().getEscapedFullDescription() %>';
		
		var testCases = <%= microtask.getEscapedTestCasesList(project) %>.testCases;	
		var nextTestCase = 1000;
		
		var showFunctionSignaturePrompt = <%= (promptType == PromptType.FUNCTION_SIGNATURE) %>;
		var showCorrectTestCasePrompt = <%= (promptType == PromptType.CORRECT_TEST_CASE) %>;
	
	    $(document).ready(function()
	    {
			setupReadonlyCodeBox(readonlyCodeBox);
			
			if (showFunctionSignaturePrompt)
   				$("#testFunctionSignaturePrompt").css('display',"block");	  
			if (showCorrectTestCasePrompt)
   				$("#fixTestCases").css('display',"block");	
	    	
		  	$('#skip').click(function() { skip(); });	
	    	
	    	$("#addTestCase").click(function()
	    	{
	    		var testCase = { text: '', added: true, deleted: false, id: nextTestCase };
				testCases.push(testCase);				
				addTestCase(testCase);
				
				// Set focus to the new test case
				$('#testCase' + nextTestCase).find("input").eq(0).focus();
												
				nextTestCase = nextTestCase + 1;	
				return false;
	    	});
	    	
	    	// If there are currently no test cases, create a first test case
	    	if (testCases.length == 0)
	    		$("#addTestCase").click();
	    	else
	    		loadTestCases(testCases);
	    	
			$('#testCasesForm').submit(function() {
				var formData = collectFormData();
				if (formData == null)
				{
					$("#popUp").modal();	
				}
				else
				{				
					console.log(JSON.stringify(formData));				
					submit(formData);
				}
				return false;
			});
		});
	
	    // Creates items for each specified test case
	    function loadTestCases(testCases)
	    {
	    	for (var i=0; i < testCases.length; i++)
	    		addTestCase(testCases[i]);	    	
	    }	    
	    
	    // Collects the form data. Returns null if there is not at least one current testcase.
		function collectFormData()
		{
	    	var countOfCurrentTestCases = 0;
	    	
			var formData = { testCases: [] };			
			for (var i=0; i < testCases.length; i++)
			{
				var testCase = testCases[i];
								
		    	// Get the value of the test case if it is not deleted
		    	if (!testCase.deleted)		    	
		    		testCase.text = $('#testCaseInput' + testCase.id).val();
		    	
		    	// Mark test cases with no text as deletes
		    	if (testCase.text == null || testCase.text.trim().length == 0)
		    		testCase.deleted = true;

		    	
		    	// Add to the list of test cases, unless it was both added and deleted, in which
		    	// case the test case was never submitted as a test case and can be ignored.
		    	if (!(testCase.added && testCase.deleted))
		    		formData.testCases.push(testCase);		
		    	
		    	// Count how many current test cases there are
		    	if (!testCase.deleted)
		    		countOfCurrentTestCases++;
		    }
			
			if (countOfCurrentTestCases == 0)
				return null;
			else			
		    	return formData;
		}	    
		
		function addTestCase(testCase)
		{
			var idString = "testCaseInput" + testCase.id;
			
    		$("#testCases").append(
					'<span id="testCase' + testCase.id + '">' +
						'<input type="text" class="input-xxlarge" id="' + idString + '" data-caseID="' + testCase.id
						      + '" placeholder="Describe a test case"/>' +				
						'<a href="#" onclick="deleteTestCase(\'#testCase' + testCase.id + '\', ' + testCase.id + 
								  ')" class="closeButton">&times;</a>' +	
					'</span>');	
    		
    		if (testCase.text != "")
    			$('#testCaseInput' + testCase.id).val(testCase.text);   		
		}		
	    
		function deleteTestCase(testCaseInput, id)
		{
			var testCase = findTestCase(id);
			if (testCase == null)
				return;
			
			testCase.deleted = true;			
			$(testCaseInput).remove();
		}
		
		// Given a test case id, finds the corresponding test case object. Returns null if no test
		// case can be found.
		function findTestCase(id)
		{
			for (var i = 0; i < testCases.length; i++)
			{
				if (testCases[i].id == id)
					return testCases[i];
			}
			
			return null;			
		}		
		
	    $("input[type=text]").focus(function(){
	        // Select field contents
	        this.select();
	    });
	</script>

	<%@include file="/html/elements/microtaskTitle.jsp" %>	
	
	<div id="testFunctionSignaturePrompt" style="display: none">
		What are some cases in which this function might be used? Are there any unexpected corner 
		cases that might not work?<BR><BR>
	</div>
	
	<div id="fixTestCases" style="display: none">
	    The following issue was reported with the following test case:<BR><BR>
	    
	    <div class="alert alert-info"><%= microtask.getDisputeDescription() %></div>		
		<div class="alert alert-error"><%= microtask.getDisputedTestCase() %></div>		    
	    
	    Can you fix the test case (and others if necessary) to address the issue?<BR><BR> 
	    (Note: if the above test case is not below, the test case has already been changed,
	    and you can ignore this microtask).<BR><BR>
	</div>
	
	<div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div><BR><BR>	
	
	<div class="accordion" id="exampleRoot">
	  <div class="accordion-group">
	    <div class="accordion-heading">
	      <a class="accordion-toggle" data-toggle="collapse" data-parent="#exampleRoot" href="#collapseOne">
	        	Show example
	      </a>
	    </div>
	    <div id="collapseOne" class="accordion-body collapse">
	      <div class="accordion-inner">
				subtract(a, b)<BR>
				
				<B>Here's some test cases:</B><BR>
				a is greater than b<BR>
				b is greater than a<BR>
				a is the same as b<BR>
				a is positive, b is negative<BR>
				a is negative, b is zero<BR>
				a is positive, b is zero<BR>
	      </div>
	    </div>
	  </div>
	</div>

	<form id="testCasesForm" action="">
		<div id="testCases"></div>
		<button id="addTestCase" class="btn btn-small">Add test case</button>				
		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>
	</form>
	
	<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
		<div class="logout-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">��</button>
			<h4 id="logoutLabel">Please write at least one test case.</h4>
		</div>
		<div class="modal-body"></div>
		<div class="modal-footer">
			<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
		</div>	
	</div>
</div>