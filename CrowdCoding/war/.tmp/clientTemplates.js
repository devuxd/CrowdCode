angular.module('templates-main', ['chat/alert_chat.html', 'chat/chat_panel.html', 'data_types/adt_list.html', 'data_types/examples_list_popover.html', 'functions/function_conventions.html', 'functions/javascript_tutorial.html', 'leaderboard/leaderboard_panel.html', 'microtasks/alert_submit.html', 'microtasks/debug_test_failure/debug_test_failure.html', 'microtasks/loading.html', 'microtasks/microtask_form.html', 'microtasks/microtask_title.html', 'microtasks/no_microtask/no_microtask.html', 'microtasks/reissue_microtask.html', 'microtasks/reuse_search/reuse_search.html', 'microtasks/review/review.html', 'microtasks/review/review_DebugTestFailure.html', 'microtasks/review/review_ReuseSearch.html', 'microtasks/review/review_WriteCall.html', 'microtasks/review/review_WriteFunction.html', 'microtasks/review/review_WriteFunctionDescription.html', 'microtasks/review/review_WriteTest.html', 'microtasks/review/review_WriteTestCases.html', 'microtasks/write_call/write_call.html', 'microtasks/write_function/write_function.html', 'microtasks/write_function_description/write_function_description.html', 'microtasks/write_test/write_test.html', 'microtasks/write_test_cases/write_test_cases.html', 'newsfeed/news_panel.html', 'newsfeed/news_popover.html', 'newsfeed/news_popover_DebugTestFailure.html', 'newsfeed/news_popover_ReuseSearch.html', 'newsfeed/news_popover_WriteCall.html', 'newsfeed/news_popover_WriteFunction.html', 'newsfeed/news_popover_WriteFunctionDescription.html', 'newsfeed/news_popover_WriteTest.html', 'newsfeed/news_popover_WriteTestCases.html', 'tutorials/DebugTestFailure.html', 'tutorials/ReuseSearch.html', 'tutorials/Review.html', 'tutorials/WriteCall.html', 'tutorials/WriteFunction.html', 'tutorials/WriteFunctionDescription.html', 'tutorials/WriteTest.html', 'tutorials/WriteTestCases.html', 'tutorials/main.html', 'users/user_popover.html', 'widgets/ace_edit_js.html', 'widgets/description_popover.html', 'widgets/dropdown_main.html', 'widgets/navbar.html', 'widgets/popup_feedback.html', 'widgets/popup_reminder.html', 'widgets/popup_shortcuts.html', 'widgets/popup_template.html', 'widgets/popup_user_profile.html', 'widgets/reminder.html', 'widgets/statements_progress_bar.html', 'widgets/stubs_modal.html', 'widgets/test_result.html']);

angular.module("chat/alert_chat.html", []).run(["$templateCache", function($templateCache) {
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

angular.module("chat/chat_panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("chat/chat_panel.html",
    "<div id=\"chatPanel\" class=\"chat {{chatActive?'active':''}}\">\n" +
    "\n" +
    "	<div class=\"header\"> \n" +
    "		<span>Project chat</span>\n" +
    "		<span class=\"pull-right btn-close glyphicon glyphicon-remove\" ng-click=\"$emit('toggleChat')\"></span>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"output\" scroll-glue>\n" +
    "		<ul class=\"messages\">\n" +
    "			<li ng-repeat=\"m in messages\">\n" +
    "	      		<div class=\"avatar\"><img ng-src=\"{{ avatar(m.workerId).$value }}\"  alt=\"\" /></div>\n" +
    "	      		<div class=\"message\">\n" +
    "	      			<span class=\"nickname\">\n" +
    "						{{m.workerHandle}}:</span>\n" +
    "	      			<span class=\"text\">{{m.text}}</span>\n" +
    "	      		</div>\n" +
    "	      		<!--<div class=\"timestamp\">{{ m.createdAt | date : 'medium'}}</div>-->\n" +
    "	      			\n" +
    "	      		<div class=\"clearfix\"></div>\n" +
    "	      	</li>\n" +
    "	      	<li class=\"clearfix\"></li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"input\">\n" +
    "		<textarea ng-model=\"data.newMessage\" ng-model-option=\"{ updateOn: 'blur'}\"class=\"input-sm\" press-enter=\"addMessage()\" ></textarea>\n" +
    "	</div>\n" +
    "	\n" +
    "</div>");
}]);

angular.module("data_types/adt_list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data_types/adt_list.html",
    "<div class=\"panel-group adt-list\" bs-collapse ng-model=\"ADTs.selectedADT\">\n" +
    "    <div class=\"panel panel-default\" ng-repeat=\"(index,ADT) in ADTs\">\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <h4 class=\"panel-title\">\n" +
    "            <a bs-collapse-toggle>\n" +
    "                <span ng-if=\" ADTs.selectedADT !== index \" class=\"glyphicon glyphicon-chevron-right\" ></span>\n" +
    "                <span ng-if=\" ADTs.selectedADT === index \" class=\"glyphicon glyphicon-chevron-down\" ></span>\n" +
    "                {{ ADT.name }}\n" +
    "            </a>\n" +
    "            </h4>\n" +
    "        </div>\n" +
    "        <div class=\"panel-collapse\" bs-collapse-target>\n" +
    "            <div class=\"panel-body\">\n" +
    "                <div data-ng-bind-html=\"ADT.description | newline\" ></div><br />\n" +
    "\n" +
    "                <div ng-if=\"::(ADT.structure.length>0)\">\n" +
    "                    <h5 for=\"structure\">DATA STRUCTURE</h5>\n" +
    "                    <pre ng-bind=\"::buildStructure(ADT)\"></pre>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"::ADT.examples\" ng-init=\"selectedExample=ADT.examples[0]\" >\n" +
    "                    <h5 class=\"pull-left\" for=\"exampleSelect\">EXAMPLES:</h5>\n" +
    "                    <button name= \"exampleSelect\" \n" +
    "                            class=\"btn-select pull-right\"\n" +
    "                            bs-select  \n" +
    "                            ng-model=\"selectedExample\" \n" +
    "                            data-html=\"1\" \n" +
    "                            data-placement=\"bottom-right\"\n" +
    "                            ng-options=\"example.name for example in ADT.examples\" >\n" +
    "                    </button>\n" +
    "                    <span class=\"clearfix\"></span>\n" +
    "                    <div ace-read-json ng-model=\"::selectedExample.value\" class=\"clearfix adt-detail\" copy-allowed></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("data_types/examples_list_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data_types/examples_list_popover.html",
    "<div class=\"popover examples-list-popover\">\n" +
    "	<a href=\"#\" ng-repeat=\"example in examplesList\"  ng-click=\" togglePopover(key) ; loadExampleValue(example.value)\"> {{example.name}}<br/></a>\n" +
    "</div>");
}]);

angular.module("functions/function_conventions.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("functions/function_conventions.html",
    "<div class=\"function-conventions\">\n" +
    "	<p>\n" +
    "		Use <strong style=\"text-transform:uppercase\">pseudocode</strong> to sketch an implementation by using the syntax\n" +
    "		'<span class=\"pseudoCode\">//#  sketch of implementation</span>'.\n" +
    "		<pre ng-bind-html=\"examplePseudocode\"></pre>\n" +
    "	</p>\n" +
    "\n" +
    "	<p>\n" +
    "		Use <strong style=\"text-transform:uppercase\">function stubs</strong> to request a function call to a new or existing function. Call the function as normal, and define a <strong style=\"text-transform:uppercase\">function stub</strong> at the bottom with a short description, header, and an empty body.\n" +
    "		<pre ng-bind-html=\"examplePseudocall\"></pre>\n" +
    "	</p>\n" +
    "	<p>\n" +
    "		<b>Note:</b> all function calls are pass by value (i.e., if you pass an\n" +
    "		object to a function, and the function changes the object, you will not\n" +
    "		see the changes).\n" +
    "	</p>\n" +
    "</div>");
}]);

angular.module("functions/javascript_tutorial.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("functions/javascript_tutorial.html",
    "<!-- Button trigger modal -->\n" +
    "<a href=\"#\"  data-toggle=\"modal\" data-target=\"#javascriptTutorial\"  >\n" +
    "JAVASCRIPT TUTORIAL \n" +
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

angular.module("leaderboard/leaderboard_panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("leaderboard/leaderboard_panel.html",
    "<h3 class=\"toggler\">Leaderboard</h3>\n" +
    "<div id=\"leaderboardPanel\"  class=\"element active\" style=\"height:40%\">\n" +
    "	<div class=\"element-body scrollable\">\n" +
    "		<div>\n" +
    "			<ul class=\"sidebar-list leaderboard\" >\n" +
    "			  	<li ng-repeat=\"leader in leaders | orderBy:'-score'\" ng-if=\"leaders.length > 0\" \n" +
    "			  	  class=\"{{ leaders.$keyAt(leader) == workerId ? 'self' : '' }}\" >\n" +
    "			  	\n" +
    "			  		<div class=\"avatar\"><img style=\"width:25px\" ng-src=\"{{ avatar(leaders.$keyAt(leader)).$value }}\" alt=\"{{ ::leader.name }}\" /></div>\n" +
    "			  		<div class=\"score\">{{ leader.score }} pts</div>\n" +
    "			  		<div class=\"name\">{{::(leader.name) }}</div>\n" +
    "\n" +
    "			  		<div class=\"clearfix\"></div>\n" +
    "\n" +
    "				\n" +
    "			  	</li>\n" +
    "			</ul>\n" +
    "			<span ng-if=\"leaders.length == 0\" >\n" +
    "				no leaders yet!\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/alert_submit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/alert_submit.html",
    "<div class=\"alert submit-alert\" ng-class=\"[type ? 'alert-' + type : null]\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "  <strong ng-bind=\"title\"></strong>&nbsp;<span ng-bind-html=\"content\"></span>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/debug_test_failure/debug_test_failure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/debug_test_failure/debug_test_failure.html",
    "<div ng-controller=\"DebugTestFailureController\"  >\n" +
    "    \n" +
    "\n" +
    "    <div class=\"section section-description \" >\n" +
    "        \n" +
    "        <div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/loading.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/loading.html",
    "<div class=\"loading-microtask\" >\n" +
    "	<div class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></div> Loading microtask...\n" +
    "</div>");
}]);

angular.module("microtasks/microtask_form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/microtask_form.html",
    "<form name=\"microtaskForm\" class=\"form-horizontal\" novalidate microtask-shortcuts>\n" +
    "	<div id=\"task\" class=\"task\" microtask >\n" +
    "		<ng-include class=\"{{ !noMicrotask ? 'task-' + (microtask.type | lowercase) : '' }}\" src=\"templatePath\"></ng-include>\n" +
    "	</div>\n" +
    "	<reminder></reminder>\n" +
    "\n" +
    "	<div class=\"button-bar\">\n" +
    "		<div class=\"btn-group pull-left\" role=\"group\" ng-show=\"!noMicrotask\" >\n" +
    "			<button type=\"button\"\n" +
    "\n" +
    "       	 		id= \"skipBtn\"\n" +
    "       			ng-click=\"$emit('skipMicrotask')\" \n" +
    "       			tabindex=\"100\" \n" +
    "       			class=\"btn btn-default btn-sm\">\n" +
    "       			Skip\n" +
    "       		</button>\n" +
    "		  	\n" +
    "		  	<button type=\"button\" \n" +
    "      			id=\"submitBtn\"\n" +
    "		  		ng-click=\"$broadcast('collectFormData', microtaskForm) \" \n" +
    "		  		tabindex=\"99\" \n" +
    "		  		class=\"btn btn-primary btn-sm\">\n" +
    "		  		Submit\n" +
    "		  	</button>\n" +
    "		 \n" +
    "		</div>\n" +
    "\n" +
    "		<span class=\"pull-right\">\n" +
    "			<span ng-if=\"unreadMessages > 0\" class=\"unread-messages\">{{unreadMessages}}</span>\n" +
    "			<button ng-click=\"$emit('toggleChat')\" tabindex=\"101\" class=\"btn btn-chat-toggle {{chatActive?'opened':''}} btn-sm\"  >\n" +
    "\n" +
    "				<span class=\"glyphicon glyphicon-comment\"></span>\n" +
    "			</button>\n" +
    "		</span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	\n" +
    "	</div>\n" +
    "</form>");
}]);

