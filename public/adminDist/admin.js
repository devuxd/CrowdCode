
/**
 * @ngdoc overview
 * @name crowdAdminApp
 * @description
 * # crowdAdminApp
 *
 * Main module of the application.
 */
var $cache = null;
angular
  .module('crowdAdminApp', [
    'templates-main',
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'ui.ace',
    'firebase',
    'mgcrea.ngStrap'
  ])
  .config(function ($stateProvider) {

    $stateProvider
      .state('dashboard',{
        url: '',
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl'
      })

      .state('microtasks',{
        url: '/microtasks',
        templateUrl: 'microtasks/microtasks.html',
        controller: 'MicrotasksCtrl'
      })
      
      .state('microtasksDetail',{
        url: '/microtasks/:microtaskKey',
        templateUrl: 'microtasks/microtaskDetail.html',
        controller: 'MicrotaskDetailCtrl'
      })

      
      .state('feedback',{
        url: '/feedback',
        templateUrl: 'feedback/feedback.html',
        controller: 'FeedbackCtrl'
      })
    
      .state('chat',{
        url: '/chat',
        templateUrl: 'chat/chat.html',
        controller: 'ChatCtrl'
      })

      .state('code',{
        url: '/code',
        templateUrl: 'code/code.html',
        controller: 'CodeCtrl'
      })

      .state('functions',{
        url: '/functions',
        templateUrl: 'functions/functions.html',
        controller: 'FunctionsCtrl',
        controllerAs: 'vm'
      })

      .state('tests',{
        url: '/tests',
        controller: 'TestsCtrl',
        controllerAs: 'vm'
      })

      .state('users',{
        url: '/users',
        templateUrl: 'users/users.html',
        controller: 'UsersCtrl'
      })
      .state('questions',{
        url: '/questions',
        templateUrl: 'questions/questions.html',
        controller: 'QuestionsCtrl'
      });

  })
  .run(['$rootScope', '$location', '$anchorScroll', '$templateCache','Microtasks','eventsService',function($rootScope, $location, $anchorScroll, $templateCache, Microtasks, eventsService) {
    
    $rootScope.go = function ( path ) {
      $location.url( path ); 
    };

    // //when the route is changed scroll to the proper element.
    // $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    //   if( $routeParams.scrollTo !== undefined ){
    //     $location.hash($routeParams.scrollTo);
    //     $location.search('scrollTo',null);
    //     $anchorScroll(); 
    //   } 
    // });

    Microtasks.$loaded().then(function(){
      eventsService.addListener( Microtasks.handleEvent );
      eventsService.init();
    });

    $rootScope.time = new Date().getTime();
    
  }])
.constant('firebaseUrl','https://crowdcode.firebaseio.com/projects/'+projectId)
.filter('keylength', function(){
  return function(input){
    if(angular.isObject(input)){
      return Object.keys(input).length;
    } else {
      return null;
    }
  };
})
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

'use strict';

