

<script src="/include/codemirror/codemirror.js"></script>
<script src="/include/codemirror/javascript.js"></script>
<script src="/include/jshint-1.1.0.js"></script>
<script src="/html/errorCheck.js"></script>
<script src="/include/jquery-1.8.2.min.js"></script> 
<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
<script src="/include/stars/jquery.rating.js"></script>
<script src="/html/keybind.js"></script>
<script src='https://cdn.firebase.com/v0/firebase.js'></script>
<script src='/include/esprima.js'></script>
<script src='/include/escodegen.browser.js'></script>
<script src='/html/js/instrumentFunction.js'></script>

<div id="addCalleeSection"></div>

<script>
	//Iterates through the calleeList and the calleeMap to obtain inputs and outputs for all executed callees.
	function displayDebugFields(calleeList, calleeMap){
		console.log("callee data in displayDebugFields");
		console.log(calleeList);
		console.log(calleeMap);
		
		//Make sure the document is ready - the DOM object is available
		$(document).ready(function()
		{
			$.each(calleeList,function(i,calleeName)
			{
				var inputsMap={};
				inputsMap=calleeMap[calleeName];
				$("#addCalleeSection").before('<div functionName='+"\'"+calleeName+"\'"+'>'+"Function"+ "\' "+calleeName+"\' "+ "text with Specs <br>");
				for (var key in inputsMap) {
					if (inputsMap.hasOwnProperty(key)) {
						var obj = inputsMap[key];
						var paramObj = obj.parameters;
						var objContent="";
						for(var prop in paramObj){
							if (paramObj.hasOwnProperty(prop)){
								objContent= objContent +","+ paramObj[prop].toString();
							}
						}
						objContent=objContent.substr(1);
						$("#addCalleeSection").before('<input type="text" functionName=+ "\'"+calleeName+"\'" + inputValue=+"\'"+objContent+"\'"  + class="input-small" readonly value='+ "\'"+objContent+"\'"+'>&nbsp;&nbsp;//'+
						'<input type="text" onblur="updateCalleeMap(this)" functionName=+"\'"+calleeName+"\'" +  outValue =+"\'"+obj.returnValue+"\'"  + class="input-small" value='+ obj.returnValue+'>&nbsp;&nbsp;<br>');
					}
				}
				debugger;
				$("#addCalleeSection").before('</div>');
			});
		});
	}
	
	function updateCalleeMap(inputText)
	{

		inputText.value = inputText.value.trim();
		if(inputText.value.split(" ").length > 0) //should we ignore empty inputs?
		{
		 	$("#popUp").modal();
		 	inputText.value = inputText.value.split(" ").join("");
		}
	}
	
	function collectCalleeDebugData()
	{
		var formData = {parameters: []};				
	    $("tr[id^=issue]").each(function(){	    		    	
	    	formData.parameters.push( { name: $(this).find("input").eq(0).val(), 
	    								inputValues: $(this).find("input").eq(1).val(),
	    								outputValue: $(this).find("input").eq(2).val() });
	    });
	    return formData;
	}
	
	</script>


