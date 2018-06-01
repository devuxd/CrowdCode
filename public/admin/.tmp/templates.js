angular.module('templates-main', ['chat/chat.html', 'code/code.html', 'dashboard/dashboard.html', 'events/events.html', 'feedback/feedback.html', 'functions/functions.html', 'functions/rowDetailsDirective.html', 'microtasks/microtaskDetail.html', 'microtasks/microtaskEvents.html', 'microtasks/microtasks.html', 'questions/questions.html', 'tests/tests.html', 'users/users.html']);

angular.module("chat/chat.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("chat/chat.html",
    "<ul class=\"list-group\">\n" +
    "	<li class=\"list-group-item\" ng-repeat=\"m in chat\">\n" +
    "		<i>{{m.createdAt | date : 'mediumTime' }}</i>\n" +
    "		<strong>{{m.workerHandle}}</strong> - {{m.text}}\n" +
    "	</li>\n" +
    "</ul>\n" +
    "<input style=\"width:100%\" ng-model=\"newMessage\" />\n" +
    "<button ng-click=\"sendMessage()\" >Send Message</button>");
}]);

angular.module("code/code.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("code/code.html",
    "<h3>Functions code</h3>\n" +
    "<div  \n" +
    "	class=\"ace-editor\" \n" +
    "	ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme:'xcode', useWrapMode : true  }\" \n" +
    "	readonly=\"readonly\" \n" +
    "	ng-model=\"fCode\">\n" +
    "</div>\n" +
    "<h3>Tests code</h3>\n" +
    "<div  \n" +
    "	class=\"ace-editor\" \n" +
    "	ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme:'xcode', useWrapMode : true  }\" \n" +
    "	readonly=\"readonly\" \n" +
    "	ng-model=\"tCode\">\n" +
    "</div>\n" +
    "");
}]);

angular.module("dashboard/dashboard.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("dashboard/dashboard.html",
    "<div class=\"panel panel-default\">\n" +
    "	<div class=\"panel-heading\">\n" +
    "		<h3 class=\"panel-title\">Commands</h3> \n" +
    "	</div>\n" +
    "	<div class=\"panel-body\" >\n" +
    "		\n" +
    "\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"executeCommand('Reset')\">Reset</button>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"toggleSettings('reviews')\"   ng-class=\"{on: settings.reviews}\">Reviews</button>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"toggleSettings('tutorials')\" ng-class=\"{on: settings.tutorials}\">Tutorials</button>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"clearOutput()\">Clear Output</button>\n" +
    "		<button class=\"btn btn-sm\" ng-click=\"setAsDefault()\" ng-class=\"{on: settings.tutorials}\">Set As Default</button>\n" +
    "		<hr />\n" +
    "		<pre ng-bind=\"output\"></pre>\n" +
    "	</div>\n" +
    "	\n" +
    "	\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("events/events.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("events/events.html",
    "<div>\n" +
    "\n" +
    "	<label>Category:&nbsp;</label>\n" +
    "	<button type=\"button\" \n" +
    "			class=\"btn btn-default\" \n" +
    "			ng-model=\"filterData.eventType\" \n" +
    "			data-html=\"1\" \n" +
    "			ng-options=\"cat.value as cat.label for cat in categories\" \n" +
    "			bs-select>\n" +
    "	</button>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "{{filterData.eventType}}\n" +
    "\n" +
    "<table class=\"table table-hover\">\n" +
    "	<thead>\n" +
    "		<th>Time</th>\n" +
    "		<th>Details</th>\n" +
    "	</thead>\n" +
    "	<tbody>\n" +
    "		<tr ng-repeat=\"event in events | filter: filterData \">\n" +
    "			<td><span ng-bind=\"event.timeInMillis | date : 'h:mm:ss a' \"></span></td>\n" +
    "			<td><event-detail data=\"event\"></event-detail></td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("feedback/feedback.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("feedback/feedback.html",
    "<ul class=\"list-group\">\n" +
    "	<li class=\"list-group-item\" 	ng-repeat=\"fb in feedbacks\">\n" +
    "		<strong>{{fb.workerHandle}}</strong> - {{fb.feedback}}\n" +
    "	</li>\n" +
    "</ul>");
}]);

