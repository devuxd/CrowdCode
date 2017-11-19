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
    "	<div ng-if=\"reviewed !== undefined\" ng-include=\"'/client/microtasks/challenge_review/review_' + reviewed.type + '.html'\"></div>\n" +
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

angular.module("microtasks/challenge_review/review_ReuseSearch.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_ReuseSearch.html",
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

angular.module("microtasks/challenge_review/review_WriteCall.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteCall.html",
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

angular.module("microtasks/challenge_review/review_WriteFunction.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteFunction.html",
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

angular.module("microtasks/challenge_review/review_WriteFunctionDescription.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteFunctionDescription.html",
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

angular.module("microtasks/challenge_review/review_WriteTest.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("microtasks/challenge_review/review_WriteTest.html",
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
    "	<div ng-include=\"'/client/microtasks/microtask_title.html'\"></div>\n" +
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
    "<div ui-layout=\"{ flow: 'row', dividerSize: 1 }\">\n" +
    "    <div class=\"sidebar-panel\" ui-layout-container min-size=\"40px\" size=\"100%\">\n" +
    "        <div class=\"title\">Project Outline</div>\n" +
    "        <div class=\"content\">\n" +
    "            <project-outline ng-click=\"trackInteraction('Click Right Bar', 'Project Outline', $event)\"></project-outline>\n" +
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
    "							<span class=\"glyphicon glyphicon-question-sign\" data-template=\"/client/widgets/test_editor_help.html\" data-auto-close=\"1\" data-placement=\"left\" data-title=\"title of th ehelp\" bs-popover>\n" +
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
    "	  	<label class=\"btn btn-sm pull-right\" ng-if=\"!breakMode && !noMicrotask\" id=\"breakBtn\">\n" +
    "  	    	<input type=\"checkbox\" ng-model=\"taskData.startBreak\" tabindex=\"103\" >\n" +
    "  	    	<span>{{currentPrompt()}}</span>\n" +
    "  	   	</label>\n" +
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
    "	<div ng-include src=\"'/client/microtasks/review/review_' + review.template + '.html'\" ></div>\n" +
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

angular.module("microtasks/review/review_WriteTest.html", []).run(["$templateCache", function ($templateCache) {
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
    "	<div class=\"section\" ui-layout-container size=\"25%\" ng-include=\"'/client/microtasks/review/review_form.html'\"></div>\n" +
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
    "	<div class=\"section\" ui-layout-container size=\"25%\" ng-include=\"'/client/microtasks/review/review_form.html'\"></div>\n" +
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
    "		<div ng-include=\"'/client/microtasks/review/review_form.html'\" include-replace></div>\n" +
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
    "		<div ng-include=\"'/client/microtasks/review/review_form.html'\" include-replace></div>\n" +
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
    "        <div ng-include=\"'/client/newsfeed/news_detail_' + data.templateUrl + '.html'\">\n" +
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
