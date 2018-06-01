(function(){

    'use strict';

    angular.module('json-tree', [])

        .directive('jsonTree', ['$compile','ADTService', function($compile,ADTService){
            return {
                restrict: 'EA',
                scope: {
                	type: '=',
                    json: '=',
                    node: '=?',
                    childs: '=?',
                    paramName: '=?',
                    editLevel: '@',
                    collapsedLevel: '@'
                },
                controller: function($scope){

                    /* initialize container for child nodes */
                    $scope.childs = {};

                    /* define auxiliary functions */
                    $scope.utils = {

                        /* prettify json view */
                        wrap: {
                            start: function(node){
                                if (node === undefined || node === null) return '';
                                switch (node.type()){
                                    case 'array': return '[';
                                    case 'matrix': return '[';
                                    case 'object': return '{';
                                    default: return '';
                                };
                            },
                            middle: function(node){
                                if (node === undefined || node === null) return '';
                                switch (node.type()){
                                    case 'array': return '...';
                                    case 'matrix': return '...';
                                    case 'object': return '...';
                                    default: return '';
                                };
                            },
                            end: function(node){
                                if (node === undefined || node === null) return '';
                                switch (node.type()){
                                    case 'array': return ']';
                                    case 'matrix': return ']';
                                    case 'object': return '}';
                                    default: return '';
                                };
                            },
                            isLastIndex: function(node, index){
                                if (node === undefined || node === null) return true
                                else return index >= node.length();
                            }
                        },

                        /* collapse/expand node by clicking */
                        clickNode: function(node){
                            node.isCollapsed = !node.isCollapsed;
                        },

                        /* add new node to the collection */
                        addNode: function(key, value){
                        	console.log("value   "+value+" key "+key +"Type  "+$scope.node.type() );
                            var json = null;


                            try { json = JSON.parse(value);
                            console.log("sono qua al parsing");
                            console.log(json);

                            } catch (e){console.log(e);}

                            /* add element to the object */
                            if ($scope.node.type() === 'object') {

                            	if($scope.json===null||$scope.json===undefined)
                            		{
                            	$scope.json={};
                            		}



                                if (json !== null){
                                	console.log("json");
                                	console.log(json);
                                	console.log( "$scope.json");
                                   	console.log( $scope.json);
                                   	console.log( " $scope.json[key]");
                                   	console.log(  $scope.json[key]);

                                    $scope.json[key] = json
                                } else {
                                    $scope.json[key] = value
                                }

                            }
                            /* add element(s) to the array */
                            else if ($scope.node.type() === 'array') {
                            	console.log("sono qua array");
                            	console.log(json);

                            	if($scope.json==null||$scope.json==undefined)
                            		{
                            		$scope.json=[]
                            		}
                            	if (json !== null) {
                                    if (json.constructor === Array){
                                        /* push new array elements to the array */
                                        $scope.json.push.apply($scope.json, json);
                                    } else {

                                        $scope.json.push(json);
                                    }
                            	} else {
                                        $scope.json.push(value);
                                        }

                            }
                                /* add element(s) to the matrix */
                                else if ($scope.node.type() === 'matrix') {
                                	console.log("sono qua per la matrice");
                                	if($scope.json===null||$scope.json===undefined)
                            		{
                            	$scope.json=[];
                            		}

                                	console.log(json);
                                    if (json !== null) {
                                        if (json.constructor === Array){
                                            /* push new array elements to the array */
                                            $scope.json.push.apply($scope.json, json);
                                        } else {
                                            /* push single element to the array */
                                        	 $scope.json.push(json);
                                        }
                                    }

                                else {
                                	console.log("sono qua per la matrice");
                                	var emptyarray=[""];
                                    $scope.json.push(emptyarray);
                                }
                                }

                            $scope.refresh();
                        },

                        /* reset node value by key to default == null */
                        resetNode: function(key){
                            $scope.json[key] = null;
                            $scope.refresh();
                        },

                        /* remove node by key from json */
                        removeNode: function(key){
                            if ($scope.node.type() === 'object')
                                delete $scope.json[key]
                            else if ($scope.node.type() === 'array')
                                $scope.json.splice(key, 1);
                            $scope.refresh();
                        },

                        /* validate text if input to the form */
                        validateNode: function(key){
                            /* check if null or "" */
                            if (!$scope.json[key]) $scope.json[key] = null;

                            /* try to convert string to number */
                            else if (!isNaN(+$scope.json[key]) && isFinite($scope.json[key]))
                                $scope.json[key] = +$scope.json[key];

                            /* try to parse string to json */
                            else {
                                if ($scope.node.isHighEditLevel){ /* if high editable level */
                                    try {
                                        var json = JSON.parse($scope.json[key]);
                                        $scope.json[key] = json;
                                        $scope.refresh();
                                    } catch (e){}
                                } else { /* if low editable level */
                                    /* check if boolean input -> then refresh */
                                    if ($scope.json[key] === "true" || $scope.json[key] === "false") {
                                        $scope.json[key] = JSON.parse($scope.json[key]);
                                        $scope.refresh();
                                    }
                                }
                            }
                        },

                        /* move node from position with index 'i' to position with index 'j' */
                        moveNode: function(i, j){
                            /* moving for object */
                            if ($scope.node.type() === 'object'){
                                var json = {},
                                    keys = Object.keys($scope.json),
                                    key1 = keys[i],
                                    key2 = keys[j];

                                angular.forEach($scope.json, function(value, key){
                                    if (key == key2) {
                                        if (j > i){
                                            json[key2] = $scope.json[key2];
                                            json[key1] = $scope.json[key1];
                                        } else {
                                            json[key1] = $scope.json[key1];
                                            json[key2] = $scope.json[key2];
                                        }
                                    }
                                    else if (key != key1) json[key] = value;
                                });
                                $scope.json = json;
                            }

                            /* moving for array */
                            else if ($scope.node.type() === 'array'){
                                var temp = $scope.json[i];
                                $scope.json.splice(i, 1);
                                $scope.json.splice(j, 0, temp);
                                $scope.refresh();
                            }
                        },

                        /* to skip ordering in ng-repeat */
                        keys: function(obj){
                            return (obj instanceof Object) ? Object.keys(obj) : [];
                        },

                        /* to skip ordering in ng-repeat */
                        names: function(obj){
                        	var names=[];
                        	for(var i=0; i< obj.length; i++)
                        		{
                        		names.push(obj.name);
                        		}
                            return names ;
                        },

                        /* get type for variable val */
                        getType: function(type){
                        	//console.log("getTyoe "+type);
                            if (type === null) return 'null'
                            else if (type === undefined) return 'undefined'
                            else if (type.split("[]").length>2) return 'matrix'
                            else if (type.split("[]").length>1) return 'array'
                            else if (type === "String") return 'string'
                            else if (type === "Number") return 'number'
                            else if (type === "Boolean") return 'boolean'
                            else return 'object'
                        }
                    };

                    /* define properties of the current node */
                    $scope.node = {

                        /* check node is collapsed */
                        isCollapsed: ($scope.collapsedLevel && +$scope.collapsedLevel) ? (+$scope.collapsedLevel <= 0) : true, /* set up isCollapsed properties, by default - true */

                        /* check editing level is high */
                        isHighEditLevel: $scope.editLevel !== "low",

                        /* if childs[key] is dragging now, dragChildKey matches to key  */
                        dragChildKey: null,

                        /* used to get info such as coordinates (top, left, height, width, meanY) of draggable elements by key */
                        dragElements: {},

                        /* check current node is object or array */
                        isObject: function(){
                            return angular.isObject($scope.json)
                        },

                        /* get type for current node */
                        type: function(){
                            return $scope.utils.getType($scope.type);
                        },

                        /* calculate collection length for object or array */
                        length: function(){
                            return ($scope.json instanceof Object) ? (Object.keys($scope.json).length) : 1
                        },

                        /* refresh template view */
                        refresh: function(){
                            $scope.refresh();
                        }
                    };
                },
                link: function(scope, element, attrs){

                	console.log(scope);
                	 var dataType="";
                     var arrayDimension = 0;

                	if(scope.type!=undefined){

                	 dataType=scope.type.split("[");
                     arrayDimension = scope.type.split("[").length;
                }
                	console.log("typoe "+scope.type);
                	var template="";
                //	scope.json="";
                //

                	 if(scope.type==="Number"||scope.type==="String"||scope.type==="Boolean")
             		{

             		template =

             		  '<ng-form name="inputForm">'+
             		  	'<div class="form-group" ng-class="{ \'has-error\': inputForm.input.$dirty && inputForm.input.$invalid , \'has-success\': inputForm.input.$valid}" >'+
             			  	'<input  class="form-control" name="input" ng-model="$parent.json" ng-attr-required="dispute" placeholder="{{type}}" json1="{{type}}"/>' +

             			  	'<ul class="help-block" ng-show="inputForm.input.$dirty && inputForm.input.$invalid">'+
    						'<li ng-show="inputForm.input.$error.required" >This field is required!</li>'+
    						'<li ng-show="inputForm.input.$error.json1" >'+
    							'<span>There are JSON errors. Please fix them:</span>'+
    							'<ul ng-repeat="error in inputForm.input.$error.json_errors">'+
    								'<li>{{error}}</li>'+
    							'</ul>'+
    						'</li>'+
    					'</ul>'+
    				'</div>'+
    			'</ng-form>';



             		/*'<input ng-if="type === \'Boolean\'" type="checkbox" class="form-control" name="input" ng-model="$parent.json" placeholder="boolean"  json1="{{type}}" />' +
                    '<input ng-if="type === \'Number\'" class="form-control" name="input" ng-model="$parent.json" placeholder="Number" json1="type"/>' +
                    '<input ng-if="type !== \'Number\'" class="form-control" name="input" ng-model="$parent.json" placeholder="testo" json1="{{type}}"/>'+
*/

             		}
             	else if(arrayDimension>2 ){
                		scope.newType=scope.type.substr(0,	scope.type.length-2);


                	       template =

                		'<span ng-bind="utils.wrap.start(node)"></span>' +
                        '<span ng-bind="node.isCollapsed ? utils.wrap.middle(node) : \'&nbsp;&nbsp;&nbsp;\'" ng-click="utils.clickNode(node)"></span>' +
                        '<ul ng-hide="node.isCollapsed">' +
                            '<li ng-repeat="key in utils.keys(json) track by key">' +
                                '<div draggable>' +
                                    '<span  class="key" ng-click="utils.clickNode(childs[key])" >{{ key }}: </span>' +
                                    '<span ng-hide="childs[key].isObject()">' +
                                        '<input ng-show="childs[key].type() === \'boolean\'" type="checkbox" ng-model="json[key]"/>' +
                                        '<input ng-show="childs[key].type() === \'number\'" type="number" ng-model="json[key]"/>' +
                                        '<input ng-show="childs[key].type() !== \'number\'" type="text" ng-model="json[key]" ng-change="utils.validateNode(key)" ng-disabled="childs[key].type() === \'function\'" placeholder="null"/>' +
                                    '</span>' +
                                    '<json-tree json="json[key]" edit-level="{{editLevel}}" collapsed-level="{{+collapsedLevel - 1}}" node="childs[key]" ng-show="childs[key].isObject()" type="newType"></json-tree>' +

                                    '<span class="reset" ng-dblclick="utils.resetNode(key)" ng-show="node.isHighEditLevel"> ~ </span>' +
                                    '<span class="remove" ng-dblclick="utils.removeNode(key)" ng-show="node.isHighEditLevel">-</span>' +
                                    '<span class="comma" ng-hide="utils.wrap.isLastIndex(node, $index + 1)">,</span>' +
                                '</div>' +
                            '</li>' +
                        '</ul>' +
                        '<span ng-bind="utils.wrap.end(node)"></span>' +
                        '<span class="add" ng-show="node.isHighEditLevel" ng-click="addTpl = !addTpl; inputKey = null; inputValue = null"> + </span>' +
                        '<span ng-show="(addTpl && node.isHighEditLevel) || false">' +
                            '<span ng-show="node.type() === \'object\'">object<input type="text" ng-model="inputKey" placeholder="key"/>: <input type="text" ng-model="inputValue" placeholder="value"/></span>' +
                            '<span ng-show="node.type() === \'array\'">array<input type="text" ng-model="inputValue" placeholder="value"/></span>' +
                            '<span ng-show="node.type() === \'matrix\'">row</span>' +

                            '<button ng-click="utils.addNode(inputKey, inputValue); addTpl = false">+</button><button ng-click="addTpl = false">c</button>' +
                        '</span>';



                	}
                	else if(arrayDimension>1 ){


                		console.log("dovrei entrare qua");
                		scope.newType=scope.type.substr(0,	scope.type.length-2);
                		console.log(scope.json);

                	       template =

                		'<span ng-bind="utils.wrap.start(node)"></span>' +
                        '<span ng-bind="node.isCollapsed ? utils.wrap.middle(node) : \'&nbsp;&nbsp;&nbsp;\'" ng-click="utils.clickNode(node)"></span>' +
                        '<ul ng-hide="node.isCollapsed">' +
                            '<li ng-repeat="key in utils.keys(json) track by key">' +
                                '<div draggable>' +
                                    '<span  class="key" ng-click="utils.clickNode(childs[key])" >{{ key }}: </span>' +
                                    '<span ng-hide="childs[key].isObject()">' +

                                        '<input ng-show="childs[key].type() === \'boolean\'" type="checkbox" ng-model="json[key]"/>' +
                                        '<input ng-show="childs[key].type() === \'number\'" type="number" ng-model="json[key]"/>' +
                                        '<input ng-show="childs[key].type() !== \'number\'" type="text" ng-model="json[key]" ng-change="utils.validateNode(key)" ng-disabled="childs[key].type() === \'function\'" placeholder="null"/>' +

                                        '</span>' +
                                    '<json-tree json="json[key]" edit-level="{{editLevel}}" collapsed-level="{{+collapsedLevel - 1}}" node="childs[key]" ng-show="childs[key].isObject()" type="newType"></json-tree>' +

                                    '<span class="reset" ng-dblclick="utils.resetNode(key)" ng-show="node.isHighEditLevel"> ~ </span>' +
                                    '<span class="remove" ng-dblclick="utils.removeNode(key)" ng-show="node.isHighEditLevel">-</span>' +
                                    '<span class="comma" ng-hide="utils.wrap.isLastIndex(node, $index + 1)">,</span>' +
                                '</div>' +
                            '</li>' +
                        '</ul>' +
                        '<span ng-bind="utils.wrap.end(node)"></span>' +
                        '<span class="add" ng-show="node.isHighEditLevel" ng-click="addTpl = !addTpl; inputKey = null; inputValue = null"> + </span>' +
                        '<span ng-show="(addTpl && node.isHighEditLevel) || false">' +
                            '<span ng-show="node.type() === \'object\'"><input type="text" ng-model="inputKey" placeholder="key"/>: <input type="text" ng-model="inputValue" placeholder="value"/></span>' +
                            '<span ng-show="node.type() === \'array\'"><input type="text" ng-model="inputValue" placeholder="value"/></span>' +
                            '<button ng-click="utils.addNode(inputKey, inputValue); addTpl = false">+</button><button ng-click="addTpl = false">c</button>' +
                        '</span>';



                	}
                	else {
                    /* define child scope and template */

                		scope.adtProprieties=ADTService.getByName(scope.type);
                		if(scope.json==null)
                			{scope.json={};

                			}

                	//	scope.newType= "Number";
                         template =
                        '<span ng-bind="utils.wrap.start(node)"></span>' +
                        '<span ng-bind="node.isCollapsed ? utils.wrap.middle(node) : \'&nbsp;&nbsp;&nbsp;\'" ng-click="utils.clickNode(node)"></span>' +
                        '<ul ng-hide="node.isCollapsed">' +
                            '<li ng-repeat="ADT in adtProprieties.structure track by $index">' +
                                '<div draggable>' +
                                    '<span  class="key" ng-click="utils.clickNode(childs[ADT.name])" >{{ ADT.name }} : </span>' +
                                    '<span ng-hide="childs[ADT.name].isObject()  || childs[ADT.name].type()==\'array\' ">' +
                                        '<input ng-show="childs[ADT.name].type() === \'boolean\'" type="checkbox" ng-model="$parent.$parent.json[ADT.name]"/>' +
                                        '<input ng-show="childs[ADT.name].type() === \'number\'" type="number" ng-model="$parent.$parent.json[ADT.name]"/>' +
                                        '<input ng-show="childs[ADT.name].type() !== \'number\'" type="text" ng-model="json[ADT.name]" placeholder="{{childs[ADT.name].type()}}"/>' +
                                    '</span>' +
                                    '<json-tree ng-if="ADT.type!==\'Number\' && ADT.type!==\'String\'" json="json[ADT.name]" edit-level="{{editLevel}}" collapsed-level="{{+collapsedLevel - 1}}" node="childs[ADT.name]"  type="ADT.type" ></json-tree>' +
                                    '<span class="reset" ng-dblclick="utils.resetNode(ADT.name)" ng-show="node.isHighEditLevel"> ~ </span>' +
                                    '<span class="remove" ng-dblclick="utils.removeNode(ADT.name)" ng-show="node.isHighEditLevel">-</span>' +
                                    '<span class="comma" ng-hide="utils.wrap.isLastIndex(node, $index + 1)">,</span>' +
                                '</div>' +
                            '</li>' +
                        '</ul>' +
                        '<span ng-bind="utils.wrap.end(node)"></span>' +
                        '<span class="add" ng-show="node.isHighEditLevel" ng-click="addTpl = !addTpl; inputKey = null; inputValue = null"> + </span>' +
                        '<span ng-show="(addTpl && node.isHighEditLevel) || false">' +
                            '<span ng-show="node.type() === \'object\'"><input type="text" ng-model="inputKey" placeholder="key"/>: <input type="text" ng-model="inputValue" placeholder="value"/></span>' +
                            '<span ng-show="node.type() === \'array\'"><input type="text" ng-model="inputValue" placeholder="value"/></span>' +
                            '<button ng-click="utils.addNode(inputKey, inputValue); addTpl = false">+</button><button ng-click="addTpl = false">c</button>' +
                        '</span>';
                	}


                	 var childScope = scope.$new(),template;
                    /* define build template function */

                    scope.build = function(_scope){
                    	 console.log("scope.node");
                    	 console.log(scope.node);
                     //   if (scope.node.isObject()){
                            element.html('').append($compile(template)(_scope));
                     //   }
                    };

                    /* define refresh function */
                    scope.refresh = function(){
                        childScope.$destroy();
                        childScope = scope.$new();
                        scope.build(childScope);
                    };

                    /* build template view */
                    scope.build(childScope);
                }
            }
        }])

        .directive('draggable', function($document) {
            return {
                link: function(scope, element, attr) {
                    var startX, startY, deltaX, deltaY, emptyElement, keys, index;

                    /* Save information of the current draggable element to the parent json-tree scope.
                     * This would be done under initialization */
                    scope.node.dragElements[scope.key] = function(){
                        return element;
                    }

                    element.on('mousedown', function(event) {
                        /* Check if pressed Ctrl */
                        if (event.ctrlKey) {

                            scope.node.dragChildKey = scope.key; // tell parent scope what child element is draggable now

                            var rect = getRectangle(scope.node.dragElements[scope.key]()[0]);

                            /* If child element is not draggable, than make the current element draggable */
                            if (scope.childs[scope.key].dragChildKey == null) {
                                // Prevent default dragging of selected content
                                event.preventDefault();

                                startX = rect.left;
                                startY = rect.top;
                                deltaX = event.pageX - startX;
                                deltaY = event.pageY - startY;

                                /* Draggable element should have 'absolute' position style parameter */
                                element.addClass('drag');
                                element.css({
                                    width: rect.width + 'px'
                                });
                                setPosition(startX, startY);

                                /* Add an empty element to fill the hole */
                                emptyElement = angular.element("<div class='empty'></div>");
                                emptyElement.css({
                                    height: (rect.height - 2) + 'px',
                                    width: (rect.width - 2) + 'px'
                                });
                                element.after(emptyElement);

                                /* Auxiliary array of json keys to retain the order of the current key's positions */
                                keys = Object.keys(scope.json);
                                index = scope.$index;

                                /* Subscribe on document mouse events */
                                $document.on('mousemove', mousemoveEventHandler);
                                $document.on('mouseup', mouseupEventHandler);
                            }
                        }
                    });

                    element.on('mouseup', function(event){
                        /* tell parent scope that the current element with his children are now not draggable */
                        scope.node.dragChildKey = null;
                    })

                    function mousemoveEventHandler(event) {
                        var rect = getRectangle(scope.node.dragElements[scope.key]()[0]),
                            meanBefore, meanAfter;

                        if (index >= keys.length - 1) meanAfter = Infinity;
                        else meanAfter = getRectangle(scope.node.dragElements[keys[index + 1]]()[0]).meanY;

                        if (index <= 0) meanBefore = -Infinity;
                        else meanBefore = getRectangle(scope.node.dragElements[keys[index - 1]]()[0]).meanY;

                        /* Check the criterion for swapping two sibling nodes */
                        if (rect.top + rect.height > meanAfter + 1) {
                            swapKeys(index, index + 1);
                            scope.node.dragElements[keys[index]]().parent().append(emptyElement);
                            index += 1;
                        }
                        else if (rect.top < meanBefore - 1){
                            swapKeys(index, index - 1);
                            scope.node.dragElements[keys[index]]().parent().prepend(emptyElement);
                            index -= 1;
                        }

                        setPosition(startX, event.pageY - deltaY)
                    }

                    function mouseupEventHandler() {
                        /* Fix position and update json and tree view */
                        scope.utils.moveNode(scope.$index, index);
                        scope.$apply();

                        element.removeClass('drag');
                        setPosition(startX, startY);

                        emptyElement.remove();

                        $document.unbind('mousemove', mousemoveEventHandler);
                        $document.unbind('mouseup', mouseupEventHandler);
                    }

                    function setPosition(x, y){
                        element.css({
                            top: y + 'px',
                            left: x + 'px'
                        });
                    }

                    function swapKeys(i, j){
                        var key = keys[i];
                        keys[i] = keys[j];
                        keys[j] = key;
                    }

                    /* Get coordinates of rectangle region for the element 'el' */
                    function getRectangle(el){
                        var box = el.getBoundingClientRect(),
                            top = Math.round(box.top + window.pageYOffset),
                            left = Math.round(box.left + window.pageXOffset),
                            height = typeof el.offsetHeight === 'undefined' ? 0 : el.offsetHeight,
                            width = typeof el.offsetWidth === 'undefined' ? 0 : el.offsetWidth;

                        return { top: top, left: left, height: height, width: width, meanY: top + height / 2}
                    };
                }
            }
        });
})()