myApp.filter("newline", function(){
	  return function(text) {
		  return text.replace(/\n/g, '<br>');
	  };
});
myApp.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});
