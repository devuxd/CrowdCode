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
