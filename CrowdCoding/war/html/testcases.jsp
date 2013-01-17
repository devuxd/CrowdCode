<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteTestCases" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>

<%
    Project project = Project.Create();
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    WriteTestCases microtask = (WriteTestCases) crowdUser.getMicrotask();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
%>


<div id="microtask">

	<script>
		
		var nextTestCase = 2;
	
	    $(document).ready(function()
	    {
	    	$("#addTestCase").click(function()
	    	{
				$("#testCases").append(
					'<span id="testCase' + nextTestCase + '">' +
						'<input type="text" class="input-xxlarge" value="Describe a test case"/>' +				
						'<a href="#" onclick="deleteTestCase(\'#testCase' + nextTestCase + '\')" class="closeButton">x</a>' +	
					'</span>');		
				return false;
	    	});
	    	
	    	$("#addTestCase").click();
	    	
			$('#testCasesForm').submit(function() {
				var formData = collectFormData();
				$.ajax({
				    contentType: 'application/json',
				    data: JSON.stringify( formData ),
				    dataType: 'json',
				    type: 'POST',
				    url: '/submit?type=writetestcases&id=<%= microtask.getID() %>',
				}).done( function (data) {  loadMicrotask() });
								
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



	<p><h4>We will be writing the following function: <BR><%= methodFormatted %><BR>
Your mission is to set up tests to identify whether or not it’s working.  Test it rigorously!
Think of ways that this function might misbehave/show unexpected results and briefly describe them here, in plain English.</h4>

	
	<BR>
	<BR>

	<form id="testCasesForm" action="">
		<div id="testCases"></div>
		<button id="addTestCase" class="btn btn-small">Add test case</button>				
		<BR><BR><input type="submit" value="Submit" class="btn btn-primary">
	</form>


</div>