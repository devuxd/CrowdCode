define("crowdcode/log_info",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/range","ace/tooltip"], function(require, exports, module) {
"use strict";

var dom = require("ace/lib/dom");
var oop = require("ace/lib/oop");
var event = require("ace/lib/event");
var Range = require("ace/range").Range;
var Tooltip = require("ace/tooltip").Tooltip;

var nextLoopIterationCmd = {
    name: "nextLoopIteration",
    exec: function(editor) {
        editor.logInfo.navigateLoopIteration('Left');
    },
    bindKey: "Left"
};

var prevLoopIterationCmd = {
    name: "prevLoopIteration",
    exec: function(editor) {
        editor.logInfo.navigateLoopIteration('Right');
    },
    bindKey: "Right"
};

function LogInfo (editor) {
    if (editor.logInfo)
        return;

    editor.logInfo = this;
    this.editor = editor;

    this.logs     = [];
    this.currentLogs = [];
    this.tooltip  = new Tooltip(editor.container);
    this.tooltip.marker = null;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut  = this.onMouseOut.bind(this);
    this.onClick     = this.onClick.bind(this);

    event.addListener(editor.renderer.scroller, "mousemove", this.onMouseMove);
    event.addListener(editor.renderer.content , "mouseout", this.onMouseOut);
    event.addListener(editor.renderer.content , "click", this.onClick);
    
    // this.showTooltip = this.showTooltip.bind(this);
    // this.editor.commands.addCommand(nextLoopIterationCmd);
    // this.editor.commands.addCommand(prevLoopIterationCmd);
}

// oop.inherits(LogInfo, Tooltip);

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
                this.editor.session.removeMarker(this.tooltip.marker);
                this.tooltip.logs = this.currentLogs.slice();
                var firstLog = this.tooltip.logs[0];
                this.tooltip.setHtml( 
                    '<div>'+firstLog.value + '</div>' +
                    '<div><strong>'+firstLog.type+'</strong></div>'
                );
                this.tooltip.show(null, coords.x + 10, coords.y + 10);
            }
                
        } else {
            // remove the marker
            this.editor.session.removeMarker(this.marker);

            if( ! this.tooltip.locked ) {
                // hide the tooltip
                this.tooltip.hide();
            }
        }
    };

    this.onClick = function(e){
        var coords   = { x : e.clientX, y: e.clientY};

        if( this.currentLogs.length > 0 ){
            this.tooltip.logs = this.currentLogs.slice();
            var firstLog = this.tooltip.logs[0];
            this.tooltip.setHtml( 
                '<div>'+firstLog.value + '</div>' +
                '<div><strong>'+firstLog.type+'</strong></div>' + 
                '<div><button class="closeTooltip">X</button></div>'
            );
            this.tooltip.show(null, coords.x + 10, coords.y + 10);
            this.tooltip.locked = true;
            this.editor.session.removeMarker(this.tooltip.marker);
            this.tooltip.marker = this.editor.session.addMarker(this.range, "ace_inspected", "text");

            var self = this;
            var btn = this.tooltip.$element.getElementsByClassName('closeTooltip')[0];
            btn.addEventListener('click', function(e){
                self.tooltip.hide();
                self.tooltip.locked = false;
                self.editor.session.removeMarker(self.tooltip.marker);
            });
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



    this.navigateLoopIteration = function(direction) {
        if( direction === 'Left' )
            this.loopIndex = this.loopIndex > 0 ? this.loopIndex-1 : (this.filtered.length-1);
        else if( direction === 'Right' )
            this.loopIndex = this.loopIndex < this.filtered.length - 1 ? (this.loopIndex+1): 0;
  
        this.updateContent();
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
        

        this.editor.commands.removeCommand(nextLoopIterationCmd);
        this.editor.commands.removeCommand(prevLoopIterationCmd);

        delete this.editor.logInfo;
    };


    function getEditorPosition(editor,coords){
        var r = editor.renderer;
        var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
        var offset = (coords.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
        var row = Math.floor((coords.y + r.scrollTop - canvasPos.top) / r.lineHeight);
        var col = Math.round(offset);
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
        
        // A contains B
        if( rangeA.containsRange( rangeB ) )
            // A before B
            if( a.time < b.time )
                return 1;
            // A after B
            else 
                return -1;

        // A doesn't contain B
        return -1;
    }

    function isBetweenPositions(pos,start,end){
        var range = new Range(start.row,start.col,end.row,end.col);

        if( range.contains(pos.row,pos.col) )
            return true;
        return false;
    }

}).call(LogInfo.prototype);

exports.LogInfo = LogInfo;

});