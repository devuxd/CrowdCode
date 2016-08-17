import Worker from 'entities/Worker';
import Microtask from 'entities/microtasks/Microtask';
import FirebaseService from "FirebaseService";

/**
 * Created by tlatoza on 11/23/15.
 */

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/welcome.html');
});

app.get('/welcome', function (req, res) {
    res.sendFile(__dirname + '/welcome.html');
});

app.get('/user/info', function (req, res) {
    // TODO: get actual userID 
    res.write(JSON.stringify({"user": "dummyData"}));
    res.end('');
});

//missing variables
var microtasks                 = new Map();
var excludedWorkers            = new Map();
var microtaskQueue             = [];
var permanentlyExcludedWorkers = new Map();
var reviewQueue                = [];

app.get('/worker', function (req, res) {
    var projectID    = req.projectId;
    var workerID     = req.workerId;
    var microtaskKey = req.microtaskKey;
    var JsonDTO      = req.JsonDTO;
    var skip         = Boolean(req.skip);
    var disablePoint = Boolean(req.disablepoint);

    if (skip) {

        /*******************************************************************\
         ProjectCommand.skipMicrotask( microtaskKey, workerID, disablePoint)
        \*******************************************************************/

        /************************************************\
         WorkerCommand.increaseStat(workerID, "skips", 1)
        \************************************************/

        Worker.increaseStat(workerID, "skips", 1);

        var microtask = microtasks.get(microtaskKey);
        if (microtask != null && microtask.isAssignedTo(workerID)) {
            microtask.setWorkerId(null);

            /*******************************************************\
             addExcludedWorkerForMicrotask( microtaskKey, workerID )
            \*******************************************************/

            // retrieve the current permanently excluded workers for the microtask
            // if is empty create one
            var microtaskKeyString = Microtask.keyToString(microtaskKey);
            var excludedWorkersForMicrotask = excludedWorkers.get(microtaskKeyString);
            if (excludedWorkersForMicrotask == null) {
                excludedWorkersForMicrotask = new Set();
                excludedWorkers.set(microtaskKeyString, excludedWorkersForMicrotask);
            }
            excludedWorkersForMicrotask.add(workerID);

            //add/update excluded list inside firebase

            /******************************************************\
             excludedWorkersToString( excludedWorkersForMicrotask )
            \******************************************************/
            var Ids = "";
            excludedWorkersForMicrotask.forEach(function (id) {
                Ids += id + ",";
            });
            var workerList = Ids;

            FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyString, this.getID(), workerList);

            if (microtask.microtaskName() != "Review") {

                /************************************\
                 queueMicrotask( microtaskKey, null )
                \************************************/

                if (microtaskQueue.indexOf(Microtask.keyToString(microtaskKey)) == -1) {
                    microtaskQueue.push(Microtask.keyToString(microtaskKey));
// 					HistoryLog.Init(this.getID()).addEvent( new MicrotaskQueued(  ofy().load().key(microtaskKey).now() ));
                }

                // save the queue in Objectify and Firebase
             	FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), this.getID());

            } else {
                /**********************************************\
                 queueReviewMicrotask( microtaskKey, workerID )
                \**********************************************/
                // add the review microtask to the reviews queue
                if (reviewQueue.indexOf(Microtask.keyToString(microtaskKey) == -1)) {
                    reviewQueue.push(Microtask.keyToString(microtaskKey));
//				    HistoryLog.Init(this.getID()).addEvent( new MicrotaskQueued(  ofy().load().key(microtaskKey).now() ));
                }

                // exclude the worker who submitted the microtask that spawned the review
                // from the workers that can reach this review
                if (workerID != null) {
                    /*******************************************************************\
                     addPermExcludedWorkerForMicrotask( microtaskKey, excludedWorkerID )
                    \*******************************************************************/
                    // retrieve the current permanently excluded workers for the microtask
                    var permExcludedForMicrotask = permanentlyExcludedWorkers.get(Microtask.keyToString(microtaskKey));

                    // if there aren't permanently excluded workers
                    if (permExcludedForMicrotask == null) {

                        // create a new hash set
                        permExcludedForMicrotask = new Set();
                        permanentlyExcludedWorkers.set(Microtask.keyToString(microtaskKey), permExcludedForMicrotask);
                    }

                    // add the worker to the permanently excluded workers for this microtask
                    permExcludedForMicrotask.add(workerID);

                    // add the worker to the actual excluded
                    /********************************************************\
                     addExcludedWorkerForMicrotask( microtaskKey , workerID )
                    \********************************************************/
                    // retrieve the current permanently excluded workers for the microtask
                    // if is empty create one
                    var microtaskKeyString = Microtask.keyToString(microtaskKey);
                    var excludedWorkersForMicrotask = excludedWorkers.get(microtaskKeyString);
                    if (excludedWorkersForMicrotask == null) {
                        excludedWorkersForMicrotask = new Set();
                        excludedWorkers.put(microtaskKeyString, excludedWorkersForMicrotask);
                    }

                    excludedWorkersForMicrotask.add(workerID);

                    //add/update excluded list inside firebase
                    var Ids = "";
                    excludedWorkersForMicrotask.forEach(function (id) {
                        Ids += id + ",";
                    });
                    var workerList = Ids;

				    FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyString, this.getID(), workerList);
                }

                // save the review queue in Objectify and Firebase
			    FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), this.getID());
            }

            /*********************************\
             resetIfAllSkipped( microtaskKey )
            \*********************************/
            var microtaskKeyStringified = Microtask.keyToString(microtaskKey);
            // retrieve the excluded workers for the microtask
            var excludedWorkersForMicrotask = excludedWorkers.get(microtaskKeyStringified);

            var temp = true;
            loggedInWorkers.forEach(function (worker) {
                if (!excludedWorkersForMicrotask.includes(worker)) {
                    temp = false;
                }
            });

            // if all the logged in workers are excluded
            if (excludedWorkersForMicrotask != null && temp) {
                // Add back the permanently excluded workers
                var permanentlyExcludedWorkersForMicrotask = permanentlyExcludedWorkers.get(microtaskKeyStringified);

                //clean excluded list inside firebase
                FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyStringified, this.getID(), "");

                excludedWorkers.delete(microtaskKeyStringified);

                if (permanentlyExcludedWorkersForMicrotask != null) {
                    excludedWorkers.put(microtaskKeyStringified, permanentlyExcludedWorkersForMicrotask);
                    var Ids = "";
                    permanentlyExcludedWorkersForMicrotask.forEach(function (id) {
                        Ids += id + ",";
                    });
                    var workerList = Ids;
                    FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyStringified, this.getID(), workerList);
                }
            }

            /*************************************************************\
             MicrotaskCommand.skip( microtaskKey, workerID, disablePoint )
            \*************************************************************/
            Microtask.skip(microtaskKey, workerID, disablePoint);

            FirebaseService.writeMicrotaskAssigned( Microtask.keyToString(microtaskKey) , workerID, project.getID(), false);
        }
    } else {

    }
});