angular.module("microtasks/microtask_title.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/microtask_title.html",
    "<div class=\"section-content no-padding microtask-details\" >\n" +
    "		<span class=\"bg-color type\">{{::microtask.title}}</span>\n" +
    "		<span class=\"reissued\" ng-if=\"microtask.reissuedFrom !== undefined\">REISSUED</span>\n" +
    "		<span class=\"points\">{{::microtask.points}} pts</span>\n" +
    "		<span class=\"tutorial-btn glyphicon glyphicon-question-sign color\" ng-click=\"$emit('run-tutorial', microtask.type, true); \"></span>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "</div>");
}]);

angular.module("microtasks/no_microtask/no_microtask.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/no_microtask/no_microtask.html",
    "<div ng-controller=\"NoMicrotaskController\" >\n" +
    "	<div class=\"alert alert-warning no-microtask\" role=\"alert\" >\n" +
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
    "		  		<div class=\"position\">#{{$index+1}}</div>\n" +
    "		  		<div class=\"avatar\"><img ng-src=\"{{ avatar(leaders.$keyAt(leader)).$value }}\" alt=\"{{ ::leader.name }}\" /></div>\n" +
    "		  		<div class=\"score\">{{ leader.score }} pts</div>\n" +
    "		  		<div class=\"name\">{{::(leader.name) }}</div>\n" +
    "\n" +
    "		  		<div class=\"clearfix\"></div>\n" +
    "\n" +
    "			\n" +
    "		  </li>\n" +
    "		</ul>\n" +
    "		<span ng-if=\"leaders.length == 0\" >\n" +
    "			no leaders yet!\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/reissue_microtask.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/reissue_microtask.html",
    "<div >\n" +
    "	<div class=\"section section-description\"  >\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			REISSUE MOTIVATION\n" +
    "		</div>\n" +
    "		<div class=\"section-content\">\n" +
    "			{{reissuedMicrotask.review.reviewText}}\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("microtasks/reuse_search/reuse_search.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/reuse_search/reuse_search.html",
    "<div ng-controller=\"ReuseSearchController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "		\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			A worker editing the function <strong>{{funct.getName()}}</strong> requested a call to a function providing the behavior of <strong>{{ microtask.pseudoFunctionName }}</strong>. Can you find a function providing such behavior (which might be named differently), or indicate that no such function exists?\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTED BEHAVIOR\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTING FUNCTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"code\" highlight=\"[ { 'needle' : microtask.pseudoFunctionName , regex: true } ]\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div> HINT\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					Choose a function that provides the requested behavior ( you can filter the list of functions by entering text in the input box).\n" +
    "					<strong>If there isn't the right function, click check \"no function found\".</strong>\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-title no-padding\" >\n" +
    "\n" +
    "					<div class=\"input-group\">\n" +
    "						<input\n" +
    "							class=\"form-control\"\n" +
    "							tabindex=\"1\"\n" +
    "							type=\"text\"\n" +
    "							name=\"newtestcase\"\n" +
    "							ng-model=\"text\"\n" +
    "							ng-change=\"doSearch()\"\n" +
    "							placeholder=\"Search for functions\"\n" +
    "							focus/>\n" +
    "						<span class=\"input-group-btn\">\n" +
    "							<button class=\"btn btn-default\" ng-click=\"doSearch()\" type=\"button\" tabindex=\"2\">\n" +
    "								<span class=\"glyphicon glyphicon-filter\"></span>\n" +
    "							</button>\n" +
    "						</span>\n" +
    "\n" +
    "					</div>\n" +
    "					<div class=\"input-group\" style=\"width:100%\">\n" +
    "\n" +
    "						<b>If you can't find any, select: \n" +
    "						<input type=\"checkbox\" ng-model=\"selectedResult\" ng-true-value=\"-1\" ng-false-value=\"-2\"> No function found</b>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "				<div class=\"section-content no-padding\">\n" +
    "\n" +
    "					<div ng-if=\"results.length > 0\" class=\"list-group\">\n" +
    "						<div ng-repeat= \"function in results | orderBy:'-score'\" \n" +
    "						     class=\"list-element animate-repeat {{ selectedResult == $index ? 'selected' : '' }}\"\n" +
    "						     ng-click=\"select($index)\" description-popover=\"function.value.getSignature()\">\n" +
    "								<b>{{function.value.getHeader()}}</b>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<span ng-if=\"results.length == 0\" >No function found</span>\n" +
    "					\n" +
    "\n" +
    "				</div>\n" +
    "\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/review/review.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review.html",
    "<div ng-controller=\"ReviewController\">\n" +
    "\n" +
    "	<div ng-if=\"reviewed !== undefined\" ng-include=\"'/client/microtasks/review/review_' + reviewed.type + '.html'\"></div>\n" +
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
    "						<strong ng-if=\"review.rating <= 3\"><span class=\"glyphicon glyphicon-refresh\"></span> revise work</strong>  \n" +
    "						<strong ng-if=\"review.rating > 3\"><span class=\"glyphicon glyphicon-ok\"></span> work accepted</strong>  \n" +
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
    "\n" +
    "</div>");
}]);

