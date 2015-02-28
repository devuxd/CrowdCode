
// create the test list
angular
    .module('crowdCode')
    .factory("TestList", ['$firebase','firebaseUrl','TestFactory', function($firebase, firebaseUrl, TestFactory) {
	var ref = new Firebase(firebaseUrl+'/artifacts/tests');
	return $firebase(ref, {arrayFactory: "TestFactory"}).$asArray();
}]);


angular
    .module('crowdCode')
    .factory("TestFactory",['$FirebaseArray', '$firebaseUtils', '$firebase', 'Test', 'firebaseUrl', function( $FirebaseArray, $firebaseUtils, $firebase, Test, firebaseUrl){

	var lastId = 0;
	var objectsList = {};
	var count = 0;

	return $FirebaseArray.$extendFactory({

		// override $$added method of AngularFire FirebaseArray factory
		$$added: function(snap, prevChild) {
			var i = this.$indexFor(snap.name());
			if( i === -1 ) {

				var rec = snap.val();
				if( !angular.isObject(rec) ) {
					rec = { $value: rec };
				}
				rec.$id = snap.name();
				rec.$priority = snap.getPriority();
				$firebaseUtils.applyDefaults(rec, this.$$defaults);

				this._process('child_added', rec, prevChild);

				// add the object to our list
				objectsList[ snap.name() ] = new Test( snap.val() );
				if( parseInt(snap.name()) > lastId)
					lastId = parseInt(snap.name());

				count++;
			}
		},

		// override $$updated method of AngularFire FirebaseArray factory
		$$updated: function(snap) {
			var rec = this.$getRecord( snap.name() );
			if( angular.isObject(rec) ) {
				// apply changes to the record
				var changed = $firebaseUtils.updateRec(rec, snap);
				$firebaseUtils.applyDefaults(rec, this.$$defaults);
				if( changed ) {
					this._process('child_changed', rec);

					// UPDATE THE OBJECT IN OUR LIST
					objectsList[ snap.name() ].update( snap.val() );
				}
			}
		},

		// retrieve the test with id = testId
		get: function(testId){
			if( objectsList.hasOwnProperty(testId) ){
				return objectsList[testId];
			}
			return null;
		},

		// retrieve all the tests
		getAll: function(){
			return objectsList;
		},
		getImplementedByFunction: function(funct){
			return this.getImplementedByFunctionId(funct.id);
		},
		// retrieve all the tests belonging to
		// the function with id = functionId
		getImplementedByFunctionId: function(functionId){
			var returnList = [];
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionId() == functionId && test.isImplemented()){
					returnList.push(test);
				}	
			});

			return returnList;
		},
		// retrieve all the tests belonging to
		// the function with name = functionName
		getImplementedByFunctionName: function(functionName){
			var returnList = [];
			angular.forEach( objectsList, function(test, key){
				if( test.getFunctionName() == functionName  && test.isImplemented())
					returnList.push(test);
			});
			return returnList;
		},
		// retrieve all the tests belonging to
		// the function funct
		getByFunction: function(funct){
			this.getByFunctionId(funct.id);
		},

		// retrieve all the tests belonging to
		// the function with id = functionId
		getByFunctionId: function(functionId){
			var returnList = [];
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionId() == functionId )
					returnList.push(test);
			});

			return returnList;
		},
		// retrieve all the tests belonging to
		// the function with name = functionName
		getByFunctionName: function(functionName){
			var returnList = [];
			angular.forEach( objectsList, function( test, key){
				if( test.getFunctionName() == functionName )
					returnList.push(test);
			});
			return returnList;
		},

		// search a test belonging for the function functionName
		// and inputsValue
		search: function(functionName,inputsValue){
			// if one of the parameters is undefined, return null
			if(inputsValue === undefined || functionName === undefined)
				return null;

			// filter objectsList
			// return null if not found
			var foundTest = null;
			var found     = false;
			angular.forEach( objectsList, function( test, key){
				if( !found && test.getFunctionName() == functionName && 
				    test.hasSimpleTest() && 
					angular.toJson(test.getSimpleTest().inputs.toString()) == angular.toJson(inputsValue.toString()) ){
					found = true;
					foundTest = test;
				}
			});
			return foundTest;
		},

		// add a test to the factory
		// 1) search if already exists - there can't be two tests for the same function and with the same inputs
        // add to the list of FirebaseArray
		set: function(test){ 
			var rec = test.toJSON();
				// console.log(rec);
			var ref = new Firebase(firebaseUrl+'/artifacts/tests/'+test.getId());
			ref.set(rec);
		},


		searchOrBuild: function(functionId, functionName, inputsValue, outputValue){
			if( this.search(functionName, inputsValue) === null ) {
				test = new Test();

				test.setFunctionId( functionId );
			    test.setFunctionName( functionName );
				test.setDescription("auto generated for debug purposes");
			 	test.setSimpleTest(inputsValue,outputValue);
				test.buildCode();

				return test.rec;
			}
			return true;
		},

		searchAndAdd: function(functionId, functionName, inputsValue, outputValue){
			var test = this.search(functionName, inputsValue);

			if( test === null ){
				test = new Test();
				test.setId(++lastId);

				test.setImplemented(true);
				test.setMessageType("Test in firebase");
				test.setFunctionId( functionId );
			    test.setFunctionName( functionName );
			 	test.setSimpleTest(inputsValue,outputValue);
				test.setDescription("auto generated for test purposes");
				test.buildCode();
				this.set(test);
			}
			else console.log("TEST FOUND");
		},

		buildStubsByFunctionName: function(functionName){
			var tests = this.getByFunctionName(functionName);
			var stubs = {};

			angular.forEach(tests,function(test){
				if( test.hasSimpleTest() ){
					
					var outputs = JSON.parse(test.rec.simpleTestOutput);

					var inputsKey = "["+test.rec.simpleTestInputs+"]";
					//inputsKey = inputsKey.replace(/"/g, '');
					// angular.forEach(test.rec.simpleTestInputs, function(value,key){
					// 	inputsKey[JSON.stringify(key)] = value;				
					// });

					//inputsKey = JSON.stringify(test.rec.simpleTestInputs);

					//console.error("LOADING STUB FOR "+inputsKey,test.rec.simpleTestInputs);

					stubs[ inputsKey ] = { 
						  inputs: test.rec.simpleTestInputs, 
					      output: outputs
					};

				}
			});

			return stubs;
		},

		getTestCasesByFunctionId: function( functionId ){

		    var tests = this.getByFunctionId(functionId);
		    var testCases = [];

		    // for each test push the test case entry in the test cases list
		    angular.forEach(tests, function(test, index) {
		        testCases.push( test.getTestCase() );
		    });

		    return testCases;
		},

		getCount: function(){
			return count;
		}

	});
}]);

