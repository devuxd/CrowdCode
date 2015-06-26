var boardApp = angular.module('crowdCode')

boardApp.run();

boardApp.controller("dashBoard",['$scope','$rootScope','$firebase','$timeout','microtasksService','firebaseUrl','workerId',  function($scope,$rootScope,$firebase,$timeout,microtasksService,firebaseUrl, workerId){
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
	});	

	$scope.microtasks.$watch(function(event){
		var task = $scope.microtasks.$getRecord(event.key)
		switch(event.event){
			case 'child_added': if(task.assigned==false) $scope.typesCount[task.type]++; break;
			case 'child_changed': if(task.assigned==true) $scope.typesCount[task.type]--; break;
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
	
	// load functions
	var functionsRef  = new Firebase(projectURL+'/artifacts/functions');
	var functionsSync = $firebase(functionsRef);
	$scope.functions = functionsSync.$asArray();
	$scope.functions.$loaded().then(function(){
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



}]);

boardApp.filter('assigned', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (value.assigned == true && value.completed != true && value.waitingReview == false) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});

boardApp.filter('waitingReview', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (value.waitingReview == true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});

boardApp.filter('canChoose', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        	if (value.assigned != true && value.completed != true && value.waitingReview != true) {
               	if(value.excluded != null){
               		if(value.excluded.search(workerId) === -1) 
               			this.out.push(value);
                } 
                else{
                	this.out.push(value);
                }
            }           
        }, items);
        return items.out;
    };
}); 

boardApp.filter('completed', function () {
    return function (microtasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
            if (value.completed === true) {
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