angular.module("microtasks/review/review_DebugTestFailure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_DebugTestFailure.html",
    "<div ng-if=\"review.microtask.submission.hasPseudo\">\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/review/review_ReuseSearch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_ReuseSearch.html",
    "<div class=\"section section-description \" >\n" +
    "	\n" +
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/review/review_WriteCall.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteCall.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/review/review_WriteFunction.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteFunction.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/review/review_WriteFunctionDescription.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteFunctionDescription.html",
    "<div class=\"section section-description \" >\n" +
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/review/review_WriteTest.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteTest.html",
    "<div class=\"section section-description \" >\n" +
    "\n" +
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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

angular.module("microtasks/review/review_WriteTestCases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/review/review_WriteTestCases.html",
    "<div class=\"section section-description \" >\n" +
    "		\n" +
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section-content job-description\" >\n" +
    "		<!-- if function description disputed -->\n" +
    "		<div ng-if=\"reviewed.submission.inDispute\" >\n" +
    "			A worker reported an issue with a test case for the function\n" +
    "			<strong>{{ reviewed.owningArtifact }}</strong>.\n" +
    "			<span>Can you review this issue?</span>\n" +
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

angular.module("microtasks/write_call/write_call.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_call/write_call.html",
    "<div ng-controller=\"WriteCallController\" >\n" +
    "\n" +
    "	 \n" +
    "	<div class=\"section section-description \" >\n" +
    "		\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			<div ng-if=\"microtask.pseudoFunctionName!=calleeFunction.getName()\">\n" +
    "				The crowd found that the calls to the function\n" +
    "				<strong>{{ microtask.pseudoFunctionName }}</strong>\n" +
    "				can be implemented by using the function <strong>{{calleeFunction.getName()}}</strong>.\n" +
    "				Based on the description of <strong>{{calleeFunction.getName()}}</strong>\n" +
    "				, can you revise the call(s) to <strong>{{ microtask.pseudoFunctionName }}</strong> ?\n" +
    "				<br />\n" +
    "			</div>\n" +
    "			<div ng-if=\"microtask.pseudoFunctionName==calleeFunction.getName()\">\n" +
    "				The crowd has created a description for the function <strong>{{ microtask.pseudoFunctionName }}</strong>, called by the function below. Based on the description, can you check if the call(s) are correct, and revise them if necessary?\n" +
    "			</div>\n" +
    "			<strong>Tip:</strong> If you know a better way to implement the function, you may revise the function as you see fit.\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'/client/microtasks/reissue_microtask.html'\"></div>\n" +
    "	\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> FUNCTION DESCRIPTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"calleeFunction.getSignature()\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				\n" +
    "                <div class=\"section-title\" > \n" +
    "					<div class=\"dot\"></div> \n" +
    "					<javascript-helper ></javascript-helper>\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" > <div class=\"dot\"></div> AVAILABLE DATA TYPES </div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<ace-edit-js function=\"funct\" editor=\"data.editor\" markers=\"data.markers\"></ace-edit-js>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/write_function/write_function.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_function/write_function.html",
    "<div ng-controller=\"WriteFunctionController\" >\n" +
    "	<div class=\"section section-description \" >\n" +
    "\n" +
    "\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "\n" +
    "			<div ng-if=\"::microtask.promptType=='SKETCH'\">\n" +
    "				Can you write some code in the function below?<br />\n" +
    "				<strong>TIP:</strong> If there’s a lot to do, be sure to use pseudocalls and / or pseudocode to leave some work for others\n" +
    "			</div>\n" +
    "			<div ng-if=\"::microtask.promptType=='RE_EDIT'\">\n" +
    "				The crowd reported an issue with this function. Can you fix the function to address this issue (if necessary)?\n" +
    "			</div>\n" +
    "			<div ng-if=\"::microtask.promptType=='REMOVE_CALLEE'\">\n" +
    "				The crowd has determined that the function <strong>{{callee.getName()}}</strong>, called in the function below, cannot be implemented as requested. Can you replace the call(s) to \n" +
    "				<strong>{{callee.getName()}}</strong> with a new implementation?\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"::microtask.promptType=='DESCRIPTION_CHANGE'\">\n" +
    "				The signature of the following callee has changed as follows. Can you updated the code, if necessary?\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'/client/microtasks/reissue_microtask.html'\"></div>\n" +
    "\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='RE_EDIT' || microtask.promptType=='REMOVE_CALLEE'\" >\n" +
    "		<div class=\"section-title\"> <div class=\"dot bg-color\"></div> Reported Issue </div>\n" +
    "		<div  class=\"section-content\" >\n" +
    "			<span ng-bind=\"::microtask.disputeText\"></span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-description\" ng-if=\"::(microtask.promptType=='SKETCH' || microtask.promptType=='RE_EDIT')\">\n" +
    "		<div class=\"section-title\"> <div class=\"dot bg-color\"></div> Conventions for writing functions </div>\n" +
    "		<div  class=\"section-content\" >\n" +
    "			<function-convections ></function-convections>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='DESCRIPTION_CHANGE'\">\n" +
    "		<div class=\"section-title\" > <div class=\"dot bg-color\"></div> Changes to Function Signature</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"::diffCode\" mode=\"diff\" ></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='REMOVE_CALLEE'\">\n" +
    "		<div class=\"section-title\" > <div class=\"dot bg-color\"></div> Description of Function Call to Remove </div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"::callee.getSignature()\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "	\n" +
    "	<div class=\"section-cols\" >\n" +
    "		<div class=\"container-flex-row\" ng-show=\"!dispute.active\" >\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%;\">\n" +
    "				<div class=\"section-title\" > \n" +
    "					<div class=\"dot\"></div> \n" +
    "					<javascript-helper ></javascript-helper>\n" +
    "				</div>\n" +
    "				<div class=\"section-title\" > <div class=\"dot\"></div> AVAILABLE DATA TYPES </div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div ng-if=\"!funct.readOnly && !dispute.active\" >\n" +
    "					<a class=\"pull-right\" ng-click=\"dispute.toggle(); $event.preventDefault(); $event.stopPropagation();\">\n" +
    "						Report function as impossible (or inadvisable) to implement \n" +
    "						<span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "					</a>\n" +
    "					<div class=\"clearfix\"></div>\n" +
    "				</div>\n" +
    "				<ace-edit-js function=\"funct\" editor=\"data.editor\" hasPseudo=\"data.hasPseudo\"></ace-edit-js>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"container-flex-row\" ng-show=\"dispute.active\">\n" +
    "			<div class=\"section section-form\" style=\"width:100%\" >\n" +
    "				<div class=\"section-content\">\n" +
    "					<div class=\"heading-1\" >Why should this function not be implemented?</div>\n" +
    "					<textarea \n" +
    "						name=\"disputeFunctionText\" \n" +
    "						class=\"form-control required\" \n" +
    "						style=\"resize:none\" \n" +
    "						ng-model=\"dispute.text\" \n" +
    "						ng-required=\"dispute.active\">\n" +
    "					</textarea>\n" +
    "					<a href=\"#\" class=\"btn btn-sm pull-right\" ng-click=\"dispute.toggle()\" > Go back</a>\n" +
    "				</div>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("microtasks/write_function_description/write_function_description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_function_description/write_function_description.html",
    "<div ng-controller=\"WriteFunctionDescriptionController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\">\n" +
    "		</div>\n" +
    "		<div class=\"section-content job-description\">\n" +
    "			A worker editing the function <strong>{{ funct.getName() }}</strong> requested that a function <strong>{{ microtask.pseudoFunctionName }}</strong> be created. Can you write a detailed description for the function doSub?\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'/client/microtasks/reissue_microtask.html'\"></div>\n" +
    "	\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTED FUNCTION\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-link\" ng-if=\"!dispute.active\" >\n" +
    "			<a ng-click=\"dispute.toggle(); $event.preventDefault(); $event.stopPropagation();\">\n" +
    "				Report function as impossible (or inadvisable) to implement <span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "			</a>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> REQUESTING FUNCTION\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"code\" highlight=\"[ { 'needle' : microtask.pseudoFunctionName , regex: true } ]\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "\n" +
    "	<div class=\"section-cols\" ng-if=\"!dispute.active\">\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content\">\n" +
    "					<div class=\"form-horizontal\" role=\"form\" style=\"display:inline-block\">\n" +
    "					  	<div class=\"form-group\">\n" +
    "						    <label for=\"description\" class=\"col-sm-2 control-label reset-padding\">description</label>\n" +
    "						    <div class=\"col-sm-10 reset-padding\">\n" +
    "						      	<textarea class=\"form-control\" name=\"description\" \n" +
    "						      		placeholder=\"briefly describe the purpose and the behavior of the function\" \n" +
    "						      		ng-model=\"model.description\" \n" +
    "						      		ng-model-options=\"{ updateOn: 'blur' }\"  \n" +
    "						      		required \n" +
    "						      		ng-pattern=\"/^[^/\\\\]+$/\" \n" +
    "						      		max-length=\"70\"\n" +
    "						      		focus>\n" +
    "						      	</textarea>\n" +
    "								<div class=\"help-block\" ng-messages=\"microtaskForm.description.$dirty &&microtaskForm.description.$error\">\n" +
    "									<span ng-message=\"required\">\n" +
    "										The description is required!\n" +
    "									</span>\n" +
    "									<span ng-message=\"pattern\">\n" +
    "										The special charachters \"\\\" and \"/\" are not allowed!\n" +
    "									</span>\n" +
    "								</div>\n" +
    "						    </div>\n" +
    "					  	</div>\n" +
    "					  	<div class=\"form-group\">\n" +
    "						    <label for=\"returnType\" class=\"col-sm-2 control-label reset-padding\">return data type</label>\n" +
    "						    <div class=\"col-sm-10 reset-padding\">\n" +
    "						      	<input type=\"text\" class=\"form-control\" name=\"returnType\" \n" +
    "						      		ng-model=\"model.returnType\" \n" +
    "						      		ng-model-options=\"{ updateOn: 'blur' }\"  \n" +
    "						      		adt-validator \n" +
    "						      		required \n" +
    "						      		placeholder=\"return data type\" \n" +
    "						      		press-enter=\"addParameter()\" >\n" +
    "\n" +
    "						    	<div class=\"help-block\" ng-messages=\"microtaskForm.returnType.$dirty &&microtaskForm.returnType.$error\">\n" +
    "									<span ng-message=\"required\">\n" +
    "										The return type is required!\n" +
    "									</span>\n" +
    "									<span ng-message=\"adt\">\n" +
    "										{{microtaskForm.returnType.$error.adt}}\n" +
    "									</span>\n" +
    "								</div>\n" +
    "						    </div>\n" +
    "					  	</div>\n" +
    "					  	<div class=\"form-group\">\n" +
    "						    <label for=\"functionName\" class=\"col-sm-2 control-label reset-padding\">function name</label>\n" +
    "						    <div class=\"col-sm-10 reset-padding\">\n" +
    "						      	<input type=\"text\" \n" +
    "						      		class=\"form-control\" \n" +
    "						      		name=\"functionName\" \n" +
    "						      		ng-model=\"model.functionName\" \n" +
    "						      		ng-model-options=\"{ updateOn: 'blur' }\"  \n" +
    "						      		required \n" +
    "						      		function-name-validator \n" +
    "						      		var-name-validator \n" +
    "						      		reserved-word \n" +
    "						      		placeholder=\"function name\" \n" +
    "						      		press-enter=\"addParameter()\" \n" +
    "						      	>\n" +
    "						    	<div class=\"help-block\" ng-messages=\"microtaskForm.functionName.$dirty &&microtaskForm.functionName.$error\">\n" +
    "									<span ng-message=\"required\">\n" +
    "										The function name is required!\n" +
    "									</span>\n" +
    "									<span ng-message=\"var\">\n" +
    "										The function name can't start with numbers or contain special characters (except the underscore _ )!\n" +
    "									</span>\n" +
    "									<span ng-message=\"function\"> \n" +
    "										The function name is already taken!\n" +
    "									</span>\n" +
    "									<span ng-message=\"reservedWord\">\n" +
    "										The function name is a reserved word of JavaScript!\n" +
    "									</span>\n" +
    "								</div>\n" +
    "						    </div>\n" +
    "					  	</div>\n" +
    "					  	<div class=\"form-group col-sm-12\">\n" +
    "						    <label class=\" control-label col-sm-2 reset-padding\">parameters</label>\n" +
    "							<div class=\"form-group col-sm-10 reset-padding\" >\n" +
    "								<div ng-repeat=\"(index,parameter) in model.parameters\" ng-form=\"param\" >\n" +
    "									<div class=\"form-horizontal\" style=\"display:inline-block\" >\n" +
    "									    <div class=\"col-sm-3 reset-padding\">\n" +
    "									      	<input type=\"text\" class=\"form-control pull-left\" \n" +
    "									      		ng-model=\"parameter.name\" \n" +
    "									      		required \n" +
    "									      		var-name-validator \n" +
    "									      		reserved-word \n" +
    "									      		placeholder=\"name\" \n" +
    "									      		name=\"parameterName\" \n" +
    "									      		unic-name parameters=\"parameters\" \n" +
    "									      		press-enter=\"addParameter()\"/>\n" +
    "										</div>\n" +
    "										<div\n" +
    "										<div class=\"col-sm-3 reset-padding\">\n" +
    "									      	<input type=\"text\" class=\"form-control pull-left\" \n" +
    "									      		name=\"parameterType\" \n" +
    "									      		ng-model=\"parameter.type\" \n" +
    "									      		ng-model-options=\"{ updateOn: 'blur' }\" \n" +
    "									      		required \n" +
    "									      		adt-validator \n" +
    "									      		placeholder=\"type\" \n" +
    "									      		press-enter=\"addParameter()\"/>\n" +
    "										</div>\n" +
    "										<div class=\"col-sm-5 reset-padding\">\n" +
    "									      	<input type=\"text\" class=\"form-control pull-left\" name=\"parameterDescription\" placeholder=\"description\" ng-model=\"parameter.description\" required ng-pattern=\"/^[a-zA-Z0-9_-\\s]+$/\" press-enter=\"addParameter()\"/>\n" +
    "										</div>\n" +
    "										<div class=\"col-sm-1 reset-padding\">\n" +
    "									      	<button ng-click=\"deleteParameter(index)\" class=\"btn  pull-right\">X</button>\n" +
    "									    </div>\n" +
    "									</div>\n" +
    "\n" +
    "\n" +
    "									<div class=\"help-block\" \n" +
    "										ng-messages=\"param.parameterName.$dirty && param.parameterName.$error\">\n" +
    "										<span ng-message=\"required\">\n" +
    "											The parameter name is required!\n" +
    "										</span>\n" +
    "										<span ng-message=\"unic\">\n" +
    "											More occurence of the same parameter name have been found, plese fix them!\n" +
    "										</span>\n" +
    "										<span ng-message=\"var\">\n" +
    "											The parameter name can't start with numbers or contain special characters (except the underscore _ )!\n" +
    "										</span>\n" +
    "										<span ng-message=\"reservedWord\">\n" +
    "											The parameter name is a reserved JavaScript word!\n" +
    "										</span>\n" +
    "									</div>\n" +
    "\n" +
    "									<div class=\"help-block\" ng-messages=\"param.parameterType.$dirty && param.parameterType.$error\">\n" +
    "										<span ng-message=\"required\">\n" +
    "											The type is required!\n" +
    "										</span>\n" +
    "										<span ng-message=\"adt\" >\n" +
    "											{{param.parameterType.$error.adt}}\n" +
    "										</span>\n" +
    "									</div>\n" +
    "\n" +
    "									<div class=\"help-block\" ng-messages=\"param.parameterDescription.$dirty && param.parameterDescription.$error\">\n" +
    "										<span ng-message=\"required\">\n" +
    "											The description is required!\n" +
    "										</span>\n" +
    "										<span ng-message=\"pattern\" >\n" +
    "											Only the special characters _ and - are allowed!\n" +
    "										</span>\n" +
    "									</div>\n" +
    "\n" +
    "							  	</div>\n" +
    "						  	</div>\n" +
    "						</div>\n" +
    "					  	<div class=\"form-group\">\n" +
    "					  		<div class=\"col-sm-12 reset-padding\">\n" +
    "					  			<button ng-click=\"addParameter()\" class=\"btn btn-mini pull-right\">Add Parameter</button>\n" +
    "					  		</div>\n" +
    "					  	</div>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-form\" ng-if=\"dispute.active\">\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div class=\"heading-1\" >Why is this function impossible (or inadvisable) to implement?</div>\n" +
    "			<textarea \n" +
    "				name=\"disputeFunctionText\" \n" +
    "				class=\"form-control required\" \n" +
    "				style=\"resize:none\" \n" +
    "				ng-model=\"dispute.text\" \n" +
    "				ng-required=\"dispute.active\">\n" +
    "			</textarea>\n" +
    "			<a href=\"#\" class=\"btn btn-sm pull-right\" ng-click=\"dispute.toggle()\" > Go back</a>\n" +
    "		</div>\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/write_test/write_test.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_test/write_test.html",
    "<div ng-controller=\"WriteTestController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='WRITE'\">\n" +
    "				Can you implement the following test case, providing a JSON object literal for each input parameter and for the expected return value?<br />\n" +
    "				<strong>Tip:</strong> Descriptions of the data types are on the left, with examples you can copy and paste.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='CORRECT'\">\n" +
    "				The crowd reported an issue with this test. \n" +
    "				Can you fix the test to address this issue (if necessary)?\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				The description of the testCase has changed, as result, the test might be no longer correct.<BR>\n" +
    "				Can you update the test, if necessary?<BR>\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "				The signature or description of the function being tested has changed, as result, the test might be no longer correct.<BR>\n" +
    "				Can you update the test, if necessary?<BR>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-if=\"microtask.reissuedFrom !== undefined\" ng-include=\"'/html/templates/reissue_microtask.html'\"></div>\n" +
    "\n" +
    "	\n" +
    "	<div class=\"section section-description\" ng-if=\"microtask.promptType != 'FUNCTION_CHANGED'\" >\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION</div>\n" +
    "		<div class=\"section-link\" ng-hide=\"funct.readOnly || disputeFunction.active\" >\n" +
    "			<a ng-click=\"disputeFunction.toggle(); $event.preventDefault(); $event.stopPropagation();\">Report an issue with the function <span class=\"glyphicon glyphicon-exclamation-sign\"></span></a>\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"funct.getSignature()\"></ace-read-js>\n" +
    "			<ace-read-js ng-if=\"microtask.promptType == 'FUNCTION_CHANGED'\" code=\"diffCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-description\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			TEST CASE\n" +
    "		</div>\n" +
    "		<div class=\"section-link\" ng-hide=\"test.readOnly || disputeTest.active\" >\n" +
    "			<a ng-click=\"disputeTest.toggle(); $event.preventDefault(); $event.stopPropagation();\">Report an issue in the test case <span class=\"glyphicon glyphicon-exclamation-sign\"></span></a>\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<span ng-if=\"microtask.promptType=='WRITE' || microtask.promptType=='FUNCTION_CHANGED' || microtask.promptType=='CORRECT'\" ng-bind=\"::test.description\"></span>\n" +
    "\n" +
    "			<span ng-if=\"microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "				<strong>Old description: </strong><span ng-bind=\"microtask.oldTestCase\"></span><br />\n" +
    "				<strong>New description: </strong><span ng-bind=\"::test.description\"></span>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	\n" +
    "	<div class=\"section section-description\" ng-if=\"::microtask.promptType=='CORRECT'\" >\n" +
    "		<div class=\"section-title\"> <div class=\"dot bg-color\"></div> ISSUE DESCRIPTION </div>\n" +
    "		<div  class=\"section-content\" >\n" +
    "			<span ng-bind=\"::microtask.issueDescription\"></span>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-description\" ng-if=\"microtask.promptType == 'FUNCTION_CHANGED'\" >\n" +
    "		<div class=\"section-title\" ><div class=\"dot bg-color\"></div>DIFF OF THE FUNCTION DESCRIPTION</div>\n" +
    "		<div class=\"section-link\" ng-hide=\"funct.readOnly || disputeFunction.active\" >\n" +
    "			<a ng-click=\"disputeFunction.toggle(); $event.preventDefault(); $event.stopPropagation();\">Report an issue in the function description<span class=\"glyphicon glyphicon-exclamation-sign\"></span></a>\n" +
    "		</div>\n" +
    "		<div class=\"section-content no-padding\" >\n" +
    "			<ace-read-js code=\"diffCode\" mode=\"diff\"></ace-read-js>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "\n" +
    "	<div class=\"section-cols\" ng-if=\"! disputeTest.active && !disputeFunction.active\">\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\">\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" >\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "\n" +
    "					<div class=\"heading-1\" >Input Parameters</div>\n" +
    "                    <table style=\"width:100%\" class=\"test\" ng-form=\"inputForm\" \n" +
    "                    	   ng-repeat=\"(index,parameter) in funct.getParameters()\">\n" +
    "                        <tr>\n" +
    "                            <td>\n" +
    "                            	{{parameter.name}}\n" +
    "					            <br />\n" +
    "					            <small>{{parameter.type}}</small>\n" +
    "                            </td>\n" +
    "                            <td>\n" +
    "								<ace-edit-json \n" +
    "									tabindex=\"{{index*5+1}}\" \n" +
    "									focus-if=\" index == 0 \" \n" +
    "									ng-model=\"testData.inputs[index]\" \n" +
    "									min-lines=\"2\"\n" +
    "									>\n" +
    "								</ace-edit-json>\n" +
    "\n" +
    "								<textarea type=\"text\" \n" +
    "									ng-model=\"testData.inputs[index]\"\n" +
    "									name=\"{{parameter.name}}\"\n" +
    "									ng-show=\"false\"\n" +
    "									required\n" +
    "									json-data-type=\"{{parameter.type}}\" />\n" +
    "\n" +
    "								<div class=\"help-block pull-left\" ng-show=\"inputForm.$dirty\" ng-messages=\"inputForm[parameter.name].$error\">\n" +
    "								    <div ng-message=\"required\">Please, fill this field</div>\n" +
    "								    <div ng-message=\"jsonDataType\">\n" +
    "								    	<span ng-repeat=\"e in inputForm[parameter.name].$error.jsonErrors\" ng-bind=\"e\"></span>\n" +
    "								    </div>\n" +
    "							  	</div>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                        <tr>\n" +
    "                        	<td colspan=\"2\">\n" +
    "                            	<a href=\"#\" tabindex=\"{{index*5+2}}\" examples-list param-type=\"parameter.type\" key = \"index\" value=\"testData.inputs[index]\">Paste Example</a>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </table>\n" +
    "\n" +
    "                    <div class=\"heading-1\" >Return Value </div>\n" +
    "                    <table style=\"width:100%\" class=\"test\" ng-form=\"outputForm\"  >\n" +
    "                        <tr>\n" +
    "                            <td>\n" +
    "                            	<small>{{funct.getReturnType()}}</small>\n" +
    "                            </td>\n" +
    "                            <td>\n" +
    "								<ace-edit-json \n" +
    "									tabindex=\"96\" \n" +
    "									ng-model=\"testData.output\" \n" +
    "									min-lines=\"2\"\n" +
    "									>\n" +
    "								</ace-edit-json>\n" +
    "\n" +
    "								<textarea type=\"text\" \n" +
    "									ng-model=\"testData.output\"\n" +
    "									name=\"output\"\n" +
    "									ng-show=\"false\"\n" +
    "									required\n" +
    "									json-data-type=\"{{funct.getReturnType()}}\" />\n" +
    "\n" +
    "								<div class=\"help-block pull-left\" ng-show=\"outputForm.$dirty\" ng-messages=\"outputForm.output.$error\">\n" +
    "								    <div ng-message=\"required\">Please, fill this field</div>\n" +
    "								    <div ng-message=\"jsonDataType\">\n" +
    "								    	<span ng-repeat=\"e in outputForm.output.$error.jsonErrors\" ng-bind=\"e\"></span>\n" +
    "								    </div>\n" +
    "							  	</div>\n" +
    "\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                        <tr>\n" +
    "                        	<td colspan=\"2\">\n" +
    "                            	<a href=\"#\" tabindex=\"97\" examples-list param-type=\"funct.returnType\" key = \"'-1'\" value='testData.output' >Paste Example</a>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </table>\n" +
    "\n" +
    "\n" +
    "\n" +
    "				</div> <!-- ./ SECTION CONTENT -->\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-form\" ng-show=\"disputeFunction.active\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>Report an issue in the function\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div id=\"disputeDiv\" class=\"form-group\">\n" +
    "				<label for=\"disputeText\">What's wrong with this function description? </label>\n" +
    "				<textarea name=\"disputeText\" class=\"form-control\" style=\"resize:none\" ng-model=\"disputeFunction.text\" ng-required=\"disputeFunction.active\"></textarea>\n" +
    "				<span\n" +
    "				class=\"help-block\" ng-show=\"microtaskForm.disputeText.$dirty && microtaskForm.disputeText.$invalid && microtaskForm.disputeText.$error.required\">This field is required!</span>\n" +
    "				<br>\n" +
    "				<button class=\"btn btn-sm pull-right\" ng-click=\"disputeFunction.toggle()\" >Nothing is wrong</button>\n" +
    "			</div>\n" +
    "		</div> \n" +
    "	</div> \n" +
    "\n" +
    "	<div class=\"section section-form\" ng-show=\"disputeTest.active\">\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div> Report an issue in THE TEST CASE\n" +
    "		</div>\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div id=\"disputeDiv\" class=\"form-group\">\n" +
    "				<label for=\"disputeTextInput\">What’s wrong with this test case? </label>\n" +
    "				<textarea name=\"disputeTextInput\" class=\"form-control\" class=\"resize:none\" ng-model=\"disputeTest.text\"  ng-required=\"disputeTest.active\"></textarea>\n" +
    "				<span\n" +
    "				class=\"help-block\" ng-show=\"microtaskForm.disputeTextInput.$dirty && microtaskForm.disputeTextInput.$invalid && microtaskForm.disputeTextInput.$error.required\">This field is required!</span>\n" +
    "				<br>\n" +
    "				<button class=\"btn btn-sm pull-right \" ng-click=\"disputeTest.toggle()\" >Nothing is wrong</button>\n" +
    "			</div>\n" +
    "		</div> <!-- /. WRITE TEST DIV -->\n" +
    "	</div> <!-- ./ SECTION CONTENT -->\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("microtasks/write_test_cases/write_test_cases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("microtasks/write_test_cases/write_test_cases.html",
    "<div ng-controller=\"WriteTestCasesController\" >\n" +
    "\n" +
    "	<div class=\"section section-description \" >\n" +
    "		<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
    "		<div class=\"section-content job-description\" >\n" +
    "			\n" +
    "\n" +
    "			<div ng-show=\"microtask.promptType=='WRITE'\" >\n" +
    "				Can you describe some test cases in which this function might be used? <br />\n" +
    "				Are there any unexpected corner cases that might not work? <br/>\n" +
    "				<strong>TIP:</strong> You don’t need to specify concrete, executable tests, only high-level descriptions of scenarios to be tested.\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-show=\"microtask.promptType=='CORRECT'\" >\n" +
    "				The crowd has reported an issue with one of the test cases for the function \n" +
    "				<strong>{{microtask.owningArtifact}}</strong>.<br>\n" +
    "				Can you fix the test case (and others if necessary)?\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-show=\"microtask.reissuedFrom !== undefined\" ng-include=\"'/client/microtasks/reissue_microtask.html'\"></div>\n" +
    "	\n" +
    " 	<div ng-if=\"microtask.issuedTestCase != ''\">\n" +
    "		<div class=\"section section-description\"  >\n" +
    "			<div class=\"section-title\" >\n" +
    "				<div class=\"dot bg-color\"></div>\n" +
    "				Reported Issue\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"section-content\">\n" +
    "\n" +
    "				<strong> Test case: </strong>\n" +
    "				<span>{{microtask.issuedTestCase}}</span>\n" +
    "				<br />\n" +
    "				<strong> Issue: </strong>\n" +
    "				<span>{{microtask.issueDescription}}</span>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    " 	</div>\n" +
    "	\n" +
    "\n" +
    "\n" +
    "	<div class=\"section section-description\" id=\"functionSignature\">\n" +
    "\n" +
    "		<div class=\"section-title\" >\n" +
    "			<div class=\"dot bg-color\"></div>\n" +
    "			FUNCTION DESCRIPTION\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-link\" ng-hide=\"funct.readOnly || dispute.active\" >\n" +
    "			<a ng-click=\"dispute.toggle(); $event.preventDefault(); $event.stopPropagation();\">\n" +
    "				Report an issue with the function <span class=\"glyphicon glyphicon-exclamation-sign\"></span>\n" +
    "			</a>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"section-content no-padding\">\n" +
    "			<ace-read-js code=\"::funct.getSignature()\" ></ace-read-js>\n" +
    "		</div>\n" +
    "		\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<alertcontainer></alertcontainer>\n" +
    "			\n" +
    "	<div class=\"section-cols\" ng-if=\"!dispute.active\" >\n" +
    "\n" +
    "		<div class=\"container-flex-row\">\n" +
    "			<div class=\"section section-help bg-color-alpha\" style=\"width:30%\" id=\"example\">\n" +
    "				<!--<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					EXAMPLE\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<div class=\"accordion-inner\">\n" +
    "						subtract(a, b)<BR>\n" +
    "\n" +
    "						<B>Here are some test cases:</B><BR>\n" +
    "						a is greater than b<BR>\n" +
    "						b is greater than a<BR>\n" +
    "						a is the same as b<BR>\n" +
    "						a is positive, b is negative<BR>\n" +
    "						a is negative, b is zero<BR>\n" +
    "						a is positive, b is zero<BR>\n" +
    "					</div>\n" +
    "				</div>-->\n" +
    "				<div class=\"section-title\" >\n" +
    "					<div class=\"dot\"></div>\n" +
    "					AVAILABLE DATA TYPES\n" +
    "				</div>\n" +
    "				<div class=\"section-content\" >\n" +
    "					<adt-list></adt-list>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "\n" +
    "			<div class=\"section section-form\" style=\"width:70%;\" id=\"form\" >\n" +
    "\n" +
    "				<div class=\"section-title no-padding\" >\n" +
    "					<div class=\"input-group\" ng-form=\"newForm\">\n" +
    "				    	<input type=\"text\"\n" +
    "				      		tabindex=\"1\"\n" +
    "				      		name=\"newTestCase\"\n" +
    "							ng-model=\"model.newTestCase\"\n" +
    "							press-enter=\"addTestCase()\"\n" +
    "							placeholder=\"Describe a test case\"\n" +
    "				      		class=\"form-control\"\n" +
    "				      		focus\n" +
    "				      	>\n" +
    "						<span class=\"input-group-btn\">\n" +
    "							<button class=\"btn btn-default\" ng-click=\"addTestCase()\" type=\"button\" tabindex=\"2\">\n" +
    "								<span class=\"glyphicon glyphicon-plus\"></span>\n" +
    "							</button>\n" +
    "						</span>\n" +
    "				    </div>\n" +
    "\n" +
    "				</div>\n" +
    "				<div class=\"section-content no-padding\" >\n" +
    "\n" +
    "					<div class=\"list-group\" >\n" +
    "						<div ng-form=\"testCase\" ng-repeat=\"(index,test) in model.testcases\" ng-if=\"test.deleted==false\" class=\"list-item input-group input-group-sm animate-repeat\" style=\"width:100%\" >\n" +
    "\n" +
    "						  	<input ng-if=\"!test.readOnly\" type=\"text\" class=\"form-control\"\n" +
    "							    placeholder=\"Describe a test case\"\n" +
    "							  	name=\"testcase\"\n" +
    "								ng-model=\"test.text\"\n" +
    "								press-enter=\" editMode = testCaseForm.testcase.$invalid ? true : false \"\n" +
    "							    ng-focus=\"editMode=true\"\n" +
    "							    ng-blur=\"editMode=false\"\n" +
    "							    tabindex=\"{{2*index+2}}\"\n" +
    "							    required\n" +
    "							>\n" +
    "\n" +
    "					  		<span  ng-if=\"!test.readOnly\" class=\"input-group-btn\" >\n" +
    "					  			<button class=\"btn\"  tabindex=\"{{2*index+3}}\" ng-click=\"removeTestCase($index)\" type=\"button\">\n" +
    "					  				<span class=\"glyphicon glyphicon-remove\"></span>\n" +
    "					  			</button>\n" +
    "							</span>\n" +
    "\n" +
    "							<input ng-if=\"test.readOnly\" type=\"text\" class=\"form-control\" \n" +
    "							  	name=\"testcase\"\n" +
    "								ng-model=\"test.text\"\n" +
    "							    readonly\n" +
    "							    data-placement=\"left\"\n" +
    "							    data-trigger=\"hover\" \n" +
    "							    data-title=\"this test case cannot be edited or removed\" \n" +
    "							    bs-tooltip\n" +
    "							>\n" +
    "\n" +
    "						</div>\n" +
    "							<div class=\"help-block\" ng-if=\"microtaskForm.$invalid\">\n" +
    "								a test case name can't be empty!\n" +
    "							</div>\n" +
    "					</div>\n" +
    "\n" +
    "					<span ng-if=\"model.testcases.length == 0\" >write at least one test case</span>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"section section-form\" ng-if=\"dispute.active\">\n" +
    "		<div class=\"section-content\" >\n" +
    "			<div class=\"heading-1\" >what's wrong with this FUNCTION DESCRIPTION?</div>\n" +
    "			<textarea \n" +
    "				name=\"disputeTextInput\" \n" +
    "				class=\"form-control required\" \n" +
    "				style=\"resize:none\" \n" +
    "				ng-model=\"dispute.text\" \n" +
    "				ng-required=\"dispute.active\">\n" +
    "			</textarea>\n" +
    "			<a href=\"#\" class=\"btn btn-sm pull-right\" ng-click=\"dispute.toggle()\" > Nothing is wrong</a>\n" +
    "		</div> \n" +
    "\n" +
    "		<span class=\"clearfix\"></span>\n" +
    "\n" +
    "	</div> \n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("newsfeed/news_panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_panel.html",
    "<h3 class=\"toggler\">Your activities</h3>\n" +
    "<div id=\"activityPanel\"  class=\"element active\"  style=\"height:40%\">\n" +
    "	<div class=\"element-body scrollable\">\n" +
    "		<div>\n" +
    "			<ul class=\"sidebar-list news\">\n" +
    "				<li microtask-popover\n" +
    "					class=\"news-element {{ n.microtaskType | lowercase }}\"\n" +
    "					ng-if=\"news.length > 0\" \n" +
    "					ng-repeat=\"n in news | orderBy:'-timeInMillis'\" \n" +
    "					ng-mouseenter=\"showMicrotaskPopover(n)\" \n" +
    "					>\n" +
    "					<div class=\"type\">{{::n.microtaskType}}</div>\n" +
    "					<div class=\"result\" ng-if=\"::(n.score != -1)\">\n" +
    "						<!--<span ng-if=\"::(n.score < 3)\" class=\"rejected\" >REJECTED</span>-->\n" +
    "						<span ng-if=\"::(n.score <= 3)\" class=\"reissued\">REISSUED</span>\n" +
    "						<span ng-if=\"::(n.score > 3)\" class=\"accepted\">ACCEPTED</span>\n" +
    "					</div>\n" +
    "					<span class=\"points\">{{::n.awardedPoints}}/<small>{{::n.maxPoints}}</small> pts</span>\n" +
    "					\n" +
    "			  		<div class=\"clearfix\"></div>\n" +
    "				</li>\n" +
    "			</ul>\n" +
    "			<div ng-if=\"news.length == 0\" >\n" +
    "				no news yet!\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "		        	\n" +
    "");
}]);

