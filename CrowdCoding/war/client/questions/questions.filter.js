angular
    .module('crowdCode')
    .filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});

    

    angular
        .module('crowdCode')
        .filter('objectLength', function() {
      return function(items) {
        if(items)
          return Object.keys(items).length;
        else
          return 0;
      };
    });