app.get('/user/picture', function (req, res) {

    // TODO: get the user picture
});

app.get('/user/pictureChange', function (req, res) {

    // TODO: get the user picture
});

app.get('/clientRequest', function (req, res) {
    res.sendFile(__dirname + '/clientReq/client_request.html');
});


app.get('/_admin/*', function (req, res) {
    // TODO: if isUserAdmin(), res.sendFile(__dirname + '/SuperAdmin.html'), else res.sendFile(__dirname + '/404.html')
    res.sendFile(__dirname + '/404.html');
});

app.get('/:projectid', function(req, res){
    // TODO: do later lulz
    res.sendFile(__dirname + '/clientDist/client.html');
});

app.get('/:projectid/admin', function(req, res){
    // TODO: if admin, doAdmin(), else, 404.html
});

app.get('/:projectid/statistics', function(req, res) {
    res.sendFile(__dirname + '/statistics/index.html');
});

app.get('/:projectid/ajax', function(req, res) {
    // TODO: doAjax()
});

app.get('/:projectid/questions', function(req, res) {
    // TODO: doQuestioning()
});

app.get('/:projectid/code', function(req, res) {
    // TODO: renderCode()
});

app.get('/:projectid/logout', function(req, res) {

    // TODO: doLogout()
});

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/404.html'); // TODO: make the 404.html file lol
});


