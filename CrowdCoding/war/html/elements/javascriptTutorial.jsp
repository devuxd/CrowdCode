<a href="#javascriptTutorial"  role="button" data-toggle="modal" class="muted pull-right minorNote">
	Help, I don't know Javascript!
</a>


<!-- ==================================================================================== -->
<!-- Modal for showing Javascript tutorial -->
<!-- ==================================================================================== -->
<div id="javascriptTutorial" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<span>Javascript in 2 minutes!</span>
				<button type="button" class="close" data-dismiss="modal">X</button>
			</div>
			<div class="modal-footer">
			    <textarea id="tutorialCode">example tutorial code</textarea>
			</div>	
		</div>
	</div>
</div>

<script>
	//var tutorialCodeMirror = CodeMirror.fromTextArea(tutorialCode, { viewportMargin: Infinity, indentUnit: 4, indentWithTabs: true });
	
	//var tutorialCodeMirror = $('#tutorialCode');
	var tutCodeMirror = CodeMirror.fromTextArea(tutorialCode,{ autofocus: true, indentUnit: 4, indentWithTabs: true, lineNumbers: true });
	tutCodeMirror.setSize(null, 500);
	$(document).ready(function(){
		$.get('/js/javascriptTutorial.txt', function(code) { 
			tutCodeMirror.getDoc().setValue(code); 
		});
	});
	
	//$('#javascriptTutorial').on('shown', function () { tutCodeMirror.refresh(); } );	
	
	
</script>