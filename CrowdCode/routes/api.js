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
      let skip = (req.query.skip === 'true');
      let disablepoint = (req.query.disablepoint === 'true');
      let autoFetch = (req.query.autoFetch === 'true');
      let workerId = req.user.uid;

      if(skip === true) {
        MicrotaskService.skipMicrotask(projectId, workerId);
        res.send("success");
      } else {
        if(type === 'DescribeFunctionBehavior') {
          let tests = req.body;
          let funct = req.body.function;
          let promise = MicrotaskService.submitImplementationMicrotask(projectId,key, funct, tests, workerId);
          promise.then((data) => {
            console.log("data being returned ", data);
            //let microtask = MicrotaskService.fetchMicrotask(projectId, req.user.uid);
            //console.log("Next microtask being fetched ", microtask);
            //res.json(microtask);

            res.send("success");
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
            //let microtask = MicrotaskService.fetchMicrotask(projectId, req.user.uid);
            //console.log("Next microtask being fetched ", microtask);
            //res.json(microtask);

            res.send("success");
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

  api.post('/clientRequests/:id', wagner.invoke(function(FirebaseService) {
    return function(req, res) {console.log("5");
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

  api.get('/:projectId/reset', wagner.invoke(function(FirebaseService, MicrotaskService){
    var firebase = FirebaseService;
    var microtask = MicrotaskService;
    return function(req, res){
      var projectId = req.params.projectId;

      var reset_promise = firebase.resetProject(projectId,req.user.uid);
        reset_promise.then(function(){
              microtask.deleteProject(projectId);
              res.json({'result': 'successful'});
      }).catch(function(err){
        console.error(err);
        res.status(status.INTERNAL_SERVER_ERROR).json({'result' : 'failed, please contact administrator!'});
      });
    }
  }));



  api.post('/:projectId/questions/insert', wagner.invoke(function(FirebaseService){
    return function(req, res){
      var projectId = req.params.projectId;
      var type = req.query.type;
      var worker_id = req.query.workerId;
      var formData = req.body;

      console.log("Type: "+type);
      console.log("WorkerId: "+worker_id);
      for(key in formData){
        console.log(key+'  '+formData[key]);
      }

      if(type === 'question') {
          var create_question_promise = FirebaseService.createQuestion(projectId, formData.title, formData.text, formData.artifactId, formData.tags, worker_id);
          res.send(create_question_promise);
      }

      if(type === 'answer'){
        var add_answer_promise = FirebaseService.addAnswer(projectId,formData.questionId,formData.text,worker_id);
        res.send(add_answer_promise);
      }

      if(type === 'comment'){
          var add_comment_promise = FirebaseService.addComment(projectId,formData.questionId,formData.answerId,formData.text,worker_id);
          res.send(add_comment_promise);
      }
    }
  }));

    api.post('/:projectId/questions/update', wagner.invoke(function(FirebaseService) {
        return function (req, res) {
            var projectId = req.params.projectId;
            var type = req.query.type;
            var worker_id = req.query.workerId;
            var formData = req.body;

            console.log("Type: " + type);
            console.log("WorkerId: " + worker_id);
            for (key in formData) {
                console.log(key + '  ' + formData[key]);
            }

            var update_queston_promise = FirebaseService.updateQuestion(projectId, formData.id, formData.title, formData.text, formData.artifactId, formData.tags, worker_id);
            res.send(update_queston_promise);
        }
    }));

    api.post('/:projectId/questions/tag', wagner.invoke(function(FirebaseService) {
        return function (req, res) {
            var projectId = req.params.projectId;
            var worker_id = req.workerId;
            var question_id = req.query.id;
            var tag = req.query.tag;
            var remove = req.query.remove;

            if(remove === "true") {
                var remove_tag_promise = FirebaseService.removeTag(projectId, question_id, tag, worker_id);
                res.send(remove_tag_promise);
            }
            if(remove === "false"){
                var add_tag_promise = FirebaseService.removeTag(projectId, question_id, tag, worker_id);
                res.send(add_tag_promise);
            }
        }
    }));


    api.post('/:projectId/questions/vote', wagner.invoke(function(FirebaseService) {
        return function (req, res) {
            var projectId = req.params.projectId;
            var worker_id = req.query.workerId;
            var question_id = req.query.questionId;
            var element_id = req.query.id;
            var remove = req.query.remove;


            if(remove === "true") {
                var remove_upVote_promise = FirebaseService.removeUpVote(projectId, question_id, element_id, worker_id);
                res.send(remove_upVote_promise);
            }
            if(remove === "false"){
                var add_upVote_promise = FirebaseService.addUpVote(projectId, question_id, element_id, worker_id);
                res.send(add_upVote_promise);
            }
        }
    }));

    api.post('/:projectId/questions/report', wagner.invoke(function(FirebaseService) {
        return function (req, res) {
            var projectId = req.params.projectId;
            var worker_id = req.query.workerId;
            var question_id = req.query.questionId;
            var element_id = req.query.id;
            var remove = req.query.remove;

            if(remove === "true") {
                var remove_downVote_promise = FirebaseService.removeDownVote(projectId, question_id, element_id, worker_id);
                res.send(remove_downVote_promise);
            }
            if(remove === "false"){
                var add_downVote_promise = FirebaseService.addDownVote(projectId, question_id, element_id, worker_id);
                res.send(add_downVote_promise);
            }
        }
    }));

    api.post('/:projectId/questions/close', wagner.invoke(function(FirebaseService) {
        return function (req, res) {
            var projectId = req.params.projectId;
            var worker_id = req.query.workerId;
            var question_id = req.query.id;
            var closed = req.query.closed;

            var toggle_close_promise = FirebaseService.setQuestionStatus(projectId, question_id, closed, worker_id);
            res.send(toggle_close_promise);
        }
    }));
    return api;
}