var server = app.listen(8888, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running on port 8888");
});
















/*
// When a user first hits the study server, first check if they have already participated.
// If not, send them to the screening test.
app.get('/', function (req, res) {
    var workerId = req.query.workerId;

    // Check if there is already data for this worker in Firebase. If there is, the worker has already participated.
    var workerRef = new Firebase(firebaseStudyURL + '/workers/' + workerId);
    workerRef.once('value', function(snapshot) {
        if (snapshot.val() == null)
        {
            // TODO: We need to be able to send back to the client the id of the worker.
            // Options: (1) we could use a templating engine to embed it in the code.
            // Probably need to set up one of the mustache processors.
            // We could also then use templating to set up worker specific content in the templates.
            // Like customizing the instructions. Or hiding or showing the chat system for different versions.

            res.sendFile(__dirname + '/client/screening.html/?workerId=5'); // ?workerId=' + workerId);
        }
        else
        {
            res.sendFile(__dirname + '/client/alreadyParticipated.html');
        }
    });
});

// After finishing the screening, check if they passed. If so, send them to the demographics page.
app.post('/screenSubmit', function (req, res) {
    // TODO: Check if the user passed the screening test.

    console.log('screening submitted');
    console.log(req.body.question1 + " " + req.body.taskTimeMillis);

    res.sendFile(__dirname + '/client/demographics.html');

});


// After finishing the demographics sruvey, send the user to the waiting room.
app.post('/demographics', function (req, res) {
    // TODO: store the demographics data to firebase, associated with the participant.

    res.sendFile(__dirname + '/client/waitingRoom.html');
});



// Start the server.
var server = app.listen(8888, function () {
    var host = server.address().address;
    var port = server.address().port;
    firebaseSetup();
});

function firebaseSetup()
{
    var waitListRef = new Firebase(firebaseStudyURL + '/waitlist');

    // Watch for additions to the waitingList. Once the waiting list meets or exceeds the size of the
    // number of participants required for the nextSession, start the session.
    waitListRef.on("value", function(snapshot) {
        if (nextSession != null)
        {
            var waitlistSizeEstimate = snapshot.numChildren();
            var participantsRequired = nextSession.totalParticipants;
            if (waitlistSizeEstimate >= participantsRequired)
            {
                // There may be participants on the waitlist that have already had a session assignment.
                // If this is the case, do not count these participants.
                // To calculate the actual size of the waitlist, loop over the participants.
                var waitListSize = 0;
                snapshot.forEach(function(childSnapshot) {
                    if (!childSnapshot.val().hasOwnProperty('sessionURL'))
                        waitListSize++;
                });

                if (waitListSize >= participantsRequired)
                {
                    startSession(nextSession, snapshot);
                }
            }
        }
    });
}

// Create the workflows on Firebase and the corresponding initial sessions for each workflow.
function createWorkflows()
{
    var totalWorkflowCount = 2;

    var workflows = {};
    var sessions = {};

    // Create a JSON object for each workflow and a corresponding first session for each workflow
    for (var i=0; i < totalWorkflowCount; i++) {
        var workflow = {};
        workflow.workflowURL = pastebinURL + 'workflowAAAA' + i;
        workflow.timeLimitMins = 10;
        workflow.participantsPerSession = 1;
        workflow.totalSessions = 1;
        var workflowID = i;
        workflows[workflowID] = workflow;

        var session = {};
        session.sessionID = i;
        session.workflowID = i;
        session.workflowURL = workflow.workflowURL;
        session.timeLimitMins = workflow.timeLimitMins;
        session.totalParticipants =  workflow.participantsPerSession;
        sessions[workflowID] = session;
    }

    // Create the initial status, setting up the first session and the current total number of sessions.
    var status = {};
    status.nextSessionID = 0;
    status.totalSessions = totalWorkflowCount;

    var workflowsRef = new Firebase(firebaseStudyURL + '/workflows');
    workflowsRef.set(workflows);

    var sessionsRef = new Firebase(firebaseStudyURL + '/sessions');
    sessionsRef.set(sessions);

    var statusRef = new Firebase(firebaseStudyURL + '/status');
    statusRef.set(status);

    nextSession = sessions[0];
}

*/