"use strict";function mergeDiff(a){var b,c,d="",e=!1;return b=c=0,angular.forEach(a,function(a){var f=a.added?"+":a.removed?"-":"";""!=f&&(e=!0);var g=a.value.split("\n");g.forEach(function(e){a.added&&b++,a.removed&&c++,d+=f+e+"\n"})}),{diffed:e,added:b,removed:c,code:d}}angular.module("crowdAdminApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","mgcrea.ngStrap","firebase","nvd3","ui.ace","mgcrea.ngStrap"]).config(["$routeProvider",function(a){a.when("/dashboard",{templateUrl:"/admin/dashboard/dashboard.html",controller:"DashboardCtrl"}).when("/microtasks",{templateUrl:"/admin/microtasks/microtasks.html",controller:"MicrotasksCtrl"}).when("/microtasks/:microtaskKey",{templateUrl:"/admin/microtasks/microtaskDetail.html",controller:"MicrotaskDetailCtrl",reloadOnSearch:!1}).when("/feedback",{templateUrl:"/admin/feedback/feedback.html",controller:"FeedbackCtrl"}).when("/chat",{templateUrl:"/admin/chat/chat.html",controller:"ChatCtrl"}).when("/code",{templateUrl:"/admin/code/code.html",controller:"CodeCtrl"}).when("/functions",{templateUrl:"/admin/functions/functions.html",controller:"FunctionsCtrl",controllerAs:"vm"}).when("/tests",{templateUrl:"/admin/tests/tests.html",controller:"TestsCtrl",controllerAs:"vm"}).when("/users",{templateUrl:"/admin/users/users.html",controller:"UsersCtrl"}).otherwise({redirectTo:"/dashboard"})}]).run(["$rootScope","$location","$anchorScroll","$routeParams","$templateCache","Microtasks","events",function(a,b,c,d,e){a.$on("$viewContentLoaded",function(){e.removeAll()}),a.go=function(a){console.log("change location to "+a),b.url(a)},a.$on("$routeChangeSuccess",function(){void 0!==d.scrollTo&&(b.hash(d.scrollTo),b.search("scrollTo",null),c())}),console.log("APP: Initializing App"),console.log("APP: Quering the events for the first batch..."),a.time=(new Date).getTime()}]).constant("firebaseUrl","https://crowdcode.firebaseio.com/projects/"+projectId),angular.module("crowdAdminApp").controller("DashboardCtrl",["$scope","$http","$firebase","Microtasks","Functions","firebaseUrl",function(a,b,c,d,e,f){a.pieConfig={visible:!0,extended:!1,disabled:!1,autorefresh:!0,refreshDataOnly:!1},a.numCompletedPie={chart:{type:"pieChart",height:300,x:function(a){return a.label},y:function(a){return a.value},showLabels:!0,labelType:"percent",showLegend:!1,transitionDuration:500,valueFormat:function(a){return parseInt(a)}},title:{enable:!0,text:"Finished by type"}},a.totalTimePie={chart:{type:"pieChart",height:300,x:function(a){return a.label},y:function(a){return a.value},showLabels:!0,labelType:"percent",showLegend:!1,transitionDuration:500,valueFormat:function(a){return $filter("amountOfTime")(a)}},title:{enable:!0,text:"Total worktime by type"}},a.totalTimeData=[],a.numCompletedData=[],a.microtasks=d,a.loading=!0,a.$watch("microtasks.getStatsReady() ",function(){a.microtasks.getStatsReady()&&(a.stats=a.microtasks.getStats(),a.numCompletedData=function(){var b=[];return angular.forEach(a.stats.finishByType,function(a,c){b.push({label:c,value:a.numFinished})}),b},a.totalTimeData=function(){var b=[];return angular.forEach(a.stats.finishByType,function(a,c){b.push({label:c,value:a.totalTime})}),b},a.loading=!1)}),a.output="",a.clearOutput=function(){a.output=""},a.executeCommand=function(c){"Reset"!=c||window.confirm("Are you sure? Reset will clear all the project data!")?b.post("/"+projectId+"/admin/"+c).success(function(b){a.output+=b.message}).error(function(){console.log("UNABLE TO EXECUTE COMMAND "+c)}):console.log("Aborting reset")},a.setAsDefault=function(){var a=new Firebase("https://crowdcode.firebaseio.com/defaultProject");a.set(projectId),console.log("set as default project: "+projectId)},a.settings={};var g=new Firebase(f+"/status/settings");g.on("value",function(b){var c=b.val();angular.forEach(c,function(b,c){a.settings[c]=b})}),a.toggleSettings=function(b){a.executeCommand(a.settings[b]?b+"OFF":b+"ON")}}]),angular.module("crowdAdminApp").factory("Microtask",["$firebaseUtils",function(a){function b(a){this.$id=a.key(),this.update(a.val()),this.events=[],this.setStatus("none")}return b.prototype={update:function(a){var b=angular.extend({},this.data);return this.data=a,!angular.equals(this.data,b)},getStatus:function(){return this.data.assigned?this.data.assigned&&!this.data.completed?"assigned":this.data.completed?"completed":void 0:"spawned"},setStatus:function(a){this.status=a},addEvent:function(a){this.events.push(a)},updateStats2:function(a){a.hasOwnProperty("numFinished")||(a.numFinished=0,a.avgFinishTime=0,a.totalTime=0,a.finishByType={}),["completed","accepted","rejected","reissued"].indexOf(this.status)||a.numFinished++},updateStats:function(a){a.hasOwnProperty("numFinished")||(a.numFinished=0,a.avgFinishTime=0,a.totalTime=0,a.finishByType={}),a.hasOwnProperty(this.status)?a[this.status]++:a[this.status]=1;this.events[this.events.length-1];-1==["completed","in_review"].indexOf(this.status)||isNaN(this.completedIn)||(a.avgFinishTime=(a.avgFinishTime*a.numFinished+this.completedIn)/(a.numFinished+1),a.numFinished++,a.totalTime+=this.completedIn,a.finishByType.hasOwnProperty(this.data.type)?(a.finishByType[this.data.type].avgFinishTime=(a.finishByType[this.data.type].avgFinishTime*a.finishByType[this.data.type].numFinished+this.completedIn)/(a.finishByType[this.data.type].numFinished+1),a.finishByType[this.data.type].numFinished++,a.finishByType[this.data.type].totalTime+=this.completedIn):a.finishByType[this.data.type]={numFinished:1,avgFinishTime:this.completedIn,totalTime:this.completedIn})},handleEvent:function(a,b){if(a.microtaskID==this.data.id){switch(a.eventType){case"microtask.spawned":this.spawnedAt=a.timeInMillis,this.setStatus("spawned");break;case"microtask.assigned":this.assignedAt=a.timeInMillis,this.setStatus("assigned");break;case"microtask.skipped":this.setStatus("skipped"),this.assignedAt="";break;case"microtask.submitted":this.completedAt=a.timeInMillis,this.completedIn=this.completedAt-this.assignedAt,this.setStatus(-1!=["Review","DebugTestFailure","ReuseSearch"].indexOf(this.data.type)?"completed":"in_review");break;case"microtask.accepted":this.setStatus("accepted");break;case"microtask.rejected":this.setStatus("rejected");break;case"microtask.reissued":this.setStatus("reissued")}this.updateStats(b),this.addEvent(a)}},toJSON:function(){return a.toJSON(this.data)}},b}]).factory("MicrotaskFactory",["$FirebaseArray","$filter","Microtask",function(a,b,c){var d=!1;return a.$extendFactory({stats:{},statsReady:!1,handleEvents:function(a){var b=this;void 0==b&&(b.stats={}),d=!1,angular.forEach(a,function(a,c){if(void 0!=a.microtaskID&&void 0!=a.artifactID){var c=a.artifactID+"-"+a.microtaskID,d=b.$getRecord(c);null!=d&&d.handleEvent(a,b.stats)}}),b.statsReady=!0},getStats:function(){return this.stats},getStatsReady:function(){return this.statsReady},$$added:function(a){return new c(a)},$$updated:function(a){var b=this.$list.$getRecord(a.key());return b.update(a.val())}})}]).service("Microtasks",["$firebase","$filter","MicrotaskFactory","events","firebaseUrl",function(a,b,c,d,e){var f=null;if(null==f)var g=new Firebase(e+"/microtasks"),h=a(g,{arrayFactory:c}),f=h.$asArray();else console.log("mtasks already loaded");return f}]),angular.module("crowdAdminApp").service("events",["$firebase","$filter","$q","firebaseUrl",function(a,b,c,d){console.log(d+"/history/events");var e=new Firebase(d+"/history/events"),f=[],g={init:function(){{var a=c.defer();(new Date).getTime()}return e.once("value",function(b){b.forEach(function(a){var b=a.val();for(var c in f)f.hasOwnProperty(c)&&f[c].call(null,b)}),a.resolve(b.exportVal())}),a.promise},get:function(){var a=c.defer(),b=e.limitToFirst(2e3);return b.on("value",function(b){return a.resolve(b.exportVal())}),a.promise},addListener:function(a,b){f[b]=a},removeListener:function(a){f.hasOwnProperty(a)&&delete f.key}};return g}]),angular.module("crowdAdminApp").service("Functions",["$FirebaseArray","$firebase","firebaseUrl",function(a,b,c){var d=new Firebase(c+"/artifacts/functions"),e=new Firebase(c+"/history/artifacts/functions"),f=b(d),g=f.$asArray(),h={all:function(){return g},filter:function(a){return $filter("filter")(g,a)},get:function(a,c){if(void 0===c)return g.$getRecord(a);var d=b(e.child(a).child(c));return d.$asObject()},getHistory:function(a){var c=b(e.child(a));return c.$asArray()},getCode:function(){var a="";return angular.forEach(g,function(b){a+=b.header+" "+b.code+" \n"}),a}};return h}]),angular.module("crowdAdminApp").service("Tests",["$FirebaseArray","$firebase","$filter","firebaseUrl",function(a,b,c,d){var e=new Firebase(d+"/artifacts/tests"),f=new Firebase(d+"/history/artifacts/tests"),g=b(e),h=g.$asArray(),i={all:function(){return h},filter:function(a){return c("filter")(h,a)},get:function(a,c){if(void 0===c)return h.$getRecord(a);var d=b(f.child(a).child(c));return d.$asObject()},getCode:function(){var a="";return angular.forEach(h,function(b){a+=b.code+"\n"}),a}};return i}]),angular.module("crowdAdminApp").controller("EventsCtrl",["$scope","events","microtasks",function(a,b){a.events=b.all(),a.categories=[{value:"",label:"all"},{value:"microtask",label:"microtask events"},{value:"artifact",label:"artifact events"}]}]).directive("eventDetail",["$compile",function(a){return{restrict:"E",scope:{data:"="},template:"detail",link:function(b,c){var d=b.data.eventType.split(".");if("microtask"==d[0])switch(d[1]){case"spawned":c.html("A <strong>{{data.microtaskType}}</strong>  microtask has been spawned");break;case"submitted":c.html("A <strong>{{data.microtaskType}}</strong> microtask has been submitted");break;case"skipped":c.html("A <strong>{{data.microtaskType}}</strong> microtask has been skipped")}else"artifact"==d[0]&&c.html("A change on property <strong>{{data.propertyName}}</strong> of artifact {{data.artifactName}}");a(c.contents())(b)}}}]),angular.module("crowdAdminApp").filter("amountOfTime",function(){return function(a){var b=36e5,c=6e4,d=1e3,e=Math.floor(a/b),f=Math.round((a-e*b)/c),g=Math.round((a-e*b-f*c)/d);return 60===g&&(f++,g=0),60===f&&(e++,f=0),e+" hours, "+f+" minutes"}}).directive("microtaskEvents",function(){return{scope:{events:"="},restrict:"E",templateUrl:"/admin/microtasks/microtaskEvents.html",link:function(a){console.log(a)}}}).controller("MicrotasksCtrl",["$scope","$filter","Microtasks",function(a,b,c){a.types=[{value:"ReuseSearch",label:"reuse search"},{value:"Review",label:"review"},{value:"WriteCall",label:"write call"},{value:"WriteFunction",label:"write function"},{value:"WriteFunctionDescription",label:"write function description"},{value:"WriteTest",label:"write test"},{value:"WriteTestCases",label:"write test cases"},{value:"DebugTestFailure",label:"debug test failure"}],a.status=[{value:"spawned",label:"spawned"},{value:"assigned",label:"assigned"},{value:"skipped",label:"skipped"},{value:"in review",label:"in review"},{value:"accepted",label:"accepted"},{value:"rejected",label:"rejected"},{value:"reissued",label:"reissued"}],a.detail={active:!1,mtask:null,show:function(a){this.active=!0,this.mtask=a},hide:function(){this.active=!1,this.mtask=null}},a.resetFilter=function(){a.selectedTypes=[],a.selectedArtifacts=[],a.selectedStatus=[]},a.resetSort=function(){a.sort={column:"data.id",descending:!1}},a.changeSorting=function(b){var c=a.sort;c.column==b?c.descending=!c.descending:(c.column=b,c.descending=!1)},a.resetFilter(),a.resetSort(),a.microtasks=c,a.loading=!0,a.filter=!1,a.microtasks.$loaded().then(function(){a.$watch("filterText",function(d){a.microtasks=b("filter")(c,function(a){var b="";return b+=a.$id+" ",b+=a.data.type+" ",b+=a.data.promptType+" ",b+=a.data.owningArtifact+" ",b+=a.getStatus(),b.search(d)>-1?!0:!1})})})}]).controller("MicrotaskDetailCtrl",["$firebase","$scope","$routeParams","firebaseUrl","Microtasks","Functions",function(a,b,c,d,e,f){var g={WriteFunction:function(){},WriteTestCases:function(){},ReuseSearch:function(){},WriteTest:function(a){if(console.log("load data write test"),f.all().$loaded().then(function(){a.function=f.get(a.task.data.functionID,a.task.data.submission.functionVersion),console.log(a.function)}),"FUNCTION_CHANGED"==a.task.data.promptType){var b=JsDiff.diffLines(a.task.data.oldFunctionDescription,a.task.data.newFunctionDescription),c=mergeDiff(b);a.descriptionDiff=c.code}else if("TESTCASE_CHANGED"==a.task.data.promptType){var b=JsDiff.diffLines(a.task.data.oldFunctionDescription,a.task.data.newFunctionDescription),c=mergeDiff(b);a.descriptionDiff=c.code}},WriteFunctionDescription:function(){},WriteCall:function(){},DebugTestFailure:function(){},Review:function(){}},h=new Firebase(d+"/history/events"),i=c.microtaskKey;b.task=void 0,b.events=[],e.$loaded().then(function(){b.task=e.$getRecord(i),b.json=angular.toJson(b.task,!0),g[b.task.data.type](b),h.on("child_added",function(a){var c=a.val();c.microtaskKey==b.task.$id&&(b.events.push(c),b.$$phase||b.$apply())})}),b.aceLoaded=function(a){ace.initialize(a),a.setOptions({maxLines:1/0})}}]),angular.module("crowdAdminApp").controller("FunctionsCtrl",["$sce","$firebase","$filter","firebaseUrl","Functions","Tests","Microtasks",function(a,b,c,d,e,f,g){function h(){for(var a=[],b=1;b<s.versions;b++)a[b]=b;return a}function i(){var a=new Firebase(d+"/status/testJobQueue/"+s.selectedFunctionId),b={functionId:s.funct.id,functionVersion:s.funct.version,implementedIds:"",bounceCounter:15};a.set(b),console.log("sending request test to run ",b)}function j(){s.diffView=!s.diffView}function k(){l(),o(),n()}function l(){null!=s.selectedFunctionId&&(s.expanded=!1),e.all().$loaded().then(function(){s.funct=e.get(s.selectedFunctionId),s.versions=s.selectedVersion=s.funct.version,s.code=q(s.funct)})}function m(){null!=s.selectedVersion&&s.selectedVersion!=s.funct.version&&(s.funct=e.get(s.selectedFunctionId,s.selectedVersion),s.funct.$loaded().then(function(){s.code=q(s.funct)}))}function n(){var a=g.filter(function(a){return-1!=["WriteFunction"].indexOf(a.data.type)&&void 0!==a.data.submission&&void 0!==a.data.review&&a.data.review.qualityScore>3&&a.data.owningArtifactId==s.selectedFunctionId?!0:!1});s.diffHtml=[],s.contributors={},angular.forEach(a,function(a){void 0===s.contributors[a.data.workerHandle]&&(s.contributors[a.data.workerHandle]={added:0,removed:0});var b=JsDiff.diffLines(s.prevCode,a.data.submission.code),c=r(b);s.contributors[a.data.workerHandle].added+=parseInt(c.added),s.contributors[a.data.workerHandle].removed+=parseInt(c.removed),s.prevCode=a.data.submission.code})}function o(){s.expanded=!0,s.history=e.getHistory(s.selectedFunctionId),s.history.$loaded().then(function(){s.diff=[];var a=q(s.history[0]);s.diff.push({from:1,to:1,code:a,added:a.split("\n").length,removed:0});for(var b=1;b<s.history.length;b++){var c=q(s.history[b-1]),d=q(s.history[b]),e=r(JsDiff.diffLines(c,d));e.diffed&&(s.diff[s.diff.length-1].to=b-1,s.diff.push({from:b,to:b,code:e.code,added:e.added,removed:e.removed}))}s.diff[s.diff.length-1].to=s.history.length})}function p(a){ace.initialize(a),a.setOptions({maxLines:1/0})}function q(a){var b="/**\n"+a.description+"\n";if(void 0!==a.paramNames&&a.paramNames.length>0)for(var c=0;c<a.paramNames.length;c++)void 0!==a.paramDescriptions&&a.paramDescriptions.length>c&&(b+="  @param "+a.paramTypes[c]+" "+a.paramNames[c]+" , "+a.paramDescriptions[c]+"\n");return""!==a.returnType&&(b+="\n  @return "+a.returnType+" \n"),b+="**/\n",b+a.header+a.code}function r(a){var b,c,d="",e=!1;return b=c=0,angular.forEach(a,function(a){var f=a.added?"+":a.removed?"-":"";""!=f&&(e=!0);var g=a.value.split("\n");g.forEach(function(e){a.added&&b++,a.removed&&c++,d+=f+e+"\n"})}),{diffed:e,added:b,removed:c,code:d}}var s=this,t=b(new Firebase(d+"/workers/")),u=t.$asArray();s.all=e.all(),s.selectedVersion=null,s.selectedFunctionId=null,s.diffView=!0,s.loadFunctionData=k,s.loadVersion=m,s.getVersions=h,s.requestTestRun=i,s.toggleDiffView=j,s.buildCode=q,s.getAvatarUrl=function(a){var b=c("filter")(u,{workerHandle:a});return b[0].avatarUrl},s.aceLoaded=p,s.functionName=function(a){return a.name+(a.readOnly?" (API)":"")},s.renderHtml=function(b){return a.trustAsHtml(b)}}]),angular.module("crowdAdminApp").controller("TestsCtrl",["$sce","$firebase","$filter","firebaseUrl","Functions","Tests","Microtasks",function(a,b,c,d,e,f){function g(a){ace.initialize(a),a.setOptions({maxLines:1/0})}var h=this,i=e.all(),j=f.all();i.$loaded().then(function(){j.$loaded().then(function(){h.tests={},angular.forEach(i,function(a){h.tests[a.name]=f.filter({functionName:a.name})})})}),h.aceLoaded=g,h.renderHtml=function(b){return a.trustAsHtml(b)}}]),angular.module("crowdAdminApp").controller("FeedbackCtrl",["$scope","$firebase","firebaseUrl",function(a,b,c){var d=b(new Firebase(c+"/feedback"));a.feedbacks=d.$asArray()}]),angular.module("crowdAdminApp").controller("ChatCtrl",["$scope","$firebase","firebaseUrl",function(a,b,c){var d=b(new Firebase(c+"/chat"));a.chat=d.$asArray(),a.newMessage="",a.sendMessage=function(){a.chat.$add({createdAt:Date.now(),microtaskKey:"",text:a.newMessage,workerHandle:"admin",workerId:"admin"}).then(function(){a.newMessage=""})}}]),angular.module("crowdAdminApp").controller("CodeCtrl",["$scope","Functions","Tests",function(a,b,c){a.artifactType="functions",b.all().$loaded().then(function(){a.fCode=b.getCode()}),c.all().$loaded().then(function(){a.tCode=c.getCode()}),a.aceLoaded=function(a){ace.initialize(a),a.setOptions({maxLines:1/0})}}]),angular.module("crowdAdminApp").controller("UsersCtrl",["$scope","$firebase","firebaseUrl",function(a,b,c){var d=b(new Firebase(c+"/workers"));a.users=d.$asArray()}]);