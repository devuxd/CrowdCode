

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('notificationsService', [ '$rootScope', '$firebase', 'firebaseUrl', 'workerId', 'toaster', 'questionsService' , function( $rootScope, $firebase, firebaseUrl, workerId, toaster, questionsService) {

	var ref = new Firebase( firebaseURL + '/notifications/' + workerId );
	
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
						bodyOutputType = 'trustedHtml'
					};

					switch( type ){
						case 'question.added':
							toast.title = 'A new question has been asked:';
							toast.body = json.title;
							toast.clickHandler = function(){ 
								$rootScope.$broadcast('setLeftBarTab','questions');
								$rootScope.$broadcast('showQuestion', json.questionId );
							};
							toaster.pop( toast ); 
							break;

						case 'answer.added':
							toast.body = 'The worker '+json.workerHandle+' has answered your question';
							toast.clickHandler = function(){ 
								$rootScope.$broadcast('setLeftBarTab','questions');
								$rootScope.$broadcast('showQuestion', json.questionId );
							};
							questionsService.get( json.questionId ).then(function(q){
								if( q !== null ){
									toast.body += ' <strong>'+q.title+'</strong>';
								}
								toaster.pop( toast ); 
							});
							break;

						case 'comment.added':
							toast.body = 'The worker '+json.workerHandle+' has commented your answer on the question';
							toast.clickHandler = function(){ 
								$rootScope.$broadcast('setLeftBarTab','questions');
								$rootScope.$broadcast('showQuestion', json.questionId );
							};
							questionsService.get( json.questionId ).then(function(q){
								if( q !== null ){
									toast.body += ' <strong>'+q.title+'</strong>';
								}
								toaster.pop( toast ); 
							});
							break;

						case 'task.accepted':
							toast.type = 'success';
							toast.body = 'Your work of '+json.microtaskType+' on the artifact '+json.artifactName+' has been accepted';
							toaster.pop( toast ); 
							break;

						case 'task.reissued':
							toast.type = 'error';
							toast.body = 'Your work of '+json.microtaskType+' on the artifact '+json.artifactName+' has been reissued';
							toaster.pop( toast ); 
							break;

						default:
					}

					snap.ref().update({'read':true});      
				}
					
				    
			});
		};
	};

	return service; 
}]);

