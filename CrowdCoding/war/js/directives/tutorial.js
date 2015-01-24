
myApp.directive('tutorialManager', [ '$compile', '$timeout', '$firebase', 'firebaseUrl','workerId', function($compile, $timeout, $firebase,firebaseUrl,workerId) {
    var fbRef = new Firebase(firebaseURL);
    var tutorialsOnRef = fbRef.child('/status/settings/tutorials');
    var userTutorials  = $firebase( fbRef.child('/workers/' + workerId + '/completedTutorials' ) ).$asObject();

    var queue = [];
    var running = false;

    return {
        restrict: 'E',
        scope: {},
        link: function($scope, $element, attrs) {
            tutorialsOnRef.once('value',function( snap ){
                if( snap.val() == true ){ // if tutorials enabled

                    // load the tutorial user settings
                    userTutorials.$loaded().then(function(){
                        // if it's the first time the user
                        // executes a tutorial, initialize 
                        // the object of the completed tutorials
                        if( userTutorials.$value == null ){
                            userTutorials.$value = { 'a': true };
                            userTutorials.$save();
                        }

                        // listen on the event 'run-tutorial'
                        // and start the tutorial with tutorialId
                        $scope.$on('run-tutorial',function( event, tutorialId, onFinish ){
                            console.log('tutorial: '+tutorialId);
                            if( userTutorials[tutorialId] === undefined ){
                                // if another tutorial is running
                                // enqueue the new one
                                if( running ){
                                    queue.push({ id: tutorialId, onFinish: onFinish });
                                }
                                // otherwise run it
                                else 
                                    $scope.runTutorial(tutorialId,onFinish);
                            }
                        });

                        $scope.runTutorial = function(id,onFinish){

                            // set the running flag
                            running = true;

                            // load the tutorial directive
                            var templateUrl = '/html/templates/tutorials/'+id+'.html';
                            console.log('tutorial template: '+templateUrl);
                            $scope.tutorialId = id;
                            $element.html( '<tutorial template-url="'+templateUrl+'"></tutorial>' );
                            $compile($element.contents())($scope);

                            // once it's finished 
                            var removeFinishListener = $scope.$on('tutorial-finished',function(){

                                // reset the element content
                                $element.html('');

                                // reset the running flag
                                running = false;

                                // execute the onFinish callback if any
                                if( onFinish != undefined ) 
                                     onFinish.apply();

                                userTutorials[id] = true;
                                userTutorials.$save();

                                if( queue.length > 0 ){
                                    // load the tutorial
                                    var tut = queue.pop();

                                    $timeout(function(){
                                        $scope.runTutorial(tut.id,tut.onFinish);
                                    }, 300);
                                }

                                removeFinishListener();
                            });
                        };

                    });



                }
            });
            
        }
    }
}]);

