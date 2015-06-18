function Debugger(){}

Debugger.init = function(data){
    Debugger.functions = {};
    Debugger.onTrace = data.onTrace ? data.onTrace : [];
    Debugger.setFunctions( data.functions ? data.functions : {} );
    Debugger.resetLogs();
};


Debugger.resetLogs = function(){
    Debugger.logs = {
        values: {},
        calls: []
    };
};

Debugger.runTest = function(testCode) {
    Debugger.resetLogs();
    var functCode = '';
    for( var functionName in Debugger.functions ){
        functCode += Debugger.functions[functionName].compiled + '\n';
    }

    var evalCode = functCode + '\n' 
                 + testCode;


    try {
        eval( evalCode );
    } catch( e ){
        console.log(e);
    }
    return evalCode;
};


Debugger.setFunctions = function(functions){
    // parse all the functions 
    for( var functionName in functions ){
        Debugger.setFunction(functionName, functions[functionName]);
    }
}

Debugger.setFunction = function(functName, functObj) {
    Debugger.functions[functName] = functObj;

    // create the abstract syntax tree
    var bodyNode = esprima.parse( functObj.code, {loc:true} ).body[0];

    // if it's not a function declaration throw exception
    if( bodyNode.type !== 'FunctionDeclaration' ) 
        throw new Error('This is not a function declaration!');

    // if the function has to be traced
    // keep the body in the array of the 
    if( Debugger.onTrace.indexOf( functName ) > -1 ) {
        bodyNode = Debugger.instrumentFunction( bodyNode, functName );
    }

    // if not, replace the function body with a mocked version
    // that returns the stubbed value if found or executes the 
    // function in the real implementation 
    functObj.compiled = Debugger.mockFunction( bodyNode );
}

Debugger.instrumentFunction = function(fNode){
    // initialize scope
    var scope  = new Scope(fNode.id.name);

    // insert the parameters in the scope
    fNode.params.map(function(param){
        scope.variables.push( param.name );
    });

    estraverse.replace( fNode.body, {
        enter: function(node,parent){

            // console.log(node.type,escodegen.generate(node));
            if (node.type === 'UpdateExpression') {
                node = Debugger.instrumentTreeNode(node,scope);
                this.skip();
            }
            else if( node.type === 'ObjectExpression' ){
                node = Debugger.instrumentTreeNode(node,scope);
                this.skip();
            }
            else if( parent.type === 'AssignmentExpression' && node === parent.left ){
                this.skip();
            }
            else if( ['WhileStatement','ForStatement'].indexOf( node.type ) > -1 ){
                scope.loop ++ ;
            }

            return node;
        },
        leave: function(node,parent){

            // in case of a variable declaration we should add 
            // the variable name to the current scope
            if( node.type === 'VariableDeclarator' ){
                scope.declare( node.id.name );
            } 
            
            if( node.type === 'BinaryExpression'){
                node = Debugger.instrumentTreeNode(node,scope);
            }
            else if( node.type === 'Identifier' && scope.variables.indexOf(node.name) > -1 ){
                if( parent.type !== 'AssignmentExpression' ) {
                    node = Debugger.instrumentTreeNode(node,scope);
                }
                else if ( node === parent.right ) {
                    node = Debugger.instrumentTreeNode(node,scope); 
                }
            } 
            else if( node.type === 'Identifier' && parent.type === 'AssignmentExpression' && scope.isDeclared(node.name) > -1 ){
                node = Debugger.instrumentTreeNode(node,scope);
            } 
            else if( node.type === 'CallExpression' && !( node.callee.type === 'MemberExpression' && node.callee.object.name === 'Debugger' ) ) {
                node = Debugger.instrumentTreeNode(node,scope);
            }
            else if( ['WhileStatement','ForStatement'].indexOf( node.type ) > -1 ){
                scope.loop -- ;
            }

            return node;
        }
    });
    return fNode;
};

Debugger.mockFunction = function(fNode){
    var name = fNode.id.name;
    
    var mockBody = 'function '+name+'('
                 + fNode.params.map(function(param){ return param.name; })
                   .join(',')
                 + '){\n'
                 + '  Debugger.logCall("'+name+'",arguments,5);\n'
                 + '  return '+name+'Implementation.apply(null,arguments);\n'
                 + '}\n';

    var callBody = 'function '+name+'Implementation('
                 + fNode.params.map(function(param){ return param.name; })
                   .join(',')
                 + ')'
                 + escodegen.generate(fNode.body);

    return mockBody + callBody ;
};


Debugger.instrumentTreeNode = function(node,scope){
    var innerCode = escodegen.generate(node,{indent:false});
    var outerCode = 'Debugger.logValue('+innerCode+',\''+node.type+'\','+JSON.stringify(node.loc,null,'')+','+JSON.stringify(scope)+');';
    var newNode = esprima.parse(outerCode);
    return newNode.body[0].expression;
};

Debugger.logValue = function(value,type,pos,scope,code){
    var logObject = {
        value: JSON.stringify(value,null,'  '),
        type : type,
        start: { row: pos.start.line-1, col: pos.start.column },
        end: { row: pos.end.line-1, col: pos.end.column },
        loop: scope.loop,
        code : code
    };

    if( !Debugger.logs.values[scope.context] )
        Debugger.logs.values[scope.context] = [];

    Debugger.logs.values[scope.context].push( logObject );
    return value;
};

Debugger.logCall = function(name,arguments,returnValue){
    var logObject = {
        name: name,
        arguments: arguments,
        returnValue : returnValue,
        time : Date.now()
    };
    Debugger.logs.calls.push( logObject );
};

Debugger.mockBody = function(){
    var args        = Array.prototype.slice.call(arguments);
    var stubFor     = Debugger.getStubOutput( '%functionNameStr%', args );
    var returnValue = null;
    var argsCopy    = [];
    for( var a in args )
        argsCopy[a] = JSON.parse(JSON.stringify(args[a]));
    
    if( stubFor != -1 ){
        returnValue = stubFor.output;
    } else {
        try {
            returnValue = '%functionMockName%'.apply( null, argsCopy );
        } catch(e) {
            Debugger.log(-1,'There was an exception in the callee \'' + '%functionNameStr%' + '\': '+e.message);
            Debugger.log(-1,"Use the CALLEE STUBS panel to stub this function.");
        }
    }

    if( calleeNames.search( '%functionNameStr%' ) > -1 ){
        Debugger.logCall( '%functionNameStr%', args, returnValue ) ;
    }

    return returnValue;
}

function Scope(context,parent){
    this.context   = context;
    this.variables = [];
    this.parent    = parent || null;
    this.loop      = 0;
}

Scope.prototype = {
    isDeclared : function(varName){
        var scope = this;
        while( scope !== null ){
            if( scope.variables.indexOf(varName) > -1 )
                return true;
            scope = scope.parent;
        }
        return false;
    },
    declare: function(varName){
        this.variables.push(varName);
    }
};