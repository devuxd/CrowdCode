// directive for json field validation
myApp.directive('jsonValidator', ['ADTService', function(ADTService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            // instantiate a new JSONValidator
            var validator = new JSONValidator();

            ctrl.$formatters.unshift(function(viewValue) {
                // initialize JSONValidator and execute errorCheck
                validator.initialize(ADTService.getNameToADT, viewValue, attrs.json-validator);
                validator.errorCheck();
                if (!validator.isValid() && viewValue !== undefined) {
                    ctrl.$setValidity('json', false);
                    ctrl.$error.json = validator.getErrors();
                    return viewValue;
                } else {
                    ctrl.$setValidity('json', true);
                    return viewValue;
                }
            });
        }
    };
}]);

//<div function-validator ng-model="somevar"></div>
myApp.directive('adtValidator', ['ADTService', function(ADTService) {


    var errors = [];
    var valid;

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var valid =  viewValue === ""|| viewValue === undefined || ADTService.isValidTypeName(viewValue) ;
                if (!valid) {

                    ctrl.$setValidity('adt', false);
                    ctrl.$error.adt = "Is not a valid type name. Valid type names are 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).";
                    return viewValue;
                } else {
                    ctrl.$setValidity('adt', true);

                    return viewValue;
                }

            });

        }
    };
}]);

//<div name-validator ng-model="somevar"></div>
myApp.directive('nameValidator', ['functionsService', function(functionsService) {


    var errors = [];
    var valid;

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                console.log("viewValue");
                var functionsName=functionsService.getAllDescribedFunctionNames();
                var valid =  viewValue === ""|| viewValue === undefined || (functionsName.indexOf(viewValue) == -1);

                if (!valid) {

                    ctrl.$setValidity('name', false);
                    ctrl.$error.name = "The function name: "+viewValue+" is already taken, please change it";
                    return viewValue;
                } else {
                    ctrl.$setValidity('name', true);
                    return viewValue;
                }

            });

        }
    };
}]);

