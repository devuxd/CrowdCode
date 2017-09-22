angular
  .module('crowdCode')
  .factory("iconFactory", ['firebaseUrl', function(firebaseUrl) {

    var loaded = {};

    var factory = {};
    factory.get = function(condition) {
      return {
        $value: '/img/achievements/' + condition + '.png'
      };
    };

    return factory;
  }]);
