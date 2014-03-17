<script>
	$(document).ready(function() 
	{  
		for (i = 0; i < allADTs.length; i++)
		{
			var adtsHTML = '<p><b>' + allADTs[i].name + '</b>&nbsp;&nbsp; fields: <i>'; 
			for (j = 0; j < allADTs[i].structure.length; j++)
			{
				if (j > 0)
					adtsHTML += ', ';
				adtsHTML += allADTs[i].structure[j].type + ' ' + allADTs[i].structure[j].name;
			}
			
			adtsHTML += '</i><BR>' + allADTs[i].description + '</p>';			
			$('#ADTList').append(adtsHTML.replace('\n', '<BR>'));
		}
	});
</script>

<div class="typeBrowser">
	<div class="adtListTitle">&nbsp;Data Structures
	    <!-- <span id="adtSearch" class="adtSearch">Search: <input type="text" class="input-small"/></span> -->
	</div>
	<div id='ADTList' class='adtList'></div>
</div>
