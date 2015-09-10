
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
        },
        enableTestAutocompleter: {
            set: function(val) {
                if (val) {
                   
                } else {
                    
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
                    + ' * @function ${2:functionName}\n'
                    + ' * @param {${3:parameterType}} ${4:parameterName} - ${5:parameterDescription}\n'
                    + ' * @return {${6:returnType}}\n'
                    + ' */\n'
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
            editor.functioncompleter.attach(editor);
        },
        bindKey: navigator.appVersion.indexOf("Mac")!=-1 ? "Alt-Space" : "Ctrl-Space"
    };

	exports.FunctionAutocompleter = FunctionAutocompleter;
});


ace.define('ace/ext/crowdcode/autocomplete/test',function(require, exports, module) {

   
    var TestAutocompleter = function() {
        
    };

    (function() {


    }).call(TestAutocompleter.prototype);
    
    TestAutocompleter.startCommand = {
        name: "startFunctionAutocompleter",
        exec: function(editor) {
            
        },
        bindKey: navigator.appVersion.indexOf("Mac")!=-1 ? "Alt-Space" : "Ctrl-Space"
    };

    exports.TestAutocompleter = TestAutocompleter;
});


ace.define("ace/ext/crowdcode/log_info",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/range","crowdcode/log_tooltip"], function(require, exports, module) {
"use strict";

var dom = require("ace/lib/dom");
var oop = require("ace/lib/oop");
var event = require("ace/lib/event");
var Range = require("ace/range").Range;
var LogTooltip = require("ace/ext/crowdcode/log_tooltip").LogTooltip;


function LogInfo (editor, logs, callbacks) {
    if (editor.logInfo)
        editor.logInfo.destroy();

    console.log('arrived');
    editor.logInfo = this;
    this.editor = editor;

    this.logs     = logs;
    this.currentLogs = [];
    this.tooltip     = new LogTooltip(editor,callbacks);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut  = this.onMouseOut.bind(this);
    this.onClick     = this.onClick.bind(this);

    this.attach();
}

(function(){


    this.destroy = function() {
        this.detach();
        delete this.editor.logInfo;
    };

    this.attach = function(){

        this.decorateGutter();

        var editor = this.editor;

        event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
        event.addListener(editor.renderer.scroller , "mouseout", this.onMouseOut);
        event.addListener(editor.renderer.scroller , "click", this.onClick);

        // event.addListener(editor,'change',this.destroy.bind(this));
    },

    this.detach = function(){
        this.undecorateGutter();

        this.tooltip.unlock();
        this.tooltip.hide();

        var editor = this.editor;
        event.removeListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
        event.removeListener(editor.renderer.content, "mouseout", this.onMouseOut);
        event.removeListener(editor.renderer.content, "click", this.onClick);

        editor.session.removeMarker(this.marker);
    }

    this.decorateGutter = function(){
        var self = this;  
        self.gutterDecorations = [];
        self.logs.map(function(logObj){
            if( self.gutterDecorations.indexOf(logObj.start.row) == -1 ){
                self.editor.session.addGutterDecoration(logObj.start.row,'ace_inspected_gutter');
                self.gutterDecorations.push(logObj.start.row);
            }
        });
    },

    this.undecorateGutter = function(){
        var self = this;  
        self.gutterDecorations.map(function(lineNumber){
            self.editor.session.removeGutterDecoration(lineNumber,'ace_inspected_gutter');
        });
        self.gutterDecorations = [];
    },


    this.onMouseMove = function(e) {
        var coords   = { x : e.clientX, y: e.clientY};
        var position = getEditorPosition(this.editor,coords);
        this.currentLogs = filterLogsByPosition(this.logs,position);

        if( this.currentLogs.length > 0 ){
            this.range = new Range(this.currentLogs[0].start.row, this.currentLogs[0].start.col, this.currentLogs[0].end.row, this.currentLogs[0].end.col);

            // highlight the first log range
            this.editor.session.removeMarker(this.marker);
            this.marker = this.editor.session.addMarker(this.range, "ace_inspected_marker", "text");

            if( ! this.tooltip.locked ) { 
                // set the tooltip logs
                this.tooltip.range = this.range;
                this.tooltip.setPosition( coords.x + 10, coords.y + 10);
                this.tooltip.setLogs( this.currentLogs.slice() );
                this.tooltip.show();
            }
                
        } else {
            // remove the marker
            this.editor.session.removeMarker(this.marker);

            if( ! this.tooltip.locked ) {
                this.tooltip.hide();
            }
        }
    };

    this.onClick = function(e){
        var coords   = { x : e.clientX, y: e.clientY};

        if( this.currentLogs.length > 0 ){
            this.tooltip.range = this.range;
            this.tooltip.setPosition( coords.x + 10, coords.y + 10);
            this.tooltip.setLogs( this.currentLogs.slice() );
            this.tooltip.lock();
            this.tooltip.show();
        } else {
            this.tooltip.unlock();
            this.tooltip.hide();
        }
    }

    this.onMouseOut = function(e) {
        // if (e && e.currentTarget.contains(e.relatedTarget))
        //     return;
        // this.tooltip.locked = false;
        // this.tooltip.hide();
        // this.editor.session.removeMarker(this.marker);
    };


    this.setPosition = function(x, y) {
        if (x + 10 + this.width > this.maxWidth)
            x = window.innerWidth - this.width - 10;
        if (y > window.innerHeight * 0.75 || y + 20 + this.height > this.maxHeight)
            y = y - this.height - 30;

        Tooltip.prototype.setPosition.call(this, x+10, y+10);
    };



    function getEditorPosition(editor,coords){
        var r = editor.renderer;
        var canvasPos = r.scroller.getBoundingClientRect();
        var rawRow = (coords.y + r.scrollTop  - canvasPos.top) / r.lineHeight;
        var row = Math.floor(rawRow);
        var col = Math.round((coords.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth) ;

        return { row: row, col: col };
    }

    function filterLogsByPosition(logs,pos){
        // get the logs that wrap the position
        var filtered = logs.filter(function( log ){
            return isBetweenPositions(pos,log.start,log.end);
        });

        // sort the results by dimension of range and time
        filtered.sort( compareLogObjects );

        // if more than one log found, filter the results
        // selecting only the ones with the same range as 
        // the first 
        if( filtered.length > 1 ){
            var firstLogRange = new Range(filtered[0].start.row,filtered[0].start.col,filtered[0].end.row,filtered[0].end.col);
            return filtered.filter(function(a){
                return firstLogRange.isEqual( new Range(a.start.row,a.start.col,a.end.row,a.end.col) );
            });
        } 
        else {
            return filtered;
        } 
    }

    function compareLogObjects(a,b){
        var rangeA = new Range(a.start.row,a.start.col,a.end.row,a.end.col);
        var rangeB = new Range(b.start.row,b.start.col,b.end.row,b.end.col);
        
        // if A contains B, B is before A
        if( rangeA.containsRange( rangeB ) )
            // if A is antecedent to B, A is before B
            if( a.time > b.time )
                return 1;
            // else A is after B
            else 
                return -1;

        // else A is before B
        return -1;
    }

    function isBetweenPositions(pos,start,end){
        var range = new Range(start.row,start.col,end.row,end.col-1);
        var res = false;
        if( range.contains(pos.row,pos.col) )
            res = true;

        return res;
    }

}).call(LogInfo.prototype);

exports.LogInfo = LogInfo;

});

