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

  api.post('/:projectId/ajax/enqueue', wagner.invoke(function(FirebaseService, MicrotaskService) {
    return function(req, res) {
      let projectId = req.params.projectId;
      let type = req.query.type;
      let key = req.query.key;
      let skip = (req.query.skip == 'true');
      let disablepoint = (req.query.disablepoint == 'true');
      let autoFetch = (req.query.autoFetch == 'true');
      let workerId = req.user.uid;

      if(skip === true) {
        let fetchedData = MicrotaskService.skipMicrotask(projectId, workerId);
        res.json(fetchedData);
      } else {
        if(type === 'DescribeFunctionBehavior') {
          let tests = req.body;
          let funct = req.body.function;
          let promise = MicrotaskService.submitImplementationMicrotask(projectId,key, funct, tests, workerId);
          promise.then((data) => {
            console.log("data being returned ", data);
            let microtask = MicrotaskService.fetchMicrotask(projectId, req.user.uid);
            //console.log("Next microtask being fetched ", microtask);
            res.json(microtask);
          }).catch(err => {
            console.log("error", err);
          });
        } else {
          let review = req.body.reviewText;
          let rating = req.body.qualityScore;
          let fromDisputedMicrotask = req.body.fromDisputedMicrotask;
          let promise = MicrotaskService.submitReviewMicrotask(projectId,key,review, rating, workerId);
          promise.then((data) => {
            console.log("data being returned ", data);
            let microtask = MicrotaskService.fetchMicrotask(projectId, req.user.uid);
            //console.log("Next microtask being fetched ", microtask);
            res.json(microtask);
          }).catch(err => {
            console.log("error", err);
          });
        }
      }
    };
  }));

  api.post('/:projectId/ajax/challengeReview', wagner.invoke(function(FirebaseService) {
    return (req, res) => {
      let reviewKey = req.query.reviewKey;
      let data = req.body;
      res.json({
        result: "not implemented yet"
      });
    };
  }));

  api.post('/:projectId/ajax/testResult', wagner.invoke(function(FirebaseService) {
    return (req, res) => {
      let functionId = req.query.functionId;
      let data = req.body;
      res.json({
        result: "not implemented yet"
      });
    };
  }));

  api.post('/:projectId/logout', wagner.invoke(function(FirebaseService) {
    return (req, res) => {
      let workerid = req.query.workerid;
      let data = req.body;
      res.json({
        result: "not implemented yet"
      });
    };
  }));

  api.get('/:projectId/ajax/fetch', wagner.invoke(function(FirebaseService, MicrotaskService) {
    return function(req, res){
      let projectId = req.params.projectId;
      var user = req.user;
      if(user === undefined || user === null) res.status(status.UNAUTHORIZED).send('Unauthorized');
      let microtask = MicrotaskService.fetchMicrotask(projectId, user.uid);
      //console.log("Microtask being fetched ", microtask);
      res.json(microtask);

    };
  }));

  api.get('/:projectId/ajax/pickMicrotask', wagner.invoke(function(FirebaseService, MicrotaskService) {
    return function(req, res) {
      let projectId = req.params.projectId;
      let microtaskId = req.query.id;
      res.json({
        projectId: projectId
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

  /* Project Names List API */
  api.get('/projectNamesList', wagner.invoke(function(FirebaseService) {
    return function(req, res) {
      var firebase = FirebaseService;
      var project_names_list = null;
      var last_promise;
      var projects_promise = firebase.retrieveProjectsList();
      var result = projects_promise.then(function(projects) {
        projects.forEach(function(project_id) {
          var project_promise = firebase.retrieveProject(project_id);
          last_promise = project_promise.then(function(project) {
            var project_name = project.name;
            var owner_id = project.owner;
            var worker_promise = firebase.retrieveWorker(owner_id);
            return worker_promise.then(function(worker) {
              var worker_name = worker.name;
              var project_obj = '{' +
                'project_id:' + project_id + ',' +
                'project_name:' + project_name + ',' +
                'project_owner:' + worker_name +
                '}';
              /*var project_obj = {
                  project_id: project_id,
                  project_name: project_name,
                  project_owner: worker_name,
                  };*/
              if (project_names_list == null) {
                return project_names_list = project_obj;
              }

              return project_names_list += ',' + project_obj;
            });
          });
        });
        return last_promise;
      });
      result.then(function(data) {
        var response = '{' + data + '}';
        res.json(response);
        res.sendStatus(200);
      });
    }
  }));

  api.post('/clientRequests/:id', wagner.invoke(function(FirebaseService, UserService, MicrotaskService) {
    return function(req, res) {
      let id = req.params.id;
      var user = req.user;
      if(user === undefined || user === null) res.status(status.UNAUTHORIZED).send('Unauthorized');
      var clientReq = req.body;
      FirebaseService.createClientRequest(id, clientReq, user.uid);
      res.json({
        "result": "created"
      });
    };
  }));

  api.put('/clientRequests/:id', wagner.invoke(function(FirebaseService) {
    return function(req, res) {
      let id = req.params.id;
      let clientReq = req.body;
      FirebaseService.updateClientRequest(id, clientReq);
      res.json({
        "result": "updated"
      });
    }
  }));

  /*Load project details   */
  api.get('/project', wagner.invoke(function(FirebaseService) {
    return function(req, res) {
      var firebase = FirebaseService;
      var project_id = req.query.pid;
      var project = firebase.retrieveProject(project_id);
      project.then(function(data) {
        res.json(data.artifacts);
        res.sendStatus(200);
      })
    }
  }));


  api.get('/currentWorker', (req, res) => {
    res.json(req.user);
  });

  api.get('/:projectId/reset', wagner.invoke((FirebaseService) => {
    return (req, res) => {
      let projectId = req.params.projectId;
      FirebaseService.resetProject(projectId,req.user.uid).then(() => {
        res.json({'result': 'successful'});
      }, err => {
        console.error(err);
        res.status(status.INTERNAL_SERVER_ERROR).json({'result' : 'failed, please contact administrator!'});
      })
    }
  }));

  return api;
}
