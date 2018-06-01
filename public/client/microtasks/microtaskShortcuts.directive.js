
angular
    .module('crowdCode')
    .directive('microtaskShortcuts', function() {
    return function(scope, element, attrs) {

        // manage the key down
        var keyDownListener = function(event, formData){

            var charCode = event.which || event.keyCode;
            var preventDefault = false;

            // all the microtask shortcuts are a combination of CTRL + key
            if( event.ctrlKey ) {

                // if is CTRL + ENTER submit microtask
                if(charCode == 13) { 
                    // console.log('CTRL+ENTER');
                    scope.$broadcast('collectFormData', scope.microtaskForm);
                    preventDefault = true;
                } 

                // // if is CTRL + BACKSPACE skip microtask
                // else if ( charCode == 8 ) { 
                //     // console.log('CTRL+BACKSPACE');
                //     //scope.$emit('skipMicrotask');
                //     preventDefault = true;
                // } 

                // // if is CTRL + H start the tutorial
                // else if ( charCode == 72 ) { // H
                //     // console.log('CTRL+H');
                //     // preventDefault = true;
                // }
            }

            // if a combo has been managed
            // prevent other default behaviors
            if( preventDefault )
                event.preventDefault();

        };

        // bind keydown listener
        element.on('keydown', keyDownListener);

        // unbind keydown listener on microtask form destroy
        element.on('$destroy',function(){
            element.off('keydown',null,keyDownListener);
        });
    };
});
