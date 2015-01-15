/* -------- FIELD VALIDATORS --------- */

myApp.directive('jsonValidator', ['ADTService', function(ADTService) {
    return {
       
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            // instantiate a new JSONValidator
            var validator = new JSONValidator();
            ngModelCtrl.$formatters.unshift(function(viewValue) {
                // initialize JSONValidator and execute errorCheck
                validator.initialize(ADTService.getNameToADT(), viewValue, attrs.jsonValidator);
                validator.errorCheck();

                if(viewValue === undefined || validator.isValid() ){
                    ngModelCtrl.$setValidity('json', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('json', false);
                   ngModelCtrl.$error.json = validator.getErrors();
                   return viewValue;
                }
            });
        }
    };
}]);

myApp.directive('unicName', function(){
    return {
        scope: { parameters : "=" }, // {} = isolate, true = child, false/undefined = no change
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
        link: function($scope, iElm, iAttrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                // calc occurrences 
                var occurrence=0;
                angular.forEach($scope.parameters, function(value, key) {
                    if(value.paramName==viewValue)
                        occurrence++;
                });
                if (occurrence!==0) {
                    ctrl.$setValidity('unic', false);
                    ctrl.$error.unic = "More occurence of the same parameter name have been found, plese fix them";
                    return viewValue;
                } else {
                    ctrl.$setValidity('unic', true);
                    return viewValue;
                }

            });
        }
    };
});

// check if a variable type is a valid ADT
myApp.directive('adtValidator', ['ADTService', function(ADTService) {
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

// check if a functionName is already taken
myApp.directive('functionNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
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

// check if a function code has errors
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
            allFunctionCode = functionsService.getAllDescribedFunctionCode(functionId)+ " var debug = null; " ;

            ctrl.$formatters.unshift(function(viewValue) {

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

        // 2. If the are more header displays the error and returns
        if (code.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g).length > 1){
            errors.push('Only one header is allowed in the code, please fix it');
            return false;
        }
        // 3. If the are syntactical errors displays the error and returns
        if (hasSyntacticalErrors(code))
            return false;

        // 4. Trys to build the Est if not displays the error and return
        try {
            ast = esprima.parse(code, {loc: true});
        } catch (e) {

            errors.push("Error " + e.message);
            return false;
        }

        // 5. checks if the are ast Errors and displays it
        hasASTErrors(code, ast);
        // 6. checks if the are errors in the descriptions structure
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


// helper for the function editing convenctions
myApp.directive('functionConvections', function(){
    return {
        scope: true, // {} = isolate, true = child, false/undefined = no change
        restrict: 'EA', 
        templateUrl: '/html/templates/function_conventions.html',
        controller: function($scope, $element, $attrs) {
            $scope.pseudocall='function foo() { \n'+
                        '\tvar values = [ 128, 309 ];\n'+
                        '\t//# calc the least common multiple of values\n'+
                        '\tvar avg;\n'+
                        '\t//!avg = Compute the average of (values) \n'+
                        '\treturn { average: avg, lcm: lcm }; \n' +
                        '}';

        }
    };
});

/* ---------- KEY LISTENERS ----------- */
myApp.directive('pressEnter', function() {


    return function(scope, element, attrs) {

        var keyPressListener = function(event){
            if (!event.shiftKey && !event.ctrlKey && event.which === 13 ) {
                scope.$apply(function() {
                    scope.$eval(attrs.pressEnter);
                });
                event.preventDefault();
                
            }
        };

        element.on('keydown keypress', keyPressListener);

        element.on('$destroy',function(){
            element.off('keydown keypress',null,keyPressListener);
        });
    };
});

myApp.directive('disableBackspace', function() {
    return function(scope, element, attrs) {
        element.unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && 
                     (
                         d.type.toUpperCase() === 'TEXT' ||
                         d.type.toUpperCase() === 'PASSWORD' || 
                         d.type.toUpperCase() === 'FILE' || 
                         d.type.toUpperCase() === 'EMAIL' || 
                         d.type.toUpperCase() === 'SEARCH' || 
                         d.type.toUpperCase() === 'DATE' )
                     ) || 
                    d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });
    };
});


myApp.directive('microtaskShortcuts', function() {
    return function(scope, element, attrs) {

        // manage the key down
        var keyDownListener = function(event, formData){

            var charCode = event.which || event.keyCode;
            var preventDefault = false;

            // all the microtask shortcuts are a combination of CTRL + key
            if( event.ctrlKey ) {

                // if is CTRL + ENTER submit microtask
                if(charCode == 13) { 
                    // console.log('CTRL+ENTER');
                    scope.$broadcast('collectFormData', scope.microtaskForm);
                    preventDefault = true;
                } 

                // if is CTRL + BACKSPACE skip microtask
                else if ( charCode == 8 ) { 
                    // console.log('CTRL+BACKSPACE');
                    scope.$emit('skipMicrotask');
                    preventDefault = true;
                } 

                // if is CTRL + H start the tutorial
                else if ( charCode == 72 ) { // H
                    // console.log('CTRL+H');
                    // preventDefault = true;
                }
            }

            // if a combo has been managed
            // prevent other default behaviors
            if( preventDefault )
                event.preventDefault();

        };

        // bind keydown listener
        element.on('keydown', keyDownListener);

        // unbind keydown listener on microtask form destroy
        element.on('$destroy',function(){
            element.off('keydown',null,keyDownListener);
        });
    };
});

/* --------- FORM FOCUS MANAGEMENT HELPERS ------------ */
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
        link: function(scope, element, attrs) {
            var unwatch = $scope.watch("focusValue", function(currentValue, previousValue) {
                if (currentValue === true && !previousValue) {
                    element[0].focus();
                } else if (currentValue === false && previousValue) {
                    element[0].blur();
                }
            });

            element.on('$destroy',function(){
                unwatch();
            });
        }
    };
});



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
    };

}]);


