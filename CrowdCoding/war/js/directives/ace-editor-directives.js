
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
                           // console.log('Needle',val.needle,range);
                            if( range !== undefined ){
                                marker[val.needle] = _editor.getSession().addMarker(range,'acePseudoCall','text',true);
                                // console.log('added marker for  '+val.needle, range, marker);
                               // console.log(_editor.getSession().getMarkers());
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
               // console.log(typeof(ngModel.$viewValue));
                if( ngModel.$viewValue == "") 
                    scope.prettyJson = "";
                else if ( ngModel.$viewValue == undefined || ngModel.$viewValue == "undefined" )
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


angular
    .module('crowdCode')
    .directive('aceReadJsonDiff', function() {


    return {
        restrict: 'EA',
        template: '<pre class="json diff" ng-bind-html="diffHtml"></pre>\n',
        scope: {
            old: '=',
            new: '='
        },
        link: function ( scope, iElement, iAttrs, ngModel ) {

            var unwatch = scope.$watch('old+new',function(){
                if( scope.old != undefined && scope.new != undefined){
                    
                    
                    var oldObj,newObj;

                    // try to parse the old and new value to a JSON object
                    // if the conversion fails,  simply add quotes
                    oldObj = safeJsonParse( scope.old );
                    newObj = safeJsonParse( scope.new );

                    // initialize the diff result
                    var diffHtml = '';

                       // console.log('old/new',oldObj,newObj);

                    // if one of the two obj is null or
                    // if one of the two obj is undefined
                    // if the constructor is different
                    // if the oldObj is a number 
                    if( oldObj === null || newObj === null || 
                        oldObj === undefined || newObj === undefined || 
                        oldObj.constructor != newObj.constructor || 
                        typeof oldObj == 'number' ){

                        if( typeof(oldObj) == 'object' )
                            diffHtml += joinLines( angular.toJson(oldObj, true) , 'line added', 0);
                        else if ( typeof(oldObj) == 'string' )
                            diffHtml += joinLines( '"'+oldObj+'"', 'line added', 0);     
                        else
                            diffHtml += joinLines( oldObj + '', 'line added', 0);           

                        if( typeof(newObj) == 'object' )
                            diffHtml += joinLines( angular.toJson(newObj, true) , 'line removed', 0);
                        else if ( typeof(newObj) == 'string' )
                            diffHtml += joinLines( '"'+newObj+'"', 'line removed', 0);     
                        else
                            diffHtml += joinLines( newObj + '', 'line removed', 0);                    

                        scope.diffHtml = diffHtml;

                    }
                    // if the type of new is an object/array
                    else {
                        //console.log('compare obj');

                        var oldFields = Object.keys(oldObj);
                        var newFields = Object.keys(newObj);

                        var sharedFields  = oldFields.filter(function(value){ return newFields.indexOf(value) != -1; });
                        var removedFields = oldFields.filter(function(value){ return newFields.indexOf(value) == -1; });
                        var addedFields   = newFields.filter(function(value){ return oldFields.indexOf(value) == -1; });

                        var isArray = newObj.constructor == Array;

                        for( var f = 0 ; f < removedFields.length ; f++ ){
                            var name = removedFields[f];
                            var text = angular.toJson( oldObj[name], true) + ',';
                            if( !isArray ) text = '"'+name+'" : ' + text;
                            diffHtml += joinLines( text, 'line added', 2) ;
                            diffHtml += '\n';
                        }

                        for( var f = 0 ; f < sharedFields.length ; f++ ){
                            var name = sharedFields[f];
                            var equal = deepCompare(oldObj[name],newObj[name]);

                            if( equal ){
                                var text = angular.toJson( oldObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line ', 2) ;
                            } else {
                                var text = angular.toJson( oldObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line added', 2) ;


                                var text = angular.toJson( newObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line removed', 2) ;
                            }

                            diffHtml += '\n';
                        }

                        for( var f = 0 ; f < addedFields.length ; f++ ){
                            var name = addedFields[f];
                            var text = angular.toJson( newObj[name], true) + ',';
                            if( !isArray ) text = '"'+name+'" : ' + text;
                            diffHtml += joinLines( text, 'line removed', 2) ;

                            diffHtml += '\n';
                        }

                        // // find the differences in the 
                        // // first layer of properties
                        // var compareResults = [];
                        // for( var field in newObj ){
                        //     compareResults[ field ] = deepCompare( oldObj[field], newObj[field] );
                        // }

                        // // for each property of the first layer  
                        // var fields = Object.keys(compareResults);
                        // for( var k = 0; k < fields.length; k++ ){
                        //     var field = fields[k];
                            
                        //     // if the fields are equal 
                        //     // concat the value as is in the 
                        //     // diffHtml val
                        //     if( compareResults[field] ) {
                        //         var text = angular.toJson( newObj[field] !== undefined ? newObj[field] : '', true);
                        //         if( newObj.constructor == Object ) text = '"'+field+'" : ' + text;
                        //         if( k != fields.length -1 ) text += ',';

                        //         diffHtml += joinLines( text, 'line ', 2) ;
                        //     } 
                        //     // otherwise first add the old value of the property as 'removed'
                        //     // and after add the new value as 'added'
                        //     else {
                        //         // when the field is not defined in the oldObj
                        //         // show just the new value
                        //         if( oldObj[field] !== undefined ){
                        //             var removedText = angular.toJson( oldObj[field], true);
                        //             if( newObj.constructor == Object )
                        //                 removedText = '"'+field+'" : ' + removedText;
                        //             diffHtml += joinLines( removedText, 'line removed', 2) ;
                        //         }

                        //         var addedText   = angular.toJson( newObj[field], true);
                        //         if( k != fields.length -1 ) addedText += ',';
                        //         if( newObj.constructor == Object ){
                        //             addedText   = '"'+field+'" : ' + addedText;
                        //         }
                        //         diffHtml += joinLines( addedText, 'line added', 2);
                                    
                        //     }
                        //     if( k != fields.length -1 ) diffHtml += '\n';
                        // }

                        // pick the appropriate set of brackets for the final diff result
                        if( newObj.constructor == Array )  scope.diffHtml = '[\n'+diffHtml+']';
                        if( newObj.constructor == Object ) scope.diffHtml = '{\n'+diffHtml+'}';
                    }
                    

                }
            });
            
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

/** 
 safe json parse 
**/
function safeJsonParse(json){
    var obj = null;
    if( json == 'Infinity' )
        obj = Infinity;
    else if( json == 'undefined' )
        obj = undefined;
    else if( json == 'NaN' )
        obj = NaN;
    else if( json == 'null' )
        obj = null;
    else {
        try {
            obj = JSON.parse(json);
        } catch( e ){
            obj = '"'+json+'"';
        }
    }

    return obj;
}


/**
  search and highlight the json 
**/
function jsonSyntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
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
    return highlighted;
}


/* 
  join the lines of text (splitted by \n) as a list of html <span class="class"> 
  tags preeceding the content with #identation spaces
*/
function joinLines(text,cssClass,identation){
    var lines = text.split('\n');
    var html = '';
    for( var li in lines ){
        html += '<span class="'+cssClass+'">';
        for( var i=1 ; i<=identation ; i++) html += ' ';
        html += jsonSyntaxHighlight(lines[li])+'</span>';
    }
    return html;
}
