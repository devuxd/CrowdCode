<style type="text/css">
  .CodeMirror {
    height: auto;
  }
  .CodeMirror-scroll {
    overflow-y: hidden;
    overflow-x: auto;
  }
</style>

<script>
	// Sets up the description box. Takes a description that is the 
	// text to show in the description box.

    	// Load the fullDescription into codeMirror
    	var codeMirror = CodeMirror.fromTextArea(readonlyCodeBox, { viewportMargin: Infinity });
    	codeMirror.setValue(codeBoxCode);
    	codeMirror.setOption("readOnly", "true");
    	codeMirror.setOption("theme", "solarized");	 		

</script>

<textarea id="readonlyCodeBox"></textarea>