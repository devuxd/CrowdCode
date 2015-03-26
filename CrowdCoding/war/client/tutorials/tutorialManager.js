
angular
    .module('crowdCode')
    .directive('tutorialManager', [ '$rootScope', '$compile', '$timeout', '$firebase', 'firebaseUrl','workerId', function($rootScope, $compile, $timeout, $firebase,firebaseUrl,workerId) {
    
    var fbRef = new Firebase(firebaseURL);
    var tutorialsOn        = $firebase( fbRef.child('/status/settings/tutorials') ).$asObject();
    var completedTutorials = $firebase( fbRef.child('/workers/' + workerId + '/completedTutorials' ) ).$asObject();

    var queue    = [];
    var running  = false;
    var currentId;
    var currentOnFinish;

    return {
        restrict: 'E',
        scope: {},
        link: function($scope, $element, attrs) {

            $rootScope.$on('queue-tutorial',queueTutorial);
            $scope.endTutorial = endTutorial;

            function queueTutorial( event, tutorialId, force, onFinish ){
                tutorialsOn.$loaded().then(function(){
                    completedTutorials.$loaded().then(function(){
                        if( force || !isTutorialCompleted(tutorialId) ){
                            // queue tutorial
                            queue.push({
                                id       : tutorialId,
                                onFinish : onFinish,
                            });
                            checkQueue();
                        }
                    });
                });
            }

            function checkQueue(){
                if( !running && queue.length > 0 ){
                    startTutorial( queue.pop() );
                }
            }

            function startTutorial( tutorial ){
                running         = true;
                currentId       = tutorial.id;
                currentOnFinish = tutorial.onFinish;

                var templateUrl = '/client/tutorials/'+currentId+'.html';
                $element.html( '<tutorial template-url="'+templateUrl+'"></tutorial>' );
                $compile($element.contents())($scope);

                $rootScope.$broadcast('tutorial-started');
            }

            function endTutorial(){
                if( !isTutorialCompleted(currentId) )
                    setTutorialCompleted(currentId);
                
                $element.html( '' );

                if( currentOnFinish !== undefined )
                    currentOnFinish.apply();

                running         = false;
                currentId       = undefined;
                currentOnFinish = undefined;
                
                checkQueue();

                $rootScope.$broadcast('tutorial-finished');
            }


            function isTutorialCompleted( tutorialId ){
                if( completedTutorials.$value != undefined && completedTutorials.$value.search(tutorialId) > -1 ) 
                    return true;

                return false;
            }

            function setTutorialCompleted( tutorialId ){
                if( completedTutorials.$value == undefined )
                    completedTutorials.$value = tutorialId;
                else 
                    completedTutorials.$value += ','+tutorialId; 

                completedTutorials.$save();
            }
        }
    };
}]);
