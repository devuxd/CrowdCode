
// VIEWS THE STATS
angular
    .module('crowdCode')
    .directive('projectStats', function($rootScope,$firebase,firebaseUrl) {

    return {
        restrict: 'E',
        scope: true,
        template: '<b>Stats:</b>'
                  +'<span class="stats">'
                  +'<!--<span><span class="badge">{{microtaskCountObj.$value}}</span> microtasks</span>-->'
                  +'<span><span class="badge">{{functionsCount}}</span> functions</span>'
                  +'<span><span class="badge">{{testsCount}}</span> tests</span>'
                  +'<span><span class="badge">{{loc}}</span> loc</span>'
                  +'</span>',

        link: function($scope, $element) {

            var functionsRef = new Firebase(firebaseUrl+'/artifacts/functions/');
            $scope.functionsCount = 0;
            functionsRef.on('child_added',function (snapshot){
                $scope.functionsCount ++;
            });

            $scope.loc = 0;
            functionsRef.on('value',function(snap){
                var functs = snap.val();
                $scope.loc = 0;
                angular.forEach(functs,function(val){
                    $scope.loc += val.linesOfCode;
                })
            });


        
            var testsRef = new Firebase(firebaseUrl+'/artifacts/tests');
            $scope.testsCount = 0;
            testsRef.on('child_added',function(snapshot){
                $scope.testsCount ++;
            });

        }
    };
});