// <div function-validator ng-model="somevar"></div>
myApp.directive('functionValidator', ['ADTService', 'functionsService', function(ADTService, functionsService) {

    var functionId;
    var funct;
    var allFunctionNames;
    var allFunctionCode;
    var errors = [];
    var code = "";
    var valid;

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            functionId = scope.microtask.functionID;
            valid = true;
            allFunctionNames = functionsService.getAllDescribedFunctionNames(functionId);
            allFunctionCode = functionsService.getAllDescribedFunctionCode(functionId)+ "function printDebugStatement(){}" ;

            ctrl.$formatters.unshift(function(viewValue) {
                console.log("FUNCTION VALIDATOR");
                code = viewValue;
                validate(code);

                if (errors.length > 0) {
                    ctrl.$setValidity('function', false);
                    ctrl.$error.function_errors = errors;
                    return undefined;
                } else {
                    ctrl.$setValidity('function', true);
                    ctrl.$error.function_errors = [];
                    return viewValue;
                }

            });

        }
    };


    function getDescription(ast) {
        var codeLines = code.split("\n");
        var descStartLine = 0;
        var descEndLine = ast.loc.start.line;
        var descLines = codeLines.slice(descStartLine, descEndLine);
        return descLines;
    }

    // Check the code for errors. If there are errors present, write an error message. Returns true
    // iff there are no errors.
    function validate(code) {
        errors = [];
        var ast;

        // 1. If the text does not contain a function block, display an error and return.
        if (replaceFunctionCodeBlock(code) === '') {
            errors.push('No function block could be found. Make sure that there is a line that starts with "function".');
            return false;
        }

        // 2. If the are syntactical errors displays the error and returns
        if (hasSyntacticalErrors(code))
            return false;

        // 3. Trys to build the Est if not displays the error and return
        try {
            ast = esprima.parse(code, {loc: true});
        } catch (e) {
            console.log("Error in running Esprima. " + e.name + " " + e.message);
            errors.push("Error " + e.message);
            return false;
        }

        // 4. checks if the are ast Errors and displays it
        hasASTErrors(code, ast);
        // 5. checks if the are errors in the descriptions structure
        hasDescriptionError(ast);

        return false;

    }

    // Returns true iff there are syntactical errors
    function hasSyntacticalErrors() {
        var functionCode = allFunctionCode + " " + code;
        var lintResult = -1;
        // try to run JSHINT or catch and print error to the console
        try {
            lintResult = JSHINT(functionCode, getJSHintGlobals());
        } catch (e) {
            console.log("Error in running JSHHint. " + e.name + " " + e.message);
        }

        if (!lintResult) {

            errors = errors.concat(checkForErrors(JSHINT.errors));
            if (errors.length > 0) {
                return true;
            }
        }

        return false;
    }

    // returns true iff there are AST errors
    function hasASTErrors(text, ast) {
        var errorMessages = [];


        // Check for AST errors
        if (ast.body.length === 0 || ast.body[0].type != "FunctionDeclaration" || ast.body.length > 1)
            errorMessages.push("All code should be in a single function");
        else if (allFunctionNames.indexOf(ast.body[0].id.name) != -1)
            errorMessages.push("The function name '" + ast.body[0].id.name + "' is already taken. Please use another.");
        // Also check for purely textual errors
        // 1. If there is a pseudocall to replace, make sure it is gone
        /*
        if (highlightPseudoCall != false && text.indexOf(highlightPseudoCall) != -1)
            errorMessages.push("Replace the pseudocall '" + highlightPseudoCall + "' with a call to a function.");   */
        if (errorMessages.length !== 0) {
            errors = errors.concat(errorMessages);
            return true;
        } else {
            return false;
        }
    }

    // Checks if the function description is in he form " @param [Type] [name] - [description]"
    // and if has undefined type names.
    // i.e., checks that a valid TypeName follows @param  (@param TypeName)
    // checks that a valid TypeName follows @return.
    // A valid type name is any type name in allADTs and the type names String, Number, Boolean followed
    // by zero or more sets of array brackets (e.g., Number[][]).
    // Returns an error message(s) if there is an error
    function hasDescriptionError(ast) {
        var errorMessages = [];
        var paramKeyword = '@param ';
        var returnKeyword = '@return ';
        var paramDescriptionNames = [];
        // Loop over every line of the function description, checking for lines that have @param or @return
        var descriptionLines = getDescription(ast);

        for (var i = 0; i < descriptionLines.length; i++) {
            var line = descriptionLines[i];
            errorMessages = errorMessages.concat(checkForValidTypeNameDescription(paramKeyword, line, paramDescriptionNames));
            errorMessages = errorMessages.concat(checkForValidTypeNameDescription(returnKeyword, line));
        }

        //if the description doesn't contain error checks the consistency between the parameter in the descriptions and the
        // ones in the header
        if (!(ast.body[0].params === undefined)) {

            var paramHeaderNames = [];
            $.each(ast.body[0].params, function(index, value) {
                paramHeaderNames.push(ast.body[0].params[index].name);
            });

            errorMessages = errorMessages.concat(checkNameConsistency(paramDescriptionNames, paramHeaderNames));
        }
        if (errorMessages.length !== 0) {
            errors = errors.concat(errorMessages);
            return true;
        } else {
            return false;
        }
    }

    // Checks that, if the specified keyword occurs in line, it is followed by a valid type name. If so,
    // it returns an empty string. If not, an error message is returned.
    function checkForValidTypeNameDescription(keyword, line, paramDescriptionNames) {
        var errorMessage = [];
        //subtitues multiple spaces with a single space
        line = line.replace(/\s{2,}/g, ' ');

        var loc = line.search(keyword);

        if (loc != -1) {
            var type = findNextWord(line, loc + keyword.length);
            var name = findNextWord(line, loc + keyword.length + type.length + 1);


            if (paramDescriptionNames !== undefined)
                paramDescriptionNames.push(name);

            if (type == -1)
                errorMessage.push("The keyword " + keyword + "must be followed by a valid type name on line '" + line + "'.");
            else if (!ADTService.isValidTypeName(type))
                errorMessage.push(type + ' is not a valid type name. Valid type names are ' + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).');
            else if (keyword === '@param ' && !isValidName(name))
                errorMessage.push(name + ' is not a valid name. Use upper and lowercase letters, numbers, and underscores.');
            else if (keyword === '@param ' && !isValidParamDescription(line))
                errorMessage.push(line + ' Is not a valid description line. The description line of each parameter should be in the following form: " @param [Type] [name] , [description]".');
            else if (keyword === '@return ' && name != -1)
                errorMessage.push('The return value must be in the form  " @return [Type]".');
        }

        return errorMessage;
    }


    //Checks that exists a description of the parameter
    function isValidParamDescription(line) {
        var beginDescription = line.indexOf(' , ');
        if (beginDescription == -1 || line.substring(beginDescription).lenght < 5)
            return false;
        else
            return true;
    }

    // checks that the two vectors have the same value, if not return the errors (array of strings)
    function checkNameConsistency(paramDescriptionNames, paramHeaderNames) {

        var errors = [];

        for (var i = 0; i < paramHeaderNames.length; i++) {
            if (paramDescriptionNames.indexOf(paramHeaderNames[i]) == -1)
                errors.push('Write a desciption for the parameter ' + paramHeaderNames[i] + '.');
        }

        if (errors.length == 0)
            for (var i = 0; i < paramDescriptionNames.length; i++) {
                if (paramHeaderNames.indexOf(paramDescriptionNames[i]) == -1) {
                    errors.push('The parameter ' + paramDescriptionNames[i] + ' does not exist in the header of the function');
                }
            }

        return errors;
    }


    // checks that the name is vith alphanumerical characters or underscore
    function isValidName(name) {
        var regexp = /^[a-zA-Z0-9_]+$/;
        if (name.search(regexp) == -1) return false;
        return true;
    }

    // Returns true iff the text contains at least one pseudocall or pseudocode
    function hasPseudocallsOrPseudocode(text) {
        return (text.indexOf('//!') != -1) || (text.indexOf('//#') != -1);
    }

    // Replaces function code block with empty code. Function code blocks must start on the line
    // after a function statement.
    // Returns a block of text with the code block replaced or '' if no code block can be found
    function replaceFunctionCodeBlock(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('function')) {
                // If there is not any more lines after this one, return an error
                if (i + 1 >= lines.length - 1)
                    return '';

                // Return a string replacing everything from the start of the next line to the end
                // Concatenate all of the lines together
                var newText = '';
                for (var j = 0; j <= i; j++)
                    newText += lines[j] + '\n';

                newText += '{}';
                return newText;
            }
        }

        return '';
    }

}]);



