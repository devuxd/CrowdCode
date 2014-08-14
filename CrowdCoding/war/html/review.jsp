<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.crowdcoding.Project" %>
<%@ page import="com.crowdcoding.Worker" %>
<%@ page import="com.crowdcoding.microtasks.Review" %>

<%
	String projectID = (String) request.getAttribute("project");
	Project project = Project.Create(projectID);
    Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);
    Review microtask = (Review) this.getServletContext().getAttribute("microtask");    
%>

<div id="microtask">
	<script>
		var microtaskTitle = '<%= microtask.microtaskTitle() %>';
		var microtaskSubmitValue = <%= microtask.getSubmitValue() %>;
	
		var microtaskType = 'Review';
		var microtaskID = <%= microtask.getID() %>;	
		var microtaskIDUnderReview = <%= microtask.getMicrotaskIDUnderReview() %>;
	
	    $(document).ready(function()
		{    	
   			$('#skip').click(function() { skip(); });	
			$("#reviewForm").submit(function()
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
						qualityScore: $('#qualityRating').children().filter(':checked').val(), 
						quantityScore: $('#quantityRating').children().filter(':checked').val() }; 
	    }
	    
	    function loadMicrotaskUnderReview(microtaskIDUnderReview)
	    {
	    	var microtaskSubmitRef = new Firebase(firebaseURL + '/history/microtaskSubmits/' + microtaskIDUnderReview);
	    	microtaskSubmitRef.on('value', function (snapshot) 
			{
	    		var microtaskSubmitted = snapshot.val();
	    		var displayContent = '<div>';
	    		
	    		
	    		if (microtaskSubmitted.microtaskType == 'writetestcases')
	    			displayContent += displayWriteTestCases(microtaskSubmitted);
	    		
	    		displayContent += '</div>';
	    		$('#microtaskUnderReviewDiv').html(displayContent);
			});
	    }
	    
	    function displayWriteTestCases(microtask)
	    {
	    	alert('write test cases');
	    	
	    	var content = '<b>Write test cases</b><BR>';
	    	
	    	// Load the current copy of the test cases from the local VCS. Do a text diff
	    	// between the new version and the old version.
	    	
	    	// TODO: we need to display a signature box of the function under test.
	    	
	    	// We need to get the right version of the signature.... We want to get the signature
	    	// at the time the work was done, as it may have changed since then.
	    	
	    	
			return content;	    				 
	    	
	    	

	    	
	    }
	    
	    

	</script>
	
	<%@include file="/html/elements/microtaskTitle.jsp" %>
	
	The following work has been submitted: <BR>
	<div id='microtaskUnderReviewDiv'></div><BR>
	
	
	<form id="reviewForm" action="">
		<div id="ratingsDiv">
			<fieldset class="rating" id="qualityRating">
			    <legend>Please rate the quality of this work:</legend>
			    <input type="radio" id="quality-star5" name="ratingQuality" value="5" /><label for="quality-star5" title="Really awesome">5 stars</label>
			    <input type="radio" id="quality-star4" name="ratingQuality" value="4" /><label for="quality-star4" title="Pretty good">4 stars</label>
			    <input type="radio" id="quality-star3" name="ratingQuality" value="3" /><label for="quality-star3" title="Just good enough">3 stars</label>
			    <input type="radio" id="quality-star2" name="ratingQuality" value="2" /><label for="quality-star2" title="Should be rejected">2 stars</label>
			    <input type="radio" id="quality-star1" name="ratingQuality" value="1" /><label for="quality-star1" title="Pretty terrible">1 star</label>
			</fieldset>
			<fieldset class="rating" id="quantityRating">
			    <legend>Please rate the level of contribution of this work:</legend>
			    <input type="radio" id="star5" name="ratingQuantity" value="5" /><label for="star5" title="A big effort!">5 stars</label>
			    <input type="radio" id="star4" name="ratingQuantity" value="4" /><label for="star4" title="Solid contribution">4 stars</label>
			    <input type="radio" id="star3" name="ratingQuantity" value="3" /><label for="star3" title="Small, but meaningful">3 stars</label>
			    <input type="radio" id="star2" name="ratingQuantity" value="2" /><label for="star2" title="Really small">2 stars</label>
			    <input type="radio" id="star1" name="ratingQuantity" value="1" /><label for="star1" title="Effectively zero">1 star</label>
			</fieldset>
		</div>	
		
		<BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR><BR>
		
		<B>Please briefly explain your ratings:</B><BR>
		<textarea id="reviewText"></textarea><BR><BR>
	
	
		<%@include file="/html/elements/submitFooter.jsp" %>
	</form>
	

</div>	