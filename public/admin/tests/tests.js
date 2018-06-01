'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('TestsCtrl', [ '$sce', '$firebase', '$filter', 'firebaseUrl', 'Functions', 'Tests', 'Microtasks',  
    function ($sce, $firebase, $filter, firebaseUrl, Functions, Tests, Microtasks) {
  	
    var vm = this;

    var functions          = Functions.all();
    var tests              = Tests.all();

    functions.$loaded().then(function(){
      tests.$loaded().then(function(){
        vm.tests = {};
        angular.forEach(functions,function( value, index){
          vm.tests[value.name] = Tests.filter({ functionName: value.name });
        })
      });
    });
    

    // ace 
    vm.aceLoaded      = aceLoaded;

    vm.renderHtml = function(html_code){
        return $sce.trustAsHtml(html_code);
    };

    function requestTestRun(){
      var tRef        = new Firebase(firebaseUrl+'/status/testJobQueue/'+vm.selectedFunctionId);
      tRef.set({functionId:vm.selectedFunctionId});
    }

    function toggleDiffView(){
      vm.diffView = !vm.diffView;
    }

    function aceLoaded(_editor) {
        ace.initialize(_editor);
        _editor.setOptions({
             maxLines: Infinity
        });
    }
  }

  ]);
