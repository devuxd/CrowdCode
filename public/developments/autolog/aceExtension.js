define("crowdcode/log_info",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/range","crowdcode/log_tooltip"], function(require, exports, module) {
"use strict";

var dom = require("ace/lib/dom");
var oop = require("ace/lib/oop");
var event = require("ace/lib/event");
var Range = require("ace/range").Range;
var LogTooltip = require("crowdcode/log_tooltip").LogTooltip;


function LogInfo (editor, callbacks) {
    if (editor.logInfo)
        return;

    editor.logInfo = this;
    this.editor = editor;

    this.logs     = [];
    this.currentLogs = [];
    this.tooltip     = new LogTooltip(editor,callbacks);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut  = this.onMouseOut.bind(this);
    this.onClick     = this.onClick.bind(this);

    event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
    event.addListener(editor.renderer.scroller , "mouseout", this.onMouseOut);
    event.addListener(editor.renderer.scroller , "click", this.onClick);
}

(function(){

    this.onMouseMove = function(e) {
        var coords   = { x : e.clientX, y: e.clientY};
        var position = getEditorPosition(this.editor,coords);
        this.currentLogs = filterLogsByPosition(this.logs,position);

        if( this.currentLogs.length > 0 ){
            this.range = new Range(this.currentLogs[0].start.row, this.currentLogs[0].start.col, this.currentLogs[0].end.row, this.currentLogs[0].end.col);

            // highlight the first log range
            this.editor.session.removeMarker(this.marker);
            this.marker = this.editor.session.addMarker(this.range, "ace_inspected", "text");

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
        console.log('out');
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

    this.destroy = function() {
        this.onMouseOut();


        event.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
        event.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
        event.removeListener(this.editor.renderer.content, "click", this.onClick);

        this.tooltip.hide();
        this.editor.session.removeMarker(this.marker);
        
        delete this.editor.logInfo;
    };


    function getEditorPosition(editor,coords){
        var r = editor.renderer;
        var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
        var offset = (coords.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
        var row = Math.floor((coords.y + r.scrollTop - canvasPos.top) / r.lineHeight);
        var col = Math.round(offset) ;
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

define("crowdcode/log_tooltip",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/range","ace/tooltip"], function(require, exports, module) {
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
                    self.callbacks.editStub.call(null,log.callee,log.inputs);
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