myApp.directive('adtList', ['$compile', '$timeout', 'ADTService', function($compile, $timeout, ADTService) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: '/html/templates/adt_list.html',
        link: function($scope, $element, $attributes) {
            $scope.ADTs = ADTService.getAllADTs();
            $scope.ADTs.selectedADT = -1;
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
        var mouseDownListener = function(event) {
            event.preventDefault();
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        };
        $element.on('mousedown', mouseDownListener);

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
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
        }

        $element.on('$destroy',function(){
            $element.off('mousedown', mouseDownListener);
        });
    };
});


myApp.directive('microtaskPopover', function($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService){
    return {
        
        scope: true,
        controller: function($scope, $element, $attrs, $transclude) {

            var loadData = {
                'WriteFunction': function(news) {

                    news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;


                },

                'WriteTestCases': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTestSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + news.microtask.functionID + '/'
                    + news.microtask.submission.functionVersion));
                    var functionUnderTest = functionUnderTestSync.$asObject();

                    functionUnderTest.$loaded().then(function(){

                        news.editorCode = functionsService.renderDescription(functionUnderTest)+functionUnderTest.header;
                    });
                },

                'ReuseSearch': function(news) {
                    news.microtask.pseudoCall= news.microtask.callDescription;
                    if(news.microtask.submission.noFunction === false)
                        news.editorHeader = functionsService.renderHeaderById(news.microtask.submission.functionId);
                },
                'WriteTest': function(news) {

                    //function
                    var functionUnderTestSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + news.microtask.functionID + '/'
                    + news.microtask.submission.functionVersion));
                    news.functionUnderTest = functionUnderTestSync.$asObject();

                    news.functionUnderTest.$loaded().then(function(){

                        news.editorCode = functionsService.renderDescription(news.functionUnderTest)+news.functionUnderTest.header;
                    });

                    //test case
                    news.testcases=[{}];
                    news.testcases[0].text=news.microtask.owningArtifact;
                    //test
                    news.test = news.microtask.submission;

                },
                'WriteFunctionDescription': function(news) {

                    news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;
                },
                'WriteCall': function(news) {

                    news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;

                },
                'DebugTestFailure': function(news) {

                    //news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;

                },
                'Review': function(news) {

                    news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
                    news.microtask.$loaded().then(function() {

                        loadData[news.microtask.type](news);

                    });
                }

            };

            //Utility to show and hode the popover
            var showPopover = function(popover) {
              popover.$promise.then(popover.show);
            };
            var hidePopover = function(popover) {
              popover.$promise.then(popover.hide);
            };

            //
            $scope.showMicrotaskPopover = function(news) {

                //se undefined creala mostrala e nascondi le altre
                //se defined se mi arriva la mia non fare niente
                // se defined e non è la mia nascondi le altre e visualizza la mia
                if($scope.$parent.popover[news.microtaskKey]===undefined){

                    //Hide all the popover if any is visualized
                    for(var key in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[key]);
                    }
                    $scope.$parent.popover[news.microtaskKey] = $popover($element, {template : "/html/templates/popover/news_popover.html", placement:"right-bottom", trigger : "manual", autoClose: "false", container: "body"   });
                    $scope.$parent.popover[news.microtaskKey].$scope.n=news;
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                    //load the data
                    news.microtask = microtasksService.get(news.microtaskKey);
                    news.microtask.$loaded().then(function() {
                        //if the microtask is a review
                        if (news.microtask.type == "Review") {
                            news.isReview = true;
                            news.qualityScore = news.microtask.submission.qualityScore;
                            news.reviewText = news.microtask.submission.reviewText;
                        } else if (angular.isDefined(news.microtask.review)) {

                            news.qualityScore = news.microtask.review.qualityScore;
                            news.reviewText = news.microtask.review.reviewText;
                        }
                        loadData[news.microtask.type](news);

                       
                    });

                } else if($scope.$parent.popover[news.microtaskKey].$isShown === false){

                    //Hide all the popover if any is visualized
                    for(var key in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[key]);
                    }
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                }


            };
        },
          link: function($scope, iElm, iAttrs, controller) {

        }
    };
});