/**
 * @ngdoc chat
 * @name crowdAdminApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('ChatCtrl', ['$scope', '$firebase',  'firebaseUrl', function ($scope, $firebase, firebaseUrl) {
    var sync = $firebase(new Firebase(firebaseUrl+"/chat"));
  	$scope.chat = sync.$asArray();

  	$scope.newMessage = '';
  	$scope.sendMessage = function(){
  		$scope.chat.$add({
  			"createdAt": Date.now(),
  			"microtaskKey": "",
  			"text": $scope.newMessage,
  			"workerHandle":"admin",
  			"workerId":"admin"}).then(function(){ $scope.newMessage = "";});

  	};
  	
  }]);

'use strict';

/**
 * @ngdoc code
 * @name crowdAdminApp.controller:CodeCtrl
 * @description
 * # CodeCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('CodeCtrl', [ '$scope', 'Functions', 'Tests',function ($scope, Functions, Tests) {
   
    $scope.artifactType = 'functions';
    Functions.all().$loaded().then(function(){
    	$scope.fCode  = Functions.getCode();
    });
    Tests.all().$loaded().then(function(){
        $scope.tCode  = Tests.getCode();
    });

    $scope.aceLoaded = function(_editor) {
        ace.initialize(_editor);
        _editor.setOptions({
             maxLines: Infinity
        });
    };
  }]);

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
.controller('DashboardCtrl', ['$scope', '$http', '$firebase', 'Microtasks', 'Functions','firebaseUrl', function ($scope,$http,$firebase, Microtasks,Functions,firebaseUrl) {

    // prepare the graphs data 
    $scope.pieConfig = {
        visible: true, // default: true
        extended: false, // default: false
        disabled: false, // default: false
        autorefresh: true, // default: true
        refreshDataOnly: false // default: false
    };

    // COMPLETE MICROTASKS
    // pie chart settings
    $scope.numCompletedPie = {
        chart: {
            type: 'pieChart',
            height: 300,
            x: function(d){return d.label;},
            y: function(d){return d.value;},
            showLabels: true,
            labelType: "percent",
            showLegend: false,
            transitionDuration: 500,
            valueFormat: function(d){
                return parseInt(d);
            }
        },
        title: {
            enable: true,
            text  : 'Finished by type'
        }
    };

    // TOTAL WORK TIME
    // pie chart settings
    $scope.totalTimePie = {
        chart: {
            type: 'pieChart',
            height: 300,
            x: function(d){return d.label;},
            y: function(d){return d.value;},
            showLabels: true,
            labelType: "percent",
            showLegend: false,
            transitionDuration: 500,
            valueFormat: function(d){
                return $filter('amountOfTime')(d);
            }
        },
        title: {
            enable: true,
            text  : 'Total worktime by type'
        }
    };

    // initialize scope variables
    $scope.totalTimeData    = [];
    $scope.numCompletedData = [];

    // initialize microtasks and stats
    $scope.microtasks = Microtasks;
  
    // set loading for the first run
    $scope.loading = true;
    $scope.$watch( 'microtasks.getStatsReady() ', function() {
    	if( $scope.microtasks.getStatsReady() ){
    		$scope.stats = $scope.microtasks.getStats();

			$scope.numCompletedData = function(){
			    var graphData = [];
			    angular.forEach( $scope.stats.finishByType,function(stats, type){
			        graphData.push({
			            label: type,
			            value: stats.numFinished
			        });
			    });
			    return graphData;
			};

			$scope.totalTimeData = function(){
			    var graphData = [];
			    angular.forEach( $scope.stats.finishByType,function(stats, type){
			        graphData.push({
			            label: type,
			            value: stats.totalTime
			        });
			    });
			    return graphData;
			};
			$scope.loading = false;
    	}
    });

    $scope.output = "";
    $scope.clearOutput = function(){ $scope.output = ""; };
    $scope.executeCommand = function(command){

        if( (command=='Reset' && !window.confirm("Are you sure? Reset will clear all the project data!")) ) 
            console.log('Aborting reset');
        else {
            console.log('/'+projectId+'/admin/' + command);
           $http.post('/'+projectId+'/admin/' + command)
            .success(function(data, status, headers, config) {
                $scope.output += data.message;
            })
            .error(function(data, status, headers, config) {
                console.log('UNABLE TO EXECUTE COMMAND '+command);
            }); 
        }
        

    };

    $scope.setAsDefault = function(){
        var ref = new Firebase('https://crowdcode.firebaseio.com/defaultProject');
        ref.set(projectId);
        console.log('set as default project: '+projectId);
    };


    // default project settings
    $scope.settings = {  };

    // load the project settings from firebase
    var settingsRef = new Firebase(firebaseUrl+'/status/settings');
    settingsRef.on('value',function(snapshot){
        var val= snapshot.val();
        angular.forEach(val,function(value,index){
            $scope.settings[index] = value;
        });
    });

    $scope.toggleSettings = function(name){
        if( $scope.settings[name] )
            $scope.executeCommand(name+'OFF');
        else
            $scope.executeCommand(name+'ON');
        
    }


}]);

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('EventsCtrl', ['$scope', 'events', 'microtasks', function ($scope, events, microtasks) {
  	$scope.events = events.all();
  	$scope.categories = [
  		{"value":"","label":"all"},
  		{"value":"microtask","label":"microtask events"},
  		{"value":"artifact","label":"artifact events"}
  	];
  	// $scope.events.loaded().then(function(){
  	// 	console.log("events loaded");
  	// });
  }])
  .directive('eventDetail',['$compile',function($compile){
  	return {
  		restrict: 'E',
  		scope: {
  			data : '='
  		},
  		template: 'detail',
  		link: function($scope,element,attrs){

        var eventParts = $scope.data.eventType.split('.');

  			if( eventParts[0] == 'microtask' ){

          switch(  eventParts[1] ){
            case 'spawned' : 
              element.html('A <strong>{{data.microtaskType}}</strong>  microtask has been spawned');
              break;

            case 'submitted' : 
              element.html('A <strong>{{data.microtaskType}}</strong> microtask has been submitted');
              break;

            case 'skipped' : 
              element.html('A <strong>{{data.microtaskType}}</strong> microtask has been skipped');
              break;

            default:
          }

        } else if( eventParts[0] == 'artifact' ){
          element.html('A change on property <strong>{{data.propertyName}}</strong> of artifact {{data.artifactName}}');
        } 
  
  			$compile(element.contents())($scope);
  		}
  	};
  }]);

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:events
 * @description
 * # events 
 * events data service
 */
