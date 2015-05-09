angular
    .module('crowdAdminApp')
    .controller('QuestionsCtrl',[
    '$firebase', 
    '$scope',
    'firebaseUrl',
    function( $firebase, $scope, firebaseUrl ){
         
        console.log(firebaseUrl);
    var questionsRef = $firebase(new Firebase( firebaseUrl + '/questions' ));
    $scope.questions = questionsRef.$asArray();
    $scope.questions.$loaded().then(function(){
        console.log('questions loaded',$scope.questions);
    });

}]);