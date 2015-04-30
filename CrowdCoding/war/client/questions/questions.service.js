

///////////////////////
// QUESTIONS SERVICE //
///////////////////////
angular
    .module('crowdCode')
    .factory('questionsService', ['$window','$rootScope','$http', '$q', '$firebase', 'firebaseUrl','workerId', function( $window, $rootScope, $http, $q, $firebase, firebaseUrl,workerId) {


	var service = new function(){
		// Private variables
		var questions;

		var allTags=[];
		var loaded = false;
		var questionsRef = $firebase(new Firebase(firebaseUrl+'/questions'));
		var idx = lunr(function(){
			this.ref('id');
			this.field('title'   ,{ boost: 10 });
			this.field('text'    ,{ boost: 10 });
			this.field('tags'    ,{ boost: 10 });
			this.field('answers' ,{ boost: 8 });
			this.field('comments',{ boost: 4 });
		});


		// Public functions
		this.init = init;
		this.submit = submit;
		this.vote = vote;
		this.report = report;
		this.linkArtifact = linkArtifact;
		this.setStatus    = setStatus;
		this.sel  = undefined;
		this.allTags = [];
		this.searchResults = searchResults;
		this.getQuestions  = function(){return questions;};
		this.getAllTags    = getAllTags;

		function questionToDocument(question,key){
			var doc = {
				id      : key,
				title   : question.title,
				text    : question.text !== undefined ? question.text : '',
				tags    : question.tags !== undefined ? question.tags.join(', ') : '',
				answers : '',
				comments: ''
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

			// doc.answers  = doc.answers.toLowerCase();
			// doc.comments = doc.comments.toLowerCase();

			return doc;
		}

		

		function searchResults( searchTxt ){
			var searchTxtToLower = searchTxt;
			console.log('searching for ',searchTxtToLower);
			var res = idx.search( searchTxtToLower );
            var qs = [];
			for( var r = 0; r < res.length ; r++ ){
				qs.push(questions.$getRecord(res[r].ref));
			}

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

		function getAllTags(){
			return allTags;
		}

		function init(){
			questions = questionsRef.$asArray();
			questions.$loaded().then(function(){

				// tell the others that the functions services is loaded
				$rootScope.$broadcast('serviceLoaded','questions');
				for(var index in questions){
					if(questions[index].ownerId){
						var doc = questionToDocument( questions[index], questions[index].id );
						idx.add( doc );
						addTags(questions[index].tags);
					}
				}

				questions.$watch(function(event){
					var q   = questions.$getRecord( event.key );
					var doc = questionToDocument( q, event.key );

					switch( event.event ){
						case 'child_added':
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

		function submit(type, formData){
			console.log(formData);
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/questions/insert?type=' + type, formData)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}
		
		function vote(id, remove){
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/questions/vote?id=' + id + '&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function report(id, remove){
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/questions/report?id=' + id + '&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function linkArtifact(id, artifactId, remove){
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/questions/link?id=' + id + '&artifactId='+artifactId+'&remove='+remove)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}

		function setStatus(id, closed){
			var deferred = $q.defer();
			$http.post('/' + $rootScope.projectId + '/questions/close?id=' + id + '&closed='+closed)
				.success(function(data, status, headers, config) {
					deferred.resolve();
				})
				.error(function(data, status, headers, config) {
					deferred.reject();
				});
			return deferred.promise;
		}
	};

	return service; 
}]);

