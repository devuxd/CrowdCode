
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
        else if (!ADTService.isValidName(type))
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