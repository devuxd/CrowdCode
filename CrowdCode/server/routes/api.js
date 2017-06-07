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

  api.post('/authenticate', wagner.invoke(function(UserService, AdminFirebase) {
    return function(req, res) {
      var idToken = req.body.idToken;
      AdminFirebase.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          var uid = decodedToken.uid;
          UserService.getUserById(uid)
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log("Successfully fetched user data:", userRecord.toJSON());
            })
            .catch(function(error) {
              console.log("Error fetching user data:", error);
            });
          res.json({
            'Sucess': 200
          })
        }).catch(function(error) {
          // Handle error
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

  /* Firebase test */
  api.get('/fbtest',wagner.invoke(function(FirebaseService) {
          return function (req, res) {
              var firebase = FirebaseService;
             var worker_id = '-Kly2A7vROyI0io81lH_';                 //firebase.createWorker("John","img/pic.jpg");
             var worker_id1 = '-Kly2A89xf19wPdp6VIu';                //firebase.createWorker("Smith","img/pic1.jpg");
             var worker_id2 = '-Kly2A89xf19wPdp6VIv';               //firebase.createWorker("Dave","img/pic2.jpg");
             var project_id = firebase.createProject("testproj2",worker_id);
             //var project_id = "-Kld2x3h5euH8IcBBUtI";
             var ADT_id = firebase.createADT(project_id,"testADT","Boolean","Flag to cheeck xyz",false,[{name: "t1",value:"boolean"}], [{name:"hi",value:"true"}]);
             var function_id = firebase.createFunction(project_id,"testFunction","Integer","adds two numbers","c = a+b;",['t1','t2'],
             [{name:"Math", value:"Integer" }],[{name:"a",type:"Integer",description:"first digit"},{name:"b",type:"Integer",description:"second digit"}],"null");
             var microtask_id = firebase.createImplementationMicrotask(project_id,"Add items",10,function_id,"testFunction",0,"Write code to add two numbers","//a + b = c",false,worker_id1);
             var review_microtask_id = firebase.createReviewMicrotask(project_id,"review task",5,microtask_id,worker_id2);
             var test_id = firebase.createTest(project_id,function_id,'input/output',"sumTest","Checks if add works",[{name:"num1",value:"2"},{name:"num2",value:"3"}],5);
             var event_id = firebase.createEvent(project_id,"Test",test_id,"Microtask test",microtask_id,"New test implemented");
             var question_id = firebase.createQuestion(project_id,"Question 1","How do I start?",10,worker_id1,[worker_id2,worker_id1]);
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
            });

            var task_promise = firebase.retrieveMicrotask(project_id, "implementation", microtask_id);
            task_promise.then(function (value) {
                console.log(value);
                console.log('\n ----------- \n');
            });

            var ADT_promise = firebase.retrieveADT(project_id, ADT_id);
            ADT_promise.then(function (value) {
                console.log(value);
            });

          }
      }
  ));


  return api;
}
