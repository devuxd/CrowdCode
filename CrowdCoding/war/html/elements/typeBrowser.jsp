<script>
	$(document).ready(function() 
	{  
		
				for (i = 0; i < allADTs.length; i++)
				{
					var adtsHTML = '<b>' + allADTs[i].name + '</b>&nbsp;&nbsp; properties-  '; 
					for (j = 0; j < allADTs[i].structure.length; j++)
					{
						if (j > 0)
							adtsHTML += ', ';
						adtsHTML += '"' + allADTs[i].structure[j].name + '": ' + allADTs[i].structure[j].type;
					}
					
					adtsHTML += '<BR><pre class="ADTDescriptionText">' + allADTs[i].description + '</pre>';			
					$('#ADTList').append(adtsHTML.replace('\n', '<BR>'));
				}	
		
		
		
	});
	
	
	
	
</script>

<div class="typeBrowser">
	<div class="adtListTitle">&nbsp;Types&nbsp;&nbsp;
	   <span class="adtSubtitle"> Type names may be String, Boolean, Number, any type 
	   below (bold text), and arrays of any type (e.g., String[], Number[][]).</span>
	    <!-- <span id="adtSearch" class="adtSearch">Search: <input type="text" class="input-small"/></span> -->
	</div>
	<div id='ADTList' class='adtList'></div>
</div>
