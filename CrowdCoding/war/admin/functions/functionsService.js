'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:artifacts
 * @description
 * # artifacts 
 * artifacts data service
 */
angular.module('crowdAdminApp')
.service("Functions", ["$FirebaseArray", "$firebase", 'firebaseUrl', function($FirebaseArray, $firebase, firebaseUrl) {

    var ref        = new Firebase(firebaseUrl+'/artifacts/functions');
    var historyRef = new Firebase(firebaseUrl+'/history/artifacts/functions');
    var sync       = $firebase(ref);
    var syncArray  = sync.$asArray(); 
    

    var service = {

    	all : function(){
    		return syncArray;
    	},

    	filter: function(filterParameters){
    		return $filter('filter')(syncArray,filterParameters);
    	},

        get: function(id,version){
            if( version === undefined ){
                return syncArray.$getRecord(id);
            } else {
                var funcSync = $firebase( historyRef.child(id).child(version) );
                return funcSync.$asObject();
            }
        },

        getHistory: function(id){
            var historySync = $firebase( historyRef.child(id) );
            return historySync.$asArray();
        },
        
        getCode: function(){
            var allCode = "";
            angular.forEach(syncArray,function(fun,index){
                allCode+= fun.header +' '+ fun.code +' \n';
            });
            return allCode;
        }
    };

    return service;
}]);