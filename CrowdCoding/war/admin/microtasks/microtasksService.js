'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:microtasks
 * @description
 * # microtasks 
 * microtasks data service
 */
 var snaps = undefined;
angular.module('crowdAdminApp')
.factory("Microtask", function($firebaseUtils) {
    function Microtask(snap) {
        this.$id = snap.name();
        this.update( snap.val() );
        this.events = [];
        this.setStatus('none');
    }

    Microtask.prototype = {
        update: function(data) {
            var oldData = angular.extend({}, this.data);
            this.data   = data;
            return !angular.equals(this.data, oldData);
        },

        getStatus: function(){
            return this.status;
        },

        setStatus: function(newStatus){
            this.status = newStatus;
        },

        addEvent: function(event){
            this.events.push( event );
        },


        updateStats2: function(stats){
          // update the stats 
          if( ! stats.hasOwnProperty('numFinished') ){
            stats.numFinished   = 0;
            stats.avgFinishTime = 0;
            stats.totalTime     = 0;
            stats.finishByType  = {};
          }

          if( ! ['completed','accepted','rejected','reissued'].indexOf(this.status) ){
              stats.numFinished++;
          }
        },

        updateStats: function(stats){

          if( ! stats.hasOwnProperty('numFinished') ){
            stats.numFinished   = 0;
            stats.avgFinishTime = 0;
            stats.totalTime     = 0;
            stats.finishByType  = {};
          }

          // update the stats 
          if( ! stats.hasOwnProperty( this.status ) )
            stats[ this.status ] = 1;
          else
            stats[ this.status ] ++;
          

          var lastEvent = this.events[this.events.length - 1];
          if( ['completed','in_review'].indexOf( this.status ) != -1 && !isNaN(this.completedIn) ){
              stats.avgFinishTime =  ( ( stats.avgFinishTime * stats.numFinished ) + this.completedIn ) / ( stats.numFinished + 1 )  ;
              stats.numFinished ++ ;
              stats.totalTime += this.completedIn;

              if( ! stats.finishByType.hasOwnProperty( this.data.type ) ){
                stats.finishByType[this.data.type] = {  
                  numFinished   : 1,
                  avgFinishTime : this.completedIn,
                  totalTime     : this.completedIn
                }
              } else {
                stats.finishByType[this.data.type].avgFinishTime =  ( ( stats.finishByType[this.data.type].avgFinishTime * stats.finishByType[this.data.type].numFinished ) + this.completedIn ) / ( stats.finishByType[this.data.type].numFinished + 1 )  ;
                stats.finishByType[this.data.type].numFinished ++ ;
                stats.finishByType[this.data.type].totalTime += this.completedIn;
              }

          }
              
        },

        handleEvent: function( event, stats){
            if( event.microtaskKey == this.$id ){
                switch( event.eventType ){
                    case 'microtask.spawned': 
                        this.spawnedAt = event.timeInMillis;
                        this.setStatus('spawned');
                        break;
                    case 'microtask.assigned': 
                        this.assignedAt = event.timeInMillis;
                        this.setStatus('assigned');
                        break;
                    case 'microtask.skipped': 
                       // this.submittedAt = event.timeInMillis;
                        this.setStatus('skipped');
                        this.assignedAt = '';
                        break;
                    case 'microtask.submitted': 
                        this.completedAt = event.timeInMillis;
                        this.completedIn = this.completedAt - this.assignedAt;
                        this.setStatus('completed');
                    default:

                }
                this.updateStats( stats );
                this.addEvent( event );
            }
        },

        toJSON: function() {
            return $firebaseUtils.toJSON(this.data);
        }
    };

    return Microtask;
})

.factory('MicrotaskFactory', [ '$FirebaseArray', '$filter', 'Microtask', function( $FirebaseArray, $filter, Microtask ){

    var stats = {};
    var statsReady = false;

    return $FirebaseArray.$extendFactory({
        stats: {},
        statsReady : false,

        handleEvent: function( event ){
          var _this = this;
          if( _this == undefined )
            _this.stats = {};

          if( event.microtaskKey != undefined ){
            var key = event.microtaskKey ;
            var microtask = _this.$getRecord( key );
            if( microtask != null )
              microtask.handleEvent( event, _this.stats );
          }
        },

        handleEvents: function( events ){
          var _this = this;
          if( _this == undefined )
            _this.stats = {};

          statsReady = false;
          angular.forEach(events,function(event,key){
            if( event.microtaskID != undefined && event.artifactID != undefined ){
              var key = event.artifactID + '-' + event.microtaskID ;
              var microtask = _this.$getRecord( key );
              if( microtask != null )
                microtask.handleEvent( event, _this.stats );
            }
          });
          _this.statsReady = true;
        },

        getStats: function(){
          return this.stats;
        },

        getStatsReady: function(){
          return this.statsReady;
        },


        // change the added behavior to return Microtask objects
        $$added: function(snap) {
          return new Microtask(snap);
        },

        // override the update behavior to call Microtask.update()
        $$updated: function(snap) {
          var microtask = this.$list.$getRecord(snap.key());
          return microtask.update(snap.val());
        }
    });
}]) 

.service('Microtasks', [ '$firebase', '$filter', 'MicrotaskFactory', 'firebaseUrl',function ($firebase, $filter, MicrotaskFactory, firebaseUrl){
    var syncArray = null;

    if(syncArray==null){
      var mtaskRef  = new Firebase(firebaseUrl+'/microtasks');
      var mtaskSync = $firebase( mtaskRef, { arrayFactory: MicrotaskFactory } );
      var syncArray = mtaskSync.$asArray();
    }
    else
      console.log('mtasks already loaded');
  
    return syncArray;
}]);


    


  