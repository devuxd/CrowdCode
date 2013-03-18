<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteTestCases" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteTestCases microtask = (WriteTestCases) crowdUser.getMicrotask();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
%>


<div id="microtask">

	<script>
		var microtaskType = 'writetestcases';
		var microtaskID = <%= microtask.getID() %>;	
	
		var nextTestCase = 2;
	
	    $(document).ready(function()
	    {
		  	$('#skip').click(function() { skip(); });	
	    	
	    	$("#addTestCase").click(function()
	    	{
				$("#testCases").append(
					'<span id="testCase' + nextTestCase + '">' +
						'<input type="text" class="input-xxlarge" placeholder="Describe a test case"/>' +				
						'<a href="#" onclick="deleteTestCase(\'#testCase' + nextTestCase + '\')" class="closeButton">x</a>' +	
					'</span>');	
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



	<p><h5><%= methodFormatted %><BR>
In what situations or cases might this function misbehave, show unexpected results, or fail? Are there unexpected
corner cases that might not work?</h5></h5>

	
	<BR>
	<BR>

	<form id="testCasesForm" action="">
		<div id="testCases"></div>
		<button id="addTestCase" class="btn btn-small">Add test case</button>				
		<BR><BR><%@include file="/html/elements/submitFooter.jsp" %>
	</form>


</div>