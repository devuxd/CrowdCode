var express = require('express');
var path = require('path');
var microtaskService = require('../lib/microtask_service');

var router = express.Router({
  caseSensitive: true
});
const publicDir = path.join(__dirname, '..', '..', 'public');
/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile('welcome.html', {
    root: publicDir
  });

});
router.get('/clientRequest', function(req, res) {
  res.sendFile('clientReq/client_request.html', {
    root: publicDir
  });

});
router.get('/login', function(req, res) {
  if(req.user) return res.redirect('/');
  res.sendFile('login.html', {
    root: publicDir
  });

});
router.get('/:projectname([a-zA-Z0-9]{3,})', function(req, res) {

  const projectName = req.params.projectname;
  var project_promise = microtaskService.loadProject(projectName);
  if(project_promise !== null) {
      project_promise.then(function () {
          console.log("Project Name : " + projectName + "------------------------------");
          res.sendFile('clientDist/client.html', {
              root: publicDir
          });
      });
  }else{
      console.log("Project Name : " + projectName + "------------------------------");
      res.sendFile('clientDist/client.html', {
          root: publicDir
      });
  }
});

module.exports = router;
