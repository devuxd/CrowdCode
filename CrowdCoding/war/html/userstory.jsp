<div id="microtask">

	<script>

      $('document').ready(function(){
		  $('#userstoryForm').submit(function() {
			  
			  	
			  	
				$.post('/submit/userstory', serializeValues(["userStory"]), function(data) {				  
				});
								
				
			  	return false;
			});
      });
      
      
      function serializeValues(names)
      {
  	  	  var obj = {};    	  
    	  $.each(names, function (index, name) {
    		  obj[name] = JSON.stringify($('#' + name).val());
    	  });
    	  
    	  return obj;
       }
      

      
	</script>




	<p><h3>This is the user story phase. Have a program you would like to create in mind, and write the 
	specifications here. Please be as descriptive and thorough as possible, as this is all the information all
	the other users will have to create the program.</h3></p>

	<form id="userstoryForm" action="">
		<textarea name="userStory" id="userStory"></textarea>
		<input type="submit" value="Submit" />
	</form>


</div>