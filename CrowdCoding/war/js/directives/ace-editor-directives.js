
angular
    .module('crowdCode')
    .directive('aceReadJs',function($compile,functionsService) {

    return {
        restrict: 'EA',
        replace: true,
        template: '<div class="ace-editor js-reader" ui-ace="{ onLoad : aceLoaded, mode : mode, theme: theme, showGutter: false, useWrapMode : true}" readonly="true" ng-model="code"></div>',
        scope: {
            code: '=',
            mode: '@',
            highlight: '=',
        },
        controller: function($scope,$element){ 
            console.log($scope.highlight);
            if($scope.mode===undefined){
                $scope.mode='javascript';
                $scope.theme='xcode';
            }
            else
                $scope.theme='github';   


            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });
                var marker = [];
                _editor.on('change',function(){
                    if( $scope.highlight !== undefined ){
                        angular.forEach($scope.highlight,function(val){
                            if( marker[val.needle] !== undefined ){
                                _editor.getSession().removeMarker(marker[val.needle]);
                                marker[val.needle] == undefined;
                            }
                            var Range = ace.require("ace/range").Range;

                            var conf   = { regex: val.regex || false };
                            var needle = conf.regex ? new RegExp(val.needle) : val.needle;
                            var range = _editor.find(needle,conf);
                            if( range !== undefined ){
                                marker[val.needle] = _editor.getSession().addMarker(range,'acePseudoCall','text',true);
                                // console.log('added marker for  '+val.needle, range, marker);
                                console.log(_editor.getSession().getMarkers());
                            }
                            
                        });
                    }
                });
                
            };
        }
    };
});


angular
    .module('crowdCode')
    .directive('aceReadString', function() {
    return {
        restrict: 'EA',
        template:'<div class="ace-editor json-reader" ui-ace="{ onLoad : aceLoaded, mode: \'javascript\', theme:\'xcode\', showGutter: false, useWrapMode : true }" readonly="true" ng-model="stringValue"></div>',
        require: "ngModel",
        scope: true,
        link: function ( scope, iElement, iAttrs, ngModel ) {
            if( !ngModel ) return;
        
            // convert the json object into a string
            // ngModel.$formatters.push(function( modelValue ) {
            //     return  modelValue );
            // });
            

            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                scope.stringValue = ngModel.$viewValue;
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

angular
    .module('crowdCode')
    .directive('aceReadJson', function() {

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
               function (match) {
            var cls = 'jsonNumber';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'jsonKey';
                } else {
                    cls = 'jsonString';
                }
            } else if (/true|false/.test(match)) {
                cls = 'jsonBoolean';
            } else if (/null/.test(match)) {
                cls = 'jsonNull';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

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

                scope.json = angular.toJson(angular.fromJson (ngModel.$viewValue),true) ;
                if( ngModel.$viewValue == "") 
                    scope.prettyJson = "";
                else if ( ngModel.$viewValue === undefined )
                    scope.prettyJson = "undefined";
                else
                    scope.prettyJson = syntaxHighlight( scope.json );
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


angular
    .module('crowdCode')
    .directive('aceEditJson', function() {
    var stringified = false;

    return {
        restrict: 'EA',

        template:'<div class="ace_editor json-editor" ui-ace="{ onLoad : aceLoaded, mode: \'json\', theme:\'xcode\', showGutter: true, useWrapMode : true, showLineNumbers : false }" ng-model="stringValue" ></div> ',
        scope: {
            focusIf   : "=",
            minLines  : "=",
            tabindex  : "@",
            paramType : "@"
        },
        require: "ngModel",

        link: function ( scope, element, attrs, ngModel ) {
            if( ngModel == undefined ) 
                console.log("NG MODEL NOT DEFINED");

            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){

                if( ngModel.$viewValue == "") 
                    scope.stringValue = "";
                else
                    scope.stringValue = angular.toJson(angular.fromJson (ngModel.$viewValue),true);
            };

            // update the ngModel.$viewValue when the UI changes 
            scope.$watch('stringValue', function() {
                ngModel.$setViewValue( scope.stringValue );
            });

        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {

        		var options = {
		    	   maxLines: Infinity
		    	};
                
                $element.on('focus',function(){
                    _editor.focus();
                });

                if( $scope.hasOwnProperty('tabindex') && $scope.tabindex ){
                    $element.find('.ace_text-input').attr('tabindex', $scope.tabindex);
                }

                if( $scope.hasOwnProperty('focusIf') && $scope.focusIf ){
                    _editor.focus();
                }

                if( $scope.hasOwnProperty('minLines') && $scope.minLines ){
                   options.minLines = $scope.minLines;
                }

                // _editor.getSession().on('change', function(e) {
                //     console.log('event change:', e.data);
                    
                // });

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');
			};
        }
    };
});
