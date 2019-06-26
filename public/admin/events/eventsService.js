'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:events
 * @description
 * # events 
 * events data service
 */
angular.module('crowdAdminApp')
  .service('eventsService', ['$firebase', '$filter', '$q', '$rootScope', 'firebaseUrl', function($firebase, $filter, $q, $rootScope, firebaseUrl){

  	// ref to the history
  	var ref = new Firebase( firebaseUrl + '/history/events' );
    var listeners = [];

    function init(){
        // load first batch of events = from the beginning to the last added
        ref.once('value', function( firstBatch ){
            // get first batch 
            firstBatch.forEach(function( eventSnap ){
                var event = eventSnap.val();
                callListeners( event );
            });
            
            // apply changes to all the views
            $rootScope.$apply();

            // listen for new events
            var firstSkipped = false;
            ref.endAt().limitToLast(1).on('child_added',function( eventSnap ){
                if( !firstSkipped ) firstSkipped = true; 
                else {
                    var event = eventSnap.val();
                    callListeners( event );
                    $rootScope.$apply();
                }
            })
        });
    }

    function callListeners( event ){
        for (var lKey in listeners) {
          if(listeners.hasOwnProperty(lKey)){
            listeners[lKey].call( null, event );
          }
        }
    }

    function addListener( listener, key ){
        listeners[key] = listener ;
    }

    function removeListener( key ){
        if( listeners.hasOwnProperty( key ) ){
            delete listeners.key ;
        } 
    }

    var service = {
        init: init,
        addListener: addListener,
        removeListener: removeListener
    };

    return service;
  }]);