var express = require('express');
var router = express.Router();
var data_mod = require('../data_handler');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Crowd Code',  data: data_mod.getData()});
});

module.exports = router;
