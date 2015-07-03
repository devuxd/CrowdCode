
// check if a functionName is already taken
angular
    .module('crowdCode')
    .factory('functionUtils', [ 'functionsService', function functionUtils(functionsService) {
    return {
        parse               : parse,
        validate            : validate,
        // parseDescription    : parseDescription,
        // validateDescription : validateDescription,
    };

    function isInRange(where,range){
        if( where.start.line > range.start.line && where.end.line < range.end.line )
            return true;
        return false;
    }

    function parse (text) {

        var dto = {
            description: '',
            returnType: '',
            parameters: [],
            header: '',
            name: '',
            code: '',
            calleeIds: [],
            requestedFunctions: [],
            requestedDataTypes: [],
        };


        // configure esprima to parse comment blocks
        // and the ranges of all the block
        var esprimaConf = {
            loc: true, 
            comment: true
        };

        // build the syntactic tree from the text
        var ast = esprima.parse( text, esprimaConf);
        var commentBlocks = ast.comments;
        var commentBlocksOutside = [];
        var requestedNames = [];
        var calleeNames = [];

        console.log(ast);

        if( ast.body.length > 0 ){
            // get the function body (function name(){ }) range
            var bodyNode = ast.body[0];
            var bodyRange = bodyNode.loc;
            var bodyText = text
                            .split('\n')
                            .slice(bodyRange.start.line-1,bodyRange.end.line-1)
                            .join('\n');


            // filter out the comment blocks inside the body of the function
            var commentsOutside = commentBlocks.filter(function(block){
                return !isInRange(block.loc, bodyRange);
            });

                
            if( commentsOutside.length > 0 ){
                // the first comment block is the actual function description
                // extend the dto object with the parsed description
                angular.extend(dto,parseDescription(commentsOutside[0].value));

                // the others comment blocks can be requestedFunctions or requestedDataTypes
                for ( var i = 1 ; i < commentsOutside.length; i++ ) {
                    var value = commentsOutside[i].value;
                    
                    // if it's a function request block
                    if ( value.search('@function') != -1 ) {
                        var parsed = parseFunctionDoc( value );
                        requestedNames.push(parsed.name);
                        console.log('adding',parsed.name);
                        dto.requestedFunctions.push(parsed);
                    }
                    // if it's a data type request block
                    else if ( value.search('@typedef') != -1 ) {
                        console.log('requested data type!')
                    }
                }
            }

                
            // get the callee names and for those that
            // are not the requested functions, search
            // the relative Id
            calleeNames = getCalleeNames(ast);
            for(i =0; i< calleeNames.length; i++) {
                if ( requestedNames.indexOf( calleeNames[i] ) > -1 ) {
                    calleeNames.slice(i,1);
                } 
                else {
                    var functionId = functionsService.getIdByName(calleeNames[i]);
                    if(functionId!=-1)
                        dto.calleeIds.push(functionId);
                }
            }

            // complete the dto data
            dto.header = bodyText.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*/g)[0];
            dto.code   = bodyText.slice(dto.header.length);
            dto.name   = bodyNode.id.name;
        }
        
        console.log(dto);
        return {
            dto: dto,
            requestedNames: requestedNames
        };
    }

    function validate( code ){
        var lint = { result: true };

        // first jshint check: validate the syntax
        lint = lintCode(code,{latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true });

        if( !lint.result ){
            console.log(lint.errors);
        }

        // get the dto of the function
        var parsed = parse(code);

        var apiFunctionsName = functionsService.allFunctionNames();
        var allNames = apiFunctionsName.concat(parsed.requestedNames);
        
        // first jshint check: validate the code with the functions definitions
        var codeWithDefs = 'var '+allNames.join(',')+';\n' + code;
        lint = lintCode(codeWithDefs,{latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true });

        if( !lint.result ){
            console.log(lint.errors);
        }


        // validate the main function description
            // validate name correspondance
            // validate parameters
                // each parameter in the description is in the header
                    // each parameter has the same position in the header
                // each parameter has a description != ''
                // each parameter has an existent data type 
        // validate the requested function
            // no duplicates
            // name not busy
            // validate parameters
        // each function call is either a requested function or an api function

        return true;
    }

    function lintCode(code,options){
        var lintResult;
        try {
            lintResult = JSHINT(code, options);
        } catch (e) {
            console.log(e);
        }

        return {
            result: lintResult,
            errors: lintResult ? [] : checkForErrors(JSHINT.errors)
        };
    }

    function parseFunctionDoc( text ){
        var parsed = doctrine.parse(text,{unwrap:true});
        var tags = parsed.tags;

        var functObj = {
            name: '',
            description: '',
            parameters: [],
            returnType: ''
        };

        functObj.description = parsed.description;

        tags.forEach(function(tag){
            switch (tag.title){
                case 'function': 
                case 'name':

                    functObj.name = tag.name
                    break;

                case 'param':
                    if ( tag.type.type === 'NameExpression' ) {
                        functObj.parameters.push({
                            name: tag.name,
                            type: tag.type.name,
                            description: tag.description
                        });
                    }
                    else if ( tag.type.type === 'TypeApplication' ) {
                        functObj.parameters.push({
                            name: tag.name,
                            type: tag.type.applications[0].name + '[]',
                            description: tag.description
                        });
                    }
                    break;

                case 'return':
                    functObj.returnType = tag.type.name
                    break;

                default:
                    break;
            }
        });

        return functObj;
    }

    function validateFunctionDoc(){

    }



    function getCalleeNames(ast) {
        var calleeNames = [];
        estraverse.traverse(ast, {
            enter: function (node, parent) {
                if (node.type == 'CallExpression' && calleeNames.indexOf(node.callee.name) == -1)
                    calleeNames.push(node.callee.name);
            }
        });
        return calleeNames;
     }




}]);