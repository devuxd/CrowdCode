<a href="#javascriptTutorial"  role="button" data-toggle="modal" class="muted pull-left minorNote">
	<small>Help, I don't know Javascript!</small>
</a>


<!-- ==================================================================================== -->
<!-- Modal for showing Javascript tutorial -->
<!-- ==================================================================================== -->
<div id="javascriptTutorial" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<strong>Javascript in 2 minutes!</strong>
				<button type="button" class="close" data-dismiss="modal">X</button>
			</div>
			<div class="modal-footer">
			    <textarea id="tutorialCode" style="text-align:left">example tutorial code</textarea>
			</div>	
		</div>
	</div>
</div>

<script>
	//var tutorialCodeMirror = CodeMirror.fromTextArea(tutorialCode, { viewportMargin: Infinity, indentUnit: 4, indentWithTabs: true });
	
	//var tutorialCodeMirror = $('#tutorialCode');
	var tutCodeMirror = CodeMirror.fromTextArea(tutorialCode,{ autofocus: true, indentUnit: 4, indentWithTabs: true, lineNumbers: true });
	tutCodeMirror.setSize(null, 500);
	$('#javascriptTutorial').on('shown.bs.modal',function(){
		$.get('/js/javascriptTutorial.txt', function(code) { 
			tutCodeMirror.getDoc().setValue(code); 
		});
	});
	
	//$('#javascriptTutorial').on('shown', function () { tutCodeMirror.refresh(); } );	
	
	
</script>