var express = require('express');
var path = require('path');

module.exports = function(wagner) {
  var router = express.Router({
    caseSensitive: true
  });
  const publicDir = path.join(__dirname, '..', 'public');
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
  router.get('/:projectname([a-zA-Z0-9]{3,})', wagner.invoke(function(MicrotaskService, FirebaseService) {
    return  function(req, res) {

        const projectName = req.params.projectname;
        var project_promise = MicrotaskService.loadProject(projectName);
        if(project_promise !== null) {
            project_promise.then(function () {
                console.log("Project Name : " + projectName + "------------------------------");
                FirebaseService.checkIfWorkerIsInLeaderboard(projectName, req.user.uid).then(function(exists){
                  if(exists === false) {
                    FirebaseService.addWorkerToLeaderBoard(projectName, req.user.uid, req.user.name).then(function(){
                      FirebaseService.createProjectWorker(projectName,req.user.uid);
                    }).catch(function(err){
                      throw err;
                    });
                  }
                  res.render('clientDist/client.ejs', {
                      workerId: req.user.uid,
                      workerHandle: req.user.email,
                      projectId: projectName
                  });
                }).catch(function(err){
                  console.error(err);
                  throw err;
                });
            });
        }else{
            console.log("Project Name loaded from memory: " + projectName + "------------------------------");
            FirebaseService.checkIfWorkerIsInLeaderboard(projectName, req.user.uid).then(function(exists){
              if(exists === false) {
                FirebaseService.addWorkerToLeaderBoard(projectName, req.user.uid, req.user.name).then(function(){
                  FirebaseService.createProjectWorker(projectName,req.user.uid);
                }).catch(function(err) {
                  throw err;
                });
              }

              res.render('clientDist/client.ejs', {
                  workerId: req.user.uid,
                  workerHandle: req.user.email,
                  projectId: projectName
              });
            }).catch(function(err){
              console.error(err);
              throw err;
            });
        }
      }
  }));

  router.get('/:projectId/deploy', wagner.invoke(function(DeploymentService){
    return function(req,res){
        console.log('app-routing, req.user.uid: ', req.user.uid);
        var project_id = req.params.projectId;
        var result = DeploymentService.createMicroService(project_id);
        result.then(function(response){
            if(response) {
                res.send("Microservice created! If you did not provide your Deployment information in the Client-Request Crowd Microservices is using the default GitHub repository, you can access microservice  at https://microservice-template-2.herokuapp.com/endpoints/{endpoint}");
            }

        }).catch(function(err){
            res.send("Error happend: "+err);
            console.log(err);
        })

    }
  }));




  return router;

}