angular.module('crowdAdminApp')
  .service('eventsService', ['$firebase', '$filter', '$q', '$rootScope', 'firebaseUrl', function($firebase, $filter, $q, $rootScope, firebaseUrl){

  	// ref to the history
  	var ref = new Firebase( firebaseUrl + '/history/events' );
    var listeners = [];

    function init(){
        // load first batch of events = from the beginning to the last added
        ref.once('value', function( firstBatch ){
            // get first batch 
            firstBatch.forEach(function( eventSnap ){
                var event = eventSnap.val();
                callListeners( event );
            });
            
            // apply changes to all the views
            $rootScope.$apply();

            // listen for new events
            var firstSkipped = false;
            ref.endAt().limitToLast(1).on('child_added',function( eventSnap ){
                if( !firstSkipped ) firstSkipped = true; 
                else {
                    var event = eventSnap.val();
                    callListeners( event );
                    $rootScope.$apply();
                }
            })
        });
    }

    function callListeners( event ){
        for (var lKey in listeners) {
          if(listeners.hasOwnProperty(lKey)){
            listeners[lKey].call( null, event );
          }
        }
    }

    function addListener( listener, key ){
        listeners[key] = listener ;
    }

    function removeListener( key ){
        if( listeners.hasOwnProperty( key ) ){
            delete listeners.key ;
        } 
    }

    var service = {
        init: init,
        addListener: addListener,
        removeListener: removeListener
    };

    return service;
  }]);
'use strict';