angular
    .module('crowdCode')
    .factory("Test", function ($FirebaseArray) {
	function Test(rec){
		if( rec === undefined )
			this.rec = {};
		else
			this.rec = rec;
	}

	Test.prototype = {
		getId: function(){
			return this.rec.id;
		},

		setId: function(id){
			this.rec.id  = id;
		},

		update: function(rec){
			this.rec = rec;
		},

		isImplemented: function(){
			return this.rec.isImplemented;
		},

		setImplemented: function(value){
			this.rec.isImplemented = value;
		},

		setMessageType: function(messageType){
			this.rec.messageType = messageType;
		},

		toJSON: function(){
			return this.rec;
		},

		getFunctionId: function(){
			return this.rec.functionID;
		},

		setFunctionId: function(functionId){
			this.rec.functionID = functionId;
		},

		getFunctionName: function(){
			return this.rec.functionName;
		},

		setFunctionName: function(functionName){
			this.rec.functionName = functionName;
		},

		getDescription: function(){
			return this.rec.description;
		},

		setDescription: function(description){
			this.rec.description = description;
		},


		getReadOnly: function(){
			return this.rec.readOnly;
		},

		setReadOnly: function(readOnly){
			this.rec.readOnly = readOnly;
		},

		hasSimpleTest: function(){
			if( this.rec.hasOwnProperty('simpleTestInputs') && this.rec.hasOwnProperty('simpleTestOutput') )
				return true;
			return false;
		},

		getSimpleTest: function(){
			if( !this.hasSimpleTest() )
				return {};

			return { 
				inputs: this.rec.simpleTestInputs, 
				output: this.rec.simpleTestOutput 
			}
		},

		getTestCase: function(){
			return {
	            id       :   this.getId(),
	            text     : this.getDescription(),
	            readOnly : this.getReadOnly(),
	            added    : false,
	            deleted  : false,
	        };
		},

		setSimpleTest: function(inputs,output){
			angular.forEach(inputs,function(input){
				input = '"'+JSON.stringify(input).replace(/"/g, '\"')+'"';
			})
			this.rec.simpleTestInputs = inputs;
			this.rec.simpleTestOutput = output;
			this.rec.hasSimpleTest = true;
		},

		getCode: function(){
			return this.rec.code;
		},
		setCode: function(code){
			this.rec.code = code;
		},

		buildCode: function(){

			if( ! this.rec.isImplemented )
				return '';
			
			var testCode = 'equal(' + this.rec.functionName + '(';
			var length   = this.rec.simpleTestInputs.length;

            angular.forEach(this.rec.simpleTestInputs, function(value, key) {
                testCode += JSON.stringify(value).replace(/"/g, '');
                testCode += (key != length - 1) ? ',' : '';
            });
            testCode += '),' + this.rec.simpleTestOutput + ',\'' + this.rec.description + '\');';

			this.rec.code = testCode;
		}
	};

	return Test;
});