angular.module("functions/functions.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("functions/functions.html",
    "<div class=\"form-group form-inline pull-left\">\n" +
    "  <label for=\"sel1\">Functions :</label>\n" +
    "  <select class=\"form-control\" id=\"sel1\" \n" +
    "  	ng-model=\"vm.selectedFunctionId\"\n" +
    "  	ng-change=\"vm.loadFunctionData()\"\n" +
    "  	ng-options=\"f.id as vm.functionName(f) for f in vm.all | orderBy:readOnly:false \">\n" +
    "  </select>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"form-group pull-right\" ng-if=\"vm.selectedFunctionId != undefined\">\n" +
    "	<button ng-click=\"vm.requestTestRun()\" class=\"btn btn-mini\">Request test run</button>\n" +
    "	<button ng-click=\"vm.toggleDiffView()\" class=\"btn btn-mini\">\n" +
    "		{{ vm.diffView ? 'Normal Mode' : 'Diff Mode' }}\n" +
    "	</button>\n" +
    "</div>\n" +
    "<div class=\"clearfix\"></div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"vm.selectedFunctionId == undefined\">\n" +
    "	select a function\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"vm.selectedFunctionId != undefined\">\n" +
    "\n" +
    "	\n" +
    "	<!--\n" +
    "	<strong>Contributions</strong>\n" +
    "	<ul style=\"list-style:none;\">\n" +
    "		<li ng-repeat=\"(worker,c) in vm.contributors\">\n" +
    "			<img ng-init=\" avatarUrl = vm.getAvatarUrl(worker) \" src=\"{{ ::avatarUrl }}\" style=\"width:25px;\" />\n" +
    "			{{worker}} [ {{c.added}}++, {{c.removed}}-- ]\n" +
    "		</li>\n" +
    "	</ul>\n" +
    "-->\n" +
    "	<div ng-repeat=\"diffHtml in vm.diffHtml track by $index\">\n" +
    "		<span>{{diffHtml.worker}}</span>\n" +
    "		<pre ng-bind-html=\"vm.renderHtml(diffHtml.html)\"></pre>\n" +
    "	</div>\n" +
    "	\n" +
    "\n" +
    "	<div ng-if=\" ! vm.diffView \">\n" +
    "		<div class=\"form-group form-inline\">\n" +
    "		  <label for=\"version\">Version:</label>\n" +
    "		  <select class=\"form-control\" id=\"sel1\"\n" +
    "		    ng-model=\"vm.selectedVersion\" \n" +
    "		  	ng-change=\"vm.loadVersion()\" >\n" +
    "		  	<option value=\"{{v+1}}\" ng-repeat=\"v in vm.getVersions()\" ng-selected=\"v+1 == vm.selectedVersion\">{{v+1}}</option>\n" +
    "		  </select>\n" +
    "		  \n" +
    "		</div>\n" +
    "		<div  \n" +
    "			class=\"ace-editor\" \n" +
    "			ui-ace=\"{ onLoad : vm.aceLoaded, mode: 'javascript', theme:'xcode', useWrapMode : true  }\" \n" +
    "			readonly=\"readonly\" \n" +
    "			ng-model=\"vm.code\">\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-if=\" vm.diffView \">\n" +
    "		<div ng-repeat=\"d in vm.diff track by $index\">\n" +
    "			<span> versions <strong>{{d.from}}-{{d.to}}</strong></span>\n" +
    "			(<span> +{{ d.added }}</span>, <span> -{{ d.removed }}</span>)\n" +
    "			<div  \n" +
    "				class=\"ace-editor\" \n" +
    "				ui-ace=\"{ onLoad : vm.aceLoaded, mode: 'diff', useWrapMode : true  }\" \n" +
    "				readonly=\"readonly\" \n" +
    "				ng-model=\"d.code\">\n" +
    "			</div>\n" +
    "			<hr />\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("functions/rowDetailsDirective.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("functions/rowDetailsDirective.html",
    "");
}]);

