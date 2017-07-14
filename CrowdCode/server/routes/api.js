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
      let skip = req.query.skip;
      let disablepoint = req.query.disablepoint;
      let autoFetch = req.query.autoFetch;
      let data = req.body;
      //TODO implement the function to return proper result
      res.sendStatus(status.ACCEPTED);
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
      let microtask = MicrotaskService.fetchMicrotask(projectId, user.uid); console.log(microtask);
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
        console.log(response);
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

  /*Load project details   */
  api.get('/microtest', wagner.invoke(function(MicrotaskService) {
    return function(req, res) {
      var microtask = MicrotaskService;
      microtask.loadProjects('-Km7yhGBm9-3s2o_oebe');
      res.sendStatus(200);

    }
  }));



  /* Firebase test */
  api.get('/fbtest', wagner.invoke(function(FirebaseService) {
    return function(req, res) {
      var firebase = FirebaseService;
      var worker_id = '-Km8BF48Pz22aV4YmYUF'; //firebase.createWorker("John","img/pic.jpg");
      var worker_id1 = '-Kly2A89xf19wPdp6VIu'; //firebase.createWorker("Smith","img/pic1.jpg");
      var worker_id2 = '-Kly2A89xf19wPdp6VIv'; //firebase.createWorker("Dave","img/pic2.jpg");
      /*  var project_id = firebase.createProject("testproj2",worker_id);
             //var project_id = "-Kld2x3h5euH8IcBBUtI";
             var ADT_id = firebase.createADT(project_id,"testADT","Boolean","Flag to cheeck xyz",[{name: "t1",value:"boolean"}], [{name:"hi",value:"true"}]);
             var function_id = firebase.createFunction(project_id,"testFunction","Integer","adds two numbers","c = a+b;",['t1','t2'],
             [{name:"Math", value:"Integer" }],[{name:"a",type:"Integer",description:"first digit"},{name:"b",type:"Integer",description:"second digit"}],"null");
             var microtask_id = firebase.createImplementationMicrotask(project_id,"Add items",10,function_id,"testFunction",0,"Write code to add two numbers","//a + b = c",false,worker_id1);
             var review_microtask_id = firebase.createReviewMicrotask(project_id,"review task",5,microtask_id,worker_id2);
             var test_id = firebase.createTest(project_id,function_id,'input/output',"sumTest","Checks if add works",[{name:"num1",value:"2"},{name:"num2",value:"3"}],5);
             var event_id = firebase.createEvent(project_id,"Test",test_id,"Microtask test",microtask_id,"New test implemented");
             var question_id = firebase.createQuestion(project_id,"Question 1","How do I start?",10,worker_id1);
             var answer_id = firebase.addAnswer(project_id,question_id,worker_id2,"By clicking ok");
             var comment_id = firebase.addComment(project_id,question_id,answer_id,worker_id,"+1");
             var notification_id = firebase.createNotification(project_id,worker_id1,"Question Answered", "Question 12312312 was answered!");

             var update_function = firebase.updateFunction(project_id,function_id,"testFunction","Float","adds two numbers","c = a+b;",['t1','t2'],
            [{name:"Math", value:"Integer" }],[{name:"a",type:"Integer",description:"first digit"},{name:"b",type:"Float",description:"second digit"}],"null")
            var function_promise = firebase.retrieveFunction(project_id, function_id);
            function_promise.then(function (value) {
                console.log(value);
                console.log('\n ----------- \n');
            });

            var update_test = firebase.updateTest(project_id,function_id,test_id,'assertion',"sumTest","Checks if add works",[{name:"num1",value:"2"},{name:"num2",value:"3"}],5,true);
            var test_promise = firebase.retrieveTest(project_id, test_id);
            test_promise.then(function (value) {
                console.log(value);
                console.log('\n ----------- \n');
            });


            var update_microtask = firebase.updateReviewMicrotask(project_id,review_microtask_id,4,"It is good");

            var review_promise = firebase.retrieveMicrotask(project_id, "review", review_microtask_id);
            review_promise.then(function (value) {
                console.log(value);
                console.log('\n ----------- \n');

                var task_promise = firebase.retrieveMicrotask(project_id, "implementation", microtask_id);
                task_promise.then(function (value) {
                    console.log(value);
                    console.log('\n ----------- \n');
                });
             });
            var ADT_promise = firebase.retrieveADT(project_id, ADT_id);
            ADT_promise.then(function (value) {
                console.log(value);
            });
            console.log(project_id);
            console.log(question_id);
            var question_promise = firebase.retrieveQuestion(project_id,question_id);
            question_promise.then(function(value){
                console.log(value);
            });*/

      var worker_promise = firebase.retrieveWorker(worker_id);
      worker_promise.then(function(value) {
        console.log(value);
      });

      var workers_promise = firebase.retrieveWorkersList();
      workers_promise.then(function(value) {
        console.log(value);
      });
    }
  }));


  return api;
}