myApp.directive('tutorial', function($rootScope,$compile) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: function(elem,attrs) {
           return attrs.templateUrl;
        },
        link: function($scope, $element, $attrs) {

            $scope.title = $scope.tutorialId;

            $scope.currentStep = 0;
            $scope.totSteps = $element.find('step').length;

            var btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">next</a>';
            var btnCloseHtml = '<a href="#" class="btn-close" ng-click="close()">close</a>';

            var $tutorialContainer;
            var $overlay;
            var $content;

            var onShow = '';
            var onHide = '';

        
            $scope.start = function() {

                $tutorialContainer = $('<div class="tutorial-container"></div>');

                // create highlight layer
                $overlay = $('<div class="overlay"></div>');
                $tutorialContainer.append($overlay);

                // create the content layer 
                $content = $('<div class="content"></div>');
                $content.fadeOut();
                $tutorialContainer.append($content);

                // compile the element with $scope
                $compile($tutorialContainer.contents())($scope);

                // append the element to the body
                $('body').append($tutorialContainer);

                // show the overlay 
                $overlay.animate({opacity: 1}, 50);

                // reset the current step
                $scope.currentStep = 0;

                // visualize the first step
                $scope.showNext();
            };

            var prevOnHide = undefined;

            $scope.close = function(){
                $scope.destroy();
                $scope.$emit('tutorial-finished');
            }

            $scope.showNext = function() {
               

                // increment current Step (first step is = 1)
                $scope.currentStep += 1;
                
                // if the tutorial is finished, destroy it
                if ($scope.currentStep > $scope.totSteps) {

                    $scope.$emit('tutorial-finished');
                    $scope.currentStep = 0;
                    $scope.destroy();
                    return;
                }

                btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">'+( $scope.currentStep == $scope.totSteps ? 'finish' : 'next' )+'</a>';

                // retrieve the current step DOM-element
                // and the commands to apply on show/hide of the step content
                var $step  = $element.find('step:nth-child(' + $scope.currentStep + ')');
       
                var onShow = $step.attr('on-show') ;
                var onHide = $step.attr('on-hide') ;

                var contentStyle = $step.attr('style');
                var contentHtml  = $step.html();
                var highlight    = $step.attr('highlight');


                if( highlight !== undefined ){

                    var $highlightTag = $(document).find('#'+highlight)
                    var placement = $step.attr('placement');

                    if( placement === undefined )
                        throw "a placement should be defined!";

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    // calculate the hightlight css
                    var highlightCss = {
                        top    : $highlightTag.offset().top   ,
                        left   : $highlightTag.offset().left  ,
                        width  : $highlightTag.outerWidth()   ,
                        height : $highlightTag.outerHeight()
                    };

                    // calculate the content css
                    var contentCss = {
                        top  : highlightCss.top,
                        left : highlightCss.left
                    };

                    if( prevOnHide !== undefined && prevOnHide.length > 0 ) 
                        $scope.$eval(prevOnHide);

                    $content.fadeOut(400,function(){


                        $content.html(contentHtml + '<br/>' +btnNextHtml+btnCloseHtml);
                        $compile($content.contents())($scope);

                        $content.attr('style',contentStyle);

                        var width  = $content.outerWidth();
                        var height = $content.outerHeight();
                        var margin = 20;

                        if( placement == 'left' )        contentCss.left += -width - margin; 
                        else if( placement == 'right' )  contentCss.left += $highlightTag.outerWidth() +margin ; 
                        else if( placement == 'top' )    contentCss.top  += -height -margin ;
                        else if( placement == 'bottom' ) contentCss.top  += $highlightTag.outerHeight() +margin ;
                        else if( placement == 'top-center' )  {
                            contentCss.top  += -height -margin ;
                            if( $highlightTag.outerWidth() > width )
                                contentCss.left += ($highlightTag.outerWidth()-width)/2;
                            else
                                contentCss.left += -(width-$highlightTag.outerWidth())/2;

                        }  
                        else if( placement == 'right-center' )  {
                            contentCss.left += $highlightTag.outerWidth() +margin ;
                            if( $highlightTag.outerHeight() > height )
                                contentCss.top += ($highlightTag.outerHeight()-height)/2;
                            else
                                contentCss.top += -(height-$highlightTag.outerHeight())/2;

                        }  

                        $content.css(contentCss);
                        console.log(contentCss);

                        $overlay.animate(highlightCss, 400, function(){
                            // $content.animate(contentCss, 200 ,function(){
                                $content.fadeIn(300);
                            // });
                        });
                    });
                    
                } else {

                    var contentCss = {};
                    contentCss.top   = '20%';
                    contentCss.left  = '30%';
                    contentCss.width = '40%';

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    $content.fadeOut(300,function(){
                        $content.html(contentHtml + '<br/>' +btnNextHtml+btnCloseHtml);
                        $compile($content.contents())($scope);

                        $content.css(contentCss);
                        $overlay.animate({
                            width: '0px',
                            height: '0px',
                            top: '-50px',
                            left: '-50px'
                        },200,function(){
                            $content.fadeIn(300);
                        });

                    });
                    
                }
                

                prevOnHide = onHide;

            };

            $scope.destroy = function() {

                // remove the tutorial from the document
                $overlay.remove();
                $content.remove();
                $tutorialContainer.remove();
                $overlay = null;
                $content = null;
                $tutorialContainer = null;
                $scope.currentStep = 0;

            };

            $scope.start();
            
        }
    };
});