myApp.directive('functionConvections', function(){
    // Runs during compile
    return {
        scope: true, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope, $element, $attrs, $transclude) {
            $scope.pseudocall='function foo() { \n'+
                        '\tvar values = [ 128, 309 ];\n'+
                        '\t//# calc the least common multiple of values\n'+
                        '\tvar avg;\n'+
                        '\t//! avg=average(values) \n'+
                        '\treturn { average: avg, lcm: lcm }; \n' +
                        '}';

        },
        restrict: 'EA', 
        templateUrl: '/html/templates/function_conventions.html'
    };
});

myApp.directive('pressEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13 && !event.shiftKey) {
                scope.$apply(function() {
                    scope.$eval(attrs.pressEnter);
                });

                event.preventDefault();
            }
        });
    };
});

myApp.directive('submitHotKey', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {

            if (event.which === 13 && event.ctrlKey) {
                scope.$apply(function() {
                    console.log("HOTKEY");
                    scope.$eval(attrs.submitHotKey);
                });

                event.preventDefault();
            }
        });
    };
});
myApp.directive('focus', function(){
  return {
    link: function(scope, element) {
      element[0].focus();
    }
  };
});


myApp.directive('syncFocusWith', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {
            $scope.$watch("focusValue", function(currentValue, previousValue) {
                if (currentValue === true && !previousValue) {
                    $element[0].focus();
                } else if (currentValue === false && previousValue) {
                    $element[0].blur();
                }
            });
        }
    };
});

