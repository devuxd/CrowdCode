////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('projectService', ['$rootScope', '$firebaseObject', 'firebaseUrl', function($rootScope, $firebaseObject,firebaseUrl) {

        var service = new  function(){

            var project;

            this.init         = init;
            this.getAll       = getAll;
            this.getName      = getName;
            this.getDescription  = getDescription;

            function init(){
                projectRef = firebase.database().ref().child('Projects').child(projectId);
                project = $firebaseObject(projectRef);
                project.$loaded().then(function(){
                    // tell the others that the adts services is loaded
                    $rootScope.$broadcast('serviceLoaded','project');

                });
            }
            function getAll(){
                return project;
            }
            function getName(){
                return projectId;
            }
            function getDescription(){
                return project.description;
            }
        }

        return service;
    }]);
