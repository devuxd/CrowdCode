
angular
    .module('crowdCode')
    .factory("FunctionArray",['$firebaseArray','Function', FunctionArray ]);

function FunctionArray($firebaseArray, Function) {
	return $firebaseArray.$extend({
		$$added: function(snap, prevChild) {
			return new Function(snap.val(),snap.key());
		},
		$$updated: function(snap) {
			return this.$getRecord(snap.key()).update(snap.val());
		}
	});
}