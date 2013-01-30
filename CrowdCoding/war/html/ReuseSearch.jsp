<%@ page import="com.crowdcoding.artifacts.Project" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.ReuseSearch" %>

<%
	Project project = Project.Create();
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
    ReuseSearch microtask = (ReuseSearch) worker.getMicrotask();	
%>

<!--  [{ 'name': 'cool', 
		  'description': 'bar bal baz bar bal rhino boring',
		  'returnType': 'void', 'parameters': [{
	        'name': 'arg1', 'type': 'String', 'description': 'this is arg1' }]},
	{ 'name': 'boring', 
				  'description': 'bar bal baz bar bal rhino boring',
				  'returnType': 'void', 'parameters': [{
	        'name': 'arg1', 'type': 'String', 'description': 'this a nifty arg' }]},
	{ 'name': 'nifty', 
				  'description': 'bar bal baz bar bal rhino boring',
				  'returnType': 'void', 'parameters': [{
	        'name': 'arg1', 'type': 'String', 'description': 'a cool arg' }]},
	{ 'name': 'red', 
				  'description': 'bar bal baz bar bal rhino boring',
				  'returnType': 'void', 'parameters': [{
	        'name': 'arg1', 'type': 'String', 'description': 'a more boring arg' }]},
	{ 'name': 'blue', 
				  'description': 'bar bal baz bar bal rhino boring',
				  'returnType': 'void', 'parameters': [{
	        'name': 'arg1', 'type': 'String', 'description': 'a green arg' }]},
	{ 'name': 'green',
				  'description': 'bar bal baz bar bal rhino boring',
				  'returnType': 'void', 'parameters': [{
	        'name': 'arg1', 'type': 'String', 'description': 'a red parameter' }]}]; -->

<script>
	var functionDescriptions = <%=Function.getFunctionDescriptions() %>; 
	
	var minSearchTimePassed = false;
	var noFunction = false;
	var selectedFunction = '';
	
	$(document).ready(function() 
	{
		$('#noFunction').click(selectNoFunction);
		$('#searchForm').submit(function() 
		{
			// Submit only if the worker has either selected a function or the no function button
			if (noFunction || selectedFunction != '')
			{
				var formData = { functionName: selectedFunction, noFunction: noFunction };
				$.ajax({
				    contentType: 'application/json',
				    data: JSON.stringify( formData ),
				    dataType: 'json',
				    type: 'POST',
				    url: '/submit?type=ReuseSearch&id=<%= microtask.getID() %>'
				}).done( function (data) { loadMicrotask();	});
			}			
			
			return false;
		});
	});
	
	function doSearch()
	{
		// TODO: only do search if there's a 300 ms delay
		
		var searchText = $('#SearchText').val();
		var matches = findMatches(searchText);
		var resultsHTML = '';
		$.each(matches, function(index, match)		
		{
			resultsHTML += formatResult(match.value, index);
		});
		
		$('#results').html(resultsHTML);		
	}
		
	function findMatches(searchText)
	{
		var re = new RegExp(searchText);
		var results = [];
		
		$.each(functionDescriptions, function(index, value) 
		{
			var score = computeMatchScore(value, re);
			if (score > 0)
				results.push({ 'score': score, 'value': value});							
		});
		
		// Sort the results in descending order (from high to low score)
		results.sort(function(a, b)
		{
			return b.score - a.score;
		});
		
		return results;
	}
	
	function computeMatchScore (functionDescription, re) 
	{
		// Loop over each piece of the function description. For each piece that matches regex,
		// add one to score. For matches to function name, add 5.
		var score = 0;
		
		if (re.test(functionDescription.name)) 
			score += 5;
		if (re.test(functionDescription.description)) 
			score += 1;
		if (re.test(functionDescription.returnType)) 
			score += 5;
		
		$.each(functionDescription.parameters, function(index, value) 
		{
			if (re.test(value.name)) 
				score += 1;
			if (re.test(value.type)) 
				score += 1;
			if (re.test(value.description)) 
				score += 1;			
		});
	
	    return score;
	}
	
	function formatResult(functionDescription, index)
	{
		var result = '<div id="result_' + functionDescription.name + 
		        '" onclick="selectResult(\'' + functionDescription.name + 
				'\')" class="result"> <b>function ' + functionDescription.name + '</b> ( <BR>';
		var temp = functionDescription.parameters;
		
		$.each(temp, function(index, param)
		{
			result += '&nbsp;&nbsp;&nbsp; ' + param.name + ', // ' + param.type + ' - ' 
				+ param.description + '<BR>';	
		});
		result += ') // returns ' + functionDescription.returnType + '<BR>' 
		     + functionDescription.description + '</div>';
		
		return result;
	}
	
	function selectResult(functionName)
	{
		// Toggle the no function button to off if it is currently selected
		if (noFunction)
		{
			noFunction = false;
			$('#noFunction').button('toggle');
		}
		
		// If there's currently a function selected, toggle it off
		if (selectedFunction != '')
			$('result_' + selectedFunction).removeClass('selectedResult');						
		
		selectedFunction = functionName;
		$('result_' + functionName).addClass('selectedResult');
	}
	
	function selectNoFunction()
	{
		// If there's currently a function selected, toggle it off
		if (selectedFunction != '')
		{
			$('result_' + selectedFunction).removeClass('selectedResult');			
			selectedFunction = '';				
		}		
		
		// only toggle if no function is not already selected
		if (!noFunction)
		{
			noFunction = true;		
			$('#noFunction').button('toggle');
		}
	}	

</script>

Is there a function that does this?

<h4><%=microtask.getCallDescription()%></h4><bR>
Here's a search box that searches existing function descriptions:<BR>


<form id="searchForm" action="">
	<input type="text" id="SearchText" class="input-small" oninput="doSearch()">
	<div id="results"></div><BR>	
	If you can't find any, click this button and then submit:<br>
	<button id="noFunction" type="button" class="btn">No function does this</button><BR><BR>		
	<input type="submit" value="Submit" class="btn btn-primary"/>
</form>
