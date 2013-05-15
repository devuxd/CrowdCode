
// Sets up the readonly description box.
function setupReadonlyCodeBox(textareaElem)
{
	var codeMirror = CodeMirror.fromTextArea(textareaElem, { viewportMargin: Infinity, indentUnit: 4, indentWithTabs: true });
	codeMirror.setValue(codeBoxCode);
	codeMirror.setOption("readOnly", "true");
	codeMirror.setOption("theme", "solarized");	 		
}

