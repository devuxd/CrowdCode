var express = require('express');
var path = require('path');
var router = express.Router();
var firebase = require('../util/firebase_service');
const publicDir = path.join(__dirname, '..', '..', 'public');
/* GET home page. */
router.get('/', function(req, res) {
    res.sendFile('welcome.html', {root: publicDir} );

});
router.get('/clientRequest', function(req, res) {
    res.sendFile('clientReq/client_request.html', {root: publicDir} );

});
router.get('^/:projectname([a-z]*)', function(req, res) {
    res.sendFile('clientDist/client.html', {root: publicDir} );

});

module.exports = router;
