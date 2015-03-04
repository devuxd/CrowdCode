
angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$timeout', '$firebase', 'firebaseUrl','workerId', function($rootScope, $compile, $timeout, $firebase,firebaseUrl,workerId) {


    var microtaskTimeout  = 60;     //in second
    var microtaskFirstWarning = 10;  //in second
    var fetchTime = 0;
    var actualTime = 0;
    var popupWarning;

    return {
        restrict: 'E',
        scope: {},
        link: function($scope, $element, attrs) {

            // listen on the event 'run-tutorial'
            // and start the tutorial with tutorialId
            $rootScope.$on('run-tutorial',function( event, microtaskType, onFinish ){

                if( microtaskType!== undefined ){
                        $scope.runReminder(microtaskType,onFinish);
                }
            });

            $scope.runReminder = function(microtaskTyp,onFinish){


                //time when user fetched the microtask for the first time in milliseonds
                fetchTime = userService.getFetchTime()/1000;
                //actual time of the system in seconds
                actualTime =  new Date().getTime()/1000;

                //remaining time
                $scope.skipMicrotaskIn = parseInt(fetchTime + microtaskTimeout - actualTime);


                microtaskInterval = $interval(manageTimeout(microtaskTyp,onFinish), 1000);


            };
            var manageTimeout = function(){

                $scope.skipMicrotaskIn --;

                if(popupWarning===undefined && $scope.skipMicrotaskIn < microtaskFirstWarning){
                    popupWarning = $modal({title: 'My Title', content: 'My Content', show: true});
                }
            };

        }
    };
}]);
