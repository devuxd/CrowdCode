var boardApp = angular.module('crowdCode')//,["firebase","ui.bootstrap","ngAnimate"]);

boardApp.run();

boardApp.controller("dashBoard",['$scope','$rootScope','$firebase','$timeout','microtasksService','firebaseUrl',  function($scope,$rootScope,$firebase,$timeout,microtasksService,firebaseUrl){
	console.log("controller loaded");
	
	var projectURL = firebaseUrl;

	var types = [
			'Review',
			'DebugTestFailure',
			'ReuseSearch',
			'WriteFunction',
			'WriteFunctionDescription',
			'WriteTest',
			'WriteTestCases',
			'WriteCall',
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
		
	$scope.microtasks = [];
	
	// load microtasks
	var microtasksRef  = new Firebase(projectURL+'/microtasks/');
	var microtasksSync = $firebase(microtasksRef);
	$scope.microtasks = microtasksSync.$asArray();
	$scope.microtasks.$loaded().then(function(){
		console.log($scope.microtasks);
	});	

	$scope.microtasks.$watch(function(event){
		var task = $scope.microtasks.$getRecord(event.key)
		switch(event.event){
			case 'child_added': if(task.assigned==false) $scope.typesCount[task.type]++; break;
			case 'child_changed': if(task.assigned==true) $scope.typesCount[task.type]--; break;
			default: 
		}
		console.log($scope.typesCount[task.type]);
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
	
	// load functions
	var functionsRef  = new Firebase(projectURL+'/artifacts/functions');
	var functionsSync = $firebase(functionsRef);
	$scope.functions = functionsSync.$asArray();
	$scope.functions.$loaded().then(function(){
		console.log($scope.functions);
	});
		
	$scope.funcNames = []
	$scope.funcNames = $scope.microtasks;
	$scope.funcNames.keyAt = function(functionID){
		for(var i=0;i<$scope.functions.length;i++)
			if($scope.functions[i].id == functionID){
				return i;
			}
		return -1;
	};
	
	$scope.getFuncName = function(index){
		num = $scope.funcNames.keyAt($scope.microtasks[index].functionID);
		if(num >= 0)
			return $scope.functions[num].name;
		return 'blank';
	}


	// load tests
	var testsRef  = new Firebase(projectURL+'/artifacts/tests');
	var testsSync = $firebase(testsRef);
	$scope.tests = testsSync.$asArray();
	$scope.tests.$loaded().then(function(){
		console.log($scope.tests);
	});
	

	$scope.spawnRandom = function(){
		$scope.microtasks.$add({
			id: $scope.microtasks.length+1 ,
			type: types[Math.floor(Math.random()*8)],
			points: Math.floor(Math.random()*10),
			assigned: false,
			completed: false
		})
		return false;
	}
	
	$scope.assignMicrotask = function(task){
		var microtaskID = task.owningArtifactId+"-"+task.id;
		$rootScope.$broadcast('fetchSpecificMicrotask',{microtaskID});
	}

	$scope.assignRandom = function(){

		var key, task,counter = 0;
		do {
			key = Math.floor(Math.random()*$scope.microtasks.length);
			task = $scope.microtasks[key];
			console.log("task assigned: "+task.assigned);
		} while(task.assigned==true || counter++ < 5);
		
		if(counter >= 5){

			task.assigned = true;
			$scope.microtasks.$save(task);
		}
		else console.log("error submitting random microtask");
		
		return false;
	}

	$scope.intervalSlider = {
		min: 500,
		max: 900
	};

	$scope.$watch('intervalSlider',function(){

   			console.log($scope.intervalSlider);
	})

	var promise = null;
    $scope.runAction =  function(){
		actionRunning = true;

		// 
		var actionProbability = Math.random();
		if(actionProbability<0.7){
			$scope.spawnRandom();
		}else{
			$scope.assignRandom();
		}




		// calc time for timeout
		var interval  = parseInt($scope.intervalSlider.max)-parseInt($scope.intervalSlider.min);
		var randomNum = Math.floor(Math.random()*interval);
		var milliSec  = randomNum + parseInt($scope.intervalSlider.min);

		console.log("do action! time: "+milliSec);//+"- interval: "+interval+" - random: "+randomNum+" - min: "+$scope.intervalSlider.min+" - max: "+$scope.intervalSlider.max);
    	promise = $timeout($scope.runAction,milliSec);
    }
    $scope.stopAction = function(){
		if(promise!=null){
			$timeout.cancel(promise);
			promise = null;
		}
    }
     

}]);

boardApp.filter('nonAssigned', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (value.assigned != true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});

boardApp.filter('Assigned', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (value.assigned == true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});

boardApp.filter('Completed', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (value.completed == true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});

boardApp.filter('byType', function () {
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
