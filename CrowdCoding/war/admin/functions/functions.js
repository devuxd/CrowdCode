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
