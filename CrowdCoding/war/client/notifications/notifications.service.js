

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('notificationsService', [ '$firebase', 'firebaseUrl', 'workerId', 'toaster', function( $firebase, firebaseUrl, workerId, toaster ) {


	var ref    = new Firebase(firebaseURL+'/workers/' + workerId + '/notifications');
	
	var service = new function(){
		this.init = function(){
			ref.on('child_added',function(snap){
				var val = snap.val();
				
				if( val.read === undefined ) 
					toaster.pop( 'success', val.type, val.text); 
				snap.ref().update({'read':true});          
			});
		};
	};

	return service; 
}]);

