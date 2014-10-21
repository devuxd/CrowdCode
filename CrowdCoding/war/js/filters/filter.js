myApp.filter("newline", function(){
	  return function(text) {
		  console.log(text);
  return text.replace(/\n/g, '<br>');
	  };
});

/*
myApp.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});*/