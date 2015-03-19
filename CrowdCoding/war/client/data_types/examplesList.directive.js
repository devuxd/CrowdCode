
angular
    .module('crowdCode')
    .directive('examplesList',function($rootScope,$popover,ADTService){
    return {
        restrict: 'EA',
        scope:{
            paramType :'=',
            key : '=',
            value : '='
        },
        link: function($scope, element,attrs){

            //function to load the example in the ng-model of the exapmle
            var loadExampleValue = function(value){
                $scope.value=value;
            };

            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  '/client/data_types/examples_list_popover.html',
            };


            //load all the examples og the ADT
            var loadExamples = function(ADTName) {
                //check if ADT is multidimensional
                var dimension=ADTName.match(/\[\]/g);
                ADTName= ADTName.replace('[]','');

                var examplesList =  ADTService.getByName(ADTName).examples;
                
                //if the ADT is multidimensional adds the square brackets to all values of the examples
                if(dimension!==null){
                    var modifiedExamples=[];
                    var startValue='';
                    var endValue='';
                    for(var i=0; i<dimension.length; i++){
                        startValue+='[';
                        endValue+=']';
                    }
                    angular.forEach(examplesList,function(example,key)
                    {
                        modifiedExamples.push({name : example.name, value :startValue + example.value + endValue});
                    });
                    return modifiedExamples;
                }
                return examplesList;
            };

            var togglePopover = function(popoverKey) {
                //if the popover is undefined creates the popover
                if($rootScope.examplesListPopover[popoverKey]===undefined)
                {
                    //check if already another popover opened, if so destoy that one
                    if($rootScope.examplesListPopoverKey!==undefined){
                        $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].$promise.then($rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].hide);
                        $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey]=undefined;
                    }
                    //popover inizialization
                    $rootScope.examplesListPopover[popoverKey] = $popover(element, popoverSettings);
                    $rootScope.examplesListPopover[popoverKey].$promise.then($rootScope.examplesListPopover[popoverKey].show);
                    $rootScope.examplesListPopover[popoverKey].$scope.examplesList=loadExamples($scope.paramType);
                    $rootScope.examplesListPopover[popoverKey].$scope.togglePopover = togglePopover;
                    $rootScope.examplesListPopover[popoverKey].$scope.key = popoverKey;
                    $rootScope.examplesListPopover[popoverKey].$scope.loadExampleValue = loadExampleValue;

                    //sets the popover opened as this one
                    $rootScope.examplesListPopoverKey = popoverKey;
                }
                else
                {
                    //if the popover is not undefined means that is open and so close the popover
                    $rootScope.examplesListPopover[ popoverKey].$promise.then($rootScope.examplesListPopover[ popoverKey].hide);
                    $rootScope.examplesListPopover[ popoverKey]=undefined;
                    $rootScope.examplesListPopoverKey=undefined;
                }
            };

            element.on('click',function(){
                if($rootScope.examplesListPopover===undefined)
                    $rootScope.examplesListPopover=[];
                var exampleNumber= loadExamples($scope.paramType);
                if(exampleNumber.length==1){
                   $scope.value = exampleNumber[0].value;
                   $scope.$apply();
                   if($rootScope.examplesListPopoverKey!==undefined){
                       $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].$promise.then($rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].hide);
                       $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey]=undefined;
                       $rootScope.examplesListPopoverKey=undefined;
                   }
                }else{

                    //if doesn't exist yet the list of popovers inizialize it
                   

                    togglePopover($scope.key);
                }
            });
        }
    };
});