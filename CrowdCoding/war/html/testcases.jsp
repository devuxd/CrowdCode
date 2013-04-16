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
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteTestCases microtask = (WriteTestCases) crowdUser.getMicrotask();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    
    PromptType promptType = microtask.getPromptType();
%>


<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
		var microtaskType = 'writetestcases';
		var microtaskID = <%= microtask.getID() %>;	
	
		var nextTestCase = 2;
		
		var showFunctionSignaturePrompt = <%= (promptType == PromptType.FUNCTION_SIGNATURE) %>;
		var showTestUserStoryPrompt = <%= (promptType == PromptType.TEST_USER_STORY) %>;
	
	    $(document).ready(function()
	    {
   		    // Based on the prompt type, load and setup the appropriate prompt divs
   		    if (showTestUserStoryPrompt)
	   			$("#testUserStoryPrompt").css('display',"block");
   			if (showFunctionSignaturePrompt)
	   			$("#testFunctionSignaturePrompt").css('display',"block");
	    	
	    	
		  	$('#skip').click(function() { skip(); });	
	    	
	    	$("#addTestCase").click(function()
	    	{
				$("#testCases").append(
					'<span id="testCase' + nextTestCase + '">' +
						'<input type="text" class="input-xxlarge" placeholder="Describe a test case"/>' +				
						'<button onclick="deleteTestCase(\'#testCase' + nextTestCase + '\')" class="close">&times;</button>' +	
					'</span>');	
				
				// Set focus to the new test case
				$('#testCase' + nextTestCase).find("input").eq(0).focus();
				
				nextTestCase = nextTestCase + 1;	
				return false;
	    	});
	    	
	    	$("#addTestCase").click();
	    	
			$('#testCasesForm').submit(function() {
				submit(collectFormData());
				return false;
			});
		});
	
		function collectFormData()
		{
			var formData = { tests: [] };			
		    $("span[id^=testCase]").each(function(){	    		    	
		    	formData.tests.push($(this).find("input").eq(0).val());
		    });
		    return formData;
		}	    
	    
		function deleteTestCase(testCase)
		{
			$(testCase).remove();
		}
		
	    $("input[type=text]").focus(function(){
	        // Select field contents
	        this.select();
	    });
	</script>


	<%@include file="/html/elements/microtaskTitle.jsp" %>
	<%= methodFormatted %><BR>
	
	
	<div id="testUserStoryPrompt" style="display: none">
		Consider the following user story: <BR>
		<%= microtask.getUserStoryText() %><BR><BR>
		
		<B>What are some examples of cases where this user story might occur? Are there any unexpected corner 
	cases that might not work?</B><BR><BR>		
	</div>

	<div id="testFunctionSignaturePrompt" style="display: none">
		<B>What are some cases in which this function might be used? Are there any unexpected corner 
		cases that might not work?</B><BR><BR>
	</div>

	
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
</div>