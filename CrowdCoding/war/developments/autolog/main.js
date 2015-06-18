var LogInfo = require("crowdcode/log_info").LogInfo;

var $inspectBtn = $('#inspectBtn');
var $runBtn = $('#runBtn');
var $instrumentedCode = $('#instrumentedCode');

var fEditor = ace.edit('fCode');
fEditor.getSession().setMode("ace/mode/javascript");
fEditor.setTheme("ace/theme/twilight");
fEditor.getSession().setUseSoftTabs(false);

var tEditor = ace.edit('tCode');
tEditor.getSession().setMode("ace/mode/javascript");
tEditor.setTheme("ace/theme/twilight");

var logs = [];
var ast;
var variables = [];

$runBtn.on('click',function(){
    //formatCode(fEditor);
    run( fEditor.getValue(), tEditor.getValue() );
});

$inspectBtn.on('click',function(){
    var $this = $(this);
    
    if( !isInspectOn() )
        inspectOn();
    else 
        inspectOff();
});

function isInspectOn(){
    return fEditor.loggerTooltip !== undefined;
}

function inspectOn(){
    $inspectBtn.addClass('on');
    fEditor.logInfo = new LogInfo(fEditor);
    fEditor.logInfo.statements = logs;
    fEditor.on("change",inspectOff);
    fEditor.focus();
}
function inspectOff(){
    $inspectBtn.removeClass('on');
    fEditor.logInfo.destroy();
    delete fEditor.logInfo;
    fEditor.off('change',inspectOff);
}

function formatCode(editor){
    var syntax;
    var option = {
        comment: true,
        format: {
            indent: {
                style: '    '
            }
        }
    };
    syntax = esprima.parse( editor.getValue(), { raw: true, tokens: true, range: true, comment: true } );
    syntax = escodegen.attachComments(syntax, syntax.comments, syntax.tokens);
    var code = escodegen.generate( syntax, option );
    editor.setValue(code);
}

function run(fCode,tCode){


    Debugger.setFunction('loggingFunction',{ code: fCode });
    var code = Debugger.runTest(tCode);

    $instrumentedCode.html( code );   

    if( !isInspectOn() )
        inspectOn();

    fEditor.logInfo.logs = Debugger.logs.values['loggingFunction'];

    var calls = Debugger.logs.calls;
    for( var c = 0 ; c < calls.length ; c++ ){
        var call = calls[c];
        console.log(call.name,call.arguments,call.returnValue);
    }

}

var functions = {
    'seconda': {
        code : 'function seconda(a,b,c){\n\treturn a;\n}'
    }
};

Debugger.init({
    functions : functions,
    onTrace   : ['loggingFunction']
});
run( fEditor.getValue(), tEditor.getValue() );

