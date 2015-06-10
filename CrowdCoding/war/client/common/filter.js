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
    .filter('float', function() {
  return function(input) {
    return parseFloat(input);
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
  angular.module('crowdCode')
  .filter('percentage', ['$filter', function($filter) {
      return function(input) {
          return $filter('number')(input*100, decimals)+'%';
      };
  }]);