
/* -------- FIELD VALIDATORS --------- */

angular
    .module('crowdCode')
    .directive('jsonValidator', ['ADTService', function(ADTService) {
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

angular
    .module('crowdCode')
    .directive('jsonDataType', ['ADTService', function(ADTService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel) {
            ngModel.$validators.jsonDataType = function(modelValue,viewValue){
                var value = modelValue || viewValue;
                var validator = new JSONValidator();
                validator.initialize(ADTService.getNameToADT(), value, attrs.jsonDataType);
                validator.errorCheck();
                ngModel.$error.jsonErrors = validator.getErrors();
                return validator.isValid();
            };
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('reservedWord', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            var reservedWord= ["abstract","boolean","break","byte","case","catch","char","class","const","continue",
            "debugger","default","delete","do","double","else","enum","export","extends","false","final","finally",
            "float","for","function","goto","if","implements","import","in","instanceof","int","interface","long","native",
            "new","null","package","private","protected","public","return","short","static","super","switch","synchronized",
            "this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with"];

            ngModelCtrl.$parsers.unshift(function(viewValue) {
                
                if(reservedWord.indexOf(viewValue)===-1){
                    ngModelCtrl.$setValidity('reservedWord', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('reservedWord', false);
                   ngModelCtrl.$error.reservedWord = "You are using a reserved word of JavaScript, please Change it";
                   return viewValue;
                }
            });
        }
    };
});

angular
    .module('crowdCode')
    .directive('unicName', function(){
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
angular
    .module('crowdCode')
    .directive('adtValidator', ['ADTService', function(ADTService) {
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
angular
    .module('crowdCode')
    .directive('functionNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var functionsName=functionsService.getDescribedFunctionsName();
                var valid =  viewValue === ""|| viewValue === undefined || (functionsName.indexOf(viewValue) == -1);

                if (!valid) {

                    ctrl.$setValidity('function', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('function', true);
                    return viewValue;
                }

            });

        }
    };
}]);


// var name validator
angular
    .module('crowdCode')
    .directive('varNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var match = viewValue.match(/[a-zA-Z][\w\_]*/g);
                var valid = match != null && viewValue == match[0];
                if (!valid) {
                    ctrl.$setValidity('var', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('var', true);
                    return viewValue;
                }

            });

        }
    };
}]);

