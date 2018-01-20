
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


// create the AngularJS app, load modules and start

// create CrowdCodeWorker App and load modules
angular
  .module('crowdCode', [
    'templates-main',
    'firebase',
    'ngAnimate',
    'ngMessages',
    'ngSanitize',
    'ngClipboard',
    'ngTagsInput',
    'mgcrea.ngStrap',
    'ui.ace',
    'ui.layout',
    'luegg.directives',
    'toaster',
    'yaru22.angular-timeago',
    'angularytics',
  ])
  .service('Auth', ['$firebaseAuth',
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ])
  .service('CurrentUserID', function($http, $q) {
    var deferred = $q.defer();
    $http.get('/api/v1/currentWorkerId').then(function(payload) {
      q.resolve(payload.data);
    }, function(err) {
      q.reject(err);
    });
    return deferred.promise;
  })
  .factory('httpRequestInterceptor', function($q, Auth) {
    return {
      request: function(config) {
        if (sessionStorage.getItem('accessToken')) {
          //console.log("token[" + window.localStorage.getItem('accessToken') + "], config.headers: ", config.headers);
          config.headers.authorization = 'Bearer ' + sessionStorage.getItem('accessToken');
        }
        return config || $q.when(config);
      },
      responseError: function(rejection) {

        console.log("Found responseError: ", rejection);
        if (rejection.status == 401) {

          console.log("Access denied (error 401), please login again");
          //$location.nextAfterLogin = $location.path();
          //window.location.href = '/login';
        }
        return $q.reject(rejection);
      }
    };
  })
  .config(function($dropdownProvider, ngClipProvider, AngularyticsProvider, $httpProvider) {
    var config = {
      apiKey: "AIzaSyCmhzDIbe7pp8dl0gveS2TtOH4n8mvMzsU",
      authDomain: "crowdcode2.firebaseapp.com",
      databaseURL: "https://crowdcode2.firebaseio.com",
      projectId: "crowdcode2",
      storageBucket: "crowdcode2.appspot.com",
      messagingSenderId: "382318704982"
    };
    firebase.initializeApp(config);

    //$httpProvider.interceptors.push('httpRequestInterceptor');

    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);

    ngClipProvider.setPath("/include/zeroclipboard-2.2.0/dist/ZeroClipboard.swf");

    angular.extend($dropdownProvider.defaults, {
      html: true
    });

  })
  .constant('workerId', workerId)
  .constant('projectId', projectId)
  .constant('firebaseUrl', 'https://crowdcode2.firebaseio.com/Projects/' + projectId)
  .constant('logoutUrl', logoutURL)
  .run(function($rootScope, $interval, $modal, $firebaseArray, firebaseUrl, logoutUrl, userService, projectService, functionsService, AdtService,
    avatarFactory, questionsService, notificationsService, newsfeedService, Angularytics, testsService) {

    // current session variables
    $rootScope.projectId = projectId;
    $rootScope.workerId = workerId;
    $rootScope.workerHandle = workerHandle;
    $rootScope.firebaseUrl = firebaseUrl;
    $rootScope.userData = userService.data;
    $rootScope.logoutUrl = logoutUrl;
    $rootScope.avatar = avatarFactory.get;

    var userStatistics = $modal({
      scope: $rootScope,
      container: 'body',
      animation: 'am-fade-and-scale',
      placement: 'center',
      template: 'achievements/achievements_panel.html',
      show: false
    });
    var workerProfile = $modal({
      scope: $rootScope.$new(true),
      container: 'body',
      animation: 'am-fade-and-scale',
      placement: 'center',
      template: 'worker_profile/workerStatsModal.html',
      show: false
    });
    var profileModal = $modal({
      scope: $rootScope,
      container: 'body',
      animation: 'am-fade-and-scale',
      placement: 'center',
      template: 'widgets/popup_user_profile.html',
      show: false
    });
    var servicesLoadingStatus = {};
    var loadingServicesInterval = $interval(loadServices(), 200);


    $rootScope.$on('showUserStatistics', showStatistics);
    $rootScope.$on('showWorkerProfile', showWorkerProfile);
    $rootScope.$on('showProfileModal', showProfileModal);
    $rootScope.$on('serviceLoaded', serviceLoaded);
    $rootScope.$on('sendFeedback', sendFeedback);

    $rootScope.trustHtml = function(unsafeHtml) {
      return $sce.trustAsHtml(unsafeHtml);
    };
    $rootScope.makeDirty = makeFormDirty;

    // Track interactions of interest and send to Google Analytics
    Angularytics.init();
    $rootScope.trackInteraction = function(interactionCategory, userAction, context) {
      var triggerElement = userAction + ': ' + context.target.innerHTML;
      Angularytics.trackEvent(interactionCategory, triggerElement, workerHandle);
    };

    function loadServices() {
      servicesLoadingStatus = {};
      projectService.init();
      functionsService.init();
      AdtService.init();
      questionsService.init();
      notificationsService.init();
      newsfeedService.init();
      testsService.init();

    }

    function serviceLoaded(event, nameOfTheService) {
      servicesLoadingStatus[nameOfTheService] = true;

      if (servicesLoadingStatus.hasOwnProperty('project') &&
          servicesLoadingStatus.hasOwnProperty('functions') &&
        servicesLoadingStatus.hasOwnProperty('adts') &&
        servicesLoadingStatus.hasOwnProperty('questions') &&
        servicesLoadingStatus.hasOwnProperty('newsfeed') &&
        servicesLoadingStatus.hasOwnProperty('tests')) {

        $interval.cancel(loadingServicesInterval);
        loadingServicesInterval = undefined;


        userService.listenForJobs();
        userService.listenForLogoutWorker();

        $rootScope.$broadcast('openDashboard');
        //$rootScope.$broadcast('fetchMicrotask');

        $rootScope.$broadcast('queue-tutorial', 'main', false, function() {
          $rootScope.$broadcast('showProfileModal');
        });
      }
    }

    function showProfileModal() {
      profileModal.$promise.then(profileModal.show);
    }

    function showStatistics() {
      userStatistics.$promise.then(userStatistics.show);
    }

    function showWorkerProfile($event, id) {
      workerProfile.$scope.id = id;
      workerProfile.$promise.then(workerProfile.show);
    }


    function makeFormDirty(form) {
      angular.forEach(form, function(formElement, fieldName) {
        // If the fieldname doesn't start with a '$' sign, it means it's form
        if (fieldName[0] !== '$') {
          if (angular.isFunction(formElement.$setDirty))
            formElement.$setDirty();

          //if formElement as the proprety $addControl means that have other form inside him
          if (formElement !== undefined && formElement.$addControl)
            makeFormDirty(formElement);
        }
      });
    }

    function sendFeedback(event, message) {

      if (message.toString() != '') {
        ////console.log("message " + message.toString());
        var feedback = {
          // 'microtaskType': $scope.microtask.type,
          // 'microtaskID': $scope.microtask.id,
          'workerHandle': $rootScope.workerHandle,
          'workerID': $rootScope.workerId,
          'feedback': message.toString()
        };
        var feedbackRef = firebase.database().ref().child('Projects').child(projectId).child('feedback');
        var feedbacks = $firebaseArray(feedbackRef);
        feedbacks.$loaded().then(function() {
          feedbacks.$add(feedback);
        });
      }
    }
  });

angular
    .module('crowdCode')
    .controller('userAchievements', ['$scope','avatarFactory','iconFactory','$firebaseArray','firebaseUrl','workerId', function($scope, avatarFactory,iconFactory,$firebaseArray,firebaseUrl,workerId){


    $scope.userStats = [];
    $scope.listOfachievements = [];
    $scope.icon = iconFactory.get;
    $scope.avatar  = avatarFactory.get;
      var statsRef = firebase.database().ref().child('Workers').child(workerId).child('microtaskHistory');
    	//var statsRef  = new Firebase(firebaseUrl + '/workers/'+workerId+'/microtaskHistory');
     	//var statsSync = $firebaseArray(statsRef);
     	$scope.userStats = $firebaseArray(statsRef);
     	$scope.userStats.$loaded().then(function(){
        console.log($scope.userStats);
     	});


    	var achievementsRef  = firebase.database().ref().child('Workers').child(workerId).child('listOfAchievements');
      //new Firebase(firebaseUrl + '/workers/'+workerId+'/listOfAchievements');
    	//var achievementsSync = $firebaseArray(achievementsRef);
    	$scope.listOfachievements = $firebaseArray(achievementsRef);
    	$scope.listOfachievements.$loaded().then(function(){
        console.log($scope.listOfachievements);
    	});
}]);

angular.module('crowdCode').filter('byCurrent', function () {
    return function (listOfachievements) {
       	var types = [];
        var items = {
            out: []
        };
        angular.forEach(listOfachievements, function (value, key) {
            if (!value.isUnlocked && types.indexOf(value.condition) == -1  && this.out.length < 3) {
                this.out.push(value);
                types.push(value.condition);
            }
        }, items);
        types = [];
        return items.out;
    };
});

angular.module('crowdCode').filter('statsToShow', function () {
    return function (userStats) {
        var items = {
            out: []
        };
        angular.forEach(userStats, function (value, key) {
            if (value.$id != 'question_views' && value.$id != 'tutorial_completed' && value.$id != 'accepted_microtask') {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});




//angular
//.module('crowdCode')
//.directive('userAchievements', ['$firebase','iconFactory','firebaseUrl','workerId', achievements])
//
//function achievements($firebase, iconFactory, firebaseUrl, workerId) {
//return {
//    restrict: 'E',
//    templateUrl: 'achievements/achievements_panel.html',
//    controller: function($scope, $element) {
//        var lbSync = $firebase(new Firebase(firebaseUrl + '/workers/'+workerId+'/listOfAchievements'));
//        $scope.listOfachievements = lbSync.$asArray();
//        $scope.icon = iconFactory.get;
//        $scope.listOfachievements.$loaded().then(function() {});
//    }
//};
//}
//
//angular.module('crowdCode').filter('byCurrent', function () {
//return function (listOfachievements) {
//   	var types = [];
//    var items = {
//        out: []
//    };
//    angular.forEach(listOfachievements, function (value, key) {
//        if (!value.isUnlocked && types.indexOf(value.condition) == -1  && this.out.length < 3) {
//            this.out.push(value);
//            types.push(value.condition);
//        }
//    }, items);
//    types = [];
//    return items.out;
//};
//});

angular
  .module('crowdCode')
  .factory("iconFactory", ['firebaseUrl', function(firebaseUrl) {

    var loaded = {};

    var factory = {};
    factory.get = function(condition) {
      return {
        $value: '/img/achievements/' + condition + '.png'
      };
    };

    return factory;
  }]);


angular
    .module('crowdCode')
    .directive('chat', function($timeout, $rootScope,  $alert, firebaseUrl, avatarFactory, userService, workerId, projectId) {
    return {
        restrict: 'E',
        templateUrl: 'chat/chat_panel.html',
        scope: {
            //focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {

            $rootScope.chatActive = false;
            $rootScope.unreadedMessages=0;
            $rootScope.$on('toggleChat', function() {
                $element.find('.chat').toggleClass('active');
                $rootScope.chatActive = ! $rootScope.chatActive;
                $rootScope.unreadMessages =0;
            });
        },
        controller: function($scope, $element, $rootScope) {
            // syncs and references to firebase
            var chatRef = firebase.database().ref().child('Chat').child(projectId);
            //new Firebase( firebaseUrl + '/chat');

            // data about the 'new message' alert
            var alertData = {
                duration : 4, // in seconds
                object : null,
                text   : '',
                worker : '',
                createdAt : 0
            };

            // track the page load time
            var startLoadingTime = new Date().getTime();

            // set scope variables
            $scope.avatar = avatarFactory.get;
            $rootScope.unreadMessages=0;
            $scope.messages = [];

            // for each added message
            chatRef.on('child_added',function(childSnap, prevChildName){

                    // get the message data and add it to the list
                    var message = childSnap.val();

                    if( message.workerId === workerId )
                        message.workerHandle = 'You';

                    var last = $scope.messages[ $scope.messages.length - 1 ];
                    if( last !== undefined && last.workerId == message.workerId && ( message.createdAt - last.createdAt ) < 5 * 1000 ) {
                        last.text += '<br />' + message.text;
                        last.createdAt = message.createdAt;
                    } else
                        $scope.messages.push(message);

                    /*
                    // if the chat is hidden and the timestamp is
                    // after the timestamp of the page load
                    if( message.createdAt > startLoadingTime )
                        if( !$rootScope.chatActive ){

                             // increase the number of unread messages
                            $rootScope.unreadMessages++;

                            // if the current message has been sent
                            // from the same worker of the previous one
                            // and the alert is still on
                            if( alertData.worker == message.workerHandle && ( message.createdAt - alertData.createdAt) < alertData.duration*1000 ) {
                                // append the new text to the current alert
                                alertData.text += '<br/>'+message.text;
                                alertData.object.hide();
                            } else {
                                // set data for the new alert
                                alertData.text   = message.text;
                                alertData.worker = message.workerHandle;
                            }

                            // record the creation time of the alert
                            // and show it
                            alertData.createdAt = new Date().getTime();
                            alertData.object    = $alert({
                                title    : alertData.worker,
                                content  : alertData.text ,
                                duration : alertData.duration ,
                                template : 'chat/alert_chat.html',
                                keyboard : true,
                                show: true
                            });
                        }
                    */

                    $timeout( function(){ $scope.$apply() }, 100);
            });

            // hide the alert if the chat becomes active
            $rootScope.$watch('chatActive',function(newVal,oldVal){
                if( newVal && alertData.object != null )
                    alertData.object.hide();
            });

            // add new message to the conversation
            $scope.data = {};
            $scope.data.newMessage = "";
            $scope.addMessage = function() {
                if( $scope.data.newMessage.length > 0){
                    var newMessageRef = chatRef.push();
                    newMessageRef.set({
                        text:         $scope.data.newMessage,
                        createdAt:    Date.now(),
                        workerHandle: $rootScope.workerHandle,
                        workerId:     $rootScope.workerId,
                        microtaskKey: (userService.assignedMicrotaskKey===null)?'no-microtask':userService.assignedMicrotaskKey
                    });
                    $scope.data.newMessage = "";
                }
            };
        }
    };
});

/*
 *  A JSONValitator provides a way to validate json texts.
 *
 */

function JSONValidator() {
  // private variables
  var text;
  var isValidParam;
  var paramType; // String indicating type of parameter
  var errors = [];
  var nameToADT = [];

  this.initialize = function(myNameToAdt, myText, myParamType) {
    text = myText
    nameToADT = myNameToAdt; //
    paramType = myParamType;

    isValidParam = false;
  };

  this.isValid = function() {
    return isValid();
  };
  this.errorCheck = function() {
    return errorCheck();
  };
  this.getErrors = function() {
    return errors;
  };

  // Returns true iff the text contained is currently valid
  function isValid() {
    return isValidParam;
  }

  function errorCheck() {
    errors = [];

    // wrap the value as an assignment to a variable, then syntax check it
    var stmtToTest = 'var stmt = ' + text + ';';
    if (!JSHINT(stmtToTest, getJSHintGlobals()))
      errors.concat(checkForErrors(JSHINT.errors));

    // If there are no syntax errors, check the structure.
    if (errors == "") {
      try {
        errors = checkStructure(JSON.parse(text), paramType);
      } catch (e) {
        if (e.message != 'Unexpected token o')
          errors.push(e.message);

        // We can get an error here if the 1) field names are not surrounded by double quotes, 2) there's a trailing ,
        // Also need to check that strings are surrounded by double quotes, not single quotes....
        // errors.push("1) property names are surrounded by double quotes");
        // errors.push("2) strings are surrounded by double quotes not by single quotes" );
        // errors.push("3) there are no trailing commas in the list of fields.");
      }
    }

    isValidParam = (errors.length == 0) ? true : false;
  }

  // Checks that the provided struct is correctly formatted as the type in typeName.
  // Returns an empty string if no errors and an html formatted error string if there are.
  function checkStructure(struct, typeName, level) {
    if (struct === null) {
      // null is an accepted value for any field
    } else if (typeName == 'String') {
      if (typeof struct != 'string')
        errors.push("'" + JSON.stringify(struct) + "' should be a String, but is not");
    } else if (typeName == "Number") {
      if (typeof struct != 'number')
        errors.push("'" + JSON.stringify(struct) + "' should be a Number, but is not");
    } else if (typeName == "Boolean") {
      if (typeof struct != 'boolean')
        errors.push("'" + JSON.stringify(struct) + "' should be a Boolean, but is not");
    }
    // Recursive case: check for typeNames that are arrays
    else if (typeName.endsWith("[]")) {
      // Check that struct is an array.
      if (Array.prototype.isPrototypeOf(struct)) {
        // Recurse on each array element, passing the typename minus the last []
        for (var i = 0; i < struct.length; i++) {
          errors.concat(checkStructure(struct[i], typeName.substring(0, typeName.length - 2), level + 1));
        }
      } else {
        errors.push("'" + JSON.stringify(struct) + "' should be an array, but is not. Try enclosing the value in array bracks ([]).");
      }
    }
    // Recursive case: typeName is an ADT name. Recursively check that
    else if (nameToADT.hasOwnProperty(typeName)) {
      if (typeof struct == 'object') {
        var typeDescrip = nameToADT[typeName].structure;
        var typeFieldNames = [];

        // Loop over all the fields defined in typeName, checking that each is present in struct
        // and (recursively) that they are of the correct type.
        for (var i = 0; i < typeDescrip.length; i++) {
          typeFieldNames.push(typeDescrip[i].name);

          var fieldName = typeDescrip[i].name;
          var fieldType = typeDescrip[i].type;


          if (struct.hasOwnProperty(fieldName))
            errors.concat(checkStructure(struct[fieldName], fieldType, level + 1));
          else
            errors.push("'" + JSON.stringify(struct) + "' is missing the required property " + fieldName);
        }

        // Loop over all the fields defined in the struct, checking that each
        // is part of the data type
        var structFieldNames = Object.keys(struct);
        for (var f = 0; f < structFieldNames.length; f++)
          if (typeFieldNames.indexOf(structFieldNames[f]) == -1)
            errors.push("'" + structFieldNames[f] + "' is not a field of the data type " + typeName);

      } else {
        errors.push("'" + JSON.stringify(struct) + "' is not an " + typeName);
      }
    } else {
      errors.push("Internal error - " + typeName + " is not a valid type name");
    }

    return errors;
  }
}

function checkForErrors(e)
{
	/**JSHINT CONFIG*/
	/*jshint camelcase: false, white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true*/
	/*global window: false, document: false, $: false, log: false, bleep: false,test: false*/
	  
	var anyErrors = false;
	var arrayOfErrors = [];
	for (var i = 0; i < e.length; i++) 
	{
		// I am not sure if checking making sure not null is okay, I think so
		// but I am commenting just to be sure. If all reasons are null then
		// I think should be okay
//		if(e[i] != null && e[i].reason != "Weird program." && e[i].reason != "Unexpected 'return'." && e[i].reason != "Unexpected 'else' after 'return'.") 
//		{
//			if(e[i].reason == "Stopping. (100% scanned).")
//			{
//				continue;
//			}
//			debugger;
		    if (e[i] != null)
		    {
				arrayOfErrors.push("Line " + e[i].line + ": " + e[i].reason) ;
				anyErrors = true;
		    }
//		}
	}
	if(anyErrors)
	{
		return arrayOfErrors; 
	}
	return "";
}

function getJSHintGlobals()
{
	//latededf was  true, setted as false
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true};
}

function getJSHintForPseudocalls()
{
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true};
}

function getJSHintForStatements()
{
	// if releated to a parameter you can check box in JLINT website add here
	return {latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true };
}

function getUnitTestGlobals()
{
	// if related to unittest for lint add here
	return "/*global window: false, document: false, $: false, throws:false, log: false, bleep: false, equal: false, notEqual: false, deepEqual: false, notDeepEqual: false, raises: false*/";
}
angular
    .module('crowdCode')
    .service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    };
}]);
angular
    .module('crowdCode')
    .filter("newline", function(){
	  return function(text) {
		  return text.replace(/\n/g, '<br>');
	  };
});
angular
    .module('crowdCode')
    .filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});
angular
    .module('crowdCode')
    .filter('float', function() {
  return function(input) {
    return parseFloat(input);
  };
});
angular
    .module('crowdCode')
    .filter('keylength', function(){
  return function(input){
    if(!angular.isObject(input)){
      throw Error("Usage of non-objects with keylength filter!!")
    }
    return Object.keys(input).length;
  };
});
  angular.module('crowdCode')
  .filter('percentage', ['$filter', function($filter) {
      return function(input) {
          return $filter('number')(input*100, decimals)+'%';
      };
  }]);


/** 
 safe json parse 
**/



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

/**
 * This class manages a list of Firebase elements and dispatches items in it to
 * be processed. It is designed to only process one item at a time.
 *
 * It uses transactions to grab queue elements, so it's safe to run multiple
 * workers at the same time processing the same queue.
 *
 * @param queueRef A Firebase reference to the list of work items
 * @param processingCallback The callback to be called for each work item
 */
function DistributedWorker(workerID, queueRef, processingCallback) {

	this.workerID = workerID;

	// retrieve callback
	this.processingCallback = processingCallback;

	// start busy as FALSE
	this.busy = false;

	// every time at queueRef one child is added
	// retrieve the item and try to process it
	queueRef.startAt().limitToFirst(1).on("child_added", function(snapshot) {
		this.currentItem = snapshot.ref;
		this.tryToProcess();
	}, this);

}

//reset busy flag and try again to process
DistributedWorker.prototype.readyToProcess = function() {
	this.busy = false;
	this.tryToProcess();
};

// executes the transaction to pop() an
// object from the firebase queue
DistributedWorker.prototype.tryToProcess = function() {

	if(!this.busy && this.currentItem) {

		//local vars
		var dataToProcess = null,
		    self = this,
		    toProcess = this.currentItem;

		// set busy to true and initialize current item
		this.busy = true;
		this.currentItem = null;

		// start the firebase transaction
		toProcess.transaction(function(theItem) {

			// copy the retrieved item to dataToProcess
			dataToProcess = theItem;

			if(theItem) return null;
			else        return;

		}, function(error, committed, snapshot) { // on transaction complete

			if (error) throw error;

			if(committed) { // if transaction committed
				//execute callback and after again ready to process
				self.processingCallback(dataToProcess, function() {
					self.readyToProcess();
				});

			} else {
				self.readyToProcess();
			}

		});
	}
};

////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('AdtService', ['$rootScope', '$firebaseArray', 'firebaseUrl', function($rootScope, $firebaseArray,firebaseUrl) {

	var service = new  function(){

		var adts = [];

		this.init         = init;
		this.getAll       = getAll;
		this.getAllNames  = getAllNames;
		this.getByName	  = getByName;
		this.getNameToAdt = getNameToAdt;

		function init(){
      adtRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('ADTs');
			adts = $firebaseArray(adtRef);
			adts.$loaded().then(function(){
				// tell the others that the adts services is loaded
				$rootScope.$broadcast('serviceLoaded','adts');

			});
		}

		function getByName(name){
			for( var i = 0; i < adts.length; i++ ){
				if( adts[i].name === name )
					return adts[i];
			}
    		return null;
		}

		function getAll(){
			return adts;
		}

		function getAllNames(){
			return adts.map(function(adt){
				return adt.name;
			});
		}

		function getNameToAdt(){
			var nameToAdt = {};
			adts.map(function(adt){
				nameToAdt[ adt.name ] = adt;
			});
			return nameToAdt;
		}



	}

	return service;
}]);


// check if a variable type is a valid ADT
angular
    .module('crowdCode')
    .directive('adtValidator', ['AdtUtils', function(AdtUtils) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var valid =  viewValue === ""|| viewValue === undefined || AdtUtils.isValidName(viewValue) ;
                if (!valid) {
                    ctrl.$setValidity('adt', false);
                    ctrl.$error.adt = "Is not a valid type name. Valid type names are 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).";
                    return viewValue;
                } else {
                    ctrl.$setValidity('adt', true);
                    return viewValue;
                }

            });

        }
    };
}]);

////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('AdtUtils', [ 'AdtService', function(AdtService) {

	return {
        parse               : parse,
        validate            : validate,
        isValidName         : isValidName,
        getNameAndSuffix    : getNameAndSuffix
    };


    function parse(){

    }

    function validate(stringValue,type,name){
                // avoids jshint entering in json mode
        code = 'var _value = '+stringValue+';';

        var data = {};
        data.errors = [];

        var lintResult = JSHINT(code,{latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true});

        //console.log('linting '+lintResult);
        // if the linting failed
        if( !lintResult ) {
            data.errors = data.errors.concat(checkForErrors(JSHINT.errors));
        } 
        // otherwise check the structure
        else {
            eval(code);
            // validate the structure
            data.errors = validateStructure(_value, type, name).concat(data.errors);
        }

        return data;
    }

    function validateStructure(value,expectedType,name){

        if( value == null ) return [];
        
        // if it's a simple data type
        var errors = [];
        var dataType = getNameAndSuffix(expectedType);

        // if the expected type is an array
        if( dataType.suffix.length > 0 ){
            // if is an instance of array, validate each element
            if( value instanceof Array ){
                for( var i = 0; i < value.length ; i++ ){
                    errors = validateStructure(value[i], dataType.name, "element "+i).concat(errors);
                }
            }
            else {
                errors.push( name + " should be an array and it's not!");
            }
        }
        else {
            // check the simple data types
            if( dataType.name == "String" ){ 
                if( typeof value !== 'string')
                    errors.push( name + " should be a string and it's not!");
            }
            else if( dataType.name == "Boolean"){ 
                if( typeof value !== 'boolean')
                    errors.push( name + " should be a boolean and it's not!");
            }
            else if( dataType.name == "Number"){ 
                if( typeof value !== 'number')
                    errors.push( name + " should be a number and it's not!");
            }
            // check the first layer of the complex data type
            else if( typeof value !== 'object' ){
                errors.push( name + " should be an object and it's not!")
            }
            else {
                var adt = AdtService.getByName(dataType.name);
                if( adt == null )
                    throw 'Data type '+dataType.name+' cannot be find!';

                var struct = adt.structure;
                var structProperties = [];
                for( var i = 0; i < struct.length ; i++ ){
                    var prop = struct[i];
                    structProperties.push(prop.name);
                    if( !value.hasOwnProperty(prop.name) ){
                        errors.push( name + " is missing the property " + prop.name);
                        break;
                    }
                    else {
                        errors = validateStructure(value[prop.name],prop.type,name+'.'+prop.name).concat(errors);
                    }
                }

                for( var propName in value ){
                    if( structProperties.indexOf(propName) == -1 )
                        errors.push( propName + " is not a field of the data type " + dataType.name);
                }

            }  
        }

        return errors;
    }


    function isValidName(name){      
        var dataType = getNameAndSuffix(name);

        // check if the name is one of the data types
        if ( AdtService.getAllNames().indexOf(dataType.name) == -1){
            return false;
        }
        
        // check that the dimensions is at most 4
        if ( dataType.suffix.length > 0 && ['[]', '[][]', '[][][]', '[][][][]'].indexOf(dataType.suffix) == -1 ) {
                return false;
        }

        return true;
    }

    function getNameAndSuffix(fullName){
        var suffixIndex = fullName.indexOf('[]');
        return {
            name    : suffixIndex == -1 ? fullName : fullName.substring(0,suffixIndex),
            suffix  : suffixIndex == -1 ? "" : fullName.substring(suffixIndex) 
        };
    }
}]);

angular
    .module('crowdCode')
    .directive('includeReplace', function ($compile) {
    return {
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});
/* ---------- KEY LISTENERS ----------- */
angular
    .module('crowdCode')
    .directive('pressEnter', function() {


    return function(scope, element, attrs) {

        var keyPressListener = function(event){
            if (!event.shiftKey && !event.ctrlKey && event.which === 13 ) {
                scope.$apply(function() {
                    scope.$eval(attrs.pressEnter);
                });
                event.preventDefault();
                
            }
        };

        element.on('keydown', keyPressListener);

        element.on('$destroy',function(){
            element.off('keydown',null,keyPressListener);
        });
    };
});

angular.module('crowdCode').directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

angular
    .module('crowdCode')
    .directive('disableBackspace', function() {
    return function(scope, element, attrs) {
        element.unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && 
                     (
                         d.type.toUpperCase() === 'TEXT' ||
                         d.type.toUpperCase() === 'PASSWORD' || 
                         d.type.toUpperCase() === 'FILE' || 
                         d.type.toUpperCase() === 'EMAIL' || 
                         d.type.toUpperCase() === 'SEARCH' || 
                         d.type.toUpperCase() === 'DATE' )
                     ) || 
                    d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });
    };
});


/* --------- FORM FOCUS MANAGEMENT HELPERS ------------ */
angular
    .module('crowdCode')
    .directive('focus', function(){
  return {
    link: function(scope, element) {
      element[0].focus();
    }
  };
});


angular
    .module('crowdCode')
    .directive('syncFocusWith', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {
            var unwatch = $scope.$watch("focusValue", function(currentValue, previousValue) {
                console.log('ajejebrazorf',currentValue,previousValue);
                if (currentValue === true && !previousValue) {
                    $element[0].focus();
                } else if (currentValue === false && previousValue) {
                    $element[0].blur();
                }
            });

            $element.on('$destroy',function(){
                unwatch();
            });
        }
    };
});





// USED FOR UPLOADING THE USER PICTURE
angular
    .module('crowdCode')
    .directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);





angular
    .module('crowdCode')
    .directive('reservedWord', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModelCtrl) {
            var reservedWord= ["abstract","boolean","break","byte","case","catch","char","class","const","continue",
            "debugger","default","delete","do","double","else","enum","export","extends","false","final","finally",
            "float","for","function","goto","if","implements","import","in","instanceof","int","interface","long","native",
            "new","null","package","private","protected","public","return","short","static","super","switch","synchronized",
            "this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with"];

            ngModelCtrl.$parsers.unshift(function(viewValue) {
                
                if(reservedWord.indexOf(viewValue)===-1){
                    ngModelCtrl.$setValidity('reservedWord', true);
                    return viewValue;
                }else{
                   ngModelCtrl.$setValidity('reservedWord', false);
                   ngModelCtrl.$error.reservedWord = "You are using a reserved word of JavaScript, please Change it";
                   return viewValue;
                }
            });
        }
    };
});

angular
    .module('crowdCode')
    .directive('unicName', function(){
    return {
        scope: { parameters : "=" }, // {} = isolate, true = child, false/undefined = no change
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
        link: function($scope, iElm, iAttrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                // calc occurrences 
                var occurrence=0;
                angular.forEach($scope.parameters, function(value, key) {
                    if(value.paramName==viewValue)
                        occurrence++;
                });
                if (occurrence!==0) {
                    ctrl.$setValidity('unic', false);
                    ctrl.$error.unic = "More occurence of the same parameter name have been found, plese fix them";
                    return viewValue;
                } else {
                    ctrl.$setValidity('unic', true);
                    return viewValue;
                }

            });
        }
    };
});




// var name validator
angular
    .module('crowdCode')
    .directive('varNameValidator', ['functionsService', function(functionsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                var match = viewValue.match(/[a-zA-Z][\w\_]*/g);
                var valid = match !== null && viewValue == match[0];
                if (!valid) {
                    ctrl.$setValidity('var', false);
                    return viewValue;
                } else {
                    ctrl.$setValidity('var', true);
                    return viewValue;
                }

            });

        }
    };
}]);


angular
    .module('crowdCode')
    .directive('maxLength',function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

 
          ctrl.$parsers.push(function (viewValue) {
              var maxLength=attrs.maxLength || 70 ;
              var splittedDescription= viewValue.split('\n');
              var regex = '.{1,'+maxLength+'}(\\s|$)|\\S+?(\\s|$)';

              for(var i=0;i<splittedDescription.length;i++ )
              {
                  if(splittedDescription[i].length>maxLength)
                  {
                      splittedDescription[i]=splittedDescription[i].match(RegExp(regex, 'g')).join('\n  ');
                  }
              }

              return '  '+splittedDescription.join('\n  ')+'\n';
         });
          ctrl.$formatters.push(function (viewValue) {
                if( viewValue !== undefined )
                    return  viewValue.substring(2,viewValue.length-1).replace(/\n  /g,'\n');
                else
                    return viewValue;
          });

        }
    };
});
angular
    .module('crowdCode')
    .factory('Function', [ 'Test', function(Test) {

	function Function(rec,key){
		this.$id = key + '';
		this.update(rec);
	}

	Function.prototype = {
		update: function( rec ){
			// if the record is null or undefined, return false
			if( rec === undefined || rec === null)
				return false;

			// extend this object with the properties of the record
			angular.extend(this,rec);

			// reinitialize the tests as empty array
			// and if the function record has tests
			// create an array of Test objects from them
			this.tests = [];

			if( rec.tests !== undefined && angular.isArray(rec.tests))
				for( var testId in rec.tests ){
					this.tests.push(new Test(rec.tests[testId], rec.name));
				}
			return true;
		},

		getHeader: function(){
			if( this.described )
				return this.header;
			else{
				var parNames = [];
				this.parameters.map(function(par){
					parNames.push(par.name);
				});

				var header = 'function '+this.name + '('+parNames.join(',')+')';
				return header;
			}
		},

		getDescription: function(){
			if(this.described!==false)
				return this.description;
			else {
				var splitteDescription=this.description.replace("//", "").split("\n");
				if( splitteDescription !== null )
					splitteDescription.pop();
				return splitteDescription.join("\n");
			}
		},

		getFullDescription: function(){
			if(this.getDescription()===undefined)
				return "";

			var descriptionLines = this.getDescription().split('\n');

			if(this.parameters!==undefined && this.parameters.length>0){
				for(var i=0; i<this.parameters.length; i++)
					descriptionLines.push(
						[
							'@param',
							'{' + this.parameters[i].type + '}',
							this.parameters[i].name,
							'- ' + this.parameters[i].description
						].join(' ')
					);
			}

			if(this.returnType!=='')
				descriptionLines.push('@return {' + this.returnType + '}');

			return '/**\n' +
				   ' * ' +
				   descriptionLines.join('\n * ') +   '\n'	 +
				   ' */\n';
		},

		//  signature is description + header
		getSignature: function(){
			return this.getFullDescription() + this.getHeader();
		},

		//
		getFunctionCode: function(){
			if( this.code )
				return this.getSignature() + this.code;
			else {
				var code = '{ return -1; }';
				return this.getSignature() + code;
			}

		},

		// the full code is the code of the function
		// concatenated to the description of the pseudo functions
		getFullCode: function(){

			var fullCode = this.getFunctionCode();

			if(this.pseudoFunctions){
				fullCode += "\n\n";
				for(var i=0; i<this.pseudoFunctions.length; i++ )
					fullCode += this.pseudoFunctions[i].description + "\n\n";
			}
			return fullCode;
		},

		getStubs: function(){

			var stubs = {};
			for( var key in this.tests){
				if(this.tests[key].isSimple){
					var inputsKey = this.tests[key].getInputsKey();
					stubs[ inputsKey ] = {
						id: this.tests[key].id,
						description: this.tests[key].description,
						output : eval ('('+ this.tests[key].output+ ')'),
					};
				}
			}

			return stubs;
		},

		getTestById : function(id){
			for( var i = 0 ; i < this.tests.length ; i ++)
				if( this.tests[i].id == id )
					return this.tests[i];

			return null;
		}

	};

	return Function;
}]);


angular
    .module('crowdCode')
    .factory("FunctionArray",['$firebaseArray','Function', FunctionArray ]);

function FunctionArray($firebaseArray, Function) {
	return $firebaseArray.$extend({
		$$added: function(snap, prevChild) {
			return new Function(snap.val(),snap.key);
		},
		$$updated: function(snap) {
			return this.$getRecord(snap.key).update(snap.val());
		}
	});
}


// check if a functionName is already taken
angular
    .module('crowdCode')
    .factory('functionUtils', [ 'functionsService', 'AdtUtils', function functionUtils(functionsService, AdtUtils) {
    return {
        parse               : parse,
        validate            : validate
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
            callees: []
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
        var requestedFunctions = [];
        var requestedDataTypes = [];
        var requestedNames = [];
        var calleeNames = [];

        if( ast.body && ast.body.length > 0 && ast.body[0].type === 'FunctionDeclaration' ){
            // get the function body (function name(){ }) range
            var bodyNode = ast.body[0];
            var bodyRange = bodyNode.loc;
            var bodyText = text
                            .split('\n')
                            .slice(bodyRange.start.line-1,bodyRange.end.line)
                            .join('\n');



            // filter out the comment blocks inside the body of the function
            var commentsOutside = commentBlocks.filter(function(block){
                return !isInRange(block.loc, bodyRange);
            });

                
            if( commentsOutside.length > 0 ){
                // the first comment block is the actual function description
                // extend the dto object with the parsed description
                angular.extend(dto,parseFunctionDoc(commentsOutside[0].value));

                // the others comment blocks can be requestedFunctions or requestedDataTypes
                for ( var i = 1 ; i < commentsOutside.length; i++ ) {
                    var value = commentsOutside[i].value;
                    
                    // if it's a function request block
                    if ( value.search('@function') != -1 ) {

                        var parsed = parseFunctionDoc( value );
                        requestedNames.push(parsed.name);
                        requestedFunctions.push(parsed);
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
                        dto.callees.push({
                            id: functionId,
                            name: calleeNames[i]
                        });
                }
            }

            // complete the dto data
            dto.header = bodyText.match(/\bfunction\s+\w+\s*\((\s*\w+\s*,)*(\s*\w+\s*)?\)\s*/g)[0];
            dto.code   = bodyText.slice(dto.header.length);
            dto.name   = bodyNode.id.name;
        }
        
        return {
            ast: ast,
            dto: dto,
            requestedFunctions: requestedFunctions,
            requestedNames: requestedNames,
            calleeNames: calleeNames
        };
    }

    function validate( code){
        var MAX_NEW_STATEMENTS = 10;
        var data = {
            errors : [],
            statements: undefined
        };

        // first jshint check: validate the syntax and check that there is only a function declaration
        var lint = { result: true };

        lint = lintCode(code,{latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true });

        if( !lint.result ){
            data.errors = data.errors.concat(lint.errors);
        }

        if( lint.data.functions.length == 0 ){
            data.errors.push('No function block could be found. Make sure that there is a line that starts with "function"');
        }
        else if( lint.data.functions.length > 1 ){
            data.errors.push('Only one function declaration is allowed! To add a function, use the autocompleter.');
        }
        else {

            // we've checked that there is only a function declaration, 
            // let's set the value of the 'statements' for that function
            data.statements = lint.data.functions[0].metrics.statements;
        }
    

        // if the first linting produced errors, 
        // return now before processing the ast
        if( data.errors.length > 0 )
            return data;

        // get the dto of the function
        var parsed = parse(code);
        var ast = parsed.ast;

        var apiFunctionNames = functionsService.allFunctionNames();
        var allFunctionNames = apiFunctionNames.concat(parsed.requestedNames);
        
        // first jshint check: validate the code checking for undef use
        var codeWithDefs = 'var '+allFunctionNames.join(',')+';\n' + code;

        lint = lintCode(codeWithDefs,{latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true });

        if( !lint.result ){
            data.errors = data.errors.concat(lint.errors);
            return data;
        }

        // validate the main function description
        var funAst = ast.body[0];
        var funDoc = parsed.dto;

        // validate the parsed dto
        data.errors = data.errors.concat(validateFunctionDoc(parsed.dto));

        // validate the parameters
        if( funAst.params.length !== funDoc.parameters.length ){
            data.errors.push('The number of the parameter in the description does not match the number of parameters in the function header');
        } 
        else {

            var orderError = false;
            var paramHeaderNames = funAst.params.map(function(param){
                return param.name;
            });

            for (var i = 0; i < funDoc.parameters.length ; i++) {

                if ( paramHeaderNames.indexOf(funDoc.parameters[i].name) == -1 ) {
                    data.errors.push('The parameter ' + funDoc.parameters[i].name + ' does not exist in the header of the function');
                }
                
                if ( !orderError && funDoc.parameters[i].name != funAst.params[i].name ) {
                    data.errors.push('The order of the parameters in the description does not match the order of the parameters in the function header') ;
                    orderError = true;
                }
            }
        }

        // validate the requested functions
        parsed.requestedFunctions.map(function( requested ){
            if( apiFunctionNames.indexOf(requested.name) > -1 ){
                data.errors.push('The function name '+requested.name+' is already taken!');
            }
            else {
                data.errors = data.errors.concat(validateFunctionDoc(requested));
            }
            if ( parsed.calleeNames.indexOf(requested.name) == -1 ){
                data.errors.push('The requested function '+requested.name+' is never used. Are you sure it\'s still needed?');
            }
        });

        data.dto = parsed.dto;
        data.requestedFunctions = parsed.requestedFunctions;
        
        return data;
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
            errors: lintResult ? [] : checkForErrors(JSHINT.errors),
            data  : JSHINT.data()
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

                    functObj.name = tag.name;
                    break;

                case 'param':
                    if( tag.type ){
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
                    }
                    break;

                case 'return':
                case 'returns':
                    if( tag.type.name ){
                        functObj.returnType = tag.type.name;
                    }
                    else if ( tag.type.type === 'TypeApplication' ) {
                        functObj.returnType = tag.type.applications[0].name + '[]';
                    }
                    break;

                default:
                    break;
            }
        });

        return functObj;
    }

    function validateFunctionDoc(parsed, strict){
        var errors = [];
        var paramTypes = [];
        var apiNames = [];

        if( parsed.name === '' ) {
            errors.push('Please, write a name for the function');
        }
        else if( !parsed.description || parsed.description.length === 0 ){
            errors.push('Please, provide a description for the function '+parsed.name);
        }
        else if( parsed.parameters.length === 0 ){
            errors.push('Please, write at least one parameter for the function '+parsed.name);
        }
        else if( parsed.returnType.length === 0 ){
            errors.push('Please, provide a return type for the function '+parsed.name);
        }
        else if ( ! AdtUtils.isValidName(parsed.returnType) ) {
            errors.push('The return type '+parsed.returnType+' for the function '+parsed.name+' is not valid');
        }
        else {
            for( var i = 0; i < parsed.parameters.length ; i++ ){
                var par = parsed.parameters[i];

                if( !par.type ){
                    errors.push('Please, specify the type for the parameter '+par.name+' of the function '+parsed.name);
                } 
                else if( !AdtUtils.isValidName(par.type)  ) {
                    errors.push('The type of the parameter '+par.name+' of the function '+parsed.name+' is not valid');
                } 
                else if( !par.description || par.description.length < 5 ){
                    errors.push('Please, provide a valid description (min 5 chars) for the parameter '+par.name+' of the function '+parsed.name);
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
        return calleeNames;
     }






}]);


////////////////////////
//FUNCTIONS SERVICE   //
////////////////////////
var fList = null;
angular
    .module('crowdCode')
    .factory('functionsService', ['$rootScope', '$q', '$filter', '$firebaseObject', 'firebaseUrl', 'FunctionArray', 'Function', function($rootScope, $q, $filter, $firebaseObject, firebaseUrl, FunctionArray, Function) {

	var service = new function(){
		// Private variables
		var functions;

		// Public functions
		this.init 					   = init ;
		this.allFunctionNames 		   = allFunctionNames;
		this.get 					   = get;
		this.getVersion 			   = getVersion;
		this.getByName 			       = getByName;
		this.getNameById  			   = getNameById;
		this.getIdByName  			   = getIdByName;
		this.getDescribedFunctionsCode = getDescribedFunctionsCode;
		this.getDescribedFunctionsName = getDescribedFunctionsName;
		this.getDescribedFunctionsId   = getDescribedFunctionsId;
		this.getDescribedFunctions     = getDescribedFunctions;
		this.getAll 				   = getAll;

		// Function bodies
		function init(){
		    // hook from firebase all the functions declarations of the project
        var funcRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('Functions');
		    functions = new FunctionArray(funcRef);
			functions.$loaded().then(function(){
				fList = functions;
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','functions');
			});
		}

		function allFunctionNames(){
			var functionsNames = [];
			angular.forEach(functions, function(fun)
			{
				functionsNames.push(fun.name);
			});
			return functionsNames;
		}


		// Returns an array with every current function ID
		function getDescribedFunctions(){
			return $filter('filter')(functions, { described: true });
		}

		// Returns an array with every current function ID
		function getDescribedFunctionsId(excludedFunctionId){
			var describedIds = [];
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id !== excludedFunctionId ){
					describedIds.push(value.id);
				}
			});
			return describedIds;
		}

		// Returns all the described function Names except the one with the passed ID
		function getDescribedFunctionsName(excludedFunctionId){
			var describedNames = [];
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedNames.push(value.name);
				}
			});
			console.log('desc',describedNames);
			return describedNames;
		}

		// Returns all the described function signature except the one with the passed ID
		function getDescribedFunctionsCode(excludedFunctionId){
			var describedCode = '';
			angular.forEach( getDescribedFunctions(), function(value){
				if( value.id != excludedFunctionId ){
					describedCode += value.header+'{ }';
				}
			});
			return describedCode;
		}


		// Get the function object, in FunctionInFirebase format, for the specified function id
		function get(id){
			return functions.$getRecord(id);
		}

		function getAll(){
			return functions;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function id
		function getVersion(id, version){
			var deferred = $q.defer();
			var funcRef = firebase.database().ref().child('Projects').child(projectId).child('history').child('artifacts').child('Functions').child(id).child(version);
      //new Firebase(firebaseUrl+ '/history/artifacts/functions/' + id+ '/' + version);
			var obj = $firebaseObject( funcRef );
			obj.$loaded().then(function(){
				deferred.resolve(new Function(obj));
			});
			return deferred.promise;
		}

		// Get the function object, in FunctionInFirebase format, for the specified function name
		function getByName(name){
			for( var i = 0 ; i < functions.length ; i ++){
				if( functions[i].name == name ) {
			  		return functions[i];
			  	}
			}
			return null;
		}

		function getIdByName(name){
			var funct = getByName(name);
			if( funct !== null )
				return funct.id;
			return -1;
		}

		function getNameById(id){
			var funct = get(id);
			if( funct !== null){
				return funct.name;
			}
			return '';
		}

	};

	return service;
}]);


//////////////////////
//  JAVA HELPER     //
//////////////////////


angular
    .module('crowdCode')
    .directive('javascriptHelper', ['$compile', '$timeout', '$http', 'AdtService', function($compile, $timeout, $http, AdtService) {
    
    var javascriptTutorialTxt = '\/\/ This is a javascript variable. \r\nvar x = 5;\r\n \r\n\/\/ There are no types in Javascript.\r\nx = \"A string now\";\r\nx = false;\r\nx = 3.5;\r\n \r\n\/\/ This is an array\r\nvar array = [1, 2, 3, 4];\r\nvar sum = 0;\r\n \r\n\/\/ You can loop over arrays\r\nfor (var i = 0; i < array.length; i++)\r\n    sum += array[i];\r\n \r\n\/\/ And push things onto an array\r\nwhile (sum > 0)\r\n{\r\n    array.push(x);\r\n    sum--; \r\n}\r\n\r\n\/\/ These are objects. Objects contains properties, which map a \r\n\/\/ name to a value. Objects function as a map: pick a property \r\n\/\/ name, and assign it a value (any name will do).\r\nvar emptyObject = { };\r\nvar obj2 = { propName: \"value\" };\r\nvar obj3 = { storedArray: array };\r\nvar obj4 = { nestedObject: obj3 };\r\nvar obj5 = { complexExpression: aFunctionCall(obj4) };\r\nvar obj6 = { property1: true,\r\n             property2: \"your string here\" };\r\n\r\n\/\/ Properties in objects can be accessed.\r\nvar obj3Also = obj4.nestedObject;\r\nvar anotherWayToGetObj3 = obj4[\"nestedObject\"];\r\n\r\n\/\/ Or you can check if an object has a property\r\nif (obj4.hasOwnProperty(\"nextedObject\"))\r\n    x = \"Definitely true\";\r\n\r\n\/\/ You can convert objects to strings (that look just like\r\n\/\/ object literals)\r\nvar stringObj2 = JSON.stringify(obj2); \r\n\/\/ stringObj2 == { \"propName\": \"value\" }\r\n\/\/ (the quotes on the property name are optional....)\r\n\r\n\/\/ And back again\r\nvar obj3 = JSON.parse(stringObj3);\r\n\r\n\/\/ Want to know how to do something else? Try a google search!';
    
    return {
        restrict: 'EA',
        templateUrl: 'functions/javascript_tutorial.html',

        link: function($scope, $element, $attributes) {

            // $http.get('functions/javascriptTutorial.txt').success(function(code) {
                $scope.javaTutorial = javascriptTutorialTxt;
            // });

        },
        controller: function($scope, $element) {



            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity
                });

            };
        }
    };

}]);


angular
    .module('crowdCode')
    .directive('leaderboard', ['avatarFactory','$firebaseArray','firebaseUrl','workerId','$rootScope',leaderboard]);

function leaderboard( avatarFactory, $firebaseArray, firebaseUrl, workerId,$rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'leaderboard/leaderboard.template.html',
        controller: function($scope, $element) {
            $scope.avatar  = avatarFactory.get;
            var leaderRef = firebase.database().ref().child('Projects').child(projectId).child('leaderboard').child('leaders');
            $scope.leaders = $firebaseArray(leaderRef);
            $scope.leaders.$loaded().then(function() {});

            $scope.clicked = function(workerToShow){
            	if(workerToShow.$id != workerId){
            		$rootScope.$broadcast('showWorkerProfile',workerToShow.$id);
            	}
            	else{
            		$rootScope.$broadcast('showUserStatistics');
            	}
            }
        }


    };
}



///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ChallengeReviewController', ['$scope', '$rootScope',  '$alert',  'functionsService','AdtService', 'microtasksService', function($scope, $rootScope,  $alert,  functionsService, AdtService, microtasksService) {
    // scope variables
    $scope.review = {};
    $scope.review.reviewText = "";
    $scope.review.functionCode = "";
    $scope.review.isChallengeWon = "false";

    // private variables 
    var oldCode;
    var newCode;
    var diffRes;
    var diffCode;
    var oldFunction;
    var newFunction;
    var functionSync;

    //load the microtask to review
    $scope.review.microtask = microtasksService.get($scope.microtask.microtaskKeyUnderChallenge);
    $scope.review.microtask.$loaded().then(function() {


        $scope.reviewed = $scope.review.microtask;

        if ($scope.reviewed.type == 'WriteTestCases') {
            //load the version of the function with witch the test cases where made
            functionSync = functionsService.getVersion($scope.review.microtask.functionID,$scope.review.microtask.submission.functionVersion);
            functionSync.$loaded().then(function() {
            $scope.funct = new FunctionFactory(functionSync);
            });

            var testcases    = $scope.review.microtask.submission.testCases;
            var testcasesDiff = [];
            angular.forEach(testcases,function(tc,index){
                if(tc.added)
                    testcasesDiff.push({ class: 'add', text : tc.text });
                else if( tc.deleted )
                    testcasesDiff.push({ class: 'del', text : tc.text });
                else {
                    var oldTc = TestList.get(tc.id);
                    if( tc.text != oldTc.getDescription() ) {
                        testcasesDiff.push({ class: 'chg', old: oldTc.getDescription(), text : tc.text });
                    }
                    else
                        testcasesDiff.push({ class: '', text : tc.text });
                }
            });


            $scope.review.testcases    = testcasesDiff;


        } else if ($scope.review.microtask.type == 'WriteFunction') {

            oldFunction = functionsService.get($scope.review.microtask.functionID);
            newFunction = new FunctionFactory ( $scope.review.microtask.submission );

            oldCode = oldFunction.getFullCode().split("\n");
            newCode = newFunction.getFullCode().split("\n");

            diffCode = "";
            diffRes = diff(oldCode, newCode);
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=")
                    diffCode += diffRow[1].join("\n");
                else
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                diffCode += "\n";
            });
            $scope.review.functionCode = diffCode;

            if ($scope.review.microtask.promptType == 'REMOVE_CALLEE')
                $scope.callee=functionsService.get($scope.review.microtask.calleeId);

            if ($scope.review.microtask.promptType == 'DESCRIPTION_CHANGE') {
                oldCode = $scope.review.microtask.oldFullDescription.split("\n");
                newCode = $scope.review.microtask.newFullDescription.split("\n");
                diffRes = diff(oldCode, newCode);
                diffCode = "";
                angular.forEach(diffRes, function(diffRow) {
                    if (diffRow[0] == "=") {
                        diffCode += diffRow[1].join("\n");
                    } else {
                        for (var i = 0; i < diffRow[1].length; i++)
                            diffCode += diffRow[0] + diffRow[1][i] + "\n";
                    }
                    diffCode += "\n";
                });
                $scope.calledDiffCode = diffCode;
            }

        } else if ($scope.review.microtask.type == 'WriteTest') {
            functionSync = functionsService.getVersion($scope.review.microtask.functionID,$scope.review.microtask.submission.functionVersion);
            functionSync.$loaded().then(function() {
                $scope.funct = new FunctionFactory(functionSync);
            });


        } else if ($scope.review.microtask.type == 'WriteCall') {

            oldFunction = functionsService.get($scope.review.microtask.functionID);
            newFunction = new FunctionFactory ($scope.review.microtask.submission);
            oldCode = oldFunction.getFunctionCode().split("\n");

            newCode = newFunction.getFunctionCode().split("\n");


            diffRes = diff(oldCode, newCode);
            diffCode = "";
            angular.forEach(diffRes, function(diffRow) {
                if (diffRow[0] == "=") {
                    diffCode += diffRow[1].join("\n");
                } else {
                    for (var i = 0; i < diffRow[1].length; i++)
                        diffCode += diffRow[0] + diffRow[1][i] + "\n";
                }
                diffCode += "\n";
            });
            $scope.calleeFunction = functionsService.get($scope.review.microtask.calleeID);
            $scope.functName =oldFunction.name;
            $scope.review.functionCode = diffCode;

            //      $scope.review.functionCode = functionsService.renderDescription($scope.review.microtask.submission) + $scope.review.microtask.submission.header + $scope.review.microtask.submission.code;
        } else if ($scope.review.microtask.type == 'WriteFunctionDescription') {
            $scope.review.funct=new FunctionFactory($scope.review.microtask.submission);
            $scope.review.requestingFunction  = functionsService.get($scope.review.microtask.functionID);

        } else if ($scope.review.microtask.type == 'ReuseSearch') {
            //load the callee function
            $scope.funct = functionsService.get($scope.review.microtask.functionID);
            $scope.calleeFunction = functionsService.get($scope.review.microtask.submission.functionId);

        }else if ($scope.review.microtask.type == 'DebugTestFailure') {
            $scope.funct = functionsService.get($scope.review.microtask.functionID);

            if( $scope.review.microtask.submission.hasPseudo){
                oldFunction =  $scope.funct;
                newFunction = new FunctionFactory ( $scope.review.microtask.submission.functionDTO );

                oldCode = oldFunction.getFullCode().split("\n");
                newCode = newFunction.getFullCode().split("\n");

                diffCode = "";
                diffRes = diff(oldCode, newCode);
                angular.forEach(diffRes, function(diffRow) {
                    if (diffRow[0] == "=")
                        diffCode += diffRow[1].join("\n");
                    else
                        for (var i = 0; i < diffRow[1].length; i++)
                            diffCode += diffRow[0] + diffRow[1][i] + "\n";
                    diffCode += "\n";
                });
                $scope.review.functionCode = diffCode;
            } else {
                $scope.tests= [];
                var reviewTest;
                for( var index in $scope.review.microtask.submission.disputedTests){
                    reviewTest=TestList.get($scope.review.microtask.submission.disputedTests[index].id);
                    reviewTest.disputeText = $scope.review.microtask.submission.disputedTests[index].disputeText;
                    $scope.tests.push(reviewTest);
                }

            }
        }
    });


    $scope.accept = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(5);
    };
    $scope.reject = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(1);
    };
    $scope.reissue = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(3);
    };

    //Star rating manager
    // $scope.review.mouseOn = 0;
    $scope.review.maxRating = 5;
    $scope.review.rating    = -1;
    $scope.rate = function(value) {
        if (value >= 0 && value <= $scope.review.maxRating) {
            $scope.review.rating = value;
        }
    };
    var collectOff = $scope.$on('collectFormData', function(event, microtaskForm) {

      console.log($scope.review.isChallengeWon);

        var error = "";
        // if ($scope.review.rating === -1)
        //     error = "plese, select a score";
        // else if (microtaskForm.$invalid && $scope.review.rating <= 3)
        //     error = "please, write an explanation for your choice";


        if (error !== "")
            $alert({
                title: 'Error!',
                content: error,
                type: 'danger',
                show: true,
                duration: 3,
                template: 'microtasks/alert_submit.html',
                container: 'alertcontainer'
            });
        else {

            formData = {
                isChallengeWon              :$scope.review.isChallengeWon,
             };
            $scope.$emit('submitMicrotask', formData);
        }
    });


    $scope.$on('$destroy',function(){
        collectOff();
    });
}]);

angular
	.module('crowdCode')
	.controller("Dashboard",['$scope','$rootScope','$firebase','$firebaseArray','$timeout','microtasksService','firebaseUrl','workerId',
                                 function($scope,$rootScope,$firebase,$firebaseArray,$timeout,microtasksService,firebaseUrl, workerId){

	$scope.availableMicrotasks = [];

	var types = [
			'Review',
			'DescribeFunctionBehavior',
      'ImplementBehavior',
			'ChallengeReview'
	];

	$scope.types = types;
	$scope.typesCount = [];
	$scope.types.keyAt = function(type){
		for(var i=0;i<types.length;i++)
			if(types[i] == type){
				if ($scope.typesCount[type]==0){
					$scope.typesCount[type]+=1;
				}
				return i;
			}
		return -1;
	};


	// populate filters with microtasks types
	$scope.filterEnabled = {};

	angular.forEach(types,function(value,index){
		$scope.filterEnabled[value] = true;
		$scope.typesCount[value] = 0;
	});


	$scope.microtaskQueue = [];

	// load microtasks
	var microtasksRef  = firebase.database().ref().child('Projects').child(projectId).child('status').child('microtaskQueue').child('queue');
	// new Firebase(firebaseUrl+'/status/microtaskQueue/queue');
	$scope.microtaskQueue = $firebaseArray(microtasksRef);
	$scope.microtaskQueue.$loaded().then(function(){
	});

	$scope.reviewQueue = [];

	// load microtasks
	var microtasksRef  = firebase.database().ref().child('Projects').child(projectId).child('status').child('reviewQueue').child('queue');
	//new Firebase(firebaseUrl+'/status/reviewQueue/queue');
	$scope.reviewQueue = $firebaseArray(microtasksRef);
	$scope.reviewQueue.$loaded().then(function(){
	});



	$scope.microtasks = [];

	// load microtasks
	var microtasksRef  =  firebase.database().ref().child('Projects').child(projectId).child('microtasks').child('implementation');
	// new Firebase(firebaseUrl+'/microtasks/');
	var microtasksSync = $firebaseArray(microtasksRef);
	$scope.microtasks = microtasksSync;
	$scope.microtasks.$loaded().then(function(){
	});

	$scope.microtasks.$watch(function(event){
		var task = $scope.microtasks.$getRecord(event.key)
		switch(event.event){
			case 'child_added':
				if(task.excluded != null){
	           		if(task.excluded.search(workerId) === -1)
	           			$scope.typesCount[task.type]++
	            }
	            else{
	            	$scope.typesCount[task.type]++
	            }

				break;

			default:
		}
	});

	$scope.orderPredicate = '';
	$scope.orderReverse   = true;
	$scope.order = function(predicate){
		if($scope.orderPredicate==predicate && $scope.orderReverse)
			$scope.orderReverse = !$scope.orderReverse;
		else if( $scope.orderPredicate==predicate )
			$scope.orderPredicate = '';
		else {
			$scope.orderReverse   = true;
			$scope.orderPredicate = predicate;
		}
	};

	$scope.assignMicrotask = function(task){
		console.log('assigning '+task.$id);
		$rootScope.$broadcast('fetchSpecificMicrotask',  task.$id );
	}

}]);

angular
.module('crowdCode')
.filter('canChoose', function () {
return function (microtasks,microtaskQueue,reviewQueue, availableMicrotasks) {
	availableMicrotasks = [];
	var items = {
    	out: []
    };
    angular.forEach(microtasks, function (value, key) {
    	var available = false;
    	for(var i=0;i<microtaskQueue.length;i++){
    		if(value.$id == microtaskQueue[i].$value){
    			available = true;
    			availableMicrotasks.push(value);
    		}
    	}
    	if(!available){
	    	for(var i=0;i<reviewQueue.length;i++){
	    		if(value.$id == reviewQueue[i].$value){
	    			availableMicrotasks.push(value);
	    			available = true;
	    		}
	    	}
    	}
    	if(available){
    	//if (value.assigned != true && value.completed != true && value.waitingReview != true) {
           	if(value.excluded != null){
           		if(value.excluded.search(workerId) === -1)
           			this.out.push(value);
            }
            else{
            	this.out.push(value);
            }
      //  }
    	}
    }, items);
    return items.out;
};
});

angular
	.module('crowdCode')
	.filter('assigned', function () {
    return function (microtasks,availableMicrotasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        	if(availableMicrotasks.indexOf(value) == -1){
	            if (value.assigned == true && value.completed != true && value.waitingReview != true) {
	                this.out.push(value);
	            }
        	}
        }, items);
        return items.out;
    };
});

angular
	.module('crowdCode')
	.filter('waitingReview', function () {
    return function (microtasks,availableMicrotasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        if(availableMicrotasks.indexOf(value) == -1){
            if (value.waitingReview == true && value.review == undefined) {
                this.out.push(value);
            }
        }
        }, items);
        return items.out;
    };
});

angular
	.module('crowdCode')
	.filter('completed', function () {
    return function (microtasks,availableMicrotasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        	if(availableMicrotasks.indexOf(value) == -1){
	            if (value.completed === true) {
	                this.out.push(value);
	            }
        	}
        }, items);
        return items.out;
    };
});

angular
	.module('crowdCode')
	.filter('byType', function () {
    return function (microtasks, typesFilter) {
        var items = {
        		typesFilter: typesFilter,
            out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (this.typesFilter[value.type] === true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});

angular
    .module('crowdCode')
    .controller('dashboard2', ['$scope','projectService','AdtService','functionsService', '$firebaseObject','firebaseUrl', loadDashboard]);

        function loadDashboard($scope,projectService,AdtService,functionsService,$firebaseObject,firebaseUrl) {
                    $scope.Functions = functionsService.getAll();
                    $scope.DataTypes = AdtService.getAll();
                    $scope.projectName = projectService.getName();
                    $scope.projectDescription = projectService.getDescription();
                    $scope.buildStructure = function (adt) {
                        var struct = '{';
                        angular.forEach(adt.structure, function (field) {
                            struct += '\n  ' + field.name + ': ' + field.type;
                        })
                        struct += '\n}';
                        return struct;
                    };
        }


// ///////////////////////////////
// //  DEBUG TEST FAILURE CONTROLLER //
// ///////////////////////////////
// angular
//     .module('crowdCode')
//     .controller('DebugTestFailureController', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'FunctionFactory', 'TestList', 'TestRunnerFactory', function($scope, $timeout, $rootScope, $alert, $modal, functionsService, FunctionFactory, TestList, TestRunnerFactory) {
    

//     $scope.tabs = {
//         list: ['Test Result','Code','Console','Stubs','Previous Tests'],
//         active : 2,
//         select : function(selectedIndex){
//             if( selectedIndex >= 0 && selectedIndex < this.list.length ){
//                 this.active = selectedIndex;
//             }
//         }
//     };

//     var autosubmit = false;
//     var testRunner = new TestRunnerFactory.instance();
//     testRunner.setTestedFunction($scope.microtask.functionID);
//     testRunner.onTestsFinish(processTestsFinish);
    
//     var lastRunnedCode = '';

//     $scope.previousTests = [];
//     $scope.currentTest   = null;
//     $scope.passedTests   = [];
//     $scope.firstTimeRun  = true; 


//     $scope.stubs      = {}; // contains all the stubs used by all the tests
//     $scope.callees    = {}; // contains the info of all the callee

//     $scope.hidePassedTests  = false;
//     $scope.runTests         = runTests;

//     $scope.functionDescription = $scope.funct.getSignature();
//     $scope.data = {};
//     $scope.data.code = $scope.funct.getFunctionCode();
//     $scope.data.editor = null;
//     $scope.data.running = false;
//     $scope.data.hasPseudo = false;
//     $scope.data.annotations = [];
//     $scope.data.markers = [];
//     $scope.data.onCalleeClick = function(calleeName){
//         $scope.$broadcast('open-stubs-'+calleeName);
//     };

//     $scope.keepCode = false;
//     $scope.toggleKeepCode = function(){ $scope.keepCode = !$scope.keepCode };


//     $scope.$on('collectFormData', collectFormData );
//     $scope.runTests();

    



//     function processTestsFinish(data){
//         $timeout(function(){

//             // if on the first run all the tests pass, 
//             // load a new microtask 
//             $scope.testsRunning = false;

//             if ($scope.firstTimeRun){
//                 // if all the tests passed
//                 // auto submit this microtask
//                 if( data.overallResult ){
//                     autosubmit = true;
//                     $scope.$emit('collectFormData', true);
//                 }
//                 // otherwise remove the non passed tests
//                 // but except the first 
//                 else {
//                     var firstFailedIn = false;
//                     var allTests = [];
//                     $scope.previousTests = [];
//                     angular.forEach( data.tests, function( test, index){
//                         if( test.passed() || $scope.currentTest == null ){
//                             allTests.push( test );

//                             if( !test.passed() ) {
//                                 $scope.currentTest = test; 
//                             } else 
//                                 $scope.previousTests.push( test )
//                         } 
//                     });
//                     testRunner.setTests( [$scope.currentTest].concat( $scope.previousTests ) );
//                 }

//                 $scope.firstTimeRun = false;
//             } 

            
//             if( $scope.currentTest != null ){
//                 var error = $scope.currentTest.errors;
//                 if( error !== undefined ){
//                     $scope.data.annotations = [];
//                     $scope.data.annotations.push({
//                         row:  error.line,
//                         text: 'error: '+error.message + '',
//                         type: 'error'
//                     });
//                 } else {
//                     var annotations = [];
//                     var debug = $scope.currentTest.debug; 
//                     if( debug !== undefined ){
//                         for( var l in debug ){
//                             if( debug[l].line != -1 ){
//                                 var line = debug[l].line;
//                                 annotations.push( {
//                                     row:  debug[l].line,
//                                     text: debug[l].position + ': ' +debug[l].statement + '',
//                                     type: 'info'
//                                 });
//                             }   
//                         }
//                     }
//                     $scope.data.annotations = annotations;
//                 }

//                 $scope.data.markers = [];
//                 $scope.data.callees = Object.keys($scope.currentTest.stubs);
//                 angular.forEach( $scope.data.callees,function(cName){
//                     $scope.data.markers.push({ 
//                         regex: cName+'[\\s]*\\([\\s\\w\\[\\]\\+\\.\\,]*\\)', 
//                         token: 'ace_call' ,
//                         onClick: function(){
//                             $scope.$broadcast('open-stubs-'+cName);
//                         }
//                     });
//                 });
//             }
            
//             // var tokens = [];

//             console.log($scope.currentTest.stubs);
//             $scope.data.running = false;

//         },0);

        

        
//     }


//     function runTests(firstTime) {
//         if( $scope.testsRunning ) return false;

//         lastRunnedCode = $scope.data.editor === null ? $scope.data.code : $scope.data.editor.getValue();
//         testRunner.setTestedFunctionCode( lastRunnedCode );


//         if( !$scope.firstTimeRun ){
//             testRunner.mergeStubs( $scope.currentTest.stubs );
//         }

//         // push a message for for running the tests
//         if( testRunner.runTests() != -1 ) {
//             $scope.data.running = true;
//         }

//         $scope.completed = 0;
//         $scope.total     = 0;
//         $scope.numPassed = 0;

//     }



    

//     function collectFormData(event, microtaskForm) {

//         // CHECK IF THERE ARE FORM ERRORS
//         var errors = "";
        



//         // TAKE THE FAILED TESTS THAT IS NOT IN DISPUTE
//         var failedNonInDispute = 0;
//         var disputeTextEmpty    = false;
//         var inDispute = false;
//         var allTests = $scope.currentTest == null ? 
//                         $scope.previousTests      : 
//                         $scope.previousTests.concat($scope.currentTest);
//         var disputed = [];

//         var hasPseudo = $scope.data.hasPseudo ;

//         // scan the list of tests and search
//         // if there are failed tests non in dispute
//         // or there are disputed tests with empty dispute description
//         angular.forEach( allTests, function(test){
//             if( !test.passed() && ( test.rec.inDispute === undefined || !test.rec.inDispute )  ){
//                 failedNonInDispute++;
//             } else if( test.rec.inDispute ){
//                 if( !disputeTextEmpty && (test.rec.disputeTestText === undefined || test.rec.disputeTestText.length == 0) ){
//                     disputeTextEmpty = true;
//                 } else {
//                     disputed.push( test.getDisputeDTO() );
//                 }
//             }
//         });

//         if( /* dispute descriptions empty */ disputeTextEmpty )
//             errors += "Please, fill the dispute texts!";
//         else if ( /* if other form errors */ microtaskForm.$invalid )
//             errors += "Please, fix all the errors before submit."
//         else if ( /* code doesn't have pseudocall or pseudocode */ !hasPseudo) {
            
//             if( /* at least one test failed and is not disputed */ failedNonInDispute > 0 )
//                 errors += "Please fix all the failed tests or dispute them!";
//             else if( /* code is changed since last test run */ lastRunnedCode != $scope.data.editor.getValue() )
//                 errors += "The code is changed since last tests run. \n Please, run again the tests before submit.";

//         } 
        

//         if (errors === "") {
//             var formData = {
//                 functionDTO   : functionsService.parseFunctionFromAce($scope.data.editor),
//                 stubs         : [],
//                 disputedTests : [],
//                 hasPseudo     : hasPseudo,
//                 autoSubmit    : autosubmit
//             };
            
//             if( !hasPseudo ){
//                 // INSERT STUBS AS NEW TESTS IF THEY ARE NOT FOUND
//                 var stubs = [];
//                 if( $scope.currentTest != null ){
//                     angular.forEach( $scope.currentTest.stubs, function(stubsForFunction, functionName) {
//                         var stubFunction = functionsService.getByName( functionName );
//                         angular.forEach(stubsForFunction, function(stub, index) {

//                             if( TestList.search( functionName, stub.inputs ) === null ){
//                                 console.log('stub not found!');
//                                 var testCode = 'equal(' + stubFunction.name + '(';
//                                 var inputs = [];
//                                 angular.forEach( stub.inputs, function(value, key) {
//                                     testCode += value;
//                                     testCode += (key != stub.inputs.length - 1) ? ',' : '';
//                                 });
//                                 testCode += '),' + stub.output + ',\'' + 'auto generated' + '\');';

//                                 test = {
//                                     description      : 'auto generated test',
//                                     functionVersion  : stubFunction.version,
//                                     code             : testCode,
//                                     hasSimpleTest    : true,
//                                     functionID       : stubFunction.id,
//                                     functionName     : stubFunction.name,
//                                     simpleTestInputs : stub.inputs,
//                                     simpleTestOutput : stub.output,
//                                   //  readOnly         : true,
//                                     inDispute        : false,
//                                     disputeTestText  : '',
//                                 };

//                                 stubs.push(test);
//                             } else 
//                                 console.log('stub found!');
//                         });
//                     });
//                 }
//                 formData.stubs = stubs;

//                 if ( disputed.length > 0 ) {
//                     formData.disputedTests = disputed;
//                 } 
//             }

//             $scope.$emit('submitMicrotask', formData);

//         } else {
//             $alert({
//                 title: 'Error!',
//                 content: errors,
//                 type: 'danger',
//                 show: true,
//                 duration: 5,
//                 template: 'microtasks/alert_submit.html',
//                 container: 'alertcontainer'
//             });
//         }
//     }

// }]);

///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('DescribeBehavior', ['$scope', '$timeout', '$rootScope', '$alert', '$modal', 'functionsService', 'TestRunnerFactory', 'Test', 'functionUtils', 'Function', '$q',
    function($scope, $timeout, $rootScope, $alert, $modal, functionsService, TestRunnerFactory, Test, functionUtils, Function, $q) {

    // prepare the data for the view
    $scope.data = {};
    $scope.data.dispute = { active: false, text: '' };
    $scope.data.tests = [];
    $scope.data.isComplete = false;
    $scope.data.numDeleted = 0;
    $scope.data.selected = -1;
    $scope.data.running = false;
    $scope.data.changedSinceLastRun  = null;
    $scope.data.inspecting = false;
    $scope.data.selected1 = -1;

    var newTest = {
        description: '',
        isSimple : true,
        inputs: $scope.funct.parameters.map(function(par){ return ""; }),
        output: "",
        code: '//write the test code',
        added: true,
        deleted: false
    };

    var runner = new TestRunnerFactory.instance();

    // dto empty object, it's updated
    // every time the functionEditor performs
    // a successful validation of the code
    var functionDto = {};
    var requestedFunctions = [];
    var stubs;
    var editedStubs = {};


    // if the microtask is reissued
    if( $scope.microtask.reissuedSubmission != undefined ){

        $scope.data.isComplete = $scope.microtask.reissuedSubmission.isDescribeComplete;

        // if( $scope.microtask.reissuedSubmission.disputeFunctionText.length > 0 ){
        //     $scope.data.dispute.active = true;
        //     $scope.data.dispute.text   = $scope.microtask.reissuedSubmission.disputeFunctionText;
        // }

        if( $scope.microtask.reissuedSubmission.disputedTests != undefined ){
            var disputed = $scope.microtask.reissuedSubmission.disputedTests;
        }

        // load tests from the previous submission
        var reissuedTests = $scope.microtask.reissuedSubmission.tests ;
        if(angular.isDefined(reissuedTests)) {
          for( var i = 0 ; i < reissuedTests.length ; i++ ){
              var test = new Test(reissuedTests[i], $scope.funct.name);
              // flag the test if is disputed
              if( disputed != undefined ){
                  for( var d = 0 ; d < disputed.length ; d++ ){
                      if( disputed[d].id == test.id ){
                          test.dispute = {
                              active: true,
                              text  : disputed[d].disputeText
                          }
                      } else {
                        test.dispute = {
                            active: false,
                            text  : 'aa'
                        }
                      }
                  }

              } else {
                test.dispute = {
                    active: false,
                    text  : 'aa'
                }
              }
              test.edited  = false;
              test.deleted = false;
              test.added = false;

              $scope.data.tests.push(test);
          }
        }
    }
    // otherwise
    else {
        // load tests from the function
        for( var i = 0; i < $scope.funct.tests.length ; i++ ){
            if( $scope.funct.tests[i].deleted )
                continue;

            var test = angular.copy($scope.funct.tests[i]);
            test.edited  = false;
            test.deleted = false;
            test.added = false;
            test.dispute = { active:false, text: 'aa' };

            // flag the test if is disputed
            if( $scope.microtask.reissuedSubmission != undefined ){
                var disputed = $scope.microtask.reissuedSubmission.disputedTests;
                if( disputed != undefined ){
                    for( var d = 0 ; d < disputed.length ; d++ ){
                        if( disputed[d].id == test.id ){
                            test.dispute = {
                                active: true,
                                text  : disputed[d].disputeText
                            }
                        }
                    }

                }

            }

            $scope.data.tests.push(test);
        }
    }

    // flag the disputed test

    // if( $scope.microtask.disputedTests !== undefined ){
    //     for( var a = 0; a < $scope.microtask.disputedTests.length ; a++ ){
    //         for( var t = 0 ; t < $scope.data.tests.length; t++ ){
    //             var test = $scope.data.tests[t];
    //             if( $scope.microtask.disputedTests[a].id == test.id ){
    //                 test.dispute = {
    //                     active:true,
    //                     text: $scope.microtask.disputedTests[a].disputeText
    //                 };
    //             }
    //         }
    //     }
    // }


    // expose the toggle and edit test functions to the scope
    $scope.toggleEdit   = toggleEdit;
    $scope.toggleDelete = toggleDelete;
    $scope.toggleSelect = toggleSelect;
    $scope.toggleSelect1 = toggleSelect1;
    $scope.addNew       = addNew;
    $scope.toggleInspect  = toggleInspect;
    $scope.toggleDispute  = toggleDispute;
    $scope.saveStub       = saveStub;
    $scope.cancelStub     = cancelStub;
    $scope.run = run;

    // run the tests for the first time
    run().then(function(){
        $scope.data.tests.sort(function(tA,tB){
            if( tA.result.passed && !tB.result.passed ) return -1;
            if( !tA.result.passed && tB.result.passed ) return 1;
            return 0;
        });
    });

    function run(){

        var deferred = $q.defer();
        $scope.data.running = true;
        $scope.data.inspecting = false;

        var code = $scope.data.editor ? $scope.data.editor.getValue() : $scope.funct.getFullCode();
        var tobeTested = [];
        angular.forEach($scope.data.tests, function(value, key) {
          if(value.isSimple && value.added == true) {
            this.push(new Test(value, $scope.funct.name));
          } else {
            this.push(value);
          }
        }, tobeTested);
        runner
            .run(
                $scope.data.tests,
                $scope.funct.name,
                code,
                stubs,
                requestedFunctions
                )
            .then(function(result){
                stubs = result.stubs;
                $scope.data.tests = result.tests;
                $scope.data.running = false;
                $scope.data.changedSinceLastRun = false;
                deferred.resolve();
            });
        return deferred.promise;
    }

    // functionEditor callbacks
    $scope.editorCallbacks = {
        onCodeChanged : onCodeChanged,
        onFunctionParsed : onFunctionParsed,
        onEditStub : onEditStub
    };

    function toggleInspect($event){
        if( !$scope.data.changedSinceLastRun ){
            $scope.data.inspecting = !$scope.data.inspecting;
        }

        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleDispute($event){
        $scope.data.selected1.dispute.active = !$scope.data.selected1.dispute.active;

        if( $scope.data.selected1.dispute.active ){
            $scope.data.selected1.dispute.text = "";
        }

        $event.preventDefault();
        $event.stopPropagation();
    }

    function cancelStub(){
        $scope.data.editingStub = false;
    }

    function onFunctionParsed(_functionDto,_requestedFunctions){
        functionDto = _functionDto;
        requestedFunctions = _requestedFunctions;
    }

    function onCodeChanged(){
        $scope.data.inspecting = false;
        $scope.data.changedSinceLastRun = true;
    }

    function onEditStub(functionName,inputsKey){
        console.log(stubs);
        var funct = functionsService.getByName(functionName);
        if( funct === null ){
            for( var i = 0; i < requestedFunctions.length ; i++ ){
                if( requestedFunctions[i].name == functionName )
                    funct = new Function( requestedFunctions[i] );
            }
        }
        if( funct === null ) throw 'Cannot find the function '+functionName;

        var inputs = inputsKeyToInputs(inputsKey);
        $scope.data.editingStub = {
            functionName : functionName,
            inputsKey    : inputsKey,
            functionDescription : funct.getSignature(),
            parameters   : funct.parameters.map(function(par,index){
                return {
                    name: par.name,
                    type: par.type,
                    value: angular.toJson(inputs[index])
                };
            }),
            output       : {
                type  : funct.returnType,
                value : JSON.stringify(stubs[functionName][inputsKey].output)
            }
        };

        console.log('editing stub',$scope.data.editingStub.id);
    }

    function saveStub(){
        var output       = eval('('+$scope.data.editingStub.output.value+')') || null;
        var functionName = $scope.data.editingStub.functionName;
        var inputsKey    = $scope.data.editingStub.inputsKey;

        if( !editedStubs.hasOwnProperty(functionName) )
            editedStubs[functionName] = {};

        stubs[functionName][inputsKey].output = output;
        editedStubs[functionName][inputsKey]  = stubs[functionName][inputsKey];

        console.log('saving stub ',stubs[functionName][inputsKey].id);

        $scope.data.editingStub = false;
    }

    function inputsKeyToInputs(inputsKey){
        return JSON.parse('['+inputsKey+' ]');
    }

    // register the collect form data listeners
    // and the microtask form destroy listener
    $scope.taskData.collectFormData = collectFormData;

    function toggleSelect1($event,test){
        if( $scope.data.selected1 == -1 ) {
          if(test.isSimple === true)
            test.code = (new Test(test, $scope.funct.name)).code;
          $scope.data.selected1 = test;
        }
        else {
            $scope.data.inspecting = false;
            $scope.data.selected1 = -1;
        }


        $event.preventDefault();
        $event.stopPropagation();
    }


    function addNew($event){
        var lastAdded = angular.copy(newTest);
        lastAdded.dispute = { active:false, text: 'aa' };
        $scope.data.tests.push(lastAdded);
        toggleSelect($event,lastAdded);
    }

    function toggleSelect($event,test){
        if( $scope.data.selected == -1 )
            $scope.data.selected = test;
        else {
            $scope.data.selected.editing = false;
            $scope.data.selected = -1;
        }

        // $event.preventDefault();
        // $event.stopPropagation();
    }

    // function toggleSelect($event,test){
    //     if( $scope.data.selected == -1 )
    //         $scope.data.selected = test;
    //     else {
    //         $scope.data.inspecting = false;
    //         $scope.data.selected = -1;
    //     }
    //
    //
    //     $event.preventDefault();
    //     $event.stopPropagation();
    // }

    function toggleEdit($event){

        if( $scope.data.selected != -1 ) {
            $scope.data.selected.editing = !$scope.data.selected.editing;

            $scope.data.selected.edited = true;
        }

        $event.preventDefault();
        $event.stopPropagation();
    }


    function toggleDelete($event){
        console.log('toggle delete');
        if( $scope.data.selected != -1 ) {
            $scope.data.selected.deleted = !$scope.data.selected.deleted;

            if( $scope.data.selected.deleted ){
                $scope.data.numDeleted ++;
                $scope.data.selected = -1;
            } else {
                $scope.data.numDeleted --;
            }

        }



        $event.preventDefault();
        $event.stopPropagation();
    }


    function collectFormData(form) {

        $scope.data.selected = -1 ;
        $scope.data.selected1 = -1 ;

        if( form.$invalid ){
          console.log("form is invalid ----", form.$error);
            $modal({template : 'microtasks/modal_form_invalid.html' , show: true});
            form.$setDirty();
            return;
        }

        // prepare the microtask submit data
        var formData = {
            functionVersion    : $scope.funct.version,
            tests              : [],
            isDescribeComplete : $scope.data.isComplete,
            disputeFunctionText : '',
            'function': functionDto,
            requestedFunctions: requestedFunctions,
            requestedADTs: [],
            disputedTests: []
        };

        if( $scope.data.dispute.active ){
            formData.disputeFunctionText = $scope.data.dispute.text;
        }
        else {
            // add the current test to the list
            // if( !$scope.data.isComplete )
            //     addTest();

            // for each of the tests, create a testDTO object
            for( var idx = 0 ; idx < $scope.data.tests.length ; idx++ ){
                var test = $scope.data.tests[idx];

                var testDto = {
                    id:          test.id,
                    description: test.description,
                    isSimple:    test.isSimple,
                    code:        test.isSimple ? "" : test.code,
                    inputs:      test.isSimple ? test.inputs : [] ,
                    output:      test.isSimple ? test.output : ""
                };

                if( test.added && test.deleted )
                    continue;

                if( test.added )
                    testDto.added    = true;
                else if( test.deleted )
                    testDto.deleted  = true;
                else if( form['testForm_'+idx].$dirty )
                    testDto.edited = true;
                // else if(formData.disputeFunctionText.length > 0 || test.dispute.active === true) {
                //   if(!angular.isDefined(testDto.added) && !angular.isDefined(testDto.deleted) && !angular.isDefined(testDto.edited)) {
                //     testDto.added    = true;
                //   }
                // }

                formData.tests.push(testDto);
            }
        }
        console.log(formData.tests);

        // add the disputed tests
        $scope.data.tests.map(function(test){
            if( test.dispute.active ){
                formData.disputedTests.push({
                    id: test.id,
                    disputeText: test.dispute.text
                });
            }
        });

        // add the callee stubs
        formData.function.callees.map(function(callee){

            if( !editedStubs.hasOwnProperty(callee.name) )
                return;

            var cStubs = editedStubs[callee.name];
            callee.tests = [];
            for( var inputsKey in cStubs ){
                console.log('stub id ' + cStubs[inputsKey].id + ' is undefined?',cStubs[inputsKey].id == undefined);
                callee.tests.push({
                    id      : cStubs[inputsKey].id,
                    added   : cStubs[inputsKey].id == undefined ? true : false,
                    edited  : cStubs[inputsKey].id == undefined ? false : true,
                    isSimple: true,
                    description: cStubs[inputsKey].id == undefined ? 'auto generated' : cStubs[inputsKey].description,
                    inputs : inputsKeyToInputs(inputsKey),
                    output : JSON.stringify(cStubs[inputsKey].output),
                });
            }
        });

        // add the requested functions stubs
        formData.requestedFunctions.map(function(requested){
            if( !editedStubs.hasOwnProperty(requested.name) )
                return;

            var rStubs = editedStubs[requested.name];
            requested.tests = [];
            for( var inputsKey in rStubs ){
                requested.tests.push({
                    id          : rStubs[inputsKey].id,
                    added       : true,
                    isSimple    : true,
                    description : 'auto generated',
                    inputs      : inputsKeyToInputs(inputsKey),
                    output      : JSON.stringify(rStubs[inputsKey].output)
                });
            }
        });
        console.log('submitted form data',formData);

        return formData;

    }

}]);


///////////////////////////////
//  DEBUG TEST FAILURE CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ImplementBehavior', ['$scope', '$q', 'functionsService', 'functionUtils', 'Function', 'TestRunnerFactory', function($scope, $q, functionsService, functionUtils, Function, TestRunnerFactory) {
    
    var runner = new TestRunnerFactory.instance();

    // dto empty object, it's updated
    // every time the functionEditor performs
    // a successful validation of the code
    var functionDto = {};
    var requestedFunctions = [];
    var stubs;
    var editedStubs = {};


    // the data object is used inside the view
    $scope.data = {};
    $scope.data.running = false;
    $scope.data.changedSinceLastRun  = null;
    $scope.data.inspecting = false;
    $scope.data.selected = -1;

    $scope.data.tests = [];
    for( var i = 0; i < $scope.funct.tests.length ; i++ ){
        if( $scope.funct.tests[i].isDeleted )
            continue;

        var test = angular.copy($scope.funct.tests[i]);
        test.editing = true;
        test.running = true;
        test.dispute = { active:false, text: 'aa' };

        // flag the test if is disputed
        if( $scope.microtask.reissuedSubmission != undefined ){
            var disputed = $scope.microtask.reissuedSubmission.disputedTests;
            if( disputed != undefined ){
                for( var d = 0 ; d < disputed.length ; d++ ){
                    if( disputed[d].id == test.id ){
                        test.dispute = {
                            active: true,
                            text  : disputed[d].disputeText
                        }
                    }
                }

            }
            

        }



        $scope.data.tests.push(test);
    }

    

    // methods used inside the microtask view
    $scope.toggleSelect   = toggleSelect;
    $scope.toggleInspect  = toggleInspect;
    $scope.toggleDispute  = toggleDispute;
    $scope.saveStub       = saveStub;
    $scope.cancelStub     = cancelStub;
    $scope.run = run;

    // functionEditor callbacks
    $scope.editorCallbacks = {
        onCodeChanged : onCodeChanged,
        onFunctionParsed : onFunctionParsed,
        onEditStub : onEditStub
    };

    // listener to the submit button click
    $scope.taskData.collectFormData = collectFormData ;


    // run the tests for the first time
    run().then(function(){
        $scope.data.tests.sort(function(tA,tB){
            if( tA.result.passed && !tB.result.passed ) return -1;
            if( !tA.result.passed && tB.result.passed ) return 1;
            return 0;
        });
    });

    function run(){

        var deferred = $q.defer();
        $scope.data.running = true;
        $scope.data.inspecting = false;

        var code = $scope.data.editor ? $scope.data.editor.getValue() : $scope.funct.getFullCode();
        runner
            .run(
                $scope.data.tests,
                $scope.funct.name,
                code,
                stubs, 
                requestedFunctions
                )
            .then(function(result){
                stubs = result.stubs;
                $scope.data.tests = result.tests;
                $scope.data.running = false;
                $scope.data.changedSinceLastRun = false;
                deferred.resolve();
            });
        return deferred.promise;
    }


    function toggleSelect($event,test){
        if( $scope.data.selected == -1 )
            $scope.data.selected = test;
        else {
            $scope.data.inspecting = false;
            $scope.data.selected = -1;
        }
            

        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleInspect($event){
        if( !$scope.data.changedSinceLastRun ){
            $scope.data.inspecting = !$scope.data.inspecting;
        }
           
        $event.preventDefault();
        $event.stopPropagation();
    }

    function toggleDispute($event){
        $scope.data.selected.dispute.active = !$scope.data.selected.dispute.active;

        if( $scope.data.selected.dispute.active ){
            $scope.data.selected.dispute.text = "";
        }
           
        $event.preventDefault();
        $event.stopPropagation();
    }

    function collectFormData(microtaskForm) {
    	formData = {
            'function': functionDto,
            requestedFunctions: requestedFunctions,
            requestedADTs: [],
            disputedTests: []
        };

        // add the disputed tests
        $scope.data.tests.map(function(test){
            if( test.dispute.active ){
                formData.disputedTests.push({
                    id: test.id,
                    disputeText: test.dispute.text
                });
            }
        });

        // add the callee stubs
        formData.function.callees.map(function(callee){
            
            if( !editedStubs.hasOwnProperty(callee.name) )
                return;

            var cStubs = editedStubs[callee.name];
            callee.tests = [];
            for( var inputsKey in cStubs ){
                console.log('stub id ' + cStubs[inputsKey].id + ' is undefined?',cStubs[inputsKey].id == undefined);
                callee.tests.push({
                    id      : cStubs[inputsKey].id,
                    added   : cStubs[inputsKey].id == undefined ? true : false,
                    edited  : cStubs[inputsKey].id == undefined ? false : true,
                    isSimple: true,
                    description: cStubs[inputsKey].id == undefined ? 'auto generated' : cStubs[inputsKey].description,
                    inputs : inputsKeyToInputs(inputsKey),
                    output : JSON.stringify(cStubs[inputsKey].output),
                });
            }
        });

        // add the requested functions stubs
        formData.requestedFunctions.map(function(requested){
            if( !editedStubs.hasOwnProperty(requested.name) )
                return;

            var rStubs = editedStubs[requested.name];
            requested.tests = [];
            for( var inputsKey in rStubs ){
                requested.tests.push({
                    id          : rStubs[inputsKey].id,
                    added       : true,
                    isSimple    : true,
                    description : 'auto generated',
                    inputs      : inputsKeyToInputs(inputsKey),
                    output      : JSON.stringify(rStubs[inputsKey].output)
                });
            }
        });
        console.log('submitted function',formData);
        return formData;
    }

    function inputsKeyToInputs(inputsKey){
        return JSON.parse('['+inputsKey+' ]');
    }

    function onEditStub(functionName,inputsKey){
        console.log(stubs);
        var funct = functionsService.getByName(functionName);
        if( funct === null ){
            for( var i = 0; i < requestedFunctions.length ; i++ ){
                if( requestedFunctions[i].name == functionName )
                    funct = new Function( requestedFunctions[i] );
            }
        }
        if( funct === null ) throw 'Cannot find the function '+functionName;
        
        var inputs = inputsKeyToInputs(inputsKey);
        $scope.data.editingStub = { 
            functionName : functionName,
            inputsKey    : inputsKey,
            functionDescription : funct.getSignature(),
            parameters   : funct.parameters.map(function(par,index){
                return {
                    name: par.name,
                    type: par.type,
                    value: angular.toJson(inputs[index])
                };
            }),
            output       : {
                type  : funct.returnType,
                value : JSON.stringify(stubs[functionName][inputsKey].output)
            }
        };

        console.log('editing stub',$scope.data.editingStub.id);
    }

    function saveStub(){
        var output       = eval('('+$scope.data.editingStub.output.value+')') || null;
        var functionName = $scope.data.editingStub.functionName;
        var inputsKey    = $scope.data.editingStub.inputsKey; 

        if( !editedStubs.hasOwnProperty(functionName) )
            editedStubs[functionName] = {};

        stubs[functionName][inputsKey].output = output;
        editedStubs[functionName][inputsKey]  = stubs[functionName][inputsKey];

        console.log('saving stub ',stubs[functionName][inputsKey].id);

        $scope.data.editingStub = false;
    }

    function cancelStub(){
        $scope.data.editingStub = false;
    }

    function onFunctionParsed(_functionDto,_requestedFunctions){
        functionDto = _functionDto;
        requestedFunctions = _requestedFunctions;
    }

    function onCodeChanged(){
        $scope.data.inspecting = false;
        $scope.data.changedSinceLastRun = true;
    }


}]);

angular
    .module('crowdCode')
    .directive('microtaskForm', ['Function', '$rootScope',  '$http', '$interval', '$timeout','$modal',  'functionsService', 'userService', 'microtasksService','userService', microtaskForm]);

function microtaskForm(Function, $rootScope,  $http, $interval, $timeout, $modal , functionsService, userService, microtasks,userService) {

    return {
        restrict: 'A',
        scope: true,
        require: 'form',
        templateUrl: 'microtasks/microtask_form.html',
        link: function($scope,$element,$attrs,formController){
        	$scope.formController = formController;
        },
        controller: function($scope){
        	$scope.taskData = {};

			// private vars
			var templatesURL = "microtasks/";
			var templates = {
				'NoMicrotask': 'no_microtask/no_microtask',
				'Dashboard': 'dashboard/dashboard',
				'Dashboard2': 'dashboard/dashboard2',
				'Review': 'review/review',
				'DebugTestFailure': 'debug_test_failure/debug_test_failure',
				'ReuseSearch': 'reuse_search/reuse_search',
				'WriteFunction': 'write_function/write_function',
				'WriteFunctionDescription': 'write_function_description/write_function_description',
				'WriteTest': 'write_test/write_test',
				'WriteTestCases': 'write_test_cases/write_test_cases',
				'WriteCall': 'write_call/write_call',
				'DescribeFunctionBehavior': 'describe_behavior/describe_behavior',
				'ImplementBehavior': 'implement_behavior/implement_behavior',
				'ChallengeReview': 'challenge_review/challenge_review'
			};

			// initialize microtask and templatePath
			$scope.funct = {};
			$scope.microtask = {};
			$scope.templatePath = ""; //"/html/templates/microtasks/";

			$scope.taskData.startBreak = false;

			var waitTimeInSeconds = 3;
			var checkQueueTimeout = null;
			var timerInterval     = null;
			$scope.breakMode     = false;
			$scope.noMicrotask   = true;

			$scope.checkQueueIn  = waitTimeInSeconds;

			$scope.askQuestion = askQuestion();
			$scope.openTutorial = openTutorial;


			$scope.submit = submitMicrotask;
			$scope.skip   = skipMicrotask;
			$scope.fetch  = fetchMicrotask;

			// ------- MESSAGE LISTENERS ------- //

			$scope.$on('timeExpired'    , timeExpired);
			$scope.$on('fetchMicrotask' , fetchMicrotask);
			$scope.$on('fetchSpecificMicrotask' , fetchSpecificMicrotask);
			$scope.$on('microtaskLoaded', onMicrotaskLoaded);
			$scope.$on('openDashboard' , openDashboard);

			$scope.workerOption = "";

			$scope.currentPrompt = function(){
				$scope.workerOption = "Take a break";
				if(userService.data.level >= 2)
					$scope.workerOption = "Pick next microtask"

				return $scope.workerOption;
			}

			function onMicrotaskLoaded($event, microtask){

				// start the microtask tutorial
				$scope.$emit('queue-tutorial', microtask.type , false, function(){});

				$scope.noMicrotask = false;

				// initialize microtask data
				$scope.canSubmit = true;
				$scope.microtask = microtask;
        console.log("microtask ---------", microtask);
				// retrieve the related function
				if (angular.isDefined($scope.microtask.function)) {
          var funct = $scope.microtask.function;
          if(angular.isDefined($scope.microtask.tests) && angular.isArray($scope.microtask.tests))
            funct.tests = $scope.microtask.tests;
          $scope.funct = new Function(funct);
          //functionsService.get($scope.microtask.functionId);
        }
				//set up the right template
				$scope.templatePath = templatesURL + templates[$scope.microtask.type] + ".html";

			}



			function openDashboard(){
				$scope.taskData.startBreak = true;
				$scope.breakMode = true;
				cancelFetchTimer();
                $rootScope.$broadcast("reset-reminder");
				$scope.templatePath  = templatesURL + templates['Dashboard2'] + ".html";
			}

			function noMicrotasks() {
				$scope.noMicrotask = true;
				$scope.$emit('reset-reminder');
				setFetchTimer();
				if(userService.data.level >= 0)
					$scope.templatePath = templatesURL + templates['Dashboard2'] + ".html";
				else
					$scope.templatePath = templatesURL + templates['NoMicrotask'] + ".html";
			}


			function setFetchTimer(){
				// if is not in break mode, start to check the queue
				if(! $scope.breakMode ){
					// initialize the countdown
					$scope.checkQueueIn = waitTimeInSeconds;
					// every second decremend the countdown
					timerInterval = $interval(function(){
						$scope.checkQueueIn -- ;
					}, 1000);
					// set the timeout to check the queue
					checkQueueTimeout = $timeout(function() {
						$scope.checkQueueIn = 0;
						$interval.cancel(timerInterval);

						$timeout(fetchMicrotask,1000);

					}, waitTimeInSeconds*1000);
				}
			}

			function cancelFetchTimer(){
				// cancel checkQueuetimeout
				if (checkQueueTimeout !== null) {
					$timeout.cancel(checkQueueTimeout);
				}
			}


			function checkBreakMode(){
				if( $scope.taskData.startBreak ) {
					$scope.breakMode = true;
					$scope.taskData.startBreak = false;
				}
			}

			// time is expired, skip the microtask
			function timeExpired(){
				$scope.canSubmit    = false;
				$scope.templatePath = templatesURL + "loading.html";
				microtasks
					.submit($scope.microtask,undefined,true,true)
					.then( function(fetchData){
						microtasks.load(fetchData);
					}, function(){
						noMicrotasks();
					});
			}

			function fetchMicrotask($event, fetchData) {
				cancelFetchTimer();
				$scope.breakMode = false;
				microtasks
					.fetch()
					.then( function(fetchData){
						microtasks.load(fetchData);
					}, function(){
						noMicrotasks();
					});
			}

			function fetchSpecificMicrotask($event, microtaskId ) {
				cancelFetchTimer();
				$scope.breakMode     = false;
				$scope.templatePath  = templatesURL + "loading.html";
				microtasks
					.fetchSpecificMicrotask( microtaskId )
					.then( function(fetchData){
						microtasks.load(fetchData);
					}, function(){
						noMicrotasks();
					});
			}


			// skip button pressed
			function skipMicrotask(){
				checkBreakMode();
				$scope.canSubmit    = false;
				$scope.templatePath = templatesURL + "loading.html";
				microtasks
					.submit($scope.microtask,undefined,false,!$scope.breakMode)
					.then( function(fetchData){
                        //microtasks.load(fetchData);
                        openDashboard();
					}, function(){
						noMicrotasks();
					});
			}

			// submit button pressed
			function submitMicrotask() {
				// check if form is untouched
		        if( !$scope.formController.$dirty ){
		            $modal({template : 'microtasks/modal_form_pristine.html' , show: true});
		            return;
		        }
		        // collect form data and submit the microtask
				if( $scope.taskData.collectFormData !== undefined ){
        			var formData = $scope.taskData.collectFormData($scope.formController);
        			if( formData ){
        				checkBreakMode();
						$scope.canSubmit    = false;
						$scope.templatePath = templatesURL + "loading.html";


						microtasks
							.submit($scope.microtask,formData,false,!$scope.breakMode)
							.then( function(fetchData){
								//microtasks.load(fetchData);
                                openDashboard();
							}, function(){
								noMicrotasks();
							});
        			}
        		}
			}


			function askQuestion(){
				$rootScope.$broadcast('setLeftBarTab','questions');
				$rootScope.$broadcast('askQuestion');
			}
			function openTutorial(){
				$scope.$emit('queue-tutorial', $scope.microtask.type , true, function(){});
			}
        }
    };
}


angular
    .module('crowdCode')
    .directive('microtaskShortcuts', function() {
    return function(scope, element, attrs) {

        // manage the key down
        var keyDownListener = function(event, formData){

            var charCode = event.which || event.keyCode;
            var preventDefault = false;

            // all the microtask shortcuts are a combination of CTRL + key
            if( event.ctrlKey ) {

                // if is CTRL + ENTER submit microtask
                if(charCode == 13) { 
                    // console.log('CTRL+ENTER');
                    scope.$broadcast('collectFormData', scope.microtaskForm);
                    preventDefault = true;
                } 

                // // if is CTRL + BACKSPACE skip microtask
                // else if ( charCode == 8 ) { 
                //     // console.log('CTRL+BACKSPACE');
                //     //scope.$emit('skipMicrotask');
                //     preventDefault = true;
                // } 

                // // if is CTRL + H start the tutorial
                // else if ( charCode == 72 ) { // H
                //     // console.log('CTRL+H');
                //     // preventDefault = true;
                // }
            }

            // if a combo has been managed
            // prevent other default behaviors
            if( preventDefault )
                event.preventDefault();

        };

        // bind keydown listener
        element.on('keydown', keyDownListener);

        // unbind keydown listener on microtask form destroy
        element.on('$destroy',function(){
            element.off('keydown',null,keyDownListener);
        });
    };
});

/////////////////////////
// MICROTASKS SERVICE  //
/////////////////////////
angular
    .module('crowdCode')
    .factory('microtasksService', ['$window','$rootScope','$http','$q', '$firebaseObject', 'firebaseUrl', 'userService', function($window,$rootScope,$http,$q,$firebaseObject,firebaseUrl,userService) {

	// Private variables
	var microtasks;
	var service = new function(){

		this.get = get;
		this.load = load;
		this.submit = submit;
		this.fetch = fetch;
		this.fetchSpecificMicrotask = fetchSpecificMicrotask;

		// Public functions
		function get (id, type){
      var microtaskRef = firebase.database().ref().child('Projects').child(projectId).child('microtasks').child(type).child(id);
			var microtask = $firebaseObject(microtaskRef);
			return microtask;
		}

		function submit (microtask, formData, autoSkip, autoFetch){
			var deferred = $q.defer();

			var skip = formData === undefined ? 'true' : 'false' ;
			autoFetch = (autoFetch ? 'true' : 'false');
			var disablePoint = autoSkip ? 'true':'false';

			// submit to the server
			$http.post('/api/v1/' + $rootScope.projectId + '/ajax/enqueue?type=' + microtask.type + '&key=' + microtask.$id+ '&skip=' + skip + '&disablepoint=' + disablePoint+ '&autoFetch=' + autoFetch, formData)
				.success(function(data, status, headers, config) {
					if( data !== "success" )
						deferred.reject();
					else
						deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});

			return deferred.promise;
		}

		function fetch (){
			var deferred = $q.defer();

			// ask the microtask id
			$http.get('/api/v1/' + projectId + '/ajax/fetch')
				.success(function(data, status, headers, config) {
					if( data.microtaskKey === undefined )
						deferred.reject();
					else
						deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});

			return deferred.promise;
		}


		function fetchSpecificMicrotask(microtaskId){
			var deferred = $q.defer();

			$http
				.get('/api/v1/' + projectId + '/ajax/pickMicrotask?id='+ microtaskId)
				.success(function(data, status, headers, config) {
					if( data.microtaskKey === undefined )
						deferred.reject();
					else
						deferred.resolve(data);
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});

			return deferred.promise;
		}

		function load(fetchData){
			if( fetchData.microtaskKey !== undefined ) {
				var microtask = fetchData.object;
        microtask.type = fetchData.type;
        microtask.$id = fetchData.microtaskKey;
        microtask.fetch_time = fetchData.fetch_time;
        $rootScope.$broadcast('microtaskLoaded',microtask);
        // get(fetchData.microtaskKey);
				// microtask.$loaded().then(function() {
				// 	$rootScope.$broadcast('microtaskLoaded',microtask, fetchData.firstFetch);
				// });
			}
		}



	}

	return service;
}]);

///////////////////////////////
//  NO MICROTASK CONTROLLER //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('NoMicrotaskController', ['$scope', '$rootScope',  'firebaseUrl', '$firebaseArray', 'avatarFactory','workerId', function($scope, $rootScope,  firebaseUrl,$firebaseArray, avatarFactory, workerId) {


	$scope.avatar = avatarFactory.get;
	// create the reference and the sync
  var leadersRef = firebase.database().ref().child('Projects').child(projectId).child('leaderboard').child('leaders');
	$scope.leaders = $firebaseArray(leadersRef);
	$scope.leaders.$loaded().then(function() {});


}]);



///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReviewController', ['$scope', '$rootScope',  '$alert',  '$modal', 'functionsService',  'functionUtils' , 'Function', 'AdtService', 'microtasksService', "testsService",
    function($scope, $rootScope,  $alert, $modal, functionsService, functionUtils, Function, AdtService, microtasksService, testsService) {
    // scope variables
    $scope.review = {};
    $scope.review.template = 'loading';
    $scope.review.text = "";
    $scope.review.inDispute = false;


    //load the microtask to review
    var reviewed = microtasksService.get($scope.microtask.reference_id, "implementation");
    reviewed.$loaded().then(function() {
        $scope.reviewed = reviewed;
        var submission = reviewed.submission;
        reviewed.type = 'DescribeFunctionBehavior';

        if ( reviewed.type == 'DescribeFunctionBehavior') {

            $scope.data = {};
            $scope.data.selected = -1;
            $scope.data.funct = new Function( submission['function'] );
            $scope.data.newCode = $scope.data.funct.getFullCode();
            $scope.data.oldCode = $scope.funct.getFullCode();
            if( submission.disputeFunctionText.length > 0 || submission.disputedTests){
                $scope.review.template    = 'describe_dispute';
                $scope.review.fromDispute = true;
                $scope.data.disputeText = submission.disputeFunctionText;
                var loadedFunct = functionsService.get( reviewed.functionId );
                if(submission.disputedTests) {
                  $scope.data.disputedTests = submission.disputedTests
                      .map(function(test){
                          var testObj = testsService.get(test.id);
                          // loadedFunct.getTestById(test.id);
                          testObj.disputeText = test.disputeText;
                          return testObj;
                  });
                }
            }
            else {
                $scope.review.template = 'describe';
                $scope.data.tests = angular.copy(submission.tests);
                $scope.data.isComplete = reviewed.isFunctionComplete;
                // get the stats of the edits
                $scope.data.stats = { added: 0, edited: 0, deleted: 0 };
                $scope.data.tests.map(function(test){
                    // retrieve the old version
                    if( test.edited ){

                    }

                    // increment the stats
                    if( test.added )      $scope.data.stats.added++;
                    else if( test.edited ) $scope.data.stats.edited++;
                    else if( test.deleted ) $scope.data.stats.deleted++;
                });

                // sort them in added < edited < deleted
                $scope.data.tests.sort(function(a,b){
                    if( a.added && !b.added ) return -1;
                    if( !a.added && b.added ) return 1;

                    if( a.edited && !b.edited ) return -1;
                    if( !a.edited && b.edited ) return 1;

                    if( a.deleted && !b.deleted ) return -1;
                    if( !a.deleted && b.deleted ) return 1;

                    return 0;
                });
            }

            functionsService
                .getVersion( reviewed.functionId, submission.functionVersion )
                .then(function( functObj ){
                    $scope.data.fDescription = functObj.getSignature();
                });

        }
        else if (reviewed.type == 'ImplementBehavior') {
            $scope.data = {};
            $scope.data.selected = -1;
            $scope.data.funct = new Function( submission['function'] );

            $scope.review.template    = 'implement';

            $scope.data.newCode = $scope.data.funct.getFullCode();
            $scope.data.oldCode = $scope.funct.getFullCode();

            if( submission.disputedTests ){
                $scope.review.template += "_dispute";
                var loadedFunct = functionsService.get( reviewed.functionId );
                $scope.data.disputedTests = submission.disputedTests
                    .map(function(test){
                        var testObj = loadedFunct.getTestById(test.id);
                        testObj.disputeText = test.disputeText;
                        return testObj;
                    });
            }
        }
    });


    $scope.accept = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(5);
    };
    $scope.reject = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(1);
    };
    $scope.reissue = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(3);
    };


    $scope.taskData.collectFormData = collectFormData;

    function collectFormData(form) {


        if( form.$invalid ){
            $modal({template : 'microtasks/modal_form_comments.html' , show: true});
            return;
        }


        var formData = {
            reviewText              : ($scope.review.text === undefined ? "" : $scope.review.text ),
            qualityScore            : $scope.review.rating,
            fromDisputedMicrotask   : $scope.review.fromDispute
        };

        return formData;

    }

}]);

angular
    .module('crowdCode')
    .directive('microtaskPopover', function($timeout, $rootScope, $popover, microtasksService, functionsService,FunctionFactory, TestList){
    return {
        
        scope: true,
        controller: function($scope, $element, $attrs, $transclude) {

            var loadData = {
                'WriteFunction': function(news) {

                    if(news.microtask.submission.inDispute)
                        news.funct=functionsService.get(news.microtask.functionID);
                    else
                        news.funct = new FunctionFactory(news.microtask.submission);
                    
                    if (news.microtask.promptType == 'REMOVE_CALLEE')
                        news.callee=functionsService.get(news.microtask.calleeId);

                    if (news.microtask.promptType == 'DESCRIPTION_CHANGE') {
                        oldCode = news.microtask.oldFullDescription.split("\n");
                        newCode = news.microtask.newFullDescription.split("\n");
                        diffRes = diff(oldCode, newCode);
                        diffCode = "";
                        angular.forEach(diffRes, function(diffRow) {
                            if (diffRow[0] == "=") {
                                diffCode += diffRow[1].join("\n");
                            } else {
                                for (var i = 0; i < diffRow[1].length; i++)
                                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
                            }
                            diffCode += "\n";
                        });
                        news.calledDiffCode = diffCode;
                    }

                },

                'WriteTestCases': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },

                'ReuseSearch': function(news) {

                    news.funct = functionsService.get(news.microtask.functionID);
                    if(news.microtask.submission.noFunction===false)
                    news.calleeFunction = functionsService.get(news.microtask.submission.functionId);


                },
                'WriteTest': function(news) {

                    news.testcases = news.microtask.submission.testCases;

                    var functionUnderTest = functionsService.getVersion(news.microtask.functionID, news.microtask.submission.functionVersion);

                    functionUnderTest.$loaded().then(function(){
                        news.funct = new FunctionFactory(functionUnderTest);
                    });
                },
                'WriteFunctionDescription': function(news) {
                    news.functionDescription = new FunctionFactory(news.microtask.submission).getSignature();
                    news.requestingFunction  = functionsService.get(news.microtask.functionID);
                },
                'WriteCall': function(news) {

                    news.funct = new FunctionFactory(news.microtask.submission);
                    news.calleeFunction = functionsService.get(news.microtask.calleeID);
                },
                'DebugTestFailure': function(news) {
                   news.funct = new FunctionFactory(news.microtask.submission.functionDTO);
                   var reviewTest;
                   news.tests=[];
                   if(news.microtask.submission.disputedTests!==undefined && news.microtask.submission.disputedTests.length>0){
                        for(var index in news.microtask.submission.disputedTests){
                            reviewTest=TestList.get(news.microtask.submission.disputedTests[index].id);
                            reviewTest.disputeText = news.microtask.submission.disputedTests[index].disputeText;
                            news.tests.push(reviewTest);
                        }
                   }

                },
                'Review': function(news) {

                    news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
                    news.microtask.$loaded().then(function() {

                        loadData[news.microtask.type](news);

                    });
                }

            };

            //Utility to show and hide the popover
            var showPopover = function(popover) {
              popover.$promise.then(popover.show);
            };
            var hidePopover = function(popover) {
              popover.$promise.then(popover.hide);
            };
         

            //
            $scope.showMicrotaskPopover = function(news) {

                if($scope.$parent.popover[news.microtaskKey]===undefined){
                    //Hide all the popover if any is visualized
                    
                    for(var key in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[key]);
                    }
                    $scope.$parent.popover[news.microtaskKey] = $popover($element, {template : "newsfeed/news_popover.html", placement:"right-bottom", trigger : "manual", autoClose: "false", container: "body"   });
                    $scope.$parent.popover[news.microtaskKey].$scope.n=news;
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                    //load the data
                    news.microtask = microtasksService.get(news.microtaskKey);
                    news.microtask.$loaded().then(function() {
                        //if the microtask is a review
                        if (news.microtask.type == "Review") {
                            news.isReview = true;
                            console.log(news.microtask);
                            news.qualityScore = news.microtask.submission.qualityScore;
                            news.reviewText = news.microtask.submission.reviewText;
                        } else if (angular.isDefined(news.microtask.review)) {

                            news.qualityScore = news.microtask.review.qualityScore;
                            news.reviewText = news.microtask.review.reviewText;
                        }
                        loadData[news.microtask.type](news);
                    });

                } else if($scope.$parent.popover[news.microtaskKey].$isShown === false){

                    //Hide all the popover if any is visualized
                    for(var index in $scope.$parent.popover)
                    {
                        hidePopover( $scope.$parent.popover[index]);
                    }
                    showPopover($scope.$parent.popover[news.microtaskKey]);
                }


            };
        },
          link: function($scope, iElm, iAttrs, controller) {

        }
    };
});

angular
    .module('crowdCode')
    .directive('newsDetail', function(newsfeedService,functionsService,Function,microtasksService){
    return {
        templateUrl: "newsfeed/news_detail.html",
        restrict:"EA",
        scope: {
            newObj: "=newsDetail"
        },
        link: function($scope, iElm, iAttrs) {
            console.log('NEWOBJ',$scope.newObj);

            $scope.challengeText='';
            $scope.challengeReview=challengeReview;

            $scope.data = {};
            var type = $scope.newObj.microtaskType === 'DescribeFunctionBehavior' ? 'implementation' : 'review';
            var microtask = microtasksService.get($scope.newObj.microtaskKey, type);
            microtask.$loaded().then(function() {
                $scope.data = loadMicrotaskData(microtask);
                console.log("Newsfeed data", $scope.data);
            });

            function loadMicrotaskData(microtask){

                console.log('loading data for ',microtask);

                var data = {};

                data.templateUrl = microtask.type;
                data.type       = microtask.type;
                data.promptType = microtask.promptType;

                //if the microtask is a review
                if ( microtask.type == "Review") {
                    data.isReview  = true;
                    data.review = {
                        score : microtask.submission.qualityScore,
                        text  : microtask.submission.reviewText
                    };
                } else if (angular.isDefined( microtask.review )) {
                    data.reviewKey = microtask.review.reviewKey;
                    data.review = {
                        score : microtask.review.qualityScore,
                        text  : microtask.review.reviewText
                    };
                }

                data.functionName = microtask.functionName;

                switch(microtask.type){
                    case 'DescribeFunctionBehavior':

                        var submission = microtask.submission;
                        var newFunction = new Function(submission.function);
                        functionsService.getVersion(microtask.functionId, microtask.functionVersion).then(function( funct ){
                            data.oldCode = funct.getFullCode();
                            data.newCode = newFunction.getFullCode();
                        });
                        if( submission.disputedTests){
                            data.templateUrl += '_disputed';
                            data.openedTests = [];
                            data.functionParameters = funct.parameters;
                            data.functionReturnType = funct.returnType;
                            data.disputedTests = submission
                                .disputedTests
                                .map(function(test){
                                    var testObj = funct.getTestById(test.id);
                                    testObj.disputeText = test.disputeText;
                                    return testObj;
                                });
                        }

                        if( submission.disputeFunctionText.length > 0 ) {
                            data.disputeText = submission.disputeFunctionText;
                            data.templateUrl += '_disputed';
                        }
                        else {
                            data.tests       = angular.copy(submission.tests);
                            data.functionParameters = functionsService.get(microtask.functionId).parameters;
                            data.functionReturnType = functionsService.get(microtask.functionId).returnType;
                            data.openedTests = [];
                            data.isComplete  = microtask.isFunctionComplete;
                        }

                        break;

                    case 'ImplementBehavior':

                        var submission = microtask.submission;
                        var newFunction = new Function(submission.function);
                        var funct = functionsService.get(microtask.functionId);

                        data.newCode = newFunction.getFullCode();
                        data.oldCode = funct.getFullCode();

                        if( submission.disputedTests ){
                            data.templateUrl += '_disputed';
                            data.openedTests = [];
                            data.functionParameters = funct.parameters;
                            data.functionReturnType = funct.returnType;
                            data.disputedTests = submission
                                .disputedTests
                                .map(function(test){
                                    var testObj = funct.getTestById(test.id);
                                    testObj.disputeText = test.disputeText;
                                    return testObj;
                                });
                        }

                        break;

                    case 'Review':
                        data.reviewed = {};
                        var rev = microtasksService.get(microtask.reference_id, 'implementation');
                        rev.$loaded().then(function() {
                            data.reviewed = loadMicrotaskData(rev);
                            data.templateUrl = 'Review_' + data.reviewed.templateUrl;
                        });
                        break;

                    default:
                }
                return data;
            }

            function challengeReview(){
                var challengeDTO= { challengeText : $scope.challengeText };
                newsfeedService.challengeReview($scope.selectedNews.reviewKey, challengeDTO);
                $scope.challengeText='';
                $scope.setUiView('list');

            }
        }
    };
});

angular
    .module('crowdCode').directive('newsList',function($rootScope,$timeout,firebaseUrl, workerId, questionsService, functionsService, microtasksService){

	return {
		scope: false,
		restrict: "AEC",
		templateUrl: 'newsfeed/news_list.html',
		link: function($scope,$element,$attrs){
		}
	};
});
angular
    .module('crowdCode').directive('newsPanel',function($rootScope,$timeout,firebaseUrl, workerId, questionsService, functionsService, microtasksService, newsfeedService){
    	return {
		scope: {},
		templateUrl: 'newsfeed/news_panel.html',
		link: function($scope,$element,$attrs){
			$scope.view           = 'list';
			$scope.animation      = 'from-left';
			$scope.selectedNews   = null; 

			$scope.setUiView      = setUiView;
			$scope.setSelected    = setSelected;

			$scope.$on('showNews',  onShowNews );


			// bind the array to scope.leaders
			$scope.news = newsfeedService.get();

			function onShowNews( event, microtaskId ){
			    setSelected($scope.news.$getRecord(microtaskId));
			}
			function setSelected(news){
				$scope.selectedNews = news;
				setUiView('detail');
			}
			function setUiView(view){
				
				var prev = $scope.view;
				if( (prev == 'list' && view == 'detail') || (prev == 'detail' && view == 'list'))
					$scope.animation = 'from-right';
				else
					$scope.animation = 'from-left';
				$timeout(function(){ 
					$scope.view = view; 
					if( view == 'list' ) 
						$scope.selectedNews = null; 
				},200);
			}

			
			


		}
	};
});
/////////////////////////
//   NEWSFEED SERVICE   //
/////////////////////////
angular
    .module('crowdCode')
    .factory('newsfeedService', ['$window','$rootScope', '$http','$q','$firebaseArray', 'firebaseUrl', 'workerId', function($window, $rootScope,  $http, $q,$firebaseArray, firebaseUrl, workerId) {

	// Private variables
	var newsfeed;
	var service = new function(){

		this.get = get;
		this.init = init;
		this.challengeReview=challengeReview;

		// Function bodies
		function init()
		{
		    // hook from firebase all the functions declarations of the project
		   	var ref = firebase.database().ref().child('Projects').child(projectId).child('workers').child(workerId).child('newsfeed');
        //new Firebase(firebaseUrl + '/workers/' + workerId + '/newsfeed');
			newsfeed =$firebaseArray(ref);
			newsfeed.$loaded().then(function(){
				// tell the others that the newsfeed services is loaded
				$rootScope.$broadcast('serviceLoaded','newsfeed');
			});
		}

		function get (){
			return newsfeed;
		}

		function challengeReview(reviewKey, challengeText)
		{
			console.log(reviewKey);
			console.log(challengeText);
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/ajax/challengeReview?reviewKey=' + reviewKey, challengeText)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}
	}

	return service;
}]);



///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('notificationsService', [ '$rootScope',  'firebaseUrl', 'workerId', 'toaster', 'questionsService' , function( $rootScope,  firebaseUrl, workerId, toaster, questionsService) {

	var ref = firebase.database().ref().child('Projects').child(projectId).child('notifications').child(workerId);
  // new Firebase( firebaseUrl + '/notifications/' + workerId );

	var service = new function(){
		this.init = function(){
			ref.on('child_added',function(snap){
				var val = snap.val();
				if( val.read === undefined ) {
					var type = val.type;

					var toast = {
						type: 'info',
						body: 'body',
						clickHandler: function(){ },
						bodyOutputType: 'trustedHtml',
						timeout: 3000
					};

					switch( type ) {
                        case 'question.added':
							toast.body = 'A new question has been asked <strong>' + val.data.title +'</strong>';
							toast.clickHandler = function () {
								$rootScope.$broadcast('setLeftBarTab', 'questions');
								$rootScope.$broadcast('showQuestion', val.data.questionId);
							};
							toaster.pop(toast);
							break;

						case 'answer.added':
							var workerId = val.data.workerId;
            				var path = firebase.database().ref().child('Workers').child(workerId);
            				path.once('value').then(function (worker) {
								toast.body = 'The worker <strong>'+worker.val().name+'</strong> has answered the question ';
								toast.clickHandler = function(){
									$rootScope.$broadcast('setLeftBarTab','questions');
									$rootScope.$broadcast('showQuestion', val.data.questionId );
								};
								questionsService.get( val.data.questionId ).then(function(q){
									if( q !== null ){
										toast.body += '<strong>'+q.title+'</strong>';
									}
									toaster.pop(toast);
								});
            				});
							break;

						case 'comment.added':
                            var workerId = val.data.workerId;
                            var path = firebase.database().ref().child('Workers').child(workerId);
                            path.once('value').then(function (worker) {
                                toast.body = 'The worker <strong>' + worker.val().name + '</strong> has commented the question ';
                                toast.clickHandler = function () {
                                    $rootScope.$broadcast('setLeftBarTab', 'questions');
                                    $rootScope.$broadcast('showQuestion', val.data.questionId);
                                };
                                questionsService.get(val.data.questionId).then(function (q) {
                                    if (q !== null) {
                                        toast.body += '<strong>' + q.title + '</strong>';
                                    }
                                    toaster.pop(toast);
                                });
                            });
							break;

						case 'task.accepted':
							toast.type = 'success';
							toast.body = 'Your work of '+val.data.microtaskType+' on the artifact '+val.data.artifactName+' has been accepted';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;

						case 'task.reissued':
							toast.type = 'error';
							toast.body = 'Your work of '+val.data.microtaskType+' on the artifact '+val.data.artifactName+' has been reissued';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						/*case 'challenge.inProgress':
							toast.type = 'danger';
							toast.body = 'Your work of '+val.microtaskType+' on the artifact '+val.artifactName+' has been challenged';
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						case 'challenge.lost':
							toast.type = 'error';
							toast.body = 'You lost the challenge on the '+val.microtaskType+' on the artifact '+val.artifactName;
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						case 'challenge.won':
							toast.type = 'success';
							toast.body = 'You won the challenge on the '+val.microtaskType+' on the artifact '+val.artifactName;
							toast.clickHandler = function(){
								$rootScope.$broadcast('setLeftBarTab','newsfeed');
								$rootScope.$broadcast('showNews', val.microtaskId );
							};
							toaster.pop( toast );
							break;
						case 'worker.levelup':
							toast.type = 'success';
							toast.body = 'Level up!\n'+val.prevLevel+'->'+val.currentLevel;
							toaster.pop( toast );
							break;
						case 'new.achievement':
							toast.type = 'success';
							toast.body = val.message + ' Congratulations!';
							toast.clickHandler = function(){
								$rootScope.$broadcast('showUserStatistics');
							};
							toaster.pop( toast );
							break;
						case 'dashboard':
							toast.type = 'success';
							toast.body = 'You unlocked the dashboard. Congratulations!';
							toast.clickHandler = function(){
								$rootScope.$broadcast('openDashboard');
							};
							toaster.pop( toast );
							break;
*/
						default:
					}

					snap.ref().update({'read':true});
				}
			});
		};
	};

	return service;
}]);

////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('projectService', ['$rootScope', '$firebaseObject', 'firebaseUrl', function($rootScope, $firebaseObject,firebaseUrl) {

        var service = new  function(){

            var project;

            this.init         = init;
            this.getAll       = getAll;
            this.getName      = getName;
            this.getDescription  = getDescription;

            function init(){
                projectRef = firebase.database().ref().child('Projects').child(projectId);
                project = $firebaseObject(projectRef);
                project.$loaded().then(function(){
                    // tell the others that the adts services is loaded
                    $rootScope.$broadcast('serviceLoaded','project');

                });
            }
            function getAll(){
                return project;
            }
            function getName(){
                return projectId;
            }
            function getDescription(){
                return project.description;
            }
        }

        return service;
    }]);

angular.module('crowdCode').directive('questionDetail',function($timeout,firebaseUrl,workerId,questionsService){
	return {
		scope: true,
		restrict: 'AEC',
		templateUrl: 'questions/questionDetail.html',
		link: function($scope,$element,$attrs){
			$scope.form = {};
			$scope.form.answer = {
				show: false,
				text: ''
			};
			$scope.form.comment = {
				show: false,
				answerId : null,
				text: ''
			};
			$scope.form.tag = {
				show: false,
				text: ''
			};

			$scope.workerId    = workerId;

			$scope.addTag    = addTag;
			$scope.removeTag = removeTag;


			$scope.postAnswer  = postAnswer;
			$scope.postComment = postComment;

			$scope.toggleClosed = toggleClosed;

			$scope.toggleVoteUp   = toggleVoteUp;
			$scope.toggleVoteDown = toggleVoteDown;



			function toggleClosed(questioning){
				if( questioning.closed !== undefined ){
					questionsService.setClosed(questioning.id, ! questioning.closed );
				}
			}

			function toggleVoteUp(questioning){
				var remove = false;
				if( questioning.votersId && questioning.votersId.indexOf(workerId) !==-1)
					remove = true;
				questionsService.vote($scope.sel.id,questioning.id,remove);
			}

			function toggleVoteDown(questioning){
				var remove = false;
				if( questioning.reportersId && questioning.reportersId.indexOf(workerId) !==-1)
					remove= true;
				questionsService.report($scope.sel.id,questioning.id,remove);
			}

			function addTag(){
				if( $scope.form.tag.text != '' ){
					questionsService.tag( $scope.sel.id, $scope.form.tag.text , false)
						.then(function(){ 
							$scope.form.tag = {
								show: false,
								text: ''
							};
							console.log('success');
						},function(){ 
							console.log('fail')
						});
				}
			}

			function removeTag(tag){
				questionsService.tag( $scope.sel.id, tag, true)
					.then(function(){ 
						console.log('success');
					},function(){ 
						console.log('fail')
					});
			}


			function postComment(answerId){
				if( $scope.form.comment.text != ''){
					var commentForm = { questionId : $scope.sel.id , answerId : answerId, text : $scope.form.comment.text };
					questionsService
						.submit("comment",commentForm)
						.then(function(){
							$scope.form.comment = {
								show: false,
								text: ''
							};
							$scope.updateView();
						},function(){
							console.log('error posting the comment');
						});
				}
			}

			function postAnswer(){
				if( $scope.form.answer.text != ''){
					var answerForm = { questionId : $scope.sel.id , text : $scope.form.answer.text };
					questionsService
						.submit("answer",answerForm)
						.then(function(){
							$scope.form.answer = {
								show: false,
								text: ''
							};
							$scope.updateView();
						},function(){
							console.log('error posting the answer');
						});
				}
			}
		}
	};
});
angular.module('crowdCode').directive('questionForm',function(firebaseUrl,workerId, questionsService){
	return {
		scope: true,
		restrict: 'AEC',
		templateUrl: 'questions/questionForm.html',
		controller: function($scope){

			// scope methods
			$scope.postQuestion = postQuestion;

			// initialize form fields
			resetForm();
			
			function resetForm(){
				if( $scope.sel == null ){
					$scope.question  = { id: 0, title: '', text: '', artifactId : false };
					$scope.tags      = [];
				} else {
					$scope.question = { 
						id: $scope.sel.id, 
						title: $scope.sel.title, 
						text: $scope.sel.text.replace(new RegExp('<br />', 'g'),'\n')
					};
					$scope.tags = [];
					if( $scope.sel.tags !== undefined )
						for( var t = 0; t < $scope.sel.tags.length; t++ )
							$scope.tags.push( { text: $scope.sel.tags[t] } );
						
				}
			}

			function postQuestion(){

				// prepare the tags for the submit 
				$scope.question.tags = [];
				for( var t = 0; t < $scope.tags.length; t++ ){
					$scope.question.tags.push( $scope.tags[t].text );
				}

				if( $scope.question.artifactId )
					$scope.question.artifactId = $scope.loadedArtifact.id;
				else
					$scope.question.artifactId = null;

				console.log($scope.question);

				questionsService
					.submit('question',angular.copy($scope.question))
					.then(function(){
						if( $scope.sel == null )
							$scope.setUiView('list');
						else 
							$scope.setUiView('detail');

						$scope.questionForm.$setPristine();
					},function(){
						console.log('error submitting the question')
					});
			}

		}
	};
});
angular
    .module('crowdCode')
    .filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    
    angular.forEach(items, function(item) {
      filtered.push(item);
    });

    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });

    if(reverse) 
      filtered.reverse();

    return filtered;
  };
});

    

angular
    .module('crowdCode')
    .filter('objectLength', function() {
  return function(items) {
    if(items)
      return Object.keys(items).length;
    else
      return 0;
  };
});

angular
    .module('crowdCode')
    .filter('relatedToArtifact', function() {
  return function(items,artifactId) {

    if( artifactId === undefined || artifactId === null )
      return [];

    function filterFunction(question){
      if( question.artifactsId != null && question.artifactsId.indexOf( ""+artifactId ) > -1 )
        return true;

      return false;
    }

    return items.filter( filterFunction );
  };
});   

angular
    .module('crowdCode')
    .filter('unrelatedToArtifact', function() {
  return function(items,artifactId) {
    
    if( artifactId === undefined || artifactId === null )
      return items;

    function filterFunction(question){
      if( question.artifactsId == null || question.artifactsId.indexOf( ""+artifactId ) == -1 )
        return true;

      return false;
    }

    return items.filter( filterFunction );
  };
});   


///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('questionsService', ['$window','$rootScope','$http', '$q','$firebaseArray','$firebaseObject', 'firebaseUrl','workerId', function( $window, $rootScope, $http, $q,$firebaseArray,$firebaseObject, firebaseUrl,workerId) {


	var service = new function(){
		// Private variables
		var questions;
		var allTags = [];
		var loaded = false;
		var firebaseRef = firebase.database().ref().child('Projects').child(projectId).child('questions');
    // new Firebase(firebaseUrl+'/questions');

		var idx = lunr(function(){
			this.ref('id');
			this.field('title'   ,{ boost: 10 });
			this.field('text'    ,{ boost: 10 });
			this.field('tags'    ,{ boost: 10 });
			this.field('answers' ,{ boost: 8 });
			this.field('comments',{ boost: 4 });
		});


		// Public functions
		this.init          = init;
		this.submit        = submit;
		this.vote          = vote;
		this.report        = report;
		this.tag           = tag;
		this.linkArtifact  = linkArtifact;
		this.setClosed     = setClosed;
		this.allTags       = allTags;
		this.searchResults = searchResults;
		this.getQuestions  = function(){return questions;};
		this.get 		   = getQuestion;

		this.addWorkerView = addWorkerView;
		this.setWorkerView = setWorkerView;

		function questionToDocument(question,key){
			var doc = {
				id      : key,
				title   : question.title,
				text    : question.text !== undefined ? question.text : '',
				tags    : question.tags !== undefined ? question.tags.join(', ') : '',
				answers : '',
				comments: ''
			};

			if( question.answers !== undefined ){
				for( var answerkey in question.answers){
					doc.answers += ' '+question.answers[answerkey].text;
					if( question.answers[answerkey].comments !== undefined ){
						for( var commentKey in question.answers[answerkey].comments)
							doc.comments += ' '+question.answers[answerkey].comments[commentKey].text;
					}
				}
			}
			return doc;
		}

		function searchResults( searchTxt ){
			var searchTxtToLower = searchTxt;
			var res = idx.search( searchTxtToLower );
            var qs = [];
			for( var r = 0; r < res.length ; r++ ){
				qs.push(questions.$getRecord(res[r].ref));
			}

			return qs;
		}

		function addToAllTags( tags ){
			if( tags === undefined )
				return;

			for( var t = 0; t < tags.length ; t++){
				if( allTags.indexOf( tags[t]) == -1 )
					allTags.push( tags[t]);
			}
		}

		function init(){
			questions = $firebaseArray(firebaseRef);
			questions.$loaded().then(function(){

				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','questions');

				for(var index in questions){
					if(questions[index].ownerId){
						var doc = questionToDocument( questions[index], questions[index].id );
						idx.add( doc );
						addToAllTags(questions[index].tags);
					}
				}

				questions.$watch(function(event){
					var q   = questions.$getRecord( event.key );
					var doc = questionToDocument( q, event.key );

					switch( event.event ){
						case 'child_added':
							idx.add( doc );
							addToAllTags(q.tags);
							break;
						case 'child_changed':
							idx.update( doc );
							break;
						case 'child_removed':
							idx.remove( doc );
							break;
						default:
					}
				});
			});


		}

		function getQuestion( questionId ){
			var deferred = $q.defer();
			questions.$loaded().then(function(){
				deferred.resolve( questions.$getRecord( questionId ) );
			});
			return deferred.promise;
		}

		function submit(type, formData){
			var deferred = $q.defer();
			var url = '';

			if( type != 'question' || formData.id == 0 )
				url = 'insert?workerId='+workerId+'&type=' + type;
			else
				url = 'update?workerId='+workerId+'&id=' + formData.id;

			// replace all the occurrences of the newline '\n' with the html <br>
			// TODO: check for other formatting syntax
			formData.text = formData.text.replace(new RegExp('\n', 'g'),'<br />');


			$http.post('/api/v1/' + $rootScope.projectId + '/questions/' + url , formData)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function tag(id, tag, remove){
			var deferred = $q.defer();
			$http.post('/api/v1/' + $rootScope.projectId + '/questions/tag?workerId='+workerId+'&id=' + id + '&tag='+tag+'&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function vote(questionId, id, remove){
			var deferred = $q.defer();
			$http.post('/api/v1/' + $rootScope.projectId + '/questions/vote?workerId='+workerId+'&questionId='+ questionId +'&id=' + id + '&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function report(questionId, id, remove){
			var deferred = $q.defer();
			$http.post('/api/v1/' + $rootScope.projectId + '/questions/report?workerId='+workerId+'&questionId='+ questionId +'&id=' + id + '&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function linkArtifact(id, artifactId, remove){
			var deferred = $q.defer();
			$http.post('/api/v1/' + $rootScope.projectId + '/questions/link?workerId='+workerId+'&id=' + id + '&artifactId='+artifactId+'&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function setClosed(id, closed){
			var deferred = $q.defer();
			$http.post('/api/v1/' + $rootScope.projectId + '/questions/close?workerId='+workerId+'&id=' + id + '&closed='+closed)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function setWorkerView(id,view){
			firebaseRef.child( id+'/views/'+workerId ).set( view );
		}

		function updateViewCounter(questionId){
			var viewsObj = $firebaseObject(new Firebase(firebaseUrl+'/questions/'+questionId));
			viewsObj.$loaded().then(function(){
			if(workerId != viewsObj.ownerId){
				if(viewsObj.viewCounter == undefined){
					viewsObj.viewCounter = 1;
				}
				else {
					viewsObj.viewCounter += 1;
					if(viewsObj.viewCounter == 15)
						sendQuestionViews(viewsObj.viewCounter);
				}
					viewsObj.$save();
			}
			});
		}

		function sendQuestionViews(views){
			$http.get('/api/v1/' + $rootScope.projectId + '/questionViews?workerId='+workerId+'&id='+ views)
			.success(function(data, status, headers, config) {
			})
			.error(function(data, status, headers, config) {

			});
		}

		function addWorkerView(id){
			var deferred = $q.defer();
			$http.post('/api/v1/' + $rootScope.projectId + '/questions/view?workerId='+workerId+'&id=' + id + '&closed='+closed)
				.success(function(data, status, headers, config) {
					updateViewCounter(id);
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					console.log('error');
					deferred.reject();
				});
			return deferred.promise;
		}
	};

	return service;
}]);

angular.module('crowdCode').directive('questionList',function($rootScope,$tooltip,$timeout,workerId,firebaseUrl, questionsService, microtasksService){
	return {
		scope: false,
		restrict: 'AEC',
		templateUrl: 'questions/questionsList.html',
		link: function($scope,$element,$attrs){

			var searchTimeout;

			$scope.search = [];
			$scope.sel = null;
			
			$scope.updateFilter = updateFilter;
			$scope.getFilterStr = getFilterStr;
			$scope.resetFilter = resetFilter;
			$scope.addToFilter = addToFilter;

			var filterBox = $('.searchbox');
			var tooltipTimeout = null;
			$scope.filterTooltip = $tooltip(filterBox, {trigger:'manual',placement:'bottom',title: 'Press enter to search'});
			$scope.showTooltip = function(){
				console.log('showing');
				$scope.filterTooltip.show();

				tooltipTimeout = $timeout(function(){ 
					$scope.filterTooltip.hide(); 
					$timeout.cancel(tooltipTimeout)
				},1000);
			}

			function getFilterStr(){
				var text = '';
				for( var i = 0; i < $scope.search.length; i++)
					text += ' ' + $scope.search[i].text;
				return text;
			}

			function updateFilter(){
				
				$scope.filterTooltip.hide();
				var text = getFilterStr();
		        searchTimeout = $timeout(function() {
		        	if( text == '' )
		        		$scope.questions = questionsService.getQuestions();
		        	else {
		        		$scope.questions = questionsService.searchResults( text );
		        	}
		        }, 250); // delay 250 ms
			}

			function resetFilter(){
				$scope.search = [];
				updateFilter();
			}

			function addToFilter( text ){
				var found = false;
				for( var i = 0; i < $scope.search.length; i++)
					if( !found && $scope.search[i].text == text ) 
						found = true;
				if( !found ){
					$scope.search.push({ text: text }); 
					updateFilter();
				}
			}


		}, 
		controller: function($scope){
			
		}
	};
});
angular
    .module('crowdCode').directive('questionsPanel',function($rootScope,$timeout,firebaseUrl, workerId, questionsService, functionsService, microtasksService){

	return {
		scope: {},
		templateUrl: 'questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			
			$scope.allTags        = [];
			$scope.view           = 'list';
			$scope.animation      = 'from-left';
			$scope.sel            = null;
			$scope.loadedArtifact = null;

			$scope.questions = questionsService.getQuestions();
			$scope.questions.$loaded().then(function(){
				$scope.allTags = questionsService.allTags;
			});

			$scope.setUiView       = setUiView;
			$scope.setSelected     = setSelected;
			$scope.updateView      = updateView;
			$scope.isRelated       = isRelatedToArtifact;
			$scope.toggleRelation  = toggleRelation;
			$scope.isUpdated       = isUpdated;
			$scope.getUpdateString = getUpdateString;

			$scope.$on('noMicrotask',   onMicrotaskLoaded ); 
			$scope.$on('microtaskLoaded', onMicrotaskLoaded );
			$scope.$on('showQuestion',  onShowQuestion );
			$scope.$on('askQuestion',   onAskQuestion );

			function onMicrotaskLoaded( event, microtask ){
				if( microtask === undefined )
					$scope.loadedArtifact = null 
				else				
					$scope.loadedArtifact = functionsService.get(microtask.functionID);
			}

			function onShowQuestion( event, questionId ){
				setSelected( $scope.questions.$getRecord(questionId) );
			}


			function onAskQuestion( event, questionId ){
				$scope.sel = null;
				setUiView('form');
			}

			function setUiView(view){
				var prev = $scope.view;
				if( (prev == 'list' && view == 'detail') || (prev == 'detail' && view == 'list'))
					$scope.animation = 'from-right';
				else 
					$scope.animation = 'from-left';

				
				$timeout(function(){ 
					$scope.view = view; 
					if( view == 'list' ) 
						$scope.sel = null; 
				},200);
			}

			function setSelected(q){
				$scope.sel = q;

				updateView();
				questionsService.addWorkerView(q.id);
				setUiView('detail');
			}

			function updateView(){
				if( $scope.sel === undefined ) return;

				var view = {
					at            : Date.now(),
					version       : $scope.sel.version,
					answersCount  : $scope.sel.answersCount,
					commentsCount : $scope.sel.commentsCount
				};
				questionsService.setWorkerView( $scope.sel.id, view );
			}

			function isUpdated(q){
				return q.views === undefined || q.views[ workerId ] === undefined || q.views[workerId].version < q.version; 
			}

			function getUpdateString(q){
				var diffAnswers, diffComments;

				if( q.views === undefined || q.views[ workerId ] === undefined  ){
					diffAnswers  = q.answersCount; 
					diffComments = q.commentsCount; 
				} else {
					var view = q.views[ workerId ];
					diffAnswers  = q.answersCount  - view.answersCount; 
					diffComments = q.commentsCount - view.commentsCount; 
				}
				
				var updates = [];
				if( diffAnswers > 0 )  updates.push( diffAnswers + ' new answer' + ( diffAnswers > 1 ? 's' : '' ) );
				if( diffComments > 0 ) updates.push( diffComments + ' new comment' + ( diffComments > 1 ? 's' : '' ) );

				return updates.length > 0 ? '('+updates.join(', ')+')' : '' ;
			}

			function isRelatedToArtifact(q){
				return q.artifactsId != null && $scope.loadedArtifact != null && q.artifactsId.indexOf( ''+$scope.loadedArtifact.id ) > -1 ; 
			}

			function toggleRelation(q){
				if( isRelatedToArtifact(q) ){
					questionsService
						.linkArtifact(q.id, $scope.loadedArtifact.id , true )
						.then(function(){
							console.log('success');
						},function(){
							console.log('error');
						});
				} else {
					questionsService
						.linkArtifact(q.id, $scope.loadedArtifact.id , false )
						.then(function(){
							console.log('success');
						},function(){
							console.log('error');
						});
				}
			}


		}
	};
});



angular
    .module('crowdCode')
    .factory('Test', [ function() {

	function Test(rec, functionName){
		if( rec === undefined || rec === null )
			return false;

    this.$id = rec.id + '';
    this.update(rec, functionName);
	}

	Test.prototype = {
    update: function(rec, functionName) {
      if(rec.isSimple)
  			rec.code = 'expect(' + functionName + '(' + rec.inputs.join(',') + ')).to.deep.equal(' + rec.output + ');';

  		angular.extend(this,rec);

  		this.inputs = [];
  		for( var key in rec.inputs ){
  			this.inputs.push(rec.inputs[key]);
  		}
    },
		getInputsKey: function(){
			return this.inputs.join(',');
		}
	};

	return Test;
}]);

////////////////////////
//TEST SERVICE   //
////////////////////////
angular
  .module('crowdCode')
  .factory('testsService', ['$rootScope', '$q', '$filter', '$firebaseObject', 'firebaseUrl', 'TestArray', 'Test', function($rootScope, $q, $filter, $firebaseObject, firebaseUrl, TestArray, Test) {

    var service = new function() {
      // Private variables
      var tests;

      // Public tests
      this.init = init;
      this.get = get;
      this.getVersion = getVersion;
      this.getAll = getAll;

      // Test bodies
      function init() {
        // hook from firebase all the tests declarations of the project
        var testRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('Tests');
        tests = new TestArray(testRef);
        tests.$loaded().then(function() {
          // tell the others that the tests services is loaded
          $rootScope.$broadcast('serviceLoaded', 'tests');
        });
      }

      // Get the test object, for the specified test id
      function get(id) {
        return tests.$getRecord(id);
      }

      function getAll() {
        return tests;
      }

      // Get the function object, in FunctionInFirebase format, for the specified function id
      function getVersion(id, version) {
        var deferred = $q.defer();
        var testRef = firebase.database().ref().child('Projects').child(projectId).child('history').child('artifacts').child('Tests').child(id).child(version);
        //new Firebase(firebaseUrl+ '/history/artifacts/tests/' + id+ '/' + version);
        var obj = $firebaseObject(testRef);
        obj.$loaded().then(function() {
          deferred.resolve(new Test(obj));
        });
        return deferred.promise;
      }

    };

    return service;
  }]);


angular
    .module('crowdCode')
    .factory("TestArray",['$firebaseArray','Test', TestArray ]);

function TestArray($firebaseArray, Test) {
	return $firebaseArray.$extend({
		$$added: function(snap, prevChild) {
      var test = snap.val();
			return new Test(test,test.functionName);
		},
		$$updated: function(snap) {
			return this.$getRecord(snap.key).update(snap.val());
		}
	});
}

angular
    .module('crowdCode')
    .directive('tutorial', function($rootScope,$compile) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: function(elem,attrs) {
           return attrs.templateUrl;
        },
        link: function($scope, $element, $attrs) {

            $scope.title = $scope.tutorialId;

            $scope.currentStep = 0;
            $scope.totSteps = $element.find('step').length;
            $scope.nextStep = nextStep;
            $scope.close    = close;

            console.log('TUTORIAL ID ',$scope.title);
            var btnNextHtml  = '<a href="#" class="btn-next" ng-click="showNext()">next</a>';
            var btnCloseHtml = $scope.isTutorialCompleted($scope.tutorialId) ? 
                                '<a href="#" class="btn-close" ng-click="close()">close</a>' : 
                                '';

            var $tutorialContainer;
            var $overlay;
            var $content;

            var onShow = '';
            var onHide = '';

            
            $scope.destroy = function() {

                // remove the tutorial from the document
                $overlay.remove();
                $content.remove();
                $tutorialContainer.remove();
                $overlay = null;
                $content = null;
                $tutorialContainer = null;
                $scope.currentStep = 0;

            };
        
            function open() {

                $tutorialContainer = $('<div class="tutorial-container"></div>');

                // create no-click layer
                $noclick = $('<div class="noclick"></div>');
                $tutorialContainer.append($noclick);

                // create highlight layer
                $overlay = $('<div class="overlay"></div>');
                $tutorialContainer.append($overlay);

                // create the content layer 
                $content = $('<div class="content"></div>');
                $content.fadeOut();
                $tutorialContainer.append($content);

                // compile the element with $scope
                $compile($tutorialContainer.contents())($scope);

                // append the element to the body
                $('body').append($tutorialContainer);

                // show the overlay 
                $overlay.animate({opacity: 1}, 50);

                // reset the current step
                $scope.currentStep = 0;

                // visualize the first step
                nextStep();
            }

            var prevOnHide;

            function close(){
                $scope.destroy();
                $scope.endTutorial();
            }

            function nextStep() {
               

                // increment current Step (first step is = 1)
                $scope.currentStep += 1;
                
                // if the tutorial is finished, destroy it
                if ($scope.currentStep > $scope.totSteps) {

                    $scope.$emit('tutorial-finished');
                    close();

                    return;
                }

                btnNextHtml  = '<a href="#" class="btn-next" ng-click="nextStep()">'+( $scope.currentStep == $scope.totSteps ? 'close' : 'next' )+'</a>';

                // retrieve the current step DOM-element
                // and the commands to apply on show/hide of the step content
                var $step  = $element.find('step:nth-child(' + $scope.currentStep + ')');
       
                var onShow = $step.attr('on-show') ;
                var onHide = $step.attr('on-hide') ;

                var contentStyle = $step.attr('style');
                var contentHtml  = $step.html();
                var highlight    = $step.attr('highlight');


                if( highlight !== undefined ){

                    var $highlightTag = $(document).find('#'+highlight);

                    if( $highlightTag.length === 0 ) {
                        nextStep();

                    } else {
                        
                        var placement = $step.attr('placement');

                        if( placement === undefined )
                            throw "a placement should be defined!";

                        if( onShow !== undefined && onShow.length > 0 ){
                            $rootScope.$eval(onShow);
                        } 

                        // calculate the hightlight css
                        var highlightCss = {
                            top    : $highlightTag.offset().top   ,
                            left   : $highlightTag.offset().left  ,
                            width  : $highlightTag.outerWidth()   ,
                            height : $highlightTag.outerHeight()
                        };

                        // calculate the content css
                        var contentCss = {
                            top  : highlightCss.top,
                            left : highlightCss.left
                        };

                        if( prevOnHide !== undefined && prevOnHide.length > 0 ) 
                            $rootScope.$eval(prevOnHide);

                        $content.fadeOut(400,function(){


                            $content.html(contentHtml + '<br/>' +btnNextHtml+btnCloseHtml);
                            $compile($content.contents())($scope);

                            $content.attr('style',contentStyle);

                            var width  = $content.outerWidth();
                            var height = $content.outerHeight();
                            var margin = 20;

                            if( placement == 'left' )        contentCss.left += -width - margin; 
                            else if( placement == 'right' )  contentCss.left += $highlightTag.outerWidth() +margin ; 
                            else if( placement == 'top' )    contentCss.top  += -height -margin ;
                            else if( placement == 'bottom' ) contentCss.top  += $highlightTag.outerHeight() +margin ;
                            else if( placement == 'top-center' )  {
                                contentCss.top  += -height -margin ;
                                if( $highlightTag.outerWidth() > width )
                                    contentCss.left += ($highlightTag.outerWidth()-width)/2;
                                else
                                    contentCss.left += -(width-$highlightTag.outerWidth())/2;

                            } else if( placement == 'top-left' )  {
                                contentCss.top  += -height - margin;
                                contentCss.left += -width;

                            } else if( placement == 'right-center' )  {
                                contentCss.left += $highlightTag.outerWidth() +margin ;
                                if( $highlightTag.outerHeight() > height )
                                    contentCss.top += ($highlightTag.outerHeight()-height)/2;
                                else
                                    contentCss.top += -(height-$highlightTag.outerHeight())/2;

                            }  

                            $content.css(contentCss);
                            $overlay.animate(highlightCss, 400, function(){
                                // $content.animate(contentCss, 200 ,function(){
                                    $content.fadeIn(300);
                                // });
                            });
                        });

                    }

                        
                    
                } else {

                    
                    // contentCss.width = '40%';

                    if( onShow !== undefined && onShow.length > 0 ) {
                        console.log('evaluating '+onShow);
                        $rootScope.$eval(onShow);
                    } 

                    $content.fadeOut(300,function(){
                        $content.html(
                            contentHtml + '<br/>' +btnNextHtml+
                            ( $scope.currentStep == $scope.totSteps ? '' : btnCloseHtml)
                        );

                        $compile($content.contents())($scope);

                        $content.attr('style',contentStyle);

                        var contentCss = {};
                        contentCss.top   = ($('body').outerHeight()-$content.outerHeight())/5;
                        contentCss.left  = ($('body').outerWidth()-$content.outerWidth())/2;

                        $content.css(contentCss);
                        $overlay.animate({
                            width: '0px',
                            height: '0px',
                            top: '-50px',
                            left: '-50px'
                        },200,function(){
                            $content.fadeIn(300);
                        });

                    });
                    
                }
                

                prevOnHide = onHide;

            }

            open();

        }
    };
});




angular
    .module('crowdCode')
    .directive('tutorialManager', [ '$rootScope', '$compile', '$timeout', '$firebaseObject',  'firebaseUrl','workerId','$http', function($rootScope, $compile, $timeout, $firebaseObject, firebaseUrl,workerId,$http) {

    // get the synced objects from the backend
    var tutorialsOn        = $firebaseObject(firebase.database().ref().child('Projects').child(projectId).child('status').child('settings').child('tutorials'));
    var completedTutorials = $firebaseObject(firebase.database().ref().child('Workers').child(workerId).child('completedTutorials'));
    var tutorialCounter    = $firebaseObject(firebase.database().ref().child('Workers').child(workerId).child('tutorialCounter'));


    var queue    = [];
    var running  = false;
    var currentId;
    var currentOnFinish;
    //tutorialCounter = 0;
    return {
        restrict: 'E',
        scope: {},
        link: function($scope, $element, attrs) {

            // listen for the queue tutorial event
            $rootScope.$on('queue-tutorial',queueTutorial);
            $scope.queueTutorial = queueTutorial;
            $scope.isTutorialCompleted = isTutorialCompleted;

            // expose the endTutorial method to the $scope
            // it is called when the tutorial is closed
            $scope.endTutorial = endTutorial;

            // if the tutorial is forced or if
            // is not completed, enqueue it
            function queueTutorial( event, tutorialId, force, onFinish, queueAfter ){
                console.log('queuing tutorial '+tutorialId);
                tutorialsOn.$loaded().then(function(){
                    completedTutorials.$loaded().then(function(){
                        if( force || ( tutorialsOn.$value && !isTutorialCompleted(tutorialId) )){
                            // queue tutorial
                            queue.push({
                                id       : tutorialId,
                                onFinish : queueAfter === undefined ?
                                           onFinish :
                                           function(){ queueTutorial(null,queueAfter,true); }
                            });
                            checkQueue();
                        }
                    });
                });
            }


            // if the tutorials queue is not empty,
            // start the first tutorial in queue
            function checkQueue(){

                if( !running && queue.length > 0 ){
                    var tutorial    = queue.pop();
                    currentId       = tutorial.id;
                    currentOnFinish = tutorial.onFinish;

                    $scope.tutorialId = currentId;
                    startTutorial();
                }
            }

            function sendTutorialsCompleted(){
    			$http.get('/' + projectId + '/ajax/tutorialCompleted')
    				.success(function(data, status, headers, config) {
    			})
    			.error(function(data, status, headers, config) {

    			});
    		}

            // start the current tutorial
            function startTutorial(){
                running = true;
                var templateUrl = 'tutorials/'+currentId+'.html';
                $element.html( '<tutorial template-url="'+templateUrl+'"></tutorial>' );
                $compile($element.contents())($scope);

                $rootScope.$broadcast('tutorial-started');
            }

            // end the current tutorial
            function endTutorial(){
                running = false;

                if( !isTutorialCompleted(currentId) )
                    setTutorialCompleted(currentId);

                $element.html( '' );

                if( currentOnFinish !== undefined ){
                    console.log('currentOnFinish');
                    currentOnFinish.apply();
                }

                currentId       = undefined;
                currentOnFinish = undefined;

                checkQueue();

                $rootScope.$broadcast('tutorial-finished');
            }

            // true if the tutorial with tutorialId is complete
            // false if not
            function isTutorialCompleted( tutorialId ){
                console.log(completedTutorials);
                if( completedTutorials.$value !== undefined && completedTutorials.$value !== null && completedTutorials.$value.search(tutorialId) > -1 )
                    return true;

                return false;
            }

            // set tutorial with tutorialId as complete
            function setTutorialCompleted( tutorialId ){
                if( completedTutorials.$value === undefined ){
                    completedTutorials.$value = tutorialId;
                    tutorialCounter.$value =  1;
                }
                else{
                    completedTutorials.$value += ','+tutorialId;
                    tutorialCounter.$value +=  1;
                }
                if(tutorialCounter.$value == 3)
                	sendTutorialsCompleted();
                console.log('saving in tutorials')
                tutorialCounter.$save();
                completedTutorials.$save();
            }
        }
    };
}]);

angular
    .module('crowdCode')
    .directive('leftBar', function($rootScope){

	return {
		templateUrl: 'ui_elements/left_bar_template.html',
		replace: true,
		link: function($scope, iElm, iAttrs) {
			$rootScope.selectedTab = 'newsfeed';
			$rootScope.selectTab = function(tabName){
				$scope.selectedTab = tabName;
			}
		}
	};
});
angular
    .module('crowdCode')
    .directive('leftBarButtons', function($rootScope){

	return {
		templateUrl: 'ui_elements/left_bar_buttons_template.html',
		replace: true,
		link: function($scope, iElm, iAttrs) {
		}
	};
});
angular
    .module('crowdCode')
    .directive('navBar', navBar); 

function navBar() {
    return {
    	replace: true,
        restrict: 'E',
        templateUrl: 'ui_elements/nav_bar_template.html'
    };
};



// VIEWS THE STATS
angular
    .module('crowdCode')
    .directive('projectStats', function($rootScope,firebaseUrl) {

    return {
        restrict: 'E',
        scope: true,
        template: '<b>Stats:</b>'
                  +'<span class="stats">'
                  +'<!--<span><span class="badge">{{microtaskCountObj.$value}}</span> microtasks</span>-->'
                  +'<span><span class="badge">{{functionsCount}}</span> functions</span>'
                  +'<span><span class="badge">{{testsCount}}</span> tests</span>'
                  +'<span><span class="badge">{{loc}}</span> loc</span>'
                  +'</span>',

        link: function($scope, $element) {

            var functionsRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('Functions');
            // new Firebase(firebaseUrl+'/artifacts/functions/');
            $scope.functionsCount = 0;
            functionsRef.on('child_added',function (snapshot){
                $scope.functionsCount ++;
            });

            $scope.loc = 0;
            functionsRef.on('value',function(snap){
                var functs = snap.val();
                $scope.loc = 0;
                angular.forEach(functs,function(val){
                    $scope.loc += val.linesOfCode;
                })
            });


        
            var testsRef = firebase.database().ref().child('Projects').child(projectId).child('artifacts').child('Tests');
            // new Firebase(firebaseUrl+'/artifacts/tests');
            $scope.testsCount = 0;
            testsRef.on('child_added',function(snapshot){
                $scope.testsCount ++;
            });

        }
    };
});

angular
    .module('crowdCode')
    .directive('rightBar', function($rootScope){

	return {
		templateUrl: 'ui_elements/right_bar_template.html', 
		replace: true,
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};
});


angular
    .module('crowdCode')
    .factory("avatarFactory",[ 'firebaseUrl','$firebaseObject', function( firebaseUrl, $firebaseObject ){

	var loaded = {};

	var factory = {};
	factory.get = function(workerId){
		if( workerId === undefined ){
			console.warn('worker id not defined');
			return -1;
		}
		if( workerId == 'admin' ){
			return {
				$value: '/img/avatar_gallery/admin.png'
			};
		}

		if(loaded.hasOwnProperty(workerId)){
			return loaded[workerId];
		} else {

			loaded[workerId] = $firebaseObject(firebase.database().ref().child('Workers').child(workerId).child('avatarUrl'));
			loaded[workerId].$loaded().then(function(){
				return loaded[workerId];
			});
		}
	};

	return factory;
}]);

////////////////////
// USER SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('userService', ['$window','$rootScope','$timeout','$interval','$http','$firebaseObject', 'firebaseUrl','functionsService','TestRunnerFactory', function($window,$rootScope,$timeout,$interval,$http,$firebaseObject, firebaseUrl,functionsService,TestRunnerFactory) {
    var user = {};

 	// retrieve the firebase references

 	// var fbRef = new Firebase(firebaseUrl);

	var userProfile    = firebase.database().ref().child('Workers').child(workerId);
  // fbRef.child('/workers/' + workerId);

	var isConnected    = firebase.database().ref().child('.info').child('connected');
  //new Firebase('https://crowdcode.firebaseio.com/.info/connected');
	var offsetRef 	   = firebase.database().ref().child('.info').child('serverTimeOffset');
  // new Firebase("https://crowdcode.firebaseio.com/.info/serverTimeOffset");

	var loginRef  = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedInWorkers').child(workerId);
  // fbRef.child('/status/loggedInWorkers/' + workerId);
	var logoutRef = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedOutWorkers').child(workerId);
  //fbRef.child('/status/loggedOutWorkers/'+ workerId);

	var updateLogInTime = function(){
		loginRef.setWithPriority({
			connected:true,
			name:workerHandle,
			timeStamp:Firebase.ServerValue.TIMESTAMP
		},Firebase.ServerValue.TIMESTAMP);
	};

	var timeZoneOffset;
	offsetRef.on("value", function(snap) { timeZoneOffset = snap.val(); });



	user.assignedMicrotaskKey = null;

	// when firebase is connected
	isConnected.on('value', function(snapshot) {
	  if (snapshot.val()) {
	  	// update user reference
	  	updateLogInTime();
	  	$interval(updateLogInTime,10000);

	    // on disconnect, set false to connection status
	    logoutRef.onDisconnect().set({workerId: workerId, timeStamp:Firebase.ServerValue.TIMESTAMP});
	    logoutRef.set(null);
	  }
	});


	user.data = $firebaseObject(userProfile);

	user.data.$loaded().then(function(){
		if( user.data.avatarUrl === null || user.data.avatarUrl === undefined ){
			var randomAvatar = (Math.floor(Math.random() * (16 - 1)) + 1);
			user.data.avatarUrl = '/img/avatar_gallery/avatar'+randomAvatar+'.png';
		}
		user.data.workerHandle = workerHandle;
		user.data.$save();
	});

	/*user.getFetchTime = function(){ return user.data.fetchTime; };

	user.setFirstFetchTime = function (){
		user.data.fetchTime = new Date().getTime();
		console.log('saving first fetch time')
		user.data.$save();
	};*/

	user.setAvatarUrl = function(url){
		user.data.avatarUrl = url;
		console.log('saving avatar url');
		user.data.$save().then(function(){
			console.log('set avatar url: '+url);
		});
	};



	// distributed test runner
    user.listenForJobs = function(){

		var queueRef = firebase.database().ref().child('Projects').child(projectId).child('status').child('testJobQueue');
    // new Firebase(firebaseUrl+ "/status/testJobQueue/");
		new DistributedWorker( $rootScope.workerId, queueRef, function(jobData, whenFinished) {
			console.log('Receiving job ',jobData);

			var jobRef = queueRef.child(jobData.functionId);
			//console.log(jobRef,jobData);
			jobRef.onDisconnect().set(jobData);

			var funct = functionsService.get( jobData.functionId+"" );
			console.log('loaded function', jobData.functionId,funct);
			var unsynced = false;

			// CHECK THE SYNC OF THE TESTSUITE VERSION
			if( !unsynced && funct.version != jobData.functionVersion ){
				unsynced = true;
			}

			// CHECK THE SYNC OF THE FUNCTION VERSION
			if( !unsynced && funct.version != jobData.functionVersion ){
				unsynced = true;
			}

			//if this job has be done more than 20 times force unsync to false so that the test can be executed
			if( parseInt(jobData.bounceCounter) > 20) {
				unsynced = false;
			}

			// if some of the data is out of sync
			// put back the job into the queue
			if( unsynced){
				$timeout(function(){
					jobData.bounceCounter = parseInt(jobData.bounceCounter) + 1;
					jobRef.set( jobData );
					jobRef.onDisconnect().cancel();
					whenFinished();
				},500);
			} else {
				var runner = new TestRunnerFactory.instance();
				var tests = angular.copy(funct.tests);

				runner.run(tests,funct.name,funct.getFullCode()).then(function(results){
					var ajaxData = {
						areTestsPassed: true,
						failedTestId: null,
						passedTestsId: []
					};

					results.tests.map(function(test){
						if( test.result.passed ){
							ajaxData.passedTestsId.push(test.id);
						}
						else if( ajaxData.failedTestId == null){
							ajaxData.areTestsPassed = false;
							ajaxData.failedTestId = test.id;
						}
					});

					$http.post('/' + $rootScope.projectId + '/ajax/testResult?functionId='+funct.id,ajaxData)
						.success(function(data, status, headers, config) {
							console.log("test result submit success",ajaxData);
							jobRef.onDisconnect().cancel();
							whenFinished();
						}).
					  	error(function(data, status, headers, config) {
					    	console.log("test result submit error");
					    	jobRef.onDisconnect().cancel();
							whenFinished();
						});
				});


			}
		});
	};

	// distributed worker logout
	// due to sincronization problem wait 5 seconds, after check that the user is not logged any more
	// checking that is null the value i the loggedIn worker
	// and then send the logout command to the server
	// distributed logout work
    user.listenForLogoutWorker = function(){
    	var logoutQueue     = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedOutWorkers');
      // new Firebase( firebaseUrl + '/status/loggedOutWorkers/');


		new DistributedWorker($rootScope.workerId,logoutQueue, function(jobData, whenFinished) {

			//retrieves the reference to the worker to log out
			var logoutWorker = logoutQueue.child(jobData.workerId);
			//if a disconnection occures during the process reeset the element in the queue
			logoutWorker.onDisconnect().set(jobData);

			var interval = $interval( timeoutCallBack, 10000);
			function timeoutCallBack(){
				//time of the client plus the timezone offset given by firebase
				var clientTime = new Date().getTime() + timeZoneOffset;
				//retrieves the information of the login field
				var userLoginRef  = firebase.database().ref().child('Projects').child(projectId).child('status').child('loggedInWorkers').child(jobData.workerId);
        // new Firebase( firebaseUrl + '/status/loggedInWorkers/' + jobData.workerId );
				userLoginRef.once("value", function(userLogin) {
					//if the user doesn't uddate the timer for more than 30 seconds than log it out
				  	if(userLogin.val()===null || clientTime - userLogin.val().timeStamp > 30000){
				  	/*	$http.post('/' + $rootScope.projectId + '/logout?workerid=' + jobData.workerId)
					  		.success(function(data, status, headers, config) {
					  			console.log("logged out seccessfully");
					  			userLoginRef.remove();
					  			$interval.cancel(interval);
					  			logoutWorker.onDisconnect().cancel();
					  			whenFinished();
					  		}); */
					 //if the timestamp of the login is more than the timesatmp of the logout means that the user logged in again
					 //so cancel the work
					} else if(userLogin.val()!==null && userLogin.val().timeStamp - jobData.timeStamp > 1000)
					{
						$interval.cancel(interval);
						logoutWorker.onDisconnect().cancel();
						whenFinished();
					}
				});
			}
		});
	};

    return user;
}]);


angular
    .module('crowdCode')
    .controller('UserProfileController', ['$scope', '$rootScope', '$timeout', 'fileUpload','userService', function($scope, $rootScope, $timeout, fileUpload, userService) {

	$scope.userData = userService.data;

	$scope.galleryPath = '/img/avatar_gallery/';

	$scope.uploadedAvatar  = null;
	$scope.selectedAvatar = -1;

	$scope.selectAvatar = function(number){
		////console.log('selecting avatar '+number);
		$scope.selectedAvatar = number;
	};

	$scope.saveAvatar = function() {
		////console.log('uploadedImage',$scope.uploadedAvatar);
		if( $scope.uploadedAvatar !== null){
			var file = $scope.uploadedAvatar;
			var uploadUrl = "/user/pictureChange";

			fileUpload.uploadFileToUrl(file, uploadUrl);

			$timeout(function() {
				userService.setAvatarUrl('/user/picture?userId=' + $rootScope.workerId + '&t=' + (new Date().getTime()));
			}, 500);
		} else if( $scope.selectedAvatar != -1 ){
			userService.setAvatarUrl($scope.galleryPath+'avatar'+$scope.selectedAvatar+'.png');
		}

	};


}]);
var fEditor;

angular
    .module('crowdCode')
    .directive('functionEditor', [ '$sce', 'functionsService', 'functionUtils', 'Function', function($sce, functionsService, functionUtils, Function) {
   

    var MAX_NEW_STATEMENTS = 2500;
    var statements = undefined;
    var initialStatements = undefined;
    var apiFunctions    = [];
    var requestedFunctions = {};

    return {
        restrict: 'EA',
        templateUrl: 'widgets/function_editor.html',
        scope: {
            editor : '=',
            'function' : '=', // the firebase function object extended in FunctionFactory
            logs: '=',
            callbacks: '='
        },

        controller: function($scope,$element){

            $scope.errors = '';
            $scope.code   = $scope.function.getFullCode();

        	$scope.aceLoaded = function(_editor) {

                fEditor = _editor;

                ace.require('ace/ext/crowdcode');

                var LogInfo = ace.require("ace/ext/crowdcode/log_info").LogInfo;
                var Range = ace.require("ace/range").Range;

                $scope.editor =  _editor;

                $scope.$watch('logs',function(logs){

                    if( _editor.logInfo !== undefined )
                        _editor.logInfo.destroy();

                    if( logs === undefined ){
                        return;
                    }                    

                    new LogInfo(_editor, logs, {
                        editStub : $scope.callbacks['onEditStub'] 
                    });
                });

                var options = {
                    enableFunctionAutocompleter: true
                };

                var sessionOptions  = {
                    useWorker: false,
                    useWrapMode: true
                };

                var rendererOptions = {
                    showGutter: true,
                    showFoldWidgets: false
                };

                _editor.setOptions(options);
                _editor.session.setOptions(sessionOptions);
                _editor.renderer.setOptions(rendererOptions);

            
                // editor event listeners
                _editor.on('change', onChange);
                // _editor.on('click' , onClick);
                // _editor.on('destroy',function(){});

                // element event listeners
                $element.on('focus', _editor.focus );
			};      

            function onChange(event,editor){

                if( $scope.callbacks && $scope.callbacks.onCodeChanged ){
                    $scope.callbacks.onCodeChanged.call(null);
                }
            
                var code = editor.getValue();
                var validationData = functionUtils.validate(code);   

                // the # of statements validator doesn't relly depends on the 
                // validation of the function code, so it's better to separate
                // it from the functionUtils.validate method
                if( validationData.statements ){
                    statements        = validationData.statements;
                    initialStatements = initialStatements || statements; 

                    if( statements - initialStatements > MAX_NEW_STATEMENTS ){
                        validationData.errors.push("You are not allowed to add more than "+MAX_NEW_STATEMENTS+" statements");
                    }

                    $scope.$emit('statements-updated', statements - initialStatements, MAX_NEW_STATEMENTS );
                } 

                $scope.errors = validationData.errors;
                    
                loadFunctionsList(editor, validationData.requestedFunctions);

                if ( $scope.errors.length == 0 ){
                    if( $scope.callbacks && $scope.callbacks.onFunctionParsed ){
                        $scope.callbacks.onFunctionParsed.call(null,validationData.dto, validationData.requestedFunctions);
                    }
                } 

            }

            function loadApiFunctionsList(){
                functionsService.getAll().$loaded().then(function(){
                    // first of the API functions
                    var functs = functionsService.getAll();
                    functs.map(function( fun ){
                        var paramsString = fun.parameters
                            .map(function(par,idx){ 
                                return '${'+(idx+1)+':'+par.name+'}'; 
                            })
                            .join(',');

                        apiFunctions.push({ 
                            name        : fun.name, 
                            meta        : 'API', 
                            className   : 'functions_api',
                            description : fun.getFullDescription(),
                            snippet     : fun.name + '(' + paramsString + ')'
                        });
                    });
                });
            }

            function loadFunctionsList(editor,newRequestedFunctions,rewrite){
                
                // initialize with api functions
                editor.functioncompleter.functions = apiFunctions.slice();

                // after of the requested, if any
                newRequestedFunctions = newRequestedFunctions || [];
                newRequestedFunctions.map(function( requestedDto ){

                    var requested = new Function(requestedDto);

                    var paramsString = requested
                        .parameters
                        .map(function(par,idx){ 
                            return '${'+(idx+1)+':'+par.name+'}'; 
                        })
                        .join(',');

                    var functRec = { 
                        name        : requested.name, 
                        meta        : 'PSEUDO', 
                        className   : 'functions_api',
                        description : requested.getFullDescription(),
                        snippet     : requested.name + '(' + paramsString + ')'
                    };


                    editor.functioncompleter.functions.push(functRec);
                    
                    
                });
                


                
            }


            function makeDescriptionReadOnly(ast,editor){
                if( ast.body[0] === undefined )
                    return;

                var intersects = function(range){ return editor.getSelectionRange().intersects(range); };

                var start = ast.body[0].body.loc.start;
                var Range = ace.require("ace/range").Range;
                var range = new Range( 0, 0, start.line-1, start.column+1);
                editor.keyBinding.setKeyboardHandler({
                    handleKeyboard : function(editor, hash, keyString, keyCode, event) {
                        // if in the readonly range, allow only arrow keys
                        if ( intersects(range) ) { 
                            if ( ['up','down','left','right'].indexOf(keyString) > -1 ){
                                return false;
                            }
                            return {command:"null", passEvent:false}; 
                        }
                    }
                });
            }   
        }
    };

}]);
angular
    .module('crowdCode')
    .directive('jsReader',function($compile,functionsService) {

    function calculateDiff(oldCode,newCode){

        oldCode = oldCode.split('\n');
        newCode = newCode.split('\n');

        var diffRes = diff(oldCode, newCode);
        var diffCode = "";
        angular.forEach(diffRes, function(diffRow) {
            if (diffRow[0] == "=") {
                diffCode += diffRow[1].join("\n");
            } else {
                for (var i = 0; i < diffRow[1].length; i++)
                    diffCode += diffRow[0] + diffRow[1][i] + "\n";
            }
            diffCode += "\n";
        });
        return diffCode;
    }

    return {
        restrict: 'EA',
        replace: true,
        template: '<div class="ace-editor js-reader" ui-ace="{ onLoad : aceLoaded, mode : mode, theme: theme, showGutter: false, useWrapMode : true}" readonly="true" ng-model="code"></div>',
        scope: {
            code: '=',
            oldCode: '=',
            mode: '@',
            highlight: '=',
        },
        controller: function($scope,$element){

            if($scope.mode===undefined){
                $scope.mode='javascript';
                $scope.theme='xcode';
            }
            else
                $scope.theme='github';

            if( $scope.mode == 'diff' && $scope.oldCode != undefined ){
                $scope.code = calculateDiff($scope.oldCode,$scope.code);
            }

            $scope.$watch('oldCode', function() {
              if( $scope.mode == 'diff' && $scope.oldCode != undefined ){
                  $scope.code = calculateDiff($scope.oldCode,$scope.code);
              }
            });

            $scope.aceLoaded = function(_editor) {
                _editor.setOptions({
                    maxLines: Infinity,
                    useWorker:false
                });
                var marker = [];
                _editor.on('change',function(){
                    if( $scope.highlight !== undefined ){
                        angular.forEach($scope.highlight,function(val){
                            if( marker[val.needle] !== undefined ){
                                _editor.getSession().removeMarker(marker[val.needle]);
                                marker[val.needle] == undefined;
                            }
                            var Range = ace.require("ace/range").Range;

                            var conf   = { regex: val.regex || false };
                            var needle = conf.regex ? new RegExp(val.needle) : val.needle;
                            var range = _editor.find(needle,conf);
                           // console.log('Needle',val.needle,range);
                            if( range !== undefined ){
                                marker[val.needle] = _editor.getSession().addMarker(range,'ace_pseudo_call','text',true);
                                // console.log('added marker for  '+val.needle, range, marker);
                               // console.log(_editor.getSession().getMarkers());
                            }

                        });
                    }
                });

            };
        }
    };
});

angular
    .module('crowdCode')
    .directive('jsonDiffReader', function() {

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

    return {
        restrict: 'EA',
        template: '<pre class="json diff" ng-bind-html="diffHtml"></pre>\n',
        scope: {
            old: '=',
            new: '='
        },
        link: function ( scope, iElement, iAttrs, ngModel ) {

            var unwatch = scope.$watch('[old,new]',function(){

                if( scope.old != undefined && scope.new != undefined){
                    

                    var oldObj,newObj;

                    // try to parse the old and new value to a JSON object
                    // if the conversion fails,  simply add quotes
                    oldObj = scope.old;
                    newObj = scope.new;//safeJsonParse( scope.new );

                    // initialize the diff result
                    var diffHtml = '';

                       // console.log('old/new',oldObj,newObj);

                    // if one of the two obj is null or
                    // if one of the two obj is undefined
                    // if the constructor is different
                    // if the oldObj is a number 
                    if( oldObj === null || newObj === null || 
                        oldObj === undefined || newObj === undefined || 
                        oldObj.constructor != newObj.constructor || 
                        typeof oldObj == 'number' ||
                        typeof oldObj == 'boolean'){

                        if( typeof(oldObj) == 'object' )
                            diffHtml += joinLines( angular.toJson(oldObj, true) , 'line added', 0);
                        else if ( typeof(oldObj) == 'string' )
                            diffHtml += joinLines( '"'+oldObj+'"', 'line added', 0);     
                        else
                            diffHtml += joinLines( oldObj + '', 'line added', 0);           

                        if( typeof(newObj) == 'object' )
                            diffHtml += joinLines( angular.toJson(newObj, true) , 'line removed', 0);
                        else if ( typeof(newObj) == 'string' )
                            diffHtml += joinLines( '"'+newObj+'"', 'line removed', 0);     
                        else
                            diffHtml += joinLines( newObj + '', 'line removed', 0);                    

                        scope.diffHtml = diffHtml;
                    }
                    // if the type of new is an object/array
                    else {

                        //console.log('compare obj');

                        var oldFields = Object.keys(oldObj);
                        var newFields = Object.keys(newObj);

                        var sharedFields  = oldFields.filter(function(value){ return newFields.indexOf(value) != -1; });
                        var removedFields = oldFields.filter(function(value){ return newFields.indexOf(value) == -1; });
                        var addedFields   = newFields.filter(function(value){ return oldFields.indexOf(value) == -1; });

                        var isArray = newObj.constructor == Array;

                        for( var f = 0 ; f < removedFields.length ; f++ ){
                            var name = removedFields[f];
                            var text = angular.toJson( oldObj[name], true) + ',';
                            if( !isArray ) text = '"'+name+'" : ' + text;
                            diffHtml += joinLines( text, 'line added', 2) ;
                            diffHtml += '\n';
                        }

                        for( var f = 0 ; f < sharedFields.length ; f++ ){
                            var name = sharedFields[f];
                            var equal = deepCompare(oldObj[name],newObj[name]);

                            if( equal ){
                                var text = angular.toJson( oldObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line ', 2) ;
                            } else {
                                var text = angular.toJson( oldObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line added', 2) ;


                                var text = angular.toJson( newObj[name], true) + ',';
                                if( !isArray ) text = '"'+name+'" : ' + text;
                                diffHtml += joinLines( text, 'line removed', 2) ;
                            }

                            diffHtml += '\n';
                        }

                        for( var f = 0 ; f < addedFields.length ; f++ ){
                            var name = addedFields[f];
                            var text = angular.toJson( newObj[name], true) + ',';
                            if( !isArray ) text = '"'+name+'" : ' + text;
                            diffHtml += joinLines( text, 'line removed', 2) ;

                            diffHtml += '\n';
                        }

                        // pick the appropriate set of brackets for the final diff result
                        if( newObj.constructor == Array )  scope.diffHtml = '[\n'+diffHtml+']';
                        if( newObj.constructor == Object ) scope.diffHtml = '{\n'+diffHtml+'}';
                        
                    }

                }
            }, true );
        }
    };
});


angular
    .module('crowdCode')
    .directive('jsonEditor', ['$q','AdtUtils',function($q,AdtUtils) {
    var stringified = false;

    return {
        restrict: 'EA',

        templateUrl:'widgets/json_editor.html',
        scope: {
            conf: '=jsonEditor',
            ngModel: '=',
            errors: '='
        },
        require: "ngModel",
        link: function ( $scope, iElem, iAttrs, ngModelCtrl ) {

            var initialValue;
            $scope.errors = {};
            
            ngModelCtrl.$validators.code = function(modelValue, viewValue) {
                var stringValue    = modelValue || viewValue;

                if( !initialValue ) initialValue = stringValue;
                if( !ngModelCtrl.$dirty && initialValue != stringValue ){
                    ngModelCtrl.$setDirty();
                }

                var validationData = AdtUtils.validate(stringValue,$scope.conf.type,$scope.conf.name);  
                
                if( validationData.errors.length > 0 ){
                    $scope.errors.code = validationData.errors[ 0 ];
                    return false;
                }
                else {
                    $scope.errors.code = "";
                    return true;
                }
            };
        },

        controller: function($scope,$element){
            $scope.errors = [];
        	$scope.aceLoaded = function(_editor) {

        		var options = {
                    minLines: 2,
		    	    maxLines: Infinity,
                    showLineNumbers:true
		    	};
    
                $element.on('focus',function(){
                    _editor.focus();
                });

                _editor.setOptions(options);
                _editor.session.setOptions({useWorker: false});
                _editor.commands.removeCommand('indent');
			};
        }
    };
}]);



angular
    .module('crowdCode')
    .directive('jsonReader', function() {



    return {
        restrict: 'EA',
        template: '<pre class="json" ng-bind-html="prettyJson"></pre>\n<span ng-if="::copyAllowed" class="clip-copy" clip-copy="json">\n',
        require: "ngModel",
        scope: true,
        link: function ( scope, iElement, iAttrs, ngModel ) {
            if( !ngModel ) return;

            iElement.addClass('example')
            scope.copyAllowed = iAttrs.hasOwnProperty('copyAllowed') ? true : false;
            scope.json = scope.prettyJson = "";
            
            // update the UI to reflect the ngModel.$viewValue changes
            ngModel.$render = function (){
                if( ngModel.$viewValue == "") 
                    scope.prettyJson = "";
                else if ( ngModel.$viewValue === undefined || ngModel.$viewValue == "undefined" )
                    scope.prettyJson = "undefined";
                else if ((typeof(ngModel.$viewValue)=="number" && isNaN( ngModel.$viewValue)) || (typeof(ngModel.$viewValue)=="string") && ngModel.$viewValue=="NaN")
                    scope.prettyJson = "NaN";
                else {
                    scope.json = angular.toJson( eval('('+ngModel.$viewValue+')'), true) ;
                    scope.prettyJson = jsonSyntaxHighlight( scope.json );
                }
            };
        },
        controller: function($scope,$element){

        	$scope.aceLoaded = function(_editor) {
        		_editor.setOptions({
		    	     maxLines: Infinity
		    	});
			};
        }
    };
});


angular
    .module('crowdCode')
    .directive('pasteExample', ['$dropdown','AdtUtils','AdtService',function($dropdown,AdtUtils,AdtService) {

    	return {
    		require: 'ngModel',
    		restrict: 'AE',
    		scope: {
    			paramType: '@',
    			pasteExample: '='
    		},
    		link: function($scope,iElem,iAttrs,ngModelCtrl){
    			var param = AdtUtils.getNameAndSuffix($scope.pasteExample.type);
    			var adt   = AdtService.getByName(param.name);

	            var dropdown = $dropdown(iElem, { placement: 'bottom' });

	            dropdown.$scope.pasteExample = function(value){
	            	if(param.suffix.length == 0)
	            		ngModelCtrl.$setViewValue(value);
	            	else 
	            		ngModelCtrl.$setViewValue('['+value+']');

	            };

	            dropdown.$scope.content = [];
	            if( adt.examples ) {
	            	adt.examples.map(function(e){
		            	dropdown.$scope.content.push({
		            		text  : e.name,
		            		click : 'pasteExample(\''+e.value+'\')'
		            	});
	            	});
	            } else {
	            	dropdown.$scope.content.push({
	            		text: 'no examples',
	            		click : 'noop()'
	            	});
	            }

    		}
    	};


	}]);
angular
    .module('crowdCode')
    .directive('projectOutline', ['AdtService','functionsService', projectOutline]);

function projectOutline(AdtService, functionsService) {
    return {
        restrict: 'E',
        templateUrl: 'widgets/project_outline.template.html',
        controller: function($scope, $element) {


            $scope.functions = functionsService.getAll();
            $scope.dataTypes = AdtService.getAll();

            //console.log($scope.dataTypes);
            $scope.buildStructure = function(adt){
                var struct = '{';
                angular.forEach(adt.structure,function(field){
                    struct += '\n  '+field.name+': '+field.type;
                })
                struct += '\n}';
                return struct;
            };
        }
    };
}


angular
    .module('crowdCode')
    .directive('rating', ['$q',function($q) {

    // var chains = ['to','be','been','is','that','which','and','has','have','with','at','of','same'];
    // var methods = [ 'not','deep','any','all','a','include','ok','true','false','null','undefined','exists','empty','arguments','equal','above','least','below','most','within','instanceof','property','ownProperty','length','string','match','keys','throw','respondTo','itself','itself','satisfy','closeTo','members','change','increase','decrease'];
    
    return {
        restrict: 'EA',
        require: 'ngModel',
        templateUrl: 'widgets/rating.html',
        scope: {
        },
        link: function ( $scope, iElement, iAttrs, ngModelCtrl ) {


            $scope.data = {
                mouseOn: 0,
                value : -1
            }

            ngModelCtrl.$validators.required = function(modelValue,viewValue){
                return $scope.data.value != -1 ;
            };


            var max = 5;
            $scope.rate = function(value) {
                if (value >= 0 && value <= max) {
                    ngModelCtrl.$setDirty();
                    $scope.data.value = value;
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$commitViewValue();
                }
            };
        }
    };
}]);


angular
    .module('crowdCode')
    .directive('reminder', [ '$rootScope', '$compile', '$interval', '$modal','userService', function($rootScope, $compile, $interval, $modal, userService) {

    var microtaskInterval;

    var microtaskTimeout      =  25 * 60 * 1000; //in second
    var microtaskFirstWarning =  5  * 60 * 1000; //in second
    var timeInterval          = 500; //interval time in milliseconds

    var fetchTime = 0;
    var popupWarning;
    var microtaskType;
    var tutorialOpen=0;
    var popupHasBeenClosed = false;


    return {
        restrict: 'E',
        templateUrl : 'widgets/reminder.html',
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.microtaskFirstWarning = microtaskFirstWarning;
            $scope.microtaskTimeout      = microtaskTimeout;

            // initialize the warning popup
            popupWarning = $modal({template : 'widgets/popup_reminder.html' , show: false});

            $rootScope.$on('tutorial-started',function(){
                tutorialOpen++;
            });

            $rootScope.$on('tutorial-finished',function(){
                tutorialOpen--;
            });


            // listen on the event 'loadMicrotask'
            $rootScope.$on('microtaskLoaded', microtaskLoaded);
            $rootScope.$on('reset-reminder', resetReminder );

            function microtaskLoaded($event, microtask){
                /*if( firstFetch == '1')
                    userService.setFirstFetchTime();*/

                resetReminder();

                microtaskType      = microtask.type;
                popupHasBeenClosed = false;

                //actual time of the system in seconds
                startTime = new Date().getTime();
                //time when user fetched the microtask for the first time in milliseonds
                fetchTime = microtask.fetch_time;

                $scope.skipMicrotaskIn = fetchTime + microtaskTimeout - startTime ;
                microtaskInterval      = $interval(doReminder, timeInterval);


                console.log('REMINDER: microtask laoded ',{ fetchTime: fetchTime, startTime: startTime, diff: startTime-fetchTime},microtaskInterval);

            }

            function resetReminder(){
                console.log('REMINDER: timer reset');

                $scope.status = 'success' ;
                $interval.cancel(microtaskInterval);
                console.log('iterval',microtaskInterval);
                $scope.skipMicrotaskIn=undefined;
                popupWarning.$promise.then(popupWarning.hide);
            }

            function doReminder(){
                //if no tutorial are open
                if( tutorialOpen===0 ){
                    //update the remaining time both in the popup and in the progress bar
                    popupWarning.$scope.skipMicrotaskIn = $scope.skipMicrotaskIn -= timeInterval;

                    //if the popover is not open and the remaining time is less than first warning, show the popover
                    if( ! popupHasBeenClosed && $scope.skipMicrotaskIn < microtaskFirstWarning){
                        popupHasBeenClosed=true;
                        popupWarning.$promise.then(popupWarning.show);
                        $scope.status='warning';

                    }
                    else if( $scope.skipMicrotaskIn < microtaskFirstWarning / 2 &&
                             $scope.skipMicrotaskIn > 0 ){
                        $scope.status='danger';
                    }
                    //if the time is negative end the reminder and skip the microtask
                    else if($scope.skipMicrotaskIn < 0)
                        endReminder();
                }
            }

            function endReminder(){
                resetReminder();
                $scope.$emit('timeExpired');
            }

        }
    };
}]);


angular
    .module('crowdCode')
    .directive('statementsProgressBar',['$rootScope',function($rootScope) {
    return {
        templateUrl : 'widgets/statements_progress_bar.html',
        restrict: 'AE',
        link: function (scope, elm, attrs, ctrl) {
            scope.statements=0;
            scope.max=2500;
            scope.$on('statements-updated',function(event,statements,max){
                scope.statements=statements;
                scope.max=max;
            });
        }
    };
}]);


angular
    .module('crowdCode')
    .directive('testEditor', ['$q',function($q) {

    // var chains = ['to','be','been','is','that','which','and','has','have','with','at','of','same'];
    // var methods = [ 'not','deep','any','all','a','include','ok','true','false','null','undefined','exists','empty','arguments','equal','above','least','below','most','within','instanceof','property','ownProperty','length','string','match','keys','throw','respondTo','itself','itself','satisfy','closeTo','members','change','increase','decrease'];
    
    

    return {
        restrict: 'EA',
        require: '?ngModel',
        templateUrl: 'widgets/test_editor.html',
        scope: {
            ngModel: '=',
            errors: '='
        },
        link: function ( $scope, iElement, iAttrs, ngModelCtrl ) {
            var edited = -1 ;
            $scope.errors = {};

            var initialCode;
            var worker = new Worker('/clientDist/test_runner/testvalidator-worker.js');
            worker.postMessage({ 
                'baseUrl'     : document.location.origin, 
                'command'     : 'init',
                'functionName': iAttrs.functionName ? iAttrs.functionName : ''
            });

            ngModelCtrl.$asyncValidators.code = function(modelValue, viewValue) {


                var code = modelValue || viewValue;

                if( !initialCode ) initialCode = code;
                if( !ngModelCtrl.$dirty && initialCode != code ){
                    ngModelCtrl.$setDirty();
                }


                var deferred = $q.defer();

                setTimeout(function() {
                    
                    // validate the code 
                    // 1) JSHINT check the syntax errors
                    // 2) test validator web worker check the execution errors
                    var lintResult =  JSHINT(code, {latedef:false, camelcase:true, undef:false, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true, expr:true});
                    
                    if( !lintResult ){
                        $scope.errors.code = checkForErrors(JSHINT.errors)[0];
                        deferred.reject();
                    }
                    else {
                        $scope.errors.code = "";
                        worker.postMessage({ 
                            'code'        : code
                        });
                        worker.onmessage = function(message){
                            var data = message.data;
                            if( data.error.length > 0 ){
                                $scope.errors.code = message.data.error;
                                deferred.reject();
                            } else {
                                $scope.errors = {};
                                deferred.resolve();
                            }
                        };
                    }

                }, 200);

            
                // return the promise
                return deferred.promise;
            };

            
        },
        controller: function($scope,$element){
            $scope.aceLoaded = function(_editor) {

                var options = {
                   enableLiveAutocompletion: false,
                   enableBasicAutocompletion: true,
                   useWorker: false,
                   minLines: 4,
                   maxLines: Infinity
                   
                };

                _editor.setOptions(options);
                _editor.commands.removeCommand('indent');

                var myCompleter = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        callback(null,[
                            {name: 'deepEqual', value: 'expect().to.deep.equal()', snippet: 'expect(${1:expression}).to.deep.equal(${2:expectedValue});',score: 1 },
                            {name: 'property', value: 'expect().to.have.property()', snippet: 'expect(${1:expression}).to.have.property(${2:propertyName});',score: 1 },
                            {name: 'length', value: 'expect().to.have.lenght()', snippet: 'expect(${1:expression}).to.have.length(${2:length});',score: 1 },
                            {name: 'exception', value: 'expect().to.throw()', snippet: 'expect(${1:expression}).to.throw(${2:error});',score: 1 }

                        ]);
                    }
                };

                _editor.completers = [myCompleter];
            };
        	
        }
    };
}]);

angular
	.module('crowdCode')
	.directive('workerProfile', ['avatarFactory','iconFactory','firebaseUrl','$firebaseArray','$firebaseObject','workerId', workerProfile]);

function workerProfile(avatarFactory,iconFactory, firebaseUrl,$firebaseArray,$firebaseObject, workerId) {
  return {
    restrict: 'EA',
    scope:{workerProfile:"="},
    templateUrl: 'worker_profile/profile_panel.html',
    controller: function($scope) {
      $scope.workerName = "";
      $scope.hasAchievement = false;
      $scope.workerStats = [];
      $scope.listOfachievements = [];
      $scope.icon = iconFactory.get;
      $scope.currentId = 0;
      $scope.avatar  = avatarFactory.get;

      $scope.gotAchievement = function(){
    	  $scope.hasAchievement = true;
      }
    	var nameObj = $firebaseObject(firebase.database().ref().child('Projects').child(projectId).child('workers').child($scope.workerProfile).child('workerHandle'));
  	  nameObj.$loaded().then(function(){
  		  $scope.workerName = nameObj.$value;
  	  });

	   	$scope.workerStats = $firebaseArray(firebase.database().ref().child('Projects').child(projectId).child('workers').child($scope.workerProfile).child('microtaskHistory'));
  	  $scope.workerStats.$loaded().then(function(){
	    });

    	$scope.listOfachievements = $firebaseArray(firebase.database().ref().child('Projects').child(projectId).child('workers').child($scope.workerProfile).child('listOfAchievements'));
    	$scope.listOfachievements.$loaded().then(function(){
        console.log('list of achievements loaded');
    	});
    }
	}
}

angular.module('templates-main', ['achievements/achievements_panel.html', 'achievements/achievements_panel_old.html', 'chat/alert_chat.html', 'chat/chat_panel.html', 'functions/javascript_tutorial.html', 'leaderboard/leaderboard.template.html', 'microtasks/alert_submit.html', 'microtasks/challenge_review/challenge_review.html', 'microtasks/challenge_review/review_DebugTestFailure.html', 'microtasks/challenge_review/review_ReuseSearch.html', 'microtasks/challenge_review/review_WriteCall.html', 'microtasks/challenge_review/review_WriteFunction.html', 'microtasks/challenge_review/review_WriteFunctionDescription.html', 'microtasks/challenge_review/review_WriteTest.html', 'microtasks/challenge_review/review_WriteTestCases.html', 'microtasks/dashboard/dashboard.html', 'microtasks/dashboard/dashboard2.html', 'microtasks/debug_test_failure/debug_test_failure.html', 'microtasks/describe_behavior/describe_behavior.html', 'microtasks/implement_behavior/implement_behavior.html', 'microtasks/loading.html', 'microtasks/microtask_form.html', 'microtasks/microtask_title.html', 'microtasks/modal_form_comments.html', 'microtasks/modal_form_invalid.html', 'microtasks/modal_form_pristine.html', 'microtasks/no_microtask/no_microtask.html', 'microtasks/reissue_microtask.html', 'microtasks/review/review.html', 'microtasks/review/review_WriteFunction.html', 'microtasks/review/review_WriteTest.html', 'microtasks/review/review_describe.html', 'microtasks/review/review_describe_dispute.html', 'microtasks/review/review_form.html', 'microtasks/review/review_implement.html', 'microtasks/review/review_implement_dispute.html', 'microtasks/review/review_loading.html', 'newsfeed/news_detail.html', 'newsfeed/news_detail_DescribeFunctionBehavior.html', 'newsfeed/news_detail_DescribeFunctionBehavior_disputed.html', 'newsfeed/news_detail_ImplementBehavior.html', 'newsfeed/news_detail_ImplementBehavior_disputed.html', 'newsfeed/news_detail_Review.html', 'newsfeed/news_detail_Review_DescribeFunctionBehavior.html', 'newsfeed/news_detail_Review_DescribeFunctionBehavior_disputed.html', 'newsfeed/news_detail_Review_ImplementBehavior.html', 'newsfeed/news_detail_Review_ImplementBehavior_disputed.html', 'newsfeed/news_list.html', 'newsfeed/news_panel.html', 'newsfeed/news_popover.html', 'questions/questionDetail.html', 'questions/questionForm.html', 'questions/questionsList.html', 'questions/questionsPanel.html', 'tutorials/DescribeFunctionBehavior.html', 'tutorials/ImplementBehavior.html', 'tutorials/Review.html', 'tutorials/assertion_tests.html', 'tutorials/create_edit_test.html', 'tutorials/function_editor.html', 'tutorials/input_output_tests.html', 'tutorials/main.html', 'tutorials/review_describe.html', 'tutorials/running_tests.html', 'ui_elements/left_bar_buttons_template.html', 'ui_elements/left_bar_template.html', 'ui_elements/nav_bar_template.html', 'ui_elements/nav_user_menu_template.html', 'ui_elements/right_bar_template.html', 'widgets/confused.popover.html', 'widgets/description_popover.html', 'widgets/feedback.popover.html', 'widgets/function_editor.html', 'widgets/json_editor.html', 'widgets/popup_feedback.html', 'widgets/popup_reminder.html', 'widgets/popup_shortcuts.html', 'widgets/popup_template.html', 'widgets/popup_user_profile.html', 'widgets/project_outline.template.html', 'widgets/rating.html', 'widgets/reminder.html', 'widgets/statements_progress_bar.html', 'widgets/test_editor.html', 'widgets/test_editor_help.html', 'worker_profile/profile_panel.html', 'worker_profile/workerStatsModal.html']);

angular.module("achievements/achievements_panel.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("achievements/achievements_panel.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" ng-controller=\"userAchievements\">\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "			<div class=\"modal-header achievements\" style=\"height:60px\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<div><img class=\"avatar\" ng-src=\"{{ avatar(workerId).$value }}\" /></div>\n" +
    "				<div class=\"workerName\">Your Profile</div>				\n" +
    "			</div>\n" +
    "			<div id=\"achievementsPanel\" class=\"modal-body achievements\">\n" +
    "			<div>\n" +
    "				\n" +
    "				<div class=\"subTitle\" style=\"color: white\">History:</div>\n" +
    "						<div id=\"board\" >	\n" +
    "							<div id=\"columns\">						\n" +
    "						  		<div class=\"infohistory\" ng-repeat=\"(i,stat) in userStats | statsToShow | orderBy:'$id'\"  ng-if=\"userStats.length > 0 && stat.$value>0\" ng-switch on=\"stat.$id\">\n" +
    "								\n" +
    "								<div ng-switch-when=\"microtasks\">Microtasks: {{stat.$value}}</div>\n" +
    "								<div ng-switch-when=\"perfect_review\">Perfect Reviews (5 stars): {{stat.$value}}</div>\n" +
    "								<div ng-switch-when=\"good_review\">Good Reviews (4 stars): {{stat.$value}}</div>\n" +
    "								<div ng-switch-when=\"reviews\">Reviews: {{stat.$value}}</div>							\n" +
    "								<div ng-switch-when=\"describe_behavior\">Describe Behavior: {{stat.$value}}</div>								\n" +
    "								<div ng-switch-when=\"submits\">Submits (Consecutive): {{stat.$value}}</div>\n" +
    "								<div ng-switch-when=\"questions\">Questions: {{stat.$value}}</div>		\n" +
    "								<div ng-switch-when=\"answers\">Answers: {{stat.$value}}</div>		\n" +
    "								<div ng-switch-when=\"functions\">Implement Behavior: {{stat.$value}}</div>	\n" +
    "								<div ng-switch-when=\"skips\">Skips: {{stat.$value}}</div>\n" +
    "							\n" +
    "						  		</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "						\n" +
    "				<div class=\"subTitle\" style=\"color:yellow\">Next Achievements:</div>\n" +
    "					<div id=\"board\" >	\n" +
    "						<div id=\"columns\">						\n" +
    "					  		<div class=\"pin\" ng-repeat=\"(i,achievement) in listOfachievements | orderBy:['-(current/requirement)','requirement'] | byCurrent\"\n" +
    "							style=\"height:{{achievement.height}}px\" >						  	\n" +
    "					  	\n" +
    "					  		<div class=\"grayIcon\"><img style=\"width:30px;height:{{achievement.height}}px\" ng-src=\"{{ icon(achievement.condition).$value }}\" /></div>					\n" +
    "										\n" +
    "							<div class=\"title\">{{achievement.title}}</div>						\n" +
    "							<div class=\"info\">Completed {{achievement.current}} of {{achievement.requirement}} {{achievement.title}}.</div>\n" +
    "										\n" +
    "						\n" +
    "					  		</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "						\n" +
    "				<div class=\"subTitle\">Unlocked Achievements:</div>\n" +
    "					<div id=\"board\" >	\n" +
    "						<div id=\"columns\" class=\"container-fluid\">			\n" +
    "				  			<div class=\"pin\" ng-repeat=\"(i,achievement) in listOfachievements | orderBy:['condition','requirement']\" \n" +
    "				  			ng-if=\"listOfachievements.length > 0 && achievement.isUnlocked\" style=\"height:{{achievement.height}}px\">\n" +
    "				  			\n" +
    "				  			<div class=\"icon\"><img style=\"width:30px;height:{{achievement.height}}px\" ng-src=\"{{ icon(achievement.condition).$value }}\" /></div>					\n" +
    "											\n" +
    "							<div class=\"title\">{{achievement.title}}</div>		\n" +
    "							<div class=\"info\">{{achievement.message}}</div>			\n" +
    "											\n" +
    "							\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "			</div>\n" +
    "			</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("achievements/achievements_panel_old.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("achievements/achievements_panel_old.html",
    "<div id=\"achievementsPanel\" class=\"container-fluid achievements\" ng-controller=\"userAchievements\">\n" +
    "	<div>\n" +
    "		<div class=\"subTitle\" style=\"color:yellow\">Next Achievements:</div>\n" +
    "			<div id=\"board\" >	\n" +
    "			<div id=\"columns\">	\n" +
    "			  	<div class=\"pin\" ng-repeat=\"(i,achievement) in listOfachievements | orderBy:['-(current/requirement)','requirement'] | byCurrent\"\n" +
    "					style=\"height:{{achievement.height}}px\" >\n" +
    "			  	<div class=\"grayIcon\"><img style=\"width:30px;height:{{achievement.height}}px\" ng-src=\"{{ icon(achievement.condition).$value }}\" /></div>					\n" +
    "								\n" +
    "				<div class=\"title\">{{achievement.title}}</div>			\n" +
    "				<div class=\"info\">Completed {{achievement.current}} of {{achievement.requirement}} {{achievement.title}}.</div>\n" +
    "								\n" +
    "				\n" +
    "			  	</div>\n" +
    "			</div>\n" +
    "			</div>\n" +
    "		<div class=\"subTitle\">Unlocked:</div>\n" +
    "		<div id=\"board\" >	\n" +
    "		<div id=\"columns\">			\n" +
    "		  	<div class=\"pin\" ng-repeat=\"(i,achievement) in listOfachievements | orderBy:['condition','requirement']\" ng-if=\"listOfachievements.length > 0 && achievement.isUnlocked\" \n" +
    "				style=\"height:{{achievement.height}}px\" >\n" +
    "		  	<div class=\"icon\"><img style=\"width:30px;height:{{achievement.height}}px\" ng-src=\"{{ icon(achievement.condition).$value }}\" /></div>					\n" +
    "							\n" +
    "			<div class=\"title\">{{achievement.title}}</div>		\n" +
    "			<div class=\"info\">{{achievement.message}}</div>			\n" +
    "			<div class=\"info\">Completed {{achievement.requirement}} {{achievement.title}}.</div> \n" +
    "							\n" +
    "			\n" +
    "		  	</div>\n" +
    "		</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("chat/alert_chat.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("chat/alert_chat.html",
    "<div class=\"alert chat-alert\">\n" +
    "	\n" +
    "	<div class=\"header\">\n" +
    "		<span class=\"avatar pull-left\"><img src=\"/user/picture?userId={{ title }}\" alt=\"\" /></span>\n" +
    "		<span class=\"pull-left\">{{title}} says: </span>\n" +
    "		<span class=\"pull-right btn-close glyphicon glyphicon-remove\" ng-if=\"dismissable\" ng-click=\"$hide()\"></span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	</div>\n" +
    "	<div class=\"message\" ng-bind-html=\"content\"></div>\n" +
    "</div>");
}]);

angular.module("chat/chat_panel.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("chat/chat_panel.html",
    "<div id=\"chatPanel\" class=\"chat\">\n" +
    "\n" +
    "	<div class=\"output\" scroll-glue>\n" +
    "		<ul class=\"messages\">\n" +
    "			<li ng-repeat=\"m in messages\">\n" +
    "	      		<div class=\"avatar\"><img ng-src=\"{{ avatar(m.workerId).$value }}\"  alt=\"\" /></div>\n" +
    "	      		<div class=\"message\">\n" +
    "	      			<span class=\"nickname\">{{ m.workerHandle }}</span><br />\n" +
    "	      			<span class=\"text\" ng-bind-html=\"m.text\"></span>\n" +
    "	      		</div>\n" +
    "	      		<small class=\"timestamp pull-right\" time-ago from-time=\"{{m.createdAt | date : 'medium'}}\"></small>\n" +
    "	      		<div class=\"clearfix\"></div>\n" +
    "	      	</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"input\">\n" +
    "		<textarea ng-model=\"data.newMessage\" placeholder=\"Enter a chat message\" ng-model-option=\"{ updateOn: 'blur'}\"class=\"input-sm\" press-enter=\"addMessage()\" ></textarea>\n" +
    "	</div>\n" +
    "	\n" +
    "</div>");
}]);

angular.module("functions/javascript_tutorial.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("functions/javascript_tutorial.html",
    "<!-- Button trigger modal -->\n" +
    "<a href=\"#\"  data-toggle=\"modal\" data-target=\"#javascriptTutorial\" ng-click=\"trackInteraction('Click Tutorial', 'JavaScript', $event)\">\n" +
    "JAVASCRIPT TUTORIAL\n" +
    "</a>\n" +
    "\n" +
    "<!-- Modal -->\n" +
    "<div class=\"modal fade\" id=\"javascriptTutorial\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"text-transform:none;\">\n" +
    "  <div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "      <div class=\"modal-header\">\n" +
    "        <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n" +
    "        <h4 class=\"modal-title\" id=\"myModalLabel\">Javascript in 2 minutes!</h4>\n" +
    "      </div>\n" +
    "      <div class=\"modal-body\">\n" +
    "		<div ui-ace=\"{showGutter: false, theme:'xcode',  mode: 'javascript', onLoad : aceLoaded }\"  readonly=\"true\" ng-model=\"javaTutorial\"> </div>  <br>\n" +
    "   	</div>\n" +
    "      <div class=\"modal-footer\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("leaderboard/leaderboard.template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("leaderboard/leaderboard.template.html",
    "<div id=\"leaderboardPanel\">\n" +
    "	<div>\n" +
    "		<ul class=\"sidebar-list leaderboard\" >\n" +
    "		  	<li ng-repeat=\"leader in leaders | orderBy:'-score'\" ng-if=\"leaders.length > 0\" \n" +
    "		  	  class=\"{{ leaders.$keyAt(leader) == workerId ? 'self' : '' }}\" >\n" +
    "		  		<div class=\"avatar\" ><img style=\"width:25px\" ng-src=\"{{ avatar(leaders.$keyAt(leader)).$value }}\" alt=\"{{ ::leader.name }}\" /></div>\n" +
    "		  		<div class=\"score\">{{ leader.score }} pts</div>\n" +
    "		  		<div class=\"name\" style=\"cursor:pointer\" ng-click=\"clicked(leader)\">{{::(leader.name) }}</div>\n" +
    "		  		<div class=\"clearfix\"></div>\n" +
    "		  	</li>\n" +
    "		</ul>\n" +
    "		<span ng-if=\"leaders.length == 0\" >\n" +
    "			no leaders yet!\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/alert_submit.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/alert_submit.html",
    "<div class=\"alert submit-alert\" ng-class=\"[type ? 'alert-' + type : null]\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "  <strong ng-bind=\"title\"></strong>&nbsp;<span ng-bind-html=\"content\"></span>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/challenge_review/challenge_review.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/challenge_review.html",
    "<div ng-controller=\"ChallengeReviewController\">\n" +
    "\n" +
    "	<div ng-if=\"reviewed !== undefined\" ng-include=\"'microtasks/challenge_review/review_' + reviewed.type + '.html'\"></div>\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>RATING SYSTEM\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<ul style=\"list-style:none;margin:0px;padding:0px;\">\n" +
    "						<li><b>1 Star</b>: Incoherent or unfocussed</li>\n" +
    "						<li><b>2 Stars</b>: Unconvincing or weak</li>\n" +
    "						<li><b>3 Stars</b>: There are some weakness</li>\n" +
    "						<li><b>4 Stars</b>: Good quality, without weakness</li>\n" +
    "						<li><b>5 Stars</b>: Excellent without weakness</li>\n" +
    "					</ul>\n" +
    "\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "					<label>\n" +
    "					    <input type=\"radio\" ng-model=\"review.isChallengeWon\" value=\"true\">\n" +
    "					    Challenger\n" +
    "					 </label><br/>\n" +
    "					 <span>{{review.microtask.review.reviewText}}</span><br/>\n" +
    "					 <label>\n" +
    "					     <input type=\"radio\" ng-model=\"review.isChallengeWon\" value=\"false\">\n" +
    "					     reviewer\n" +
    "					  </label><br/>\n" +
    "					  <span>{{microtask.challengeText}}</span><br/>\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("microtasks/challenge_review/review_DebugTestFailure.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_DebugTestFailure.html",
    "<div ng-if=\"review.microtask.submission.hasPseudo\">\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			A worker was asked to edit the code of the function <strong>{{ funct.getName() }}</strong>.\n" +
    "			Can you review this work?\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "	<div class=\"section section-review\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Diff of edits to function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"! review.microtask.submission.hasPseudo\">\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "\n" +
    "			A worker reported an issue with the following test case<span ng-if=\"review.microtask.submission.disputedTests.length > 1\">s</span> for the function <strong>{{funct.getName()}}</strong>.\n" +
    "			Can you review this work?\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\">\n" +
    "			<div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div data-ng-repeat=\"(key, test) in tests\">\n" +
    "		<div class=\"section section-description\">\n" +
    "			<div class=\"section-title\" ><div class=\"dot bg-color\"></div>test case</div>\n" +
    "			<div class=\"section-content\" >\n" +
    "				{{test.getDescription()}}\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section section-description\">\n" +
    "			<div  class=\"section-title\" ><div class=\"dot bg-color\"></div>TEST</div>\n" +
    "			<div class=\"section-content\" >\n" +
    "				<table style=\"width:100%\" class=\"test\">\n" +
    "					<tr ng-repeat=\"(inputKey,input) in test.getSimpleTest().inputs track by $index\">\n" +
    "						<td>{{funct.getParamNameAt($index)}}</td>\n" +
    "						<td>\n" +
    "							<div ace-read-json ng-model=\"input\" ></div>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "					<tr >\n" +
    "						<td>test output</td>\n" +
    "						<td>\n" +
    "							<div ace-read-json ng-model=\"test.getSimpleTest().output\" ></div>\n" +
    "						</td>\n" +
    "					</tr>\n" +
    "				</table>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section section-review\">\n" +
    "			<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "			<div class=\"section-content\" >\n" +
    "				{{test.disputeText}}\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/challenge_review/review_ReuseSearch.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_ReuseSearch.html",
    "<div class=\"section section-description \" >\n" +
    "	\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		A worker editing the function <strong>{{funct.getName()}}</strong> requested a call to a function providing the behavior of <strong>{{review.microtask.pseudoFunctionName}}</strong>. As a result, a worker was asked to find a function providing such behavior. Can you review this work?\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>REQUESTED BEHAVIOR\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"review.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-description-2\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>requesting function\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"funct.getFunctionCode()\" highlight=\"[ { 'needle' : review.microtask.pseudoFunctionName , regex: true } ]\" ></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>Function Found\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"calleeFunction.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/challenge_review/review_WriteCall.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteCall.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		The crowd created a description for the function\n" +
    "		 <strong>{{calleeFunction.getName()}}</strong>, called by the function below.<br />\n" +
    "		 As a result, a worker was asked to check if the call(s) were correct, and revise them if necessary, or decide that an alternative implementation was better. <br />Can you review this work?\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"calleeFunction.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>Diff of Edits to Function\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"review.functionCode\" mode=\"diff\" highlight=\"[ { 'needle' : calleeFunction.getName() , regex: true } ]\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/challenge_review/review_WriteFunction.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteFunction.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"reviewed.submission.inDispute\">\n" +
    "			A worker has reported the following function as not implementable.  Can you review this request?\n" +
    "		</div>\n" +
    "		<div ng-if=\"! reviewed.submission.inDispute\">\n" +
    "			<div ng-if=\"reviewed.promptType == 'SKETCH'\">\n" +
    "				A worker was asked to edit the code of the function <strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType == 'RE_EDIT'\">\n" +
    "				A worker was asked to revise the following function (if necessary) to address an issue reported by the crowd.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "				A worker was asked to revise the following function (if necessary) based on a change to the signature of a function it calls.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType=='REMOVE_CALLEE'\">\n" +
    "				The crowd determined that the function <strong>{{callee.getName()}}</strong>, which was called in the function below, could not be implemented as requested, for the reason below.  As a result, a worker was asked to replace the call(s) to <strong>{{callee.getName()}}</strong> with a new 	implementation.\n" +
    "			</div>\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"! reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description-2\" ng-if=\"reviewed.disputeText.length > 0\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Reported Issue\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" ng-if=\"reviewed.disputeText.length > 0\" >\n" +
    "			{{reviewed.disputeText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"reviewed.promptType == 'REMOVE_CALLEE'\">\n" +
    "		<div class=\"section section-description-2\">\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>Description of Function Call to Remove\n" +
    "			</div>\n" +
    "			<div class=\"section-content no-padding\" >\n" +
    "				<ace-read-js code=\"callee.getSignature()\" ></ace-read-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"reviewed.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "		<div class=\"section section-description-2\">\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>Changes to Function Signature\n" +
    "			</div>\n" +
    "			<div class=\"section-content no-padding\" >\n" +
    "				<ace-read-js code=\"calledDiffCode\" mode=\"diff\" ></ace-read-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-review\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Diff of edits to function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description-2\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>reported function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-review\">\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			{{reviewed.submission.disputeFunctionText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/challenge_review/review_WriteFunctionDescription.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteFunctionDescription.html",
    "<div class=\"section section-description \" >\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "			A worker was asked to write a detailed description for the following requested function.\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"review.microtask.submission.inDispute\">\n" +
    "			A worker has requested that the following function not be implemented.\n" +
    "		</div>\n" +
    "\n" +
    "		<span>Can you review this work?</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"! review.microtask.submission.inDispute\">Requested Function</span>\n" +
    "		<span ng-if=\"review.microtask.submission.inDispute\">Function description</span>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"review.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\" ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span >Requesting function</span>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"review.requestingFunction.getFunctionCode()\" highlight=\"[ { 'needle' : review.microtask.pseudoFunctionName , regex: true } ]\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>Detailed Function Description\n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ace-read-js code=\"review.funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\" ng-if=\"review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{review.microtask.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/challenge_review/review_WriteTest.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteTest.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "			<div ng-if=\"review.microtask.promptType=='WRITE'\">\n" +
    "				A worker was asked to implement the following test case for\n" +
    "				the function <strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='CORRECT'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong>  to address the following issue.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong> (if necessary) based on a change to the description of the test case.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong> \n" +
    "				(if necessary) to work correctly with the new function signature specified below.\n" +
    "			</div>\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"review.microtask.submission.inDispute\">\n" +
    "			<div ng-if=\"review.microtask.submission.disputeFunctionText!=''\" >\n" +
    "				A worker reported the following issue with the function\n" +
    "				<strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.submission.disputeTestText!=''\" >\n" +
    "				A worker reported the following issue with the following test case for the function\n" +
    "				<strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "			<span>Can you review this issue?</span>\n" +
    "			<span>\n" +
    "				<strong>TIP:</strong>When you review an issue, rate high means agree on the issue.\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\">\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"reviewed.submission.disputeFunctionText!=''\">\n" +
    "			REPORTED FUNCTION DESCRIPTION\n" +
    "		</span>\n" +
    "		<span ng-if=\"reviewed.submission.disputeFunctionText==''\">\n" +
    "			FUNCTION DESCRIPTION\n" +
    "		</span>\n" +
    "	</div>\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\" ng-if=\"reviewed.submission.disputeFunctionText==''\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Test case</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-content\" >\n" +
    "		<span ng-if=\"review.microtask.promptType!='TESTCASE_CHANGED' || reviewed.submission.inDispute\">\n" +
    "			{{reviewed.owningArtifact}}\n" +
    "		</span>\n" +
    "\n" +
    "		<span ng-if=\"review.microtask.promptType=='TESTCASE_CHANGED' && ! reviewed.submission.inDispute\">\n" +
    "			<strong>Old description: </strong><span ng-bind=\"review.microtask.oldTestCase\"></span><br />\n" +
    "			<strong>New description: </strong><span ng-bind=\"review.microtask.owningArtifact\"></span>\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"review.microtask.submission.inDispute\" class=\"section section-review\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{reviewed.submission.disputeTestText}}\n" +
    "		{{reviewed.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"! reviewed.submission.inDispute\" >\n" +
    "	<div class=\"section section-review\">\n" +
    "		<div  class=\"section-title\" ><div class=\"dot bg-color\"></div>submitted TEST</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<table style=\"width:100%\" class=\"test\">\n" +
    "				<tr ng-repeat=\"(inputKey,input) in review.microtask.submission.simpleTestInputs track by $index\">\n" +
    "					<td>{{funct.getParamNameAt($index)}}</td>\n" +
    "					<td>\n" +
    "						<div ace-read-json ng-model=\"input\" ></div>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "				<tr ng-if=\"funct.returnType!=undefined\">\n" +
    "					<td>test output</td>\n" +
    "					<td>\n" +
    "						<div ace-read-json ng-model=\"review.microtask.submission.simpleTestOutput\" ></div>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</table>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/challenge_review/review_WriteTestCases.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteTestCases.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "		<!-- if function description disputed -->\n" +
    "		<div ng-if=\"reviewed.submission.inDispute\" >\n" +
    "			A worker reported an issue with a test case for the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			<span>Can you review this issue?</span>\n" +
    "			<span>\n" +
    "				<strong>TIP:</strong>When you review an issue, rate high means agree on the issue.\n" +
    "			</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- if no function description dispute  AND the prompt type is WRITE   --> \n" +
    "		<div ng-if=\"reviewed.promptType == 'WRITE' && !reviewed.submission.inDispute\" >\n" +
    "			A worker was asked to write test cases for the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<!-- if no function description dispute  AND the prompt type is CORRECTS   -->\n" +
    "		<div ng-if=\"reviewed.promptType == 'CORRECT' && !reviewed.submission.inDispute\" >\n" +
    "			A worker was asked to edit test cases of the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>\n" +
    "			to address an issue found by the crowd.\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<!-- prompt type = WRITE -->\n" +
    "\n" +
    "\n" +
    "<!-- always show the function description --> \n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>function description\n" +
    "	</div>\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- if the function description has been disputed -->\n" +
    "<div class=\"section section-review\" ng-if=\"review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{review.microtask.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<!-- if the function description has not been disputed -->\n" +
    "\n" +
    "<!-- show report data if is a CORRECT -->\n" +
    "<div ng-if=\"reviewed.promptType == 'CORRECT' && !reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			Reported Issue \n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-content\">\n" +
    "			<strong>Test case: </strong>\n" +
    "			<span>{{reviewed.issuedTestCase}}</span>\n" +
    "			<br />\n" +
    "			<strong> Issue: </strong>\n" +
    "			<span>{{reviewed.issueDescription}}</span>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\" ng-if=\"!review.microtask.submission.inDispute\">\n" +
    "	<div class=\"section-title\" >\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"reviewed.promptType == 'WRITE' && !reviewed.submission.inDispute\" >submitted test cases</span> \n" +
    "		<span ng-if=\"reviewed.promptType == 'CORRECT' && !reviewed.submission.inDispute\" >Revised test cases</span> \n" +
    "	</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		<ul style=\"padding-left:20px\">\n" +
    "			<li ng-repeat=\"tc in review.testcases\">\n" +
    "				\n" +
    "				<span ng-if=\"tc.class != 'chg'\" class=\"{{tc.class}}\" >\n" +
    "					<span ng-if=\"tc.class == 'add'\">+</span>\n" +
    "					<span ng-if=\"tc.class == 'del'\">-</span>\n" +
    "					{{tc.text}}\n" +
    "				</span>\n" +
    "				<span ng-if=\"tc.class == 'chg'\">\n" +
    "					<span class=\"del\">{{tc.old}}</span>\n" +
    "					<strong>changed to </strong>\n" +
    "					<span class=\"add\">{{tc.text}}</span>\n" +
    "				</span>\n" +
    "\n" +
    "			</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/dashboard/dashboard.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/dashboard/dashboard.html",
    "<div class=\"dashboard\" ng-controller=\"Dashboard\">\n" +
    "\n" +
    "	<div ng-hide=\"breakMode\" class=\"alert alert-warning no-microtask\" role=\"alert\" >\n" +
    "		Sorry, there are currently no available microtasks. <br />\n" +
    "		The microtask queue will be checked again in \n" +
    "		<strong ng-if=\"checkQueueIn > 0\"> {{checkQueueIn}} seconds </strong>\n" +
    "		<strong ng-if=\"checkQueueIn == 0\"> ... fetching  </strong>.\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"filters\">\n" +
    "		<strong>Filters: </strong>\n" +
    "		<span class=\"filter {{ type | lowercase }} alpha\"\n" +
    "			  ng-if=\"typesCount[type]>0\"\n" +
    "			  ng-class=\"{'off':!filterEnabled[type]}\"\n" +
    "			  ng-click=\"filterEnabled[type]=!filterEnabled[type]\"\n" +
    "			  ng-repeat=\"(key,type) in types\" >\n" +
    "			  {{type}} \n" +
    "		</span>	\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"pin-group\">\n" +
    "		<div class=\"title\">\n" +
    "			Available ({{ (microtasks | canChoose:microtaskQueue:reviewQueue:availableMicrotasks | byType:filterEnabled ).length }})\n" +
    "		</div>\n" +
    "		<div class=\"list\">\n" +
    "			<div class=\"pin pinAvailable\" ng-repeat=\"(i,microtask) in microtasks | canChoose: microtaskQueue:reviewQueue:availableMicrotasks| byType:filterEnabled |  orderBy: orderPredicate : orderReverse\" \n" +
    "			style=\"height:{{microtask.height}}px\" ng-animate=\"'animate'\">\n" +
    "				<div class=\"title {{ microtask.type | lowercase }} alpha\">\n" +
    "\n" +
    "					<span ng-switch=\"microtask.type\">\n" +
    "						<span ng-switch-when=\"ImplementBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Edit function</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct function</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"DescribeFunctionBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Write a test</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct test(s)</span>\n" +
    "							<span ng-switch-when=\"FUNCTION_CHANGED'\">Fix test(s)</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"Review\">\n" +
    "							Review\n" +
    "						</span>\n" +
    "					</span>\n" +
    "					\n" +
    "				</div>\n" +
    "				<div class=\"content\" >\n" +
    "					<div>function: {{microtask.owningArtifact}} </div>\n" +
    "					<div>reward: {{microtask.points}} points</div>	\n" +
    "				</div>\n" +
    "				\n" +
    "				<button class=\"btn btn-select\" ng-click=\"assignMicrotask(microtask)\">Work On This</button>\n" +
    "				\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"pin-group\">\n" +
    "		<div class=\"title\">\n" +
    "			Assigned ({{ (microtasks | assigned:availableMicrotasks | byType:filterEnabled ).length }})\n" +
    "		</div>\n" +
    "		<div class=\"list\">\n" +
    "			<div class=\"pin\" ng-repeat=\"(i,microtask) in microtasks | assigned:availableMicrotasks | byType:filterEnabled | orderBy: orderPredicate : orderReverse\" style=\"height:{{microtask.height}}px\" ng-animate=\"'animate'\">\n" +
    "				<div class=\"title {{ microtask.type | lowercase }} alpha\">\n" +
    "					<span ng-switch=\"microtask.type\">\n" +
    "						<span ng-switch-when=\"ImplementBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Edit function</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct function</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"DescribeFunctionBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Write a test</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct test(s)</span>\n" +
    "							<span ng-switch-when=\"FUNCTION_CHANGED'\">Fix test(s)</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"Review\">\n" +
    "							Review\n" +
    "						</span>\n" +
    "					</span>\n" +
    "				</div>\n" +
    "				<div class=\"content\">\n" +
    "					<div>function: {{microtask.owningArtifact}} </div>\n" +
    "					<div>reward: {{microtask.points}} points</div>	\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>	\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"pin-group\">\n" +
    "		<div class=\"title\">\n" +
    "			In review ({{ (microtasks | waitingReview:availableMicrotasks | byType:filterEnabled ).length }})\n" +
    "		</div>\n" +
    "		<div class=\"list\">\n" +
    "			<div class=\"pin\" ng-repeat=\"(i,microtask) in microtasks | waitingReview:availableMicrotasks | byType:filterEnabled | orderBy: orderPredicate : orderReverse\" style=\"height:{{microtask.height}}px\" ng-animate=\"'animate'\">\n" +
    "				<div class=\"title {{ microtask.type | lowercase }} alpha\">\n" +
    "					<span ng-switch=\"microtask.type\">\n" +
    "						<span ng-switch-when=\"ImplementBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Edit function</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct function</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"DescribeFunctionBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Write a test</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct test(s)</span>\n" +
    "							<span ng-switch-when=\"FUNCTION_CHANGED'\">Fix test(s)</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"Review\">\n" +
    "							Review\n" +
    "						</span>\n" +
    "					</span>\n" +
    "				</div>\n" +
    "				<div class=\"content\">\n" +
    "					<div>function: {{microtask.owningArtifact}} </div>\n" +
    "					<div>reward: {{microtask.points}} points</div>	\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"pin-group\">\n" +
    "		<div class=\"title\"> \n" +
    "			Completed ({{ (microtasks | completed:availableMicrotasks | byType:filterEnabled ).length }})\n" +
    "		</div>\n" +
    "		<div class=\"list\">\n" +
    "			<div class=\"pin\" ng-repeat=\"(i,microtask) in microtasks | completed:availableMicrotasks | byType:filterEnabled | orderBy: orderPredicate : orderReverse\" style=\"height:{{microtask.height}}px\" ng-animate=\"'animate'\">\n" +
    "				<div class=\"title {{ microtask.type | lowercase }} alpha\">\n" +
    "					<span ng-switch=\"microtask.type\">\n" +
    "						<span ng-switch-when=\"ImplementBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Edit function</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct function</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"DescribeFunctionBehavior\" ng-switch=\"microtask.promptType\">\n" +
    "							<span ng-switch-when=\"WRITE\">Write a test</span>\n" +
    "							<span ng-switch-when=\"CORRECT\">Correct test(s)</span>\n" +
    "							<span ng-switch-when=\"FUNCTION_CHANGED'\">Fix test(s)</span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span ng-switch-when=\"Review\">\n" +
    "							Review\n" +
    "						</span>\n" +
    "					</span>\n" +
    "				</div>\n" +
    "				<div class=\"content\">\n" +
    "					<div>function: {{microtask.owningArtifact}} </div>\n" +
    "					<div>reward: {{microtask.points}} points</div>	\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/dashboard/dashboard2.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/dashboard/dashboard2.html",
    "<div class=\"dashboard2\" ng-controller=\"dashboard2\">\n" +
    "    <div ui-layout=\"{ flow: 'row', dividerSize: 1 }\">\n" +
    "        <div ui-layout-container min-size=\"40px\" size=\"100%\">\n" +
    "            <div class=\"title\">DashBoard</div>\n" +
    "            <div class=\"content\">\n" +
    "\n" +
    "                <span class=\"section-header\">Name</span>\n" +
    "                <span ng-bind=\"projectName\"></span><br/>\n" +
    "\n" +
    "                <span class=\"section-header\">Description</span><br/>\n" +
    "                <span ng-bind=\"projectDescription\"></span><br/>\n" +
    "\n" +
    "                <div bs-collapse start-collapsed=\"false\" allow-multiple=\"true\">\n" +
    "                    <span class=\"section-header\">Data Types</span><br/>\n" +
    "                    <div ng-repeat=\"d in DataTypes\" class=\"data-types\" ng-init=\"d.selectedExample = d.examples[0]\">\n" +
    "                        <div bs-collapse-toggle class=\"toggler\" >{{d.name}}</div>\n" +
    "                        <div bs-collapse-target class=\"toggled\" ng-init=\"structure = buildStructure(d)\">\n" +
    "                            <span ng-bind=\"::d.description\"></span>\n" +
    "                            <pre ng-if=\"d.structure\" ng-bind=\"structure\"></pre>\n" +
    "                            <div ng-if=\"d.selectedExample != undefined\">\n" +
    "                                <span class=\"pull-left\" for=\"exampleSelect\">EXAMPLES:</span>\n" +
    "                                <span class=\"pull-right\">\n" +
    "                                    <div ng-if=\"::d.examples\" class=\"dropdown\"  >\n" +
    "                                       <button name= \"exampleSelect\"\n" +
    "                                               class=\"btn btn-xs dropdown-toggle\"\n" +
    "                                               bs-select\n" +
    "                                               bs-options=\"e.name for e in d.examples\"\n" +
    "                                               data-html=\"1\"\n" +
    "                                               data-placement=\"bottom-right\"\n" +
    "                                               ng-model=\"d.selectedExample\" >\n" +
    "                                       </button>\n" +
    "                                    </div>\n" +
    "                                </span>\n" +
    "                                <span class=\"clearfix\"></span>\n" +
    "                                <div json-reader ng-model=\"d.selectedExample.value\" copy-allowed></div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <br/>\n" +
    "                    <span class=\"section-header\">Functions</span><br/>\n" +
    "                    <div ng-repeat=\"f in Functions\" class=\"functions\">\n" +
    "                        <div bs-collapse-toggle class=\"toggler\" >{{f.name}}</div>\n" +
    "                        <div bs-collapse-target class=\"toggled\">\n" +
    "                            <div ng-bind=\"f.description\"></div>\n" +
    "                            <div><strong> Parameters </strong></div>\n" +
    "                            <div ng-repeat=\"p in f.parameters\">\n" +
    "                                <span ng-bind=\"p.name\"></span>\n" +
    "                                <span ng-bind=\"p.type\"></span>\n" +
    "                            </div>\n" +
    "                            <div >\n" +
    "                                <strong>Return:</strong>\n" +
    "                                <span ng-bind=\"f.returnType\"></span>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("microtasks/debug_test_failure/debug_test_failure.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/debug_test_failure/debug_test_failure.html",
    "<div ng-controller=\"DebugTestFailureController\"  >\n" +
    "    \n" +
    "\n" +
    "    <div class=\"section section-description \" >\n" +
    "        \n" +
    "        <div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "        <div class=\"section-content  job-description\" >\n" +
    "            One of the tests for the function <strong>{{funct.name}}</strong> has failed. <br />\n" +
    "            Can you find and fix the bug (or report an issue with the test)?\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <alertcontainer></alertcontainer>\n" +
    "\n" +
    "    <div ng-repeat=\"callee in data.callees\">\n" +
    "        <stubs-modal function-name=\"callee\" stubs=\"currentTest.stubs[callee]\"></stubs-modal>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!dispute.active\" \n" +
    "         class=\"section section-description\"  >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>\n" +
    "            FAILING TEST \n" +
    "        </div>\n" +
    "        <div class=\"section-content\" >\n" +
    "           \n" +
    "            <div class=\"panel-group\" ng-model=\"activePanelCurr\" bs-collapse>\n" +
    "            \n" +
    "                <div class=\"panel panel-default test-result\" >\n" +
    "                    \n" +
    "                    <div class=\"panel-heading {{ currentTest.status() }}\" bs-collapse-toggle>\n" +
    "                        <strong class=\"pull-left\">    \n" +
    "                            <span class=\"glyphicon glyphicon-chevron-{{ activePanelCurr == 0 ? 'down' : 'right' }}\"></span>\n" +
    "                            {{currentTest.rec.description}} \n" +
    "                        </strong>\n" +
    "                        <span class=\"pull-right\">\n" +
    "                            <span ng-if=\"!currentTest.ready()\"> running ... </span>\n" +
    "                            <span ng-if=\"currentTest.ready()\">\n" +
    "                                <span ng-if=\"!currentTest.inTimeout\">\n" +
    "                                    <span>executed in {{currentTest.executionTime}} ms - </span>\n" +
    "                                    <span>{{currentTest.status()}}</span>\n" +
    "                                </span>\n" +
    "                                <span ng-if=\"currentTest.inTimeout\">timeout</span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                        \n" +
    "                        <span class=\"clearfix\"></span>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"panel-collapse\" bs-collapse-target>\n" +
    "                        <test-result test=\"currentTest\" funct=\"funct\" ></test-result>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "\n" +
    "            </div>  \n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!dispute.active && previousTests.length > 0\" class=\"section section-description\"  >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>\n" +
    "            OTHER TESTS\n" +
    "        </div>\n" +
    "        <div class=\"section-content\" >\n" +
    "            \n" +
    "            <div class=\"panel-group\" ng-model=\"activePanel\" bs-collapse>\n" +
    "            \n" +
    "                <div class=\"panel panel-default test-result\" \n" +
    "                    ng-repeat=\"(testIndex,test) in previousTests track by $index\"\n" +
    "                    ng-show=\"!test.output.result || !hidePassedTests\">\n" +
    "                    \n" +
    "                    <div class=\"panel-heading {{ test.status() }}\" bs-collapse-toggle>\n" +
    "                        <strong class=\"pull-left\">    \n" +
    "                            <span class=\"glyphicon glyphicon-chevron-{{ activePanel == testIndex ? 'down' : 'right' }}\"></span>\n" +
    "                            {{test.rec.description}} \n" +
    "                        </strong>\n" +
    "                        <span class=\"pull-right\">\n" +
    "                            <span ng-if=\"!test.ready()\"> running ... </span>\n" +
    "                            <span ng-if=\"test.ready()\">\n" +
    "                                <span ng-if=\"!test.inTimeout\">\n" +
    "                                    <span>executed in {{test.executionTime}} ms - </span>\n" +
    "                                    <span>{{test.status()}}</span>\n" +
    "                                </span>\n" +
    "                                <span ng-if=\"test.inTimeout\">timeout</span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                        \n" +
    "                        <span class=\"clearfix\"></span>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"panel-collapse \" bs-collapse-target>\n" +
    "                        <div ng-if=\"activePanel != NaN && (activePanel%previousTests.length)==$index\">    \n" +
    "                            <test-result test=\"test\" funct=\"funct\" ></test-result>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "\n" +
    "            </div>  \n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- CODE EDITOR -->\n" +
    "    <div class=\"section-cols \" ng-show=\" tabs.active == 2 \">\n" +
    "        <div class=\"container-flex-row\">\n" +
    "            <div class=\"section section-help bg-color-alpha \" style=\"width:30%\">\n" +
    "                <a ng-click=\"runTests()\" class=\"btn btn-primary\" style=\"margin:10px\" ng-disabled=\"microtaskForm.functionForm.$invalid\">\n" +
    "                    <span class=\"glyphicon glyphicon-refresh\"></span> \n" +
    "                    <span ng-if=\"!data.running\">Run the tests</span> \n" +
    "                    <span ng-if=\"data.running\">Tests running</span>\n" +
    "                </a>\n" +
    "                \n" +
    "                <div class=\"section-title\" > <div class=\"dot\"></div> <javascript-helper ></javascript-helper></div>\n" +
    "\n" +
    "                <div class=\"section-title\" >  <div class=\"dot\"></div> DEBUGGER TIPS </div>\n" +
    "                <div class=\"section-content\" >\n" +
    "                    <ul style=\"font-family:'Lato'; list-style:none; padding-left:5px; padding-right:5px;\">\n" +
    "                        <li style=\"border-bottom:1px solid #A9CAE0; \">use <strong>console.log(...)</strong> to monitor statements</li>\n" +
    "                        <li>click on the highlighted function calls for opening the stubs popup</li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"section-title\" >  <div class=\"dot\"></div> AVAILABLE DATA TYPES </div>\n" +
    "                <div class=\"section-content\" >\n" +
    "                    <adt-list></adt-list>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"section section-form\" style=\"width:70%\">\n" +
    "                <div class=\"section-content no-padding\" >\n" +
    "                    <ace-edit-js \n" +
    "                        function=\"funct\" \n" +
    "                        editor=\"data.editor\" \n" +
    "                        annotations=\"data.annotations\"\n" +
    "                        markers=\"data.markers\"\n" +
    "                        has-pseudo=\"data.hasPseudo\"\n" +
    "                        >\n" +
    "                    </ace-edit-js>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/describe_behavior/describe_behavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/describe_behavior/describe_behavior.html",
    "<div ng-controller=\"DescribeBehavior\">\n" +
    "\n" +
    "	<div class=\"header bg-color\">\n" +
    "		<span class=\"type\">\n" +
    "			<span ng-switch=\"microtask.promptType\">\n" +
    "				<span ng-switch-when=\"WRITE\">Implement Function behavior</span>\n" +
    "		<span ng-switch-when=\"CORRECT\">Correct function and test(s)</span>\n" +
    "		<span ng-switch-when=\"FUNCTION_CHANGED'\">Fix function and test(s)</span>\n" +
    "		</span>\n" +
    "		</span>\n" +
    "		<span class=\"points\">( {{::microtask.points}} pts )</span>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', 'ImplementBehavior', true); trackInteraction('Click Tutorial', 'Describe Behavior - Microtask', $event)\">\n" +
    "			<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "		</button>\n" +
    "		<span class=\"reissued\" ng-if=\"microtask.reissuedSubmission !== undefined\">REISSUED</span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"sections\" ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "\n" +
    "\n" +
    "		<div class=\"section\" ui-layout-container size=\"8%\">\n" +
    "			<div class=\"section-content bg-color-alpha padding\" style=\"top:0px\">\n" +
    "				<div ng-switch=\"microtask.promptType\">\n" +
    "					<span ng-switch-when=\"WRITE\">\n" +
    "						Please implement the function <strong ng-bind=\"funct.name\"></strong> based on it's description and work done by previously. You can write the code as well as write test cases for testing the behavior. You must click the submit button before time expires to save your work.\n" +
    "					</span>\n" +
    "					<span ng-switch-when=\"CORRECT\">\n" +
    "						An issue has been reported with one or more test cases and/or Function Implementation. Can you fix the test(s) and/or Implementation to address the issue?\n" +
    "						If you think that some of the functionality should be implemented in another function, you can request a new function to be created. For info on how to request a new function,click on <span class=\"glyphicon glyphicon-question-sign\"></span> in the Function editor.\n" +
    "					</span>\n" +
    "					<span ng-switch-when=\"FUNCTION_CHANGED'\">\n" +
    "						The signature of the function being tested has changed. As a result, the tests may no longer be correct. Can you update the tests, if necessary?\n" +
    "					</span>\n" +
    "				</div>\n" +
    "\n" +
    "				<div ng-if=\"microtask.reissuedSubmission !== undefined\">\n" +
    "					This task has been reissued because of \"<strong>{{microtask.reissuedMotivation}}</strong>\"\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section\" ui-layout-container size=\"63%\">\n" +
    "			<div class=\"section-bar\" ng-show=\"!data.editingStub\">\n" +
    "				<span class=\"title\">\n" +
    "					Function Editor\n" +
    "				</span>\n" +
    "				<span class=\"pull-right\">\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', 'function_editor', true); trackInteraction('Click Tutorial', 'Implement Behavior - Function Editor', $event)\">\n" +
    "						<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "				</button>\n" +
    "				</span>\n" +
    "				<span class=\"pull-right\">\n" +
    "        	<button class=\"btn btn-sm\" ng-if=\"!data.dispute.active\" style=\"padding-left: 30px\"\n" +
    "					ng-click=\"data.dispute.active = !data.dispute.active; trackInteraction('Click Dispute Function', 'Describe Behavior', $event)\" >\n" +
    "           Report an issue with the function <span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "				</button>\n" +
    "				</span>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div class=\"section-content slide from-left\" ng-show=\"!data.editingStub\">\n" +
    "				<function-editor function=\"funct\" editor=\"data.editor\" logs=\"(!data.inspecting) ? undefined : data.selected1.logs \" callbacks=\"editorCallbacks\">\n" +
    "				</function-editor>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section-bar\" ng-show=\"data.editingStub\">\n" +
    "				<span class=\"title\">\n" +
    "					Stub Editor\n" +
    "				</span>\n" +
    "				<span class=\"pull-right\">\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"cancelStub()\">Cancel</button>\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"saveStub()\">Save stub</button>\n" +
    "				</span>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div class=\"section-content padding slide from-right\" style=\"z-index:100\" ng-if=\"data.editingStub\">\n" +
    "				<div class=\"stub\" ng-form=\"stubForm\">\n" +
    "					<div class=\"form-group\">\n" +
    "						<label>Function Description</label>\n" +
    "						<js-reader class=\"form-control code\" code=\"data.editingStub.functionDescription\"></js-reader>\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\" ng-repeat=\"p in data.editingStub.parameters\">\n" +
    "						<label>\n" +
    "							{{p.name + ' {' + p.type + '}' }}\n" +
    "						</label>\n" +
    "\n" +
    "						<json-reader class=\"form-control code\" ng-model=\"p.value\"></json-reader>\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"\">\n" +
    "							Output {{ '{' + data.editingStub.output.type + '}' }}\n" +
    "						</label>\n" +
    "\n" +
    "						<div class=\"form-control code\" json-editor=\"{ type: data.editingStub.output.type, name: 'output' }\" ng-model=\"data.editingStub.output.value\" errors=\"errors\" name=\"output\" required>\n" +
    "						</div>\n" +
    "\n" +
    "						<div class=\"help-block\" ng-messages=\"stubForm.output.$error\">\n" +
    "							<div ng-message=\"required\">the field output cannot be empty</div>\n" +
    "							<div ng-message=\"code\">{{errors.code}}</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section tab-content\" ui-layout-container size=\"29%\">\n" +
    "			<div class=\"section-bar tests-section-tab-bar\">\n" +
    "				<ul class=\"nav nav-tabs\">\n" +
    "					<li class=\"active\">\n" +
    "						<a data-toggle=\"tab\" class=\"title\" href=\"#edit-tests\">\n" +
    "							<span class=\"title\">Edit Tests</span>\n" +
    "						</a>\n" +
    "					</li>\n" +
    "					<li>\n" +
    "						<a data-toggle=\"tab\" class=\"title\" href=\"#run-tests\">\n" +
    "							<span class=\"title\">Run Tests</span>\n" +
    "						</a>\n" +
    "					</li>\n" +
    "				</ul>\n" +
    "			</div>\n" +
    "\n" +
    "			<div id=\"edit-tests\" class=\"tab-pane active\">\n" +
    "\n" +
    "				<div class=\"section-bar-2\" ng-if=\"data.dispute.active\">\n" +
    "					<span class=\"title pull-left\">Report Function Description</span>\n" +
    "					<span class=\"pull-right\">\n" +
    "						<button class=\"btn btn-sm\" ng-click=\"data.dispute.active = !data.dispute.active;\" >\n" +
    "							Cancel Dispute\n" +
    "						</button>\n" +
    "					</span>\n" +
    "					<span class=\"clearfix\"></span>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"section-content-2 padding\" ng-if=\"data.dispute.active\">\n" +
    "					<div class=\"form\" style=\"height:100%\">\n" +
    "						<div class=\"form-group\" style=\"height:100%\">\n" +
    "							<label for=\"description\">Report reason </label>\n" +
    "							<textarea class=\"form-control\" style=\"height:80%;resize:none;\" placeholder=\"write the reason of the dispute\" name=\"disputeDescription\" ng-model=\"data.dispute.text\" required focus ng-minlength=\"20\" ng-maxlength=\"500\">\n" +
    "							</textarea>\n" +
    "							<div class=\"help-block\" ng-if=\"microtaskForm.disputeDescription.$dirty\" ng-messages=\"microtaskForm.disputeDescription.$error\">\n" +
    "								<div ng-message=\"required\">the report description can't be empty</div>\n" +
    "								<div ng-message=\"minlength\">the minimum length is 20 chars</div>\n" +
    "								<div ng-message=\"maxlength\">the maximum length is 500 chars</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"section-bar-2\" ng-if=\"!data.dispute.active\">\n" +
    "					<span class=\"pull-left title\" ng-if=\"data.selected == -1\">\n" +
    "					<!-- Tests -->\n" +
    "					</span>\n" +
    "					<span class=\"pull-right\" ng-if=\"data.selected == -1 && data.tests.length > 0\">\n" +
    "						<button class=\"btn btn-sm\" ng-click=\"addNew($event)\">\n" +
    "							<span class=\"glyphicon glyphicon-plus\"></span> Add a new test\n" +
    "					</button>\n" +
    "					</span>\n" +
    "\n" +
    "					<span class=\"pull-left\" ng-if=\"data.selected != -1\">\n" +
    "						<button class=\"btn btn-sm\" ng-click=\"toggleSelect($event)\">\n" +
    "							<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "					</button>\n" +
    "					</span>\n" +
    "\n" +
    "					<span class=\"pull-right\" ng-if=\"data.selected != -1\">\n" +
    "						<button class=\"btn btn-sm\" ng-click=\"toggleDelete($event)\" ng-if=\"!data.selected.deleted\">\n" +
    "							<span class=\"glyphicon glyphicon-remove\" ></span> Remove test\n" +
    "					</button>\n" +
    "\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"toggleDelete($event)\" ng-if=\"data.selected.deleted\">\n" +
    "							<span class=\"glyphicon glyphicon-remove\" ></span> Undo remove\n" +
    "						</button>\n" +
    "\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', 'create_edit_test', true); trackInteraction('Click Tutorial', 'Describe Behavior - Edit Test', $event)\">\n" +
    "							<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "						</button>\n" +
    "					</span>\n" +
    "\n" +
    "					<span class=\"clearfix\"></span>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"section-content-2 empty\" ng-if=\"!data.dispute.active && data.tests.length == 0\">\n" +
    "					<div>\n" +
    "						<div>No previous tests written!</div><br />\n" +
    "						<button class=\"btn btn-sm\" ng-click=\"addNew($event)\">\n" +
    "							<span class=\"glyphicon glyphicon-plus\"></span> Add a new test\n" +
    "						</button>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"section-content-2 slide from-left\" ng-if=\"!data.dispute.active && data.tests.length > 0 && data.selected == -1\">\n" +
    "					<div class=\"tests-list has-next \">\n" +
    "						<div class=\"test-item clickable {{ t.dispute.active ? 'disputed' : '' }}\" ng-repeat=\"t in data.tests track by $index\">\n" +
    "							<div ng-click=\"toggleSelect($event,t)\">\n" +
    "								<span class=\"pull-left\">\n" +
    "									<span class=\"glyphicon glyphicon glyphicon-chevron-right\"></span>\n" +
    "								<span ng-if=\"t.description.length > 0\" ng-bind=\"t.description\"></span>\n" +
    "								<span ng-if=\"!t.description || t.description.length == 0\">missing description</span>\n" +
    "								</span>\n" +
    "								<span class=\"pull-right\" ng-if=\"t.deleted\">\n" +
    "									<span class=\"glyphicon glyphicon-remove\"  ></span> removed\n" +
    "								</span>\n" +
    "								<span class=\"pull-right\" ng-if=\"!t.deleted && !microtaskForm['testForm_'+$index].$valid\">\n" +
    "									<span class=\"glyphicon glyphicon-exclamation-sign\"></span> invalid\n" +
    "								</span>\n" +
    "								<span class=\"clearfix\"></span>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div ng-if=\"microtask.promptType !== 'CORRECT'\">\n" +
    "						<input type=\"checkbox\" ng-model=\"data.isComplete\" id=\"isComplete\" name=\"isComplete\" ng-disabled=\"data.numDeleted == data.tests.length\">\n" +
    "						<label for=\"isComplete\">This function is completely implemented</label>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"section-content-2 slide from-right padding\" ng-repeat=\"t in data.tests track by $index\" ng-if=\"!data.dispute.active && (!t.deleted || data.selected == t)\" ng-show=\"data.selected == t\">\n" +
    "				<div ng-form=\"{{ 'testForm_'+$index }}\" class=\"form form-material\" ng-init=\"errors = {}\">\n" +
    "\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"description\">Description </label>\n" +
    "						<input class=\"form-control\" name=\"description\" ng-model=\"t.description\" placeholder=\"insert the description\" ng-minlength=\"5\" ng-maxlength=\"120\" focus required />\n" +
    "						<div class=\"help-block\" ng-messages=\"microtaskForm['testForm_'+$index].description.$error\">\n" +
    "							<div ng-if=\"microtaskForm['testForm_'+$index].description.$dirty\">\n" +
    "								<div ng-message=\"required\">the description can't be empty</div>\n" +
    "								<div ng-message=\"minlength\">the description can't be less than 5 characters</div>\n" +
    "								<div ng-message=\"maxlength\">the description can't exceed 150 characters</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\" ng-if=\"t.dispute.active\">\n" +
    "						<label for=\"description\">Report reason </label>\n" +
    "						<input class=\"form-control\" name=\"description\" ng-model=\"t.dispute.text\" disabled=\"disabled\" />\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label>Type</label>\n" +
    "						<span class=\"help-icon\">\n" +
    "							<span\n" +
    "								class=\"glyphicon glyphicon-question-sign\"\n" +
    "								ng-if=\"t.isSimple\"\n" +
    "								ng-click=\"$emit('queue-tutorial', 'input_output_tests', true); trackInteraction('Click Tutorial', 'Describe Behavior - Input/Output Tests', $event)\">\n" +
    "							</span>\n" +
    "\n" +
    "						<span class=\"glyphicon glyphicon-question-sign\" ng-if=\"!t.isSimple\" ng-click=\"$emit('queue-tutorial', 'assertion_tests', true); trackInteraction('Click Tutorial', 'Describe Behavior - Assertion Tests', $event)\">\n" +
    "							</span>\n" +
    "\n" +
    "						</span>\n" +
    "						<select class=\"form-control\" ng-model=\"t.isSimple\" ng-options=\"o.v as o.n for o in [{ n: 'input/output', v: true }, { n: 'assertion', v: false }]\">\n" +
    "					    </select>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\" ng-if=\"!t.isSimple\">\n" +
    "						<label for=\"code\">Code</label>\n" +
    "						<div class=\"help-icon\" ng-click=\"trackInteraction('Click Tutorial', 'Describe Behavior - Test Editor', $event)\">\n" +
    "							<span class=\"glyphicon glyphicon-question-sign\" data-template=\"widgets/test_editor_help.html\" data-auto-close=\"1\" data-placement=\"left\" data-title=\"title of th ehelp\" bs-popover>\n" +
    "							</span>\n" +
    "						</div>\n" +
    "						<div class=\"form-control code\" test-editor name=\"code\" function-name=\"{{funct.name}}\" ng-model=\"t.code\" errors=\"errors['code']\" required>\n" +
    "						</div>\n" +
    "						<div class=\"help-block\" ng-if=\"microtaskForm['testForm_'+$index].code.$dirty\" ng-messages=\"microtaskForm['testForm_'+$index].code.$error\">\n" +
    "							<div ng-message=\"required\">the test code can't be empty</div>\n" +
    "							<div ng-repeat=\"(type,text) in errors['code']\">\n" +
    "								<div ng-message-exp=\"type\">{{ text }}</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "\n" +
    "					<div ng-if=\"t.isSimple\" ng-form=\"inputs\">\n" +
    "						<div class=\"form-group\" ng-repeat=\"(pIdx,p) in funct.parameters track by p.name\">\n" +
    "							<label for=\"inputs\">\n" +
    "								{{p.name + ' {' + p.type + '}' }}\n" +
    "							</label>\n" +
    "							<div class=\"help-icon\" paste-example=\"{ type : p.type }\" ng-model=\"t.inputs[pIdx]\">\n" +
    "								<span>paste example</span>\n" +
    "							</div>\n" +
    "							<div class=\"form-control code\" json-editor=\"{ type: p.type, name: p.name }\" name=\"{{p.name}}\" ng-model=\"t.inputs[pIdx]\" errors=\"errors[p.name]\" required>\n" +
    "							</div>\n" +
    "\n" +
    "							<div class=\"help-block\" ng-if=\"inputs[p.name].$dirty\" ng-messages=\"inputs[p.name].$error\">\n" +
    "								<div ng-message=\"required\">the field {{p.name}} cannot be empty</div>\n" +
    "								<div ng-message=\"code\">{{errors[p.name].code}}</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "						<label for=\"code\">Output {{ '{' + funct.returnType + '}'}}</label>\n" +
    "						<div class=\"help-icon\" paste-example=\"{ type : funct.returnType }\" ng-model=\"t.output\">\n" +
    "							<span>paste example</span>\n" +
    "						</div>\n" +
    "						<div class=\"form-control code\" json-editor=\"{ type: funct.returnType, name: 'output' }\" ng-model=\"t.output\" name=\"output\" errors=\"errors['output']\" required>\n" +
    "						</div>\n" +
    "						<div class=\"help-block\" ng-if=\"microtaskForm['testForm_'+$index].output.$dirty\" ng-messages=\"microtaskForm['testForm_'+$index].output.$error\">\n" +
    "							<div ng-message=\"required\">the output can't be empty</div>\n" +
    "							<div ng-message=\"code\">{{errors['output'].code}}</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "			<div id=\"run-tests\" class=\"tab-pane\">\n" +
    "\n" +
    "				<div class=\"section-bar-2\">\n" +
    "\n" +
    "				<span class=\"pull-left title\" ng-if=\"data.selected1 == -1\">\n" +
    "\n" +
    "				</span>\n" +
    "\n" +
    "\n" +
    "				<span class=\"pull-left\" ng-if=\"data.selected1 != -1\">\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"toggleSelect1($event)\">\n" +
    "						<span class=\"glyphicon glyphicon-arrow-left\"></span> Back\n" +
    "				</button>\n" +
    "				</span>\n" +
    "\n" +
    "				<span class=\"pull-right\">\n" +
    "					<button class=\"btn btn-sm btn-run\" ng-click=\"run()\">\n" +
    "						<span class=\"glyphicon glyphicon-play\"></span> Run Tests\n" +
    "				</button>\n" +
    "\n" +
    "\n" +
    "				<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', 'running_tests', true); trackInteraction('Click Tutorial', 'Implement Behavior - Running Tests', $event) \">\n" +
    "						<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "					</button>\n" +
    "				</span>\n" +
    "\n" +
    "\n" +
    "				<span class=\"pull-right separator\" ng-if=\"data.selected1 != -1\"></span>\n" +
    "				<span class=\"pull-right\" ng-if=\"data.selected1 != -1\">\n" +
    "					<button\n" +
    "							ng-disabled=\"data.selected1.id === undefined\"\n" +
    "							class=\"btn btn-sm btn-dispute {{ data.selected1.dispute.active ? 'active' : '' }}\"\n" +
    "							ng-click=\"toggleDispute($event);\">\n" +
    "						<span class=\"glyphicon glyphicon-exclamation-sign\"></span> Report an issue\n" +
    "				</button>\n" +
    "				<button class=\"btn btn-sm btn-inspect {{ !data.changedSinceLastRun && data.inspecting ? 'active' : '' }}\" ng-disabled=\"data.changedSinceLastRun\" ng-click=\"toggleInspect($event);\">\n" +
    "						<span class=\"glyphicon glyphicon-search\"></span>\n" +
    "						Inspect code\n" +
    "					</button>\n" +
    "				</span>\n" +
    "\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "\n" +
    "				<div class=\"section-content-2 padding slide from-left\" ng-if=\"data.selected1 == -1\">\n" +
    "				<div class=\"test-list \">\n" +
    "					<div class=\"test-item clickable {{ !te.running ? (te.dispute.active ? 'disputed' : ( te.result.passed ? 'passed' : 'failed' ) ) : '' }}\" ng-repeat=\"te in data.tests track by $index\">\n" +
    "						<div ng-click=\"toggleSelect1($event,te);\">\n" +
    "							<strong class=\"pull-left\">\n" +
    "								<span class=\"glyphicon glyphicon glyphicon-chevron-right\"></span>\n" +
    "								{{ te.description }}\n" +
    "							</strong>\n" +
    "							<span class=\"pull-right\">\n" +
    "								<span ng-if=\"te.running\">\n" +
    "									running\n" +
    "								</span>\n" +
    "							</span>\n" +
    "							<span class=\"clearfix\"></span>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "				<div class=\"section-content-2 padding slide from-right\" ng-if=\"data.selected1 != -1\" ng-init=\"t = data.selected1\">\n" +
    "				<div class=\"test-result\">\n" +
    "					<div class=\"row\">\n" +
    "						<div class=\"{{ t.result.showDiff || t.dispute.active ? 'col-sm-6 col-md-6' : 'col-sm-12 col-md-12' }}\">\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">Status</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">\n" +
    "									<span ng-if=\"!t.dispute.active\">\n" +
    "										<span ng-if=\"t.result.passed\" class=\"color-passed\">\n" +
    "											<span class=\"glyphicon glyphicon-ok-sign\"></span> passed\n" +
    "									</span>\n" +
    "									<span ng-if=\"!t.result.passed\" class=\"color-failed\">\n" +
    "											<span class=\"glyphicon glyphicon-remove-sign\"></span> failed\n" +
    "									</span>\n" +
    "									<span>\n" +
    "											{{ t.result.executionTime > -1 ? ' - ' + t.result.executionTime + 'ms' : ' - timeout'  }}\n" +
    "										</span>\n" +
    "									</span>\n" +
    "									<span ng-if=\"t.dispute.active\" class=\"color-disputed\">\n" +
    "										<span class=\"glyphicon glyphicon-exclamation-sign\"></span> reported\n" +
    "									</span>\n" +
    "\n" +
    "								</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">description</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">it {{ t.description }}</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\" ng-if=\"t.result.message\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">Message</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">{{ t.result.message }}</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">Code</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">\n" +
    "									<js-reader code=\"t.code\"></js-reader>\n" +
    "								</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div class=\"col-sm-6 col-md-6\" ng-if=\"!t.dispute.active && t.result.showDiff\">\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-12 col-md-12 row-label\">\n" +
    "									<span style=\"width:10px;height:10px;display:inline-block;background-color:#CDFFCD\"></span> Expected\n" +
    "\n" +
    "\n" +
    "									<span style=\"width:10px;height:10px;display:inline-block;background-color:#FFD7D7\"></span> Actual\n" +
    "								</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-12 col-md-12\">\n" +
    "									<json-diff-reader old=\"t.result.expected\" new=\"t.result.actual\"></json-diff-reader>\n" +
    "								</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div class=\"col-sm-6 col-md-6\" ng-if=\"t.dispute.active\">\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-12 col-md-12 row-label\">Reported reason</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-12 col-md-12\">\n" +
    "									<textarea class=\"dispute\" ng-model=\"t.dispute.text\"></textarea>\n" +
    "								</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/implement_behavior/implement_behavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/implement_behavior/implement_behavior.html",
    "<div ng-controller=\"ImplementBehavior\" >\n" +
    "\n" +
    "	<div class=\"header bg-color\">\n" +
    "		<span class=\"type  \">\n" +
    "			<span ng-switch=\"microtask.promptType\">\n" +
    "				<span ng-switch-when=\"WRITE\">Edit function</span>\n" +
    "				<span ng-switch-when=\"CORRECT\">Correct function</span>\n" +
    "			</span>\n" +
    "		</span>\n" +
    "		<span class=\"points\">( {{::microtask.points}} pts )</span>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', microtask.type, true); trackInteraction('Click Tutorial', 'Implement Behavior - Microtask', $event)\">\n" +
    "			<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "		</button>\n" +
    "		<span class=\"reissued\" ng-if=\"microtask.reissuedSubmission !== undefined\">REISSUED</span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"sections\" ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "\n" +
    "	    <div class=\"section\" ui-layout-container size=\"10%\" >\n" +
    "	    	<div class=\"section-content bg-color-alpha padding\" style=\"top:0\">\n" +
    "\n" +
    "				<div ng-switch=\"microtask.promptType\">\n" +
    "					<span ng-switch-when=\"WRITE\">\n" +
    "						Can you implement part of <strong ng-bind=\"funct.name\"></strong> by making one of the currently failing tests pass? If you don’t have enough time to make a test pass, you may also submit a partial solution.\n" +
    "					</span>\n" +
    "					<span ng-switch-when=\"CORRECT\">\n" +
    "						A worker reported an issue with the description of <strong ng-bind=\"funct.name\"></strong>. Can you fix the function to address this issue (if necessary)?\n" +
    "					</span>\n" +
    "					If you think that some of the functionality should be implemented in another function, you can request a new function to be created. For info on how to request a new function, click on <span class=\"glyphicon glyphicon-question-sign\"></span> in the function editor.\n" +
    "				</div>\n" +
    "\n" +
    "				<br />\n" +
    "				<div ng-if=\"microtask.reissuedSubmission !== undefined\">\n" +
    "					This task has been reissued because of \"<strong>{{microtask.reissueMotivation}}</strong>\"\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "		<div class=\"section\"  ui-layout-container size=\"30%\">\n" +
    "\n" +
    "			<div class=\"section-bar\">\n" +
    "\n" +
    "				<span class=\"pull-left title\" ng-if=\"data.selected == -1\">\n" +
    "					Behaviors\n" +
    "				</span>\n" +
    "\n" +
    "\n" +
    "				<span class=\"pull-left\" ng-if=\"data.selected != -1\">\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"toggleSelect($event)\">\n" +
    "						<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "						Back\n" +
    "					</button>\n" +
    "				</span>\n" +
    "\n" +
    "				<span class=\"pull-right\">\n" +
    "					<button class=\"btn btn-sm btn-run\" ng-click=\"run()\">\n" +
    "						<span class=\"glyphicon glyphicon-play\"></span>\n" +
    "						Run Tests\n" +
    "					</button>\n" +
    "\n" +
    "\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', 'running_tests', true); trackInteraction('Click Tutorial', 'Implement Behavior - Running Tests', $event) \">\n" +
    "						<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "					</button>\n" +
    "				</span>\n" +
    "\n" +
    "\n" +
    "				<span class=\"pull-right separator\" ng-if=\"data.selected != -1\"></span>\n" +
    "				<span class=\"pull-right\" ng-if=\"data.selected != -1\">\n" +
    "					<button\n" +
    "						class=\"btn btn-sm btn-dispute {{ data.selected.dispute.active ? 'active' : '' }}\"\n" +
    "						ng-click=\"toggleDispute($event);\">\n" +
    "						<span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "						Report an issue\n" +
    "					</button>\n" +
    "					<button\n" +
    "						class=\"btn btn-sm btn-inspect {{ !data.changedSinceLastRun && data.inspecting ? 'active' : '' }}\"\n" +
    "						ng-disabled=\"data.changedSinceLastRun\"\n" +
    "						ng-click=\"toggleInspect($event);\">\n" +
    "						<span class=\"glyphicon glyphicon-search\"></span>\n" +
    "						Inspect code\n" +
    "					</button>\n" +
    "				</span>\n" +
    "\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div class=\"section-content padding slide from-left\" ng-if=\"data.selected == -1\" >\n" +
    "				<div class=\"test-list \" >\n" +
    "					<div class=\"test-item clickable {{ !t.running ? (t.dispute.active ? 'disputed' : ( t.result.passed ? 'passed' : 'failed' ) ) : '' }}\"\n" +
    "						 ng-repeat=\"t in data.tests track by $index\">\n" +
    "						<div ng-click=\"toggleSelect($event,t);\">\n" +
    "							<strong class=\"pull-left\">\n" +
    "								<span class=\"glyphicon glyphicon glyphicon-chevron-right\"></span>\n" +
    "								{{ t.description }}\n" +
    "							</strong>\n" +
    "							<span class=\"pull-right\">\n" +
    "								<span ng-if=\"t.running\">\n" +
    "									running\n" +
    "								</span>\n" +
    "							</span>\n" +
    "							<span class=\"clearfix\"></span>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section-content padding slide from-right\" ng-if=\"data.selected != -1\" ng-init=\"t = data.selected\" >\n" +
    "				<div class=\"test-result\">\n" +
    "					<div class=\"row\">\n" +
    "						<div class=\"{{ t.result.showDiff || t.dispute.active ? 'col-sm-6 col-md-6' : 'col-sm-12 col-md-12' }}\" >\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">Status</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">\n" +
    "									<span ng-if=\"!t.dispute.active\">\n" +
    "										<span ng-if=\"t.result.passed\" class=\"color-passed\">\n" +
    "											<span class=\"glyphicon glyphicon-ok-sign\"></span> passed\n" +
    "										</span>\n" +
    "										<span ng-if=\"!t.result.passed\" class=\"color-failed\">\n" +
    "											<span class=\"glyphicon glyphicon-remove-sign\"></span> failed\n" +
    "										</span>\n" +
    "										<span>\n" +
    "											{{ t.result.executionTime > -1 ? ' - ' + t.result.executionTime + 'ms' : ' - timeout'  }}\n" +
    "										</span>\n" +
    "									</span>\n" +
    "									<span ng-if=\"t.dispute.active\" class=\"color-disputed\">\n" +
    "										<span class=\"glyphicon glyphicon-exclamation-sign\"></span> reported\n" +
    "									</span>\n" +
    "\n" +
    "								</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">description</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">it {{ t.description }}</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\" ng-if=\"t.result.message\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">Message</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\">{{ t.result.message }}</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\">\n" +
    "								<div class=\"col-sm-3 col-md-3 row-label\">Code</div>\n" +
    "								<div class=\"col-sm-9 col-md-9\"><js-reader code=\"t.code\"></js-reader></div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div class=\"col-sm-6 col-md-6\" ng-if=\"!t.dispute.active && t.result.showDiff\">\n" +
    "							<div class=\"row\" >\n" +
    "								<div class=\"col-sm-12 col-md-12 row-label\">\n" +
    "									<span style=\"width:10px;height:10px;display:inline-block;background-color:#CDFFCD\"></span>\n" +
    "									Expected\n" +
    "\n" +
    "\n" +
    "									<span style=\"width:10px;height:10px;display:inline-block;background-color:#FFD7D7\"></span>\n" +
    "									Actual\n" +
    "								</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\" >\n" +
    "								<div class=\"col-sm-12 col-md-12\">\n" +
    "									<json-diff-reader old=\"t.result.expected\" new=\"t.result.actual\"></json-diff-reader>\n" +
    "								</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div class=\"col-sm-6 col-md-6\" ng-if=\"t.dispute.active\">\n" +
    "							<div class=\"row\" >\n" +
    "								<div class=\"col-sm-12 col-md-12 row-label\">Reported reason</div>\n" +
    "							</div>\n" +
    "							<div class=\"row\" >\n" +
    "								<div class=\"col-sm-12 col-md-12\">\n" +
    "									<textarea class=\"dispute\" ng-model=\"t.dispute.text\"></textarea>\n" +
    "								</div>\n" +
    "							</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section\"  ui-layout-container size=\"60%\">\n" +
    "			<div class=\"section-bar\" ng-show=\"!data.editingStub\">\n" +
    "				<span class=\"title\">\n" +
    "					Function Editor\n" +
    "				</span>\n" +
    "				<span class=\"pull-right\">\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', 'function_editor', true); trackInteraction('Click Tutorial', 'Implement Behavior - Function Editor', $event)\">\n" +
    "						<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "					</button>\n" +
    "				</span>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div class=\"section-content slide from-left\" ng-show=\"!data.editingStub\">\n" +
    "				<function-editor\n" +
    "		            function=\"funct\"\n" +
    "		            editor=\"data.editor\"\n" +
    "		            logs=\"(!data.inspecting) ? undefined : data.selected.logs \"\n" +
    "		            callbacks=\"editorCallbacks\"\n" +
    "		            >\n" +
    "		        </function-editor>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section-bar\" ng-show=\"data.editingStub\">\n" +
    "				<span class=\"title\">\n" +
    "					Stub Editor\n" +
    "				</span>\n" +
    "				<span class=\"pull-right\">\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"cancelStub()\">Cancel</button>\n" +
    "					<button class=\"btn btn-sm\" ng-click=\"saveStub()\">Save stub</button>\n" +
    "				</span>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div class=\"section-content padding slide from-right\"  style=\"z-index:100\" ng-show=\"data.editingStub\">\n" +
    "				<div class=\"stub\" ng-form=\"stubForm\">\n" +
    "					<div class=\"form-group\">\n" +
    "						<label>Function Description</label>\n" +
    "						<js-reader class=\"form-control code\" code=\"data.editingStub.functionDescription\"></js-reader>\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\"  ng-repeat=\"p in data.editingStub.parameters\">\n" +
    "						<label>\n" +
    "							{{p.name + ' {' + p.type + '}' }}\n" +
    "						</label>\n" +
    "\n" +
    "						<json-reader class=\"form-control code\" ng-model=\"p.value\"></json-reader>\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\" >\n" +
    "						<label for=\"\">\n" +
    "							Output {{ '{' + data.editingStub.output.type + '}' }}\n" +
    "						</label>\n" +
    "\n" +
    "						<div\n" +
    "							class=\"form-control code\"\n" +
    "							json-editor=\"{ type: data.editingStub.output.type, name: 'output' }\"\n" +
    "							ng-model=\"data.editingStub.output.value\"\n" +
    "							errors=\"errors\"\n" +
    "							name=\"output\"\n" +
    "							required>\n" +
    "						</div>\n" +
    "\n" +
    "						<div class=\"help-block\" ng-messages=\"stubForm.output.$error\" >\n" +
    "							<div ng-message=\"required\">the field output cannot be empty</div>\n" +
    "							<div ng-message=\"code\">{{errors.code}}</div>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "	        </div>\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/loading.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/loading.html",
    "<div class=\"loading-microtask\" >\n" +
    "	<div class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></div> Loading microtask...\n" +
    "</div>");
}]);

angular.module("microtasks/microtask_form.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/microtask_form.html",
    "<div \n" +
    "	id=\"task\"\n" +
    "	class=\"task {{ !noMicrotask ? 'task-' + (microtask.type | lowercase) : '' }}\" \n" +
    "	ng-include=\"templatePath\" \n" +
    "	>\n" +
    "</div>\n" +
    "\n" +
    "<reminder></reminder>\n" +
    "\n" +
    "<div class=\"actions\">\n" +
    "	<div class=\"btn-group\">\n" +
    "	\n" +
    "		<button\n" +
    "		   type=\"button\"\n" +
    "		   class=\"btn btn-link btn-sm\"\n" +
    "		   data-placement=\"top\" \n" +
    "		   data-container=\"body\"\n" +
    "		   data-animation=\"am-fade-and-scale\"\n" +
    "		   data-template=\"widgets/feedback.popover.html\"\n" +
    "		   tabindex=\"101\"  \n" +
    "		   bs-popover>Send Us Feedback!\n" +
    "		</button>\n" +
    "		<button \n" +
    "		   ng-if=\"!breakMode && !noMicrotask\" \n" +
    "		   type=\"button\"\n" +
    "		   class=\"btn btn-link btn-sm\" \n" +
    "		   data-placement=\"top\" \n" +
    "		   data-container=\"body\"\n" +
    "		   data-animation=\"am-fade-and-scale\"\n" +
    "		   data-trigger=\"focus\"\n" +
    "		   data-template=\"widgets/confused.popover.html\"\n" +
    "		   tabindex=\"102\" \n" +
    "		   bs-popover>\n" +
    "		   Confused?\n" +
    "		</button>\n" +
    "	  	<button \n" +
    "	  		type=\"submit\" \n" +
    "  			id=\"submitBtn\"\n" +
    "	  		class=\"btn btn-primary btn-sm pull-right\"\n" +
    "   			ng-if=\"!breakMode && !noMicrotask\"\n" +
    "	  		ng-click=\"submit()\"\n" +
    "	  		tabindex=\"99\" >\n" +
    "	  		Submit\n" +
    "	  	</button>\n" +
    "  	   	<button type=\"button\" \n" +
    "   	 		id= \"skipBtn\"\n" +
    "   			class=\"btn btn-default btn-sm pull-right\"\n" +
    "   			ng-if=\"!breakMode && !noMicrotask\"\n" +
    "   			ng-click=\"skip()\" \n" +
    "   			tabindex=\"100\" >\n" +
    "   			Skip\n" +
    "   		</button>\n" +
    "	  	<!--<label class=\"btn btn-sm pull-right\" ng-if=\"!breakMode && !noMicrotask\" id=\"breakBtn\">\n" +
    "  	    	<input type=\"checkbox\" ng-model=\"taskData.startBreak\" tabindex=\"103\" >\n" +
    "  	    	<span>{{currentPrompt()}}</span>\n" +
    "  	   	</label>-->\n" +
    "  	   	\n" +
    "		<button type=\"button\"\n" +
    "   			class=\"btn btn-primary btn-sm pull-right\"\n" +
    "   			ng-if=\"breakMode \"\n" +
    "   			ng-click=\"fetch()\" \n" +
    "   			tabindex=\"100\" >\n" +
    "	       	Fetch a microtask\n" +
    "   		</button>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/microtask_title.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/microtask_title.html",
    "<span class=\"pull-left\">\n" +
    "	<span class=\"type  bg-color\">{{::microtask.title}}</span>\n" +
    "	<span class=\"reissued\" ng-if=\"microtask.reissuedSubmission !== undefined\">REISSUED</span>\n" +
    "	<span class=\"points\">( {{::microtask.points}} pts )</span>\n" +
    "</span>\n" +
    "<span class=\"pull-right\">\n" +
    "	<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', microtask.type, true); trackInteraction('Click Tutorial', 'Microtask Title', $event)\">\n" +
    "		<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "	</button>\n" +
    "</span>\n" +
    "<span class=\"clearfix\"></span>\n" +
    "");
}]);

angular.module("microtasks/modal_form_comments.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/modal_form_comments.html",
    "<div class=\"modal center\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\" >\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\">Review is incomplete!</h4>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <div style=\"text-align: center\"> Please provide comments on the why the work was rejected</div>\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <button type=\"button\" class=\"btn btn-sm\" ng-click=\"$hide()\">Close</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("microtasks/modal_form_invalid.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/modal_form_invalid.html",
    "<div class=\"modal center\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\" >\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\">The task is invalid!</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\">\n" +
    "				<div style=\"text-align: center\"> Please fix all the errors in the function code and tests before submitting the microtask!</div>\n" +
    "            </div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-sm\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/modal_form_pristine.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/modal_form_pristine.html",
    "<div class=\"modal center\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\" >\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\">The task has not been touched!</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\">\n" +
    "				<div style=\"text-align: center\"> It seems that you didn't work on this microtask. Before you submit, work a little bit or you can skip this task</div>\n" +
    "            </div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-sm\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/no_microtask/no_microtask.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/no_microtask/no_microtask.html",
    "<div ng-controller=\"NoMicrotaskController\" >\n" +
    "	<div ng-hide=\"breakMode\" class=\"alert alert-warning no-microtask\" role=\"alert\" >\n" +
    "		SORRY, there aren't available microtasks at the moment. <br />\n" +
    "		The microtask queue will be checked again in <strong> {{checkQueueIn}} seconds </strong>.\n" +
    "	</div>\n" +
    "\n" +
    "	<h2>Workers Stats</h2>\n" +
    "	<div class=\"stats\">\n" +
    "		<ul>\n" +
    "		  <li ng-repeat=\"leader in leaders track by $index | orderBy:'-score'\" ng-if=\"leaders.length > 0\" \n" +
    "		  	  class=\"{{ leaders.$keyAt(leader) == workerId ? 'self' : '' }}\" >\n" +
    "		  	\n" +
    "		  		<div class=\"position\">#{{$index+1}} - {{ leader.score }} pts</div>\n" +
    "		  		<div class=\"avatar\"><img ng-src=\"{{ avatar(leaders.$keyAt(leader)).$value }}\" alt=\"{{ ::leader.name }}\" style=\"width:50px; height:55px\"/></div>\n" +
    "			    <div class=\"name\">{{::(leader.name) }}</div>\n" +
    "		  		<div class=\"clearfix\"></div>\n" +
    "\n" +
    "			\n" +
    "		  </li>\n" +
    "		</ul>\n" +
    "		<span ng-if=\"leaders.length == 0\" >\n" +
    "			no leaders yet!\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/reissue_microtask.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/reissue_microtask.html",
    "<div >\n" +
    "	<div class=\"section section-description\"  >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			REISSUE MOTIVATION\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			{{microtask.reissueMotivation}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/review/review.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review.html",
    "<div ng-controller=\"ReviewController\">\n" +
    "\n" +
    "	<div class=\"header bg-color\">\n" +
    "		<span class=\"type  \">Review Work</span>\n" +
    "		<span class=\"reissued\" ng-if=\"microtask.reissuedSubmission !== undefined\">REISSUED</span>\n" +
    "		<span class=\"points\">( {{::microtask.points}} pts )</span>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"$emit('queue-tutorial', microtask.type, true); trackInteraction('Click Tutorial', 'Review - Microtask', $event)\">\n" +
    "			<span class=\"glyphicon glyphicon-question-sign\"></span>\n" +
    "		</button>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "    </div>\n" +
    "\n" +
    "	<div ng-include src=\"'microtasks/review/review_' + review.template + '.html'\" ></div>\n" +
    "\n" +
    "<!--\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>RATING SYSTEM\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<ul style=\"list-style:none;margin:0px;padding:0px;\">\n" +
    "						<li><b>1 Star</b>: Incoherent or unfocussed</li>\n" +
    "						<li><b>2 Stars</b>: Unconvincing or weak</li>\n" +
    "						<li><b>3 Stars</b>: There are some weakness</li>\n" +
    "						<li><b>4 Stars</b>: Good quality, without weakness</li>\n" +
    "						<li><b>5 Stars</b>: Excellent without weakness</li>\n" +
    "					</ul>\n" +
    "\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "\n" +
    "					<div class=\"heading-1\" >rating</div>\n" +
    "					<div id=\"ratingsDiv\" class=\"stars-container pull-left\" >\n" +
    "						<span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\"\n" +
    "							  ng-mouseenter=\"review.mouseOn=currentValue\"\n" +
    "							  ng-mouseleave=\"review.mouseOn=0\"\n" +
    "							  ng-click=\"rate(currentValue)\">\n" +
    "							<span class=\"star {{ ( review.mouseOn > $index || review.rating > $index ) ? 'full' : '' }}\"></span>\n" +
    "							<span ng-if=\"$index == 2\" class=\"stars-separator\" ></span>\n" +
    "						</span>\n" +
    "					</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "					<span class=\"rating-result pull-left\" ng-if=\"review.rating != -1\">\n" +
    "						<strong ng-if=\"review.rating <= 3\"><span class=\"glyphicon glyphicon-refresh\"></span> revise work</strong>\n" +
    "						<strong ng-if=\"review.rating > 3\"><span class=\"glyphicon glyphicon-ok\"></span> work accepted</strong>\n" +
    "					</span>\n" +
    "\n" +
    "					<span class=\"clearfix\"></span>\n" +
    "\n" +
    "					<div class=\"heading-1\" >review</div>\n" +
    "					<textarea\n" +
    "						id=\"reviewText\" class=\"col-md-12 form-control input-sm\" ng-model=\"review.reviewText\" name=\"reviewText\" ng-required=\"review.rating < 4\" focus style=\"resize:none;height:100px;\"></textarea>\n" +
    "					<span\n" +
    "					class=\"help-block\" ng-show=\"microtaskForm.reviewText.$dirty && review.rating < 4 && microtaskForm.reviewText.$invalid && microtaskForm.reviewText.$error.required\">This field is required!</span>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "-->\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteFunction.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_WriteFunction.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"reviewed.submission.inDispute\">\n" +
    "			A worker has reported the following function as not implementable.  Can you review this request?\n" +
    "		</div>\n" +
    "		<div ng-if=\"! reviewed.submission.inDispute\">\n" +
    "			<div ng-if=\"reviewed.promptType == 'SKETCH'\">\n" +
    "				A worker was asked to edit the code of the function <strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType == 'RE_EDIT'\">\n" +
    "				A worker was asked to revise the following function (if necessary) to address an issue reported by the crowd.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "				A worker was asked to revise the following function (if necessary) based on a change to the signature of a function it calls.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"reviewed.promptType=='REMOVE_CALLEE'\">\n" +
    "				The crowd determined that the function <strong>{{callee.getName()}}</strong>, which was called in the function below, could not be implemented as requested, for the reason below.  As a result, a worker was asked to replace the call(s) to <strong>{{callee.getName()}}</strong> with a new 	implementation.\n" +
    "			</div>\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"! reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description-2\" ng-if=\"reviewed.disputeText.length > 0\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Reported Issue\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" ng-if=\"reviewed.disputeText.length > 0\" >\n" +
    "			{{reviewed.disputeText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"reviewed.promptType == 'REMOVE_CALLEE'\">\n" +
    "		<div class=\"section section-description-2\">\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>Description of Function Call to Remove\n" +
    "			</div>\n" +
    "			<div class=\"section-content no-padding\" >\n" +
    "				<ace-read-js code=\"callee.getSignature()\" ></ace-read-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"reviewed.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "		<div class=\"section section-description-2\">\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>Changes to Function Signature\n" +
    "			</div>\n" +
    "			<div class=\"section-content no-padding\" >\n" +
    "				<ace-read-js code=\"calledDiffCode\" mode=\"diff\" ></ace-read-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-review\" >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Diff of edits to function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"reviewed.submission.inDispute\">\n" +
    "	<div class=\"section section-description-2\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>reported function\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"review.functionCode\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-review\">\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			{{reviewed.submission.disputeFunctionText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_WriteTest.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_WriteTest.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "\n" +
    "		<div ng-if=\"! review.microtask.submission.inDispute\">\n" +
    "			<div ng-if=\"review.microtask.promptType=='WRITE'\">\n" +
    "				A worker was asked to implement the following test case for\n" +
    "				the function <strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='CORRECT'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong>  to address the following issue.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong> (if necessary) based on a change to the description of the test case.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "				A worker was asked to revise the following test for the function \n" +
    "				<strong>{{funct.name}}</strong> \n" +
    "				(if necessary) to work correctly with the new function signature specified below.\n" +
    "			</div>\n" +
    "			<span>Can you review this work?</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"review.microtask.submission.inDispute\">\n" +
    "			<div ng-if=\"review.microtask.submission.disputeFunctionText!=''\" >\n" +
    "				A worker reported the following issue with the function\n" +
    "				<strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"review.microtask.submission.disputeTestText!=''\" >\n" +
    "				A worker reported the following issue with the following test case for the function\n" +
    "				<strong>{{funct.name}}</strong>.\n" +
    "			</div>\n" +
    "			<span>Can you review this issue?</span>\n" +
    "			<span>\n" +
    "				<strong>TIP:</strong>When you review an issue, rate high means agree on the issue.\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\">\n" +
    "	<div class=\"section-title\">\n" +
    "		<div class=\"dot bg-color\"></div>\n" +
    "		<span ng-if=\"reviewed.submission.disputeFunctionText!=''\">\n" +
    "			REPORTED FUNCTION DESCRIPTION\n" +
    "		</span>\n" +
    "		<span ng-if=\"reviewed.submission.disputeFunctionText==''\">\n" +
    "			FUNCTION DESCRIPTION\n" +
    "		</span>\n" +
    "	</div>\n" +
    "	<div class=\"section-content no-padding\" >\n" +
    "		<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\" ng-if=\"reviewed.submission.disputeFunctionText==''\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Test case</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-content\" >\n" +
    "		<span ng-if=\"review.microtask.promptType!='TESTCASE_CHANGED' || reviewed.submission.inDispute\">\n" +
    "			{{reviewed.owningArtifact}}\n" +
    "		</span>\n" +
    "\n" +
    "		<span ng-if=\"review.microtask.promptType=='TESTCASE_CHANGED' && ! reviewed.submission.inDispute\">\n" +
    "			<strong>Old description: </strong><span ng-bind=\"review.microtask.oldTestCase\"></span><br />\n" +
    "			<strong>New description: </strong><span ng-bind=\"review.microtask.owningArtifact\"></span>\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"review.microtask.submission.inDispute\" class=\"section section-review\">\n" +
    "	<div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "	<div class=\"section-content\" >\n" +
    "		{{reviewed.submission.disputeTestText}}\n" +
    "		{{reviewed.submission.disputeFunctionText}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"! reviewed.submission.inDispute\" >\n" +
    "	<div class=\"section section-review\">\n" +
    "		<div  class=\"section-title\" ><div class=\"dot bg-color\"></div>submitted TEST</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<table style=\"width:100%\" class=\"test\">\n" +
    "				<tr ng-repeat=\"(inputKey,input) in review.microtask.submission.simpleTestInputs track by $index\">\n" +
    "					<td>{{funct.getParamNameAt($index)}}</td>\n" +
    "					<td>\n" +
    "						<div ace-read-json ng-model=\"input\" ></div>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "				<tr ng-if=\"funct.returnType!=undefined\">\n" +
    "					<td>test output</td>\n" +
    "					<td>\n" +
    "						<div ace-read-json ng-model=\"review.microtask.submission.simpleTestOutput\" ></div>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</table>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/review/review_describe.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_describe.html",
    "<div class=\"sections\" ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"10%\">\n" +
    "		<div class=\"section-content bg-color-alpha padding\" style=\"top:0px\">\n" +
    "			<span>\n" +
    "				The test suite and implementation for <strong ng-bind=\"function.name\"></strong> has been updated by adding, editing, or deleting its tests and implementation. Considering just <strong>the changes</strong> to the test suite and function implementation, can you review them?\n" +
    "			</span>\n" +
    "			<span>TIP:When you review an issue, high rate means that you agree on the issue.</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"35%\" >\n" +
    "		<div class=\"section-bar\">\n" +
    "			<span class=\"title\">Code edits</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			<js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"30%\" >\n" +
    "		<div class=\"section-bar\" ng-if=\"data.selected == -1\">\n" +
    "			<span class=\"title\">Tests</span>\n" +
    "			<span class=\"pull-right\">\n" +
    "				<span> {{data.stats.added}} added </span> /\n" +
    "				<span> {{data.stats.edited}} edited </span> /\n" +
    "				<span> {{data.stats.deleted}} deleted </span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content slide from-left\" ng-if=\"data.selected == -1\">\n" +
    "			<div class=\"tests-list has-next \">\n" +
    "				<div class=\"test-item clickable\"\n" +
    "				     ng-repeat=\"t in data.tests track by $index\">\n" +
    "					<div ng-click=\"data.selected = t\">\n" +
    "						<span class=\"pull-left\">\n" +
    "							<span class=\"glyphicon glyphicon glyphicon-chevron-right\"></span>\n" +
    "							<span ng-bind=\"t.description\"></span>\n" +
    "						</span>\n" +
    "\n" +
    "						<span class=\"pull-right\" ng-if=\"t.edited\">\n" +
    "							edited\n" +
    "							<span class=\"glyphicon glyphicon-pencil\"  ></span>\n" +
    "						</span>\n" +
    "						<span class=\"pull-right\" ng-if=\"t.added\">\n" +
    "							added\n" +
    "							<span class=\"glyphicon glyphicon-plus\"  ></span>\n" +
    "						</span>\n" +
    "						<span class=\"pull-right\" ng-if=\"t.deleted\">\n" +
    "							removed\n" +
    "							<span class=\"glyphicon glyphicon-remove\"  ></span>\n" +
    "						</span>\n" +
    "						<span class=\"clearfix\"></span>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div>\n" +
    "				<strong ng-if=\"data.isComplete\">The test suite has been marked as complete.</strong>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-bar\" ng-if=\"data.selected != -1\">\n" +
    "			<span class=\"pull-left\" >\n" +
    "				<button class=\"btn btn-sm\" ng-click=\"data.selected = -1\">\n" +
    "					<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "				</button>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content slide from-right padding\"\n" +
    "				 ng-repeat=\"t in data.tests track by $index\"\n" +
    "				 ng-if=\"data.selected == t\">\n" +
    "				<div ng-form=\"{{ 'testForm_'+$index }}\" class=\"form form-material\" ng-init=\"errors = {}\">\n" +
    "\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"description\">Status </label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{ t.added ? 'added' : t.edited ? 'edited' : t.deleted ? 'deleted' : 'untouched' }}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"description\">Description </label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{t.description}}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label>Type</label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{t.isSimple ? 'input/output' : 'assertion'}}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\" ng-if=\"!t.isSimple\">\n" +
    "						<label for=\"code\">Code</label>\n" +
    "						<div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "					</div>\n" +
    "\n" +
    "					<div ng-if=\"t.isSimple\" ng-form=\"inputs\" >\n" +
    "						<div class=\"form-group\"  ng-repeat=\"(pIdx,p) in funct.parameters track by p.name\">\n" +
    "							<label for=\"inputs\">\n" +
    "								{{p.name + ' {' + p.type + '}' }}\n" +
    "							</label>\n" +
    "\n" +
    "							<div\n" +
    "								class=\"form-control code\"\n" +
    "								json-reader\n" +
    "								name=\"{{p.name}}\"\n" +
    "								ng-model=\"t.inputs[pIdx]\">\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "						<label for=\"code\">Output {{ '{' + funct.returnType + '}'}}</label>\n" +
    "						<div\n" +
    "							class=\"form-control code\"\n" +
    "							json-reader\n" +
    "							ng-model=\"t.output\"\n" +
    "							name=\"output\">\n" +
    "						</div>\n" +
    "					</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "				</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"25%\" ng-include=\"'microtasks/review/review_form.html'\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_describe_dispute.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_describe_dispute.html",
    "<div class=\"sections\" ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "	<div class=\"section\" ui-layout-container size=\"7%\">\n" +
    "		<div class=\"section-content bg-color-alpha padding\" style=\"top:0px\">\n" +
    "			<span ng-if=\"data.disputeText\">\n" +
    "				A worker reported an issue with the description of <strong ng-bind=\"data.funct.name\"></strong>. Can you review the reported issue?\n" +
    "			</span>\n" +
    "			<span ng-if=\"data.disputedTests\">\n" +
    "				A worker was asked to implement part of the function and also reported an issue with the following tests. Can you review this work?\n" +
    "			</span>\n" +
    "\n" +
    "			<span>TIP:When you review an issue, high rate means that you agree on the issue.</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"33%\" >\n" +
    "		<div class=\"section-bar\">\n" +
    "			<span class=\"title\">Code edits</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			<js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"{{!data.disputedTests ? 35 : 10}}%\" ng-if=\"data.disputeText\">\n" +
    "		<div class=\"section-bar\">\n" +
    "			<span class=\"title\">Report description</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content padding\">\n" +
    "			<span ng-bind=\"data.disputeText\"></span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"{{!data.disputeText ? 35 : 25}}%\" ng-if=\"data.disputedTests\">\n" +
    "		<div class=\"section-bar\" ng-if=\"data.selected == -1\">\n" +
    "			<span class=\"title\">Reported Tests</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content slide from-left\" ng-if=\"data.selected == -1\">\n" +
    "			<div class=\"tests-list\">\n" +
    "				<div class=\"test-item clickable\" ng-repeat=\"t in data.disputedTests track by $index\">\n" +
    "					<div ng-click=\"data.selected = t\">\n" +
    "						<span >\n" +
    "							<span class=\"glyphicon glyphicon glyphicon-chevron-right\"></span>\n" +
    "							<span ng-bind=\"t.description\"></span>\n" +
    "						</span>\n" +
    "						<span class=\"clearfix\"></span>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"section-bar\" ng-if=\"data.selected != -1\">\n" +
    "			<span class=\"pull-left\" >\n" +
    "				<button class=\"btn btn-sm\" ng-click=\"data.selected = -1\">\n" +
    "					<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "				</button>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content slide from-right padding\"\n" +
    "				 ng-repeat=\"t in data.disputedTests track by $index\"\n" +
    "				 ng-if=\"data.selected == t\">\n" +
    "				<div ng-form=\"{{ 'testForm_'+$index }}\" class=\"form form-material\" ng-init=\"errors = {}\">\n" +
    "\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"disputetext\">Dispute reason </label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"disputetext\">\n" +
    "							{{ t.disputeText }}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"description\">Description </label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{t.description}}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label>Type</label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{t.isSimple ? 'simple' : 'advanced'}}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\" ng-if=\"!t.isSimple\">\n" +
    "						<label for=\"code\">Code</label>\n" +
    "						<div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "					</div>\n" +
    "\n" +
    "					<div ng-if=\"t.isSimple\" ng-form=\"inputs\" >\n" +
    "						<div class=\"form-group\"  ng-repeat=\"(pIdx,p) in funct.parameters track by p.name\">\n" +
    "							<label for=\"inputs\">\n" +
    "								{{p.name + ' {' + p.type + '}' }}\n" +
    "							</label>\n" +
    "\n" +
    "							<div\n" +
    "								class=\"form-control code\"\n" +
    "								json-reader\n" +
    "								name=\"{{p.name}}\"\n" +
    "								ng-model=\"t.inputs[pIdx]\">\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "						<label for=\"code\">Output {{ '{' + funct.returnType + '}'}}</label>\n" +
    "						<div\n" +
    "							class=\"form-control code\"\n" +
    "							json-reader\n" +
    "							ng-model=\"t.output\"\n" +
    "							name=\"output\">\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"25%\" ng-include=\"'microtasks/review/review_form.html'\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_form.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_form.html",
    "<div class=\"section-bar\"> \n" +
    "	<span class=\"title\">Review </span>\n" +
    "</div>\n" +
    "<div class=\"section-content padding\" ng-form=\"reviewForm\">\n" +
    "	<div class=\"form-horizontal\">\n" +
    "		<div class=\"form-group\">\n" +
    "			<label>Quality</label>\n" +
    "			<div rating name=\"rating\" class=\"form-control\" ng-model=\"review.rating\"></div>\n" +
    "			<span class=\"help-block\" \n" +
    "				  ng-if=\"reviewForm.rating.$dirty\" \n" +
    "				  ng-messages=\"reviewForm.rating.$error\">\n" +
    "				  <span ng-message=\"required\">This field is required!</span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "		<div class=\"form-group\">\n" +
    "			<label> Comment </label>\n" +
    "			<textarea \n" +
    "				id=\"reviewText\" \n" +
    "				class=\"form-control\" \n" +
    "				ng-model=\"review.text\" \n" +
    "				name=\"text\" \n" +
    "				ng-required=\"review.rating < 4\"\n" +
    "				style=\"resize:none;height:3em;\">\n" +
    "			</textarea>\n" +
    "			<span class=\"help-block\" \n" +
    "				  ng-if=\"reviewForm.text.$dirty\" \n" +
    "				  ng-messages=\"reviewForm.text.$error\">\n" +
    "				  <span ng-message=\"required\">This field is required!</span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/review/review_implement.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_implement.html",
    "<div class=\"sections\" ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "	<div class=\"section\" ui-layout-container size=\"10%\">\n" +
    "		<div class=\"section-content bg-color-alpha padding\" style=\"top:0px\">\n" +
    "			<span>\n" +
    "				A worker was asked to implement part of the function <strong>{{data.functionName}}</strong>. Can you review this work?\n" +
    "			</span>\n" +
    "\n" +
    "			<span>TIP:When you review an issue, high rate means that you agree on the issue.</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"65%\" >\n" +
    "		<div class=\"section-bar\">\n" +
    "			<span class=\"title\">Code edits</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			<js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"25%\" >\n" +
    "		<div ng-include=\"'microtasks/review/review_form.html'\" include-replace></div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_implement_dispute.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_implement_dispute.html",
    "<div class=\"sections\" ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "	<div class=\"section\" ui-layout-container size=\"10%\">\n" +
    "		<div class=\"section-content bg-color-alpha padding\" style=\"top:0px\">\n" +
    "			<span>\n" +
    "				A worker was asked to implement part of the function <strong>{{data.functionName}}</strong> and also  reported an issue with the following tests. Can you review this work?\n" +
    "			</span>\n" +
    "\n" +
    "			<span>TIP:When you review an issue, high rate means that you agree on the issue.</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"35%\" >\n" +
    "		<div class=\"section-bar\">\n" +
    "			<span class=\"title\">Code edits</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			<js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"30%\" >\n" +
    "		<div class=\"section-bar\" ng-if=\"data.selected == -1\">\n" +
    "			<span class=\"title\">Reported Tests</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content slide from-left\" ng-if=\"data.selected == -1\">\n" +
    "			<div class=\"tests-list\">\n" +
    "				<div class=\"test-item clickable\" ng-repeat=\"t in data.disputedTests track by $index\">\n" +
    "					<div ng-click=\"data.selected = t\">\n" +
    "						<span >\n" +
    "							<span class=\"glyphicon glyphicon glyphicon-chevron-right\"></span>\n" +
    "							<span ng-bind=\"t.description\"></span>\n" +
    "						</span>\n" +
    "						<span class=\"clearfix\"></span>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"section-bar\" ng-if=\"data.selected != -1\">\n" +
    "			<span class=\"pull-left\" >\n" +
    "				<button class=\"btn btn-sm\" ng-click=\"data.selected = -1\">\n" +
    "					<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "				</button>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "		<div class=\"section-content slide from-right padding\"\n" +
    "				 ng-repeat=\"t in data.disputedTests track by $index\"\n" +
    "				 ng-if=\"data.selected == t\">\n" +
    "				<div ng-form=\"{{ 'testForm_'+$index }}\" class=\"form form-material\" ng-init=\"errors = {}\">\n" +
    "\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"disputetext\">Dispute reason </label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"disputetext\">\n" +
    "							{{ t.disputeText }}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label for=\"description\">Description </label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{t.description}}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\">\n" +
    "						<label>Type</label>\n" +
    "						<div class=\"form-control form-control-static\" name=\"description\">\n" +
    "							{{t.isSimple ? 'simple' : 'advanced'}}\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"form-group\" ng-if=\"!t.isSimple\">\n" +
    "						<label for=\"code\">Code</label>\n" +
    "						<div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "					</div>\n" +
    "\n" +
    "					<div ng-if=\"t.isSimple\" ng-form=\"inputs\" >\n" +
    "						<div class=\"form-group\"  ng-repeat=\"(pIdx,p) in funct.parameters track by p.name\">\n" +
    "							<label for=\"inputs\">\n" +
    "								{{p.name + ' {' + p.type + '}' }}\n" +
    "							</label>\n" +
    "\n" +
    "							<div\n" +
    "								class=\"form-control code\"\n" +
    "								json-reader\n" +
    "								name=\"{{p.name}}\"\n" +
    "								ng-model=\"t.inputs[pIdx]\">\n" +
    "							</div>\n" +
    "						</div>\n" +
    "\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "						<label for=\"code\">Output {{ '{' + funct.returnType + '}'}}</label>\n" +
    "						<div\n" +
    "							class=\"form-control code\"\n" +
    "							json-reader\n" +
    "							ng-model=\"t.output\"\n" +
    "							name=\"output\">\n" +
    "						</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section\" ui-layout-container size=\"25%\" >\n" +
    "		<div ng-include=\"'microtasks/review/review_form.html'\" include-replace></div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/review/review_loading.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/review/review_loading.html",
    "<div class=\"loading-microtask\" >\n" +
    "	<div class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></div> Loading data...\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_detail.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail.html",
    "<div class=\"top padding\">\n" +
    "    <a href=\"#\" class=\"pull-left\" ng-click=\"$parent.setUiView('list');\">\n" +
    "      <span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "      back\n" +
    "    </a>\n" +
    "    <span class=\"clearfix\"></span>\n" +
    "</div>\n" +
    "<div class=\"middle padding\">\n" +
    "    <div class=\"task-{{ data.type | lowercase }}\">\n" +
    "\n" +
    "\n" +
    "        <!-- MICROTASK DATA -->\n" +
    "        <div ng-include=\"'newsfeed/news_detail_' + data.templateUrl + '.html'\">\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- REVIEW SCORE -->\n" +
    "        <label ng-if=\"!data.isReview\">Received review</label>\n" +
    "        <label ng-if=\"data.isReview\">Given review</label>\n" +
    "        <p>\n" +
    "            <div>\n" +
    "                <span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\"\n" +
    "                      class=\"rating-star {{ data.review.score >= currentValue ? 'full' : '' }}\">\n" +
    "                </span>\n" +
    "                <span class=\"clearfix\"></span><br />\n" +
    "            </div>\n" +
    "            <div>{{data.review.text}}</div>\n" +
    "        </p>\n" +
    "\n" +
    "<!--\n" +
    "        <a href=\"#\" class=\"pull-right\" ng-init=\"show=false\" ng-show=\"!show && data.canBeChallenged\" ng-click=\"show=true\">challenge this review</a>\n" +
    "        <span class=\"clearfix\"></span>\n" +
    "        <form name=\"challengeForm\" novalidate ng-show=\"show\" ng-submit=\"challengeForm.$valid && challengeReview()\">\n" +
    "            <div class=\"form-group\">\n" +
    "                <textarea required name=\"text\" class=\"form-control\" ng-model=\"challengeText\" placeholder=\"Challenge text\"></textarea>\n" +
    "            </div>\n" +
    "            <span class=\"btn-group pull-right\">\n" +
    "                <button type=\"button\" class=\"btn btn-xs btn-default\" ng-click=\"show = false\">Cancel</button>\n" +
    "                <button type=\"submit\" class=\"btn btn-xs btn-primary\">Challenge</button>\n" +
    "            </span>\n" +
    "\n" +
    "            <div class=\"clearfix\"></div>\n" +
    "        </form>-->\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_detail_DescribeFunctionBehavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_DescribeFunctionBehavior.html",
    "<label>Title</label>\n" +
    "<p ng-switch=\"data.promptType\">\n" +
    "    <span ng-switch-when=\"WRITE\"> You were asked to implement part of the function and/or write a test for function <strong ng-bind=\"funct.name\"></strong> </span>\n" +
    "    <span ng-switch-when=\"CORRECT\">You were asked to fix an issue that was reported for the function <strong ng-bind=\"funct.name\"></strong>. correct implementation and/or test(s)</span>\n" +
    "    <span ng-switch-when=\"FUNCTION_CHANGED'\">fix test(s)</span>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Description</label>\n" +
    "<p ng-switch=\"data.promptType\">\n" +
    "    <span ng-switch-when=\"WRITE\">\n" +
    "        Write implementation and/or test(s) for the function <strong>{{data.functionName}}</strong>.\n" +
    "    </span>\n" +
    "    <span ng-switch-when=\"CORRECT\">\n" +
    "        Correct implementation and/or a test for the function <strong>{{data.functionName}}</strong>\n" +
    "    </span>\n" +
    "    <span ng-switch-when=\"FUNCTION_CHANGED'\">\n" +
    "        Fix the test for the function <strong>{{data.functionName}}</strong> after a change of signature.\n" +
    "    </span>\n" +
    "</span>\n" +
    "</p>\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "</p>\n" +
    "\n" +
    "<label ng-if=\"data.tests.length > 0\">Submitted tests</label>\n" +
    "<p ng-if=\"data.tests.length > 0\">\n" +
    "    <div class=\"tests-list\" bs-collapse ng-model=\"data.openedTests\" data-allow-multiple=\"true\">\n" +
    "        <div ng-repeat=\"t in data.tests\">\n" +
    "            <div class=\"test-item clickable\" bs-collapse-toggle>\n" +
    "\n" +
    "\n" +
    "                <strong>{{t.description}}</strong>\n" +
    "\n" +
    "                <small class=\"pull-right\" ng-if=\"t.edited\">\n" +
    "                    edited\n" +
    "                    <span class=\"glyphicon glyphicon-pencil\"  ></span>\n" +
    "                </small>\n" +
    "                <small class=\"pull-right\" ng-if=\"t.added\">\n" +
    "                    added\n" +
    "                    <span class=\"glyphicon glyphicon-plus\"  ></span>\n" +
    "                </small>\n" +
    "                <small class=\"pull-right\" ng-if=\"t.deleted\">\n" +
    "                    removed\n" +
    "                    <span class=\"glyphicon glyphicon-remove\"  ></span>\n" +
    "                </small>\n" +
    "                <span class=\"clearfix\"></span>\n" +
    "            </div>\n" +
    "            <div bs-collapse-target style=\"padding:5px;\">\n" +
    "                <div ng-if=\"t.isSimple\">\n" +
    "                    <div class=\"form-group\"  ng-repeat=\"(pIdx,p) in data.functionParameters track by p.name\">\n" +
    "                        <label for=\"inputs\">\n" +
    "                            Input: {{p.name + ' {' + p.type + '}' }}\n" +
    "                        </label>\n" +
    "\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            name=\"{{p.name}}\"\n" +
    "                            ng-model=\"t.inputs[pIdx]\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "                        <label for=\"code\">Output {{ '{' + data.functionReturnType + '}'}}</label>\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            ng-model=\"t.output\"\n" +
    "                            name=\"output\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-if=\"!t.isSimple\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"code\">Code</label>\n" +
    "                        <div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <strong ng-if=\"data.isComplete\">the test suite is marked as complete</strong>\n" +
    "</p>\n" +
    "");
}]);

angular.module("newsfeed/news_detail_DescribeFunctionBehavior_disputed.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_DescribeFunctionBehavior_disputed.html",
    "<label>Title </label>\n" +
    "<p ng-switch=\"data.promptType\">\n" +
    "    <span ng-switch-when=\"WRITE\">write a test</span>\n" +
    "    <span ng-switch-when=\"CORRECT\">correct test(s)</span>\n" +
    "    <span ng-switch-when=\"FUNCTION_CHANGED'\">fix test(s)</span>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Description</label>\n" +
    "<p ng-switch=\"data.promptType\">\n" +
    "    You reported an issue with the function <strong ng-bind=\"data.functionName\"></strong>\n" +
    "</span>\n" +
    "</p>\n" +
    "\n" +
    "<label>Issue description</label>\n" +
    "<p>\n" +
    "    {{ data.disputeText }}\n" +
    "</p>\n" +
    "   ");
}]);

angular.module("newsfeed/news_detail_ImplementBehavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_ImplementBehavior.html",
    "<label>Description</label>\n" +
    "<p ng-switch=\"data.promptType\">\n" +
    "	<span ng-switch-when=\"WRITE\">\n" +
    "		You were asked to implement part of the function <strong ng-bind=\"funct.name\"></strong>\n" +
    "	</span>\n" +
    "	<span ng-switch-when=\"CORRECT\">\n" +
    "		You were asked to fix an issue that was reported for the function <strong ng-bind=\"funct.name\"></strong>.\n" +
    "	</span>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "</p>");
}]);

angular.module("newsfeed/news_detail_ImplementBehavior_disputed.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_ImplementBehavior_disputed.html",
    "<label>Description</label>\n" +
    "<p ng-switch=\"data.promptType\">\n" +
    "	<span ng-switch-when=\"WRITE\">\n" +
    "		You were asked to implement part of the function <strong ng-bind=\"funct.name\"></strong>\n" +
    "	</span>\n" +
    "	<span ng-switch-when=\"CORRECT\">\n" +
    "		You were asked to fix an issue that was reported for the function <strong ng-bind=\"funct.name\"></strong>.\n" +
    "	</span>\n" +
    "</p>\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Reported tests</label>\n" +
    "<p>\n" +
    "    <div class=\"tests-list\" bs-collapse ng-model=\"data.openedTests\" data-allow-multiple=\"true\">\n" +
    "        <div ng-repeat=\"t in data.disputedTests\">\n" +
    "            <div class=\"test-item clickable\" bs-collapse-toggle>\n" +
    "                <strong>{{t.description}}</strong>\n" +
    "            </div>\n" +
    "            <div bs-collapse-target style=\"padding:5px\">\n" +
    "                <div class=\"form-group\">\n" +
    "					<label for=\"disputetext\">Report description </label>\n" +
    "					<div class=\"form-control form-control-static\" name=\"disputetext\">\n" +
    "						{{ t.disputeText }}\n" +
    "					</div>\n" +
    "				</div>\n" +
    "                <div ng-if=\"t.isSimple\">\n" +
    "                    <div class=\"form-group\"  ng-repeat=\"(pIdx,p) in data.functionParameters track by p.name\">\n" +
    "                        <label for=\"inputs\">\n" +
    "                            Input: {{p.name + ' {' + p.type + '}' }}\n" +
    "                        </label>\n" +
    "                    \n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            name=\"{{p.name}}\"\n" +
    "                            ng-model=\"t.inputs[pIdx]\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "                        <label for=\"code\">Output {{ '{' + data.functionReturnType + '}'}}</label>\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            ng-model=\"t.output\"\n" +
    "                            name=\"output\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-if=\"!t.isSimple\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"code\">Code</label>\n" +
    "                        <div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <strong ng-if=\"data.isComplete\">the test suite is marked as complete</strong>\n" +
    "</p>\n" +
    "");
}]);

angular.module("newsfeed/news_detail_Review.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_Review.html",
    "REVIEWED!!\n" +
    "\n" +
    "{{data.reviewedData}}");
}]);

angular.module("newsfeed/news_detail_Review_DescribeFunctionBehavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_Review_DescribeFunctionBehavior.html",
    "<label>Description</label>\n" +
    "<p>\n" +
    "    The test suite and function implementation for <strong ng-bind=\"data.reviewed.functionName\"></strong> has been updated by adding, editing, or deleting its tests. Can you review this work?\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.reviewed.newCode\" old-code=\"data.reviewed.oldCode\" ></js-reader>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label ng-if=\"data.reviewed.tests.length > 0\">Submitted tests</label>\n" +
    "<p ng-if=\"data.reviewed.tests.length > 0\">\n" +
    "    <div class=\"tests-list\" bs-collapse ng-model=\"data.reviewed.openedTests\" data-allow-multiple=\"true\">\n" +
    "        <div ng-repeat=\"t in data.reviewed.tests\">\n" +
    "            <div class=\"test-item clickable\" bs-collapse-toggle>\n" +
    "\n" +
    "\n" +
    "                <strong>{{t.description}}</strong>\n" +
    "\n" +
    "                <small class=\"pull-right\" ng-if=\"t.edited\">\n" +
    "                    edited\n" +
    "                    <span class=\"glyphicon glyphicon-pencil\"  ></span>\n" +
    "                </small>\n" +
    "                <small class=\"pull-right\" ng-if=\"t.added\">\n" +
    "                    added\n" +
    "                    <span class=\"glyphicon glyphicon-plus\"  ></span>\n" +
    "                </small>\n" +
    "                <small class=\"pull-right\" ng-if=\"t.deleted\">\n" +
    "                    removed\n" +
    "                    <span class=\"glyphicon glyphicon-remove\"  ></span>\n" +
    "                </small>\n" +
    "                <span class=\"clearfix\"></span>\n" +
    "            </div>\n" +
    "            <div bs-collapse-target style=\"padding:5px;\">\n" +
    "                <div ng-if=\"t.isSimple\">\n" +
    "                    <div class=\"form-group\"  ng-repeat=\"(pIdx,p) in data.reviewed.functionParameters track by p.name\">\n" +
    "                        <label for=\"inputs\">\n" +
    "                            Input: {{p.name + ' {' + p.type + '}' }}\n" +
    "                        </label>\n" +
    "\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            name=\"{{p.name}}\"\n" +
    "                            ng-model=\"t.inputs[pIdx]\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "                        <label for=\"code\">Output {{ '{' + data.functionReturnType + '}'}}</label>\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            ng-model=\"t.output\"\n" +
    "                            name=\"output\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-if=\"!t.isSimple\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"code\">Code</label>\n" +
    "                        <div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <strong ng-if=\"data.isComplete\">the test suite is marked as complete</strong>\n" +
    "</p>\n" +
    "");
}]);

angular.module("newsfeed/news_detail_Review_DescribeFunctionBehavior_disputed.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_Review_DescribeFunctionBehavior_disputed.html",
    "<label>Description</label>\n" +
    "<p>\n" +
    "    A worker reported an issue with the description of <strong ng-bind=\"data.functionName\"></strong>. Can you review the reported issue?\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Reported issue</label>\n" +
    "<p>\n" +
    "    {{ data.reviewed.disputeText }}\n" +
    "</p>\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.reviewed.newCode\" old-code=\"data.reviewed.oldCode\" ></js-reader>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Reported tests</label>\n" +
    "<p>\n" +
    "    <div class=\"tests-list\" bs-collapse ng-model=\"data.reviewed.openedTests\" data-allow-multiple=\"true\">\n" +
    "        <div ng-repeat=\"t in data.reviewed.disputedTests\">\n" +
    "            <div class=\"test-item clickable\" bs-collapse-toggle>\n" +
    "                <strong>{{t.description}}</strong>\n" +
    "            </div>\n" +
    "            <div bs-collapse-target style=\"padding:5px\">\n" +
    "                <div class=\"form-group\">\n" +
    "					<label for=\"disputetext\">Report description </label>\n" +
    "					<div class=\"form-control form-control-static\" name=\"disputetext\">\n" +
    "						{{ t.disputeText }}\n" +
    "					</div>\n" +
    "				</div>\n" +
    "                <div ng-if=\"t.isSimple\">\n" +
    "                    <div class=\"form-group\"  ng-repeat=\"(pIdx,p) in data.reviewed.functionParameters track by p.name\">\n" +
    "                        <label for=\"inputs\">\n" +
    "                            Input: {{p.name + ' {' + p.type + '}' }}\n" +
    "                        </label>\n" +
    "\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            name=\"{{p.name}}\"\n" +
    "                            ng-model=\"t.inputs[pIdx]\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "                        <label for=\"code\">Output {{ '{' + funct.returnType + '}'}}</label>\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            ng-model=\"t.output\"\n" +
    "                            name=\"output\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-if=\"!t.isSimple\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"code\">Code</label>\n" +
    "                        <div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <strong ng-if=\"data.isComplete\">the test suite is marked as complete</strong>\n" +
    "</p>\n" +
    "");
}]);

angular.module("newsfeed/news_detail_Review_ImplementBehavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_Review_ImplementBehavior.html",
    "<label>Description</label>\n" +
    "<p>\n" +
    "    A worker was asked to implement part of the function <strong>{{data.functionName}}</strong>. Can you review this work?\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.newCode\" old-code=\"data.oldCode\" ></js-reader>\n" +
    "</p>");
}]);

angular.module("newsfeed/news_detail_Review_ImplementBehavior_disputed.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_detail_Review_ImplementBehavior_disputed.html",
    "<label>Description</label>\n" +
    "<p>\n" +
    "    A worker was asked to implement part of the function <strong>{{data.functionName}}</strong> and also reported an issue with the following tests\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Code edits</label>\n" +
    "<p>\n" +
    "    <js-reader mode=\"diff\" code=\"data.reviewed.newCode\" old-code=\"data.reviewed.oldCode\" ></js-reader>\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<label>Reported tests</label>\n" +
    "<p>\n" +
    "    <div class=\"tests-list\" bs-collapse ng-model=\"data.reviewed.openedTests\" data-allow-multiple=\"true\">\n" +
    "        <div ng-repeat=\"t in data.reviewed.disputedTests\">\n" +
    "            <div class=\"test-item clickable\" bs-collapse-toggle>\n" +
    "                <strong>{{t.description}}</strong>\n" +
    "            </div>\n" +
    "            <div bs-collapse-target style=\"padding:5px\">\n" +
    "                <div class=\"form-group\">\n" +
    "					<label for=\"disputetext\">Report description </label>\n" +
    "					<div class=\"form-control form-control-static\" name=\"disputetext\">\n" +
    "						{{ t.disputeText }}\n" +
    "					</div>\n" +
    "				</div>\n" +
    "                <div ng-if=\"t.isSimple\">\n" +
    "                    <div class=\"form-group\"  ng-repeat=\"(pIdx,p) in data.reviewed.functionParameters track by p.name\">\n" +
    "                        <label for=\"inputs\">\n" +
    "                            Input: {{p.name + ' {' + p.type + '}' }}\n" +
    "                        </label>\n" +
    "                    \n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            name=\"{{p.name}}\"\n" +
    "                            ng-model=\"t.inputs[pIdx]\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\" ng-if=\"t.isSimple\">\n" +
    "                        <label for=\"code\">Output {{ '{' + funct.returnType + '}'}}</label>\n" +
    "                        <div\n" +
    "                            class=\"form-control code\"\n" +
    "                            json-reader\n" +
    "                            ng-model=\"t.output\"\n" +
    "                            name=\"output\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-if=\"!t.isSimple\">\n" +
    "\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label for=\"code\">Code</label>\n" +
    "                        <div class=\"form-control form-control-static\" js-reader code=\"t.code\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <strong ng-if=\"data.isComplete\">the test suite is marked as complete</strong>\n" +
    "</p>\n" +
    "");
}]);

angular.module("newsfeed/news_list.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_list.html",
    "<div class=\"padding\" ng-if=\"news.length == 0\"> No news yet! </div>\n" +
    "<ul class=\"list-group\" ng-if=\"news.length > 0\">\n" +
    "	<li class=\"list-group-item news-element {{ n.microtaskType | lowercase }}\"\n" +
    "		ng-repeat=\"n in news | orderBy:'-timeInMillis'\"\n" +
    "		ng-click=\"setSelected(n);\"\n" +
    "		>\n" +
    "		<div class=\"type\">\n" +
    "			<span ng-switch on=\"n.microtaskType\">\n" +
    "				<span ng-switch-when=\"DescribeFunctionBehavior\">Write test</span>\n" +
    "				<span ng-switch-when=\"ImplementBehavior\">Edit function</span>\n" +
    "				<span ng-switch-when=\"Review\">Review</span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "		\n" +
    "		<div class=\"stars\" ng-if=\"n.score != -1\">\n" +
    "			<span>\n" +
    "				<span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\">\n" +
    "					<span class=\"star {{ n.score > $index || n.score == -1  ? 'full' : '' }}\"></span>\n" +
    "				</span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"result\" ng-if=\"::(n.score != -1)\">\n" +
    "			<!--<span ng-if=\"::(n.score < 3)\" class=\"rejected\" >REJECTED</span>-->\n" +
    "			<span ng-if=\"n.score <= 3\" class=\"reissued\">REISSUED</span>\n" +
    "			<span ng-if=\"n.score > 3\" class=\"accepted\">ACCEPTED</span>\n" +
    "		</div>\n" +
    "		<span class=\"points\">{{n.awardedPoints}}/<small>{{::n.maxPoints}}</small> pts</span>\n" +
    "		<!--<span>{{n.challengeStatus}}</span>-->\n" +
    "		<div class=\"clearfix\"></div>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("newsfeed/news_panel.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_panel.html",
    "<div class=\"news\">\n" +
    "	<div class=\"news-list   from-left\"       ng-if=\"view == 'list'\"></div>\n" +
    "	<div class=\"news-detail {{ animation }}\" ng-if=\"view == 'detail'\" news-detail=\"selectedNews\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("newsfeed/news_popover.html",
    "<div class=\"popover popover-news task-{{ n.microtaskType | lowercase }}\" tabindex=\"-1\">\n" +
    "    <button type=\"button\" class=\"close popover-close\" ng-click=\"$hide()\">&times;</button>\n" +
    "    <h3 class=\"popover-title\"><b>Your work on: &emsp; </b> \n" +
    "        <span class=\"microtask-title\" ng-if=\"! n.isReview\">{{n.microtask.title}} </span>\n" +
    "        <span class=\"microtask-title\" ng-if=\"n.isReview\"> review</span>\n" +
    "    </h3>\n" +
    "    <!-- MICROTASK DATA -->\n" +
    "    <div ng-if=\"n.microtask.type\" ng-include=\"'newsfeed/news_popover_' + n.microtask.type + '.html'\"></div>\n" +
    "    <!-- REVIEW SCORE -->\n" +
    "    <div ng-if=\"n.qualityScore\">\n" +
    "        <h3 class=\"popover-title \" ng-if=\"! n.isReview\"><b>Score received:</b> </h3>\n" +
    "        <h3 class=\"popover-title \" ng-if=\"n.isReview\"><b>Given score:</b> </h3>\n" +
    "        <div  class=\"section section-description\">\n" +
    "            <div class=\"section-content\" >\n" +
    "                <span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\"  class=\"rating-star {{ n.qualityScore >= currentValue ? 'full' : '' }}\"></span>\n" +
    "                <span class=\"clearfix\"></span><br />\n" +
    "                <span ng-if=\"n.reviewText\"> <b>Review: </b>{{n.reviewText}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("questions/questionDetail.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("questions/questionDetail.html",
    "<div class=\"top padding\">\n" +
    "	<a href=\"#\" class=\"pull-left\" ng-click=\"updateView(); setUiView('list');\">\n" +
    "		<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "		back\n" +
    "	</a>\n" +
    "	\n" +
    "	<a href=\"#\" class=\"pull-right\" ng-click=\"toggleClosed(sel)\" ng-if=\"sel.answersCount != null && sel.answersCount > 0\">\n" +
    "		{{ sel.closed ? 'Reopen for discussion' : 'Mark as closed' }}\n" +
    "	</a>\n" +
    "\n" +
    "	<span class=\"clearfix\"></span>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"middle padding\">\n" +
    "	<ul class=\"list-group\">\n" +
    "\n" +
    "		<li class=\"list-group-item question-item  {{ sel.closed ? '' : 'open' }}\">\n" +
    "			<span class=\"btn btn-edit\" ng-click=\"setUiView('form'); \" ng-if=\"!sel.closed\">edit</span>\n" +
    "			<h3 class=\"panel-title\"  >{{sel.title}}</h3>\n" +
    "			<div ng-bind-html=\"sel.text\"></div>\n" +
    "			<div>\n" +
    "				<span class=\"pull-right\">\n" +
    "					<span ng-repeat=\"tag in sel.tags\" class=\"tag\">{{tag}}</span>\n" +
    "				</span> \n" +
    "				<span class=\"pull-left\">\n" +
    "					<time-ago style=\"font-style: italic; font-size: 0.8em;\" from-time=\"{{sel.createdAt | date : 'medium'}}\"></time-ago>\n" +
    "				</span> \n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div>\n" +
    "				<div style=\"font-size: 1.1em;\" class=\"pull-left\">\n" +
    "					<span \n" +
    "						ng-click=\"toggleVoteUp(sel)\" \n" +
    "						class=\"glyphicon glyphicon-thumbs-up unselected\" \n" +
    "						ng-class=\"{'selected':sel.votersId.indexOf(workerId)>-1,'not-allowed':sel.ownerId == workerId}\">\n" +
    "					</span>\n" +
    "					<span>{{sel.score}}</span>\n" +
    "					<span \n" +
    "						ng-click=\"toggleVoteDown(sel)\" \n" +
    "						class=\"glyphicon glyphicon-thumbs-down unselected\" \n" +
    "						ng-class=\"{'selected':sel.reportersId.indexOf(workerId)>-1,'not-allowed':sel.ownerId == workerId}\">\n" +
    "					</span>\n" +
    "				</div>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "\n" +
    "			<span class=\"clearfix\"></span>\n" +
    "\n" +
    "\n" +
    "		</li>\n" +
    "	</ul>\n" +
    "\n" +
    "\n" +
    "	<div ng-if=\"!sel.closed\">\n" +
    "		<a href=\"#\" class=\"btn btn-xs btn-primary pull-right\" ng-show=\"!form.answer.show \" ng-click=\"form.answer.show=true\">Answer this question</a>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "		<form name=\"answerForm\" novalidate  ng-show=\"form.answer.show\" ng-submit=\"answerForm.$valid && postAnswer()\">\n" +
    "			<div class=\"form-group\">\n" +
    "				<textarea required name=\"text\" class=\"form-control\" ng-model=\"form.answer.text\" placeholder=\"answer text\"></textarea>\n" +
    "			</div>\n" +
    "			<span class=\"btn-group pull-right\">\n" +
    "				<button type=\"button\" class=\"btn btn-xs btn-default\" ng-click=\"form.answer.show = false; \">Cancel</button>\n" +
    "				<button type=\"submit\" class=\"btn btn-xs btn-primary\">Answer</button>\n" +
    "			</span>\n" +
    "				\n" +
    "			<div class=\"clearfix\"></div>\n" +
    "		</form>\n" +
    "	</div>\n" +
    "\n" +
    "	<strong> {{ sel.answers | objectLength }} answers: </strong>\n" +
    "\n" +
    "	<ul class=\"list-group\">\n" +
    "\n" +
    "		<li class=\"list-group-item answer-item\" ng-repeat=\"a in sel.answers | orderObjectBy : 'createdAt' : false\" ng-animate-children>\n" +
    "			<div class=\"content-panel\">\n" +
    "				<div ng-bind-html=\"a.text\"></div>\n" +
    "\n" +
    "\n" +
    "				<div>\n" +
    "\n" +
    "					<span class=\"pull-left\">\n" +
    "						<time-ago style=\"font-style: italic; font-size: 0.8em;\" from-time=\"{{a.createdAt | date : 'medium'}}\"></time-ago>\n" +
    "						- \n" +
    "						<span>{{ a.ownerId == workerId ? 'you' : a.ownerHandle }}</span>\n" +
    "					</span> \n" +
    "					<div class=\"pull-right\">\n" +
    "						<span\n" +
    "							ng-click=\"toggleVoteUp(a)\"\n" +
    "							class=\"glyphicon glyphicon-thumbs-up unselected\"\n" +
    "							ng-class=\"{'selected':a.votersId.indexOf(workerId)>-1, 'not-allowed': a.ownerId == workerId}\">\n" +
    "						</span>\n" +
    "						<span>{{a.score}}</span>\n" +
    "						<span\n" +
    "							ng-click=\"toggleVoteDown(a)\"\n" +
    "							class=\"glyphicon glyphicon-thumbs-down unselected\"\n" +
    "							ng-class=\"{'selected':a.reportersId.indexOf(workerId)>-1, 'not-allowed': a.ownerId == workerId}\">\n" +
    "						</span>\n" +
    "					</div>\n" +
    "					<span class=\"clearfix\"></span>\n" +
    "						\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "				\n" +
    "\n" +
    "			<ul class=\"list-group\">\n" +
    "				<li class=\"list-group-item comment-item\" ng-repeat=\"c in a.comments | orderObjectBy : 'createdAt' : false\" >\n" +
    "					\n" +
    "					<div class=\"content-panel\">\n" +
    "						<div>\n" +
    "							<span ng-bind-html=\"c.text\"></span>\n" +
    "						</div>\n" +
    "\n" +
    "\n" +
    "						<div>\n" +
    "\n" +
    "							<span class=\"pull-left\">\n" +
    "								<time-ago style=\"font-style: italic; font-size: 0.8em;\" from-time=\"{{c.createdAt | date : 'medium'}}\"></time-ago>\n" +
    "								-\n" +
    "								<span>{{ c.ownerId == workerId ? 'you' : c.ownerHandle }}</span>\n" +
    "							</span> \n" +
    "							<div class=\"pull-right\">\n" +
    "								<span\n" +
    "									ng-click=\"toggleVoteUp(c)\"\n" +
    "									class=\"glyphicon glyphicon-thumbs-up unselected\"\n" +
    "									ng-class=\"{'selected':c.votersId.indexOf(workerId)>-1, 'not-allowed': c.ownerId == workerId}\">\n" +
    "								</span>\n" +
    "								<span>{{c.score}}</span>\n" +
    "								<span\n" +
    "									ng-click=\"toggleVoteDown(c)\"\n" +
    "									class=\"glyphicon glyphicon-thumbs-down unselected\"\n" +
    "									ng-class=\"{'selected':c.reportersId.indexOf(workerId)>-1, 'not-allowed': c.ownerId == workerId}\">\n" +
    "								</span>\n" +
    "							</div>\n" +
    "							<span class=\"clearfix\"></span>\n" +
    "								\n" +
    "						</div>\n" +
    "\n" +
    "					</div>\n" +
    "						\n" +
    "\n" +
    "				</li>\n" +
    "				<li class=\"list-group-item comment-item\" ng-if=\"!sel.closed\">\n" +
    "					<a href=\"#\" \n" +
    "						class=\"pull-right\"\n" +
    "						ng-show='!form.comment.show' \n" +
    "						ng-click=\"form.comment.show = true ; form.comment.answerId = a.id\" >\n" +
    "						write a comment\n" +
    "					</a>\n" +
    "					<span class=\"clearfix\"></span>\n" +
    "					<form name=\"commentForm\" novalidate ng-show='form.comment.show && form.comment.answerId == a.id' ng-submit=\"commentForm.$valid && postComment(a.id)\">\n" +
    "						<div class=\"form-group\">\n" +
    "							<textarea name=\"text\" \n" +
    "									  class=\"form-control\" \n" +
    "									  ng-model=\"form.comment.text\" \n" +
    "									  placeholder=\"comment text\"\n" +
    "									  required>\n" +
    "							</textarea>\n" +
    "						</div>\n" +
    "						<span class=\"btn-group pull-right\">\n" +
    "							<button type=\"button\" class=\"btn btn-xs btn-default\" ng-click=\"form.comment.show = false; \">Cancel</button>\n" +
    "							<button type=\"submit\" class=\"btn btn-xs btn-primary\">Comment</button>\n" +
    "						</span>\n" +
    "						<div class=\"clearfix\"></div>\n" +
    "					</form>\n" +
    "				</li>\n" +
    "			</ul>\n" +
    "\n" +
    "				\n" +
    "			<span class=\"clearfix\"></span>\n" +
    "\n" +
    "		</li>\n" +
    "	</ul>\n" +
    "	\n" +
    "</div>\n" +
    "");
}]);

angular.module("questions/questionForm.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("questions/questionForm.html",
    "<div class=\"top padding\">\n" +
    "	<a href=\"#\" ng-click=\"setUiView( sel == null ? 'list' : 'detail' );\">\n" +
    "		<span class=\"glyphicon glyphicon-arrow-left\"></span>\n" +
    "		back\n" +
    "	</a>\n" +
    "	<h4 class=\"padding\"> {{ sel == null ? 'New' : 'Edit'}} question: </h4>\n" +
    "</div>\n" +
    "<div class=\"middle padding\">\n" +
    "	<form name=\"questionForm\" novalidate ng-submit=\"questionForm.$valid && postQuestion()\">\n" +
    "		<div class=\"form-group\">\n" +
    "			<input \n" +
    "				class=\"form-control\" \n" +
    "				name=\"title\" \n" +
    "				ng-model=\"question.title\"\n" +
    "				placeholder=\"insert a title for the question\"\n" +
    "				ng-minlength=\"5\"\n" +
    "           		ng-maxlength=\"100\"\n" +
    "				required\n" +
    "			/>\n" +
    "			<div class=\"help-block\" ng-messages=\"questionForm.title.$error\">\n" +
    "				<div ng-if=\"questionForm.title.$dirty\">\n" +
    "					<div ng-message=\"required\">the title can't be empty</div>\n" +
    "				    <div ng-message=\"minlength\">the title can't be less than 5 characters</div>\n" +
    "				    <div ng-message=\"maxlength\">the title can't exceed 100 characters</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"form-group\">\n" +
    "			<textarea name=\"text\" \n" +
    "					  class=\"form-control\" \n" +
    "					  style=\"resize:none;height:300px\" \n" +
    "					  ng-model=\"question.text\" \n" +
    "					  placeholder=\"text\">\n" +
    "			</textarea>\n" +
    "		</div>\n" +
    "		<div class=\"form-group\">\n" +
    "			<tags-input class=\"form-control\" ng-model=\"tags\"></tags-input>\n" +
    "		</div>\n" +
    "		<div class=\"form-group\" ng-if=\"sel == null && loadedArtifact != null\">\n" +
    "			<label>\n" +
    "				<input type=\"checkbox\" \n" +
    "					ng-model=\"question.artifactId\"> \n" +
    "   					linked to the function <strong>{{ loadedArtifact.name }}</strong>\n" +
    "			</label>\n" +
    "		</div>\n" +
    "			\n" +
    "		<div class=\"btn-group pull-right padding\" role=\"group\">	\n" +
    "			<button class=\"btn btn-sm btn-default\" type=\"button\" ng-click=\"setUiView( sel == null ? 'list' : 'detail' ); questionForm.$setPristine();\" >cancel</a>\n" +
    "			<button class=\"btn btn-sm btn-primary\" type=\"submit\" >Submit</button>\n" +
    "		</div>\n" +
    "	</form>\n" +
    "</div>\n" +
    "");
}]);

angular.module("questions/questionsList.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("questions/questionsList.html",
    "<div class=\"top\">\n" +
    "	<div class=\"form-group has-feedback search-box\">\n" +
    "		<tags-input class=\"searchbox\" ng-model=\"search\" on-tag-added=\"updateFilter()\" on-tag-removed=\"updateFilter()\" placeholder=\"filter\" ng-keypress=\"showTooltip()\" tooltip=\"filterTooltip\"></tags-input>\n" +
    "		<span class=\"glyphicon glyphicon-search form-control-feedback\" aria-hidden=\"true\"></span>\n" +
    "	</div>\n" +
    "	<button class=\"btn btn-sm btn-primary new-question\" ng-click=\"setUiView('form'); \">Ask question</button>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"middle\">\n" +
    "	<div class=\"padding\">\n" +
    "		<div class=\"padding\" ng-if=\"questions.length == 0 && search.length > 0 \">\n" +
    "			No questions found matching the filter <strong>{{getFilterStr()}}</strong> \n" +
    "			(<a href=\"#\" ng-click=\"resetFilter()\">reset filter</a>)\n" +
    "		</div>\n" +
    "		<div class=\"padding\" ng-if=\"questions.length == 0 && search.length == 0\"> No questions yet! </div>\n" +
    "	</div>\n" +
    "\n" +
    "	<ul class=\"list-group questions-list\" ng-if=\"questions.length > 0\">\n" +
    "\n" +
    "		<li class=\"list-group-item list-header\" ng-show=\" loadedArtifact != null \">\n" +
    "			Related to {{loadedArtifact.name}}\n" +
    "		</li>\n" +
    "		<li ng-show=\" loadedArtifact != null && ( questions | relatedToArtifact : loadedArtifact.id ).length == 0 \"> \n" +
    "			No questions related to the function {{ loadedArtifact.name }} \n" +
    "		</li>\n" +
    "		<li class=\"list-group-item question-item {{ q.closed ? '' : 'open' }}\"\n" +
    "			ng-show=\"loadedArtifact != null\" \n" +
    "			ng-click=\"setSelected(q)\" \n" +
    "			ng-repeat=\"q in questions | relatedToArtifact : loadedArtifact.id  | orderBy : 'closed'  \"\n" +
    "			>\n" +
    "			<div> \n" +
    "				<span ng-if=\"!isUpdated(q)\">{{q.title}}</span>\n" +
    "				<span ng-if=\"isUpdated(q)\">\n" +
    "					<strong>{{q.title}}</strong>\n" +
    "					<small><i>{{ getUpdateString(q) }}</i></small>\n" +
    "				</span> \n" +
    "			</div>\n" +
    "			<div >\n" +
    "				<span class=\"pull-left\">\n" +
    "					<time-ago style=\"font-style: italic; font-size: 0.8em;\" from-time=\"{{q.updatedAt | date : 'medium'}}\"></time-ago>\n" +
    "				</span> \n" +
    "\n" +
    "				<span class=\"pull-right\" style=\"text-align:right;\">\n" +
    "					<span ng-repeat=\"tag in q.tags\" class=\"tag\" ng-click=\"addToFilter(tag); $event.stopPropagation();\">{{tag}}</span>\n" +
    "				</span> \n" +
    "\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div>\n" +
    "				\n" +
    "				<span class=\"pull-left\" >\n" +
    "					<span>\n" +
    "						<span class=\"glyphicon glyphicon-thumbs-up\"></span>\n" +
    "						{{ q.score }}\n" +
    "					</span>\n" +
    "					<span style=\"margin-left: 10px;\">\n" +
    "						<span class=\"glyphicon glyphicon-comment\"></span>\n" +
    "						{{ q.answers | objectLength }}\n" +
    "					</span>\n" +
    "					<span style=\"margin-left: 10px; font-family: 'Lato'; font-weight: bold; font-size: 1em;\">\n" +
    "						{{ q.closed ? 'CLOSED' : 'OPEN' }}\n" +
    "					</span>				\n" +
    "				</span>\n" +
    "				\n" +
    "\n" +
    "				<span class=\"pull-right\" ng-if=\"loadedArtifact != null\">\n" +
    "					<a href=\"#\" class=\"btn btn-toggle btn-toggle-on\" ng-click=\"toggleRelation(q); $event.stopPropagation();\" style=\"font-size: 0.9em;\">{{loadedArtifact.name}}</a>\n" +
    "				</span>\n" +
    "\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "				\n" +
    "			</div>\n" +
    "			\n" +
    "		</li>\n" +
    "\n" +
    "		<li class=\"list-group-item list-header\" ng-show=\" ( questions | unrelatedToArtifact : loadedArtifact.id ).length > 0 \">\n" +
    "			Other questions\n" +
    "		</li>\n" +
    "\n" +
    "		<li class=\"list-group-item question-item {{ q.closed ? '' : 'open' }}\"\n" +
    "			ng-click=\"setSelected(q)\" \n" +
    "			ng-repeat=\"q in questions | unrelatedToArtifact : loadedArtifact.id  | orderBy : 'closed'  \"\n" +
    "			>\n" +
    "			<div> \n" +
    "				<span ng-if=\"!isUpdated(q)\">{{q.title}}</span>\n" +
    "				<span ng-if=\"isUpdated(q)\">\n" +
    "					<strong>{{q.title}}</strong>\n" +
    "					<small><i>{{ getUpdateString(q) }}</i></small>\n" +
    "				</span> \n" +
    "			</div>\n" +
    "			<div >\n" +
    "				<span class=\"pull-left\">\n" +
    "					<time-ago style=\"font-style: italic; font-size: 0.8em;\" from-time=\"{{q.updatedAt | date : 'medium'}}\"></time-ago>\n" +
    "				</span> \n" +
    "\n" +
    "				<span class=\"pull-right\" style=\"text-align:right;\">\n" +
    "					<span ng-repeat=\"tag in q.tags\" class=\"tag\" ng-click=\"addToFilter(tag); $event.stopPropagation();\">{{tag}}</span>\n" +
    "				</span> \n" +
    "\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "			<div>\n" +
    "				<span class=\"pull-left\" >\n" +
    "					<span>\n" +
    "						<span class=\"glyphicon glyphicon-thumbs-up\"></span>\n" +
    "						{{ q.score }}\n" +
    "					</span>\n" +
    "					<span style=\"margin-left: 10px;\">\n" +
    "						<span class=\"glyphicon glyphicon-comment\"></span>\n" +
    "						{{ q.answers | objectLength }}\n" +
    "					</span>\n" +
    "					<span style=\"margin-left: 10px; font-family: 'Lato'; font-weight: bold; font-size: 1em;\">\n" +
    "						{{ q.closed ? 'CLOSED' : 'OPEN' }}\n" +
    "					</span>				\n" +
    "				</span>\n" +
    "				\n" +
    "\n" +
    "				<span class=\"pull-right\" ng-if=\"loadedArtifact != null\">\n" +
    "					<a href=\"#\" class=\"btn btn-toggle\" ng-click=\"toggleRelation(q); $event.stopPropagation();\" style=\"font-size: 0.9em;\">{{loadedArtifact.name}}</a>\n" +
    "				</span>\n" +
    "\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "				\n" +
    "			</div>\n" +
    "			\n" +
    "		</li>\n" +
    "	</ul>\n" +
    "\n" +
    "</div>");
}]);

angular.module("questions/questionsPanel.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("questions/questionsPanel.html",
    "<div class=\"questions\">\n" +
    "	<div question-list   class=\"list-view   slide from-left\"       ng-if=\"view == 'list'\">list</div>\n" +
    "	<div question-detail class=\"detail-view slide {{ animation }}\" ng-if=\"view == 'detail'\">detail</div>\n" +
    "	<div question-form   class=\"form-view   slide from-right\"      ng-if=\"view == 'form'\">form</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tutorials/DescribeFunctionBehavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/DescribeFunctionBehavior.html",
    "<step>\n" +
    "	<div class=\"title\">Write test</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Given the function description, your goal is to add one or more test (in addition to the previous written tests) to describe every possible corner case.\n" +
    "		</p>\n" +
    "		<p style=\"width:500px\">\n" +
    "			Follow this tutorials for more details:\n" +
    "		</p>\n" +
    "		<ul>\n" +
    "			<li>\n" +
    "				<a href=\"#\" \n" +
    "					ng-click=\"$emit('queue-tutorial', 'create_edit_test', true, undefined, 'DescribeFunctionBehavior' ); close(); $event.preventDefault();\">\n" +
    "					creating a test\n" +
    "				</a>\n" +
    "			</li>\n" +
    "			<li>\n" +
    "				<a href=\"#\" \n" +
    "					ng-click=\"$emit('queue-tutorial', 'input_output_tests', true, undefined, 'DescribeFunctionBehavior'); close(); $event.preventDefault();\">\n" +
    "					input/output tests</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'assertion_tests', true, undefined, 'DescribeFunctionBehavior'); close(); $event.preventDefault();\">assertion tests</a></li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/ImplementBehavior.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/ImplementBehavior.html",
    "<step>\n" +
    "	<div class=\"title\">Implement Function</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Given the function description, you have 10 minutes to implement this function fully/partially.\n" +
    "			You can write/edit the code in the function editor, create/edit/remove tests cases and run the tests suite on your code.\n" +
    "		</p>\n" +
    "		<p style=\"width:500px\">\n" +
    "			Follow this tutorials for more details:\n" +
    "		</p>\n" +
    "		<ul>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'running_tests', true , undefined, 'ImplementBehavior'); close(); $event.preventDefault();\">running and debugging tests</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'function_editor', true, undefined, 'ImplementBehavior'); close(); $event.preventDefault();\">using the function editor</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'create_edit_test', true, undefined, 'ImplementBehavior' ); close(); $event.preventDefault();\">creating a test</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'input_output_tests', true, undefined, 'ImplementBehavior'); close(); $event.preventDefault();\">input/output tests</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'assertion_tests', true, undefined, 'ImplementBehavior'); close(); $event.preventDefault();\">assertion tests</a></li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step style=\"width:500px;\">\n" +
    "	<div class=\"title\">Function Implementation Complete</div>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width: 500px\">\n" +
    "			Once you have implemented the function completely, you can click the checkbox in the test editor panel as shown below and then submit this task.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/implementation/implementation_complete.png\" width=\"470px\"/>\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step style=\"width:500px;\">\n" +
    "	<div class=\"title\">Function Implementation Incomplete</div>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width: 500px\">\n" +
    "			If you have partially implemented the function, please describe the unfinished sections as pseudo code to notify the next programmer.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/implementation/psuedo_code.png\" width=\"470px\"/>\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step style=\"width:500px;\">\n" +
    "	<div class=\"title\">Comment Code</div>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width: 500px\">\n" +
    "			Please write the code with appropriate comments as this will help the following programmers understand your code quickly.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/implementation/comment_code.png\" width=\"470px\"/>\n" +
    "\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/Review.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/Review.html",
    "<step>\n" +
    "	<div class=\"title\">Review </div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/review/microtask.png\" />\n" +
    "		<p>In Review Work, your goal is to assess work submitted by the crowd.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you rate work with <strong>1 to 3 stars</strong>, the work will be marked as needing revision. In this case, you must describe aspects of the work that you feel must be improved.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/revise.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you feel that the work as submitted is already of high quality, you should rate it with <strong>4 or 5 stars</strong>. In this case, the work will be accepted as is. You can also (optionally) include a message describing your assessment of the work, which will be provided back to the crowd worker that did the work.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/accepted.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/assertion_tests.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/assertion_tests.html",
    "<step>\n" +
    "	<div class=\"title\">Assertion tests</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Assertion tests afford more flexibility, letting you check only parts of the output (e.g., if an object has a specific property), using function calls to check properties of the output (e.g., length of an array), using complex expressions to construct input values, and even using multiple asserts.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/testing/assertion.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/create_edit_test.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/create_edit_test.html",
    "<step>\n" +
    "	<div class=\"title\">Create a test</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			To create a new unit test, click “Add a new test”.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/testing/add.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			You can write a brief description of the purpose of the unit test and select either an Input/Output test or an Assertion test.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/testing/test_prompt.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/function_editor.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/function_editor.html",
    "<step>\n" +
    "	<div class=\"title\">Calling a function</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			To see the list of all functions in the system, type ALT+SPACE (Mac) or CTRL+SPACE (Windows/Linux)\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/running/functions_list.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"title\">Creating a new function</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you need a supporting function to realize the implementation, you can create a new function and submit your task.\n" +
    "			This function will then be assigned to programmers to implement.\n" +
    "			To create a new function, type ALT SPACE(Mac) or CTRL SPACE(Windows/Linux) and select “Add a new function”,\n" +
    "			where you can write a comment specifying the function name, description, parameters, parameter types and return type.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/running/add_function.png\" width=\"500px\"/>\n" +
    "		<br/><br/>\n" +
    "		<img src=\"/img/tutorial/running/new_function.png\" width=\"500px\"/>\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/input_output_tests.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/input_output_tests.html",
    "<step>\n" +
    "	<div class=\"title\">Input/Output tests</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Input/output tests specify the desired behavior of the function providing an object definition for all the inputs and for the output. \n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/testing/input_output.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/main.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/main.html",
    "<step>\n" +
    "	<div class=\"title\">CrowdCode Tutorial</div>\n" +
    "	<div class=\"text\">\n" +
    "		Welcome to the CrowdCode tutorial. Here, we’ll help get you up to speed.\n" +
    "		<ul>\n" +
    "			<li><a href=\"#\" ng-click=\"nextStep()\">Introduction</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'ImplementBehavior', true, undefined, 'main'); close(); $event.preventDefault();\">Implementing a function</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'Review', true, undefined, 'main'); close(); $event.preventDefault();\">Reviewing implemented function</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'function_editor', true, undefined, 'main'); close(); $event.preventDefault();\">using the function editor</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'create_edit_test', true, undefined, 'main' ); close(); $event.preventDefault();\">creating a test</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'input_output_tests', true, undefined, 'main'); close(); $event.preventDefault();\">input/output tests</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'assertion_tests', true, undefined, 'main'); close(); $event.preventDefault();\">assertion tests</a></li>\n" +
    "			<li><a href=\"#\" ng-click=\"$emit('queue-tutorial', 'running_tests', true, undefined, 'main'); close(); $event.preventDefault();\">running and debugging tests</a></li>\n" +
    "\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"task\" placement=\"left\" style=\"width:150px;\">\n" +
    "	<div class=\"title\">Microtask</div>\n" +
    "	<div class=\"text\">\n" +
    "		Here’s the current microtask. <br />\n" +
    "		Can you do it?\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"remainingTimeBar\" placement=\"top\" style=\"width:300px;\">\n" +
    "	<div class=\"title\">Hurry up!</div>\n" +
    "	<div class=\"text\">\n" +
    "		For each microtask, you have <strong>10 minutes</strong> to submit the work\n" +
    "		or the microtask will be automatically skipped. <br /> \n" +
    "		The bar on the bottom represents the remaining time for submitting the current microtask.<br />\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"submitBtn\" placement=\"top-left\" style=\"width:150px;\" >\n" +
    "	<div class=\"title\">Submit</div>\n" +
    "	<div class=\"text\">\n" +
    "		All done? Submit your work for review.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"skipBtn\" placement=\"top-left\" style=\"width:200px;\" >\n" +
    "	<div class=\"title\">Skip</div>\n" +
    "	<div class=\"text\">\n" +
    "		Not the right microtask for you? Skip it. <br />\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<!--\n" +
    "<step highlight=\"breakBtn\" placement=\"top-left\" style=\"width:200px;\" >\n" +
    "	<div class=\"title\">Pick next microtask</div>\n" +
    "	<div class=\"text\">\n" +
    "		Want to pick the next microtask to work on? Click <strong>Pick next microtask</strong> before you Submit or Skip.\n" +
    "	</div>\n" +
    "</step>-->\n" +
    "\n" +
    "<step style=\"width:500px;\">\n" +
    "	<div class=\"title\">Have a question? The Crowd might have answered it!</div>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			The <strong>questions tab</strong> lets you search for answers and see questions related to the function that you’re currently working on (or testing). If you find a Question that looks relevant, clicking on it opens its discussion. \n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/main/question1.png\"/>\n" +
    "\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			You can even edit which questions are related to the current function by toggling the <strong>function name button</strong> to mark the question as related or unrelated (e.g., clicking on “doSpreadsheetCommand” in the example above).\n" +
    "		</p>\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			If you can't find what you’re looking for, you can <strong>ask a question</strong>.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "\n" +
    "<step style=\"width:520px;\">\n" +
    "	<div class=\"title\">... or ask a new question ... </div>\n" +
    "	<div class=\"text\">\n" +
    "		<div class=\"pull-left\">\n" +
    "			<img src=\"/img/tutorial/main/question2.png\" style=\"width:280px;margin-right:10px;\"/>\n" +
    "		</div>\n" +
    "		<div class=\"pull-left\" style=\"width:200px\">\n" +
    "			<p>\n" +
    "				Questions let you get answers from the crowd. You might have a question about the Debug microtask, the meaning of a field in a data structure, or a design decision. Questions can help in any of these cases. \n" +
    "			</p>\n" +
    "			<p>\n" +
    "				To ask a question, you just need to provide a title and description. Additionally, you can add <strong>tags</strong> to group the question with other related questions (e.g., debugging, error handing). If the question is about the behavior or implementation of a function you’re working on (or testing), you can mark it as <strong>related</strong> to the function.\n" +
    "			</p>\n" +
    "		</div>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "\n" +
    "<step style=\"width:500px;\">\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width: 450px\"> \n" +
    "			When a worker asks a question, everyone in the system gets notified. You now have the opportunity to participate in the discussion. CrowdCode provides several ways to participate. If you have an answer, you can add a new answer. If you see answers that others have provided, you can Comment on the answer. And if you see Questions, Answers, and Comments with which you agree (or disagree), you can <strong>up vote</strong> or <strong>down vote</strong> the item.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/main/question3.png\"/>\n" +
    "\n" +
    "		<p style=\"width: 450px\"> \n" +
    "			When you think that discussion on a Question has been concluded, you can mark a Question as <strong>answered</strong>. This lets the crowd know that the question has been answered, and that no further answers are required. In the list of questions, Open questions are indicated with a yellow background while closed questions are indicated with a gray background.\n" +
    "		</p>\n" +
    "		<p style=\"width: 450px\"> \n" +
    "			If you see a closed question that needs more discussion, you can reopen it.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"title\">Resizing panels</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width: 450px\"> \n" +
    "			If you need more space while working on a microtask, you can resize every panel.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/main/resize.jpg\"/>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"newsfeedBtn\" placement=\"right-center\" style=\"width:200px;\"\n" +
    "	  on-show=\"$broadcast('setLeftBarTab','newsfeed');\">\n" +
    "	<div class=\"title\">Your Activity</div>\n" +
    "	<div class=\"text\">\n" +
    "		See what you’ve done, see how the crowd rated it.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "\n" +
    "	<div class=\"title\">Tutorials</div>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width: 450px\"> \n" +
    "			If you're in trouble and don't know what to do, you can open the tutorials by clicking on the question mark icons.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/main/questionmark.jpg\"/>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "\n" +
    "<!--\n" +
    "<step highlight=\"questionsBtn\" placement=\"right-center\" style=\"width:200px;\"\n" +
    "	on-show=\"$broadcast('setLeftBarTab','questions');\">\n" +
    "	<div class=\"title\">Questions</div>\n" +
    "	<div class=\"text\">\n" +
    "		Don’t worry. You’re still cool, even if someone has 400 points more than you.\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "\n" +
    "<step highlight=\"leaderboardBtn\" placement=\"right-center\" style=\"width:200px;\"\n" +
    "	on-show=\"$broadcast('setLeftBarTab','leaderboard');\">\n" +
    "	<div class=\"title\">Leaderboard</div>\n" +
    "	<div class=\"text\">\n" +
    "		Don’t worry. You’re still cool, even if someone has 400 points more than you.\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"feedbackBtn\" placement=\"top-center\" style=\"width:100px;\">\n" +
    "	<div class=\"title\">Send us feedback</div>\n" +
    "	<div class=\"text\">\n" +
    "		See something wrong with CrowdCode? Let us know!\n" +
    "	</div>\n" +
    "</step>\n" +
    "-->\n" +
    "\n" +
    "<step on-hide=\"showProfileModal(); \" style=\"width:300px\">\n" +
    "	<div class=\"title\">Congratulations! </div>\n" +
    "	<div class=\"text\">\n" +
    "		You have completed the CrowdCode getting started tutorial!\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/review_describe.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/review_describe.html",
    "<step>\n" +
    "	<div class=\"title\">Review Tests</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/review/microtask.png\" />\n" +
    "		<p>In Review Work, your goal is to assess work submitted by the crowd.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you rate work with <strong>1 to 3 stars</strong>, the work will be marked as needing revision. In this case, you must describe aspects of the work that you feel must be improved.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/revise.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you feel that the work as submitted is already of high quality, you should rate it with <strong>4 or 5 stars</strong>. In this case, the work will be accepted as is. You can also (optionally) include a message describing your assessment of the work, which will be provided back to the crowd worker that did the work.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/accepted.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/running_tests.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tutorials/running_tests.html",
    "<step>\n" +
    "	<div class=\"title\">Running and debugging tests</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Click “Run” to run all of the function’s tests and view the list of passing and failing tests. \n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/running/run.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"title\">Test details</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Click on a listed test to see the test code and its result.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/running/detail.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"title\">Inspecting the code</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Click “inspect” to invoke a mode in the function editor where you can hover over expressions to see an expression value popup. After editing the function, click “Run” and then again click “Inspect” to see the updated values.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/running/inspector.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"title\">Stub a function call</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			While in \"inspect mode\", clicking on a function call opens a popup that allows to stub a function.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/running/function_stub_1.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			If a function call is producing an incorrect output, the function should be stubbed. In the expression value popup, click on “stub this function call” to automatically replace a function call for a specific input with a stub for an alternative specific output, and creating a new test with the stub for the invoked function.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/running/function_stub_2.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"title\">Reporting an issue</div>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If a test itself is incorrect, click “Report an issue” in the test detail page to report the issue to be addressed, temporarily disabling the test.\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/running/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("ui_elements/left_bar_buttons_template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("ui_elements/left_bar_buttons_template.html",
    "<div class=\"btn-bar btn-bar-left\">\n" +
    "  <div class=\"btn-group\">\n" +
    "    <div class=\"btn {{ selectedTab == 'newsfeed' ? 'active' : '' }}\" ng-click=\"selectTab('newsfeed'); trackInteraction('Click Left Bar', 'Toggle', $event)\">Newsfeed</div>\n" +
    "    <div class=\"btn {{ selectedTab == 'questions' ? 'active' : '' }}\" ng-click=\"selectTab('questions'); trackInteraction('Click Left Bar', 'Toggle', $event)\">Questions</div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("ui_elements/left_bar_template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("ui_elements/left_bar_template.html",
    "<div class=\"sidebar-left\">\n" +
    "  <div class=\"content\">\n" +
    "    <news-panel   ng-show=\"selectedTab == 'newsfeed'\">project</news-panel>\n" +
    "    <questions-panel ng-show=\"selectedTab == 'questions'\"></questions-panel>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("ui_elements/nav_bar_template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("ui_elements/nav_bar_template.html",
    "<div class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\">\n" +
    "	<div class=\"container-fluid\">\n" +
    "\n" +
    "		<div class=\"navbar-header\">\n" +
    "	      <a class=\"navbar-brand\" href=\"#\">CrowdCode 2.2</a>\n" +
    "	    </div>\n" +
    "\n" +
    "		<ul class=\"nav navbar-nav\">\n" +
    "	        <li><a href=\"#\"><strong>project:</strong> {{ projectId }}</a></li>\n" +
    "	        <li><a href=\"#\"><project-stats ng-click=\"trackInteraction('Click Navigation Bar', 'Statistics', $event)\"></project-stats></a></li>\n" +
    "	    </ul>\n" +
    "\n" +
    "	    <ul class=\"nav navbar-nav navbar-right\">\n" +
    "	    	<li>\n" +
    "	        	<a  href=\"#\"\n" +
    "	        		data-container:\"body\"\n" +
    "	        		data-placement=\"bottom\"\n" +
    "				    data-trigger=\"focus\"\n" +
    "				    data-template=\"ui_elements/nav_user_menu_template.html\"\n" +
    "				    bs-popover\n" +
    "		   			>\n" +
    "					{{ workerHandle}}\n" +
    "					<img ng-src=\"{{ avatar(workerId).$value }}\" class=\"profile-picture\" />\n" +
    "					<span class=\"caret\"></span>\n" +
    "	        	</a>\n" +
    "	        </li>\n" +
    "	    </ul>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("ui_elements/nav_user_menu_template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("ui_elements/nav_user_menu_template.html",
    "<div class=\"popover user-menu-popover\">\n" +
    "	Score: <strong>{{userData.score }}</strong>  points <br />\n" +
    "	{{ popover }}\n" +
    "\n" +
    "	<a href=\"#\" ng-click=\" $emit('showUserStatistics'); close() \">Open profile</a><br />\n" +
    "	<a href=\"#\" ng-click=\" $emit('showProfileModal'); close() \">Change profile picture</a><br />\n" +
    "	<a href=\"#\" ng-click=\"$emit('queue-tutorial', 'main', true); close();\">Tutorial</a><br />\n" +
    "	<a href=\"{{logoutUrl}}\" ng-click=\"close()\">Logout</a>\n" +
    "</div>");
}]);

angular.module("ui_elements/right_bar_template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("ui_elements/right_bar_template.html",
    "<div class=\"sidebar-right\">\n" +
    "\n" +
    "  <div ui-layout=\"{ flow: 'row', dividerSize: 1 }\">\n" +
    "    <div class=\"sidebar-panel\" ui-layout-container min-size=\"40px\" size=\"50%\">\n" +
    "      <div class=\"title\">Project Outline</div>\n" +
    "      <div class=\"content\">\n" +
    "        <project-outline ng-click=\"trackInteraction('Click Right Bar', 'Project Outline', $event)\"></project-outline>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"sidebar-panel\" ui-layout-container min-size=\"40px\" size=\"50%\">\n" +
    "      <div class=\"title\">Leaderboard</div>\n" +
    "      <div class=\"content\">\n" +
    "        <leaderboard ng-click=\"trackInteraction('Click Right Bar', 'Leaderboard', $event)\"></leaderboard>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/confused.popover.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/confused.popover.html",
    "<div class=\"popover\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "  <div class=\"popover-content\">\n" +
    "    <div>If you don't understand something related to the artifact, <a href='#' ng-click=\"askQuestion(); $hide();\" >ask a question</a>! </div>\n" +
    "	<div>Or open the <a href='#' ng-click=\"openTutorial(); $hide()\" >tutorial</a> for this microtask.</div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/description_popover.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/description_popover.html",
    "<div class=\"popover description-popover\">\n" +
    "    <div class=\"arrow\"></div>\n" +
    "    <h3 class=\"popover-title\">Description</h3>\n" +
    "    <div class=\"popover-content\">\n" +
    "    	 <ace-read-js code=\"code\"></ace-read-js> \n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/feedback.popover.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/feedback.popover.html",
    "<div class=\"popover\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "  <div class=\"popover-content\">\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "            <textarea type=\"text\"\n" +
    "                class=\"col-md-8 form-control input-sm\" \n" +
    "                style=\"  width: 240;height: 150px;resize: none; \"\n" +
    "                draggable=\"false\" \n" +
    "                name=\"feedbackText\"\n" +
    "                placeholder=\"Give us feedback on CrowdCode! What do you like? What don't you like?\" \n" +
    "                ng-model=\"feedbackText\" required>\n" +
    "            </textarea>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"form-actions\">\n" +
    "        <button type=\"button\" \n" +
    "          class=\"btn btn-xs btn-primary pull-right\" \n" +
    "          ng-click=\"$emit('sendFeedback',[feedbackText]) ; $hide()\" \n" +
    "          ng-disabled=\"feedbackForm.$invalid\">\n" +
    "          Send\n" +
    "        </button>\n" +
    "\n" +
    "        <button type=\"button\" \n" +
    "          class=\"btn btn-xs btn-default pull-right\" \n" +
    "          ng-click=\"$hide()\">\n" +
    "          Close\n" +
    "        </button>\n" +
    "        <span class=\"clearfix\"></span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/function_editor.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/function_editor.html",
    "<div ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "	<div ui-layout-container size=\"1%\">\n" +
    "		<statements-progress-bar  class=\"function-statements\"></statements-progress-bar>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"function-editor\" style=\"\" ui-layout-container size=\"99%\">\n" +
    "	<div ui-layout=\"{ flow: 'row', dividerSize: 2 }\">\n" +
    "		<div\n" +
    "			ui-layout-container size=\"80%\"\n" +
    "			style=\"height:100%;\"\n" +
    "			class=\"js-editor\"\n" +
    "			ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme: 'chrome'  }\"\n" +
    "			ng-model=\"code\" >\n" +
    "		</div>\n" +
    "\n" +
    "\n" +
    "		<div class=\"function-errors \" ui-layout-container size=\"18%\" style=\"\"  >\n" +
    "			<ul class=\"help-block\" ng-if=\"errors.length > 0\" >\n" +
    "				<li ng-repeat=\"e in errors track by $id($index)\">\n" +
    "					<span ng-bind=\"e\"></span>\n" +
    "				</li>\n" +
    "			</ul>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/json_editor.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/json_editor.html",
    "<div class=\"ace_editor \" \n" +
    "style=\"height:200px\"\n" +
    "	ui-ace=\"{ \n" +
    "	 	onLoad : aceLoaded, \n" +
    "	 	mode: 'json', \n" +
    "	 	theme: 'chrome' \n" +
    "	 	}\" \n" +
    "	ng-model=\"ngModel\" >\n" +
    "</div> ");
}]);

angular.module("widgets/popup_feedback.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/popup_feedback.html",
    "<div class=\"popover\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "  <div class=\"popover-title\">\n" +
    "    Send feedback\n" +
    "  </div>\n" +
    "  <div class=\"popover-content\">\n" +
    "    \n" +
    "    <ng-form name=\"feedbackForm\" ng-hide=\"sent\">\n" +
    "        <span ng-class=\"{'has-success': feedbackForm.feedbackText.$valid}\">\n" +
    "            <textarea type=\"text\"\n" +
    "            class=\"col-md-8 form-control input-sm\" draggable=\"false\" name=\"feedbackText\"\n" +
    "            placeholder=\"Give us feedback on CrowdCode! What do you like? What don't you like?\" ng-model=\"feedbackText\" required></textarea>\n" +
    "        </span>\n" +
    "    </ng-form>\n" +
    "\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "    <button type=\"button\" class=\"btn btn-primary\" \n" +
    "        ng-click=\"$emit('sendFeedback',[feedbackText]) ; $hide()\" \n" +
    "        ng-disabled=\"feedbackForm.$invalid\">Send</button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/popup_reminder.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/popup_reminder.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\" >\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\">You've been working on this for a while now...</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\">\n" +
    "				<div style=\"text-align: center\"> ...maybe it's time to submit or skip and let the crowd take a look?</div>\n" +
    "        \n" +
    "                <br /> <br />\n" +
    "                <div style=\"text-align: center\">\n" +
    "                  This microtask will be auto skipped in: <br />\n" +
    "                  <h4>{{skipMicrotaskIn | date:'mm:ss'}}</h4>\n" +
    "                </div>\n" +
    "\n" +
    "                <br /> <br />\n" +
    "\n" +
    "                <div style=\"text-align: center\">\n" +
    "                  If you don't know how to do this microtask, click on the \n" +
    "                  <span class=\"tutorial-btn glyphicon glyphicon-question-sign color\"></span>\n" +
    "                  on the top-right corner for opening the tutorial!\n" +
    "                </div>\n" +
    "            </div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_shortcuts.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/popup_shortcuts.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-hide=\"sent\">Shortcuts</h4>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <ul>\n" +
    "                    <li><kbd>ctrl</kbd> + <kbd>enter</kbd> submit microtask</li>\n" +
    "                    <!--<li><kbd>ctrl</kbd> + <kbd>backspace</kbd> skip microtask</li>-->\n" +
    "                    <li><kbd>ctrl</kbd> + <kbd>t</kbd> open tutorial </li> \n" +
    "                </ul>\n" +
    "\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/popup_template.html",
    "<!-- popup template -->\n" +
    "<div id=\"popUp\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"\" aria-hidden=\"true\">\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n" +
    "				<h4 class=\"modal-title\">{{popupTitle}}</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\">\n" +
    "				<ng-include src=\"popupContent\">\n" +
    "				 some raw popup content\n" +
    "				</ng-include>\n" +
    "	      	</div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_user_profile.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/popup_user_profile.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" ng-controller=\"UserProfileController\" >\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "			<div class=\"modal-header\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\">Choose an avatar!</h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\" style=\"\">\n" +
    "\n" +
    "\n" +
    "				<img ng-src=\"{{ avatar( workerId ).$value }}\" alt=\"{{workerHandle}}\" style=\"width:100px\" class=\"pull-left\" />\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "\n" +
    "				<hr />\n" +
    "\n" +
    "				<h3>Select a profile avatar</h3>\n" +
    "\n" +
    "				<img ng-src=\"{{galleryPath}}avatar{{num}}.png\" alt=\"{{workerHandle}}\" ng-click=\"selectAvatar(num)\" class=\"avatar {{selectedAvatar==num ? 'selected' : '' }} pull-left\" ng-repeat=\"num in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]\"/>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "\n" +
    "<!--\n" +
    "				<hr />\n" +
    "				<h3>Or upload a picture</h3>\n" +
    "				<input type=\"file\" file-model=\"uploadedAvatar\"/>-->\n" +
    "\n" +
    "			</div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-primary\" ng-click=\"saveAvatar(); $hide()\">Save</button>\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide(); \">Close</button>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/project_outline.template.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/project_outline.template.html",
    "<div bs-collapse start-collapsed=\"false\" allow-multiple=\"true\">\n" +
    "	<div ng-repeat=\"d in dataTypes\" class=\"data-types\" ng-init=\"d.selectedExample = d.examples[0]\">\n" +
    "		<div bs-collapse-toggle class=\"toggler\" >DT: {{d.name}}</div>\n" +
    "		<div bs-collapse-target class=\"toggled\" ng-init=\"structure = buildStructure(d)\">\n" +
    "			<span ng-bind=\"::d.description\"></span>\n" +
    "			<pre ng-if=\"d.structure\" ng-bind=\"structure\"></pre>\n" +
    "\n" +
    "			<div ng-if=\"d.selectedExample != undefined\">\n" +
    "				<span class=\"pull-left\" for=\"exampleSelect\">EXAMPLES:</span>\n" +
    "				<span class=\"pull-right\">\n" +
    "					<div ng-if=\"::d.examples\" class=\"dropdown\"  >\n" +
    "		               <button name= \"exampleSelect\" \n" +
    "		                       class=\"btn btn-xs dropdown-toggle\"\n" +
    "		                       bs-select \n" +
    "		                       bs-options=\"e.name for e in d.examples\"\n" +
    "		                       data-html=\"1\" \n" +
    "		                       data-placement=\"bottom-right\"\n" +
    "		                       ng-model=\"d.selectedExample\" >\n" +
    "		               </button>\n" +
    "		            </div>\n" +
    "				</span>\n" +
    "					\n" +
    "	  			<span class=\"clearfix\"></span>\n" +
    "	            <div json-reader ng-model=\"d.selectedExample.value\" copy-allowed></div>\n" +
    "			</div>\n" +
    "	            \n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div ng-repeat=\"f in functions\" class=\"functions\">\n" +
    "		<div bs-collapse-toggle class=\"toggler\" >API: {{f.name}}</div>\n" +
    "		<div bs-collapse-target class=\"toggled\">\n" +
    "			<div ng-bind=\"f.description\"></div>\n" +
    "			<div><strong> Parameters </strong></div>\n" +
    "			<div ng-repeat=\"p in f.parameters\">\n" +
    "				<span ng-bind=\"p.name\"></span>\n" +
    "				<span ng-bind=\"p.type\"></span>\n" +
    "			</div>\n" +
    "			<div >\n" +
    "				<strong>Return:</strong>\n" +
    "				<span ng-bind=\"f.returnType\"></span>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/rating.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/rating.html",
    "<div id=\"ratingsDiv\" class=\"stars-container pull-left\" >\n" +
    "	<span ng-repeat=\"currentValue in [1,2,3,4,5] track by $index\"\n" +
    "		  ng-mouseenter=\"data.mouseOn = currentValue\"\n" +
    "		  ng-mouseleave=\"data.mouseOn = 0\"\n" +
    "		  ng-click=\"rate(currentValue)\">\n" +
    "		<span class=\"star {{ ( data.mouseOn > $index || data.value > $index ) ? 'full' : '' }}\"></span>\n" +
    "		<span ng-if=\"$index == 2\" class=\"stars-separator\" ></span>\n" +
    "	</span>\n" +
    "</div>\n" +
    "	<span class=\"rating-result pull-left\" ng-if=\"review.rating != -1\">\n" +
    "		<strong ng-if=\"data.value != -1 && data.value <= 3\"><span class=\"glyphicon glyphicon-refresh\"></span> revise work</strong>  \n" +
    "		<strong ng-if=\"data.value > 3\"><span class=\"glyphicon glyphicon-ok\"></span> work accepted</strong>  \n" +
    "	</span>\n" +
    "	<span class=\"clearfix\"></span>	\n" +
    "</div>");
}]);

angular.module("widgets/reminder.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/reminder.html",
    "<div  ng-init=\"show=false\"  class=\"reminder\"  ng-if = \"skipMicrotaskIn\">\n" +
    "	<span ng-show=\"show || status=='danger'\"\n" +
    "		 style=\"position:absolute; top:-20px; right:0px; text-align: right;\">\n" +
    "         <!-- left: {{(1-(skipMicrotaskIn / microtaskTimeout)) * 100| number :1}}%;  -->\n" +
    "        <b class=\"label text-{{status}}\">\n" +
    "            {{skipMicrotaskIn | date:'mm:ss'}}\n" +
    "        </b>\n" +
    "	</span>\n" +
    "    <div id=\"remainingTimeBar\" class=\"progress\">\n" +
    "        <div ng-mouseenter=\"show=true\"\n" +
    "        	 ng-mouseleave=\"show=false\"\n" +
    "        	 role=\"progressbar\"\n" +
    "        	 class=\"pull-right progress-bar progress-bar-{{status}}\"\n" +
    "        	 style=\"width:{{(skipMicrotaskIn / microtaskTimeout) * 100| number :1}}%\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "</div>");
}]);

angular.module("widgets/statements_progress_bar.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/statements_progress_bar.html",
    "<div ng-init=\"show=false\" >\n" +
    "	<div class=\"label\" ng-show=\"show\" style=\"position: absolute; padding-left: {{ (statements / max) * 100 | number: 0 }}%;\">\n" +
    "        {{max-statements}} {{ (max-statements) > 2 ? 'statements left' : ''}}\n" +
    "	</div>\n" +
    "    <div class=\"progress\">\n" +
    "        <div \n" +
    "        	ng-mouseenter=\"show=true\" \n" +
    "        	data-ng-mouseleave=\"show=false\" \n" +
    "        	class=\"pull-right progress-bar\" \n" +
    "        	ng-class=\"{\n" +
    "        		'progress-bar-success' : max - statements >= max * 0.5 ,\n" +
    "        		'progress-bar-warning' : max - statements < max * 0.5 && max - statements > max * 0.25, \n" +
    "        		'progress-bar-danger'  : max - statements < max * 0.25\n" +
    "        	}\" \n" +
    "        	role=\"progressbar\" \n" +
    "        	style=\"width:{{ ( 1-statements / max ) * 100 | number :0 }}%\">\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    \n" +
    "</div>");
}]);

angular.module("widgets/test_editor.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/test_editor.html",
    "<div \n" +
    "	style=\"height:200px\"\n" +
    "	ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme: 'chrome'  }\" \n" +
    "	ng-model=\"ngModel\"\n" +
    "	>\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/test_editor_help.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("widgets/test_editor_help.html",
    "<div class=\"popover\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "  <div class=\"popover-content\">\n" +
    "  	<p>\n" +
    "  		In the test editor you can use ChaiJs <a href=\"http://chaijs.com/api/bdd/\" target=\"_blank\"><strong>expect</strong></a> syntax\n" +
    "  	</p>\n" +
    "\n" +
    "  	<p>\n" +
    "  		Example:\n" +
    "  		<pre>var res = calculate('+',[1,2]);\n" +
    "expect(res).to.deep.equal(3);</pre>\n" +
    "\n" +
    "  	</p>\n" +
    "  	<p>\n" +
    "  		While editing the test code, you can open the autocomplete by pressing ALT+SPACE (Mac) or CTRL+SPACE (Win/Linux).\n" +
    "  	</p>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("worker_profile/profile_panel.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("worker_profile/profile_panel.html",
    "<div class=\"modal-dialog\">\n" +
    "	<div class=\"modal-content\">\n" +
    "		<div class=\"modal-header achievements\" style=\"height:60px\">\n" +
    "			<button type=\"button\" class=\"close\" ng-click=\"$parent.$hide()\">&times;</button>\n" +
    "			<div><img class=\"avatar\" ng-src=\"{{ avatar(workerProfile).$value }}\" /></div>\n" +
    "			<div class=\"workerName\">{{workerName}}</div>					\n" +
    "		</div>\n" +
    "		<div id=\"achievementsPanel\" class=\"modal-body achievements\">\n" +
    "			<div>\n" +
    "				\n" +
    "				<div class=\"subTitle\" style=\"color: white\">History:</div>\n" +
    "				<div id=\"board\" >	\n" +
    "					<div id=\"columns\">						\n" +
    "				  		<div class=\"infohistory\" ng-repeat=\"(i,stat) in workerStats | statsToShow | orderBy:'$id'\"  ng-if=\"workerStats.length > 0 && stat.$value>0\" ng-switch on=\"stat.$id\">\n" +
    "						\n" +
    "						<div ng-switch-when=\"microtasks\">Microtasks: {{stat.$value}}</div>\n" +
    "						<div ng-switch-when=\"perfect_review\">Perfect Reviews (5 stars): {{stat.$value}}</div>\n" +
    "						<div ng-switch-when=\"good_review\">Good Reviews (4 stars): {{stat.$value}}</div>\n" +
    "						<div ng-switch-when=\"reviews\">Reviews: {{stat.$value}}</div>							\n" +
    "						<div ng-switch-when=\"describe_behavior\">Describe Function Behavior: {{stat.$value}}</div>								\n" +
    "						<div ng-switch-when=\"submits\">Submits (Consecutive): {{stat.$value}}</div>\n" +
    "						<div ng-switch-when=\"questions\">Questions: {{stat.$value}}</div>		\n" +
    "						<div ng-switch-when=\"answers\">Answers: {{stat.$value}}</div>		\n" +
    "						<div ng-switch-when=\"functions\">Implement Function Behavior: {{stat.$value}}</div>	\n" +
    "						<div ng-switch-when=\"skips\">Skips: {{stat.$value}}</div>\n" +
    "					\n" +
    "				  		</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "						\n" +
    "				<div class=\"subTitle\" style=\"color: white\">Achievements:</div>\n" +
    "				<div id=\"board\" >	\n" +
    "					<div id=\"columns\" class=\"container-fluid\">			\n" +
    "			  			<div class=\"pin\" \n" +
    "			  				ng-repeat=\"(i,achievement) in listOfachievements |  orderBy:['condition','requirement']\" \n" +
    "			  				ng-if=\"listOfachievements.length > 0 && achievement.isUnlocked\" \n" +
    "			  				style=\"height:{{achievement.height}}px\">\n" +
    "			  			\n" +
    "				  			<div class=\"icon\"><img style=\"width:30px;height:{{achievement.height}}px\" ng-src=\"{{ icon(achievement.condition).$value }}\" /></div>					\n" +
    "											\n" +
    "							<div class=\"title\">{{achievement.title}}</div>		\n" +
    "							<div class=\"info\">{{achievement.message}}</div>			\n" +
    "							<div ng-if=\"!hasAchievement\">{{gotAchievement()}}</div>		\n" +
    "						\n" +
    "						</div>\n" +
    "					</div>\n" +
    "						<div class=\"title\" ng-if=\"!hasAchievement\" >\n" +
    "							This worker doesn't have any achievement yet.\n" +
    "						</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("worker_profile/workerStatsModal.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("worker_profile/workerStatsModal.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" worker-profile=\"id\">\n" +
    "</div>");
}]);