angular.module("newsfeed/news_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover.html",
    "<div class=\"popover popover-news task-{{ n.microtaskType | lowercase }}\" tabindex=\"-1\">\n" +
    "    <button type=\"button\" class=\"close popover-close\" ng-click=\"$hide()\">&times;</button>\n" +
    "    <h3 class=\"popover-title\"><b>Your work on: &emsp; </b> \n" +
    "        <span class=\"microtask-title\" ng-if=\"! n.isReview\">{{n.microtask.title}} </span>\n" +
    "        <span class=\"microtask-title\" ng-if=\"n.isReview\"> review</span>\n" +
    "    </h3>\n" +
    "    <!-- MICROTASK DATA -->\n" +
    "    <div ng-if=\"n.microtask.type\" ng-include=\"'/client/newsfeed/news_popover_' + n.microtask.type + '.html'\"></div>\n" +
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

angular.module("newsfeed/news_popover_DebugTestFailure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_DebugTestFailure.html",
    "<div ng-if=\" ! n.microtask.submission.disputedTests\">\n" +
    "    <div class=\"section section-description \" >\n" +
    "        <div class=\"section-content job-description\" ng-if=\" ! n.microtask.submission.hasPseudo\">\n" +
    "            Debug of the function <strong>{{ n.funct.getName() }}</strong>.\n" +
    "        </div>\n" +
    "        <div class=\"section-content job-description\" ng-if=\"n.microtask.submission.hasPseudo\">\n" +
    "            Edit of the function <strong>{{ n.funct.getName() }}</strong>.\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"section section-n\" >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>Code of the function\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getFullCode()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"n.microtask.submission.disputedTests\">\n" +
    "\n" +
    "    <div class=\"section section-description \" >\n" +
    "        <div class=\"section-content job-description\" >\n" +
    "\n" +
    "            Issue of the following test case for the function <strong>{{n.funct.getName()}}</strong>.\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"section section-description\">\n" +
    "        <div class=\"section-title\">\n" +
    "            <div class=\"dot bg-color\"></div>\n" +
    "            <span >FUNCTION DESCRIPTION </span>\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getSignature()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"(key, test) in n.tests\">\n" +
    "        <div class=\"section section-description\">\n" +
    "            <div class=\"section-title\" ><div class=\"dot bg-color\"></div>test case</div>\n" +
    "            <div class=\"section-content\" >\n" +
    "                {{test.getDescription()}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"section section-description\">\n" +
    "            <div  class=\"section-title\" ><div class=\"dot bg-color\"></div>TEST</div>\n" +
    "            <div class=\"section-content\" >\n" +
    "                <table style=\"width:100%\" class=\"test\">\n" +
    "                    <tr ng-repeat=\"(inputKey,input) in test.getSimpleTest().inputs track by $index\">\n" +
    "                        <td>{{n.funct.getParamNameAt($index)}}</td>\n" +
    "                        <td>\n" +
    "                            <div ace-read-json ng-model=\"input\" ></div>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                    <tr >\n" +
    "                        <td>test output</td>\n" +
    "                        <td>\n" +
    "                            <div ace-read-json ng-model=\"test.getSimpleTest().output\" ></div>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"section section-n\">\n" +
    "            <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "            <div class=\"section-content\" >\n" +
    "                {{test.disputeText}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("newsfeed/news_popover_ReuseSearch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_ReuseSearch.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        Function providing the behavior \n" +
    "        of <strong>{{n.microtask.pseudoFunctionName}}</strong> in <strong>{{n.funct.getName()}}</strong>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>REQUESTED BEHAVIOR\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-description-2\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>requesting function\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.funct.getFunctionCode()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>Function Found\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" ng-if\"n.calleeFunction\">\n" +
    "        <ace-read-js code=\"n.calleeFunction.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" ng-if\" ! n.calleeFunction\">\n" +
    "        A new function will be created\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteCall.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteCall.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        Edit of the function <strong>{{n.funct.getName()}}</strong> for revising the call to\n" +
    "        <strong>{{n.calleeFunction.getName()}}</strong>.\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-description-2\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>FUNCTION DESCRIPTION\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.calleeFunction.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>Edits to Function\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.funct.getFullCode()\" mode=\"diff\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteFunction.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteFunction.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "           The function <strong>{{n.funct.getName()}}</strong> was not implementable.\n" +
    "        </div>\n" +
    "        <div ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.promptType == 'SKETCH'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType == 'RE_EDIT'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong> to address an issue reported by the crowd.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong> based on a change to the signature of a function it calls.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='REMOVE_CALLEE'\">\n" +
    "                Edit to the code of the function <strong>{{n.funct.getName()}}</strong> to replace the call(s) to <strong>{{n.callee.getName()}}</strong> with a new implementation.\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section section-description-2\" ng-if=\"n.microtask.disputeText.length > 0\">\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>Reported Issue\n" +
    "        </div>\n" +
    "        <div class=\"section-content\">\n" +
    "            {{n.microtask.disputeText}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div ng-if=\"n.microtask.promptType == 'REMOVE_CALLEE'\">\n" +
    "        <div class=\"section section-description-2\">\n" +
    "            <div class=\"section-title\" >\n" +
    "                <div class=\"dot bg-color\"></div>Description of Function Call to Remove\n" +
    "            </div>\n" +
    "            <div class=\"section-content no-padding\" >\n" +
    "                <ace-read-js code=\"n.callee.getSignature()\" ></ace-read-js>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div ng-if=\"n.microtask.promptType == 'DESCRIPTION_CHANGE'\">\n" +
    "        <div class=\"section section-description-2\">\n" +
    "            <div class=\"section-title\" >\n" +
    "                <div class=\"dot bg-color\"></div>Changes to Function Signature\n" +
    "            </div>\n" +
    "            <div class=\"section-content no-padding\" >\n" +
    "                <ace-read-js code=\"n.calledDiffCode\" mode=\"diff\"></ace-read-js>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"section section-review\" >\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>submitted function\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getFullCode()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if = \"n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section section-description-2\">\n" +
    "        <div class=\"section-title\" >\n" +
    "            <div class=\"dot bg-color\"></div>reported function\n" +
    "        </div>\n" +
    "        <div class=\"section-content no-padding\" >\n" +
    "            <ace-read-js code=\"n.funct.getFullCode()\"></ace-read-js>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"section section-review\">\n" +
    "        <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "        <div class=\"section-content\" >\n" +
    "            {{n.microtask.submission.disputeFunctionText}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteFunctionDescription.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteFunctionDescription.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        <div ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "            Detailed description for the following requested function.\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "            request that the following function not be implemented.\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        <span ng-if=\"! n.microtask.submission.inDispute\">Requested Function</span>\n" +
    "        <span ng-if=\"n.microtask.submission.inDispute\">Function description</span>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"section-content no-padding\" >\n" +
    "        <ace-read-js code=\"n.microtask.pseudoFunctionDescription\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-description\" ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        <span >Requesting function</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"section-content no-padding\" >\n" +
    "        <ace-read-js code=\"n.requestingFunction.getFunctionCode()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>Detailed Function Description\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.functionDescription\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"section section-review\" ng-if=\"n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reason for request</div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        {{n.microtask.submission.disputeFunctionText}}\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("newsfeed/news_popover_WriteTest.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteTest.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        <div ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.promptType=='WRITE'\">\n" +
    "                Implementation of the following test case for\n" +
    "                the function <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='CORRECT'\">\n" +
    "                Revision of the following test for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>  to address the following issue.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='TESTCASE_CHANGED'\">\n" +
    "                Revision test for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong> based on a change to the description of the test case.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.promptType=='FUNCTION_CHANGED'\">\n" +
    "                Revision of the following test for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>\n" +
    "                based on the new function signature.\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.submission.disputeFunctionText!=''\" >\n" +
    "                Reported issue with the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-if=\"n.microtask.submission.disputeTestText!=''\" >\n" +
    "                Reported issue with the following test case for the function\n" +
    "                <strong>{{n.funct.getName()}}</strong>.\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\">\n" +
    "    <div class=\"section-title\">\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        <span ng-if=\"n.submission.disputeFunctionText!=''\">\n" +
    "            REPORTED FUNCTION DESCRIPTION\n" +
    "        </span>\n" +
    "        <span ng-if=\"n.submission.disputeFunctionText==''\">\n" +
    "            FUNCTION DESCRIPTION\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"section-content no-padding\" >\n" +
    "        <ace-read-js code=\"n.funct.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"section section-description\" ng-if=\"n.microtask.submission.disputeFunctionText==''\">\n" +
    "    <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Test case</div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <span ng-if=\"n.microtask.promptType!='TESTCASE_CHANGED' || n.microtask.submission.inDispute\">\n" +
    "            {{n.microtask.owningArtifact}}\n" +
    "        </span>\n" +
    "\n" +
    "        <span ng-if=\"n.microtask.promptType=='TESTCASE_CHANGED' && ! n.microtask.submission.inDispute\">\n" +
    "            <strong>Old description: </strong><span ng-bind=\"n.microtask.oldTestCase\"></span><br />\n" +
    "            <strong>New description: </strong><span ng-bind=\"n.microtask.owningArtifact\"></span>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"n.microtask.submission.inDispute\" class=\"section section-review\">\n" +
    "    <div class=\"section-title\" ><div class=\"dot bg-color\"></div>Reported Issue</div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        {{n.microtask.submission.disputeTestText}}\n" +
    "        {{n.microtask.submission.disputeFunctionText}}\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"! n.microtask.submission.inDispute\" >\n" +
    "\n" +
    "    <div class=\"section section-review\">\n" +
    "        <div  class=\"section-title\" ><div class=\"dot bg-color\"></div>submitted TEST</div>\n" +
    "        <div class=\"section-content\" >\n" +
    "            <table style=\"width:100%\" class=\"test\">\n" +
    "                <tr ng-repeat=\"(inputKey,input) in n.microtask.submission.simpleTestInputs track by $index\">\n" +
    "                    <td>{{n.funct.getParamNameAt($index)}}</td>\n" +
    "                    <td>\n" +
    "                        <div ace-read-json ng-model=\"input\" ></div>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td>test output</td>\n" +
    "                    <td>\n" +
    "                        <div ace-read-json ng-model=\"n.microtask.submission.simpleTestOutput\" ></div>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </table>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("newsfeed/news_popover_WriteTestCases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("newsfeed/news_popover_WriteTestCases.html",
    "<div class=\"section section-description \" >\n" +
    "    <div class=\"section-content job-description\" >\n" +
    "        <div ng-if=\" ! n.microtask.submission.inDispute\">\n" +
    "            <div ng-if=\"n.microtask.promptType=='WRITE'\">\n" +
    "                Test cases for the function <strong>{{n.funct.getName()}}</strong>\n" +
    "            </div>\n" +
    "            <div ng-if=\"n.microtask.promptType=='CORRECT'\">\n" +
    "               Test cases for the function <strong>{{n.funct.getName()}}</strong>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"n.microtask.submission.inDispute\">\n" +
    "            Reported the function <strong>{{n.funct.getName()}}</strong>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<!-- FUNCTION CODE -->\n" +
    "<div class=\"section section-description\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        FUNCTION DESCRIPTION:\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ace-read-js code=\"n.funct.getSignature()\"></ace-read-js>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"! n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        SUBMITTED TEST CASES:\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        <ul style=\"list-style:none\">\n" +
    "            <li class=\"\" ng-repeat=\"testcase in n.testcases\"><strong>#{{$index+1}}</strong> {{testcase.text}}</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"section section-review\" ng-if=\"n.microtask.submission.inDispute\">\n" +
    "    <div class=\"section-title\" >\n" +
    "        <div class=\"dot bg-color\"></div>\n" +
    "        Reported Issue:\n" +
    "    </div>\n" +
    "    <div class=\"section-content\" >\n" +
    "        {{review.microtask.submission.disputeFunctionText}}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("tutorials/DebugTestFailure.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/DebugTestFailure.html",
    "<step>\n" +
    "	<div class=\"title\">Debug a test failure</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/microtask.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			In Debug a Test Failure, your goal is to find and correct any bug(s) that caused a function to fail <strong>one</strong> of its unit tests.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">	\n" +
    "		<p style=\"width:500px\">\n" +
    "			CrowdCode provides a test runner listing the result of the test to debug ( failing test panel ) \n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/failing.png\" />\n" +
    "\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			and the results of the previous passing function’s tests, if any ( other tests panel ). <br />\n" +
    "			Failing tests are marked with <strong style=\"background-color:#F7B2B2\">red</strong> and passing tests with <strong style=\"background-color:#CFF5BF;\">green</strong>\n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/others.png\" />\n" +
    "\n" +
    "		<p style=\"width: 500px\"> \n" +
    "			<strong>Your goal</strong> is to use the provided tools to make the <strong>failing test</strong> pass without letting the other tests fail!\n" +
    "		</p>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/detail.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			Each test result lists the inputs and outputs for the test, as well as information about errors (if any). \n" +
    "		</p>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			For failed tests, the default view shows you the <strong>diff</strong> between the expected and the actual return value. <br />\n" +
    "		</p>\n" +
    "\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/diff_mode.png\" />\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			Green background is the the expected field value and red background is the actual field value. \n" +
    "			The fields without a background color, have the same value.\n" +
    "		</p>\n" +
    "		\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			You can always switch to the <strong>normal</strong> mode. \n" +
    "		</p>\n" +
    "\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/normal_mode.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/code.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			The function code editor is the main tool of the CrowdCode debugger. \n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If during the execution of the current test, one exception is raised, \n" +
    "			you can see the details hovering the mouse on the <strong>x</strong> icon.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/error.png\" />\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/console.png\" />\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			You can monitor a value during the text execution using \n" +
    "			the <strong>console.log(...)</strong> function. \n" +
    "			When you use console.log(...) and re-run the tests, values are shown passing with the mouse by the <b>i</b> icon.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			What happens if the bug is not in the function itself but is in a function that it calls? \n" +
    "			All the functions called during the current test execution, are highlighted in the code editor window.\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/highlight.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">By clicking on the highlighted functions, you can see the <strong>stubs</strong> popup for that callee. It shows you all the sets of input with whom the function has been called and, for each set of input, you are allowed to edit the return value. </p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/stubs.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "		For example, here a function sum is being called with the parameters 100 and 40 and is returning the output of 142. This does not seem to match its specified behavior. To solve this problem, you can edit the return value, replacing 142 with 140. This creates a stub. <br /> When you re-run the tests, CrowdCode will use the return value specified by the stub rather than the actual return value, executing the function call as if it had returned 140. After submitting the Debug microtask, each stub will be translated into a test for the called function, expressing the desired behavior.</p>\n" +
    "\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:400px\">\n" +
    "			After doing changes to the function code or to the stubs, re-run the tests to see the changes\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/run.png\" />\n" +
    "	\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			It might also be that the function itself is correct and the test data is wrong. \n" +
    "			In this case, you should report an issue with the test.\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/debugtestfailure/reported.png\" />\n" +
    "	\n" +
    "		<p style=\"width:300px\">\n" +
    "			Reported tests are marked with <strong style=\"background-color:#FFB280\">orange</strong>.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:300px\">\n" +
    "			<strong>Remember:</strong> you can submit the microtask only if all the tests are passing (or you disputed the failing tests).\n" +
    "		</p>\n" +
    "		\n" +
    "		<p style=\"width:300px\">\n" +
    "			If you think that the function is far to be complete, sketch some behavior with <strong>pseudocode</strong> or \n" +
    "			<strong>function stubs</strong> and submit it ( In case of pseudocode or function stubs present in the function code, you can submit with failing tests too).\n" +
    "		</p>\n" +
    "	\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/ReuseSearch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/ReuseSearch.html",
    "<step>\n" +
    "	<div class=\"title\">Reuse search</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/reusesearch/microtask.png\" />\n" +
    "		<p style=\"width:500px\">In Reuse Search, your goal is to identify a function best matching the specified function call, or determine that no such function yet exists.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<img src=\"/img/tutorial/reusesearch/searchbox.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			To search for functions, you can type text in the textbox. So, to find a sum function, you might search for <strong>“sum”</strong>. Of course, a function might be described differently, so you might need to try other queries.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<img src=\"/img/tutorial/reusesearch/nofunction.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			After finding a matching function, select the function to choose it. Or if no such functions exists, select <strong>“No function found”</strong>.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/Review.html", []).run(["$templateCache", function($templateCache) {
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
    "			The submitted work is inside the orange-bordered box. <br />\n" +
    "			What rating do you think this work should receive?\n" +
    "\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/review/submission.png\" />\n" +
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

angular.module("tutorials/WriteCall.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteCall.html",
    "<step>\n" +
    "	<div class=\"title\">Add call</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writecall/microtask.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			In Add a Call, your goal is to revise all the occurrences of a specified function call.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			For example, in the following code:\n" +
    "\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/writecall/before.png\" />\n" +
    "	\n" +
    "		<p style=\"width:500px\">\n" +
    "			the task is to replace the call <strong>doSum(...)</strong> with a call to the function <strong>sum(...)</strong>, putting the right parameters in the right places and ensuring the result has the right type and interpretation.  <br />\n" +
    "			So the code becomes: \n" +
    "		</p>\n" +
    "\n" +
    "		<img src=\"/img/tutorial/writecall/after.png\" />\n" +
    "\n" +
    "		<p  style=\"width:500px\">\n" +
    "			You might also decide that the specified call doesn’t make any sense at all and remove it. Or you might decide that a different function is required and write another </strong>function stub</strong>. Your overall goal is to replace the call and logic surrounding it with something better; you can decide how to do that. \n" +
    "\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteFunction.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteFunction.html",
    "<step>\n" +
    "	<div class=\"title\">Edit a function</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/microtask.png\" />\n" +
    "		<p  style=\"width:500px\">\n" +
    "			In Edit a Function, your goal is to improve the implementation of a function.\n" +
    "		</p>\n" +
    "		<p  style=\"width:500px\">\n" +
    "			In CrowdCode, functions may contain code, <strong>pseudocode</strong>, and other <strong>function stubs</strong>. \n" +
    "			In Edit a Function, your goal is not necessarily to finish a complete implementation of a function. Rather, you may decide to <strong>sketch</strong> some of the behavior using psuedocode and describe some operation that’s best done in another function using a <strong>function stub</strong>. \n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/code.png\" />\n" +
    "		<p style=\"width:550px\">\n" +
    "			<strong>Pseudocode</strong> (sections of a line beginning with //#) allows you to sketch algorithms or partial solutions, enabling the crowd to determine how best the algorithm or solution should be accomplished. \n" +
    "\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/code.png\" />\n" +
    "		<p style=\"width:550px\">\n" +
    "			In CrowdCode, you edit code with a local view of the codebase, seeing only the current function on which you are working.  <strong>When you need to call another function</strong>, you have to add a sketch of the called function header with an empty body at the bottom of the code editor window (eventually providing an one-line description of what the function is supposed to do). \n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:300px\">\n" +
    "			<strong>Remember</strong>: Using <strong>pseudocode</strong> and <strong>function stubs</strong> provides an opportunity for the crowd to contribute. Small contributions are encouraged!\n" +
    "			<!--For a function with large and complex behavior, sketching some of the behavior provides opportunities for the crowd to consider how it best be done. Rather than build a single monolithic function, function stubs provides an opportunity for code to be decomposed into cohesive functions that can be reused. And - most importantly - function stubs provides an opportunity for many to work on each requested function in parallel.-->\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			In editing a function code, you are allowed to add at most 10 new <a href=\"http://en.wikipedia.org/wiki/Statement_%28computer_science%29\" target=\"_blank\" >statements</a>.\n" +
    "		</p>	\n" +
    "		<img src=\"/img/tutorial/writefunction/statements.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			The bar on the bottom of the code editor window, represents the remaining number of statements you can add.<br />\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:550px\">\n" +
    "			If you think that the function signature have to be changed (i.e. an additional parameter is required, or the function itself is poorly written) you may edit the header of the function; the crowd will then update any callers of the function to match its new specification.<br />\n" +
    "			<b>Note: </b> \n" +
    "			you are not allowed to change the description of the core API functions (the functions requested by the client).\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunction/data_types.png\" />\n" +
    "		<p style=\"width:280px\">\n" +
    "			In CrowdCode, all parameters are specified with a data type. CrowdCode provides an Available Data Types panel enabling you to browse the description of data types and see examples.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			If you discover that the function is impossible or inadvisable to implement (i.e. a function that need to use global variables), you should report the issue:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writefunction/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteFunctionDescription.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteFunctionDescription.html",
    "<step>\n" +
    "	<div class=\"title\">Write function description</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/microtask.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			In Write Function Description, your goal is to write a detailed description for a function call, including its name, parameters, return value, and description.\n" +
    "\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			For example, for the sum function call, you might specify the function as: \n" +
    "\n" +
    "		</p>\n" +
    "		\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/form.png\" />\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "\n" +
    "\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/datatypes.png\" />\n" +
    "\n" +
    "		<p style=\"width:500px\">\n" +
    "			In CrowdCode, all parameters are specified using a data type. The Data Types panel lets you view descriptions and examples.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			In writing the function description, you may discover that the function is impossible or inadvisable to implement (i.e. a function that need to use global variables). If you feel this to be the case, you should report the issue:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writefunctiondescription/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteTest.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteTest.html",
    "<step>\n" +
    "	<div class=\"title\">Write test</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writetest/microtask.png\" />\n" +
    "		<p>In Write a Test, your goal is to implement a test case.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			Given a description of a test case and function to be tested,\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/context.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			your task is to implement the test case, providing concrete values for the specified scenario.\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/data.png\" />\n" +
    "		<p style=\"width:500px\">\n" +
    "			Each value is specified as either a primitive or a JSON literal describing a data structure value. Pretty easy, right?\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:300px\">\n" +
    "			JSON literals can become long and complex:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/data_advanced.png\" />\n" +
    "		<p style=\"width:300px\">\n" +
    "			But CrowdCode provides examples of each data type. \n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetest/example.png\" />\n" +
    "		<p style=\"width:300px\">You can use <b>Paste Example</b> to insert a default value or browse the Available Data Types panel to copy a specific example. </p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:300px\">If you discover an issue with either the function description or the test case, you should report it. </p>\n" +
    "		<img src=\"/img/tutorial/writetest/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/WriteTestCases.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/WriteTestCases.html",
    "<step>\n" +
    "	<div class=\"title\">Write test cases</div>\n" +
    "	<div class=\"text\">\n" +
    "		<img src=\"/img/tutorial/writetestcases/microtask.png\" />\n" +
    "		<p style=\"width:500px\">In Write Test Cases, your goal is to list a set of test cases for a function.</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			According to Wikipedia, a test case is a <i>“set of conditions under which a tester will determine whether an application, software system or one of its features is working as it was originally established for it to do”</i>. A test case is not a fully formed and specified test. Rather, a test case specifies - in natural language - a scenario in which a function is to be tested.\n" +
    "		</p>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">For example, consider the <b>sum</b> function:</p>\n" +
    "		<img src=\"/img/tutorial/writetestcases/testcases.png\" />\n" +
    "		<p style=\"width:500px\"> What are some scenarios that might be valuable to test?\n" +
    "			<ol>\n" +
    "				<li>a number added to zero should return the number itself</li>\n" +
    "				<li>a number added to its opposite should return zero</li>\n" +
    "			</ol>\n" +
    "		</p>\n" +
    "		<p style=\"width:500px\"><b>Note</b>: these test cases do not specify particular values for which the function should be tested. Rather, the test cases abstractly specifies an important scenario in which the function should be tested. How many test cases a function requires ultimately depends on the complexity of a function itself. A function with straightforward behavior might have very few; a function with complex and multifaceted behavior might require several. </p>\n" +
    "\n" +
    "		<p style=\"width:500px\"><b>Remember</b>: Good test cases are short, self-explained, and non-redundant!\n" +
    "		</p>\n" +
    "		\n" +
    "	</div>\n" +
    "</step>\n" +
    "<step>\n" +
    "	<div class=\"text\">\n" +
    "		<p style=\"width:500px\">\n" +
    "			In writing test cases, you may discover an issue in the description of the function. If you feel this to be the case, you should report the issue:\n" +
    "		</p>\n" +
    "		<img src=\"/img/tutorial/writetestcases/report.png\" />\n" +
    "	</div>\n" +
    "</step>");
}]);

angular.module("tutorials/main.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tutorials/main.html",
    "<step>\n" +
    "	<div class=\"title\">CrowdCode Tutorial</div>\n" +
    "	<div class=\"text\">\n" +
    "		Welcome to the CrowdCode tutorial. Here, we’ll help get you up to speed.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"task\" placement=\"left\" style=\"width:150px;\">\n" +
    "	<div class=\"title\">Microtask</div>\n" +
    "	<div class=\"text\">\n" +
    "		Here’s the workspace. <br />\n" +
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
    "<step highlight=\"submitBtn\" placement=\"top-center\" style=\"width:150px;\" >\n" +
    "	<div class=\"title\">Submit</div>\n" +
    "	<div class=\"text\">\n" +
    "		All done? Submit your work for review.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"skipBtn\" placement=\"top-center\" style=\"width:200px;\" >\n" +
    "	<div class=\"title\">Skip</div>\n" +
    "	<div class=\"text\">\n" +
    "		Not the right microtask for you? Skip it. <br />\n" +
    "		But be careful - skipping makes it more valuable for others and <strong>you can't go back!</strong>\n" +
    "	</div>\n" +
    "</step>\n" +
    "<!--\n" +
    "<step highlight=\"shortcutsBtn\" placement=\"top-center\" style=\"width:100px;\">\n" +
    "	<div class=\"title\">Shortcuts</div>\n" +
    "	<div class=\"text\">\n" +
    "		Wanna be a power coder? Here’s your keyboard shortcuts.\n" +
    "	</div>\n" +
    "</step>-->\n" +
    "\n" +
    "<step highlight=\"chatPanel\" placement=\"left\" style=\"width:150px;\" \n" +
    "	  on-show=\"$emit('toggleChat');\" on-hide=\"$emit('toggleChat');\">\n" +
    "	<div class=\"title\">Chat</div>\n" +
    "	<div class=\"text\">\n" +
    "		Questions? Ask the crowd.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"activityPanel\" placement=\"right-center\" style=\"width:200px;\">\n" +
    "	<div class=\"title\">Your Activity</div>\n" +
    "	<div class=\"text\">\n" +
    "		See what you’ve done, see how the crowd rated it.\n" +
    "	</div>\n" +
    "</step>\n" +
    "\n" +
    "<step highlight=\"leaderboardPanel\" placement=\"right-center\" style=\"width:200px;\">\n" +
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
    "\n" +
    "\n" +
    "<step on-hide=\"showProfileModal(); \" style=\"width:300px\">\n" +
    "	<div class=\"title\">Congratulations! </div>\n" +
    "	<div class=\"text\">\n" +
    "		You completed the Main UI tutorial: \n" +
    "		On the way to be a master!\n" +
    "	</div>\n" +
    "</step>\n" +
    "");
}]);

