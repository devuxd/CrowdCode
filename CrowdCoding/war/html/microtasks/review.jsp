<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.entities.Project" %>
<%@ page import="com.crowdcoding.entities.Worker" %>
<%@ page import="com.crowdcoding.entities.microtasks.Review" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Review microtask = (Review) this.getServletContext().getAttribute("microtask");    
%>

<script>
	var microtaskTitle = '<%= microtask.microtaskTitle() %>';
	var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;

	var microtaskType = 'Review';
	var microtaskID = <%= microtask.getID() %>;	
	var microtaskIDUnderReview = <%= microtask.getMicrotaskIDUnderReview() %>;

    $(document).ready(function()
	{    	
  		$('#skipBtn').click(function() { skip(); });	
		$("#taskForm").submit(function()
		{		
			submit(collectReviewFormData());
			return false;
		});
		
		loadMicrotaskUnderReview(microtaskIDUnderReview);			
	});
    
    // Colects data from the review form, building and returning the appropriate JSON object for submission
    function collectReviewFormData()
    {
    	return { microtaskIDReviewed: microtaskIDUnderReview, reviewText: $('#reviewText').val(),
					qualityScore: $('#qualityRating').children().filter(':checked').val() }; 
    }
    
    function loadMicrotaskUnderReview(microtaskIDUnderReview)
    {
    	var microtaskSubmitRef = new Firebase(firebaseURL + '/microtasks/' + microtaskIDUnderReview);
    	microtaskSubmitRef.once('value', function (snapshot) 
		{
		
    		displayReviewMaterial(microtaskUnderReviewDiv, snapshot.val());
		});
    }
</script>
	
<%@include file="/html/elements/microtaskTitle.jsp" %>
	
<div id="taskDescription" class="bg-success">
	The following work has been submitted: <BR><BR>
	<div id='microtaskUnderReviewDiv' class='workUnderReview'></div><BR>
</div>
	
		
<form id="taskForm" action="">
	<div class=" bg-warning">
		<div id="ratingsDiv">
			<p><B>Please rate the quality of this work:</B></p><BR>
			<fieldset class="rating" id="qualityRating">
			    <input type="radio" id="quality-star5" name="ratingQuality" value="5" /><label for="quality-star5" title="Really awesome">5 stars</label>
			    <input type="radio" id="quality-star4" name="ratingQuality" value="4" /><label for="quality-star4" title="Pretty good">4 stars</label>
			    <input type="radio" id="quality-star3" name="ratingQuality" value="3" /><label for="quality-star3" id="star3label" title="Just good enough">3 stars</label>
			    <input type="radio" id="quality-star2" name="ratingQuality" value="2" /><label for="quality-star2" title="Should be rejected">2 stars</label>
			    <input type="radio" id="quality-star1" name="ratingQuality" value="1" /><label for="quality-star1" title="Pretty terrible">1 star</label>
			</fieldset>
			<p id="ratinglegend">Work rated 3 or above will be accepted.</p>
		</div>	
	
		<B>Please briefly explain your rating:</B><BR>
		<textarea id="reviewText"></textarea>
	</div>
	<br />
	
	<%@include file="/html/elements/microtaskFormButtons.jsp"%>
</form>