<html>
<head>
	<title>CrowdCode User Story Editor</title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="/html/styles.css">
	<script src="/include/jquery-1.8.2.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
	<script src='https://cdn.firebase.com/v0/firebase.js'></script>	
	<script>
		var firebaseURL = 'https://crowdcode.firebaseio.com/userStories/';
		var firebaseRef;
		
		// User stories are numbered from 0 to userStoryCount - 1.
		var userStoryCount = 0;
	
		$(document).ready(function()
		{
			$('#addUserStory').click(function()
			{
				addUserStory('');
			});
			$('#save').click(function()
			{
				firebaseRef = new Firebase(firebaseURL + $('#project').val() + '/userStories');
				var userStories = [];
				$("textarea[id^=userStory]").each(function(){	    		    	
			    	userStories.push( $(this).val() );
			    });
				firebaseRef.set(userStories);
			});
			$('#load').click(function()
			{
				// Delete all the existing user stories
				$('#userStories').html('');
								
				// Add user stories for each user story in firebase				
				firebaseRef = new Firebase(firebaseURL + $('#project').val() + '/userStories');
				firebaseRef.once('value', function(dataSnapshot) 
				{ 
					$.each(dataSnapshot.val(), function(index, text)
					{
						addUserStory(text);						
					});
				});
			});
		});	
		
		function addUserStory(text)
		{
			$('#userStories').append('<div id="userStoryDiv' + userStoryCount + '">'
					+ '<textarea class="userStoryDescrip" id="userStory' 
					+ userStoryCount + '">' + text + '</textarea><a href="#" onclick="deleteUserStory(\'#userStoryDiv' 
					+ userStoryCount + '\')" class="closeButton">x</a></div>');
			userStoryCount++;
		}
		
		function deleteUserStory(userStory)
		{
			$(userStory).remove();
		}
		
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Welcome to the <b>CrowdCode User Story Editor</b></h3>
			Enter a project name in the textbox below to retrieve user stories for the project.
			If it does not exist, it will be created. Use the special project name "default" to
			set the user stories for projects that do not have user stories specified.<BR><BR>
		
		   	<input type="text" class="input-xlarge" id="project">
		   	<button id="load" class="btn btn-small">Load</button> 
			<div id="userStories"></div>	
			<button id="save" class="btn btn-primary">Save</button>	   	
		   	<button id="addUserStory" class="btn btn-small">Add user story</button><BR>
	
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>