var fs = require('fs');
var path = require('path');
var admin = require('firebase-admin');

module.exports = function(wagner) {


  wagner.factory('AdminFirebase', function(Config) {
    return admin.initializeApp({
      credential: admin.credential.cert(Config.serviceAccount),
      databaseURL: "https://crowdcode2.firebaseio.com",
      databaseAuthVariableOverride: {
        uid: "ddYEWGMCU7SFLhqwO7r8ciX69sG3"
      }
    });
  });

  wagner.factory('Config', function() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../config', 'config.json')).toString());
  });

  wagner.factory('UserService', function(AdminFirebase) {
    return require('./userService')(AdminFirebase);
  });

  wagner.factory('Firebase', function(Config) {
    var firebase = require('firebase');
    return firebase.initializeApp(Config.firebaseConfig);
  })

  wagner.factory('FirebaseService',function(AdminFirebase, Q){
    var firebase_service = require('../util/firebase_service')(AdminFirebase, Q);
    return firebase_service;
    });

  wagner.factory('MicrotaskService',function(FirebaseService, Q){
    var microtask_service = require('./microtask_service')(FirebaseService, Q);
    return microtask_service;
    });

    wagner.factory('Q', () => {
      return require('q');
    });
};
