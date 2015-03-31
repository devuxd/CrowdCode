angular
    .module('crowdCode')
    .directive('tutorial', function($rootScope,$compile) {
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
            $scope.nextStep = nextStep;
            $scope.close    = close;

            var btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">next</a>';
            var btnCloseHtml = '<a href="#" class="btn-close" ng-click="close()">close</a>';

            var $tutorialContainer;
            var $overlay;
            var $content;

            var onShow = '';
            var onHide = '';

        
            function open() {

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
                nextStep();
            }

            var prevOnHide = undefined;

            function close(){
                $scope.destroy();
                $scope.endTutorial();
            }

            function nextStep() {
               

                // increment current Step (first step is = 1)
                $scope.currentStep += 1;
                
                // if the tutorial is finished, destroy it
                if ($scope.currentStep > $scope.totSteps) {

                    $scope.$emit('tutorial-finished');
                    $scope.currentStep = 0;
                    $scope.destroy();
                    return;
                }

                btnNextHtml  = '<a href="#" class="btn-next" ng-click="nextStep()">'+( $scope.currentStep == $scope.totSteps ? 'finish' : 'next' )+'</a>';

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
                        $overlay.animate(highlightCss, 400, function(){
                            // $content.animate(contentCss, 200 ,function(){
                                $content.fadeIn(300);
                            // });
                        });
                    });
                    
                } else {

                    
                    // contentCss.width = '40%';

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    $content.fadeOut(300,function(){
                        $content.html(contentHtml + '<br/>' +btnNextHtml+btnCloseHtml);
                        $compile($content.contents())($scope);

                        var contentCss = {};
                        contentCss.top   = ($('body').outerHeight()-$content.outerHeight())/2;
                        contentCss.left  = ($('body').outerWidth()-$content.outerWidth())/2;

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

            }

            open();

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
        }
    };
});


