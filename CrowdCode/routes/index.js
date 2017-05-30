var express = require('express');
var router = express.Router();
var data_mod = require('../lib/data_handler');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Crowd Code',  data: data_mod.global_data.getData()});
});

module.exports = router;