/**
 * @ngdoc feedback
 * @name crowdAdminApp.controller:FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('FeedbackCtrl', ['$scope', '$firebase', 'firebaseUrl', function ($scope, $firebase, firebaseUrl) {
    var sync = $firebase(new Firebase(firebaseUrl+"/feedback"));
  	$scope.feedbacks = sync.$asArray();
  }]);

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('FunctionsCtrl', [ '$sce', '$firebase', '$filter', 'firebaseUrl', 'Functions', 'Tests', 'Microtasks',  function ($sce, $firebase, $filter, firebaseUrl, Functions, Tests, Microtasks) {
  	
    var vm = this;
    var workersRef        = $firebase(new Firebase(firebaseUrl+'/workers/'));
    var workers = workersRef.$asArray();

    vm.all                = Functions.all();
    vm.selectedVersion    = null;
    vm.selectedFunctionId = null;
    vm.diffView           = true;

  
    vm.loadFunctionData = loadFunctionData;
    vm.loadVersion    = loadVersion;
    vm.getVersions    = getVersions;
    vm.requestTestRun = requestTestRun;
    vm.toggleDiffView = toggleDiffView;
    vm.buildCode      = buildCode;
    vm.getAvatarUrl   = function(workerHandle){
      var res = $filter('filter')(workers,{ workerHandle: workerHandle} );
      return res[0].avatarUrl;
    };

    // ace 
    vm.aceLoaded      = aceLoaded;

    vm.functionName = function(fun){
      return fun.name + (fun.readOnly?' (API)':'');
    };

    vm.renderHtml = function(html_code){
        return $sce.trustAsHtml(html_code);
    };

    function getVersions(){
      var versions = [];
      for(var i=1;i<vm.versions;i++)
        versions[i] = i;
      return versions;
    }

    function requestTestRun(){
      var tRef        = new Firebase(firebaseUrl+'/status/testJobQueue/'+vm.selectedFunctionId);
      var rec = { 
        functionId      : vm.funct.id, 
        functionVersion : vm.funct.version, 
        implementedIds  : '', 
        bounceCounter   : 15
      }
      tRef.set(rec);
      console.log('sending request test to run ',rec);
    }

    function toggleDiffView(){
      vm.diffView = !vm.diffView;
    }

    function loadFunctionData(){
      loadFunction();
      loadHistory();
      loadContributions();
    }


    function loadFunction(){
      if( vm.selectedFunctionId != null )
        vm.expanded = false;
        Functions.all().$loaded().then(function(){
          vm.funct = Functions.get(vm.selectedFunctionId);
          vm.versions = vm.selectedVersion = vm.funct.version;
          vm.code = buildCode(vm.funct);
        });
    }

    function loadVersion(){
      if( vm.selectedVersion != null && vm.selectedVersion != vm.funct.version){
        vm.funct   = Functions.get(vm.selectedFunctionId,vm.selectedVersion);
        vm.funct.$loaded().then(function(){
          vm.code = buildCode(vm.funct);
        });
      }
    }

    function mergeDiff2(diffObjs){
      var merged = '';
      var diffed = false;
      var added, removed;
      added = removed = 0;

      angular.forEach(diffObjs,function(diffLine,index){
        var prefix = diffLine.added ? '+':
                     diffLine.removed ? '-' : '';

        if( prefix != '' ) {
          diffed=true;
        }

        var lines = diffLine.value.split('\n');
        lines.forEach(function(val){
          if( diffLine.added   ) added   ++;
          if( diffLine.removed ) removed ++;

          merged += val +'\n';
        });

      });


      return {
        diffed: diffed,
        added: added,
        removed: removed,
        code: merged
      };
    }

    function loadContributions(){
      var mtasks = Microtasks.filter(function(mtask, index){
          if( ( ['WriteFunction'].indexOf(mtask.data.type) != -1 )  && 
              ( mtask.data.submission !== undefined )  &&
              ( mtask.data.review !== undefined )  && 
              ( mtask.data.review.qualityScore > 3 ) &&
              mtask.data.owningArtifactId == vm.selectedFunctionId
          ){
              return true;
          }
          return false;
      });
      vm.diffHtml = [];
      vm.contributors = {};
      angular.forEach(mtasks,function(val,index){
        if( vm.contributors[val.data.workerHandle] === undefined ) 
          vm.contributors[val.data.workerHandle] = {
            added   : 0,
            removed : 0
          };

        var diff = JsDiff.diffLines(vm.prevCode,val.data.submission.code);
        var merge = mergeDiff(diff);
        vm.contributors[val.data.workerHandle].added   += parseInt(merge.added);
        vm.contributors[val.data.workerHandle].removed += parseInt(merge.removed);
        vm.prevCode = val.data.submission.code;
      });
    }

    function loadHistory(){
      vm.expanded = true;

      

      vm.history = Functions.getHistory(vm.selectedFunctionId);
      vm.history.$loaded().then(function(){
        vm.diff = [];

        var beginningCode = buildCode(vm.history[0]);
        vm.diff.push({
          from    : 1,
          to      : 1,
          code    : beginningCode,
          added   : beginningCode.split('\n').length,
          removed : 0,
        });

        for( var i = 1 ; i < vm.history.length; i++) {
          var prevCode = buildCode(vm.history[i-1]);
          var code     = buildCode(vm.history[i]);
          var mergeRes = mergeDiff(JsDiff.diffLines(prevCode,code));

          if(mergeRes.diffed){
            vm.diff[vm.diff.length-1].to = i-1;


            vm.diff.push({
              from    : i,    
              to      : i,
              code    : mergeRes.code,
              added   : mergeRes.added,
              removed : mergeRes.removed,
            });
          }
        }
        vm.diff[vm.diff.length-1].to = vm.history.length;
      });
    }




    function aceLoaded(_editor) {
        ace.initialize(_editor);
        _editor.setOptions({
             maxLines: Infinity
        });
    }


    function buildCode(funct){
      var description = '/**\n' + funct.description + '\n';

      if(funct.paramNames!==undefined && funct.paramNames.length>0)
        for(var i=0; i<funct.paramNames.length; i++)
          if(funct.paramDescriptions!==undefined && funct.paramDescriptions.length>i)
            description += '  @param ' + funct.paramTypes[i] + ' ' + funct.paramNames[i] + ' , ' + funct.paramDescriptions[i] + '\n';

      if(funct.returnType!=='')
        description += '\n  @return ' + funct.returnType + ' \n';
      description+='**/\n';

      return description + funct.header + funct.code;
    }

    function mergeDiff(diffObjs){
      var merged = '';
      var diffed = false;
      var added, removed;
      added = removed = 0;

      angular.forEach(diffObjs,function(diffLine,index){
        var prefix = diffLine.added ? '+':
                     diffLine.removed ? '-' : '';

        if( prefix != '' ) {
          diffed=true;
        }

        var lines = diffLine.value.split('\n');
        lines.forEach(function(val){
          if( diffLine.added   ) added   ++;
          if( diffLine.removed ) removed ++;

          merged += prefix + val + '\n';
        });

      });


      return {
        diffed : diffed,
        added  : added,
        removed: removed,
        code   : merged
      };
    }

  }]);

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:artifacts
 * @description
 * # artifacts 
 * artifacts data service
 */
angular.module('crowdAdminApp')
.service("Functions", ["$FirebaseArray", "$firebase", 'firebaseUrl', function($FirebaseArray, $firebase, firebaseUrl) {

    var ref        = new Firebase(firebaseUrl+'/artifacts/functions');
    var historyRef = new Firebase(firebaseUrl+'/history/artifacts/functions');
    var sync       = $firebase(ref);
    var syncArray  = sync.$asArray(); 
    

    var service = {

    	all : function(){
    		return syncArray;
    	},

    	filter: function(filterParameters){
    		return $filter('filter')(syncArray,filterParameters);
    	},

        get: function(id,version){
            if( version === undefined ){
                return syncArray.$getRecord(id);
            } else {
                var funcSync = $firebase( historyRef.child(id).child(version) );
                return funcSync.$asObject();
            }
        },

        getHistory: function(id){
            var historySync = $firebase( historyRef.child(id) );
            return historySync.$asArray();
        },
        
        getCode: function(){
            var allCode = "";
            angular.forEach(syncArray,function(fun,index){
                allCode+= fun.header +' '+ fun.code +' \n';
            });
            return allCode;
        }
    };

    return service;
}]);
'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .directive('rowDetails', [ '$compile', function($compile){
  	return {
  		restrict: 'A',
  		scope: {
  			data : '='
  		},
  		link: function($scope,element,attrs){
        var contentTr = angular.element('<tr><td><function-microtasks data="data"></function-microtasks></td></tr>');
        var open = false;
        element.on('click',function(){
          open = !open ;
          if( open ) {
            contentTr.insertAfter(element);
            $compile(contentTr)($scope);
          }
          else 
            contentTr.remove();
        });
  		}
  	};
  }]);
