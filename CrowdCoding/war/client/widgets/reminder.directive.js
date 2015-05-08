
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


            // listen on the event 'loadMicrotask'
            $rootScope.$on('microtaskLoaded', function($event, microtask,firstFetch){
                if( firstFetch == '1')
                    userService.setFirstFetchTime();

                microtaskType    = microtask.type;
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
               $scope.status='success';
               $interval.cancel(microtaskInterval);
               $scope.skipMicrotaskIn=undefined;
               popupWarning.$promise.then(popupWarning.hide);
            });

            function doReminder(){
                //if no tutorial are open 
                if( tutorialOpen===0 ){
                    //update the remaining time both in the popup and in the progress bar
                    popupWarning.$scope.skipMicrotaskIn = $scope.skipMicrotaskIn -= timeInterval;

                    //if the popover is not open and the remaining time is less than first warning, show the popover
                    if( ! popupHasBeenClosed && $scope.skipMicrotaskIn < microtaskFirstWarning){
                        popupHasBeenClosed=true;
                        popupWarning.$promise.then(popupWarning.show);
                        $scope.status='warning';

                    }
                    else if( $scope.skipMicrotaskIn < microtaskFirstWarning / 2 && 
                             $scope.skipMicrotaskIn > 0 ){
                        $scope.status='danger';
                    }
                    //if the time is negative end the reminder and skip the microtask
                    else if($scope.skipMicrotaskIn < 0)
                        endReminder();
                }
            }

            function endReminder(){

                $scope.$emit('reset-reminder');

                $scope.$emit('submitMicrotask',undefined,true);
            }

        }
    };
}]);