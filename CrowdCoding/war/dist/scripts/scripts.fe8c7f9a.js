"use strict";angular.module("crowdAdminApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","mgcrea.ngStrap","firebase","nvd3","ui.ace","mgcrea.ngStrap"]).config(["$routeProvider",function(a){a.when("/dashboard",{templateUrl:"/dist/dashboard/dashboard.html",controller:"DashboardCtrl"}).when("/microtasks",{templateUrl:"/dist/microtasks/microtasks.html",controller:"MicrotasksCtrl"}).when("/functions",{templateUrl:"/dist/functions/functions.html",controller:"FunctionsCtrl"}).when("/feedback",{templateUrl:"/dist/feedback/feedback.html",controller:"FeedbackCtrl"}).when("/chat",{templateUrl:"/dist/chat/chat.html",controller:"ChatCtrl"}).when("/code",{templateUrl:"/dist/code/code.html",controller:"CodeCtrl"}).when("/users",{templateUrl:"/dist/users/users.html",controller:"UsersCtrl"}).otherwise({redirectTo:"/dashboard"})}]).run(["$rootScope","$templateCache","Microtasks","events",function(a,b,c,d){a.$on("$viewContentLoaded",function(){b.removeAll()}),console.log("APP: Initializing App"),console.log("APP: Quering the events for the first batch..."),c.$loaded().then(function(){var a=d.init();a.then(function(a){c.handleEvents(a),console.log(c.getStats()),console.log("APP: stats ready: "+c.getStatsReady())})}),a.time=(new Date).getTime()}]).constant("firebaseUrl","https://crowdcode.firebaseio.com/projects/"+projectId),angular.module("crowdAdminApp").controller("DashboardCtrl",["$scope","$http","Microtasks","Functions","firebaseUrl",function(a,b,c,d,e){a.pieConfig={visible:!0,extended:!1,disabled:!1,autorefresh:!0,refreshDataOnly:!1},a.numCompletedPie={chart:{type:"pieChart",height:300,x:function(a){return a.label},y:function(a){return a.value},showLabels:!0,labelType:"percent",showLegend:!1,transitionDuration:500,valueFormat:function(a){return parseInt(a)}},title:{enable:!0,text:"Finished by type"}},a.totalTimePie={chart:{type:"pieChart",height:300,x:function(a){return a.label},y:function(a){return a.value},showLabels:!0,labelType:"percent",showLegend:!1,transitionDuration:500,valueFormat:function(a){return $filter("amountOfTime")(a)}},title:{enable:!0,text:"Total worktime by type"}},a.totalTimeData=[],a.numCompletedData=[],a.microtasks=c,a.loading=!0,a.$watch("microtasks.getStatsReady() ",function(){a.microtasks.getStatsReady()&&(a.stats=a.microtasks.getStats(),a.numCompletedData=function(){var b=[];return angular.forEach(a.stats.finishByType,function(a,c){b.push({label:c,value:a.numFinished})}),b},a.totalTimeData=function(){var b=[];return angular.forEach(a.stats.finishByType,function(a,c){b.push({label:c,value:a.totalTime})}),b},a.loading=!1)}),a.output="",a.clearOutput=function(){a.output=""},a.executeCommand=function(c){"Reset"!=c||window.confirm("Are you sure? Reset will clear all the project data!")?b.post("/"+projectId+"/admin/"+c).success(function(b){a.output+=b.message}).error(function(){console.log("UNABLE TO EXECUTE COMMAND "+c)}):console.log("Aborting reset")},a.settings={};var f=new Firebase(e+"/status/settings");f.on("value",function(b){var c=b.val();angular.forEach(c,function(b,c){a.settings[c]=b}),a.$apply()}),a.toggleSettings=function(b){a.executeCommand(a.settings[b]?b+"OFF":b+"ON")}}]),angular.module("crowdAdminApp").factory("Microtask",["$firebaseUtils",function(a){function b(a){this.$id=a.key(),this.update(a.val()),this.events=[],this.setStatus("none")}return b.prototype={update:function(a){var b=angular.extend({},this.data);return this.data=a,!angular.equals(this.data,b)},getStatus:function(){return this.status},setStatus:function(a){this.status=a},addEvent:function(a){this.events.push(a)},updateStats2:function(a){a.hasOwnProperty("numFinished")||(a.numFinished=0,a.avgFinishTime=0,a.totalTime=0,a.finishByType={}),["completed","accepted","rejected","reissued"].indexOf(this.status)||a.numFinished++},updateStats:function(a){a.hasOwnProperty("numFinished")||(a.numFinished=0,a.avgFinishTime=0,a.totalTime=0,a.finishByType={}),a.hasOwnProperty(this.status)?a[this.status]++:a[this.status]=1;this.events[this.events.length-1];-1==["completed","in_review"].indexOf(this.status)||isNaN(this.completedIn)||(a.avgFinishTime=(a.avgFinishTime*a.numFinished+this.completedIn)/(a.numFinished+1),a.numFinished++,a.totalTime+=this.completedIn,a.finishByType.hasOwnProperty(this.data.type)?(a.finishByType[this.data.type].avgFinishTime=(a.finishByType[this.data.type].avgFinishTime*a.finishByType[this.data.type].numFinished+this.completedIn)/(a.finishByType[this.data.type].numFinished+1),a.finishByType[this.data.type].numFinished++,a.finishByType[this.data.type].totalTime+=this.completedIn):a.finishByType[this.data.type]={numFinished:1,avgFinishTime:this.completedIn,totalTime:this.completedIn})},handleEvent:function(a,b){if(a.microtaskID==this.data.id){switch(a.eventType){case"microtask.spawned":this.spawnedAt=a.timeInMillis,this.setStatus("spawned");break;case"microtask.assigned":this.assignedAt=a.timeInMillis,this.setStatus("assigned");break;case"microtask.skipped":this.setStatus("skipped"),this.assignedAt="";break;case"microtask.submitted":this.completedAt=a.timeInMillis,this.completedIn=this.completedAt-this.assignedAt,this.setStatus(-1!=["Review","DebugTestFailure","ReuseSearch"].indexOf(this.data.type)?"completed":"in_review");break;case"microtask.accepted":this.setStatus("accepted");break;case"microtask.rejected":this.setStatus("rejected");break;case"microtask.reissued":this.setStatus("reissued")}this.updateStats(b),this.addEvent(a)}},toJSON:function(){return a.toJSON(this.data)}},b}]).factory("MicrotaskFactory",["$FirebaseArray","Microtask",function(a,b){var c=!1;return a.$extendFactory({stats:{},statsReady:!1,handleEvents:function(a){var b=this;void 0==b&&(b.stats={}),c=!1,angular.forEach(a,function(a,c){if(void 0!=a.microtaskID&&void 0!=a.artifactID){var c=a.artifactID+"-"+a.microtaskID,d=b.$getRecord(c);null!=d&&d.handleEvent(a,b.stats)}}),b.statsReady=!0},getStats:function(){return this.stats},getStatsReady:function(){return this.statsReady},$$added:function(a){return new b(a)},$$updated:function(a){var b=this.$list.$getRecord(a.key());return b.update(a.val())}})}]).service("Microtasks",["$firebase","$filter","MicrotaskFactory","events","firebaseUrl",function(a,b,c,d,e){var f=null;if(null==f)var g=new Firebase(e+"/microtasks"),h=a(g,{arrayFactory:c}),f=h.$asArray();else console.log("mtasks already laoded");return f}]),angular.module("crowdAdminApp").service("events",["$firebase","$filter","$q","firebaseUrl",function(a,b,c,d){console.log(d+"/history/events");var e=new Firebase(d+"/history/events"),f=[],g={init:function(){{var a=c.defer();(new Date).getTime()}return e.once("value",function(b){b.forEach(function(a){var b=a.val();for(var c in f)f.hasOwnProperty(c)&&f[c].call(null,b)}),a.resolve(b.exportVal())}),a.promise},get:function(){var a=c.defer(),b=e.limitToFirst(2e3);return b.on("value",function(b){return a.resolve(b.exportVal())}),a.promise},addListener:function(a,b){f[b]=a},removeListener:function(a){f.hasOwnProperty(a)&&delete f.key}};return g}]),angular.module("crowdAdminApp").service("Functions",["$FirebaseArray","$firebase","firebaseUrl",function(a,b,c){var d=new Firebase(c+"/artifacts/functions"),e=new Firebase(c+"/history/artifacts/functions"),f=b(d),g=f.$asArray(),h={all:function(){return g},filter:function(a){return $filter("filter")(g,a)},get:function(a,c){if(void 0===c)return g.$getRecord(a);var d=b(e.child(a).child(c));return d.$asObject()},getCode:function(){var a="",b=new Firebase(c+"/artifacts/functions");return b.once("value",function(b){for(var c in b.val()){var d=b.val()[c];a+=d.header+" "+d.code+" \n"}}),console.log("allCode",a),a}};return h}]),angular.module("crowdAdminApp").controller("EventsCtrl",["$scope","events","microtasks",function(a,b){a.events=b.all(),a.categories=[{value:"",label:"all"},{value:"microtask",label:"microtask events"},{value:"artifact",label:"artifact events"}]}]).directive("eventDetail",["$compile",function(a){return{restrict:"E",scope:{data:"="},template:"detail",link:function(b,c){var d=b.data.eventType.split(".");if("microtask"==d[0])switch(d[1]){case"spawned":c.html("A <strong>{{data.microtaskType}}</strong>  microtask has been spawned");break;case"submitted":c.html("A <strong>{{data.microtaskType}}</strong> microtask has been submitted");break;case"skipped":c.html("A <strong>{{data.microtaskType}}</strong> microtask has been skipped")}else"artifact"==d[0]&&c.html("A change on property <strong>{{data.propertyName}}</strong> of artifact {{data.artifactName}}");a(c.contents())(b)}}}]),angular.module("crowdAdminApp").filter("amountOfTime",function(){return function(a){var b=36e5,c=6e4,d=1e3,e=Math.floor(a/b),f=Math.round((a-e*b)/c),g=Math.round((a-e*b-f*c)/d);return 60===g&&(f++,g=0),60===f&&(e++,f=0),e+" hours, "+f+" minutes"}}).directive("microtaskDetails",["$modal","Microtasks","Functions",function(a,b,c){var d={WriteFunction:function(){},WriteTestCases:function(){},ReuseSearch:function(){},WriteTest:function(a){c.all().$loaded().then(function(){a.function=c.get(a.task.data.functionID,a.task.data.submission.functionVersion)})},WriteFunctionDescription:function(){},WriteCall:function(){},DebugTestFailure:function(){},Review:function(){}};return{scope:{mtask:"=microtaskDetails"},link:function(c,e){c.modal=a({placement:"center",scope:c,animation:"am-fade-and-scale",template:"/dist/microtasks/microtaskDetails.html",show:!1}),b.$loaded().then(function(){c.task="Review"==c.mtask.data.type?b.$getRecord(c.mtask.data.microtaskKeyUnderReview):c.mtask,e.on("click",function(){d[c.task.data.type](c),c.modal.$promise.then(c.modal.show)})}),c.aceLoaded=function(a){ace.initialize(a),a.setOptions({maxLines:1/0})}}}}]).controller("MicrotasksCtrl",["$scope","$filter","Microtasks",function(a,b,c){a.types=[{value:"ReuseSearch",label:"reuse search"},{value:"Review",label:"review"},{value:"WriteCall",label:"write call"},{value:"WriteFunction",label:"write function"},{value:"WriteFunctionDescription",label:"write function description"},{value:"WriteTest",label:"write test"},{value:"WriteTestCases",label:"write test cases"},{value:"DebugTestFailure",label:"debug test failure"}],a.status=[{value:"spawned",label:"spawned"},{value:"assigned",label:"assigned"},{value:"skipped",label:"skipped"},{value:"in review",label:"in review"},{value:"accepted",label:"accepted"},{value:"rejected",label:"rejected"},{value:"reissued",label:"reissued"}],a.resetFilter=function(){a.selectedTypes=[],a.selectedArtifacts=[],a.selectedStatus=[]},a.resetSort=function(){a.sort={column:"data.id",descending:!1}},a.changeSorting=function(b){var c=a.sort;c.column==b?c.descending=!c.descending:(c.column=b,c.descending=!1)},a.resetFilter(),a.resetSort(),a.microtasks=c,a.loading=!0,a.$watch("microtasks.getStatsReady()",function(){a.microtasks.getStatsReady&&(a.stats=a.microtasks.getStats(),a.loading=!1)}),a.filter=!1,a.microtasks.$loaded().then(function(){a.$watch("selectedTypes + selectedArtifacts + selectedStatus",function(){0==a.selectedTypes.length&&0==a.selectedArtifacts.length&&0==a.selectedStatus.length?(a.filter=!1,console.log("filter is off")):(a.filterStats={},a.filterMicrotasks=b("filter")(c,function(b){return 0!=a.selectedTypes.length&&-1==a.selectedTypes.indexOf(b.data.type)||0!=a.selectedArtifacts.length&&-1==a.selectedArtifacts.indexOf(b.data.owningArtifact)||0!=a.selectedStatus.length&&-1==a.selectedStatus.indexOf(b.status)?!1:(b.updateStats(a.filterStats),!0)}),a.filter=!0,console.log("filter is on"))})})}]),angular.module("crowdAdminApp").controller("FunctionsCtrl",["$scope","functions",function(a,b){a.functions=b.all(),a.types=[{value:"",label:"all"}]}]).directive("functionDetail",["$compile","events","microtasks",function(a,b){return{restrict:"E",scope:{data:"="},template:'<ul><li ng-repeat="event in events">{{event.eventType}}</li></ul>',link:function(a){a.events=b.byArtifact(a.data)}}}]),angular.module("crowdAdminApp").controller("FeedbackCtrl",["$scope","$firebase","firebaseUrl",function(a,b,c){var d=b(new Firebase(c+"/feedback"));a.feedbacks=d.$asArray()}]),angular.module("crowdAdminApp").controller("ChatCtrl",["$scope","$firebase","firebaseUrl",function(a,b,c){var d=b(new Firebase(c+"/chat"));a.chat=d.$asArray()}]),angular.module("crowdAdminApp").controller("CodeCtrl",["$scope","$firebase","firebaseUrl","Functions",function(a,b,c,d){a.functions=d.all;var e=new Firebase(c+"/artifacts/tests"),f=b(e);a.tests=f.$asArray(),a.tests.$loaded().then(function(){console.log("tests loaded",a.functions,$socpe.tests)}),a.aceLoaded=function(a){ace.initialize(a),a.setOptions({maxLines:1/0})}}]),angular.module("crowdAdminApp").controller("UsersCtrl",["$scope","$firebase","firebaseUrl",function(a,b,c){var d=b(new Firebase(c+"/workers"));a.users=d.$asArray()}]);