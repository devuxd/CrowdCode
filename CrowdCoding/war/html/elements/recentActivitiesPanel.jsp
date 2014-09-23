
<div id="recentActivity" class="panel panel-default">
	<div class="panel-heading">Recent tasks</div>
	<table class="panel-body">
	</table>
</div>

<script>
	$(document).ready(function(){
		// Hook the newsfeed to Firebase
		var newsfeedRef = new Firebase(firebaseURL + '/workers/<%=workerID%>/newsfeed');
		newsfeedRef.on('child_added', function(snapshot) {
			if (snapshot.val() != null)
				newNewsfeedItem(snapshot.val());
		});			
	});	

	function newNewsfeedItem(item)
	{
		var itemValue = item.description;
		var itemPoints = item.points;
		var cssClass = (item.points > 0) ? 'bg-success' : 'bg-warning';
		
		$('#recentActivity table').prepend(
			'<tr>'+
			'<td class="'+cssClass+'"><small>you scored <strong>'+itemPoints+'/5</strong>'+
			' on "description"<strong>+5pts</strong></small></td>'+
			'</tr>');
	}
	 
</script>