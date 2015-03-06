
angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$interval', '$firebase', 'firebaseUrl','$modal','userService', function($rootScope, $compile, $interval, $firebase,firebaseUrl,$modal,userService) {

    var microtaskInterval;
    var microtaskTimeout  = 67890 * 60 * 1000;     //in second
    var microtaskFirstWarning = 89765 * 60 *1000;  //in second
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
            $scope.microtaskFirstWarning=microtaskFirstWarning;

            console.log("reminder initialized");
            $rootScope.$on('tutorial-finished',function(){
                console.log("taken form reminder"); 
                userService.setFirstFetchTime();
            });
            // listen on the event 'run-tutorial'
            // and start the tutorial with tutorialId
            $rootScope.$on('run-reminder',function( event, microtask, onFinish ){

                if( microtask!== undefined ){
                    initializeReminder(microtask, onFinish);
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
                        microtaskInterval = $interval(doReminder, 1000); 
                    }
                    else
                    {
                        console.log("error reminder not started", fetchTime.time);
                    }
                });


            };


            var doReminder = function(){

                //remaining time
                $scope.skipMicrotaskIn-=1000;

                if($scope.skipMicrotaskIn < 0)
                {
                    endReminder();
                }
                else if(popupWarning===undefined && $scope.skipMicrotaskIn < microtaskFirstWarning){
                    popupWarning = $modal({title: microtaskType, template : "/html/templates/popups/popup_reminder.html" , show: true});
                }
            };

            var endReminder = function(){
                console.log("skipping: "+microtaskType);
                $interval.cancel(microtaskInterval);
                microtaskInterval=undefined;
                if(callBackFunction!==undefined)
                    callBackFunction.apply();
            };

        }
    };
}]);
