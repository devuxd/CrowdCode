
<div id="score" class="panel panel-default ">
	<div class="panel-heading">Your Score</div>
	<div class="panel-body">
		<span id="scoreValue" >0</span> <span>points</span>
	</div>
</div>


<script>
	$(document).ready(function(){
		// Hook the score to Firebase
		var scoreRef = new Firebase(firebaseURL + '/workers/<%=workerID%>/score');
		scoreRef.on('value', function(snapshot) { 
			if (snapshot.val() != null)
				updateScoreDisplay(snapshot.val());
		});		
	});
	 
	function updateScoreDisplay(points)
	{
		$('#scoreValue').html(points);
	}
</script>