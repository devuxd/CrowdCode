<div id="leaderboard" class="panel panel-default ">
	<div class="panel-heading">Leaders</div>
	<table class="panel-body">
			<tr><td>no leaders yet!</td></tr>
	</table>
</div>
<script>
	$(document).ready(function(){
		// Hook the leaderboard to Firebase		
		var leaderboardRef = new Firebase(firebaseURL + '/leaderboard');
		leaderboardRef.on('value', function(snapshot) {
		
			updateLeaderboardDisplay(snapshot.val());
		});	
	});
	 
	
	function updateLeaderboardDisplay(leaderboard)
	{
		if(leaderboard != null && Object.keys(leaderboard.leaders).length>0){
			var newHTML = '';
			$.each(leaderboard.leaders, function(index, leader)
			{
				newHTML += '<tr>'+
						   '<td><img src="/user/picture?userId='+index+'" alt="" /></td>'+
						   '<td>' + leader.name + '</td>'+
						   '<td>' + leader.score + '</td>'+
						   '</tr>'
			});
			$('#leaderboard table').html(newHTML);
		}
	}

</script>