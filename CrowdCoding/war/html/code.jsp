<%
	String projectID = (String) request.getAttribute("project");

%>

<html>
<head>
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"></script> 	
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script>

		$(document).ready(function()
		{
			var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
			var functionsRef = new Firebase(firebaseURL + '/artifacts/functions');
			$('.inner').append(function(e)
			{
				dataSnapshot.forEach(function(childSnapshot) {
				  // key will be "fred" the first time and "wilma" the second time
				  var key = childSnapshot.key();
				  // childData will be the actual contents of the child
				  var childData = childSnapshot.val();
				});
				return 'ciao asf asf asf';
			});

		});
		</script>
	</head>
	<body>
		
	<div class="inner"></div>

	</body>
	</html>
