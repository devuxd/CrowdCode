	var defaultSubmitButtonArray = new Array();
	var hasBeenIntialized = false;
$(document).ready(function() {

var keys = {};
$(document).on("keydown", function (e) {
	  if(!hasBeenIntialized)
	  {
		  console.log("I entered here");
		  console.log($(":submit"));
		  $(":submit").each(function()
					{
						if($(this).attr("type") != null && $(this).attr("type").toUpperCase() == "submit".toUpperCase())
						{
							defaultSubmitButtonArray.push($(this));
						}
					}
			);
		  hasBeenIntialized = true;
	  }
	    keys[e.which] = true;
	    
	    // If the user enters control enter, prevent any other default actions (e.g., those associated
	    // with enter) from occurring.
	    if(keys[13] && keys[17])
	    {
	        e.preventDefault();
	    }        		    
	});

$(document).on("keyup", function (e) {
	    var submitIt = false;
	    if(keys[13] && keys[17])
	    {
	        submitIt = true;
	    }        
	    delete keys[e.which];
	    if(submitIt)
	    {
	        // do submission
	    	if(defaultSubmitButtonArray.length == 1)
	    	{
	    		defaultSubmitButtonArray[0].click();
	    	}
	    	else if(defaultSubmitButtonArray.length > 1)
	    	{
	    		// need to make a span tag with id = submissionBox to reuse this code
	    		$("#submissionBox").css('display',"block");
	    	}
	    }
	});
//$(document).keydown(function (e) {
//    keys[e.which] = true;
//});
//
//$(document).keyup(function (e) {
//    var submitIt = false;
//    if(keys[13] && [17])
//    {
//        submitIt = true;
//    }        
//    delete keys[e.which];
//    if(submitIt)
//    {
//        // do submission
//    	if(defaultSubmitButtonArray.length == 1)
//    	{
//    		defaultSubmitButtonArray[0].submit();
//    	}
//    	else if(defaultSubmitButtonArray.length > 1)
//    	{
//    		// this is temporary for now will fix later
//    		alert("multiple submission choice it yourself");
//    	}
//    }
//});

});