myApp.directive('collapsableList', ['$compile', '$timeout', function($compile, $timeout) {

    return {
        restrict: "E",
        scope: {
            dataObjects: "=data",
            togglerTemplate: "@togglerTemplate",
            elementTemplate: "@elementTemplate",
            classCondition: "@listElementClassCondition"
        },
        link: function($scope, $element, $attributes) {
            var classCondition = '';
            if ($attributes.listElementClassCondition)
                classCondition = 'ng-class="{' + $scope.classCondition + '}"';
            var toCompile = '<ul class="collapsable-list">' + '    <li ng-repeat="(key,data) in dataObjects" class="{{ key == activeElement ? \'active\':\'\' }}" ' + classCondition + '>' + '        <div class="toggler" ng-include="togglerTemplate"></div>' + '        <div class="element"><div class="element-body" ng-include="elementTemplate"></div></div>' + '    </li>' + '</ul>';

            var $toggler = $(toCompile);
            $element.append($toggler);
            $compile($element.contents())($scope);

            console.log($element.find('.toggler'));
            /*
                        $scope.activeElement = 0;
                        $scope.doToggle = function(key){
                            $scope.activeElement = key;
                        }*/
        },
        controller: function($scope, $element) {

        }
    };
}]);


//////////////////////
//  JAVA HELPER     //
//////////////////////


myApp.directive('javascriptHelper', ['$compile', '$timeout', '$http', 'ADTService', function($compile, $timeout, $http, ADTService) {

    return {
        restrict: "EA",
        templateUrl: "/html/templates/java_tutorial.html",

        link: function($scope, $element, $attributes) {

            $http.get('/js/javascriptTutorial.txt').success(function(code) {
                $scope.javaTutorial = code;
            });

        },
        controller: function($scope, $element) {



            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });

            };
        }
    }

}]);



myApp.directive('adtBar', ['$compile', '$timeout', 'ADTService', function($compile, $timeout, ADTService) {

    return {
        restrict: "EA",

        link: function($scope, $element, $attributes) {

            $scope.ADTs = ADTService.getAllADTs();


            angular.forEach($scope.ADTs, function(value, key) {

                var childScope = $scope.$new();
                childScope.ADT = value;
                var toggler = $("<h3></h3>");
                //  toggler.attr('id',value.name+'Toggler');
                toggler.addClass('toggler-adt');
                toggler.html(value.name);

                var elementBody = "<ng-include src=\"'/html/templates/adt_detail.html'\"></ng-include>";
                elementBody = $('<div class="element-body-adt">' + elementBody + '</div>');

                var element = $("<div></div>");
                element.attr('id', value.name + 'Element');
                element.addClass('element-adt');

                element.append(elementBody);


                $element.append(toggler);
                $element.append(element);
                $compile($element.contents())(childScope);
            });

            function activateElement(el) {
                // remove class active for all togglers
                $element.find('.toggler-adt').removeClass('active');
                // reset height for all elements
                $element.find('.element-adt').height(0);

                // add class active to the toggler
                el.addClass('active');
                // set max height for current element
                var successor = el.next();
                successor.height(successor.find('.element-body-adt').outerHeight());
            }

            $element.find('.toggler-adt').on('click', function() {
                activateElement($(this));
            })

            $timeout(function(){
                $element.find('.toggler-adt:first-child').addClass('active');
            },100);

        }
    }
}]);


