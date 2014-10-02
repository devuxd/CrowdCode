<div id="leaderboard" class="panel panel-default ">
	<div class="panel-heading">Leaders</div>
	<table class="panel-body">
			<tr><td>no leaders yet!</td></tr>
	</table>
</div>
<script>
	$(document).ready(function(){
		// Hook the leaderboard to Firebase		
		var leaderboardRef = new Firebase(firebaseURL + '/leaderboard/leaders');
		leaderboardRef.on('value', function(snapshot) {
			fillLeaderboard(snapshot.val());
		});	
		
		var loggedInRef = new Firebase(firebaseURL + '/status/loggedInWorkers');
		loggedInRef.on('value', function(snapshot) {
			updateLoggedIn(snapshot.val());
		});	
	});
	 
	
	function fillLeaderboard(leaders)
	{
		if(leaders != null && Object.keys(leaders).length>0){
			var newHTML = '';
			$.each(leaders, function(index, leader)
			{
				newHTML += '<tr id="leader'+index+'">'+
						   '<td><img src="/user/picture?userId='+index+'" alt="" /></td>'+
						   '<td>' + leader.name + '</td>'+
						   '<td>' + leader.score + '</td>'+
						   '</tr>'
			});
			$('#leaderboard table').html(newHTML);
		}
	}
	
	function updateLoggedIn(loggedIn)
	{
		if(loggedIn != null && Object.keys(loggedIn).length>0){
			$('#leaderboard tr').removeClass('loggedIn');
			$.each(loggedIn, function(index, worker)
			{
				$('#leader'+index).addClass('loggedIn');
			});
		}
	}

</script>