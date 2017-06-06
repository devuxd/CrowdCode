var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var cors = require('cors');

module.exports = function(wagner) {
  var api = express.Router();
  api.use(bodyparser.json());
  api.use(bodyparser.urlencoded({
    extended: false
  }));
  api.use(cors());

  api.post('/authenticate', wagner.invoke(function(UserService, AdminFirebase) {
    return function(req, res) {
      var idToken = req.body.idToken;
      AdminFirebase.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          var uid = decodedToken.uid;
          UserService.getUserById(uid)
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log("Successfully fetched user data:", userRecord.toJSON());
            })
            .catch(function(error) {
              console.log("Error fetching user data:", error);
            });
          res.json({
            'Sucess': 200
          })
        }).catch(function(error) {
          // Handle error
        });
    };
  }));

  /* Product API */
  api.get('/project/:id', wagner.invoke(function(AdminFirebase) {
    return function(req, res) {
      //TODO handle project retrieval here with firebase
      res.json({
        'ok': 200
      })
    };
  }));
  return api;
}