myApp.directive('userMenu',function($popover){
    return {
        restrict: 'A',
        link: function(scope, element){
            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  '/html/templates/popover/user_popover.html'
            };
            popover= $popover(element,popoverSettings);
            popover.$scope.close = function(){
                popover.$promise.then(popover.hide);
            };

            element.on('click',function(){  
                popover.$promise.then(popover.toggle);
            });

            
           
        }
    };
});


myApp.directive('examplesList',function($rootScope,$popover,ADTService){
    return {
        restrict: 'EA',
        scope:{
            paramType :'=',
            key : '=',
            value : '='
        },
        link: function($scope, element,attrs){

            //function to load the example in the ng-model of the exapmle
            var loadExampleValue = function(value){
                $scope.value=value;
            };

            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  '/html/templates/popover/examples_list_popover.html',
            };


            //load all the examples og the ADT
            var loadExamples = function(ADTName) {
                //check if ADT is multidimensional
                var dimension=ADTName.match(/\[\]/g);
                ADTName= ADTName.replace('[]','');

                var examplesList =  ADTService.getByName(ADTName).examples;
                
                //if the ADT is multidimensional adds the square brackets to all values of the examples
                if(dimension!==null){
                    var modifiedExamples=[];
                    var startValue='';
                    var endValue='';
                    for(var i=0; i<dimension.length; i++){
                        startValue+='[';
                        endValue+=']';
                    }
                    angular.forEach(examplesList,function(example,key)
                    {
                        modifiedExamples.push({name : example.name, value :startValue + example.value + endValue});
                    });
                    return modifiedExamples;
                }
                return examplesList;
            };

            var togglePopover = function(popoverKey) {
                //if the popover is undefined creates the popover
                if($rootScope.examplesListPopover[popoverKey]===undefined)
                {
                    //check if already another popover opened, if so destoy that one
                    if($rootScope.examplesListPopoverKey!==undefined){
                        $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].$promise.then($rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].hide);
                        $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey]=undefined;
                    }
                    //popover inizialization
                    $rootScope.examplesListPopover[popoverKey] = $popover(element, popoverSettings);
                    $rootScope.examplesListPopover[popoverKey].$promise.then($rootScope.examplesListPopover[popoverKey].show);
                    $rootScope.examplesListPopover[popoverKey].$scope.examplesList=loadExamples($scope.paramType);
                    $rootScope.examplesListPopover[popoverKey].$scope.togglePopover = togglePopover;
                    $rootScope.examplesListPopover[popoverKey].$scope.key = popoverKey;
                    $rootScope.examplesListPopover[popoverKey].$scope.loadExampleValue = loadExampleValue;

                    //sets the popover opened as this one
                    $rootScope.examplesListPopoverKey = popoverKey;
                }
                else
                {
                    //if the popover is not undefined means that is open and so close the popover
                    $rootScope.examplesListPopover[ popoverKey].$promise.then($rootScope.examplesListPopover[ popoverKey].hide);
                    $rootScope.examplesListPopover[ popoverKey]=undefined;
                    $rootScope.examplesListPopoverKey=undefined;
                }
            };

            element.on('click',function(){
                if($rootScope.examplesListPopover===undefined)
                    $rootScope.examplesListPopover=[];
                var exampleNumber= loadExamples($scope.paramType);
                if(exampleNumber.length==1){
                   $scope.value=exampleNumber[0].value;
                   $scope.$apply();
                   if($rootScope.examplesListPopoverKey!==undefined){
                       $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].$promise.then($rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey].hide);
                       $rootScope.examplesListPopover[ $rootScope.examplesListPopoverKey]=undefined;
                       $rootScope.examplesListPopoverKey=undefined;
                   }
                }else{

                    //if doesn't exist yet the list of popovers inizialize it
                   

                    togglePopover($scope.key);
                }
            });
        }
    };
});