angular.module("microtasks/microtaskDetail.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/microtaskDetail.html",
    "<a href=\"#/microtasks?scrollTo={{task.$id}}\" class=\"btn btn-link\">back to the list </a>\n" +
    "<br />\n" +
    "<div class=\"microtask-detail\" >\n" +
    "\n" +
    "			<div >\n" +
    "				<h4 class=\"modal-title\">Microtask #{{task.data.id }} ( {{task.$id}} )</h4>\n" +
    "			</div>\n" +
    "			<hr />\n" +
    "			<div style=\"\">\n" +
    "				<div class=\"panel panel-default\">\n" +
    "				  <div class=\"panel-body\">\n" +
    "				    <strong>Type:</strong>\n" +
    "					<span ng-bind=\"task.data.type\"></span>\n" +
    "					<span ng-if=\"task.data.promptType != undefined\">- {{task.data.promptType}}</span>\n" +
    "					<br />\n" +
    "\n" +
    "					<strong>Artifact:</strong>\n" +
    "					<span>{{ task.data.owningArtifact}}</span>\n" +
    "					<br />\n" +
    "\n" +
    "					<strong>Status:</strong>\n" +
    "					<span ng-if=\" ! task.data.assigned \">spawned</span>\n" +
    "					<span ng-if=\" task.data.assigned && ! task.data.completed \">assigned</span>\n" +
    "					<span ng-if=\" task.data.completed \">completed</span>\n" +
    "				  </div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div ng-if=\" task.data.type == 'Review' \" >\n" +
    "					<a href=\"#/microtasks/{{task.data.microtaskKeyUnderReview}}?scrollTo=top\" class=\"btn btn-link\">go to the reviewed microtask</a>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"panel panel-default\" ng-if=\"task.data.submission != undefined\">\n" +
    "				  <div class=\"panel-heading\">\n" +
    "				    <h3 class=\"panel-title\">Submission</h3>\n" +
    "				  </div>\n" +
    "				  <div class=\"panel-body\">\n" +
    "				    <div class=\"list-group-item\"  ng-if=\"task.data.type == 'WriteTest'\">\n" +
    "\n" +
    "						<div ng-if=\"task.data.promptType == 'FUNCTION_CHANGED'\">\n" +
    "							<span> Diff of the function signature </span>\n" +
    "\n" +
    "							<div class=\"ace-editor\" \n" +
    "								ui-ace=\"{ onLoad : aceLoaded , mode: 'diff', theme:'xcode', showGutter: false }\" \n" +
    "								readonly=\"readonly\" \n" +
    "								ng-model=\"descriptionDiff\"\n" +
    "							></div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div ng-if=\"task.data.promptType == 'TESTCASE_CHANGED'\">\n" +
    "							<span> Diff of the testcase description </span>\n" +
    "\n" +
    "							<div class=\"ace-editor\" \n" +
    "								ui-ace=\"{ onLoad : aceLoaded , mode: 'diff', theme:'xcode', showGutter: false }\" \n" +
    "								readonly=\"readonly\" \n" +
    "								ng-model=\"descriptionDiff\"\n" +
    "							></div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div ng-if=\"task.data.promptType == 'WRITE' || task.data.promptType == 'CORRECT' \">\n" +
    "							<pre>{{function.description}}</pre>\n" +
    "						</div>\n" +
    "\n" +
    "\n" +
    "						<table ng-if=\"! task.data.submission.inDispute \" class=\"table\">\n" +
    "							<tr ng-repeat=\"name in function.paramNames track by $index\" >\n" +
    "								<th style=\"width:20%\">{{name}} ({{function.paramTypes[$index]}})</th>\n" +
    "								<td>\n" +
    "									<div class=\"ace-editor\" \n" +
    "										ui-ace=\"{ onLoad : aceLoaded , mode: 'json', theme:'xcode', showGutter: false }\" \n" +
    "										readonly=\"readonly\" \n" +
    "										ng-model=\"task.data.submission.simpleTestInputs[$index]\"\n" +
    "									></div>\n" +
    "								</td>\n" +
    "							</tr>\n" +
    "\n" +
    "							<tr>\n" +
    "								<th >Output  (<span ng-bind=\"function.returnType\"></span>) </th>\n" +
    "								<td>\n" +
    "									<div class=\"ace-editor\" \n" +
    "										ui-ace=\"{ onLoad : aceLoaded , mode: 'json', theme:'xcode', showGutter: false }\" \n" +
    "										readonly=\"readonly\" \n" +
    "										ng-model=\"task.data.submission.simpleTestOutput\"\n" +
    "									></div>\n" +
    "								</td>\n" +
    "							</tr>\n" +
    "						</table>\n" +
    "\n" +
    "						<div ng-if=\"task.data.submission.inDispute && task.data.submission.disputeTestText.length > 0\" >\n" +
    "							test case disputed \n" +
    "							<pre ng-bind=\"task.data.submission.disputeTestText\"></pre>\n" +
    "						</div>\n" +
    "\n" +
    "						<div ng-if=\"task.data.submission.inDispute && task.data.submission.disputeFunctionText.length > 0 \" >\n" +
    "							Function signature disputed \n" +
    "							<pre ng-bind=\"task.data.submission.disputeFunctionText\"></pre>\n" +
    "						</div>\n" +
    "\n" +
    "\n" +
    "					</div>\n" +
    "				  </div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"panel panel-default\" ng-if=\"task.data.review != undefined\">\n" +
    "				  <div class=\"panel-heading\">\n" +
    "				    <h3 class=\"panel-title\">Review</h3>\n" +
    "				  </div>\n" +
    "				  <div class=\"panel-body\">\n" +
    "				    <strong>Review Score:</strong>\n" +
    "					<span>{{task.data.review.qualityScore}}</span>\n" +
    "					<br />\n" +
    "\n" +
    "\n" +
    "					<strong>Review Text:</strong>\n" +
    "					<span ng-if=\"task.data.review.reviewText.length > 0\">{{task.data.review.reviewText}}</span>\n" +
    "					<span ng-if=\"task.data.review.reviewText.length == 0\">none</span>\n" +
    "				  </div>\n" +
    "				</div>\n" +
    "\n" +
    "				<microtask-events events=\"task.events\"></microtask-events>\n" +
    "\n" +
    "				<ul class=\"list-group\" ng-init=\"submission = task.data.submission\">\n" +
    "					\n" +
    "\n" +
    "					<li class=\"list-group-item\" ng-if=\"data.type == 'DebugTestFailure'\">\n" +
    "						<div ng-if=\"submission.disputeText.length == 0\" class=\"ace-editor\" ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme:'xcode', useWrapMode : true  }\" readonly=\"readonly\" ng-model=\"submission.code\"></div>\n" +
    "\n" +
    "\n" +
    "						<div ng-if=\"submission.disputeText.length > 0\" >\n" +
    "							test disputed \n" +
    "							<pre ng-bind=\"submission.disputeText\"></pre>\n" +
    "						</div>\n" +
    "					</li>\n" +
    "\n" +
    "					<li class=\"list-group-item\" ng-if=\"data.type == 'ReuseSearch'\">\n" +
    "						search a function that can substitute the pseudocall \n" +
    "						<pre ng-bind=\"data.callDescription\"></pre>\n" +
    "						requested in the function \n" +
    "						<strong ng-bind=\"data.owningArtifact\"></strong>\n" +
    "						and he choose <br />\n" +
    "						<pre ng-if=\"submission.noFunction\">no function does this</pre>\n" +
    "						<pre ng-if=\"!submission.noFunction\" >{{submission.functionName}}</pre>\n" +
    "\n" +
    "					</li>\n" +
    "\n" +
    "					<li class=\"list-group-item\" ng-if=\"data.type == 'WriteCall'\">\n" +
    "						substitute the pseudocall \n" +
    "						<pre >//!{{data.pseudoCall}}</pre>\n" +
    "						<div class=\"ace-editor\" ui-ace=\"{ onLoad : aceLoaded, mode: 'javascript', theme:'xcode', useWrapMode : true  }\" readonly=\"readonly\" ng-model=\"submission.code\"></div>\n" +
    "					</li>\n" +
    "\n" +
    "					<li class=\"list-group-item\"  ng-if=\"data.type == 'WriteFunctionDescription'\">\n" +
    "						<span> call to substitute:  <strong ng-class=\"pull-right\" ng-bind=\"data.callDescription\"></strong></span>\n" +
    "						<table class=\"table\">\n" +
    "							<tr>\n" +
    "								<th>description</th>\n" +
    "								<td>{{submission.description}}</td>\n" +
    "							</tr>\n" +
    "							<tr>\n" +
    "								<th>header</th>\n" +
    "								<td>{{submission.header}}</td>\n" +
    "							</tr>\n" +
    "							<tr>\n" +
    "								<th colspan=\"2\">params</th>\n" +
    "							</tr>\n" +
    "							<tr ng-repeat=\"(index,name) in submission.paramNames\">\n" +
    "								<th>\n" +
    "									{{name}} \n" +
    "								</th>\n" +
    "								<td>\n" +
    "									{{submission.paramTypes[index]}}<br />\n" +
    "									{{submission.paramDescriptions[index]}}\n" +
    "								</td>\n" +
    "							</tr>\n" +
    "							<tr>\n" +
    "								<th>\n" +
    "									return type\n" +
    "								</th>\n" +
    "								<td>\n" +
    "									{{submission.returnType}} \n" +
    "								</td>\n" +
    "							</tr>\n" +
    "						</table>\n" +
    "\n" +
    "					</li>\n" +
    "\n" +
    "					<li class=\"list-group-item\" ng-if=\"data.type == 'WriteTestCases' && data.disputeDescription.length > 0\">\n" +
    "						Disputed test case \n" +
    "						<strong class=\"pull-right\" ng-bind=\"data.disputedTestCase\"></strong>\n" +
    "						<span class=\"clearfix\"></span>\n" +
    "					</li>\n" +
    "					<li class=\"list-group-item\" ng-if=\"data.type == 'WriteTestCases' && data.disputeDescription.length > 0\">\n" +
    "						Dispute description\n" +
    "						<strong class=\"pull-right\" ng-bind=\"data.disputeDescription\"></strong>\n" +
    "						<span class=\"clearfix\"></span>\n" +
    "					</li>\n" +
    "					<li class=\"list-group-item\"  ng-if=\"data.type == 'WriteTestCases'\">\n" +
    "\n" +
    "						<ul  if=\"submission.isFunctionDispute\">\n" +
    "							<li ng-repeat=\"testcase in submission.testCases\" class=\"testcase.added ? 'added' : testcase.removed? 'removed' : ''\" ng-bind=\"testcase.text\"></li>\n" +
    "						</ul>\n" +
    "						<div if=\"!submission.isFunctionDispute\" >\n" +
    "							Function signature disputed \n" +
    "							<pre ng-bind=\"submission.disputeText\"></pre>\n" +
    "						</div>\n" +
    "					</li>\n" +
    "\n" +
    "					<li class=\"list-group-item\"  ng-if=\"data.type == 'WriteTest'\">\n" +
    "\n" +
    "						<div ng-if=\"data.promptType == 'FUNCTION_CHANGED'\">\n" +
    "							<span> Diff of the function signature </span>\n" +
    "\n" +
    "							<div class=\"ace-editor\" \n" +
    "								ui-ace=\"{ onLoad : aceLoaded , mode: 'diff', theme:'xcode', showGutter: false }\" \n" +
    "								readonly=\"readonly\" \n" +
    "								ng-model=\"descriptionDiff\"\n" +
    "							></div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div ng-if=\"data.promptType == 'TESTCASE_CHANGED'\">\n" +
    "							<span> Diff of the testcase description </span>\n" +
    "\n" +
    "							<div class=\"ace-editor\" \n" +
    "								ui-ace=\"{ onLoad : aceLoaded , mode: 'diff', theme:'xcode', showGutter: false }\" \n" +
    "								readonly=\"readonly\" \n" +
    "								ng-model=\"descriptionDiff\"\n" +
    "							></div>\n" +
    "						</div>\n" +
    "\n" +
    "						<div ng-if=\" data.promptType == 'WRITE' || data.promptType == 'CORRECT' \">\n" +
    "							<pre>{{function.description}}</pre>\n" +
    "						</div>\n" +
    "\n" +
    "\n" +
    "						<table ng-if=\" submission.disputeText.length == 0 \" class=\"table\">\n" +
    "							<tr >\n" +
    "								<th colspan=\"2\">Inputs</th>\n" +
    "							</tr>\n" +
    "							<tr ng-repeat=\"name in function.paramNames track by $index\" >\n" +
    "								<th style=\"width:20%\">{{name}} ({{function.paramTypes[$index]}})</th>\n" +
    "								<td>\n" +
    "									<div class=\"ace-editor\" \n" +
    "										ui-ace=\"{ onLoad : aceLoaded , mode: 'json', theme:'xcode', showGutter: false }\" \n" +
    "										readonly=\"readonly\" \n" +
    "										ng-model=\"submission.simpleTestInputs[$index]\"\n" +
    "									></div>\n" +
    "								</td>\n" +
    "							</tr>\n" +
    "\n" +
    "							<tr>\n" +
    "								<th >Output  (<span ng-bind=\"function.returnType\"></span>) </th>\n" +
    "								<td>\n" +
    "									<div class=\"ace-editor\" \n" +
    "										ui-ace=\"{ onLoad : aceLoaded , mode: 'json', theme:'xcode', showGutter: false }\" \n" +
    "										readonly=\"readonly\" \n" +
    "										ng-model=\"submission.simpleTestOutput\"\n" +
    "									></div>\n" +
    "								</td>\n" +
    "							</tr>\n" +
    "						</table>\n" +
    "\n" +
    "						<div ng-if=\"submission.inDispute\" >\n" +
    "							test case disputed \n" +
    "							<pre ng-bind=\"submission.disputeText\"></pre>\n" +
    "						</div>\n" +
    "\n" +
    "						<div ng-if=\"submission.isFunctionDispute\" >\n" +
    "							Function signature disputed \n" +
    "							<pre ng-bind=\"submission.disputeText\"></pre>\n" +
    "						</div>\n" +
    "\n" +
    "\n" +
    "					</li>\n" +
    "\n" +
    "					</ng-if>\n" +
    "\n" +
    "					<li class=\"list-group-item\" ng-if=\"data.review != undefined\" ng-init=\"review = data.review\">\n" +
    "						This work has been \n" +
    "						<strong ng-if=\"review.qualityScore<3\">rejected</strong>\n" +
    "						<strong ng-if=\"review.qualityScore==3\">reissued</strong>\n" +
    "						<strong ng-if=\"review.qualityScore>3\">approved</strong>\n" +
    "						with \n" +
    "						<span>{{review.qualityScore}} stars</span>\n" +
    "						<span ng-if=\"review.reviewText.length == 0\">\n" +
    "							and <strong>no comments</strong>\n" +
    "						</span>\n" +
    "						<span ng-if=\"review.reviewText.length > 0\">\n" +
    "							<br />\n" +
    "							<pre ng-bind=\"review.reviewText\"></pre>\n" +
    "						</span>\n" +
    "					</li>\n" +
    "				</ul>\n" +
    "				\n" +
    "			</div>\n" +
    "			<pre ng-bind-html=\"json\"></pre>\n" +
    "\n" +
    "			<div ng-if=\" task.data.type == 'WriteFunction' \" ng-init=\" code =  task.data.submission.header+task.data.submission.code\">\n" +
    "				<div  \n" +
    "					class=\"ace-editor\" \n" +
    "					ui-ace=\"{ onLoad : vm.aceLoaded, mode: 'javascript', theme:'xcode', useWrapMode : true  }\" \n" +
    "					readonly=\"readonly\" \n" +
    "					ng-model=\"code\">\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("microtasks/microtaskEvents.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/microtaskEvents.html",
    "<div class=\"panel panel-default\">\n" +
    "	<div class=\"panel-heading\">\n" +
    "		<h3 class=\"panel-title\">Events</h3>\n" +
    "	</div>\n" +
    "  \n" +
    "	<table class=\"table\">\n" +
    "		<tr>\n" +
    "			<th>Type</th>\n" +
    "			<th>Timestamp</th>\n" +
    "		</tr>\n" +
    "		<tr ng-repeat=\"(key, e) in events\">\n" +
    "			<td><strong ng-bind=\"e.eventType\"></strong></td>\n" +
    "			<td><span ng-bind=\"e.timestamp\"></span></td>\n" +
    "		</tr>\n" +
    "	</table>\n" +
    "</div>");
}]);

