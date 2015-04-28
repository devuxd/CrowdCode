
angular
    .module('crowdCode')
    .directive('chat', function($timeout, $rootScope, $firebase, $alert, avatarFactory, userService, workerId) {
    return {
        restrict: 'E',
        templateUrl: '/client/chat/chat_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {

            $rootScope.chatActive = false;
            $rootScope.unreadedMessages=0;
            $rootScope.$on('toggleChat', function() {
                $element.find('.chat').toggleClass('active');
                $rootScope.chatActive = ! $rootScope.chatActive;
                $rootScope.unreadMessages =0;
            });
        },
        controller: function($scope, $element, $rootScope) {
            // syncs and references to firebase 
            var chatRef = new Firebase($rootScope.firebaseURL + '/chat');
            
            // data about the 'new message' alert
            var alertData = {
                duration : 4, // in seconds
                object : null,
                text   : '',
                worker : '',
                createdAt : 0
            };

            // track the page load time
            var startLoadingTime = new Date().getTime();

            // set scope variables
            $scope.avatar = avatarFactory.get;
            $rootScope.unreadMessages=0;
            $scope.messages = [];

            // for each added message 
            chatRef.on('child_added',function(childSnap, prevChildName){

                    // get the message data and add it to the list
                    var message = childSnap.val();

                    if( message.workerId === workerId )
                        message.workerHandle = 'You';

                    var last = $scope.messages[ $scope.messages.length - 1 ];
                    if( last !== undefined && last.workerId == message.workerId && ( message.createdAt - last.createdAt ) < 5 * 1000 ) {
                        last.text += '<br />' + message.text;
                        last.createdAt = message.createdAt;
                    } else 
                        $scope.messages.push(message);

                    /*
                    // if the chat is hidden and the timestamp is 
                    // after the timestamp of the page load
                    if( message.createdAt > startLoadingTime ) 
                        if( !$rootScope.chatActive ){

                             // increase the number of unread messages
                            $rootScope.unreadMessages++;
                            
                            // if the current message has been sent
                            // from the same worker of the previous one
                            // and the alert is still on
                            if( alertData.worker == message.workerHandle && ( message.createdAt - alertData.createdAt) < alertData.duration*1000 ) {
                                // append the new text to the current alert
                                alertData.text += '<br/>'+message.text;
                                alertData.object.hide();
                            } else { 
                                // set data for the new alert
                                alertData.text   = message.text;
                                alertData.worker = message.workerHandle;
                            }
                           
                            // record the creation time of the alert
                            // and show it 
                            alertData.createdAt = new Date().getTime();
                            alertData.object    = $alert({
                                title    : alertData.worker, 
                                content  : alertData.text , 
                                duration : alertData.duration ,
                                template : '/client/chat/alert_chat.html', 
                                keyboard : true, 
                                show: true
                            });
                        } 
                    */
                    
                    $timeout( function(){ $scope.$apply() }, 100);
            });

            // hide the alert if the chat becomes active
            $rootScope.$watch('chatActive',function(newVal,oldVal){
                if( newVal && alertData.object != null )
                    alertData.object.hide();
            });

            // add new message to the conversation
            $scope.data = {};
            $scope.data.newMessage = "";
            $scope.addMessage = function() {
                if( $scope.data.newMessage.length > 0){
                    var newMessageRef = chatRef.push();
                    newMessageRef.set({
                        text:         $scope.data.newMessage,
                        createdAt:    Date.now(),
                        workerHandle: $rootScope.workerHandle,
                        workerId:     $rootScope.workerId,
                        microtaskKey: (userService.assignedMicrotaskKey===null)?'no-microtask':userService.assignedMicrotaskKey
                    });
                    $scope.data.newMessage = "";
                }
            };
        }
    };
});
