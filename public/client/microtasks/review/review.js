

///////////////////////////////
//      Review CONTROLLER    //
///////////////////////////////
angular
    .module('crowdCode')
    .controller('ReviewController', ['$scope', '$rootScope',  '$alert',  '$modal', 'functionsService',  'functionUtils' , 'Function', 'AdtService', 'microtasksService', "testsService",
    function($scope, $rootScope,  $alert, $modal, functionsService, functionUtils, Function, AdtService, microtasksService, testsService) {
    // scope variables
    $scope.review = {};
    $scope.review.template = 'loading';
    $scope.review.text = "";
    $scope.review.inDispute = false;


    //load the microtask to review
    var reviewed = microtasksService.get($scope.microtask.reference_id, "implementation");
    reviewed.$loaded().then(function() {
        $scope.reviewed = reviewed;
        var submission = reviewed.submission;
        reviewed.type = 'DescribeFunctionBehavior';

        if ( reviewed.type == 'DescribeFunctionBehavior') {

            $scope.data = {};
            $scope.data.selected = -1;
            $scope.data.funct = new Function( submission['function'] );
            $scope.data.newCode = $scope.data.funct.getFullCode();
            $scope.data.oldCode = $scope.funct.getFullCode();
            if( submission.disputeFunctionText.length > 0 || submission.disputedTests){
                $scope.review.template    = 'describe_dispute';
                $scope.review.fromDispute = true;
                $scope.data.disputeText = submission.disputeFunctionText;
                var loadedFunct = functionsService.get( reviewed.functionId );
                if(submission.disputedTests) {
                  $scope.data.disputedTests = submission.disputedTests
                      .map(function(test){
                          var testObj = testsService.get(test.id);
                          // loadedFunct.getTestById(test.id);
                          testObj.disputeText = test.disputeText;
                          return testObj;
                  });
                }
            }
            else {
                $scope.review.template = 'describe';
                $scope.data.tests = angular.copy(submission.tests);
                $scope.data.isComplete = reviewed.isFunctionComplete;
                // get the stats of the edits
                $scope.data.stats = { added: 0, edited: 0, deleted: 0 };
                $scope.data.tests.map(function(test){
                    // retrieve the old version
                    if( test.edited ){

                    }

                    // increment the stats
                    if( test.added )      $scope.data.stats.added++;
                    else if( test.edited ) $scope.data.stats.edited++;
                    else if( test.deleted ) $scope.data.stats.deleted++;
                });

                // sort them in added < edited < deleted
                $scope.data.tests.sort(function(a,b){
                    if( a.added && !b.added ) return -1;
                    if( !a.added && b.added ) return 1;

                    if( a.edited && !b.edited ) return -1;
                    if( !a.edited && b.edited ) return 1;

                    if( a.deleted && !b.deleted ) return -1;
                    if( !a.deleted && b.deleted ) return 1;

                    return 0;
                });
            }

            functionsService
                .getVersion( reviewed.functionId, submission.functionVersion )
                .then(function( functObj ){
                    $scope.data.fDescription = functObj.getSignature();
                });

        }
        else if (reviewed.type == 'ImplementBehavior') {
            $scope.data = {};
            $scope.data.selected = -1;
            $scope.data.funct = new Function( submission['function'] );

            $scope.review.template    = 'implement';

            $scope.data.newCode = $scope.data.funct.getFullCode();
            $scope.data.oldCode = $scope.funct.getFullCode();

            if( submission.disputedTests ){
                $scope.review.template += "_dispute";
                var loadedFunct = functionsService.get( reviewed.functionId );
                $scope.data.disputedTests = submission.disputedTests
                    .map(function(test){
                        var testObj = loadedFunct.getTestById(test.id);
                        testObj.disputeText = test.disputeText;
                        return testObj;
                    });
            }
        }
    });


    $scope.accept = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(5);
    };
    $scope.reject = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(1);
    };
    $scope.reissue = function(event){
        event.preventDefault();
        event.stopPropagation();
        $scope.rate(3);
    };


    $scope.taskData.collectFormData = collectFormData;

    function collectFormData(form) {


        if( form.$invalid ){
            $modal({template : '/client/microtasks/modal_form_comments.html' , show: true});
            return;
        }


        var formData = {
            reviewText              : ($scope.review.text === undefined ? "" : $scope.review.text ),
            qualityScore            : $scope.review.rating,
            fromDisputedMicrotask   : $scope.review.fromDispute
        };

        return formData;

    }

}]);