angular.module("microtasks/microtasks.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/microtasks.html",
    "<div class=\"form-group\">\n" +
    "	<label for=\"filter\" >Filter: </label>\n" +
    "	<input ng-model=\"filterText\" class=\"form-control\" name=\"filter\">\n" +
    "</div>\n" +
    "<table class=\"table table-hover\" >\n" +
    "	<thead>\n" +
    "		<th ng-click=\"changeSorting('data.id')\">\n" +
    "			Id\n" +
    "			<span ng-if=\"sort.column == 'data.id' && !sort.descending \" class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "			<span ng-if=\"sort.column == 'data.id' && sort.descending \" class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "		</th>		\n" +
    "		<th ng-click=\"changeSorting('spawnedAt')\">\n" +
    "			SpawnedAt \n" +
    "			<span ng-if=\"sort.column == 'spawnedAt' && !sort.descending \" class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "			<span ng-if=\"sort.column == 'spawnedAt' && sort.descending \" class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "		</th>\n" +
    "		<th ng-click=\"changeSorting('data.type')\">\n" +
    "			Type\n" +
    "			<span ng-if=\"sort.column == 'data.type' && !sort.descending \" class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "			<span ng-if=\"sort.column == 'data.type' && sort.descending \" class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "		</th>\n" +
    "		<th ng-click=\"changeSorting('data.owningArtifact')\">\n" +
    "			Artifact\n" +
    "			<span ng-if=\"sort.column == 'data.owningArtifact' && !sort.descending \" class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "			<span ng-if=\"sort.column == 'data.owningArtifact' && sort.descending \" class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "		</th>\n" +
    "		\n" +
    "		<th ng-click=\"changeSorting('status')\">\n" +
    "			Status\n" +
    "			<span ng-if=\"sort.column == 'status' && !sort.descending \" class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "			<span ng-if=\"sort.column == 'status' && sort.descending \" class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "		</th>\n" +
    "	</thead>\n" +
    "	\n" +
    "	<tbody>\n" +
    "		<tr ng-repeat=\"(key,mtask) in filter ? filterMicrotasks : microtasks | orderBy:sort.column:sort.descending\" ui-sref=\" microtasksDetail({ microtaskKey: mtask.$id }) \">\n" +
    "\n" +
    "			<td>\n" +
    "				<a id=\"{{mtask.$id}}\"></a>\n" +
    "				<span ng-bind=\"mtask.$id\"></span>\n" +
    "			</td>\n" +
    "			<td><span ng-bind=\"mtask.spawnedAt | date : 'medium' \"></span></td>\n" +
    "			<td><span ng-bind=\"mtask.data.type\"></span></td>\n" +
    "			<td><span ng-bind=\"mtask.data.owningArtifact\"></span></td>\n" +
    "			<td><span ng-bind=\"mtask.status\"></span></td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("questions/questions.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("questions/questions.html",
    "<table class=\"table\">\n" +
    "	<tr ng-repeat-start=\"q in questions | orderBy : 'createdAt' : false\">\n" +
    "		<td>\n" +
    "			<h4>{{q.title}}</h4><br />\n" +
    "			<pre>{{q.text}} </pre><br />\n" +
    "			<div><span ng-repeat=\"tag in q.tags\" class=\"badge\">{{tag}}</span></div>\n" +
    "		</td>\n" +
    "		<td>\n" +
    "			<small>{{q.ownerHandle}} at {{q.createdAt | date:'medium' }}</small>\n" +
    "		</td>\n" +
    "		<td><strong>({{q.score}})</strong></td>\n" +
    "	</tr>\n" +
    "	<tr colspan=\"3\" ng-repeat-end> \n" +
    "		<table class=\"table\" ng-if=\"( q.answers | keylength ) > 0\">\n" +
    "			<tr ng-repeat-start=\"a in q.answers | orderObjectBy : 'createdAt' : false\">\n" +
    "				<td>{{a.text}} </td> \n" +
    "				<td>\n" +
    "					<small>{{a.ownerHandle}} at {{a.createdAt | date:'medium' }}</small>\n" +
    "				</td> \n" +
    "				<td>\n" +
    "					<strong>({{a.score}})</strong>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "			<tr ng-repeat-end>\n" +
    "				<td colspan=\"3\">\n" +
    "    				<div class=\"panel-heading\">Comments ({{ a.comments | keylength }})</div>\n" +
    "  \n" +
    "					<ul class=\"list-group\">\n" +
    "						<li class=\"list-group-item\" ng-repeat=\"c in a.comments | orderObjectBy : 'createdAt' : false\">\n" +
    "							<pre>{{c.text}}</pre> - \n" +
    "							<div>\n" +
    "								<small>{{c.ownerHandle}} at {{c.createdAt | date:'medium' }}</small>\n" +
    "								<strong>({{c.score}})</strong>\n" +
    "							</div>\n" +
    "						</li>\n" +
    "					</ul>\n" +
    "				</td>\n" +
    "			</tr>\n" +
    "		</table>\n" +
    "	</tr>\n" +
    "</ul>");
}]);

angular.module("tests/tests.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("tests/tests.html",
    "<div ng-repeat=\"(functionName,tests) in vm.tests\">\n" +
    "    <h4>{{functionName}}</h4>\n" +
    "    <ul>\n" +
    "        <li ng-repeat=\"t in tests\">\n" +
    "        	{{t.description}}\n" +
    "        	- {{ t.isImplemented ? ( t.isDeleted ? 'deleted' : 'implemented' ) : 'not implemented' }}\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("users/users.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("users/users.html",
    "<table class=\"table table-hover\">\n" +
    "	<tbody>\n" +
    "		<tr ng-repeat=\"(key,u) in users \" row-details data=\"f\">\n" +
    "			<td>\n" +
    "				<img style=\"width:50px\" src=\"{{u.avatarUrl}}\" />\n" +
    "				<span ng-bind=\"u.workerHandle\"></span>\n" +
    "				<strong ng-bind=\"u.score\"></strong>\n" +
    "			</td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);
