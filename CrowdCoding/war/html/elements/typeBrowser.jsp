<script>

	// List each ADT
	var adtsHTML = '';

	for (i = 0; i < allADTs.length; i++)
	{
		adtsHTML += '<p><b>' + allADTs[i].name + '</b>&nbsp;&nbsp; fields: '; 
		for (j = 0; j < allADTs[i].structure.length; j++)
		{
			if (j > 0)
				adtsHTML += ', ';
			adtsHTML += allADTs[i].structure[j].type + ' ' + allADTs[i].structure[j].name;
		}
		
		adtsHTML += '<BR>' + allADTs[i].description + '</p>';			
		$('#ADTList').append(adtsHTML);
	}

</script>

<div id='ADTList' class='adtList'>
	<div class="adtListTitle">Data Structures
	    <span id="adtSearch" class="adtSearch">Search: <input type="text" class="input-small"/></span>
	</div>
</div>
