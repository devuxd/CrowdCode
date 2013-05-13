
<input class="btn btn-primary" type="submit" id="mainSubmit" value="Submit" 
   data-toggle="popover" data-placement="top" data-content="Submit the work you've done on this microtask, and move on to the next." 
   title="Submit this microtask"/>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="" id="skip" 	   data-toggle="popover" data-placement="top" data-content="Skip over this microtask, discarding any work you did" 
   title="Skip this microtask">Skip</a><BR>

<span class="keyboardKey">Ctrl</span>+<span class="keyboardKey">Enter</span>
	
<script>
	$('#mainSubmit').popover({trigger: 'hover', delay: { show: 1000 }});
	$('#skip').popover({trigger: 'hover', delay: { show: 1000 }});
</script>