angular.module("users/user_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("users/user_popover.html",
    "<div class=\"popover user-menu-popover\">\n" +
    "	{{userData.score }} points <br />\n" +
    "	{{ popover }}\n" +
    "	<a href=\"#\" ng-click=\" $emit('showProfileModal'); close() \">change profile picture</a><br />\n" +
    "	<a href=\"#\" ng-click=\"$emit('run-tutorial', 'main', true); close();\">tutorial</a><br />\n" +
    "	<a href=\"{{logoutUrl}}\" ng-click=\"close()\">logout</a>\n" +
    "</div>");
}]);

angular.module("widgets/ace_edit_js.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/ace_edit_js.html",
    "<ng-form name=\"functionForm\">\n" +
    "	<div\n" +
    "		class=\"ace_editor js-editor\"\n" +
    "		ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme: 'twilight'  }\" \n" +
    "		ng-model=\"code\" >\n" +
    "	</div>\n" +
    "	<statements-progress-bar></statements-progress-bar>\n" +
    "	<div style=\" \" class=\"function-errors\">\n" +
    "		<textarea \n" +
    "			class=\"form-control\" \n" +
    "			name=\"code\" \n" +
    "			style=\"display:none\"\n" +
    "			function-validator \n" +
    "			max-new-statements=\"10\"\n" +
    "			function-id=\"{{functionData.getId()}}\"\n" +
    "			ng-model=\"code\">\n" +
    "		</textarea>\n" +
    "		<span class=\"recap\" ng-if=\"functionForm.code.$error.function_errors.length > 0\" > {{ functionForm.code.$error.function_errors.length }} problem(s) found: </span>\n" +
    "		<ul ng-if=\"functionForm.code.$error.function_errors.length > 0\" >\n" +
    "	        <li ng-repeat=\"error in functionForm.code.$error.function_errors track by $id($index)\">\n" +
    "	        	<span ng-bind-html=\"trustHtml(error)\"></span>\n" +
    "	        </li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</ng-form>");
}]);

