var express = require('express');
var router = express.Router();
var data_mod = require('../lib/data_handler');
var firebase = require('../lib/firebase_handler');

/* GET confirmation page. */
router.get('/', function(req, res, next) {
    var data = req.param('data');
    data_mod.global_data.setData(data);
    firebase.add(data);
    res.render('submitted', { title: 'Task Submitted', data: data_mod.global_data.getData()});
});

module.exports = router;