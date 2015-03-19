angular
    .module('crowdCode')
    .directive('stubsPanel', stubsList); 

function stubsList(functionsService) {
    return {
        restrict: 'E',
        scope: { 
        	allStubs: '=stubs'
        },
        templateUrl: '/client/widgets/stubs_panel.html',
        controller: function($scope,$element){
        	var stubs       = {};
        	var calleesInfo = {};

        	$scope.callees = [];
        	$scope.selectCallee = function( calleeName ){
        		$scope.selected = calleeName;
        		$scope.stubs    = stubs[ calleeName ];
        		$scope.info     = calleesInfo[ calleeName ];
        	}

        	$scope.$watch( 'allStubs', function( newStubs ){
        		if( newStubs !== undefined ){
        			stubs          = newStubs;
	        		$scope.callees = Object.keys(stubs);

		            angular.forEach( $scope.callees, function( calleeName ) {
		                // retrieve the callee info if not already there
		                if( calleesInfo[ calleeName ] === undefined ){
		                    var callee = functionsService.getByName( calleeName );
		                    calleesInfo[ calleeName ] = {
		                    	name        : calleeName,
		                        signature   : callee.getSignature(),
		                        inputs      : callee.getParamNames(),
		                        returnType  : callee.returnType
		                    };
		                }
		            });
		            
		            if( $scope.callees.length > 0 )
		            	$scope.selectCallee( $scope.callees[0] );
		        }
        	});
        	


        }
    };
};