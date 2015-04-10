angular
    .module('crowdCode')
    .directive('leftBar', function(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		 scope: true, // {} = isolate, true = child, false/undefined = no change
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		// restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		 templateUrl: '/client/widgets/left_bar_template.html', 
		replace: false,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			$scope.tabs=[];
			$scope.tabs[0]={template : '/client/widgets/news_feed_template.html', title: "news"};
			$scope.tabs[1]={template : '/client/questions/questions_template.html',title: "ques"};

		}
	};
});