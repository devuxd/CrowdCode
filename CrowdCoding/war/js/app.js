// create the AngularJS app, load modules and start

var myApp = angular.module('crowdCodeWorker',["ngAnimate","firebase","ui.codemirror","ui.bootstrap", "diff","ngSanitize","ui.ace"]);


myApp.constant('firebaseUrl',firebaseURL);

myApp.run();




