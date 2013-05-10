count = 0;
var fiveMinutes = 5 * 60 * 1000;
// alerts them every 5 minutes
var int=self.setInterval(function(){clock()},fiveMinutes);
function clock()
{
	count++;
	var message = "You've been working for a while now... Maybe it's time to submit or skip and let someone else take a look?";
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
	




