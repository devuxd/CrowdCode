// create the AngularJS app, load modules and start

var myApp = angular.module('crowdCodeWorker',["ngAnimate","firebase","ui.codemirror", "ngSanitize","ui.ace","mgcrea.ngStrap",'angular-loading-bar']);

//,"ui.bootstrap" removed
myApp.constant('firebaseUrl',firebaseURL);
myApp.constant('logoutUrl',logoutURL);

myApp.run();


myApp.config(function($dropdownProvider) {
  angular.extend($dropdownProvider.defaults, {
    html: true
  });
});