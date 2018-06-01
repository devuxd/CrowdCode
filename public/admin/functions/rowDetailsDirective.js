'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .directive('rowDetails', [ '$compile', function($compile){
  	return {
  		restrict: 'A',
  		scope: {
  			data : '='
  		},
  		link: function($scope,element,attrs){
        var contentTr = angular.element('<tr><td><function-microtasks data="data"></function-microtasks></td></tr>');
        var open = false;
        element.on('click',function(){
          open = !open ;
          if( open ) {
            contentTr.insertAfter(element);
            $compile(contentTr)($scope);
          }
          else 
            contentTr.remove();
        });
  		}
  	};
  }]);