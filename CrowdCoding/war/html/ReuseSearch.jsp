<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.artifacts.Function" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.ReuseSearch" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    ReuseSearch microtask = (ReuseSearch) worker.getMicrotask();	
%>

<script>
	var microtaskTitle = '<%= microtask.microtaskTitle() %>';
	var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
	var microtaskType = 'ReuseSearch';
	var microtaskID = <%= microtask.getID() %>;
	
	var functionDescriptions = <%=Function.getFunctionDescriptions(project) %>; 
	
	var minSearchTimePassed = false;
	var noFunction = false;
	var selectedFunction = '';
	
	$(document).ready(function() 
	{
		$('#noFunction').click(selectNoFunction);
	  	$('#skip').click(function() { skip(); });		
		$('#searchForm').submit(submitReuseSearch);
	});
	
	function submitReuseSearch() 
	{
		// Submit only if the worker has either selected a function or the no function button
		if (noFunction || selectedFunction != '')			
			submit({ functionName: selectedFunction, noFunction: noFunction });						
		
		return false;
	}
	
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
		if (re.test(functionDescription.header)) 
			score += 1;

	    return score;
	}
	
	function formatResult(functionDescription, index)
	{
		return '<div id="result_' + functionDescription.name + 
		        '" onclick="selectResult(\'' + functionDescription.name + 
				'\')" class="result"> <b>' + functionDescription.header + '</b> <BR>' +
				functionDescription.description.replace(/\n/g, '<BR>') + '</div>';		
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
		selectedFunction = '';	
		noFunction = true;	
		submitReuseSearch();
	}	

</script>

<%@include file="/html/elements/microtaskTitle.jsp" %>
Is there a function that does this?
<blockquote><%=microtask.getCallDescription()%></blockquote>
Here's a search box that searches existing function descriptions:<BR>

<form id="searchForm" action="">
	<input type="text" id="SearchText" class="input-large" oninput="doSearch()">
	<div id="results"></div><BR>	
	If you can't find any, click this:<br>
	<button id="noFunction" type="button" class="btn btn-primary">No function does this</button><BR><BR>		
	<%@include file="/html/elements/submitFooter.jsp" %>
</form>
