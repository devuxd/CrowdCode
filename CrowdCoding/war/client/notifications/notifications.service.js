

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('notificationsService', [ '$rootScope', '$firebase', 'firebaseUrl', 'workerId', 'toaster', 'questionsService' , function( $rootScope, $firebase, firebaseUrl, workerId, toaster, questionsService) {

	var ref = new Firebase( firebaseUrl + '/notifications/' + workerId );
	
	var service = new function(){
		this.init = function(){
			ref.on('child_added',function(snap){
				var val = snap.val();
				if( val.read === undefined ) {
					var type = val.type;

					var toast = {
						type: 'info',
						body: 'body',
						clickHandler: function(){ },
						bodyOutputType: 'trustedHtml'
					};

					switch( type ){
						case 'question.added':
							toast.title = 'A new question has been asked:';
							toast.body = val.title;
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','questions');
								$rootScope.$broadcast('showQuestion', val.questionId );
							};
							toaster.pop( toast );
							break;

						case 'answer.added':
							toast.body = 'The worker '+val.workerHandle+' has answered your question';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','questions');
								$rootScope.$broadcast('showQuestion', val.questionId );
							};
							questionsService.get( val.questionId ).then(function(q){
								if( q !== null ){
									toast.body += ' <strong>'+q.title+'</strong>';
								}
								toaster.pop( toast );
							});
							break;

						case 'comment.added':
						console.log('comment addedd');
							toast.body = 'The worker '+val.workerHandle+' has commented the question';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','questions');
								$rootScope.$broadcast('showQuestion', val.questionId );
							};
							questionsService.get( val.questionId ).then(function(q){
								if( q !== null ){
									toast.body += ' <strong>'+q.title+'</strong>';
								}
								toaster.pop( toast );
							});
							break;

						case 'task.accepted':
							toast.type = 'success';
							toast.body = 'Your work of '+val.microtaskType+' on the artifact '+val.artifactName+' has been accepted';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;

						case 'task.reissued':
							toast.type = 'error';
							toast.body = 'Your work of '+val.microtaskType+' on the artifact '+val.artifactName+' has been reissued';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						case 'challenge.inProgress':
							toast.type = 'danger';
							toast.body = 'Your work of '+val.microtaskType+' on the artifact '+val.artifactName+' has been challenged';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						case 'challenge.lost':
							toast.type = 'error';
							toast.body = 'You lost the challenge on the '+val.microtaskType+' on the artifact '+val.artifactName;
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						case 'challenge.won':
							toast.type = 'success';
							toast.body = 'You won the challenge on the '+val.microtaskType+' on the artifact '+val.artifactName;
							toast.clickHandler = function(){ 
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
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

