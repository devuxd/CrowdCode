var admin = require("firebase-admin");

var serviceAccount = require("./crowdcode2-firebase-adminsdk-8ri07-4ef77e0282.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crowdcode2.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: "my-service-worker"
  }
});

module.exports = admin;
