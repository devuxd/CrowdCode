angular
    .module('crowdCode')
    .filter("newline", function(){
	  return function(text) {
		  return text.replace(/\n/g, '<br>');
	  };
});
angular
    .module('crowdCode')
    .filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

angular
    .module('crowdCode')
    .filter('keylength', function(){
  return function(input){
    if(!angular.isObject(input)){
      throw Error("Usage of non-objects with keylength filter!!")
    }
    return Object.keys(input).length;
  };
});
