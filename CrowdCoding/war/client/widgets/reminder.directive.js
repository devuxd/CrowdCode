
angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$interval', '$firebase', 'firebaseUrl','$modal','userService', function($rootScope, $compile, $interval, $firebase,firebaseUrl,$modal,userService) {

    var microtaskInterval;

    var microtaskTimeout      =  10 * 60 * 1000*0.1;     //in second
    var microtaskFirstWarning =  4  * 60 * 1000*0.1;      //in second
    var timeInterval=500;//interval time in milliseconds

    var fetchTime = 0;
   // var startTime = 0;
    var popupWarning;
    var microtaskType;
    var callBackFunction;
    var tutorialOpen=0;
    var popupHasBeenClosed = false;


    return {
        restrict: 'E',
        templateUrl : '/client/widgets/reminder.html',
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.microtaskFirstWarning = microtaskFirstWarning;
            $scope.microtaskTimeout      = microtaskTimeout;
            //create the popup without showing it
            popupWarning = $modal({template : "/client/widgets/popup_reminder.html" , show: false});

             $rootScope.$on('run-tutorial',function(){
                tutorialOpen++;
            });

            $rootScope.$on('tutorial-finished',function(){
                tutorialOpen--;
            });


            // listen on the event 'run-tutorial'
            // and start the tutorial with tutorialId
            $rootScope.$on('run-reminder',function( event, microtask, onFinish ){

                microtaskType=microtask;
                callBackFunction=onFinish;
                popupHasBeenClosed=false;
                $scope.$emit('reset-reminder');
                initializeReminder();
            });

            $rootScope.$on('reset-reminder',function( event ){

               $interval.cancel(microtaskInterval);
               popupWarning.$promise.then(popupWarning.hide);
            });

            var initializeReminder = function(){

                //time when user fetched the microtask for the first time in milliseonds
                fetchTime = userService.getFetchTime();

                //actual time of the system in seconds
                startTime =  new Date().getTime();

                fetchTime.$loaded().then(function(){
                        $scope.skipMicrotaskIn = fetchTime.$value + microtaskTimeout - startTime ;
                        microtaskInterval = $interval(doReminder, timeInterval); 
                });


            };


            var doReminder = function(){
                //if no tutorial are open 
                if( tutorialOpen===0 ){
                    //update the remaining time both in the popup and in the progress bar
                    popupWarning.$scope.skipMicrotaskIn = $scope.skipMicrotaskIn -= timeInterval;

                    //if the popover is not open and the remaining time is less than first warning, show the popover
                    if( ! popupHasBeenClosed && $scope.skipMicrotaskIn < microtaskFirstWarning){
                        popupHasBeenClosed=true;
                        popupWarning.$promise.then(popupWarning.show);

                    }
                    //if the time is negative end the reminder and skip the microtask
                    else if($scope.skipMicrotaskIn < 0)
                        endReminder();
                }
            };

            var endReminder = function(){

                $scope.$emit('reset-reminder');

                if(callBackFunction!==undefined)
                    callBackFunction.apply();
            };

        }
    };
}]);
