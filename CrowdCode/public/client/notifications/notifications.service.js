

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('notificationsService', [ '$rootScope',  'firebaseUrl', 'workerId', 'toaster', 'questionsService' , function( $rootScope,  firebaseUrl, workerId, toaster, questionsService) {

	var ref = firebase.database().ref().child('Projects').child(projectId).child('notifications').child(workerId);
  // new Firebase( firebaseUrl + '/notifications/' + workerId );

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
						bodyOutputType: 'trustedHtml',
						timeout: 3000
					};

					switch( type ) {
                        case 'question.added':
							toast.body = 'A new question has been asked <strong>' + val.data.title +'</strong>';
							toast.clickHandler = function () {
								$rootScope.$broadcast('setLeftBarTab', 'questions');
								$rootScope.$broadcast('showQuestion', val.data.questionId);
							};
							toaster.pop(toast);
							break;

						case 'answer.added':
							var workerId = val.data.workerId;
            				var path = firebase.database().ref().child('Workers').child(workerId);
            				path.once('value').then(function (worker) {
								toast.body = 'The worker <strong>'+worker.val().name+'</strong> has answered the question ';
								toast.clickHandler = function(){
									$rootScope.$broadcast('setLeftBarTab','questions');
									$rootScope.$broadcast('showQuestion', val.data.questionId );
								};
								questionsService.get( val.data.questionId ).then(function(q){
									if( q !== null ){
										toast.body += '<strong>'+q.title+'</strong>';
									}
									toaster.pop(toast);
								});
            				});
							break;

						case 'comment.added':
                            var workerId = val.data.workerId;
                            var path = firebase.database().ref().child('Workers').child(workerId);
                            path.once('value').then(function (worker) {
                                toast.body = 'The worker <strong>' + worker.val().name + '</strong> has commented the question ';
                                toast.clickHandler = function () {
                                    $rootScope.$broadcast('setLeftBarTab', 'questions');
                                    $rootScope.$broadcast('showQuestion', val.data.questionId);
                                };
                                questionsService.get(val.data.questionId).then(function (q) {
                                    if (q !== null) {
                                        toast.body += '<strong>' + q.title + '</strong>';
                                    }
                                    toaster.pop(toast);
                                });
                            });
							break;

						case 'task.accepted':
							toast.type = 'success';
							toast.body = 'Your work of '+val.data.microtaskType+' on the artifact '+val.data.artifactName+' has been accepted';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;

						case 'task.reissued':
							toast.type = 'error';
							toast.body = 'Your work of '+val.data.microtaskType+' on the artifact '+val.data.artifactName+' has been reissued';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						/*case 'challenge.inProgress':
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
								$rootScope.$broadcast('openDashboard');
							};
							toaster.pop( toast );
							break;
*/
						default:
					}

					snap.ref().update({'read':true});
				}
			});
		};
	};

	return service;
}]);
