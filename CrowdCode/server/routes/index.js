var express = require('express');
var router = express.Router();
var firebase = require('../util/firebase_service');
/* GET home page. */
router.get('/', function(req, res, next) {
    var worker_id = firebase.createWorker("John","img/pic.jpg");
    var worker_id1 = firebase.createWorker("Smith","img/pic1.jpg");
    var worker_id2 = firebase.createWorker("Dave","img/pic2.jpg");
    var project_id = firebase.createProject("testproj2",worker_id);
    //var project_id = "-Kld2x3h5euH8IcBBUtI";
    var ADT_id = firebase.createADT(project_id,"testADT","Boolean","Flag to cheeck xyz",false,[{name: "t1",value:"boolean"}], [{name:"hi",value:"true"}]);
    var function_id = firebase.createFunction(project_id,"testFunction","Integer","adds two numbers","c = a+b;",['t1','t2'],
                    [{name:"Math", value:"Integer" }],[{name:"a",type:"Integer",description:"first digit"},{name:"b",type:"Integer",description:"second digit"}],"null");
    var microtask_id = firebase.createImplementationMicrotask(project_id,"Add items",10,function_id,"testFunction",0,"Write code to add two numbers","//a + b = c",false,worker_id1);
    var review_microtask_id = firebase.createReviewMicrotask(project_id,"review task",5,microtask_id,worker_id2);
    var test_id = firebase.createTest(project_id,"sumTest","Checks if add works",function_id,[{name:"num1",value:"2"},{name:"num2",value:"3"}],5);
    var event_id = firebase.createEvent(project_id,"Test",test_id,"Microtask test",microtask_id,"New test implemented");
    var question_id = firebase.createQuestion(project_id,"Question 1","How do I start?",10,worker_id1,[worker_id2,worker_id1]);
    var notification_id = firebase.createNotification(project_id,worker_id1,"Question Answered", "Question 12312312 was answered!");

    res.render('index', { title: 'Crowd Code',  data: "hi"});
});

module.exports = router;
