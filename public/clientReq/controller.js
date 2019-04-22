////////////////////
// APP CONTROLLER //
////////////////////
// var wrapperUtil = require('word-wrap');
clienRequestApp.controller('ClientRequestController', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject', '$alert', '$http',
    function ($scope, $rootScope, $firebaseArray, $firebaseObject, $alert, $http) {

        var firebaseURL = 'https://crowdcode2.firebaseio.com';
        var firebaseRef;
        $scope.projectsName = [];
        //load all the projects name
        var ref = firebase.database().ref().child("clientRequests");
        var projectNames = $firebaseArray(ref);
        //var projectNames = projectSync.$asArray();
        projectNames.$loaded().then(function () {
            angular.forEach(projectNames, function (value, key) {
                $scope.projectsName.push(value.$id);
            });
        });


        // User stories are numbered from 0 to userStoryCount - 1 (as are ADTs).
        $scope.ADTs = [];
        $scope.functions = [];
        $scope.projectName = "";
        $scope.projectDescription = "";

        $scope.addADT = function () {
            var emptyAdt = {
                description: "",
                name: "",
                structure: [{
                    name: "",
                    type: ""
                }],
                examples: [{
                    name: "",
                    value: ""
                }]
            };

            $scope.ADTs.push(emptyAdt);
        };

        $scope.deleteADT = function (index) {
            $scope.ADTs.splice(index, 1);
        };


        $scope.addStructure = function (ADTindex) {
            $scope.ADTs[ADTindex].structure.push({
                name: "",
                type: ""
            });
        };

        $scope.deleteStructure = function (ADTindex, structureIndex) {
            if ($scope.ADTs[ADTindex].structure.length > 1)
                $scope.ADTs[ADTindex].structure.splice(structureIndex, 1);
        };

        $scope.addExample = function (ADTindex) {
            if ($scope.ADTs[ADTindex].examples === undefined)
                $scope.ADTs[ADTindex].examples = [];

            $scope.ADTs[ADTindex].examples.push({
                name: "",
                value: ""
            });
        };

        $scope.deleteExample = function (ADTindex, exampleIndex) {
            if ($scope.ADTs[ADTindex].examples.length > 1)
                $scope.ADTs[ADTindex].examples.splice(exampleIndex, 1);
        };

        $scope.addFunction = function () {
            var emptyParameter = {
                name: "",
                type: "",
                description: ""
            };

            var emptyFunction = {
                code: "{\n\t//Implementation code here \n\treturn {}; \n}",
                description: "",
                name: "",
                parameters: [emptyParameter],
                returnType: "",
                stubs: [],
                isThirdPartyAPI: false,
                dependent: []
            };


            $scope.functions.push(emptyFunction);
        };

        $scope.deleteFunction = function (index) {
            $scope.functions.splice(index, 1);
        };


        $scope.addParameter = function (index) {

            var emptyParameter = {
                name: "",
                type: "",
                description: ""
            };

            if ($scope.functions[index].parameters !== undefined) {
                $scope.functions[index].parameters.push(emptyParameter);
            } else {
                $scope.functions[index].parameters = [emptyParameter];

            }
        };


        $scope.deleteParameter = function (functionIndex, parameterIndex) {
            $scope.functions[functionIndex].parameters.splice(parameterIndex, 1);
        };

        $scope.addStub = function (index) {

            if ($scope.functions[index].stubs === undefined)
                $scope.functions[index].stubs = [];

            $scope.functions[index].stubs.push({});
        };


        $scope.deleteStub = function (functionIndex, testIndex) {
            $scope.functions[functionIndex].stubs.splice(testIndex, 1);
        };


        $scope.addDependent = function (index) {

            if ($scope.functions[index].dependent === undefined)
                $scope.functions[index].dependent = [];

            $scope.functions[index].dependent.push({});
        };


        $scope.deleteDependent = function (functionIndex, testIndex) {
            $scope.functions[functionIndex].dependent.splice(testIndex, 1);
        };

        function makeDirty(form) {

            angular.forEach(form, function (formElement, fieldName) {
                // If the fieldname doesn't start with a '$' sign, it means it's form
                if (fieldName[0] !== '$') {
                    if (angular.isFunction(formElement.$setDirty))
                        formElement.$setDirty();

                    //if formElement as the proprety $addControl means that have other form inside him
                    if (formElement !== undefined && formElement.$addControl)
                        makeDirty(formElement);
                }
            });
        }

        $scope.submit = function (form) {
            makeDirty(form);

            if (form.$invalid) {
                var error = 'Fix all errors before submit';
                $alert({
                    title: 'Error!',
                    content: error,
                    type: 'danger',
                    show: true,
                    duration: 3,
                    template: '/client/microtasks/alert_submit.html',
                    container: 'alertcontainer'
                });
            } else {

                let project = {};
                angular.forEach($scope.functions, function (funct, key) {
                    //create the header
                    funct.header = 'function ' + funct.name + '(';
                    for (var index in funct.parameters)
                        funct.header += funct.parameters[index].name + (index == funct.parameters.length - 1 ? "" : ", ");
                    funct.header += ")";
                    //Set stubs as empty
                    if (funct.stubs.length === 0) funct.stubs = '';

                    //Add new line to function description
                    var clean = funct.description.replace(/\n/g, "");
                    //console.log("Cleaned " + clean);
                    var temp = clean.match(/[\s\S]{1,130}\w*/g);
                    var description = '';
                    for (var i = 0; i < temp.length; i++) {
                        description += temp[i] + "\n";
                    }
                    // var descriptionNew = wrapperUtil(funct.description.replace(/\n/g, ""),{width: 150});
                    //   funct.description = descriptionNew;
                    funct.description = description;
                    if (funct.isThirdPartyAPI == undefined) {
                        funct.isThirdPartyAPI = false;
                    }

                });

                project.description = $scope.projectDescription;
                project.functions = $scope.functions;
                project.ADTs = $scope.ADTs;
                project.gitHubInfo = {
                    firstName: $scope.firstName,
                    lastName: $scope.lastName,
                    gitEmail: $scope.gitEmail,
                    gitUserId: $scope.gitUserId,
                    gitToken: $scope.gitToken,
                    gitRepoName: $scope.gitRepoName
                };
                var exist = false;
                projectNames.$loaded().then(function () {
                    angular.forEach(projectNames, function (value, key) {
                        if (value.$id === $scope.projectName) exist = true;
                    });
                });
                firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
                    if (exist) {
                        $http({
                            method: "PUT",
                            url: "/api/v1/clientRequests/" + $scope.projectName,
                            data: project,
                            headers: {
                                'Authorization': 'Bearer ' + idToken
                            },
                            responseType: "json",
                        }).then(function (payload) {
                            console.log(payload.data);
                        }).catch(err => {
                            console.log(err);
                        })
                        ;
                    } else {
                        $http({
                            method: "POST",
                            url: "/api/v1/clientRequests/" + $scope.projectName,
                            data: project,
                            headers: {
                                'Authorization': 'Bearer ' + idToken
                            },
                            responseType: "json",
                        }).then(function (payload) {
                            $scope.projectsName.push($scope.projectName);
                            console.log(payload.data);
                        }).catch(err => {
                            console.log(err);
                        })
                        ;
                    }
                    $alert({
                        title: 'Success!',
                        content: 'Submit successful',
                        type: 'success',
                        show: true,
                        duration: 6,
                        template: '/client/microtasks/alert_submit.html',
                        container: 'alertcontainer'
                    });
                }).catch(function (error) {
                    console.log(error);
                });
                // var ref = firebase.database().ref().child("clientRequests").child($scope.projectName);
                // var project = $firebaseObject(ref);
                // //project = projectSync.$asObject();
                // project.$loaded().then(function() {
                //
                //   angular.forEach($scope.functions, function(funct, key) {
                //
                //     //create the header
                //     funct.header = 'function ' + funct.name + '(';
                //     for (var index in funct.parameters)
                //       funct.header += funct.parameters[index].name + (index == funct.parameters.length - 1 ? "" : ", ");
                //     funct.header += ")";
                //   });
                //
                //   project.functions = $scope.functions;
                //   console.log(project.functions);
                //
                //   project.ADTs = $scope.ADTs;
                //
                //
                //   project.$save();
                //   $alert({
                //     title: 'Success!',
                //     content: 'Submit successful',
                //     type: 'success',
                //     show: true,
                //     duration: 3,
                //     template: '/client/microtasks/alert_submit.html',
                //     container: 'alertcontainer'
                //   });
                // });
            }

        };


        $scope.load = function () {
            var ref = firebase.database().ref().child("clientRequests").child($scope.projectName);
            var project = $firebaseObject(ref);
            //project = projectSync.$asObject();
            project.$loaded().then(function () {
                if (angular.isDefined([project.description])) {
                    $scope.projectDescription = project.description;
                }
                if (angular.isDefined(project.functions)) {
                    $scope.functions = project.functions;
                    for (var index in $scope.functions) {
                        if ($scope.functions[index].isReadOnly !== undefined)
                            delete $scope.functions[index].isReadOnly;
                    }
                } else
                    $scope.functions = [];

                if (angular.isDefined(project.ADTs))
                    $scope.ADTs = project.ADTs;
                else
                    $scope.ADTs = [];

                if (angular.isDefined(project.gitHubInfo)) {
                    $scope.firstName = project.gitHubInfo.firstName;
                    $scope.lastName = project.gitHubInfo.lastName;
                    $scope.gitEmail = project.gitHubInfo.gitEmail;
                    $scope.gitUserId = project.gitHubInfo.gitUserId;
                    $scope.gitToken = project.gitHubInfo.gitToken;
                    $scope.gitRepoName = project.gitHubInfo.gitRepoName;

                } else {
                    $scope.firstName = "";
                    $scope.lastName = "";
                    $scope.gitEmail = "";
                    $scope.gitUserId = "";
                    $scope.gitToken = "";
                    $scope.gitRepoName = "";
                }
                });
        };


    }
]);
