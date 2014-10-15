
// directive for json field validation
myApp.directive('json', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            // instantiate a new JSONValidator
            var validator = new JSONValidator();
            var paramType = "Number";

            ctrl.$parsers.unshift(function (viewValue) {
                // initialize JSONValidator and execute errorCheck
                validator.initialize(viewValue,paramType)
                validator.errorCheck();
                
                if (!validator.isValid()) {
                    ctrl.$setValidity('json', false);
                    ctrl.$error.json_errors = validator.getErrors();
                    return undefined;
                } else {
                    ctrl.$setValidity('json', true);
                    return viewValue;
                }
            });
        }
    };  
});


// <div function-validator ng-model="somevar"></div>
myApp.directive('functionValidator',['ADTService','functionsService',function(ADTService, functionsService) {
    
    var functionId
    var funct;    
    var allFunctionNames;
    var allFunctionCode;
    var errors = [];
    var code = "";
    var valid;

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            functionId = attrs.function;
            valid = true;
            allFunctionNames = functionsService.getAllDescribedFunctionNames(functionId);
            allFunctionCode  = functionsService.getAllDescribedFunctionCode(functionId);

            ctrl.$formatters.unshift(function (viewValue) {

                code = viewValue;
                validate(code);

                if(errors.length>0){
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


    function getDescription(ast){
        var codeLines     = code.split("\n");
        var descStartLine = 0;
        var descEndLine   = ast.loc.start.line ;
        var descLines     = codeLines.slice(descStartLine, descEndLine);
        return descLines;
    }
    
    // Check the code for errors. If there are errors present, write an error message. Returns true 
    // iff there are no errors.
    function validate(code){
        errors = [];
        // 1. check for syntactical errors
        // 2. check for AST error
        if(hasSyntacticalErrors(code)) // if has errors
            if (hasPseudocallsOrPseudocode(code)) { // and has pseudocalls/code
                var replacedText = replaceFunctionCodeBlock(code);
                // If the text does not contain a function block, display an error.
                if (replacedText == '')
                    errors.push('No function block could be found. Make sure that there is a line that starts with "function".');
                else if (!hasSyntacticalErrors(replacedText)) {
                    var ast = esprima.parse(replacedText, {loc: true});         
                    return hasASTErrors(code, ast);           
                }
            }
        else {
            // Code is syntactically valid and should be able to build an ast.
            // Build the ast and do additional checks using the ast.
             var ast = esprima.parse(code, {loc: true});     
            return hasASTErrors(code, ast);
        }       
        return false;
    }

    // Returns true iff there are syntactical errors
    function hasSyntacticalErrors()
    {
        var functionCode = allFunctionCode + " " + code;
        var lintResult = -1;
        // try to run JSHINT or catch and print error to the console
        try       { lintResult = JSHINT(functionCode,getJSHintGlobals()); }
        catch (e) { console.log("Error in running JSHHint. " + e.name + " " + e.message); }

        if(!lintResult){
            errors = errors.concat(checkForErrors(JSHINT.errors));
            if(errors.length > 0) {
                return true;
            } 
        }                           

        return false;
    }
    
    // returns true iff there are AST errors
    function hasASTErrors(text, ast)
    {
        console.log(ast);
        var errorMessages = [];

        // Check for AST errors
        if (ast.body.length == 0 || ast.body[0].type != "FunctionDeclaration" || ast.body.length > 1)
            errorMessages.push("All code should be in a single function");
        else if (allFunctionNames.indexOf(ast.body[0].id.name) != -1)
            errorMessages.push("The function name '" + ast.body[0].id.name + "' is already taken. Please use another.");                   
        
        // Also check for purely textual errors
        // 1. If there is a pseudocall to replace, make sure it is gone
        /*
        if (highlightPseudoCall != false && text.indexOf(highlightPseudoCall) != -1)            
            errorMessages.push("Replace the pseudocall '" + highlightPseudoCall + "' with a call to a function.");   */      
        
        errorMessages = errorMessages.concat(hasDescriptionError(ast));   
            
        if (errorMessages.length != 0)
        {
            errors = errors.concat(errorMessages);
            return true;
        }
        else
        {       
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
    function hasDescriptionError(ast)
    {
        var errorMessages =  [];
        var paramKeyword = '@param ';
        var returnKeyword = '@return ';
        var paramDescriptionNames=[];
        // Loop over every line of the function description, checking for lines that have @param or @return
        var descriptionLines = getDescription(ast);

        for (var i = 0; i < descriptionLines.length; i++)
        {
            var line = descriptionLines[i];
            errorMessages = errorMessages.concat(checkForValidTypeNameDescription(paramKeyword, line, paramDescriptionNames));
            errorMessages = errorMessages.concat(checkForValidTypeNameDescription(returnKeyword, line));
        }

        //if the description doesn't contain error checks the consistency between the parameter in the descriptions and the
        // ones in the header
        if( errorMessages.length == 0 && !(ast.body[0].params === undefined) ){
            
            var paramHeaderNames=[];
            $.each(ast.body[0].params, function(index, value)
            {
                paramHeaderNames.push(ast.body[0].params[index].name);
            });
            
            errorMessages = errorMessages.concat(checkNameConsistency(paramDescriptionNames,paramHeaderNames));
        }
        return errorMessages;       
    }

    // Checks that, if the specified keyword occurs in line, it is followed by a valid type name. If so,
    // it returns an empty string. If not, an error message is returned.
    function checkForValidTypeNameDescription(keyword, line, paramDescriptionNames)
    {
         var errorMessage = [];
        //subtitues multiple spaces with a single space
        line = line.replace(/\s{2,}/g,' ');
        
        var loc = line.search(keyword);
        
        if (loc != -1)  
        {
            var type = findNextWord(line, loc + keyword.length);
            var name = findNextWord(line, loc + keyword.length+type.length+1);
           

            if(paramDescriptionNames!=undefined)
                paramDescriptionNames.push(name);
            
            if (type == -1)
                errorMessage.push("The keyword " + keyword + "must be followed by a valid type name on line '" + line + "'.");              
            else if (!ADTService.isValidTypeName(type))
                errorMessage.push(type + ' is not a valid type name. Valid type names are '
                  + 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).');
            else if (keyword==='@param '&& !isValidName(name))
                errorMessage.push(name+ ' is not a valid name. Use upper and lowercase letters, numbers, and underscores.');   
            else if (keyword==='@param '&& !functionsService.isValidParamDescription(line))
                errorMessage.push(line+' Is not a valid description line. The description line of each parameter should be in the following form: " @param [Type] [name] - [description]".');      
            else if (keyword==='@return ' && name!=-1)
                errorMessage.push('The return value must be in the form  " @return [Type]".'); 
        }
        
        return errorMessage;
    }

    // checks that the two vectors have the same value, if not return the errors (array of strings)
    function checkNameConsistency(paramDescriptionNames,paramHeaderNames)
    {

        var errors = [];

        for( var i=0 ; i<paramHeaderNames.length ; i++){ 
            if ( paramDescriptionNames.indexOf(paramHeaderNames[i]) == -1 )
                errors.push('Write a desciption for the parameter '+paramHeaderNames[i]+'.');
        }
    
        if(errors.length == 0)
            for( var i=0;i<paramDescriptionNames.length;i++){
                if (paramHeaderNames.indexOf(paramDescriptionNames[i])==-1){
                    errors.push('The parameter '+paramDescriptionNames[i] +' does not exist in the header of the function');
                }
            }
        
        return errors;
    }
    
    
    // checks that the name is vith alphanumerical characters or underscore
    function isValidName(name){
        var regexp = /^[a-zA-Z0-9_]+$/;
        if (name.search(regexp)==-1) return false;
        return true;    
    }
    
    // Returns true iff the text contains at least one pseudocall or pseudocode
    function hasPseudocallsOrPseudocode(text)
    {
        return (text.indexOf('//!') != -1) || (text.indexOf('//#') != -1);
    }

    // Replaces function code block with empty code. Function code blocks must start on the line
    // after a function statement.
    // Returns a block of text with the code block replaced or '' if no code block can be found
    function replaceFunctionCodeBlock(text)
    {     
        var lines = text.split('\n');           
        for (var i = 0; i < lines.length; i++)
        {
            if (lines[i].startsWith('function'))
            {       
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

myApp.directive('pressEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.pressEnter);
                });

                event.preventDefault();
            }
        });
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
            })
        }
    }
});

