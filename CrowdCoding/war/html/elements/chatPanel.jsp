<!-- chat -->

<div id="chat" class="panel panel-default">
	<div class="panel-heading">Ask The Crowd</div>
	<div class="panel-body">
		<div id="chatOutput"></div>
		<textarea id="chatInput" rows="" cols=""></textarea>
	</div>
</div>

<script>
	$(document).ready(function(){
	
		// Setup chat service
		var chatRef = new Firebase(firebaseURL + '/chat');
	
		// Add a callback that is triggered for each chat message.
		chatRef.on('child_added', function (snapshot) 
		{
			var message = snapshot.val();
			$('#chatOutput').append("<div><span>" + message.workerHandle + "</span><span> " + message.text + "</div>");
			$('#chatOutput').scrollTop($('#chatOutput')[0].scrollHeight);
		});
		
		
		// When the user presses enter on the message input, write the message to firebase.
		$('#chatInput').keypress(function (e) {
		    console.log("keypress "+e.keyCode);
		    if (e.keyCode == 13) 
		    {
		      chatRef.push({text: $('#chatInput').val(), workerHandle: '<%=workerHandle%>'});
		      $('#chatInput').val('');
		      return false;
		    }
		});
	
	});
</script>