// create the AngularJS app, load modules and start

var clienRequestApp = angular.module('clientRequest', ["firebase", "mgcrea.ngStrap"])
  .config([function() {
    var config = {
      apiKey: "AIzaSyCmhzDIbe7pp8dl0gveS2TtOH4n8mvMzsU",
      authDomain: "crowdcode2.firebaseapp.com",
      databaseURL: "https://crowdcode2.firebaseio.com",
      projectId: "crowdcode2",
      storageBucket: "crowdcode2.appspot.com",
      messagingSenderId: "382318704982"
    };
    firebase.initializeApp(config);
  }]);

clienRequestApp.run();
