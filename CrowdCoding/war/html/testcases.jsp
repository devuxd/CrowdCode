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



	<p><h4>This is the test case phase. Write some single line test cases for the given description. 
	These test cases will be used to create unit tests, so be descriptive! Try to think of some errors that 
	the given function may have trouble with.</h4>

	<%= methodFormatted %>
	<BR>
	<BR>

	<form id="testCasesForm" action="">
		<div id="testCases"></div>
		<button id="addTestCase" class="btn btn-small">Add test case</button>				
		<BR><BR><input type="submit" value="Submit" class="btn btn-primary">
	</form>


</div>