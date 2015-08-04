angular
    .module('crowdCode')
    .directive('jsonDiffReader', function() {

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

    return {
        restrict: 'EA',
        template: '<pre class="json diff" ng-bind-html="diffHtml"></pre>\n',
        scope: {
            old: '=',
            new: '='
        },
        link: function ( scope, iElement, iAttrs, ngModel ) {

            var unwatch = scope.$watch('[old,new]',function(){

                if( scope.old != undefined && scope.new != undefined){
                    

                    var oldObj,newObj;

                    // try to parse the old and new value to a JSON object
                    // if the conversion fails,  simply add quotes
                    oldObj = scope.old;
                    newObj = scope.new;//safeJsonParse( scope.new );

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
                        typeof oldObj == 'number' ||
                        typeof oldObj == 'boolean'){

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

                        // pick the appropriate set of brackets for the final diff result
                        if( newObj.constructor == Array )  scope.diffHtml = '[\n'+diffHtml+']';
                        if( newObj.constructor == Object ) scope.diffHtml = '{\n'+diffHtml+'}';
                        
                    }

                }
            }, true );
        }
    };
});