myApp.directive('resizer', function($document) {

    return function($scope, $element, $attrs) {
        // calculate the sum of the 2 element's dimensions in percentage
        // respect to the parent element dimension
        // - height: if vertical resizer
        // - width:  if horizontal resizer
        // and position the resize bar in between the elements

        // on mouse down attach mousemove and mouseup callbacks
        $element.on('mousedown', function(event) {
            event.preventDefault();
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });

        function mousemove(event) {

            if ($attrs.resizer == 'vertical') {
                var datas = {
                        leftX: $($attrs.resizerLeft).offset().left,
                        rightX: $($attrs.resizerRight).offset().left,
                        mouseX: event.pageX
                    }
                    //$element.css({ left: $($attrs.resizerRight).position().left + 'px' });

                var totalSizePx = $($attrs.resizerLeft).outerWidth() + $element.outerWidth() + $($attrs.resizerRight).outerWidth();
                var totalSizePer = Math.round(totalSizePx / $element.parent().outerWidth() * 100);

                var leftWidthPer = Math.round((datas.mouseX - datas.leftX) / $element.parent().outerWidth() * 100);

                if ($attrs.resizerMain == "left") {


                    if (leftWidthPer < 0) leftWidthPer = 0;
                    if (leftWidthPer > totalSizePer) leftWidthPer = totalSizePer;
                    if ($attrs.resizerMin && leftWidthPer < $attrs.resizerMin) leftWidthPer = $attrs.resizerMin;
                    if ($attrs.resizerMax && leftWidthPer > $attrs.resizerMax) leftWidthPer = $attrs.resizerMax;

                    var rightWidthPer = totalSizePer - leftWidthPer;

                } else if ($attrs.resizerMain == "right") {

                    var rightWidthPer = totalSizePer - leftWidthPer;

                    if (rightWidthPer < 0) rightWidthPer = 0;
                    if (rightWidthPer > totalSizePer) rightWidthPer = totalSizePer;
                    if ($attrs.resizerMin && rightWidthPer < $attrs.resizerMin) rightWidthPer = $attrs.resizerMin;
                    if ($attrs.resizerMax && rightWidthPer > $attrs.resizerMax) rightWidthPer = $attrs.resizerMax;

                    //var leftWidthPer = totalSizePer - rightWidthPer;
                }

                $($attrs.resizerLeft).css({
                    width: leftWidthPer + '%'
                });
                $($attrs.resizerRight).css({
                    width: rightWidthPer + '%'
                });

            } else {
                var datas = {
                    topY: $($attrs.resizerTop).offset().top,
                    bottomY: $($attrs.resizerBottom).position().top,
                    mouseY: event.pageY
                }

                var totalSizePx = $($attrs.resizerTop).outerHeight() + $element.outerHeight() + $($attrs.resizerBottom).outerHeight();
                var resizerHeightPx = $element.outerHeight();
                var topHeightPx = (datas.mouseY - datas.topY);
                var bottomHeightPx = totalSizePx - resizerHeightPx - topHeightPx;

                if ($attrs.resizerMain == "top") {



                } else {


                }

                if (topHeightPx + resizerHeightPx + bottomHeightPx == totalSizePx)
                    console.log("MATCH");
                else
                    console.log("DONT MATCH");

                console.log([totalSizePx, topHeightPx + resizerHeightPx + bottomHeightPx, topHeightPx, resizerHeightPx, bottomHeightPx]);

                $($attrs.resizerTop).css({
                    height: topHeightPx + 'px'
                });
                $($attrs.resizerBottom).css({
                    height: bottomHeightPx + 'px'
                });

            }


        }

        // when mouse up detach the callbacks
        function mouseup() {
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);
        }
    };
});



/////////////////////
//  NEWS DIRECTIVE //
/////////////////////