myApp.directive('descriptionPopover',function($rootScope,$popover,functionsService){
    return {
        restrict: 'EA',
        scope:{
            descriptionPopover :'=',
        },
        link: function($scope, element,attrs){

            var popoverSettings = {
                trigger: 'hover',
                placement: 'top',
                template:  '/html/templates/popover/description_popover.html',
            };

            var popover=$popover(element, popoverSettings);
            popover.$scope.code=functionsService.renderDescription($scope.descriptionPopover) + $scope.descriptionPopover.header;

        }
    };
});

/////////////////////
//  NEWS DIRECTIVE //
/////////////////////

myApp.directive('newsPanel', function($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService) {
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
            $scope.popover=[];
           
            // create the reference and the sync
            var ref = new Firebase($rootScope.firebaseURL + '/workers/' + $rootScope.workerId + '/newsfeed');
            var sync = $firebase(ref);

            // bind the array to scope.leaders
            $scope.news = sync.$asArray();
        }
    };
});


myApp.directive('chat', function($timeout, $rootScope, $firebase, $alert, avatarFactory) {
    return {
        restrict: 'E',
        templateUrl: '/html/templates/panels/chat_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {

            $rootScope.chatActive = false;
            $rootScope.unreadedMessages=0;
            $rootScope.$on('toggleChat', function() {
                $element.find('.chat').toggleClass('active');
                $rootScope.chatActive = ! $rootScope.chatActive;
                $rootScope.unreadMessages =0;
            });
        },
        controller: function($scope, $element, $rootScope) {
            // syncs and references to firebase 
            var chatRef = new Firebase($rootScope.firebaseURL + '/chat');
            
            // data about the 'new message' alert
            var alertData = {
                duration : 4, // in seconds
                object : null,
                text   : '',
                worker : '',
                createdAt : 0
            };

            // track the page load time
            var startLoadingTime = new Date().getTime();

            // set scope variables
            $scope.avatar = avatarFactory.get;
            $rootScope.unreadMessages=0;
            $scope.messages = [];

            // for each added message 
            chatRef.on('child_added',function(childSnap, prevChildName){

                    // get the message data and add it to the list
                    var message = childSnap.val();
                    $scope.messages.push(message);

                    // if the chat is hidden and the timestamp is 
                    // after the timestamp of the page load
                    if( message.createdAt > startLoadingTime ) 
                        if( !$rootScope.chatActive ){

                             // increase the number of unread messages
                            $rootScope.unreadMessages++;
                            
                            // if the current message has been sent
                            // from the same worker of the previous one
                            // and the alert is still on
                            if( alertData.worker == message.workerHandle && ( message.createdAt - alertData.createdAt) < alertData.duration*1000 ) {
                                // append the new text to the current alert
                                alertData.text += '<br/>'+message.text;
                                alertData.object.hide();
                            } else { 
                                // set data for the new alert
                                alertData.text   = message.text;
                                alertData.worker = message.workerHandle;
                            }
                           
                            // record the creation time of the alert
                            // and show it 
                            alertData.createdAt = new Date().getTime();
                            alertData.object    = $alert({
                                title    : alertData.worker, 
                                content  : alertData.text , 
                                duration : alertData.duration ,
                                template : '/html/templates/alert/alert_chat.html', 
                                keyboard : true, 
                                show: true
                            });
                        } 
                    
                    $timeout( function(){ $scope.$apply() }, 100);
            });

            // hide the alert if the chat becomes active
            $rootScope.$watch('chatActive',function(newVal,oldVal){
                if( newVal && alertData.object != null )
                    alertData.object.hide();
            });

            // add new message to the conversation
            $scope.data = {};
            $scope.data.newMessage = "";
            $scope.addMessage = function() {
                if( $scope.data.newMessage.length > 0){
                    var newMessageRef = chatRef.push();
                    newMessageRef.set({
                        text:         $scope.data.newMessage,
                        createdAt:    Date.now(),
                        workerHandle: $rootScope.workerHandle,
                        workerId:     $rootScope.workerId
                    });
                    $scope.data.newMessage = "";
                }
            };
        }
    };
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
            $scope.currentStep = 0;
            $scope.totSteps = $element.find('step').length;

            var btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">next</a>';

            var $tutorialContainer;
            var $overlay;
            var $content;

            var onShow = '';
            var onHide = '';
            

            $scope.start = function() {

                $tutorialContainer = $('<div class="tutorial-container"></div>');

                // create highlight layer
                $overlay = $('<div class="overlay"></div>');
                $tutorialContainer.append($overlay);

                // create the content layer 
                $content = $('<div class="content"></div>');
                $content.fadeOut();
                $tutorialContainer.append($content);

                // compile the element with $scope
                $compile($tutorialContainer.contents())($scope);

                // append the element to the body
                $('body').append($tutorialContainer);

                // show the overlay 
                $overlay.animate({opacity: 1}, 50);

                // reset the current step
                currentStep = 0;

                // visualize the first step
                $scope.showNext();
            };

            var prevOnHide = undefined;
            $scope.showNext = function() {
               

                // increment current Step (first step is = 1)
                $scope.currentStep += 1;
                
                // if the tutorial is finished, destroy it
                if ($scope.currentStep > $scope.totSteps) {
                    $scope.currentStep = 0;
                    $scope.destroy();
                    return;
                }



                console.log('TUTORIAL: step '+$scope.currentStep+'/'+$scope.totSteps);

                btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">'+( $scope.currentStep == $scope.totSteps ? 'finish' : 'next' )+'</a>';

                // retrieve the current step DOM-element
                // and the commands to apply on show/hide of the step content
                var $step  = $element.find('step:nth-child(' + $scope.currentStep + ')');
       
                var onShow = $step.attr('on-show') ;
                var onHide = $step.attr('on-hide') ;

                var contentStyle = $step.attr('style');
                var contentHtml  = $step.html();
                var highlight    = $step.attr('highlight');


                if( highlight !== undefined ){

                    var $highlightTag = $(document).find('#'+highlight)
                    var placement = $step.attr('placement');

                    if( placement === undefined )
                        throw "a placement should be defined!";

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    // calculate the hightlight css
                    var highlightCss = {
                        top    : $highlightTag.offset().top   ,
                        left   : $highlightTag.offset().left  ,
                        width  : $highlightTag.outerWidth()   ,
                        height : $highlightTag.outerHeight()
                    };

                    // calculate the content css
                    var contentCss = {
                        top  : highlightCss.top,
                        left : highlightCss.left
                    };

                    if( prevOnHide !== undefined && prevOnHide.length > 0 ) 
                        $scope.$eval(prevOnHide);

                    $content.fadeOut(400,function(){


                        $content.html(contentHtml + '<br/>' +btnNextHtml);
                        $compile($content.contents())($scope);

                        $content.attr('style',contentStyle);

                        var width  = $content.outerWidth();
                        var height = $content.outerHeight();
                        var margin = 20;

                        if( placement == 'left' )        contentCss.left += -width - margin; 
                        else if( placement == 'right' )  contentCss.left += $highlightTag.outerWidth() +margin ; 
                        else if( placement == 'top' )    contentCss.top  += -height -margin ;
                        else if( placement == 'bottom' ) contentCss.top  += $highlightTag.outerHeight() +margin ;
                        else if( placement == 'top-center' )  {
                            contentCss.top  += -height -margin ;
                            if( $highlightTag.outerWidth() > width )
                                contentCss.left += ($highlightTag.outerWidth()-width)/2;
                            else
                                contentCss.left += -(width-$highlightTag.outerWidth())/2;

                        }  
                        else if( placement == 'right-center' )  {
                            contentCss.left += $highlightTag.outerWidth() +margin ;
                            if( $highlightTag.outerHeight() > height )
                                contentCss.top += ($highlightTag.outerHeight()-height)/2;
                            else
                                contentCss.top += -(height-$highlightTag.outerHeight())/2;

                        }  

                        $content.css(contentCss);
                        console.log(contentCss);

                        $overlay.animate(highlightCss, 400, function(){
                            // $content.animate(contentCss, 200 ,function(){
                                $content.fadeIn(300);
                            // });
                        });
                    });
                    
                } else {

                    var contentCss = {};
                    contentCss.top   = '20%';
                    contentCss.left  = '30%';
                    contentCss.width = '40%';

                    if( onShow !== undefined && onShow.length > 0 ) 
                        $scope.$eval(onShow);

                    $content.fadeOut(300,function(){
                        $content.html(contentHtml + '<br/>' +btnNextHtml);
                        $compile($content.contents())($scope);

                        $content.css(contentCss);
                        $overlay.animate({
                            width: '0px',
                            height: '0px',
                            top: '-50px',
                            left: '-50px'
                        },200,function(){
                            $content.fadeIn(300);
                        });

                    });
                    
                }
                

                prevOnHide = onHide;

            };

            $scope.destroy = function() {

                // remove the tutorial from the document
                $overlay = $content = $circles = $buttonBar = null;
                $tutorialContainer.remove();
                $tutorialContainer = null;

                $(document).find('.main-wrapper').css('bottom', 0);
            };
            
            $scope.$on('tutorial-'+$scope.title,function(){
                console.log("INITIALIZING THE TUTORIAL ");
                $scope.start();
            });
        }

    };
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

            $scope.microtaskCountObj  = $firebase(new Firebase($rootScope.firebaseURL+'/status/microtaskCount')).$asObject();

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
