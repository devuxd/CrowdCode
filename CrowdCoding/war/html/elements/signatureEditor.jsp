<script>
	var nextParam = 2;
	
	$(document).ready(function()
	{
		$("input[type=text]").focus(function(){
		    // Select field contents
		    this.select();
		});
		
		$("#addParameter").click(function()
		{
			$("#addParamRow").before('<tr id="params' + nextParam + '"><td></td><td>' +						
				    '<input type="text" onblur="checkLength(this)" placeholder = "paramName" class="input-small">,&nbsp;&nbsp;//' + 
					'&nbsp;<input type="text" placeholder = "type" class="input-small">&nbsp;&nbsp;-&nbsp;&nbsp;' + 
					'<input type="text" placeholder = "what is it for?" class="input-xlarge"> ' +	
					'<a href="#" onclick="deleteParams(\'#params' + nextParam + '\')" class="closeButton">x</a>' +	
					'</td>');
			// Set focus to the first input field in the new row.
			$('#params' + nextParam).find("input").eq(0).focus();

			nextParam++;						
			return false;
		});
	});
			  
	function deleteParams(params)
	{
		$(params).remove();
	}
	
	function checkLength(inputText)
	{
		inputText.value = inputText.value.trim();
		if(inputText.value.split(" ").length > 1)
		{
		 	$("#popUp").modal();
		 	inputText.value = inputText.value.split(" ").join("");
		}
	}
	
	function collectSignatureData()
	{
		var formData = { name: $("#name").val(),
			     	description: $("#functionDescription").val(),
			     	returnType: $("#returnType").val(),
			     	parameters: [] };				
	    $("tr[id^=params]").each(function(){	    		    	
	    	formData.parameters.push( { name: $(this).find("input").eq(0).val(), 
	    								 type: $(this).find("input").eq(1).val(),
	    								 description: $(this).find("input").eq(2).val() });
	    });
	    return formData;
	}

</script>


<textarea id="functionDescription" draggable="true" placeholder="What does the function do?"></textarea>
returns &nbsp;&nbsp;<input type="text" id="returnType" value = "void" class="input-medium"><BR>
function 
<input type="text" id="name" onblur="checkLength(this)" placeholder = "functionName" class="input-medium">(
<BR>
<table>
	<tr id="params1">
		<td width="20">
		<td>
			<input type="text" onblur="checkLength(this)" placeholder = "paramName" class="input-small">,&nbsp;&nbsp;// 
			<input type="text" placeholder = "type" class="input-small">&nbsp;&nbsp;-&nbsp; 
			<input type="text" placeholder = "what's it for?" class="input-xlarge">
			<a href="#" onclick="deleteParams('#params1')" class="closeButton">x</a>		
		<td>
	<tr>
	<tr id="addParamRow">
		<td></td>					
		<td><button id="addParameter" class="btn btn-small">Add parameter</button></td>			
	</tr>
</table>
);


<div id="popUp" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="logout-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
		<h3 id="logoutLabel">This field may only be 1 word</h3>
	</div>
	<div class="modal-body"></div>
	<div class="modal-footer">
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
</div>	







