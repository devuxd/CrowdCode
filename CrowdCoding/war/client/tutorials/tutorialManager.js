
angular
    .module('crowdCode')
    .directive('tutorialManager', [ '$rootScope', '$compile', '$timeout', '$firebaseObject',  'firebaseUrl','workerId','$http', function($rootScope, $compile, $timeout, $firebaseObject, firebaseUrl,workerId,$http) {
    
    // get the synced objects from the backend
    var tutorialsOn        = $firebaseObject( new Firebase( firebaseUrl + '/status/settings/tutorials') );
    var completedTutorials = $firebaseObject( new Firebase( firebaseUrl + '/workers/' + workerId + '/completedTutorials' ) );
    var tutorialCounter    = $firebaseObject( new Firebase( firebaseUrl + '/workers/' + workerId + '/tutorialCounter' ) );


    var queue    = [];
    var running  = false;
    var currentId;
    var currentOnFinish;
    //tutorialCounter = 0;
    return {
        restrict: 'E',
        scope: {},
        link: function($scope, $element, attrs) {

            // listen for the queue tutorial event
            $rootScope.$on('queue-tutorial',queueTutorial);
            $scope.queueTutorial = queueTutorial;
            $scope.isTutorialCompleted = isTutorialCompleted;

            // expose the endTutorial method to the $scope
            // it is called when the tutorial is closed
            $scope.endTutorial = endTutorial;

            // if the tutorial is forced or if 
            // is not completed, enqueue it
            function queueTutorial( event, tutorialId, force, onFinish, queueAfter ){
            	if(tutorialId != 'ChallengeReview'){
	                console.log('queuing tutorial '+tutorialId);
	                tutorialsOn.$loaded().then(function(){
	                    completedTutorials.$loaded().then(function(){
	                        if( force || ( tutorialsOn.$value && !isTutorialCompleted(tutorialId) )){
	                            // queue tutorial
	                            queue.push({
	                                id       : tutorialId,
	                                onFinish : queueAfter === undefined ? 
	                                           onFinish :
	                                           function(){ queueTutorial(null,queueAfter,true); }
	                            });
	                            checkQueue();
	                        }
	                    });
	                });
              }
            }


            // if the tutorials queue is not empty,
            // start the first tutorial in queue
            function checkQueue(){

                if( !running && queue.length > 0 ){
                    var tutorial    = queue.pop();
                    currentId       = tutorial.id;
                    currentOnFinish = tutorial.onFinish;

                    $scope.tutorialId = currentId;
                    startTutorial();
                }
            }
            
            function sendTutorialsCompleted(){
    			$http.get('/' + projectId + '/ajax/tutorialCompleted')
    				.success(function(data, status, headers, config) {
    			})
    			.error(function(data, status, headers, config) {

    			});
    		}
            
            // start the current tutorial
            function startTutorial(){
                running = true;
                var templateUrl = '/client/tutorials/'+currentId+'.html';
                $element.html( '<tutorial template-url="'+templateUrl+'"></tutorial>' );
                $compile($element.contents())($scope);

                $rootScope.$broadcast('tutorial-started');
            }

            // end the current tutorial
            function endTutorial(){
                running = false;

                if( !isTutorialCompleted(currentId) )
                    setTutorialCompleted(currentId);
                
                $element.html( '' );

                if( currentOnFinish !== undefined ){
                    console.log('currentOnFinish');
                    currentOnFinish.apply();
                }

                currentId       = undefined;
                currentOnFinish = undefined;
                
                checkQueue();

                $rootScope.$broadcast('tutorial-finished');
            }

            // true if the tutorial with tutorialId is complete
            // false if not
            function isTutorialCompleted( tutorialId ){
                console.log(completedTutorials);
                if( completedTutorials.$value !== undefined && completedTutorials.$value !== null && completedTutorials.$value.search(tutorialId) > -1 ) 
                    return true;

                return false;
            }

            // set tutorial with tutorialId as complete
            function setTutorialCompleted( tutorialId ){
                if( completedTutorials.$value === undefined ){
                    completedTutorials.$value = tutorialId;
                    tutorialCounter.$value =  1;
                }
                else{ 
                    completedTutorials.$value += ','+tutorialId; 
                    tutorialCounter.$value +=  1;
                }
                if(tutorialCounter.$value == 3)
                	sendTutorialsCompleted();
                
                tutorialCounter.$save();
                completedTutorials.$save();
            }
        }
    };
}]);
