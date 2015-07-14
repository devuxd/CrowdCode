


angular
    .module('crowdCode')
    .directive('jsonReader', function() {



    return {
        restrict: 'EA',
        template: '<pre class="json" ng-bind-html="prettyJson"></pre>\n<span ng-if="::copyAllowed" class="clip-copy" clip-copy="json">\n',
        require: "ngModel",
        scope: true,
        link: function ( scope, iElement, iAttrs, ngModel ) {
            if( !ngModel ) return;

            scope.copyAllowed = iAttrs.hasOwnProperty('copyAllowed') ? true : false;
            scope.json = scope.prettyJson = "";
            
            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                if( ngModel.$viewValue == "") 
                    scope.prettyJson = "";
                else if ( ngModel.$viewValue === undefined || ngModel.$viewValue == "undefined" )
                    scope.prettyJson = "undefined";
                else if ((typeof(ngModel.$viewValue)=="number" && isNaN( ngModel.$viewValue)) || (typeof(ngModel.$viewValue)=="string") && ngModel.$viewValue=="NaN")
                    scope.prettyJson = "NaN";
                else {
                    scope.json = angular.toJson( angular.fromJson(ngModel.$viewValue), true) ;
                    scope.prettyJson = jsonSyntaxHighlight( scope.json );
                }
            };
        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {
        		_editor.setOptions({
		    	     maxLines: Infinity
		    	});
			};
        }
    };
});
