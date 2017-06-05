var fs = require('fs');
var path = require('path');
var admin = require('firebase-admin');

module.exports = function(wagner) {
  wagner.factory('AdminFirebase', function(Config) {
    return admin.initializeApp({
      credential: admin.credential.cert(Config.serviceAccount),
      databaseURL: "https://crowdcode2.firebaseio.com",
      databaseAuthVariableOverride: {
        uid: "my-service-worker"
      }
    });
  });

  wagner.factory('Config', function() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../config', 'config.json')).toString());
  });
};