ace.define("ace/ext/crowdcode/log_tooltip",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/range","ace/tooltip"], function(require, exports, module) {
"use strict";

var dom = require("ace/lib/dom");
var oop = require("ace/lib/oop");
var event = require("ace/lib/event");
var Range = require("ace/range").Range;
var Tooltip = require("ace/tooltip").Tooltip;

function LogTooltip (editor,callbacks) {

    Tooltip.call(this,editor.container);
    this.callbacks = callbacks || {};
    this.editor = editor;
    this.logs   = [];
    this.range  = false;
    this.marker = null;
    this.locked = false;
}

oop.inherits(LogTooltip, Tooltip);

(function(){


    this.setLogs = function(logs){
        this.currIt = 0;
        this.totIt  = logs.length;
        this.logs = logs;
    }

    this.buildTemplate = function(){
        var log = this.logs[0];
        var tpl = '';

        if( !this.locked ) {
            tpl = '<div class="value">'+JSON.stringify(log.value,null,'  ') + '</div>';
            tpl += (this.logs.length > 1 ? '<div>(<i>'+(this.logs.length)+' times</i>)</div>' : '');
        }
        else {
            tpl = '<strong>'+this.editor.session.getTextRange(this.range)+'</strong>' + tpl ; 


            tpl += '<div class="value">'+JSON.stringify(log.value,null,'  ') + '</div>';
            if( log.callee ){
                var inputsTpl = '';
                for( var key in log.inputs )
                    inputsTpl += '<div>'+JSON.stringify(log.inputs[key],null,'  ')+'</div>';
                 
                // tpl += '<div class="inputs">'+inputsTpl+'</div>';
                tpl += '<a href="#" class="stub-btn">stub this function call</a>';
            }

            if( this.logs.length > 1 ){
                tpl += '<div class="loop-navigation">' 
                     +      '<button class="prev-btn">prev</button>'
                     +      '<span><span class="iteration">'+(this.currIt+1)+'</span>/'+this.totIt+'</span>'
                     +      '<button class="next-btn">next</button>'
                     + '</div>';
            }

            tpl += '<span class="close-btn">X</span>';
        }
        this.setHtml( tpl );  
        this.width = this.width + 20;      
    }

    this.show = function(){
        var self = this;


        self.editor.session.removeMarker(self.marker);

        self.buildTemplate();

        if( self.locked ){

            var $inputsDiv = self.$element.getElementsByClassName('inputs')[0];
            var $valueDiv = self.$element.getElementsByClassName('value')[0];
            var $closeBtn = self.$element.getElementsByClassName('close-btn')[0];
            var $stubBtn  = self.$element.getElementsByClassName('stub-btn')[0];
            var $iterationDiv, $nextBtn, $prevBtn;
            
            $closeBtn.addEventListener('click', unlockAndHide);


            if( $stubBtn ){
                $stubBtn.addEventListener('click',editStub);
            }

            if( self.logs.length > 1 ){
                $iterationDiv = self.$element.getElementsByClassName('iteration')[0];
                $nextBtn  = self.$element.getElementsByClassName('next-btn')[0];
                $prevBtn  = self.$element.getElementsByClassName('prev-btn')[0];
                $nextBtn.addEventListener('click', next);
                $prevBtn.addEventListener('click', prev);                
            }

            self.marker = self.editor.session.addMarker(self.range, "ace_inspected", "text");

            function next(){
                self.currIt = self.currIt < self.totIt-1 ? self.currIt + 1 : 0;
                updateTemplate();
            }

            function prev(){
                self.currIt = self.currIt > 0 ? self.currIt-1 : (self.totIt-1);
                updateTemplate();
            }

            function updateTemplate(){
                $valueDiv.innerHTML     = JSON.stringify(self.logs[self.currIt].value,null,'  ');
                $iterationDiv.innerHTML = self.currIt + 1;
            }

            function unlockAndHide(){

                if( $stubBtn )
                    $stubBtn.removeEventListener('click',editStub);

                if( self.logs.length > 1 ){
                    $nextBtn.removeEventListener('click', next);
                    $prevBtn.removeEventListener('click', prev);
                }

                $closeBtn.removeEventListener('click', unlockAndHide);
                
                self.editor.session.removeMarker(self.marker);
                self.unlock();
                self.hide();
            }

            function editStub(){
                if( self.callbacks.hasOwnProperty('editStub') ){
                    var log = self.logs[self.currIt];
                    console.log(log);
                    self.callbacks.editStub.call(null,log.callee,log.inputsKey);
                    unlockAndHide();
                }
            }
        }
        
        Tooltip.prototype.show.call(self);
    };

    this.lock = function(){
        this.locked = true;
    };

    this.unlock = function(){
        this.locked = false;
    }

    this.hide = function(){
        this.editor.session.removeMarker(this.marker);
        Tooltip.prototype.hide.call(this);
    }

}).call(LogTooltip.prototype);

exports.LogTooltip = LogTooltip;

});

