<%@ page import="com.crowdcoding.entities.Project" %>
<%@ page import="com.crowdcoding.entities.Function" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.entities.Worker" %>
<%@ page import="com.crowdcoding.entities.microtasks.ReuseSearch" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
	Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
	ReuseSearch microtask = (ReuseSearch) this.getServletContext().getAttribute("microtask");
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
	
	var codeBoxCode = '<%= microtask.getCaller().getEscapedCode() %>';	
	
	$(document).ready(function() 
	{
		$('#noFunction').click(selectNoFunction);
	  	$('#skipBtn').click(function() { skip(); });		
		$('#taskForm').submit(submitReuseSearch);
		setupReadonlyCodeBox(readonlyCodeBox, codeBoxCode);
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


<div id="taskDescription" class="bg-success">
	Is there a function that does<BR>
	<span class="label label-inverse"><%=microtask.getCallDescription()%></span><BR><BR>
	Use the search box to see if a function exists to do this. Otherwise, select "No function does this".<BR><BR>
	
	<a id="showContext" data-toggle="collapse" data-target="#callContext">Show context</a> 
	<div id="callContext" class="collapse"><div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div></div><BR>
</div>

<form id="searchForm" action="">
	<div class=" bg-warning">
		<input type="text" id="SearchText" class="input-large" oninput="doSearch()">
		<div id="results"></div><BR>	
		If you can't find any, click this:<br>
		<button id="noFunction" type="button" class="btn btn-primary">No function does this</button>
	</div>
	<br />
	
	<%@include file="/html/elements/microtaskFormButtons.jsp"%>
</form>
