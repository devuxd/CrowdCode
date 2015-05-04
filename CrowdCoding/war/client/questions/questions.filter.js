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

    if(reverse) 
      filtered.reverse();

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

angular
    .module('crowdCode')
    .filter('relatedToArtifact', function() {
  return function(items,artifactId) {

    if( artifactId === undefined || artifactId === null )
      return [];

    function filterFunction(question){
      if( question.artifactsId != null && question.artifactsId.indexOf( ""+artifactId ) > -1 )
        return true;

      return false;
    }

    return items.filter( filterFunction );
  };
});   

angular
    .module('crowdCode')
    .filter('unrelatedToArtifact', function() {
  return function(items,artifactId) {

    if( artifactId === undefined || artifactId === null )
      return items;

    function filterFunction(question){
      if( question.artifactsId == null || question.artifactsId.indexOf( ""+artifactId ) == -1 )
        return true;

      return false;
    }

    return items.filter( filterFunction );
  };
});   