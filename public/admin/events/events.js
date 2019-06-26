'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('EventsCtrl', ['$scope', 'events', 'microtasks', function ($scope, events, microtasks) {
  	$scope.events = events.all();
  	$scope.categories = [
  		{"value":"","label":"all"},
  		{"value":"microtask","label":"microtask events"},
  		{"value":"artifact","label":"artifact events"}
  	];
  	// $scope.events.loaded().then(function(){
  	// 	console.log("events loaded");
  	// });
  }])
  .directive('eventDetail',['$compile',function($compile){
  	return {
  		restrict: 'E',
  		scope: {
  			data : '='
  		},
  		template: 'detail',
  		link: function($scope,element,attrs){

        var eventParts = $scope.data.eventType.split('.');

  			if( eventParts[0] == 'microtask' ){

          switch(  eventParts[1] ){
            case 'spawned' : 
              element.html('A <strong>{{data.microtaskType}}</strong>  microtask has been spawned');
              break;

            case 'submitted' : 
              element.html('A <strong>{{data.microtaskType}}</strong> microtask has been submitted');
              break;

            case 'skipped' : 
              element.html('A <strong>{{data.microtaskType}}</strong> microtask has been skipped');
              break;

            default:
          }

        } else if( eventParts[0] == 'artifact' ){
          element.html('A change on property <strong>{{data.propertyName}}</strong> of artifact {{data.artifactName}}');
        } 
  
  			$compile(element.contents())($scope);
  		}
  	};
  }]);
