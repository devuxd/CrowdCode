'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:artifacts
 * @description
 * # artifacts 
 * artifacts data service
 */
angular.module('crowdAdminApp')
.service("Tests", ["$FirebaseArray", "$firebase", '$filter', 'firebaseUrl', function($FirebaseArray, $firebase, $filter, firebaseUrl) {

    var ref        = new Firebase(firebaseUrl+'/artifacts/tests');
    var historyRef = new Firebase(firebaseUrl+'/history/artifacts/tests');
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

        getCode: function(){
            var allCode = "";
            angular.forEach(syncArray,function(test,index){
                allCode += test.code + '\n';
            });
            return allCode;
        }


    };

    return service;
}]);