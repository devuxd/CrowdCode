<%
	String projectID = (String) request.getAttribute("project");

%>

<html>
<head>
	<script src="/include/jquery-2.1.0.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"></script> 	
	<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>
	<script type="text/javascript">

		$(document).ready(function()
		{
			var firebaseURL = 'https://crowdcode.firebaseio.com/projects/<%=projectID%>';
			var functionsRef = new Firebase(firebaseURL + '/artifacts/functions');
			functionsRef.on('value', function (snapshot) {
				console.log(snapshot.val());
			  for (var index in snapshot.val()){
			  		var functionRef=snapshot.val()[index];
			  		var code='';

			  		if(functionRef.written)
			  			code=snapshot.val()[index].code;
			  		else
			  			code='{ return null; }';


				  $('.inner').append( snapshot.val()[index].header +'\n'+ code +'\n');

				  }
			});

		});
		</script>
	</head>
	<body>
		
	<div class="inner" style="word-wrap: break-word; white-space: pre-wrap;"></div>

	</body>
	</html>
