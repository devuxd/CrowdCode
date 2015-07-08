

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('achievementsService', [ '$rootScope', '$firebase', 'firebaseUrl', 'workerId', 'toaster', 'questionsService' , function( $rootScope, $firebase, firebaseUrl, workerId, toaster, questionsService) {

	var ref = new Firebase( firebaseUrl + '/achievements/' + workerId );
	
	var service = new function(){
		this.init = function(){
			ref.on('child_added',function(snap){
				var val = snap.val();
				if( val.read === undefined ) {
					var type = val.type;
					var json = JSON.parse(val.data);

					var toast = {
						type: 'info',
						body: 'body',
						clickHandler: function(){ },
						bodyOutputType: 'trustedHtml'
					};
					
					toast.type = 'success';
					toast.body = json.message;
					toast.clickHandler = function(){ 
						$rootScope.$broadcast('setLeftBarTab','questions');
						$rootScope.$broadcast('showQuestion', json.questionId );
					};
					toaster.pop( toast ); 
					

					snap.ref().update({'read':true});      
				}
			});
		};
	};

	return service; 
}]);