'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
.filter('amountOfTime', function() {
  return function( millis ) {
    var 
        //millisPerDay    = 24 * 60 * 60 * 1000,
        millisPerHour   = 60 * 60 * 1000,
        millisPerMinute = 60 * 1000,
        millisPerSecond = 1000,
        //days    = Math.floor( millis / millisPerDay ),
        hours   = Math.floor( millis / millisPerHour ),
        minutes = Math.round( (millis - hours * millisPerHour) / millisPerMinute ),
        seconds = Math.round( (millis - hours * millisPerHour - minutes * millisPerMinute ) / millisPerSecond ),
        pad = function(n){ return n < 10 ? '0' + n : n; };
    
    if( seconds === 60 ){
        minutes++;
        seconds = 0;
    }
    if( minutes === 60 ){
        hours++;
        minutes = 0;
    }
    // if( hours === 24 ){
    //     days++;
    //     hours = 0;
    // }
    return hours+' hours, '+minutes+' minutes';//, pad(seconds)].join(':');
  };
})
.directive('microtaskEvents', function(){

 return {
    scope: {
        events:'='
    },
    restrict: 'E',
    templateUrl: 'microtasks/microtaskEvents.html',
    link: function(scope,element,attrs){
        console.log(scope);
    }
 };
})
.controller('MicrotasksCtrl', ['$scope', '$filter', 'Microtasks',  function ($scope, $filter, Microtasks) {

    // fill types filter
    $scope.types = [
        {'value':'ReuseSearch','label':'reuse search'},
        {'value':'Review','label':'review'},
        {'value':'WriteCall','label':'write call'},
        {'value':'WriteFunction','label':'write function'},
        {'value':'WriteFunctionDescription','label':'write function description'},
        {'value':'WriteTest','label':'write test'},
        {'value':'WriteTestCases','label':'write test cases'},
        {'value':'DebugTestFailure','label':'debug test failure'}
    ];

    // fill status filter
    $scope.status = [
        //{ value:''  , label: 'all' },
        { value:'spawned'  , label: 'spawned' },
        { value:'assigned' , label: 'assigned' },
        { value:'skipped'  , label: 'skipped' },
        { value:'in review', label: 'in review' },
        { value:'accepted', label: 'accepted' },
        { value:'rejected', label: 'rejected' },
        { value:'reissued', label: 'reissued' },
    ];

    $scope.detail = {
        active: false,
        mtask : null,
        show  : function(mtask){
            this.active = true;
            this.mtask  = mtask;
        },
        hide : function(){
            this.active = false;
            this.mtask  = null;
        }
    }


    // reset filter parameters
    $scope.resetFilter = function(){    
        $scope.selectedTypes     = [];
        $scope.selectedArtifacts = [];
        $scope.selectedStatus    = [];
    }

    // reset sort parameters
    $scope.resetSort = function(){    
        $scope.sort = { column: 'data.id', descending : false };
    }

    // change the sorting 
    // by a column, if the sort was already
    // on the same column, change the order
    $scope.changeSorting = function(column) {
        var sort = $scope.sort;
        if (sort.column == column) {
            sort.descending = !sort.descending;
        } else {
            sort.column = column;
            sort.descending = false;
        }
    };

    // reset filters and sort configu
    $scope.resetFilter();
    $scope.resetSort();

    // load the microtasks 
    $scope.microtasks = Microtasks;
    $scope.loading    = true;

    // // watch for the stats ready
    // $scope.$watch( 'microtasks.getStatsReady()', function(newV,oldV) {
    //     if( $scope.microtasks.getStatsReady ){
    //         $scope.stats = $scope.microtasks.getStats();
    //         $scope.loading = false;
    //     }
    // });
    
    // when tasks loaded
    $scope.filter = false;
    $scope.microtasks.$loaded().then(function(){

        $scope.$watch('filterText',function(filterText){
            $scope.microtasks = $filter('filter')( Microtasks , function(mtask, index){

                var searchString = "";
                searchString += mtask.$id + ' ';
                searchString += mtask.data.type + ' ';
                searchString += mtask.data.promptType + ' ';
                searchString += mtask.data.owningArtifact + ' ';
                searchString += mtask.getStatus();

                if( searchString.search(filterText) > -1 )
                    return true;
                
                return false;
            });
        });
        // // watch for the filters changing
        // $scope.$watch('selectedTypes + selectedArtifacts + selectedStatus',function(){

        //     if( $scope.selectedTypes.length == 0 && $scope.selectedArtifacts.length == 0 && $scope.selectedStatus.length == 0){
        //         $scope.filter = false;
        //         console.log('filter is off');
        //     } else {
        //         // the filter function 
        //         // let pass only the microtasks
        //         // that respect the filter parameters
        //         $scope.filterStats = {};
        //         $scope.filterMicrotasks =  $filter('filter')( Microtasks , function(mtask, index){

        //             if( ( $scope.selectedTypes.length     == 0 || $scope.selectedTypes.indexOf(mtask.data.type) != -1 )  && 
        //                 ( $scope.selectedArtifacts.length == 0 || $scope.selectedArtifacts.indexOf(mtask.data.owningArtifact) != -1 ) &&
        //                 ( $scope.selectedStatus.length    == 0 || $scope.selectedStatus.indexOf(mtask.status) != -1 )
        //             ){
        //                 mtask.updateStats($scope.filterStats);
        //                 return true;
        //             }
                    
        //             return false;
        //         }) ;
        //         $scope.filter = true;
        //         console.log('filter is on');
        //     }

           

            

        //     // angular.forEach($scope.microtasks,function(task){
        //     //     //console.log(task);
        //     //     task.updateStats($scope.filterStats);
        //     // });

        // });




    });


    
    
  }])

