

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('questionsService', ['$window','$rootScope','$http','$firebase', 'firebaseUrl', function( $window, $rootScope,$http, $firebase, firebaseUrl) {


	var service = new function(){
		// Private variables
		var questions;
		var allTags=[];
		var loaded = false;
		var questionsRef = $firebase(new Firebase(firebaseUrl+'/questions'));
		var idx = lunr(function(){
			this.ref('id');
			this.field('title',{ boost: 10 });
			this.field('text',{ boost: 10 });
			this.field('tags',{ boost: 10 });
			this.field('answers',{ boost: 8 });
			this.field('comments',{ boost: 4});
		});

		

		// Public functions
		this.init = init;
		this.submitQuestion = submitQuestion;
		this.vote = vote;
		this.report = report;
		this.sel  = undefined;
		this.allTags = [];
		this.addVote       = addVote;
		this.searchResults = searchResults;
		this.setSelected = setSelected;
		this.getQuestions= function(){return questions;};
		this.getAllTags= getAllTags;

		function questionToDocument(question,key){
			var doc = {
				id      : key,
				title   : question.title,
				text    : question.text !== undefined ? question.text : '',
				tags    : question.tags !== undefined ? question.tags.join(', ') : '',
				answers : ''
			};
			if( question.answers !== undefined ){
				for( var answerkey in question.answers){
					doc.answers += ' '+question.answers[answerkey].text;
					if( question.answers[answerkey].comments !== undefined ){
						for( var commentKey in question.answers[answerkey].comments)
							doc.comments += ' '+question.answers[answerkey].comments[commentKey].text;
					}
				}
			}
			console.log(doc);
			return doc;
		}

		

		function addVote(q){
			if( q.votes === undefined )
				q.votes = [];

			q.votes.push(workerId);
			questions.$save(q);
		}

		function searchResults( searchTxt ){
			var res = idx.search( searchTxt );
            var qs = [];
			for( var r = 0; r < res.length ; r++ ){
				console.log(res[r].ref);
				console.log(questions);
				qs.push(questions.$getRecord(res[r].ref));
			}
			console.log(idx);

			return qs;
		}

		function addTags( tags ){
			if( tags === undefined )
				return;

			for( var t = 0; t < tags.length ; t++){
				if( allTags.indexOf(tags[t]) == -1 )
					allTags.push(tags[t]);
			}
		}
		function getAllTags()
		{
			return allTags;
		}
		function setSelected(q){
			console.log('selected',q);
			$scope.sel = q;
		}

		function init(){
			questions = questionsRef.$asArray();
			questions.$loaded().then(function(){
				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','questions');
				for(var index in questions)
				{
					if(questions[index].ownerId){
						console.log("for ",questions[index]);
						var doc = questionToDocument( questions[index], questions[index].id );
						idx.add( doc );
						addTags(questions[index].tags);
					}
				}
				console.log(idx);
				questions.$watch(function(event){
					var q = questions.$getRecord( event.key );
					var doc = questionToDocument( q, event.key );
					console.log("event "+event.event);
					switch( event.event ){
						case 'child_added':
							console.log(q);
							idx.add( doc );
							addTags(q.tags);
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
			});
			

		}

		function submitQuestion(type, formData){
			$http.post('/' + $rootScope.projectId + '/questions/insert?type=' + type, formData)

				.success(function(data, status, headers, config) {
					console.log("success");
				})
				.error(function(data, status, headers, config) {
					console.log("error");
				});
		}
		function vote(id, removeVote){
			$http.post('/' + $rootScope.projectId + '/questions/vote?id=' + id + '&removeVote='+removeVote)

				.success(function(data, status, headers, config) {
					console.log("success");
				})
				.error(function(data, status, headers, config) {
					console.log("error");
				});
		}
		function report(id, removeReport){
			$http.post('/' + $rootScope.projectId + '/questions/report?id=' + id + '&removeReport='+removeReport)

				.success(function(data, status, headers, config) {
					console.log("success");
				})
				.error(function(data, status, headers, config) {
					console.log("error");
				});
		}
	};

	return service; 
}]);

