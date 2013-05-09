<a href="#javascriptTutorial"  role="button" data-toggle="modal" class="muted pull-right minorNote">
	Help, I don't know Javascript!
</a>


<!-- ==================================================================================== -->
<!-- Modal for showing Javascript tutorial -->
<!-- ==================================================================================== -->
<div id="javascriptTutorial" class="modal hide fade" 
        tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <h3 id="myModalLabel">Javascript in 2 minutes!</h3>
  </div>
  <div class="modal-body javascriptTutorialStyles">
    <textarea id="tutorialCode"></textarea>
  </div>
  <div class="modal-footer">
    <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
  </div>
</div>

<script>
	var tutorialCodeMirror = CodeMirror.fromTextArea(tutorialCode, { 
		viewportMargin: Infinity, indentUnit: 4, indentWithTabs: true });
	$.get('/html/js/javascriptTutorial.txt', function(code) { tutorialCodeMirror.setValue(code);  });
	$('#javascriptTutorial').on('shown', function () { tutorialCodeMirror.refresh(); } );	
</script>