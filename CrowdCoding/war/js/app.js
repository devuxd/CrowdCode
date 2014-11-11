// create the AngularJS app, load modules and start

var myApp = angular.module('crowdCodeWorker',["ngAnimate","firebase","ui.codemirror","ui.bootstrap", "diff","ngSanitize"]);


myApp.constant('firebaseUrl',firebaseURL);

myApp.run();