.controller('MicrotaskDetailCtrl',[
    '$firebase', 
    '$scope', 
    '$stateParams', 
    'firebaseUrl',
    'Microtasks',
    'Functions',
    function( $firebase, $scope, $stateParams, firebaseUrl, Microtasks, Functions ){
         

    var loadData = {
        'WriteFunction': function($scope) {

        

        },

        'WriteTestCases': function($scope) {

            // news.testcases = news.microtask.submission.testCases;

            // var functionUnderTestSync = $firebase( new Firebase($rootScope.firebaseURL+ '/history/artifacts/functions/' + news.microtask.functionID + '/'
            // + news.microtask.submission.functionVersion));
            // var functionUnderTest = functionUnderTestSync.$asObject();

            // functionUnderTest.$loaded().then(function(){

            //     news.editorCode = functionsService.renderDescription(functionUnderTest)+functionUnderTest.header;
            // });
        },

        'ReuseSearch': function($scope) {
            // news.microtask.pseudoCall= news.microtask.callDescription;
            // if(news.microtask.submission.noFunction === false)
            //     news.editorHeader = functionsService.renderHeaderById(news.microtask.submission.functionId);
        },
        'WriteTest': function($scope) {
            console.log('load data write test');
            //function
            Functions.all().$loaded().then( function(){
                $scope.function = Functions.get( $scope.task.data.functionID, $scope.task.data.submission.functionVersion );
                console.log($scope.function);
            });

            if ($scope.task.data.promptType == 'FUNCTION_CHANGED') {
                var diffRes = JsDiff.diffLines($scope.task.data.oldFunctionDescription,$scope.task.data.newFunctionDescription);
                var mergeRes = mergeDiff(diffRes);
                $scope.descriptionDiff = mergeRes.code;
            } else if ($scope.task.data.promptType == 'TESTCASE_CHANGED') {
                var diffRes = JsDiff.diffLines($scope.task.data.oldFunctionDescription,$scope.task.data.newFunctionDescription);
                var mergeRes = mergeDiff(diffRes);
                $scope.descriptionDiff = mergeRes.code;
            }

            

            // news.functionUnderTest.$loaded().then(function(){

            //     news.editorCode = functionsService.renderDescription(news.functionUnderTest)+news.functionUnderTest.header;
            // });

            // //test case
            // news.testcases=[{}];
            // news.testcases[0].text=news.microtask.owningArtifact;
            // //test
            // news.test = news.microtask.submission;

        },
        'WriteFunctionDescription': function($scope) {

            // news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;
        },
        'WriteCall': function($scope) {

            // news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;

        },
        'DebugTestFailure': function($scope) {

            //news.editorCode = functionsService.renderDescription(news.microtask.submission) + news.microtask.submission.header + news.microtask.submission.code;

        },
        'Review': function($scope) {

            // news.microtask = microtasksService.get(news.microtask.microtaskKeyUnderReview);
            // news.microtask.$loaded().then(function() {

            //     loadData[news.microtask.type](news);

            // });
        }

    };

    var eventsRef = new Firebase( firebaseUrl + '/history/events' );

    var mtaskKey = $stateParams.microtaskKey;
    $scope.task = undefined;
    $scope.events = [];

    Microtasks.$loaded().then(function(){
        $scope.task = Microtasks.$getRecord(mtaskKey);
        $scope.json = angular.toJson( $scope.task, true );
        loadData[$scope.task.data.type]($scope);
    });    

    $scope.aceLoaded = function(_editor) {
        ace.initialize(_editor);
        _editor.setOptions({
             maxLines: Infinity
        });
    };
}]);



