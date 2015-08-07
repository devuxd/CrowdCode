

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('notificationsService', [ '$rootScope',  'firebaseUrl', 'workerId', 'toaster', 'questionsService' , function( $rootScope,  firebaseUrl, workerId, toaster, questionsService) {

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
						case 'worker.levelup':
							toast.type = 'success';
							toast.body = 'Level up!\n'+val.prevLevel+'->'+val.currentLevel;
							toaster.pop( toast ); 
							break;
						case 'new.achievement':
							toast.type = 'success';
							toast.body = val.message + ' Congratulations!';
							toast.clickHandler = function(){ 
								$rootScope.$broadcast('showUserStatistics');
							};
							toaster.pop( toast ); 
							break;
						case 'dashboard':
							toast.type = 'success';
							toast.body = 'You unlocked the dashboard. Congratulations!';
							toast.clickHandler = function(){ 
								$rootScope.$broadcast('submitMicrotask');
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

