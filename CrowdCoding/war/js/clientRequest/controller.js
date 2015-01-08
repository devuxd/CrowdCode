////////////////////
// APP CONTROLLER //
////////////////////
//prepare variables and execute inizialization stuff
clienRequestApp.controller('ClientRequestController', ['$scope','$rootScope','$firebase','$alert', function($scope,$rootScope,$firebase,$alert) {

	console.log("sono chiamato");


	var firebaseURL = 'https://crowdcode.firebaseio.com';
	var firebaseRef;


	// User stories are numbered from 0 to userStoryCount - 1 (as are ADTs).
	$scope.ADTs = [];
	$scope.functions = [];
	$scope.projectName="";
	$scope.addADT=function(){
		var emptyAdt={	description:	"",
						name: 			"",
						structure:      [{ name:"",	type:""	}],
						examples:      [{ name:"",	value:"" }]
					 };

		$scope.ADTs.push(emptyAdt);
	};

	$scope.deleteADT=function(index)
	{
		$scope.ADTs.splice(index,1);
	};


	$scope.addStructure=function(ADTindex)
	{
		$scope.ADTs[ADTindex].structure.push({name:"",type:""});
	};

	$scope.deleteStructure=function(ADTindex,structureIndex)
	{
		if($scope.ADTs[ADTindex].structure.length>1)
			$scope.ADTs[ADTindex].structure.splice(structureIndex,1);
	};

	$scope.addExample=function(ADTindex)
	{
		$scope.ADTs[ADTindex].examples.push({name:"",value:""});
	};

	$scope.deleteExample=function(ADTindex,exampleIndex)
	{	
		if($scope.ADTs[ADTindex].examples.length>1)
			$scope.ADTs[ADTindex].examples.splice(exampleIndex,1);
	};

	$scope.addFunction=function()
	{
		var emptyFunction={		code:  			"{\n\t//#Mark this function as implemented by removing this line.\n\treturn {}; \n}",
								description:    "",
								readOnly: true,
								name:           "",
								paramDescriptions:[""],
								paramNames:       [""],
								paramTypes:       [""],
								returnType:       "",
								tests: 		  []
							};


		$scope.functions.push(emptyFunction);
	};

	$scope.deleteFunction=function(index)
	{
		$scope.functions.splice(index,1);
	};


	$scope.addParameter = function(index){

			$scope.functions[index].paramNames.push("");
			$scope.functions[index].paramTypes.push("");
			$scope.functions[index].paramDescriptions.push("");
	};


	$scope.deleteParameter = function(functionIndex, parameterIndex){
		$scope.functions[functionIndex].paramNames.splice(parameterIndex,1);
		$scope.functions[functionIndex].paramTypes.splice(parameterIndex,1);
		$scope.functions[functionIndex].paramDescriptions.splice(parameterIndex,1);

	};

	$scope.addTest = function(index){

			$scope.functions[index].tests.push({	readOnly: true,
													description: "",
													simpleTestInputs:      [""],
													simpleTestOutput:      "" });
	};


	$scope.deleteTest = function(functionIndex, testIndex){
		$scope.functions[functionIndex].tests.splice(testIndex,1);
	};


	$scope.submit=function(form){
		angular.forEach(form, function(formElement, fieldName) {
		           // If the fieldname doesn't start with a '$' sign, it means it's form
		           if (fieldName[0] !== '$') {
		               formElement.$dirty = true;
		           }
		           //if formElement as the proprety $addControl means that have other form inside him
		           if (formElement !== undefined && formElement.$addControl) {
		               angular.forEach(formElement, function(formElement, fieldName) {
		                   // If the fieldname starts with a '$' sign, it means it's an Angular
		                   // property or function. Skip those items.
		                   if (fieldName[0] !== '$') {
		                       formElement.$dirty = true;
		                   }
		                   //if formElement as the proprety $addControl means that have other form inside him
		                   if (formElement !== undefined && formElement.$addControl) {
		                       angular.forEach(formElement, function(formElement, fieldName) {
		                           // If the fieldname starts with a '$' sign, it means it's an Angular
		                           // property or function. Skip those items.
		                           if (fieldName[0] !== '$') {
		                               formElement.$dirty = true;
		                           }
		                       });
		                   }
		               });
		           }
		       });
		       if (form.$invalid) {
		           var error = 'Fix all errors before submit';
		           $alert({
		               title: 'Error!',
		               content: error,
		               type: 'danger',
		               show: true,
		               duration: 3,
		               template: '/html/templates/alert/alert_submit.html',
		               container: 'alertcontainer'
		           });
		       } else {
					var projectSync = $firebase(new Firebase(firebaseURL+'/clientRequests/'+$scope.projectName));
					project = projectSync.$asObject();
					project.$loaded().then(function(){

						angular.forEach($scope.functions,function(funct,key){

							funct.header='function '+funct.name+'('+funct.paramNames.join(", ")+')';

							angular.forEach(funct.tests,function(test,key){
								var testCode = 'equal(' + funct.name + '(';
								angular.forEach(test.simpleTestInputs, function(input, key) {
								    testCode += input;
								    testCode += (key != test.simpleTestInputs.length - 1) ? ',' : '';
								});
								testCode += '),' + test.simpleTestOutput + ',\'' + test.description + '\');';
								test.code=testCode;
							});
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

	};


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
	};


}]);