angular.module("widgets/description_popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/description_popover.html",
    "<div class=\"popover description-popover\">\n" +
    "    <div class=\"arrow\"></div>\n" +
    "    <h3 class=\"popover-title\">Description</h3>\n" +
    "    <div class=\"popover-content\">\n" +
    "    	 <ace-read-js code=\"code\"></ace-read-js> \n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/dropdown_main.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/dropdown_main.html",
    "<ul tabindex=\"-1\" class=\"dropdown-menu\" role=\"menu\">\n" +
    "\n" +
    "  <li role=\"presentation\" class=\"divider\" >\n" +
    "  \n" +
    "  </li>\n" +
    "<li>ciao</li>\n" +
    "  <li role=\"presentation\" class=\"divider\" >\n" +
    "  \n" +
    "  </li>\n" +
    "<li><a  data-animation=\"am-fade-and-scale\" data-placement=\"center\" \n" +
    "							    data-template=\"/html/templates/popups/popup_change_picture.html\" \n" +
    "							    bs-modal=\"modal\" container=\"body\">change profile picture</a></li>\n" +
    "  <li role=\"presentation\" class=\"divider\" >\n" +
    "  \n" +
    "  </li>\n" +
    "<li>ciao</li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("widgets/navbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/navbar.html",
    "<div class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\">\n" +
    "	<div class=\"container-fluid\">\n" +
    "\n" +
    "		<div class=\"navbar-header\">\n" +
    "	      <a class=\"navbar-brand\" href=\"#\">CrowdCode</a>\n" +
    "	    </div>\n" +
    "\n" +
    "		<ul class=\"nav navbar-nav\">\n" +
    "	        <li><a href=\"#\"><strong>project:</strong> {{ projectId }}</a></li>\n" +
    "	        <li><a href=\"#\"><project-stats></project-stats></a></li>\n" +
    "	    </ul>\n" +
    "\n" +
    "	    <ul class=\"nav navbar-nav navbar-right\">\n" +
    "	    	<li>\n" +
    "	        	<a user-menu href=\"#\">\n" +
    "					{{ workerHandle}}\n" +
    "					<img ng-src=\"{{ avatar(workerId).$value }}\" class=\"profile-picture\" />\n" +
    "					<span class=\"caret\"></span>\n" +
    "	        	</a>\n" +
    "	        </li>\n" +
    "	    </ul>\n" +
    "\n" +
    "\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_feedback.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/popup_feedback.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div ng-init=\"sent=false; feedbackText=''\" class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-hide=\"sent\">Send feedback</h4>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "             <h4 class=\"modal-title\" ng-show=\"sent\" style=\"text-align: center\">Thank you for your feedback</h4>\n" +
    "                <ng-form name=\"feedbackForm\" ng-hide=\"sent\">\n" +
    "                    <span ng-class=\"{'has-success': feedbackForm.feedbackText.$valid}\">\n" +
    "                        <textarea type=\"text\"\n" +
    "                        class=\"col-md-8 form-control input-sm\" draggable=\"false\" name=\"feedbackText\"\n" +
    "                        placeholder=\"Give us feedback on CrowdCode! What do you like? What don't you like?\" ng-model=\"feedbackText\" required></textarea>\n" +
    "                    </span>\n" +
    "                </ng-form>\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "                <button type=\"button\" class=\"btn btn-primary\" ng-click=\"$emit('sendFeedback',[feedbackText]) ; sent=!sent\" ng-hide=\"sent\" ng-disabled=\"feedbackForm.$invalid\">Send</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_reminder.html", []).run(["$templateCache", function($templateCache) {
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
    "        <br /> <br />\n" +
    "        <div style=\"text-align: center\">\n" +
    "          This microtask will be auto skipped in: <br />\n" +
    "          <h4>{{skipMicrotaskIn | date:'mm:ss'}}</h4>\n" +
    "        </div>\n" +
    "\n" +
    "        <br /> <br />\n" +
    "\n" +
    "        <div style=\"text-align: center\">\n" +
    "          If you don't know how to do this microtask, click on the \n" +
    "          <span class=\"tutorial-btn glyphicon glyphicon-question-sign color\"></span>\n" +
    "          on the top-right corner for opening the tutorial!\n" +
    "        </div>\n" +
    "				<!--\n" +
    "        <div ng-if=\"title=='WriteTestCases'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteFunction'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteTest'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='ReuseSearch'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteCall'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='DebugTestFailure'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='Review'\">\n" +
    "        ciao ciao\n" +
    "        </div>\n" +
    "        <div ng-if=\"title=='WriteFunctionDescription'\">\n" +
    "        ciao  adesso sono write functionciao\n" +
    "        </div>\n" +
    "          -->\n" +
    "  	  </div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "			</div>	\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/popup_shortcuts.html", []).run(["$templateCache", function($templateCache) {
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

angular.module("widgets/popup_template.html", []).run(["$templateCache", function($templateCache) {
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

angular.module("widgets/popup_user_profile.html", []).run(["$templateCache", function($templateCache) {
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
    "				\n" +
    "				<img ng-src=\"{{ avatar( workerId ).$value }}\" alt=\"{{workerHandle}}\" style=\"width:100px\" class=\"pull-left\" />\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "\n" +
    "				<hr />\n" +
    "\n" +
    "				<h3>Select a profile avatar</h3>\n" +
    "\n" +
    "				<img ng-src=\"{{galleryPath}}avatar{{num}}.png\" alt=\"{{workerHandle}}\" ng-click=\"selectAvatar(num)\" class=\"avatar {{selectedAvatar==num ? 'selected' : '' }} pull-left\" ng-repeat=\"num in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]\"/>\n" +
    "				<span class=\"clearfix\"></span>\n" +
    "\n" +
    "<!--\n" +
    "				<hr />\n" +
    "				<h3>Or upload a picture</h3>\n" +
    "				<input type=\"file\" file-model=\"uploadedAvatar\"/>-->\n" +
    "    			\n" +
    "			</div>\n" +
    "			<div class=\"modal-footer\">\n" +
    "				<button type=\"button\" class=\"btn btn-primary\" ng-click=\"saveAvatar(); $hide()\">Save</button>\n" +
    "				<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide(); \">Close</button>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("widgets/reminder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/reminder.html",
    "<div  ng-init=\"show=false\"  class=\"section-reminder\"  ng-if = \"skipMicrotaskIn\">\n" +
    "	<div ng-show=\"show\" style=\"width: {{(1-(skipMicrotaskIn / microtaskTimeout)) * 100| number :1}}%;\n" +
    "	text-align: right;\"><b class=\"label-reminder\">{{skipMicrotaskIn | date:'mm:ss'}}</b>\n" +
    "	</div>\n" +
    "    <div id=\"remainingTimeBar\" class=\"progress progress-bar-reminder\">\n" +
    "        <div ng-mouseenter=\"show=true\" data-ng-mouseleave=\"show=false\" class=\"pull-right progress-bar\" ng-class=\"{'progress-bar-success':skipMicrotaskIn > microtaskFirstWarning,'progress-bar-warning':skipMicrotaskIn > microtaskFirstWarning / 2 && skipMicrotaskIn < microtaskFirstWarning,'progress-bar-danger':skipMicrotaskIn < microtaskFirstWarning / 2}\" role=\"progressbar\" style=\"width:{{(skipMicrotaskIn / microtaskTimeout) * 100| number :1}}%\">\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    \n" +
    "</div>");
}]);

angular.module("widgets/statements_progress_bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/statements_progress_bar.html",
    "<div ng-init=\"show=false\"  class=\"section-statements\">\n" +
    "	<div ng-show=\"show\" style=\"padding-left: {{ (statements / max) * 100 | number: 0 }}%;\">\n" +
    "		<b class=\"label-reminder\">{{max-statements}} {{ (max-statements) > 2 ? 'statements left' : ''}}</b>\n" +
    "	</div>\n" +
    "    <div class=\"progress progress-bar-reminder\">\n" +
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

angular.module("widgets/stubs_modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/stubs_modal.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\">\n" +
    "  <div class=\"modal-dialog\">\n" +
    "    <div class=\"modal-content\">\n" +
    "      <div class=\"modal-header\">\n" +
    "        \n" +
    "        <h4 class=\"modal-title\">Stubs for the function {{info.name}}</h4>\n" +
    "      </div>\n" +
    "      <div class=\"modal-body\" ng-form=\"stubsForm\" >\n" +
    "\n" +
    "            <ace-read-js code=\"info.signature\"></ace-read-js>\n" +
    "\n" +
    "            <div class=\"heading-1 heading-2\" ng-repeat-start=\"(sKey,stub) in stubs track by $index\">Input set {{$index+1}}</div>\n" +
    "            <table ng-repeat-end ng-form=\"stubForm\" class=\"test\">\n" +
    "                <tr ng-repeat=\"(iKey,iValue) in stub.inputs track by $index\" >\n" +
    "                    <td>{{ info.parameters[$index].name }}<br /><small>{{ info.parameters[$index].type }}</small></td>\n" +
    "                    <td><div ace-read-json ng-model=\"iValue\" ></div></td>\n" +
    "                </tr>\n" +
    "                <tr >\n" +
    "                    <td>return value <br/> <small>{{ info.returnType }}</small> </td>\n" +
    "                    <td >\n" +
    "                        <ace-edit-json \n" +
    "                          ng-model=\"stub.output\" \n" +
    "                          min-lines=\"2\"\n" +
    "                          >\n" +
    "                        </ace-edit-json>\n" +
    "\n" +
    "                        <textarea type=\"text\" \n" +
    "                          ng-model=\"stub.output\"\n" +
    "                          name=\"output\"\n" +
    "                          ng-show=\"false\"\n" +
    "                          required\n" +
    "                          json-data-type=\"{{ info.returnType }}\" />\n" +
    "\n" +
    "                        <div class=\"help-block pull-left\" ng-show=\"stubForm.$dirty\" ng-messages=\"stubForm.output.$error\">\n" +
    "                          <div ng-message=\"required\">Please, fill this field</div>\n" +
    "                          <div ng-message=\"jsonDataType\">\n" +
    "                              <span ng-repeat=\"e in stubForm.output.$error.jsonErrors\" ng-bind=\"e\"></span>\n" +
    "                          </div>\n" +
    "                        </div>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                <tr>\n" +
    "                    <td></td>\n" +
    "                    <td>\n" +
    "                       \n" +
    "                    </td>   \n" +
    "                </tr>\n" +
    "            </table>\n" +
    "\n" +
    "      </div>\n" +
    "      <div class=\"modal-footer\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-disabled=\"stubsForm.$invalid\" ng-click=\"close()\">Save stubs</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("widgets/test_result.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/test_result.html",
    "<div ng-if=\"test.rec.inDispute\">\n" +
    "    <div class=\"heading-1\" >\n" +
    "        WHAT'S WRONG WITH THIS TEST ?\n" +
    "        <a ng-if=\"test.rec.inDispute\" class=\"pull-right\"\n" +
    "            ng-click=\"undoDispute(test)\"> \n" +
    "            Nothing is wrong with this test\n" +
    "        </a>\n" +
    "        <span class=\"clearfix\"></span>\n" +
    "    </div>\n" +
    "    <textarea style=\"resize:vertical\" name=\"disputeDescription\" class=\"form-control\" ng-model=\"test.rec.disputeTestText\" ng-required=\"test.rec.inDispute\" ng-pattern=\"/^[^/\\\\\\'\\&quot;]+$/\"></textarea>\n" +
    "    <ul class=\"help-block\" ng-show=\"microtaskForm.disputeDescription.$dirty && microtaskForm.disputeDescription.$invalid\">\n" +
    "        <li ng-show=\"microtaskForm.disputeDescription.$error.required\">This field is required!</li>\n" +
    "        <li ng-show=\"microtaskForm.disputeDescription.$error.pattern\">The symbols \\ / \" 'are not allowed</li>\n" +
    "    </ul>\n" +
    "    <br>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "    \n" +
    "\n" +
    "<div class=\"heading-1\" >\n" +
    "    Input Parameters\n" +
    "    <a ng-if=\" test.status() == 'failed' \" class=\"pull-right\"\n" +
    "        ng-click=\"doDispute(test)\"> \n" +
    "        Report an issue with the data of this test\n" +
    "        <span class=\"glyphicon glyphicon-exclamation-sign\"></span> \n" +
    "    </a>\n" +
    "    <div class=\"clearfix\"></div>\n" +
    "</div>\n" +
    "<table class=\"test\">\n" +
    "    <tr ng-repeat=\"(key,input) in test.rec.simpleTestInputs track by $index\">\n" +
    "        <td>\n" +
    "            {{ funct.parameters[$index].name }}\n" +
    "            <br />\n" +
    "            <small>{{ funct.parameters[$index].type }}</small>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "            <div ace-read-json ng-model=\"input\" ></div>\n" +
    "        </td>\n" +
    "    </tr>\n" +
    "</table>\n" +
    "\n" +
    "<div ng-if=\"test.errors == undefined \">\n" +
    "    <div ng-if=\"test.output.result\">\n" +
    "        <div class=\"heading-1\" >Output</div>\n" +
    "\n" +
    "        <table class=\"test\" >\n" +
    "            <tr>\n" +
    "                <td><small>{{ funct.returnType }}</small></td>\n" +
    "                <td>\n" +
    "                    <div ng-if=\"test.output.result\" ace-read-json ng-model=\"test.output.actual\" ></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>  \n" +
    "        \n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!test.output.result && diffMode\">\n" +
    "        <div class=\"heading-1\" >\n" +
    "            Output diff \n" +
    "\n" +
    "            <a class=\"pull-right\" ng-if=\"diffMode\" ng-click=\"switchMode()\">switch to normal mode</a>\n" +
    "            <span class=\"clearfix\"></span>\n" +
    "        </div>\n" +
    "        <table class=\"test\" >\n" +
    "            <tr>\n" +
    "                <td></td>\n" +
    "                <td>\n" +
    "                    <span class=\"legend\" style=\"background-color:#eaffea;\"></span>expected\n" +
    "                    <span class=\"legend\" style=\"background-color:#ffecec;\"></span>actual\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "                <td><small>{{ funct.returnType }}</small></td>\n" +
    "                <td>\n" +
    "                    <div ace-read-json-diff old=\"test.output.expected\" new=\"test.output.actual\" mode=\"diff\"></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>  \n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!test.output.result && !diffMode\">\n" +
    "        <div class=\"heading-1\" >\n" +
    "            Output\n" +
    "\n" +
    "            <a class=\"pull-right\" ng-if=\"!diffMode\" ng-click=\"switchMode()\">switch to diff mode</a>\n" +
    "            <span class=\"clearfix\"></span>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <table class=\"test\" >\n" +
    "            <tr>\n" +
    "                <td>\n" +
    "                    expected\n" +
    "                    <br />\n" +
    "                    <small>{{ funct.returnType }}</small>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <div ace-read-json ng-model=\"test.output.expected\" ></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "                <td>actual</td>\n" +
    "                <td>\n" +
    "                    <div ace-read-json ng-model=\"test.output.actual\" ></div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"test.errors != undefined \">\n" +
    "    <div class=\"heading-1\" >Execution errors</div>\n" +
    "    <div ace-read-json ng-model=\"test.output.actual\" ></div>\n" +
    "    <div>{{test.errors}}</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);
