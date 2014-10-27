myApp.filter("newline", function(){
	  return function(text) {
		  return text.replace(/\n/g, '<br>');
	  };
});
