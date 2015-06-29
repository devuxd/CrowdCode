
// create the test list
angular
    .module('crowdCode')
    .factory("TestList", ['$firebaseArray', 'firebaseUrl','TestFactory', function( $firebaseArray, firebaseUrl, TestFactory) {
	//var ref = new Firebase(firebaseUrl+'/artifacts/tests');
	//return $firebaseArray(ref, {arrayFactory: "TestFactory"});
	return {};
}]);


angular
    .module('crowdCode')
    .factory("TestFactory",['$firebaseArray', '$firebaseUtils',  'Test', 'firebaseUrl', function( $firebaseArray, $firebaseUtils,  Test, firebaseUrl){

	var lastId = 0;
	var testsList = {};
	var count = 0;

	// return $firebaseArray.$extend({

	// 	// override $$added method of AngularFire FirebaseArray factory
	// 	$$added: function(snap, prevChild) {
	// 		var i = this.$indexFor(snap.name());
	// 		if( i === -1 ) {

	// 			var rec = snap.val();
	// 			if( !angular.isObject(rec) ) {
	// 				rec = { $value: rec };
	// 			}
	// 			rec.$id = snap.name();
	// 			rec.$priority = snap.getPriority();
	// 			$firebaseUtils.applyDefaults(rec, this.$$defaults);

	// 			this._process('child_added', rec, prevChild);

	// 			// add the object to our list
	// 			testsList[ snap.name() ] = new Test( snap.val() );
	// 			if( parseInt(snap.name()) > lastId)
	// 				lastId = parseInt(snap.name());

	// 			count++;
	// 		}
	// 	},

	// 	// override $$updated method of AngularFire FirebaseArray factory
	// 	$$updated: function(snap) {
	// 		var rec = this.$getRecord( snap.name() );
	// 		console.log('updating test ',rec,(new Date()).getTime());
	// 		if( angular.isObject(rec) ) {
	// 			// apply changes to the record
	// 			var changed = $firebaseUtils.updateRec(rec, snap);
	// 			$firebaseUtils.applyDefaults(rec, this.$$defaults);
	// 			if( changed ) {
	// 				this._process('child_changed', rec);

	// 				// UPDATE THE OBJECT IN OUR LIST
	// 				testsList[ snap.name() ].update( snap.val() );
	// 			}
	// 		}
	// 	},

		function TestFactory(tests){

			if( tests === undefined || tests === null )
				testsList = {};
			else{
				for ( var key in tests ){
				testsList[key] = new Test( tests[key] );
				}
			}

		}

		TestFactory.prototype = {

		// retrieve the test with id = testId
		get: function(testId){
			if( testsList.hasOwnProperty(testId) ){
				return testsList[testId];
			}
			return null;
		},

		// retrieve all the tests
		getAll: function(){
			return testsList;
		},
		getImplementedByFunction: function(funct){
			return this.getImplementedByFunctionId(funct.id);
		},
		// retrieve all the tests belonging to
		// the function with id = functionId
		getImplementedByFunctionId: function(functionId){
			var returnList = [];
			console.log('searching implemented for fun'+functionId);
			angular.forEach( testsList, function( test, key){
				if( test.getFunctionId() == functionId && test.isImplemented() && ! test.isDeleted()){
					returnList.push(test);
				}	
			});

			return returnList;
		},
		getImplementedIdsByFunctionId: function(functionId){
			var returnList = [];
			angular.forEach( testsList, function( test, key){
				if( test.getFunctionId() == functionId && test.isImplemented() && ! test.isDeleted()){
					returnList.push( test.getId() );
				}	
			});
			return returnList;
		},
		// retrieve all the tests belonging to
		// the function with name = functionName
		getImplementedByFunctionName: function(functionName){
			var returnList = [];
			angular.forEach( testsList, function(test, key){
				if( test.getFunctionName() == functionName  && test.isImplemented() && ! test.isDeleted())
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
			angular.forEach( testsList, function( test, key){
				if( test.getFunctionId() == functionId && ! test.isDeleted())
					returnList.push(test);
			});

			return returnList;
		},
		// retrieve all the tests belonging to
		// the function with name = functionName
		getByFunctionName: function(functionName){
			var returnList = [];
			angular.forEach( testsList, function( test, key){
				if( test.getFunctionName() == functionName  && ! test.isDeleted())
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

			// filter testsList
			// return null if not found
			var foundTest = null;
			var found     = false;
			angular.forEach( testsList, function( test, key){
				if( !found && test.getFunctionName() == functionName && 
				    test.hasSimpleTest() &&
				     ! test.isDeleted() &&
 			        angular.toJson(test.getSimpleTest().inputs.toString()) == angular.toJson(inputsValue.toString()) ){
					found = true;
					foundTest = test;
				}
			});
			return foundTest;
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

		buildStubsByFunctionName: function(functionName){
			var tests = this.getByFunctionName(functionName);
			var stubs = {};

			angular.forEach(tests,function(test){
				if( test.hasSimpleTest() ){

					// the inputs in firebase are already stringified
					// so the key is just a copy of the string value
					// the output should be parsed instead!
					var inputsKey = "["+test.rec.simpleTestInputs+"]";

					stubs[ inputsKey ] = { 
						  inputs: test.rec.simpleTestInputs, 
					      output: test.rec.simpleTestOutput == "" ? "" : JSON.parse(test.rec.simpleTestOutput)
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
	};
	return TestFactory;
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

		isDeleted: function(){
			return this.rec.isDeleted;
		},

		setDeleted: function(value){
			this.rec.isDeleted = value;
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
	            id       : this.getId(),
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
                testCode += value;
                testCode += (key != length - 1) ? ',' : '';
            });
            testCode += '),' + this.rec.simpleTestOutput + ',\'' + this.rec.description + '\');';
			// console.log('test code for '+this.rec.description+ ':'+testCode);
			this.rec.code = testCode;
			return testCode;
		},

		getDisputeDTO: function(){
			return {
				id: this.rec.id,
				disputeText: this.rec.disputeTestText
			};
		}
	};

	return Test;
});

