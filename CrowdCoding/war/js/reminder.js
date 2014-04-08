var reminderTime = 8 * 60 * 1000;  
var activityTime = 20 * 1000; 
var reminderTimeStart = Date.now();

// Alert the user after reminderTime minutes, whenever they stop for activity time. Reminder
// resets clock after sent.

var activityTimer = window.setInterval(function(){clock()}, activityTime);

document.addEventListener('keydown', function(event) {
	resetActivityTime();
});

function clock()
{
	if (Date.now() - reminderTimeStart > reminderTime)
	{
		$("#popUpReminder").find("h3").html(
				"You've been working on this for a while now... Maybe it's time to submit or " +
				"skip and let the crowd take a look?");
		$("#popUpReminder").modal();
		
		// Reset the reminder time clock to now.
		resetStartTime();
	}

	resetActivityTime();
}

// Resets the clock on the time since the last activity.
function resetActivityTime()
{
	window.clearInterval(activityTimer);
	activityTimer = window.setInterval(function(){clock()},activityTime);
}

// Resets the time since the start of the reminder interval.
function resetStartTime()
{
	reminderTimeStart = Date.now();
}
	