function mergeDiff(diffObjs){
  var merged = '';
  var diffed = false;
  var added, removed;
  added = removed = 0;

  angular.forEach(diffObjs,function(diffLine,index){
    var prefix = diffLine.added ? '+':
                 diffLine.removed ? '-' : '';

    if( prefix != '' ) {
      diffed=true;
    }

    var lines = diffLine.value.split('\n');
    lines.forEach(function(val){
      if( diffLine.added   ) added   ++;
      if( diffLine.removed ) removed ++;

      merged += prefix + val + '\n';
    });

  });


  return {
    diffed : diffed,
    added  : added,
    removed: removed,
    code   : merged
  };
}

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:microtasks
 * @description
 * # microtasks 
 * microtasks data service
 */
 var snaps = undefined;
angular.module('crowdAdminApp')
.factory("Microtask", function($firebaseUtils) {
    function Microtask(snap) {
        this.$id = snap.key();
        this.update( snap.val() );
        this.events = [];
        this.setStatus('none');
    }

    Microtask.prototype = {
        update: function(data) {
            var oldData = angular.extend({}, this.data);
            this.data   = data;
            return !angular.equals(this.data, oldData);
        },

        getStatus: function(){
            return this.status;
        },

        setStatus: function(newStatus){
            this.status = newStatus;
        },

        addEvent: function(event){
            this.events.push( event );
        },


        updateStats2: function(stats){
          // update the stats 
          if( ! stats.hasOwnProperty('numFinished') ){
            stats.numFinished   = 0;
            stats.avgFinishTime = 0;
            stats.totalTime     = 0;
            stats.finishByType  = {};
          }

          if( ! ['completed','accepted','rejected','reissued'].indexOf(this.status) ){
              stats.numFinished++;
          }
        },

        updateStats: function(stats){

          if( ! stats.hasOwnProperty('numFinished') ){
            stats.numFinished   = 0;
            stats.avgFinishTime = 0;
            stats.totalTime     = 0;
            stats.finishByType  = {};
          }

          // update the stats 
          if( ! stats.hasOwnProperty( this.status ) )
            stats[ this.status ] = 1;
          else
            stats[ this.status ] ++;
          

          var lastEvent = this.events[this.events.length - 1];
          if( ['completed','in_review'].indexOf( this.status ) != -1 && !isNaN(this.completedIn) ){
              stats.avgFinishTime =  ( ( stats.avgFinishTime * stats.numFinished ) + this.completedIn ) / ( stats.numFinished + 1 )  ;
              stats.numFinished ++ ;
              stats.totalTime += this.completedIn;

              if( ! stats.finishByType.hasOwnProperty( this.data.type ) ){
                stats.finishByType[this.data.type] = {  
                  numFinished   : 1,
                  avgFinishTime : this.completedIn,
                  totalTime     : this.completedIn
                }
              } else {
                stats.finishByType[this.data.type].avgFinishTime =  ( ( stats.finishByType[this.data.type].avgFinishTime * stats.finishByType[this.data.type].numFinished ) + this.completedIn ) / ( stats.finishByType[this.data.type].numFinished + 1 )  ;
                stats.finishByType[this.data.type].numFinished ++ ;
                stats.finishByType[this.data.type].totalTime += this.completedIn;
              }

          }
              
        },

        handleEvent: function( event, stats){
            if( event.microtaskKey == this.$id ){
                switch( event.eventType ){
                    case 'microtask.spawned': 
                        this.spawnedAt = event.timeInMillis;
                        this.setStatus('spawned');
                        break;
                    case 'microtask.assigned': 
                        this.assignedAt = event.timeInMillis;
                        this.setStatus('assigned');
                        break;
                    case 'microtask.skipped': 
                       // this.submittedAt = event.timeInMillis;
                        this.setStatus('skipped');
                        this.assignedAt = '';
                        break;
                    case 'microtask.submitted': 
                        this.completedAt = event.timeInMillis;
                        this.completedIn = this.completedAt - this.assignedAt;
                        this.setStatus('completed');
                    default:

                }
                this.updateStats( stats );
                this.addEvent( event );
            }
        },

        toJSON: function() {
            return $firebaseUtils.toJSON(this.data);
        }
    };

    return Microtask;
})

