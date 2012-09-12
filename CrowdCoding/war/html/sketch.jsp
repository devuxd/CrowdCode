<div id="microtask">
	<script src="codemirror.js"></script>
	<script src="javascript.js"></script>
	<script>
	    var myCodeMirror = CodeMirror.fromTextArea(code);
	    myCodeMirror.setOption("theme", "vibrant-ink");
	
		$('#sketchForm').submit(function() {
			var formData = { code: $("#code").val() };
			$.ajax({
			    contentType: 'application/json',
			    data: JSON.stringify( formData ),
			    dataType: 'json',
			    type: 'POST',
			    url: '/submit/sketch'
			});
							
			return false;
		});
	</script>


	<p><h3> This is the sketch phase. Write the method that takes the parameters given. and 
	returns what the description asks for. Use the pound symbol '#' to denote a line of pseudocode, 
	comment with //. If your method is not done, make sure one of your lines starts with # so it is 
	not flagged as complete! </h3>
	
	
	<form id="sketchForm" action="/submit/sketch">



	<BR>
	
	<jsp:include page="elements/methodDescription.jsp" />


	{ <BR>
	<table width="100%">
		<tr>
			<td width = "20"></td>
			<td><textarea id="code"></textarea></td>
		</tr>	
	</table>
	} <BR><BR>
	<input type="submit" value="Submit" />
	
	</form>

</div>