myApp.directive('newsPanel', function($timeout, $rootScope, $firebase, microtasksService, functionsService) {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/panels/news_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {
            console.log("NEWS DIRECTIVE INITIALIZED");
        },
        controller: function($scope, $element) {
            var loadData = {
                'WriteFunction': function(news) {
                    console.log('WriteFunction');
                    news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;
                },

                'WriteTestCases': function(news) {
                    console.log('WriteTestCase');
                    news.testcases = news.microtask.submission.testCases;
                },

                'ReuseSearch': function(news) {
                    console.log('ReuseSearch');
                },
                'WriteTest': function(news) {
                    console.log('WriteTest');
                    news.test = news.microtask.submission;
                    //news.test=
                },
                'WriteFunctionDescription': function(news) {

                    console.log('WriteFunctionDescription');

                    news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;
                },
                'WriteCall': function(news) {
                    console.log('WriteCall');
                    news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;

                },
                'Review': function(news) {
                    console.log('Review');
                    news.microtask = microtasksService.get(news.microtask.microtaskIDUnderReview);
                    news.microtask.$loaded().then(function() {

                        loadData[news.microtask.type](news);

                    });
                }
            };



            // create the reference and the sync
            var ref = new Firebase($rootScope.firebaseURL + '/workers/' + $rootScope.workerId + '/newsfeed');
            var sync = $firebase(ref);

            // bind the array to scope.leaders
            $scope.news = sync.$asArray();
            $scope.loadMicrotask = function(news) {


                news.microtask = microtasksService.get(news.microtaskID);
                news.microtask.$loaded().then(function() {
                    //if the microtask is a review
                    if (news.microtask.type == "Review") {
                        news.isReview = true;
                        news.qualityScore = news.microtask.submission.qualityScore;
                        news.reviewText = news.microtask.submission.reviewText;
                    } else if (angular.isDefined(news.microtask.review)) {
                        console.log("qualityScore" + news.microtask.review.qualityScore);
                        news.qualityScore = news.microtask.review.qualityScore;
                        news.reviewText = news.microtask.review.reviewText;
                    }
                    loadData[news.microtask.type](news);
                });

            };
        }
    };
});


myApp.directive('chat', function($timeout, $rootScope, $firebase) {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/panels/chat_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {
            console.log("CHAT DIRECTIVE INITIALIZED");
            $rootScope.chatActive = false;
            $rootScope.$on('toggleChat', function() {
                $element.find('.chat').toggleClass('active');
                $element.find('.output').scrollTop($element.find('.output').height())
            });
        },
        controller: function($scope, $element) {
            var $output = $element.find('.output');

            // create the reference and the sync
            var chatRef = new Firebase($rootScope.firebaseURL + '/chat').limit(10);
            var sync = $firebase(chatRef);

            // bind the array to scope.leaders
            $scope.messages = sync.$asArray();
            $scope.messages.$watch(function(event) {
                if (event.event == 'child_added') {
                    console.log($element.find('.output'))
                    $element.find('.output-wrapper').animate({
                        scrollTop: 650 //$element.find('.output').height()
                    }, 100);
                }
            });

            $scope.asd = "";
            // key press function
            $scope.addMessage = function() {
                $scope.messages.$add({
                    text: $scope.asd,
                    createdAt: Date.now(),
                    workerHandle: $rootScope.workerHandle
                }).then(function(ref) {

                });
                $scope.asd = "";
                return true;
            };
        }
    }
});


