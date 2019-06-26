// check if a functionName is already taken
angular
    .module('crowdCode')
    .factory('functionUtils', ['functionsService', 'AdtUtils', function functionUtils(functionsService, AdtUtils) {
        return {
            parse: parse,
            validate: validate
            // parseDescription    : parseDescription,
            // validateDescription : validateDescription,
        };

        function isInRange(where, range) {
            if (where.start.line > range.start.line && where.end.line < range.end.line)
                return true;
            return false;
        }

        function parse(text) {

            var dto = {
                description: '',
                returnType: '',
                parameters: [],
                header: '',
                name: '',
                code: '',
                callees: []
            };


            // configure esprima to parse comment blocks
            // and the ranges of all the block
            var esprimaConf = {
                loc: true,
                comment: true
            };

            // build the syntactic tree from the text
            var ast = esprima.parse(text, esprimaConf);
            var commentBlocks = ast.comments;
            var commentBlocksOutside = [];
            var requestedFunctions = [];
            var requestedDataTypes = [];
            var requestedNames = [];
            var calleeNames = [];
           if (ast.body && ast.body.length > 0 && ast.body[0].type === 'FunctionDeclaration') {
                // get the function body (function name(){ }) range
                var bodyNode = ast.body[0];
                var bodyRange = bodyNode.loc;
                var bodyText = text
                    .split('\n')
                    .slice(bodyRange.start.line - 1, bodyRange.end.line)
                    .join('\n');


                // filter out the comment blocks inside the body of the function
                var commentsOutside = commentBlocks.filter(function (block) {
                    return !isInRange(block.loc, bodyRange);
                });


                if (commentsOutside.length > 0) {
                    // the first comment block is the actual function description
                    // extend the dto object with the parsed description
                    angular.extend(dto, parseFunctionDoc(commentsOutside[0].value));

                    // the others comment blocks can be requestedFunctions or requestedDataTypes
                    for (var i = 1; i < commentsOutside.length; i++) {
                        var value = commentsOutside[i].value;

                        // if it's a function request block
                        if (value.search('@function') != -1) {

                            var parsed = parseFunctionDoc(value);
                            requestedNames.push(parsed.name);
                            requestedFunctions.push(parsed);
                        }
                        // if it's a data type request block
                        else if (value.search('@typedef') != -1) {
                            console.log('requested data type!')
                        }
                    }
                }


                // get the callee names and for those that
                // are not the requested functions, search
                // the relative Id
                calleeNames = getCalleeNames(ast);
                for (i = 0; i < calleeNames.length; i++) {
                    if (requestedNames.indexOf(calleeNames[i]) > -1) {
                        calleeNames.slice(i, 1);
                    }
                    else {
                        var functionId = functionsService.getIdByName(calleeNames[i]);
                        if (functionId != -1)
                            dto.callees.push({
                                id: functionId,
                                name: calleeNames[i]
                            });
                    }
                }

                // complete the dto data
                dto.header = bodyText.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*/g)[0];
                dto.code = bodyText.slice(dto.header.length);
                dto.name = bodyNode.id.name;
            }

            return {
                ast: ast,
                dto: dto,
                requestedFunctions: requestedFunctions,
                requestedNames: requestedNames,
                calleeNames: calleeNames
            };
        }

        function validate(code) {
            var MAX_NEW_STATEMENTS = 10;
            var data = {
                errors: [],
                statements: undefined
            };

            // first jshint check: validate the syntax and check that there is only a function declaration
            var lint = {result: true};

            lint = lintCode(code, {
                latedef: false,
                camelcase: true,
                undef: false,
                unused: false,
                boss: true,
                eqnull: true,
                laxbreak: true,
                laxcomma: true,
                smarttabs: true,
                shadow: true,
                jquery: true,
                worker: true,
                browser: true
            });

            if (!lint.result) {

                data.errors = data.errors.concat(lint.errors);
            }

            if (lint.data.functions.length == 0) {
                data.errors.push('No function block could be found. Make sure that there is a line that starts with "function"');
            }
            else if (lint.data.functions.length > 1) {
                data.errors.push('Only one function declaration is allowed! To add a function, use the autocompleter.');
            }
            else {

                // we've checked that there is only a function declaration,
                // let's set the value of the 'statements' for that function
                data.statements = lint.data.functions[0].metrics.statements;
            }



            // if the first linting produced errors,
            // return now before processing the ast
            if (data.errors.length > 0)
                return data;

            // get the dto of the function
            var parsed = parse(code);
            var ast = parsed.ast;

            //add function third party API names to be validated
            var thirdPartyAPINames = ['SaveObjectImplementation', 'FetchObjectImplementation', 'DeleteObjectImplementation', 'UpdateObjectImplementation','FetchAllObjectsImplementation'];
            // all defined functions for crowd
            var apiFunctionNames = functionsService.allFunctionNames();

            var allFunctionNames = apiFunctionNames.concat(parsed.requestedNames).concat(thirdPartyAPINames);

            // first jshint check: validate the code checking for undef use
            var codeWithDefs = 'var ' + allFunctionNames.join(',') + ';\n' + code;


            lint = lintCode(codeWithDefs, {
                latedef: false,
                camelcase: true,
                undef: true,
                unused: false,
                boss: true,
                eqnull: true,
                laxbreak: true,
                laxcomma: true,
                smarttabs: true,
                shadow: true,
                jquery: true,
                worker: true,
                browser: true
            });

            if (!lint.result) {
                data.errors = data.errors.concat(lint.errors);
                return data;
            }

            // validate the main function description
            var funAst = ast.body[0];
            var funDoc = parsed.dto;

            // validate the parsed dto
            data.errors = data.errors.concat(validateFunctionDoc(parsed.dto));

            // validate the parameters
            if (funAst.params.length !== funDoc.parameters.length) {
                data.errors.push('The number of the parameter in the description does not match the number of parameters in the function header');
            }
            else {

                var orderError = false;
                var paramHeaderNames = funAst.params.map(function (param) {
                    return param.name;
                });

                for (var i = 0; i < funDoc.parameters.length; i++) {

                    if (paramHeaderNames.indexOf(funDoc.parameters[i].name) == -1) {
                        data.errors.push('The parameter ' + funDoc.parameters[i].name + ' does not exist in the header of the function');
                    }

                    if (!orderError && funDoc.parameters[i].name != funAst.params[i].name) {
                        data.errors.push('The order of the parameters in the description does not match the order of the parameters in the function header');
                        orderError = true;
                    }
                }
            }

            // validate the requested functions
            parsed.requestedFunctions.map(function (requested) {
                if (apiFunctionNames.indexOf(requested.name) > -1) {
                    data.errors.push('The function name ' + requested.name + ' is already taken!');
                }
                else {
                    data.errors = data.errors.concat(validateFunctionDoc(requested));
                }
                if (parsed.calleeNames.indexOf(requested.name) == -1) {
                    data.errors.push('The requested function ' + requested.name + ' is never used. Are you sure it\'s still needed?');
                }
            });

            data.dto = parsed.dto;
            data.requestedFunctions = parsed.requestedFunctions;

            return data;
        }

        function lintCode(code, options) {
            var lintResult;
            try {
                lintResult = JSHINT(code, options);

            } catch (e) {
                console.log(e);
            }

            return {
                result: lintResult,
                errors: lintResult ? [] : checkForErrors(JSHINT.errors),
                data: JSHINT.data()
            };
        }

        function parseFunctionDoc(text) {
            var parsed = doctrine.parse(text, {unwrap: true});
            var tags = parsed.tags;

            var functObj = {
                name: '',
                description: '',
                parameters: [],
                returnType: ''
            };

            functObj.description = parsed.description;

            tags.forEach(function (tag) {
                switch (tag.title) {
                    case 'function':
                    case 'name':

                        functObj.name = tag.name;
                        break;

                    case 'param':
                        if (tag.type) {
                            if (tag.type.type === 'NameExpression') {
                                functObj.parameters.push({
                                    name: tag.name,
                                    type: tag.type.name,
                                    description: tag.description
                                });
                            }
                            else if (tag.type.type === 'TypeApplication') {
                                functObj.parameters.push({
                                    name: tag.name,
                                    type: tag.type.applications[0].name + '[]',
                                    description: tag.description
                                });
                            }
                        }
                        break;

                    case 'return':
                    case 'returns':
                        if (tag.type.name) {
                            functObj.returnType = tag.type.name;
                        }
                        else if (tag.type.type === 'TypeApplication') {
                            functObj.returnType = tag.type.applications[0].name + '[]';
                        }
                        break;

                    default:
                        break;
                }
            });

            return functObj;
        }

        function validateFunctionDoc(parsed, strict) {

            var errors = [];
            var paramTypes = [];
            var apiNames = [];

            if (parsed.name === '') {
                errors.push('Please, write a name for the function');
            }
            else if (!parsed.description || parsed.description.length === 0) {
                errors.push('Please, provide a description for the function ' + parsed.name);
            }
            else if (parsed.parameters.length === 0) {
                errors.push('Please, write at least one parameter for the function ' + parsed.name);
            }
            else if (parsed.returnType.length === 0) {
                errors.push('Please, provide a return type for the function ' + parsed.name);
            }
            else if (!AdtUtils.isValidName(parsed.returnType)) {
                errors.push('The return type ' + parsed.returnType + ' for the function ' + parsed.name + ' is not valid');
            }
            else {
                for (var i = 0; i < parsed.parameters.length; i++) {
                    var par = parsed.parameters[i];

                    if (!par.type) {
                        errors.push('Please, specify the type for the parameter ' + par.name + ' of the function ' + parsed.name);
                    }
                    else if (!AdtUtils.isValidName(par.type)) {
                        errors.push('The type of the parameter ' + par.name + ' of the function ' + parsed.name + ' is not valid');
                    }
                    else if (!par.description || par.description.length < 5) {
                        errors.push('Please, provide a valid description (min 5 chars) for the parameter ' + par.name + ' of the function ' + parsed.name);
                    }
                }
            }

            return errors;
        }


        function isValidName(name) {

            var regexp = /^[a-zA-Z0-9_]+$/;
            if (name.search(regexp) == -1) return false;
            return true;
        }


        function getCalleeNames(ast) {

            var calleeNames = [];
            estraverse.traverse(ast, {
                enter: function (node, parent) {
                    if (node.type == 'CallExpression' && calleeNames.indexOf(node.callee.name) == -1)
                        calleeNames.push(node.callee.name);
                }
            });
            //console.log('calleeNames',calleeNames);
            return calleeNames;
        }


    }]);