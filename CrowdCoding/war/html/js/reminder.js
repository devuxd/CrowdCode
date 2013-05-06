count = 0;
var fiveMinutes = 5 * 5 * 1000;
// alerts them every 5 minutes
var int=self.setInterval(function(){clock()},fiveMinutes);
function clock()
{
	count++;
	var message = "You have been working for " + count * 5 + " minutes, maybe wrap up and submit";
	if(count > 0)
	{
		$("#popUpReminder").find("h3").html(message);
		$("#popUpReminder").modal();
	}
}
function resetTimer()
{
	int=window.clearInterval(int);
	count = 0;
	int = self.setInterval(function(){clock()},fiveMinutes);
}
	




