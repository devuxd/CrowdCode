
angular
    .module('crowdCode')
    .directive('navUserMenu',function($popover){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  '/client/ui_elements/nav_user_menu_template.html'
            };
            popover = $popover(element,popoverSettings);
            popover.$scope.close = function(){
                popover.$promise.then(popover.hide);
            };

            element.on('click',function(event){  
               
                popover.$promise.then(popover.toggle);
            });

            
           
        }
    };
});