// check if a function code has errors
angular
    .module('crowdCode')
    .directive('functionValidator', ['$rootScope','ADTService', 'functionsService', function($rootScope,ADTService, functionsService) {

    var functionId;
    var funct;
    var allFunctionNames;
    var allFunctionCode;
    var errors = [];
    var code = "";
    var valid;
    var statements = 0;
    var startStatements;
    var maxNewStatements;
    var defaultMaxNewStatements=10;

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: { maxNewStatements: '=' },
        link: function(scope, elm, attrs, ctrl) {
            //initialize the max number of statements allowed to the scope value or the default value
            maxNewStatements = scope.maxNewStatements || defaultMaxNewStatements;
            //force  startStatements to undefined (necessary from the second time that the directive is used)
            startStatements = undefined;
            functionId = attrs.functionId;
            valid = true;

            var describedFunctions = functionsService.getDescribedFunctions();
            allFunctionNames = functionsService.getDescribedFunctionsName(functionId);
            allFunctionCode  = functionsService.getDescribedFunctionsCode(functionId) + " var console = null; " ;

            ctrl.$formatters.unshift(function(viewValue) {
                code=viewValue;
                validate(code);

                scope.$emit('statements-updated', statements, maxNewStatements);

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
  /*      if (code.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*{/g).length > 100){
            errors.push('Only one header is allowed in the code, please fix it');
            return false;
        }*/
        // 3. If the are syntactical errors displays the error and returns
        if (hasSyntacticalErrors(allFunctionCode + " "+code,getJSHintForPseudocalls()))
            return false;

        // 4. Trys to build the Est if not displays the error and return
        try {
            ast = esprima.parse(code, {loc: true});
        } catch (e) {

            errors.push("Error " + e.message);
            return false;
        }
        // 5. checks if the are ast Errors and displays it
        // returns true iff there are AST errors
        // Check for AST errors
        console.log('all',allFunctionNames);
        if (allFunctionNames.indexOf(ast.body[0].id.name) != -1)
            errors.push('The function name <strong>' + ast.body[0].id.name + '</strong> is already taken. Please use another.');
        

        // validate the order of the parameter between the description and the header

        var functonsName=[ast.body[0].id.name];
        var calleeNames = getCalleeNames(ast);
        for(i=1; i< ast.body.length; i++){ 

            if(ast.body[i].body===undefined)
                errors.push('There are errors in the code, please fix them.');
            else if(ast.body[1].id.name == ast.body[0].id.name)
                errors.push('Invalid pseudo function name <strong>'+ast.body[1].id.name+'</strong>.');
            else if( ast.body[i].params.length == 0 )
                errors.push('The pseudo function <strong>'+ast.body[1].id.name+'</strong> must have at least one parameter.')
            else if( functonsName.indexOf(ast.body[i].id.name)!==-1 )
                errors.push('The pseudo function <strong>'+ast.body[i].id.name +'</strong> has been declared multiple times');
            else if(ast.body[i].loc.start.line!==ast.body[i].loc.end.line || ast.body[i].body.loc.end.column - ast.body[i].body.loc.start.column!==2 )
                errors.push('Please, declare an empty body for the pseudo function <strong>'+ast.body[i].id.name+'</strong>. </br> <b>i.e. function functionName(parameters){}</b>');
            else if(calleeNames.indexOf(ast.body[i].id.name)===-1)
                errors.push('No occurrences of the pseudo function <strong>'+ast.body[i].id.name+'</strong>. Is it still needed?');
            functonsName.push(ast.body[i].id.name);
        }

        if(errors.length>0) return false;

        // 6. checks if the are errors in the descriptions structure
        hasDescriptionError(ast);
        var textSplitted=code.split("\n");
        var mainFunctionCode = textSplitted.slice(0,ast.body[0].loc.end.line).join("\n");
        if (hasSyntacticalErrors(mainFunctionCode,getJSHintForStatements(),true))
            return false;

        return false;
    }

    // Returns true iff there are syntactical errors
    function hasSyntacticalErrors(codeToValidate, JSHINTSettings, analyzeBody) {
        var lintResult = -1;
        // try to run JSHINT or catch and print error to the console
        try {
            lintResult = JSHINT(codeToValidate, JSHINTSettings);
            //console.log(JSHINT(functionCode, getJSHintForStatements()).getData());
        } catch (e) {
            console.log(e);
        }
        if(analyzeBody)
        {
            var functionsData = JSHINT.data().functions;
            if(functionsData.length>1){
                errors.push("Only one function is allowed, if you need more use the function stubs");
            }

            if( startStatements === undefined )
                startStatements = functionsData[0].metrics.statements;
            
            statements = functionsData[0].metrics.statements - startStatements;
            

            if( statements > maxNewStatements){
                errors.push("You are not allowed to insert more than "+maxNewStatements+" statements");
            }

        }
        if (!lintResult) {

            errors = errors.concat(checkForErrors(JSHINT.errors));
            if (errors.length > 0) {
                return true;
            }
        }

        return false;
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
        var paramNumber = 0;
        var returnNumber=0;
        // Loop over every line of the function description, checking for lines that have @param or @return
        var descriptionLines = getDescription(ast);
        for (var i = 0; i < descriptionLines.length; i++) {

            var line = descriptionLines[i].replace(/\s{2,}/g, ' ');

            if( line.search(paramKeyword)!==-1 ){
                paramNumber++;
                errorMessages = errorMessages.concat(checkForValidTypeNameDescription(paramKeyword, line, paramDescriptionNames));
            } else if( line.search(returnKeyword)!==-1 ){
                returnNumber++;
                errorMessages = errorMessages.concat(checkForValidTypeNameDescription(returnKeyword, line));
            }

        }

        //check that the function has at least 1 parameter and exaclty 1 return
        if(paramNumber===0)
            errorMessages.push("The function must have at least one parameter");
        if(returnNumber!==1)
            errorMessages.push("The function must have 1 return type");

        //if the description doesn't contain error checks the consistency between the parameter in the descriptions and the
        // ones in the header
        if (ast.body[0].params !== undefined) {

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
        var loc=line.search(keyword);
        var matches = line.match(/\w+(\[\])*/g);
        if( matches === null )
            return [];

        var type = matches[1];
        var name = matches[2];




        if (paramDescriptionNames !== undefined)
            paramDescriptionNames.push(name);

        if (type == -1)
            errorMessage.push("The keyword " + keyword + "must be followed by a valid type name on line '" + line + "'.");
        else if (!ADTService.isValidTypeName(type))
            errorMessage.push(type + ' is not a valid type name. Valid type names are ' + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).');
        else if (keyword === '@param' && !isValidName(name))
            errorMessage.push(name + ' is not a valid name. Use upper and lowercase letters, numbers, and underscores.');
        else if (keyword === '@param' && !isValidParamDescription(line))
            errorMessage.push(line + ' Is not a valid description line. The description line of each parameter should be in the following form: " @param [Type] [name] , [description]".');
        else if (keyword === '@return' && name != -1)
            errorMessage.push('The return value must be in the form  " @return [Type]".');

        return errorMessage;
    }


    //Checks that exists a description of the parameter
    function isValidParamDescription(line) {
        var beginDescription = line.indexOf(', ');
        if (beginDescription == -1 || line.substring(beginDescription).lenght < 5)
            return false;
        else
            return true;
    }

    // checks that the two vectors have the same value, if not return the errors (array of strings)
    function checkNameConsistency(paramDescriptionNames, paramHeaderNames) {

        var errors = [];


        if( paramDescriptionNames.length !== paramHeaderNames.length )
            errors.push('The number of the parameter in the description does not match the number of parameters in the function header');
        else {
            var orderError = "";
            for (var i = 0; i < paramDescriptionNames.length; i++) {
                if ( paramHeaderNames[i] != paramDescriptionNames[i]) {
                    orderError = 'The order of the parameters in the description does not match the order of the parameters in the function header' ;
                }
            }
            if( orderError !== "" ) errors.push(orderError);
        }

        
        for (var i = 0; i < paramDescriptionNames.length; i++) {
            if (paramHeaderNames.indexOf(paramDescriptionNames[i]) == -1) {
                errors.push('The parameter ' + paramDescriptionNames[i] + ' does not exist in the header of the function');
            }
        }

        for (var i = 0; i < paramHeaderNames.length; i++) {
            if (paramDescriptionNames.indexOf(paramHeaderNames[i]) == -1)
                errors.push('Please, write a desciption for the parameter ' + paramHeaderNames[i] + '.');
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
angular
    .module('crowdCode')
    .directive('functionConvections', function($sce){
    return {
        scope: true, // {} = isolate, true = child, false/undefined = no change
        restrict: 'EA', 
        templateUrl: '/html/templates/function_conventions.html',
        controller: function($scope, $element, $attrs) {
            $scope.examplePseudocode = $sce.trustAsHtml(
                        '<strong>Example:</strong>\n'+
                        'function foo() { \n'+
                        '  var values = [ 128, 309 ];\n'+
                        '  var avg;\n'+
                        '  <span class="pseudoCode">//# calc the average of the values</span>\n'+
                        '  return avg; \n' +
                        '}\n');
            $scope.examplePseudocall = $sce.trustAsHtml(
                        '<strong>Example:</strong>\n'+
                        'function foo() { \n'+
                        '  var values = [ 128, 309 ];\n'+
                        '  var avg = <span class="pseudoCall">calcAverage(values)</span>; \n'+
                        '  return avg; \n' +
                        '}\n'+
                        '// return the average of the values\n'+
                        'function calcAverage(values){}');

        }
    };
});

/* ---------- KEY LISTENERS ----------- */
angular
    .module('crowdCode')
    .directive('pressEnter', function() {


    return function(scope, element, attrs) {

        var keyPressListener = function(event){
            if (!event.shiftKey && !event.ctrlKey && event.which === 13 ) {
                scope.$apply(function() {
                    scope.$eval(attrs.pressEnter);
                });
                event.preventDefault();
                
            }
        };

        element.on('keydown', keyPressListener);

        element.on('$destroy',function(){
            element.off('keydown',null,keyPressListener);
        });
    };
});

angular
    .module('crowdCode')
    .directive('disableBackspace', function() {
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


angular
    .module('crowdCode')
    .directive('microtaskShortcuts', function() {
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

                // // if is CTRL + BACKSPACE skip microtask
                // else if ( charCode == 8 ) { 
                //     // console.log('CTRL+BACKSPACE');
                //     //scope.$emit('skipMicrotask');
                //     preventDefault = true;
                // } 

                // // if is CTRL + H start the tutorial
                // else if ( charCode == 72 ) { // H
                //     // console.log('CTRL+H');
                //     // preventDefault = true;
                // }
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
angular
    .module('crowdCode')
    .directive('focus', function(){
  return {
    link: function(scope, element) {
      element[0].focus();
    }
  };
});


angular
    .module('crowdCode')
    .directive('syncFocusWith', function($timeout, $rootScope) {
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


angular
    .module('crowdCode')
    .directive('javascriptHelper', ['$compile', '$timeout', '$http', 'ADTService', function($compile, $timeout, $http, ADTService) {

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


angular
    .module('crowdCode')
    .directive('adtList', ['$compile', '$timeout', 'ADTService', function($compile, $timeout, ADTService) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: '/html/templates/ui/adt_list.html',
        link: function($scope, $element, $attributes) {
            $scope.ADTs = ADTService.getAllADTs();
            $scope.ADTs.selectedADT = -1;
            $scope.buildStructure = function(adt){
                var struct = '{';
                angular.forEach(adt.structure,function(field){
                    struct += '\n  '+field.name+': '+field.type;
                })
                struct += '\n}';
                return struct;
            };
        }
    }
}]);

angular
    .module('crowdCode')
    .directive('resizer', function($document) {

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


angular
    .module('crowdCode')
    .directive('microtaskPopover', function($timeout, $rootScope, $firebase,$popover, microtasksService, functionsService,FunctionFactory, TestList){
    return {
        
        scope: true,
        controller: function($scope, $element, $attrs, $transclude) {

            var loadData = {
                'WriteFunction': function(news) {

                    if(news.microtask.submission.inDispute)
                        news.funct=functionsService.get(news.microtask.functionID);
                    else
                        news.funct = new FunctionFactory(news.microtask.submission);
                    
                    if (news.microtask.promptType == 'REMOVE_CALLEE')
                        news.callee=functionsService.get(news.microtask.calleeId);

                    if (news.microtask.promptType == 'DESCRIPTION_CHANGE') {
                        oldCode = news.microtask.oldFullDescription.split("\n");
                        newCode = news.microtask.newFullDescription.split("\n");
                        diffRes = diff(oldCode, newCode);
                        diffCode = "";
                        angular.forEach(diffRes, function(diffRow) {
                            if (diffRow[0] == "=") {
                                diffCode += diffRow[1].join("\n");
                            } else {
                                for (var i = 0; i < diffRow[1].length; i++)
                                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
                            }
                            diffCode += "\n";
                        });
                        news.calledDiffCode = diffCode;
                    }

                },

                'WriteTestCases': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },

                'ReuseSearch': function(news) {

                    news.funct = functionsService.get(news.microtask.functionID);
                    if(news.microtask.submission.noFunction===false)
                    news.calleeFunction = functionsService.get(news.microtask.submission.functionId);


                },
                'WriteTest': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },
                'WriteFunctionDescription': function(news) {
                    news.functionDescription = new FunctionFactory(news.microtask.submission).getSignature();
                    news.requestingFunction  = functionsService.get(news.microtask.functionID);
                },
                'WriteCall': function(news) {

                    news.funct = new FunctionFactory(news.microtask.submission);
                    news.calleeFunction = functionsService.get(news.microtask.calleeID);
                },
                'DebugTestFailure': function(news) {
                   news.funct = new FunctionFactory(news.microtask.submission);

                   if(news.microtask.submission.testId!==undefined){
                        news.test= TestList.get(news.microtask.submission.testId);
                        news.funct=functionsService.get(news.microtask.functionID);
                       // console.log(news.funct);
                   }

                },
                'Review': function(news) {

                    news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
                    news.microtask.$loaded().then(function() {

                        loadData[news.microtask.type](news);

                    });
                }

            };

            //Utility to show and hide the popover
            var showPopover = function(popover) {
              popover.$promise.then(popover.show);
            };
            var hidePopover = function(popover) {
              popover.$promise.then(popover.hide);
            };
         

            //
            $scope.showMicrotaskPopover = function(news) {

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
                            console.log(news.microtask);
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
                    for(var index in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[index]);
                    }
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                }


            };
        },
          link: function($scope, iElm, iAttrs, controller) {

        }
    };
});


angular
    .module('crowdCode')
    .directive('userMenu',function($popover){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var popoverSettings = {
                trigger: 'manual',
                placement: 'bottom',
                template:  '/html/templates/popover/user_popover.html'
            };
            popover = $popover(element,popoverSettings);
            popover.$scope.close = function(){
                popover.$promise.then(popover.hide);
            };

            element.on('click',function(event){  
               
                popover.$promise.then(popover.toggle);
            });

            
           
        }
    };
});


angular
    .module('crowdCode')
    .directive('examplesList',function($rootScope,$popover,ADTService){
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
                   $scope.value = exampleNumber[0].value;
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


angular
    .module('crowdCode')
    .directive('descriptionPopover',function($rootScope,$popover,functionsService){
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
            popover.$scope.code=$scope.descriptionPopover;

        }
    };
});


angular
    .module('crowdCode')
    .directive('chat', function($timeout, $rootScope, $firebase, $alert, avatarFactory, userService) {
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
                        workerId:     $rootScope.workerId,
                        microtaskKey: (userService.assignedMicrotaskKey===null)?'no-microtask':userService.assignedMicrotaskKey
                    });
                    $scope.data.newMessage = "";
                }
            };
        }
    };
});



// USED FOR UPLOADING THE USER PICTURE
angular
    .module('crowdCode')
    .directive('fileModel', ['$parse', function ($parse) {
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
angular
    .module('crowdCode')
    .directive('projectStats', function($rootScope,$firebase) {

    return {
        restrict: 'E',
        scope: true,
        template: '<b>Stats:</b>'
                  +'<span class="stats">'
                  +'<!--<span><span class="badge">{{microtaskCountObj.$value}}</span> microtasks</span>-->'
                  +'<span><span class="badge">{{functionsCount}}</span> functions</span>'
                  +'<span><span class="badge">{{testsCount}}</span> tests</span>'
                  +'<span><span class="badge">{{loc}}</span> loc</span>'
                  +'</span>',

        link: function($scope, $element) {

            //$scope.microtaskCountObj  = $firebase(new Firebase($rootScope.firebaseURL+'/status/microtaskCount')).$asObject();

            var functionsRef = new Firebase($rootScope.firebaseURL+'/artifacts/functions/');
            $scope.functionsCount = 0;
            functionsRef.on('child_added',function (snapshot){
                $scope.functionsCount ++;
            });

            $scope.loc = 0;
            functionsRef.on('value',function(snap){
                var functs = snap.val();
                $scope.loc = 0;
                angular.forEach(functs,function(val){
                    $scope.loc += val.linesOfCode;
                })
            });


        
            var testsRef = new Firebase($rootScope.firebaseURL+'/artifacts/tests');
            $scope.testsCount = 0;
            testsRef.on('child_added',function(snapshot){
                $scope.testsCount ++;
            });

        }
    };
});
angular
    .module('crowdCode')
    .directive('maxLength',function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

 
          ctrl.$parsers.push(function (viewValue) {
              var maxLength=attrs.maxLength || 70 ;
              var splittedDescription= viewValue.split('\n');
              var regex = '.{1,'+maxLength+'}(\\s|$)|\\S+?(\\s|$)';

              for(var i=0;i<splittedDescription.length;i++ )
              {
                  if(splittedDescription[i].length>maxLength)
                  {
                      splittedDescription[i]=splittedDescription[i].match(RegExp(regex, 'g')).join('\n  ');
                  }
              }

              return '  '+splittedDescription.join('\n  ')+'\n';
         });
          ctrl.$formatters.push(function (viewValue) {
                if( viewValue !== undefined )
                    return  viewValue.substring(2,viewValue.length-1).replace(/\n  /g,'\n');
                else
                    return viewValue;
          });

        }
    };
});

