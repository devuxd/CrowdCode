angular
    .module('crowdCode')
    .directive('testResult', testResult); 

function testResult() {
    return {
        restrict: 'E',
        scope: { 
            test  : '=',
            funct : '='
        },
        templateUrl: '/client/widgets/test_result.html',
        controller: function($scope,$element){

        	$scope.diffMode = true;
        	$scope.switchMode  = switchMode;
            $scope.doDispute   = doDispute;
            $scope.undoDispute = undoDispute;

            function switchMode(){
                $scope.diffMode = !$scope.diffMode;
            }

            function doDispute(test) {
                test.rec.inDispute = true;
                if( test.rec.disputeTestText === undefined )
                    test.rec.disputeTestText = '';
            }

            function undoDispute(test) {
                test.rec.inDispute = false;
            }
        }
    };
};