
angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$interval', '$modal','userService', function($rootScope, $compile, $interval, $modal, userService) {

    var microtaskInterval;

    var microtaskTimeout      =  10 * 60 * 1000; //in second
    var microtaskFirstWarning =  4  * 60 * 1000; //in second
    var timeInterval          = 500; //interval time in milliseconds

    var fetchTime = 0;
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

            // initialize the warning popup
            popupWarning = $modal({template : '/client/widgets/popup_reminder.html' , show: false});

            $rootScope.$on('tutorial-started',function(){
                // console.log('turorial run');
                tutorialOpen++;
            });

            $rootScope.$on('tutorial-finished',function(){
                tutorialOpen--;
                // console.log('turorial finished');
            });


            // listen on the event 'run-reminder' 
            $rootScope.$on('run-reminder',function( event, type, onFinish ){

                microtaskType    = type;
                callBackFunction = onFinish;
                popupHasBeenClosed=false;
                $scope.$emit('reset-reminder');
                
                //time when user fetched the microtask for the first time in milliseonds
                fetchTime = userService.getFetchTime();

                //actual time of the system in seconds
                startTime =  new Date().getTime();

                fetchTime.$loaded().then(function(){
                    $scope.skipMicrotaskIn = fetchTime.$value + microtaskTimeout - startTime ;
                    microtaskInterval = $interval(doReminder, timeInterval); 
                });

            });

            $rootScope.$on('reset-reminder',function( event ){

               $interval.cancel(microtaskInterval);
               $scope.skipMicrotaskIn=undefined;
               popupWarning.$promise.then(popupWarning.hide);
            });

            function initializeReminder(){

                

            }


            function doReminder(){
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
            }

            function endReminder(){

                $scope.$emit('reset-reminder');

                if(callBackFunction!==undefined)
                    callBackFunction.apply();
            }

        }
    };
}]);
