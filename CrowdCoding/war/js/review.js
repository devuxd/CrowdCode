	    

// Sets the html content of containerDiv to contain the review materials for the specified microtask,
// in MicrotaskInFirebase format.
function displayReviewMaterial(containerDiv, microtask)
{
	if (microtask.type == 'WriteTestCases')
		displayWriteTestCases(containerDiv, microtask);
	else if (microtask.type == 'WriteTest')
		displayWriteTest(containerDiv, microtask);
	else if (microtask.type == 'WriteFunction')
		displayWriteFunction(containerDiv, microtask);
	
	console.log("Review for "+microtask.type);
}



function displayWriteTestCases(containerDiv, microtask)
{
	// First, load the historical version of the function under test from firebase
	var functionVersionRef = new Firebase(firebaseURL + '/history/artifacts/functions/' + microtask.testedFunctionID
			+ '/' + microtask.submission.functionVersion);
	
	functionVersionRef.once('value', function (snapshot) 
	{
		var functionUnderTest = snapshot.val();		    	
		var content = '<div><b>Write test cases</b><BR>';
    	
		// if the promptType is FUNCTION_SIGNATURE
    	if (microtask.promptType === 'FUNCTION_SIGNATURE')
			content += 'What are some cases in which this function might be used? Are there any unexpected corner' + 
				'cases that might not work?<BR><BR>'; 
    	// if it's CORRECT_TEST_CASE
		else if (microtask.promptType === 'CORRECT_TEST_CASE')
		{
			content += 'The following issue was reported with the following test case:<BR><BR>'
				+  '<div class="alert alert-info">' + microtask.disputeDescription + '</div>'
				+  '<div class="alert alert-error">' + microtask.disputedTestCase + '</div>'	
				+  'Can you fix the test case (and others if necessary) to address the issue?<BR>' 
  			    + '(Note: if the above test case is not below, the test case has already been changed,'
  		  		+	'    and you can ignore this microtask).<BR><BR>';
		}
	  	content += '<div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div><BR>';
    	
		// Show the actual testcases before and after  		  			
		var submittedTestCases = microtask.submission.testCases;
		var currentTestCases = tests.testCasesForFunction(microtask.testedFunctionID);
		
		content += "<b>Submitted Test cases</b><BR>";
		
		// If there are old and new test cases, show the diff
		// Otherwise, if there are just new testcases, show them.
		if (currentTestCases != null && currentTestCases.length > 0)
		{				
			content += '<div id="diffDiv">';
			content +=     	'<span class="original" style="display: none">';
			
			for (var i=0; i < currentTestCases.length; i++)
				content += currentTestCases[i].text + '<BR>';
			
			content += 		'</span>';
			content +=      '<span class="changed" style="display: none">';
			
			for (var i=0; i < submittedTestCases.length; i++)
				content += submittedTestCases[i].text + '<BR>';			
			
			content += 		'</span>';
			content += 		'<span id="diff" class="diff"></span><BR>';
			content += '</div>';	 
		}
		else
		{
			content += '<ul>'
			console.log(submittedTestCases);
			for (var i=0; i < submittedTestCases.length; i++)
				content += '<li>'+ submittedTestCases[i].text + '</li>';
			content += '</ul>'		
		}

		$(containerDiv).html(content); 	
		setupReadonlyCodeBox(readonlyCodeBox, functionUnderTest.description + functionUnderTest.header);	    		
		if (currentTestCases != null && currentTestCases.length > 0)
			$('#diffDiv').prettyTextDiff();
	});
}	  

//Sets the html content of containerDiv to contain the review materials for the specified microtask,
//in MicrotaskInFirebase format.
function displayWriteTest(containerDiv, microtask)
{
	console.log(microtask);
	// First, load the historical version of the function under test from firebase
	var functionVersionRef = new Firebase(firebaseURL + '/history/artifacts/functions/' + microtask.testedFunctionID
			+ '/' + microtask.submission.functionVersion);
	functionVersionRef.once('value', function (snapshot) 
	{
		var functionUnderTest = snapshot.val();		    	
		var content = '<div><b>Write a test</b><BR>';
	 	
		if (microtask.promptType === 'WRITE')
		{
			content += 'Can you write a test for <BR><BR>';
			//content += ''
			
			// Load the test... 
			
			
		}
		console.log(snapshot.val());
	
	});
}	



function displayWriteFunction(containerDiv, microtask)
{
	var content = '<div><b>Write a function description</b><BR>';
	content += '<div class="codemirrorBox"><textarea id="readonlyCodeBox"></textarea></div><BR>';
	$(containerDiv).html(content); 
	
	setupReadonlyCodeBox(readonlyCodeBox,renderDescription(microtask.submission), microtask.submission.header + microtask.submission.code);
}	