.factory('MicrotaskFactory', [ '$FirebaseArray', '$filter', 'Microtask', function( $FirebaseArray, $filter, Microtask ){

    var stats = {};
    var statsReady = false;

    return $FirebaseArray.$extendFactory({
        stats: {},
        statsReady : false,

        handleEvent: function( event ){
          var _this = this;
          if( _this == undefined )
            _this.stats = {};

          if( event.microtaskKey != undefined ){
            var key = event.microtaskKey ;
            var microtask = _this.$getRecord( key );
            if( microtask != null )
              microtask.handleEvent( event, _this.stats );
          }
        },

        handleEvents: function( events ){
          var _this = this;
          if( _this == undefined )
            _this.stats = {};

          statsReady = false;
          angular.forEach(events,function(event,key){
            if( event.microtaskID != undefined && event.artifactID != undefined ){
              var key = event.artifactID + '-' + event.microtaskID ;
              var microtask = _this.$getRecord( key );
              if( microtask != null )
                microtask.handleEvent( event, _this.stats );
            }
          });
          _this.statsReady = true;
        },

        getStats: function(){
          return this.stats;
        },

        getStatsReady: function(){
          return this.statsReady;
        },


        // change the added behavior to return Microtask objects
        $$added: function(snap) {
          return new Microtask(snap);
        },

        // override the update behavior to call Microtask.update()
        $$updated: function(snap) {
          var microtask = this.$list.$getRecord(snap.key());
          return microtask.update(snap.val());
        }
    });
}]) 

.service('Microtasks', [ '$firebase', '$filter', 'MicrotaskFactory', 'firebaseUrl',function ($firebase, $filter, MicrotaskFactory, firebaseUrl){
    var syncArray = null;

    if(syncArray==null){
      var mtaskRef  = new Firebase(firebaseUrl+'/microtasks');
      var mtaskSync = $firebase( mtaskRef, { arrayFactory: MicrotaskFactory } );
      var syncArray = mtaskSync.$asArray();
    }
    else
      console.log('mtasks already loaded');
  
    return syncArray;
}]);


    


  
angular
    .module('crowdAdminApp')
    .controller('QuestionsCtrl',[
    '$firebase', 
    '$scope',
    'firebaseUrl',
    function( $firebase, $scope, firebaseUrl ){
         
        console.log(firebaseUrl);
    var questionsRef = $firebase(new Firebase( firebaseUrl + '/questions' ));
    $scope.questions = questionsRef.$asArray();
    $scope.questions.$loaded().then(function(){
        console.log('questions loaded',$scope.questions);
    });

}]);
'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('TestsCtrl', [ '$sce', '$firebase', '$filter', 'firebaseUrl', 'Functions', 'Tests', 'Microtasks',  
    function ($sce, $firebase, $filter, firebaseUrl, Functions, Tests, Microtasks) {
  	
    var vm = this;

    var functions          = Functions.all();
    var tests              = Tests.all();

    functions.$loaded().then(function(){
      tests.$loaded().then(function(){
        vm.tests = {};
        angular.forEach(functions,function( value, index){
          vm.tests[value.name] = Tests.filter({ functionName: value.name });
        })
      });
    });
    

    // ace 
    vm.aceLoaded      = aceLoaded;

    vm.renderHtml = function(html_code){
        return $sce.trustAsHtml(html_code);
    };

    function requestTestRun(){
      var tRef        = new Firebase(firebaseUrl+'/status/testJobQueue/'+vm.selectedFunctionId);
      tRef.set({functionId:vm.selectedFunctionId});
    }

    function toggleDiffView(){
      vm.diffView = !vm.diffView;
    }

    function aceLoaded(_editor) {
        ace.initialize(_editor);
        _editor.setOptions({
             maxLines: Infinity
        });
    }
  }

  ]);

'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.service:artifacts
 * @description
 * # artifacts 
 * artifacts data service
 */
angular.module('crowdAdminApp')
.service("Tests", ["$FirebaseArray", "$firebase", '$filter', 'firebaseUrl', function($FirebaseArray, $firebase, $filter, firebaseUrl) {

    var ref        = new Firebase(firebaseUrl+'/artifacts/tests');
    var historyRef = new Firebase(firebaseUrl+'/history/artifacts/tests');
    var sync       = $firebase(ref);
    var syncArray  = sync.$asArray(); 
    

    var service = {

    	all : function(){
    		return syncArray;
    	},

    	filter: function(filterParameters){
    		return $filter('filter')(syncArray,filterParameters);
    	},

        get: function(id,version){
            if( version === undefined ){
                return syncArray.$getRecord(id);
            } else {
                var funcSync = $firebase( historyRef.child(id).child(version) );
                return funcSync.$asObject();
            }
        },

        getCode: function(){
            var allCode = "";
            angular.forEach(syncArray,function(test,index){
                allCode += test.code + '\n';
            });
            return allCode;
        }


    };

    return service;
}]);
'use strict';

/**
 * @ngdoc function
 * @name crowdAdminApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the crowdAdminApp
 */
angular.module('crowdAdminApp')
  .controller('UsersCtrl', ['$scope', '$firebase', 'firebaseUrl', function ($scope, $firebase, firebaseUrl) {

    var sync = $firebase(new Firebase(firebaseUrl+'/workers'));
  	$scope.users = sync.$asArray();

  }]);

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
