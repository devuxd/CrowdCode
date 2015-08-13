angular
	.module('crowdCode')
	.controller("Dashboard",['$scope','$rootScope','$firebase','$firebaseArray','$timeout','microtasksService','firebaseUrl','workerId',  
                                 function($scope,$rootScope,$firebase,$firebaseArray,$timeout,microtasksService,firebaseUrl, workerId){
	
	$scope.availableMicrotasks = [];
	
	var types = [
			'Review',
			'DescribeFunctionBehavior',
			'ImplementBehavior',
			'ChallengeReview'
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
	
	
	$scope.microtaskQueue = [];
	
	// load microtasks
	var microtasksRef  = new Firebase(firebaseUrl+'/status/microtaskQueue/queue');
	$scope.microtaskQueue = $firebaseArray(microtasksRef);
	$scope.microtaskQueue.$loaded().then(function(){
	});	
	
	$scope.reviewQueue = [];
	
	// load microtasks
	var microtasksRef  = new Firebase(firebaseUrl+'/status/reviewQueue/queue');
	$scope.reviewQueue = $firebaseArray(microtasksRef);
	$scope.reviewQueue.$loaded().then(function(){
	});	
	

	
	$scope.microtasks = [];
	
	// load microtasks
	var microtasksRef  = new Firebase(firebaseUrl+'/microtasks/');
	var microtasksSync = $firebaseArray(microtasksRef);
	$scope.microtasks = microtasksSync;
	$scope.microtasks.$loaded().then(function(){
	});	

	$scope.microtasks.$watch(function(event){
		var task = $scope.microtasks.$getRecord(event.key)
		switch(event.event){
			case 'child_added':{
				if(task.excluded != null){
	           		if(task.excluded.search(workerId) === -1) 
	           			$scope.typesCount[task.type]++
	            } 
	            else{
	            	$scope.typesCount[task.type]++
	            }
			}
				break;
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

	$scope.assignMicrotask = function(task){
		console.log('assigning '+task.$id);
		$rootScope.$broadcast('fetchSpecificMicrotask',  task.$id );
	}

}]);

angular
.module('crowdCode')
.filter('canChoose', function () {
return function (microtasks,microtaskQueue,reviewQueue, availableMicrotasks) {
	availableMicrotasks = [];
	var items = {
    	out: []
    };
    angular.forEach(microtasks, function (value, key) {
    	var available = false;
    	for(var i=0;i<microtaskQueue.length;i++){
    		if(value.$id == microtaskQueue[i].$value){
    			available = true;
    			availableMicrotasks.push(value);
    		}    			
    	}
    	if(!available){
	    	for(var i=0;i<reviewQueue.length;i++){
	    		if(value.$id == reviewQueue[i].$value){
	    			availableMicrotasks.push(value);
	    			available = true;
	    		}
	    	}
    	}
    	if(available){
    	//if (value.assigned != true && value.completed != true && value.waitingReview != true) {
           	if(value.excluded != null){
           		if(value.excluded.search(workerId) === -1) 
           			this.out.push(value);
            } 
            else{
            	this.out.push(value);
            }
      //  } 
    	}
    }, items);
    return items.out;
};
}); 

angular
	.module('crowdCode')
	.filter('assigned', function () {
    return function (microtasks,availableMicrotasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        	if(availableMicrotasks.indexOf(value) == -1){
	            if (value.assigned == true && value.completed != true && value.waitingReview != true) {
	                this.out.push(value);
	            }
        	}
        }, items);
        return items.out;
    };
});

angular
	.module('crowdCode')
	.filter('waitingReview', function () {
    return function (microtasks,availableMicrotasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        if(availableMicrotasks.indexOf(value) == -1){
            if (value.waitingReview == true && value.review == undefined) {
                this.out.push(value);
            }
        }	
        }, items);
        return items.out;
    };
});

angular
	.module('crowdCode')
	.filter('completed', function () {
    return function (microtasks,availableMicrotasks) {
		var items = {
        	out: []
        };
        angular.forEach(microtasks, function (value, key) {
        	if(availableMicrotasks.indexOf(value) == -1){
	            if (value.completed === true) {
	                this.out.push(value);
	            }
        	}
        }, items);
        return items.out;
    };
});

angular
	.module('crowdCode')
	.filter('byType', function () {
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


