
angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$interval', '$firebase', 'firebaseUrl','$modal','userService', function($rootScope, $compile, $interval, $firebase,firebaseUrl,$modal,userService) {

    var microtaskInterval;

    var microtaskTimeout      = 1* 10 * 60 * 1000;     //in second
    var microtaskFirstWarning = 1* 4  * 60 * 1000;      //in second
    var timeInterval=500;//interval time in milliseconds

    var fetchTime = 0;
   // var startTime = 0;
    var popupWarning;
    var microtaskType;
    var callBackFunction;

    return {
        restrict: 'E',
        templateUrl : '/html/templates/ui/reminder.html',
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.microtaskFirstWarning = microtaskFirstWarning;
            $scope.microtaskTimeout      = microtaskTimeout;

            // TO FIX
            // $rootScope.$on('run-tutorial',function(){
            //     console.log('tutorial opened from reminder');
            // });

            $rootScope.$on('tutorial-finished',function(){
                // console.log('tutorial closed from reminder');
                userService.setFirstFetchTime();
            });
            // listen on the event 'run-tutorial'
            // and start the tutorial with tutorialId
            $rootScope.$on('run-reminder',function( event, microtask, onFinish ){

                if( microtask!== undefined ){
                    initializeReminder(microtask, onFinish);
                }
            });
            $rootScope.$on('stop-reminder',function( event ){
                $scope.skipMicrotaskIn=undefined;
                if(microtaskInterval!==undefined)
                    $interval.cancel(microtaskInterval);
                if(popupWarning!==undefined)
                {
                    popupWarning.$promise.then(popupWarning.hide);
                    popupWarning=undefined;
                }

            });
            var initializeReminder = function(microtask, onFinish){

                microtaskType=microtask;
                callBackFunction=onFinish;
                //cancel the interval if still active(when they press skip or submit)
                if(microtaskInterval!==undefined)
                    $interval.cancel(microtaskInterval);
                if(popupWarning!==undefined)
                {
                    popupWarning.$promise.then(popupWarning.hide);
                    popupWarning=undefined;
                }

                //time when user fetched the microtask for the first time in milliseonds
                fetchTime = userService.getFetchTime();

                //actual time of the system in seconds
                startTime =  new Date().getTime();

                fetchTime.$loaded().then(function(){
                    if(typeof(fetchTime.time)=='number'){
                        $scope.skipMicrotaskIn = fetchTime.time + microtaskTimeout - startTime ;
                        // console.log("reminder initialized, you have "+ $scope.skipMicrotaskIn + " millisecons more");

                        microtaskInterval = $interval(doReminder, timeInterval); 
                    }
                    else
                    {
                        // console.log("error reminder not started", fetchTime.time);
                    }
                });


            };


            var doReminder = function(){

                //remaining time
                $scope.skipMicrotaskIn -= timeInterval;

                if($scope.skipMicrotaskIn < 0)
                {
                    endReminder();
                }
                else if(popupWarning===undefined && $scope.skipMicrotaskIn < microtaskFirstWarning){
                    popupWarning = $modal({title: microtaskType, template : "/html/templates/popups/popup_reminder.html" , show: true});
                    popupWarning.$scope.skipMicrotaskIn=$scope.skipMicrotaskIn ;
                }else if(popupWarning!==undefined)
                {
                    popupWarning.$scope.skipMicrotaskIn=$scope.skipMicrotaskIn ;

                }
            };

            var endReminder = function(){
                // console.log("skipping: "+microtaskType);
                if(microtaskInterval!==undefined)
                    $interval.cancel(microtaskInterval);
                microtaskInterval=undefined;
                if(callBackFunction!==undefined)
                    callBackFunction.apply();
            };

        }
    };
}]);
