var express = require('express');
var router = express.Router();
var data_mod = require('../data_handler');

/* GET confirmation page. */
router.get('/', function(req, res, next) {
    var data = req.param('data');
    data_mod.setData(data);
    res.render('submitted', { title: 'Task Submitted', data: data_mod.getData() });
});

module.exports = router;