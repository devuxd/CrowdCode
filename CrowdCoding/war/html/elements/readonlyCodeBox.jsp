<style type="text/css">
  #codemirrorBox .CodeMirror {
    height: auto;
    font-size: x-small;
  }
  #codemirrorBox .CodeMirror-scroll {
    overflow-y: hidden;
    overflow-x: auto;
  }
</style>

<div id="codemirrorBox">
<script>
	// Sets up the description box. Takes a description that is the 
	// text to show in the description box.

    	// Load the fullDescription into codeMirror
    	var codeMirror = CodeMirror.fromTextArea(readonlyCodeBox, { viewportMargin: Infinity, indentUnit: 4, indentWithTabs: true });
    	codeMirror.setValue(codeBoxCode);
    	codeMirror.setOption("readOnly", "true");
    	codeMirror.setOption("theme", "solarized");	 		

</script>

<textarea id="readonlyCodeBox"></textarea></div>