myApp.directive('tutorial', function($compile) {
    return {
        restrict: 'E',

        scope: {
            title: "@"
        },
        link: function($scope, $element, attrs) {
            // $element.prepend('<div style="position:absolute;width:100%;height:100%;background-color:black;opacity:0.7"></div>')
        },
        controller: function($scope, $element) {
            console.log("TUTORIAL ");
            console.log("appending overlay");



            $scope.currentStep = 0;
            $scope.totSteps = $element.find('step').length;

            // create overlay and append to the $element
            var $overlay = $('<div class="overlay"></div>');
            //var $nextButton = $('');
            var $content = $('<div class="content"></div>');
            var $buttonBar = $('<div class="button-bar"><div class="title">CrowdCode Tutorial: {{title}} </div><button class="btn btn-primary btn-next" ng-click="nextStep()">next step</button></div>');

            var circlesHtml = '<div class="circles">' +
                '<div ng-repeat="n in [] | range:totSteps" class="circle"><div class="{{ n >= currentStep ? \'\' : \'completed\'}}"></div></div>' +
                '</div>';
            var $circles = $(circlesHtml);

            $scope.init = function() {


                $buttonBar.append($circles);
                // append overlay and next button to
                $element.append($overlay);
                $element.append($content);
                $element.append($buttonBar);

                // compile the element
                $compile($element.contents())($scope);

                $(document).find('.main-wrapper').css('bottom', $buttonBar.outerHeight());

                $overlay.animate({
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    opacity: 1
                }, 50);
                // init the current step
                currentStep = 0;
                // visualize next step
                this.nextStep();
            }

            $scope.destroy = function() {
                // remove the tutorial from the document
                $overlay.remove();
                $content.remove();
                $circles.remove();
                $buttonBar.remove();

                $(document).find('.main-wrapper').css('bottom', 0);
            }

            //$scope.init = function(){ };
            $scope.nextStep = function() { // increment current Step (first step is = 1)
                $scope.currentStep += 1;
                // loop through steps
                if ($scope.currentStep > $scope.totSteps) {
                    $scope.destroy();
                    return;
                }

                // retrieve the elements
                var $step = $element.find('step:nth-child(' + $scope.currentStep + ')');
                var $stepTag = $(document).find($step.find('tag').html());
                var stepContent = $step.find('content').html();
                var contentPosition = $step.find('content-position').html();


                // initialize offset with the tag offset
                var top = $stepTag.offset().top;
                var left = $stepTag.offset().left;
                var width = 200;
                var height = 200;
                var margin = 20;

                if (contentPosition == 'left') {
                    left = left - width - margin;
                } else if (contentPosition == 'right') {
                    left = left + $stepTag.outerWidth() + margin;
                } else if (contentPosition == 'top') {
                    top = top - height - margin;
                } else if (contentPosition == 'bottom') {
                    top = top + height + margin;
                }

                $content.animate({
                    opacity: 0
                }, 500, function() {

                    $overlay.animate({
                        backgroundColor: "black"
                    }, 500, function() {
                        // resize the overlay and move to the tag to hightlight
                        $overlay.css('top', $stepTag.offset().top)
                            .css('left', $stepTag.offset().left)
                            .css('width', $stepTag.outerWidth())
                            .css('height', $stepTag.outerHeight());

                        $overlay.animate({
                            backgroundColor: "white"
                        }, 500, function() {
                            // end of overlay animation
                            $content.html(stepContent);
                            $content.css('top', top)
                                .css('left', left)
                                .css('width', width)
                                .css('height', height);
                            $content.animate({
                                top: top + 'px',
                                left: left + 'px',
                                width: width + 'px',
                                height: height + 'px',
                                opacity: 1
                            }, 500);
                        });
                    });
                });

            };

            //$scope.init();
        }

    }
});

// USED FOR UPLOADING THE USER PICTURE
myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

// VIEWS THE STATS
myApp.directive('projectStats', function($rootScope,$firebase) {

    return {
        restrict: 'E',
        scope: true,
        template: '<b>Stats:</b><span class="stats"><span><span class="badge">{{microtaskCountObj.$value}}</span> microtasks</span><span><span class="badge">{{functionsCount}}</span> functions</span><span><span class="badge">{{testsCount}}</span> tests</span></span>',
        link: function($scope, $element) {
            console.log("STATS DIRECTIVE LINK EXECUTE");
            $scope.microtaskCountObj  = $firebase(new Firebase($rootScope.firebaseURL+'/status/microtaskCount')).$asObject();


            console.log("FIREBASE URL "+$rootScope.firebaseURL);
            var functionsRef = new Firebase($rootScope.firebaseURL+'/artifacts/functions/');
            $scope.functionsCount = 0;
            functionsRef.on('child_added',function (snapshot){
                $scope.functionsCount ++;
            });
        
            


            var testsRef = new Firebase($rootScope.firebaseURL+'/artifacts/tests');
            $scope.testsCount = 0;
            testsRef.on('child_added',function(snapshot){
                $scope.testsCount ++;
            });

        }
    };
});


