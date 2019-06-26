'use strict';

/**
 * @ngdoc code
 * @name crowdAdminApp.controller:CodeCtrl
 * @description
 * # CodeCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('CodeCtrl', [ '$scope', 'Functions', 'Tests',function ($scope, Functions, Tests) {
   
    $scope.artifactType = 'functions';
    Functions.all().$loaded().then(function(){
    	$scope.fCode  = Functions.getCode();
    });
    Tests.all().$loaded().then(function(){
        $scope.tCode  = Tests.getCode();
    });

    $scope.aceLoaded = function(_editor) {
        ace.initialize(_editor);
        _editor.setOptions({
             maxLines: Infinity
        });
    };
  }]);
