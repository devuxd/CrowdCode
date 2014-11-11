

////////////////////
//FUNCTIONS SERVICE   //
////////////////////
myApp.factory('mocksService', ['$rootScope','$firebase', function($rootScope,$firebase) {

	var service = new function(){

		// mocks are archived by "functionName" => mocksForFunctionName[]
		// example mock for function SUM = { "inputs" => [ 1 , 2 ], "output": 3 }
		var ref = null;
		this.mocks = [];


		// retrieve the mocks from firebase
		this.init = function()
		{
		    // hook from firebase all the functions declarations of the project
			ref = $firebase(new Firebase($rootScope.firebaseURL+'/artifacts/mocks'));
			this.mocks = ref.$asArray();
			this.mocks.$loaded().then(function(){ $rootScope.loaded.mocks=true; });
		}

		// return all mocks
		this.getAll = function(){
			return this.mocks;
		}


		this.formatMock = function(firebaseMock){
			var obj = {};
			return {
				//funfirebaseMock.functionName
			}
		}

		this.getAllByInputs = function(inputsValue,functionNames){
			var mocksByInputs = [];
			angular.forEach(functionsNames,function(functionName){
				var mock = this.get(functionName,inputsValue);
				if( mock == null ){
					mock = {inputs: inputsValue, output: 0 }
				}
				mocksByInputs[functionName] = mock;
			})
			return mocksByInputs;
		}

		// return all mocks for a function name
		this.getAllByFunctionName = function(functionName){
			var mocksByFunction = [];
			angular.forEach(this.mocks,function(mock,key){
				if( key === parseInt(key, 10) != '$' && mock.functionName == functionName )
					mocksByFunction.push(mock);
			})
			return mocksByFunction;
		}

		// return the mock for the function functionName with inputsValue if exists,
		// return null otherwise
		this.get = function(functionName,inputsValue){

			var found      = false;
			var returnMock = null;/*
			angular.forEach(this.mocks,function(mock,key){
				if( !found && key === parseInt(key, 10) && mock.functionName == functionName && mock.inputs.toString() == inputsValue.toString() ){
					found = true;
					returnMock = mock;
				}
			});*/
			return returnMock;
		}

		// if a mock for the functionName with inputsValue
		// doesn't exists, add it with outputValue to the mocks
		this.set = function(functionName,inputsValue,outputValue){
			var newMock = { functionName: functionName, inputs: inputsValue, output: outputValue };
			var mock =  this.get(functionName,inputsValue) 
			if( mock == null  ){
				ref.$push(mock);	
			} else {
				mock[inputs] = newMock.inputs;
				mock[output] = newMock.output;
				ref.$update(mocks.$keyAt(mock),mock);
			}
			
		}

	}

	return service;
}]);