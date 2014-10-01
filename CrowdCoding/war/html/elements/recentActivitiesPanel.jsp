
<div id="recentActivity" class="panel panel-default">
	<div class="panel-heading">Recent tasks</div>
	<table class="panel-body">
	</table>
</div>


<!-- Popup for viewing review. -->
<div id="popUpReview" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				not yet implemented
			</div>
			<div class="modal-body">
			  </div>
			<div class="modal-footer">
				<button id="" class="btn" data-dismiss="modal" aria-hidden="true">Close</button>

			</div>	
		</div>
	</div>
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

	// show review details popup
	function viewReview(microtaskID)
	{
		var microtaskRef = new Firebase(firebaseURL + '/microtasks/' + microtaskID);
		microtaskRef.once('value', function (snapshot) 
		{
			var data = snapshot.val();
			var header = '';
			var content = '';
			
			switch(data.type){
			
				case 'WriteFunction':
					header  = 'You edited this function:'
					content = '<div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div>';
					$("#popUpReview .modal-body").html(content);
					//setupReadonlyCodeBox(readonlyCodeBox, data.submission.description + data.submission.header + data.submission.code);
					break;
					
				case 'WriteTestCases':

					header  = 'You wrote these test cases:'
					content = 'test cases';
					$("#popUpReview .modal-body").html(content);
					break;
					
				case 'WriteFunctionDescription':
					header  = 'You wrote this function description:'
					content = 'function description';
					$("#popUpReview .modal-body").html(content);
					break;
					
				case 'WriteTest':
					header  = 'You wrote these tests:'
					content = 'tests';
					$("#popUpReview .modal-body").html(content);
					break;
					
				default:
					header = 'you reviewd a microtask';
					$("#popUpReview .modal-body").html(content);
			}
			
			$("#popUpReview").modal('show');
			
			$("#popUpReview .modal-header").html('<b>'+header+'</b');
			
			
					
		});
	}

	// add item to news feed
	function newNewsfeedItem(item)
	{
		var tr=document.createElement("tr");
		// if it's a review
		if(item.score==0){
			$(tr).html('<tr><td class="bg-success">Your review work has awarded you with <b>'+item.points+' points</b></td></tr>');
		} else if(item.score<3){ // it's a microtask with negative review
			$(tr).html('<tr><td class="bg-warning">Your work on '+item.description+' has been rejected</td></tr>');
		} else { // it's a microtask with positive review
			$(tr).html('<tr><td class="bg-success">Your work on '+item.description+' has awarded you with <b>'+item.points+' points</b></td></tr>');
		}
		// attach listener to click event on created tr and prepend it in the recentActivities list
		$(tr).on('click',function(){ viewReview(item.microtaskID) });
		$('#recentActivity table').prepend(tr);
	}
	 
</script>