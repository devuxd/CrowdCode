<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.WriteTest" %>
<%@ page import="com.crowdcoding.dto.ParameterDTO" %>
<%@ page import="com.crowdcoding.util.FunctionHeaderUtil" %>
<%@ page import="com.fasterxml.jackson.databind.ObjectMapper" %>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils" %>
<%@ page import="java.io.StringWriter" %>
<%@ page import="java.io.Writer" %>
<%@ page import="java.util.List" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    WriteTest microtask = (WriteTest) crowdUser.getMicrotask();
    ObjectMapper mapper = new ObjectMapper();
    String description = microtask.getDescription();
    String methodFormatted = FunctionHeaderUtil.returnFunctionHeaderFormatted(microtask.getFunction());
    String allFunctionCodeInSystem = "'" + FunctionHeaderUtil.getDescribedFunctionHeaders(microtask.getFunction(), project) + "'";
    Writer strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getFunctionHeader());
    String functionHeader = strWriter.toString();
    strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.getFunction().getCode());
    String functionCode = strWriter.toString();
        strWriter = new StringWriter();
    mapper.writeValue(strWriter,microtask.generateDefaultUnitTest());
    String defaultVariable = strWriter.toString();
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;	
		var microtaskType = 'writetest';
		var microtaskID = <%= microtask.getID() %>;			
		
		var params = <%= ParameterDTO.getParamsJSON(microtask.getFunction()) %>;
		var simpleModeActive = true;
		
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setOption("theme", "vibrant-ink");
		debugger;
	    myCodeMirror.setValue(<%=defaultVariable%>);
	    
   		$(document).ready(function() 
   		{
   			$('#skip').click(function() { skip(); });	
   			
   			// Generate input elements for the simple test editor
   			$.each(params, function(index, value) 
   			{
   				$('#parameterValues').append(value.name + ': &nbsp;&nbsp;<input type="text" class="input-xlarge"><BR>');
   			});   
   			
   			// Track whether we are currently in simple or advanced test writing mode
   			$('#collapseOne').on('hide', function () {
 				 simpleModeActive = false;
			});
   			
   			$('#collapseOne').on('show', function () {
				 simpleModeActive = true;
			});   			
   		});	    
	
		$('#testForm').submit(function() {
			var code = buildTestCode();

			var functionHeader = <%= functionHeader %>;
			functionHeader = functionHeader.replace(/\"/g,"'");
			// only looks at the function header not the function body for JSHINT checking
			var allTheFunctionCode = <%= allFunctionCodeInSystem %>;
			var functionCode = allTheFunctionCode + " " + functionHeader + "{" + code + "}";
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
			
			submit({ code: code });			
			return false;
		});
		
		function buildTestCode()
		{
			var code;
			
			if (simpleModeActive)
			{				
				// Build code corresponding to the values entered in simple mode.
				code = 'equal(<%= microtask.getFunction().getName() %>(';
				
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
					+ ", '<%= StringEscapeUtils.escapeEcmaScript(description) %>'" + ");";
			}	
			else
			{
				code = $('#code').val();	
			}
			
			return code;
		}
	</script>


	<%@include file="/html/elements/microtaskTitle.jsp" %>
	<h5>
		<%= methodFormatted %><BR>	
		Write a unit test for the test case:
	</h5>

	<blockquote><%= description %></blockquote>
	
	<form id="testForm" action="">
		<BR><BR>
		<div class="accordion" id="testEditors">
		  <div class="accordion-group">
		    <div class="accordion-heading">
		      <a class="accordion-toggle" data-toggle="collapse" data-parent="#testEditors" href="#collapseOne">
		        	Simple Test
		      </a>
		    </div>
		    <div id="collapseOne" class="accordion-body collapse in">
		      <div class="accordion-inner">
					<b>Parameter Values</b><BR>
						<div id="parameterValues"></div>
					<b>Expected Output</b><BR>
						<input type="text" id="expectedOutput" class="input-xlarge"><BR>
		      </div>
		    </div>
		  </div>
		  <div class="accordion-group">
		    <div class="accordion-heading">
		      <a class="accordion-toggle" data-toggle="collapse" data-parent="#testEditors" href="#collapseTwo">
		        	Advanced Test
		      </a>
		    </div>
		    <div id="collapseTwo" class="accordion-body collapse">
		      <div class="accordion-inner">	
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
		  </div>
		</div>		

		<%@include file="/html/elements/submitFooter.jsp" %>	
	</form>
	<div id = "errors"> </div>
</div>
