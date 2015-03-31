// create CrowdCodeWorker App and load modules
var myApp = angular.module('questions',[ 
	'ngAnimate', 
	'firebase', 
	'ui.ace', 
	'mgcrea.ngStrap'
]);

// configure app modules
myApp.config(function() {


});

// define app constants
myApp.constant('projectId',projectId);
myApp.constant('workerId',workerId);
myApp.constant('firebaseUrl','https://crowdcode.firebaseio.com/projects/'+projectId);

myApp.directive('questionsPanel',function($timeout,$firebase,firebaseUrl){
	var questionsRef = $firebase(new Firebase(firebaseUrl+'/questions'));

	var idx = lunr(function(){
		this.ref('id');

		this.field('title',{ boost: 10 });
		this.field('text',{ boost: 10 });
		this.field('tags',{ boost: 10 });
		this.field('answers',{ boost: 8 });
	});


	function questionToDocument(q,key){
		var doc = {
			id      : key,
			title   : q.title,
			text    : q.text !== undefined ? q.text : '',
			tags    : q.tags !== undefined ? q.tags.join(', ') : '',
			answers : ''
		};
		if( q.answers !== undefined )
			for( var a = 0; a < q.answers.length ; a++)
				doc.answers += ' '+q.answers[a].text;

		return doc;
	}

	return {
		scope: {},
		templateUrl: '/questions/questionsPanel.html',
		link: function($scope,$element,$attrs){
			$scope.view = 'question_list';
			$scope.sel  = undefined;
			$scope.questionsArray = questionsRef.$asArray();
			$scope.allTags = [];

			$scope.setView       = setView;
			$scope.addVote       = addVote;
			$scope.searchResults = searchResults;
			$scope.setSelected = setSelected;


			$scope.questionsArray.$watch(function(event){
				var q = $scope.questionsArray.$getRecord( event.key );
				var doc = questionToDocument( q, event.key );

				switch( event.event ){
					case 'child_added':
						idx.add( doc );
						addTags(q.tags)
						break;
					case 'child_changed': 
						idx.update( doc );
						break;
					case 'child_removed':
						idx.remove( doc );
						break;
					default:
				}
			});

			function setView(view){
				$scope.view = view;
			}

			function addVote(q){
				if( q.votes === undefined )
					q.votes = [];

				q.votes.push(workerId);
				$scope.questionsArray.$save(q);
			}

			function searchResults( searchTxt ){
				var res = idx.search( searchTxt );
	            var questions = [];
				for( var r = 0; r < res.length ; r++ ){
					questions.push(
						$scope.questionsArray.$getRecord(res[r].ref)
					);
				}
				return questions;
			}

			function addTags( tags ){
				if( tags === undefined )
					return; 

				for( var t = 0; t < tags.length ; t++){
					if( $scope.allTags.indexOf(tags[t]) == -1 )
						$scope.allTags.push(tags[t]);
				}
			}

			function setSelected(q){
				console.log('selected',q);
				$scope.sel = q;
			}
		}
	};
});

myApp.directive('questionList',function($timeout,$firebase,firebaseUrl){
	return {
		scope: false,
		templateUrl: '/questions/questionsList.html',
		link: function($scope,$element,$attrs){
			$scope.search    = '';
			$scope.questionsArray.$loaded().then(function(){
				$scope.questions = $scope.questionsArray;
			});

			var searchTimeout;
			$scope.$watch('search',function( val ){

				if (searchTimeout) $timeout.cancel(searchTimeout);	
		        searchTimeout = $timeout(function() {
		        	if( val.length == 0)
		        		$scope.questions = $scope.questionsArray;
		        	else {
		        		$scope.questions = $scope.searchResults( val );
		        	}
		        }, 250); // delay 250 ms
			});
		}
	};
});

myApp.directive('questionDetail',function($timeout,$firebase,firebaseUrl){
	return {
		scope: false,
		templateUrl: '/questions/questionDetail.html',
		link: function($scope,$element,$attrs){

			$scope.a = {
				text: ''
			};

			$scope.postAnswer = postAnswer;

			function postAnswer(){
				$scope.questionsArray.$loaded().then(function(){
					if( $scope.sel.answers === undefined )
						$scope.sel.answers = [];

					$scope.a.id = $scope.sel.answers.length;
					$scope.a.workerId  = workerId;
					$scope.a.timestamp = Date.now();
					$scope.sel.answers.push($scope.a);
					$scope.questionsArray.$save($scope.sel).then(function(){
						$scope.a = {
							text: ''
						};
					});
				});
			}
		}
	};
});

myApp.directive('questionForm',function($firebase,firebaseUrl,workerId){
	return {
		scope: false,
		templateUrl: '/questions/questionForm.html',
		link: function($scope,$element,$attrs){
			console.log('init question form');
			$scope.q = {
				title: '',
				text: '',
				tags: [],
				answers: [],
				votes: []
			};
			$scope.newTag = '';

			$scope.postQuestion = postQuestion;
			$scope.addTag       = addTag;

			function addTag(){
				if( $scope.q.tags.indexOf($scope.newTag) == -1 )
					$scope.q.tags.push($scope.newTag);

				$scope.newTag = '';
			}

			function postQuestion(){
				$scope.questionsArray.$loaded().then(function(){
					$scope.q.id = $scope.questionsArray.length;
					$scope.q.workerId = workerId;
					$scope.q.timestamp = Date.now();
					$scope.questionsArray.$add($scope.q).then(function(){
						$scope.q = {
							title: '',
							text: '',
							tags: []
						};
						$scope.setView('question_list');
					});
				});
			}

		}
	};
});
// run the app
myApp.run();