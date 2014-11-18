////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
clienRequestApp.controller('ClientRequestController', ['$scope','$rootScope','$firebase', function($scope,$rootScope,$firebase) {

	console.log("sono chiamato");


	var firebaseURL = 'https://crowdcode.firebaseio.com';
	var firebaseRef;


	// User stories are numbered from 0 to userStoryCount - 1 (as are ADTs).
	$scope.ADTs = [];
	$scope.functions = [];
	$scope.projectName="";
	$scope.addADT=function(){
		var emptyAdt={	description:"",
						name:"",
						structure:[{
									name:"",
									type:""
									}]
						}

		$scope.ADTs.push(emptyAdt);
	}

	$scope.deleteADT=function(index)
	{
		$scope.ADTs.splice(index,1);
	}


	$scope.addStructure=function(ADTindex)
	{
		$scope.ADTs[ADTindex].structure.push({name:"",type:""});
	}

	$scope.deleteStructure=function(ADTindex,structureIndex)
	{
		$scope.ADTs[ADTindex].structure.splice(structureIndex,1);
	}

	$scope.addFunction=function()
	{
		var emptyFunction={		code:"{\n\t//#Mark this function as implemented by removing this line.\n\treturn {}; \n}",
								description:"",
								name:"",
								paramDescriptions:[""],
								paramNames:[""],
								paramTypes:[""],
								returnType:""
							}


		$scope.functions.push(emptyFunction);
	}

	$scope.deleteFunction=function(index)
	{
		$scope.functions.splice(index,1);
	}


   // addParameter and deleteParameter utils function for microtask WRITE FUNCTION DESCRIPTION
	$scope.addParameter = function(index){

			console.log("add parameter index "+index );
			console.log($scope.functions);
			$scope.functions[index].paramNames.push("");
			$scope.functions[index].paramTypes.push("");
			$scope.functions[index].paramDescriptions.push("");
	}


	$scope.deleteParameter = function(functionIndex, parameterIndex){
		$scope.functions[functionIndex].paramNames.splice(parameterIndex,1);
		$scope.functions[functionIndex].paramTypes.splice(parameterIndex,1);
		$scope.functions[functionIndex].paramDescriptions.splice(parameterIndex,1);

	}



	$scope.submit=function(){

		var projectSync = $firebase(new Firebase(firebaseURL+'/clientRequests/'+$scope.projectName));
		project = projectSync.$asObject();
		project.$loaded().then(function(){

			angular.forEach($scope.functions,function(value,key){

				value.header='function '+value.name+'('+value.paramNames.join(", ")+')';
			});

			project.functions={};
			project.functions.functions=$scope.functions;

			angular.forEach($scope.ADTs,function(value,key){

				value.fullExample='var x = '+value.example+';';
			});

			project.ADTs= {};
			project.ADTs.ADTs=$scope.ADTs;


			project.$save();
			console.log("salvato");
		});
	}


	$scope.load=function()
	{

		var projectSync = $firebase(new Firebase(firebaseURL+'/clientRequests/'+$scope.projectName));
		project = projectSync.$asObject();
		project.$loaded().then(function(){

		if(angular.isDefined(project.functions))
			$scope.functions=project.functions.functions;
		else
			$scope.functions=[];

		if(angular.isDefined(project.ADTs))
			$scope.ADTs=project.ADTs.ADTs;
		else
			$scope.ADTs=[];

		});
	}


}]);