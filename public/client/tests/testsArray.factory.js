
angular
    .module('crowdCode')
    .factory("TestArray",['$firebaseArray','Test', TestArray ]);

function TestArray($firebaseArray, Test) {
	return $firebaseArray.$extend({
		$$added: function(snap, prevChild) {
      var test = snap.val();
			return new Test(test,test.functionName);
		},
		$$updated: function(snap) {
			return this.$getRecord(snap.key).update(snap.val());
		}
	});
}
