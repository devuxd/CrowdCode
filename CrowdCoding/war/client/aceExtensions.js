
ace.define('ace/ext/crowdcode',function(require, exports, module) {

    var FunctionAutocompleter = require('ace/ext/crowdcode/autocomplete/function').FunctionAutocompleter;

    // extend editor
    var Editor   = require("../editor").Editor;
    require("../config").defineOptions(Editor.prototype, "editor", {
        enableFunctionAutocompleter: {
            set: function(val) {
                if (val) {
                    this.functioncompleter = new FunctionAutocompleter();
                    this.commands.addCommand(FunctionAutocompleter.startCommand);
                } else {
                    this.commands.removeCommand(FunctionAutocompleter.startCommand);
                }
            },
            value: true
        }
    });

    (function() {
        

    }).call(Editor.prototype);

});


ace.define('ace/ext/crowdcode/autocomplete/function',function(require, exports, module) {

	var HashHandler    = require("ace/keyboard/hash_handler").HashHandler;
	var AcePopup       = require('ace/autocomplete/popup').AcePopup;
	var util           = require("ace/autocomplete/util");
	var Range          = require("ace/range").Range;
	var snippetManager = require("ace/snippets").snippetManager;
	var lang           = require("ace/lib/lang");
	var dom            = require("ace/lib/dom");

	var FunctionAutocompleter = function() {
		this.filtered = [];

    	this.changeListener = this.changeListener.bind(this);

		this.keyboardHandler = new HashHandler();
    	this.keyboardHandler.bindKeys(this.commands);
	};

	(function() {

	this.$init = function(){
		this.popup = new AcePopup(document.body || document.documentElement);
		this.popup.renderer.setStyle('ace_crowdcode_function_autocomplete');
		this.popup.on("click", function(e) {
			this.insertSelected();
			e.stop();
	    }.bind(this));

	    this.updateList();
	};

	this.openPopup = function(){
		
		// if popup never initialized, do the $init routine
		if( !this.popup )
			this.$init();

		var renderer = this.editor.renderer;
		var lineHeight = renderer.layerConfig.lineHeight;
        var pos = renderer.$cursorLayer.getPixelPosition(this.base, true);
        var rect = this.editor.container.getBoundingClientRect();

        // set the theme and style
        this.popup.setTheme(this.editor.getTheme());
        this.popup.setFontSize(this.editor.getFontSize());

		// calculate and set the position

        pos.left -= this.popup.getTextLeftOffset();
        pos.top  += rect.top - renderer.layerConfig.offset;
        pos.left += rect.left - this.editor.renderer.scrollLeft;
        pos.left += renderer.$gutterLayer.gutterWidth;


		// set popup data
		this.popup.setData(this.filtered);

        this.popup.show(pos, lineHeight);

        this.goTo('start');
	};

	this.goTo = function(where) {
        var row = this.popup.getRow();
        var max = this.popup.session.getLength() - 1;

        switch(where) {
            case "up": row = row <= 0 ? max : row - 1; break;
            case "down": row = row >= max ? -1 : row + 1; break;
            case "start": row = 0; break;
            case "end": row = max; break;
        }

        this.hideDescription();
        this.popup.setRow(row);    
        this.showDescription(row);
    };

    // attach the extension to the ace editor
	this.attach = function(editor){

 		this.editor = editor;

		if( !this.functions ) 
			this.functions = [];

        this.editor.on("changeSelection", this.changeListener);
        this.editor.on('destroy', function(_editor){
        	_editor.functioncompleter.detach();
        });

        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);

        this.updateList();
        this.openPopup();
    };

    // detach  the extension from the ace editor
    this.detach = function(){
        this.editor.off("changeSelection", this.changeListener);


    	this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);


    	if (this.popup && this.popup.isOpen) {
            this.popup.hide();
            this.hideDescription();
        }
    };

    this.changeListener = function(){
    	this.updateList();
    	this.openPopup();
    };


    this.updateList = function(){


    	var session = this.editor.getSession();
        var pos     = this.editor.getCursorPosition();
        var line    = session.getLine(pos.row);
        var prefix  = util.retrievePrecedingIdentifier(line, pos.column);

        if( prefix.length > 0){
	        this.filtered = this.functions.filter(function(item){
	        	if( item.name.search(prefix) > -1 ) 
	        		return true;
	        	return false;
	        });
        } else {
	   		this.filtered = this.functions.slice();
	   	}

	   	this.filtered.push({
	   		name    : 'add new function',
	   		meta    : 'command',
        	className: 'functions_command',
	   		snippet : '\n'
                    + '/**\n'
                    + ' * ${1:description of the function}\n'
                    + ' * @param {${2:parameterType}} ${3:parameter name} - ${4:parameter description}\n'
                    + ' * @returns {${4:returnType}}\n'
                    + ' */\n'
                    + 'function ${5:functionName}(${6:argumentsList}){}\n'
	   	});

    };

    this.insertSelected = function(){

	    var data = this.filtered[this.popup.getRow()];

	    if( !data || !data.snippet )
	    	return;

	    if( data.meta == 'command' ){
	    	this.editor.session.doc.insert({ row: this.editor.session.doc.getLength(), col: 3},'\n');
	    	this.editor.gotoLine(this.editor.session.doc.getLength());
	    }

	    this.editor.insertSnippet( data.snippet );

    };

    this.showDescription = function(row) {

        if (!this.descriptionNode) {
            this.descriptionNode = document.createElement("div");
            this.descriptionNode.className = "ace_tooltip ace_doc-tooltip";
            this.descriptionNode.style.margin = 0;
            this.descriptionNode.style.pointerEvents = "auto";
            this.descriptionNode.tabIndex = -1;
        }
        
        var descNode = this.descriptionNode;
        var item     = this.filtered[row];

        if ( !item || !item.description || item.description.length === 0) 
        	return;

        descNode.innerHTML = this.filtered[row].description;
       
        if (!descNode.parentNode)
            document.body.appendChild(descNode);    

        var popup = this.popup;
        var rect = popup.container.getBoundingClientRect();

        descNode.style.top = popup.container.style.top;
        descNode.style.bottom = popup.container.style.bottom;
        
        if (window.innerWidth - rect.right < 320) {
            descNode.style.right = window.innerWidth - rect.left + "px";
            descNode.style.left = "";
        } else {
            descNode.style.left = (rect.right + 1) + "px";
            descNode.style.right = "";
        }
        descNode.style.display = "block";
    };
    
    this.hideDescription = function() {
        if (!this.descriptionNode) return;
        var el = this.descriptionNode;
        if (!this.editor.isFocused() && document.activeElement == el)
            this.editor.focus();
        this.descriptionNode = null;
        if (el.parentNode) 
            el.parentNode.removeChild(el);
    };


    this.commands = {
        "Up"                : function(editor) { editor.functioncompleter.goTo("up"); },
        "Down"              : function(editor) { editor.functioncompleter.goTo("down"); },

        "Esc"               : function(editor) { editor.functioncompleter.detach(); },
        "Space"             : function(editor) { editor.functioncompleter.detach(); editor.insert(" ");},
        "Return"            : function(editor) { editor.functioncompleter.insertSelected(); editor.functioncompleter.detach(); },
    };

    

	}).call(FunctionAutocompleter.prototype);
    
    FunctionAutocompleter.startCommand = {
        name: "startFunctionAutocompleter",
        exec: function(editor) {
            console.log(editor);
            editor.functioncompleter.attach(editor);
        },
        bindKey: navigator.appVersion.indexOf("Mac")!=-1 ? "Alt-Space" : "Ctrl-Space"
    };

	exports.FunctionAutocompleter = FunctionAutocompleter;
});



