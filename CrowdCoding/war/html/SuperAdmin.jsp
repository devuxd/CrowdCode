<html>
<head>
<title>CrowdCode Super Admin</title>
<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" href="/html/styles.css">
<script src="/include/jquery-2.1.0.min.js"></script>
<script src="/include/bootstrap/js/bootstrap.min.js"> </script>
<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>

<style type="text/css">
#projects {
	list-style:none;
}

#projects span:first-child {
	font-weight:bold;
}
</style>

<script type="text/javascript">
		var firebaseURL = 'https://crowdcode.firebaseio.com';
		$(document).ready(function(){
			firebaseRef = new Firebase(firebaseURL + '/projects/');

			// Attach an asynchronous callback to read the data at our posts reference
			firebaseRef.on('value', function (snapshot) {
			  $.each(snapshot.val(),function(key,index){
				  
				  $('#projects').append(
					  $('<li>').append('<span><a href="/'+key+'">'+key+'</a>')
					  
				  )
				  console.log(key);
				  console.log(index);
			  });
			}, function (errorObject) {
			  console.log('The read failed: ' + errorObject.code);
			});
			
		});
	</script>
</head>
<body>
	<h2>Super Admin Page</h2>
	<ul id="projects">
	</ul>
</body>
</html>