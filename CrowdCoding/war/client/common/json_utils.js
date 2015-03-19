

/** 
 safe json parse 
**/
function safeJsonParse(json){
    var obj = null;
    if( json == 'Infinity' )
        obj = Infinity;
    else if( json == 'undefined' )
        obj = undefined;
    else if( json == 'NaN' )
        obj = NaN;
    else if( json == 'null' )
        obj = null;
    else {
        try {
            obj = JSON.parse(json);
        } catch( e ){
            obj = '"'+json+'"';
        }
    }

    return obj;
}


/**
  search and highlight the json 
**/
function jsonSyntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                var cls = 'jsonNumber';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'jsonKey';
                    } else {
                        cls = 'jsonString';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'jsonBoolean';
                } else if (/null/.test(match)) {
                    cls = 'jsonNull';
                }
                return '<span class="' + cls + '">' + match + '</span>';
    });
    return highlighted;
}


/* 
  join the lines of text (splitted by \n) as a list of html <span class="class"> 
  tags preeceding the content with #identation spaces
*/
function joinLines(text,cssClass,identation){
    var lines = text.split('\n');
    var html = '';
    for( var li in lines ){
        html += '<span class="'+cssClass+'">';
        for( var i=1 ; i<=identation ; i++) html += ' ';
        html += jsonSyntaxHighlight(lines[li])+'</span>';
    }
    return html;
}
