<html>
<head>
	<title>CrowdCode User Story Editor</title>
	<link rel="stylesheet" href="/include/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="/html/styles.css">
	<script src="/include/jquery-1.8.2.min.js"></script> 
	<script src="/include/bootstrap/js/bootstrap.min.js"> </script> 
	<script src='https://cdn.firebase.com/js/client/1.0.2/firebase.js'></script>	
	<script>
		var firebaseURL = 'https://crowdcode.firebaseio.com';
		var firebaseRef;
		
		// User stories are numbered from 0 to userStoryCount - 1 (as are ADTs).
		var userStoryCount = 0;
		var ADTCount = 0;
	
		$(document).ready(function()
		{
			$('#addUserStory').click(function()
			{
				addUserStory('');
			});
			$('#addADT').click(function()
			{
				addADT('', '', '');
			});
			$('#save').click(function()
			{
				// Save UserStories
				firebaseRef = new Firebase(firebaseURL + '/userStories/' + $('#project').val() + '/userStories');
				var userStories = [];
				$("textarea[id^=userStory]").each(function(){	    		    	
			    	userStories.push( $(this).val() );
			    });
				firebaseRef.set(userStories);
				
				// Save ADTs
				firebaseRef = new Firebase(firebaseURL + '/ADTs/' + $('#project').val() + '/ADTs');
				var ADTs = [];
				$("div[id^=ADTContainer]").each(function(){	    		    	
					var name = $(this).find("input[id^=ADTName]").val();
					var structure = $(this).find("textarea[id^=ADTStructure]").val();
					var description = $(this).find("textarea[id^=ADTDescrip]").val();	
					ADTs.push( { name: name, structure: parseStructureIntoJSON(structure), description: description });
			    });				
				firebaseRef.set(ADTs);
			});
			$('#load').click(function()
			{
				// Delete all the existing user stories and ADTs
				$('#userStories').html('');
				$('#ADTs').html('');			
								
				// Add user stories for each user story in firebase		
				firebaseRef = new Firebase(firebaseURL + '/userStories/' + $('#project').val() + '/userStories');
				firebaseRef.once('value', function(dataSnapshot) 
				{ 
					$.each(dataSnapshot.val(), function(index, text)
					{
						addUserStory(text);						
					});					
				});
				
				// Add ADTs for each ADT in firebase				
				firebaseRef = new Firebase(firebaseURL + '/ADTs/' + $('#project').val() + '/ADTs');
				firebaseRef.once('value', function(dataSnapshot) 
				{ 
					$.each(dataSnapshot.val(), function(index, ADT)
					{
						addADT(ADT.name, renderStructure(ADT.structure), ADT.description);
					});
				});
			});
		});	
		
		// Takes a string listing fields in the format of "fieldName: typeName, ..." and outputs an array
		// of JSON objects for each field, where each JSON object is of the form { name: fieldName, type: typeName }
		function parseStructureIntoJSON(structure)
		{
			var fields = [];

			var arrayOfFieldStrings = structure.split(',');
			for (var j = 0; j < arrayOfFieldStrings.length; j++)
			{
				var fieldElements = arrayOfFieldStrings[j].split(':');
				var fieldName = fieldElements[0].trim();
				var typeName = fieldElements[1].trim();
				fields.push({ name: fieldName, type: typeName });
			}

			return fields;
		}
				
		// Renders a structure in JSON format of [{ name: fieldName, type: typeName }, ... ] into the format of
		// "fieldName: typeName, ..."
		function renderStructure(structureJSON)
		{
			var structureString = '';
			
			for (var j = 0; j < structureJSON.length; j++)
			{
				if (j > 0)
					structureString += ', ';
				
				structureString += structureJSON[j].name + ': ' + structureJSON[j].type;				
			}
			
			return structureString;
		}
				
		function addUserStory(text)
		{
			$('#userStories').append('<div id="userStoryDiv' + userStoryCount + '">'
					+ '<textarea class="userStoryDescrip" id="userStory' 
					+ userStoryCount + '">' + text + '</textarea><a href="#" onclick="deleteUserStory(\'#userStoryDiv' 
					+ userStoryCount + '\')" class="closeButton">x</a></div>');
			userStoryCount++;
		}
		
		function deleteUserStory(userStory)
		{
			$(userStory).remove();
		}
		
		function addADT(name, structure, description)
		{
			$('#ADTs').append('<div class="ADTContainer" id="ADTContainer' + ADTCount + '"><div class="ADT">'
					+ 'Name: <input type="text" id="ADTName' + ADTCount + '" value="' + name + '"><BR>'
					+ 'JSON structure: <textarea class="ADTDescrip" id="ADTStructure' + ADTCount + '">' 
					    + structure + '</textarea><BR>' 
					+ 'Description: <textarea class="ADTDescrip" id="ADTDescrip' + ADTCount + '">'
					+ description + '</textarea>' 
					+ '</div>'
					+ '<a href="#" onclick="deleteADT(\'#ADTContainer' 
						+ ADTCount + '\')" class="closeButton">x</a></div>');
			ADTCount++;
		}
		
		function deleteADT(adt)
		{
			$(adt).remove();
		}
		
		function addField(name, type)
		{
			$('#ADTs').append('<div class="ADTContainer" id="ADTContainer' + ADTCount + '"><div class="ADT">'
					+ 'Name: <input type="text" id="ADTName' + ADTCount + '" value="' + name + '"><BR>'
					+ 'JSON structure: <textarea class="ADTDescrip" id="ADTStructure' + ADTCount + '">' 
					    + JSON.stringify(structure) + '</textarea><BR>'  
					+ 'Description: <textarea class="ADTDescrip" id="ADTDescrip' + ADTCount + '">'
					+ description + '</textarea>' 
					+ '</div>'
					+ '<a href="#" onclick="deleteADT(\'#ADTContainer' 
						+ ADTCount + '\')" class="closeButton">x</a></div>');
			ADTCount++;
		}
		
		function deleteField(field)
		{
			$(field).remove();
		}
		
		
	</script>
</head>
<body>
	<div class="row-fluid">
	  	<div class="span1"></div>
	  	<div class="span10">
			<h3>Welcome to the <b>CrowdCode Client Request Editor</b></h3>
			Enter a project name in the textbox below to retrieve the client request for the project.
			If it does not exist, it will be created. Use the special project name "default" to
			set the client request for projects that do not have a client request specified.<BR><BR>
		
		   	<input type="text" class="input-xlarge" id="project">
		   	<button id="load" class="btn btn-small">Load</button> 
		   	<h4>User Stories</h4>
			<div id="userStories"></div>
			<h4>ADTs</h4>
			Describe ADTs with a name, JSON structure, and description. The JSON structure should be of the form
			<b>fieldA: TypeName, fieldB: String</b>, where each TypeName is either defined separately as an 
			ADT or is one of the three primitives String, Number, Boolean. To indicate an n-dimensional array, add
			n sets of brackets after the type name (e.g., 2 dimensional array - TypeName[][]). The description should describe
			any rules about the ADT and include an example of a value of the ADT in JSON format.<BR>
			<div id="ADTs"></div>	
			<button id="save" class="btn btn-primary">Save</button>	   	
		   	<button id="addUserStory" class="btn btn-small">Add user story</button>
		   	<button id="addADT" class="btn btn-small">Add ADT</button><BR>
	
		</div>
		<div class="span1"></div>
	</div>
</body>
</html>