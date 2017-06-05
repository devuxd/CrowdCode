var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
    var idToken = req.body.idToken;
    adminFirebase.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
            var uid = decodedToken.uid;
            userService.getUserById(uid)
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
});


module.exports = router;