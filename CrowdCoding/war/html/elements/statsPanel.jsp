
<div id="stats" class="panel panel-default ">
	<div class="panel-heading">Your Stats</div>
	<div class="panel-body">
		<span id="locCountSpan" class="badge">300</span><small>&nbsp;lines of code&nbsp;&nbsp;</small><br /> 
		<span id="microtaskCountSpan" class="badge">5</span><small>&nbsp;microtasks&nbsp;&nbsp;</small><br />
		<span id="functionCountSpan" class="badge">3</span><small>&nbsp;functions&nbsp;&nbsp;</small><br />
		<span id="testCountSpan" class="badge">10</span><small>&nbsp;tests&nbsp;&nbsp;</small>
	</div>
</div>

<script>
	
	var functions;
	var tests;
	$(document).ready(function(){
	
		// Create the Functions and Tests services, creating a local repository of functions
		// and tests synced to firebase
		functions = new Functions();       
    	functions.init(updateFunctionStats);
		
		var functionsRef = new Firebase(firebaseURL + '/artifacts/functions');
		functionsRef.on('child_added', function (snapshot) 
		{
			functions.functionAdded(snapshot.val());
		});
		functionsRef.on('child_changed', function (snapshot) 
		{
			functions.functionChanged(snapshot.val());
		});
		
		
		tests = new Tests();       
    	tests.init(updateTestStats);
		
		var testsRef = new Firebase(firebaseURL + '/artifacts/tests');
		testsRef.on('child_added', function (snapshot) 
		{
			tests.testAdded(snapshot.val());
		});
		testsRef.on('child_changed', function (snapshot) 
		{
			tests.testChanged(snapshot.val());
		});
		testsRef.on('child_removed', function (snapshot) 
		{
			tests.testDeleted(snapshot.val());
		});
		
		// Track microtasks so that we can update the total count of microtasks.
		var microtasksRef = new Firebase(firebaseURL + '/status/microtaskCount');
		microtasksRef.on('value', function (snapshot) 
		{
			$('#microtaskCountSpan').html(snapshot.val());
		});
	});
	
	
	function updateFunctionStats(linesOfCode, functionCount)
	{
		$('#locCountSpan').html(linesOfCode);
		$('#functionCountSpan').html(functionCount);
	}
	
	function updateTestStats(testCount)
	{
		$('#testCountSpan').html(testCount);
	}
</script>