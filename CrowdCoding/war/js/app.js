// create the AngularJS app, load modules and start

var myApp = angular.module('crowdCodeWorker',["ngAnimate","firebase","ui.codemirror", "diff","ngSanitize","ui.ace",  "mgcrea.ngStrap"]);

//,"ui.bootstrap" removed
myApp.constant('firebaseUrl',firebaseURL);

myApp.run();


myApp.config(function($dropdownProvider) {
  angular.extend($dropdownProvider.defaults, {
    html: true
  });

});