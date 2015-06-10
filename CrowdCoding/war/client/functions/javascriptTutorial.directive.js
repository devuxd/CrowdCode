
//////////////////////
//  JAVA HELPER     //
//////////////////////


angular
    .module('crowdCode')
    .directive('javascriptHelper', ['$compile', '$timeout', '$http', 'ADTService', function($compile, $timeout, $http, ADTService) {
    
    var javascriptTutorialTxt = '\/\/ This is a javascript variable. \r\nvar x = 5;\r\n \r\n\/\/ There are no types in Javascript.\r\nx = \"A string now\";\r\nx = false;\r\nx = 3.5;\r\n \r\n\/\/ This is an array\r\nvar array = [1, 2, 3, 4];\r\nvar sum = 0;\r\n \r\n\/\/ You can loop over arrays\r\nfor (var i = 0; i < array.length; i++)\r\n    sum += array[i];\r\n \r\n\/\/ And push things onto an array\r\nwhile (sum > 0)\r\n{\r\n    array.push(x);\r\n    sum--; \r\n}\r\n\r\n\/\/ These are objects. Objects contains properties, which map a \r\n\/\/ name to a value. Objects function as a map: pick a property \r\n\/\/ name, and assign it a value (any name will do).\r\nvar emptyObject = { };\r\nvar obj2 = { propName: \"value\" };\r\nvar obj3 = { storedArray: array };\r\nvar obj4 = { nestedObject: obj3 };\r\nvar obj5 = { complexExpression: aFunctionCall(obj4) };\r\nvar obj6 = { property1: true,\r\n             property2: \"your string here\" };\r\n\r\n\/\/ Properties in objects can be accessed.\r\nvar obj3Also = obj4.nestedObject;\r\nvar anotherWayToGetObj3 = obj4[\"nestedObject\"];\r\n\r\n\/\/ Or you can check if an object has a property\r\nif (obj4.hasOwnProperty(\"nextedObject\"))\r\n    x = \"Definitely true\";\r\n\r\n\/\/ You can convert objects to strings (that look just like\r\n\/\/ object literals)\r\nvar stringObj2 = JSON.stringify(obj2); \r\n\/\/ stringObj2 == { \"propName\": \"value\" }\r\n\/\/ (the quotes on the property name are optional....)\r\n\r\n\/\/ And back again\r\nvar obj3 = JSON.parse(stringObj3);\r\n\r\n\/\/ Want to know how to do something else? Try a google search!';
    
    return {
        restrict: 'EA',
        templateUrl: '/client/functions/javascript_tutorial.html',

        link: function($scope, $element, $attributes) {

            // $http.get('functions/javascriptTutorial.txt').success(function(code) {
                $scope.javaTutorial = javascriptTutorialTxt;
            // });

        },
        controller: function($scope, $element) {



            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });

            };
        }
    };

}]);

