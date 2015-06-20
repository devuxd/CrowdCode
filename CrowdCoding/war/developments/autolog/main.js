var LogInfo = require("crowdcode/log_info").LogInfo;
var $stubDiv = $('#stub');
var $inspectBtn = $('#inspectBtn');
var $runBtn = $('#runBtn');
var $closeStubBtn = $('#closeStubBtn');

var $fEditor = $('#fCode')
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
    // formatCode(fEditor);
    run( fEditor.getValue(), tEditor.getValue() );
});

$closeStubBtn.on('click',function(){
    $stubDiv.removeClass('show');
})

$inspectBtn.on('click',function(){
    var $this = $(this);
    
    if( !isInspectOn() )
        inspectOn();
    else 
        inspectOff();
});

function isInspectOn(){
    return fEditor.logInfo !== undefined;
}

function inspectOn(){
    fEditor.logInfo = new LogInfo(fEditor,{
        'editStub' : function(functionName,inputs){ 
            var stub = Debugger.getStub(functionName,inputs);

            var $stubForm = $stubDiv.find('.form')
            $stubForm.html('');
            for( var key in inputs)
                $stubForm.append('<label>input'+key+'</label><pre>'+JSON.stringify(inputs[key])+'</pre>');

            $stubForm.append('<label>output</label><textarea>'+JSON.stringify(stub.output)+'</textarea>');
            $stubDiv.addClass('show');
        }
    });
    fEditor.logInfo.logs = Debugger.logs.values['loggingFunction'];
    fEditor.setOption('readOnly',true);
    $inspectBtn.addClass('on');


}
function inspectOff(){
    fEditor.logInfo.destroy();
    delete fEditor.logInfo;
    fEditor.setOption('readOnly',false);
    $inspectBtn.removeClass('on');


}

function formatCode(editor){
    var syntax;
    var option = {
        comment: true,
        format: {
            indent: {
                style: '    '
            },
            compact:false
        },
    };
    syntax = esprima.parse( editor.getValue(), { raw: true, tokens: true, range: true, comment: true } );
    syntax = escodegen.attachComments(syntax, syntax.comments, syntax.tokens);
    var code = escodegen.generate( syntax, option );
    editor.setValue(code);
    editor.selection.clearSelection();
}

function run(fCode,tCode){


    Debugger.setFunction('loggingFunction',{ code: fCode });
    var code = Debugger.runTest(tCode);

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
        code  : 'function seconda(a,b,c){\n\treturn { a: a, b: b };\n}',
        stubs : {}
    }
};

Debugger.init({
    functions : functions,
    onTrace   : ['loggingFunction']
});
run( fEditor.getValue(), tEditor.getValue() );

