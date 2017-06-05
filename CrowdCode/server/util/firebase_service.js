var firebase = require('firebase');
var timestamp = new Date();

var app = firebase.initializeApp({
    apiKey: "AIzaSyCmhzDIbe7pp8dl0gveS2TtOH4n8mvMzsU",
    authDomain: "crowdcode2.firebaseapp.com",
    databaseURL: "https://crowdcode2.firebaseio.com",
    projectId: "crowdcode2",
    storageBucket: "crowdcode2.appspot.com",
    messagingSenderId: "382318704982"
});
var root_ref = firebase.database().ref();

/* Creates an empty project in Firebase
    param project_name text
    param owner_id text
    returns Project ID text
*/
function createProject(project_name, owner_id){
    project_schema = {
        name: project_name,
        owner: owner_id,
        artifacts: {
            ADTs: "null",
            Functions: "null",
            Tests: "null",
        },
        history: {
            artifacts: {
                ADTs: "null",
                Functions: "null",
                Tests: "null"
            },
            events: "null"
        },
        microtasks: {
            implementation: "null",
            review:"null"
        },
        leaderboard: "null",
        questions: "null",
        status: {
            loggedIn: "null",
            loggedOut: "null",
            settings: {
                reviews: true,
                tutorials: true
            },
        notifications: "null"
        },
        workers: "null"
    };

    var created_child = root_ref.child('Projects').push(project_schema);
    return created_child.key;

}


/* Add a new ADT in a project in firebase
    param project_id text
    param ADT name text
    param ADT description text
    param isReadOnly boolean
    param isDeleted boolean
    param structure array of json objects with name and value
    param example array of json objects with name and value
    returns ADT ID text
 */
function createADT(project_id, ADT_name, ADT_description, isReadOnly, isDeleted, structure, example){
    ADT_schema = {
        name: ADT_name,
        description: ADT_description,
        isDeleted: isDeleted,
        isReadOnly: isReadOnly,
        version: 0,
        structure: structure,
        example: example
    }
    var path = 'Projects/' + project_id + '/artifacts/ADTs';
    var hiostory_path = 'Projects/' + project_id + '/history/artifacts/ADTs/';
    var created_child = root_ref.child(path).push(ADT_schema);
    var add_to_history = root_ref.child(hiostory_path).child(created_child.key).child('0').set(ADT_schema);
    return created_child.key;
}


/* Adds a function to a Project in firebase
    param project_id text
    param function name text
    param function type text
    param function description text
    param function code text
    param test Array of test id's
    param stubs Array of json objects with stub names and values
    param parameters Array of json objects with name, type and description
    param functions dependent Array of functions that call this function
    returns function ID text
 */
function createFunction(project_id, function_name, function_type, function_description, function_code, tests, stubs, parameters, functions_dependent){
    function_schema = {
        name: function_name,
        description: function_description,
        code: function_code,
        type: function_type,
        version: 0,
        parameters: parameters,
        stubs: stubs,
        tests: tests,
        dependent: functions_dependent
    }
    var path = 'Projects/' + project_id + '/artifacts/Functions';
    var hiostory_path = 'Projects/' + project_id + '/history/artifacts/Functions';
    var created_child = root_ref.child(path).push(function_schema);
    var add_to_history = root_ref.child(hiostory_path).child(created_child.key).child('0').set(function_schema);
    return created_child.key;
}



/* Add a implementation microtask to a Project in firebase
     param project id tect
     param microtask name text
     param points integer
     param function id text
     param function name text
     param function version integer
     param microtask description text
     param microtask code text
     param isReviewMode boolean
    return micrtotask ID text
 */
function createImplementationMicrotask(project_id, microtask_name, points, function_id, function_name, function_version, microtask_description, microtask_code, isReviewMode, worker_id){
    microtask_schema = {
        name: microtask_name,
        description: microtask_description,
        code: microtask_code,
        test: "null",
        max_points: points,
        awarded_points: 0,
        function_id: function_id,
        function_name: function_name,
        function_version: function_version,
        isReviewMode: false,
        review: "null",
        rating: "null",
        worker: worker_id
    }
    var path = 'Projects/' + project_id + '/microtasks/implementation';
    var created_child = root_ref.child(path).push(microtask_schema);
    return created_child.key;
}


/* Adds a review microtassk to a Project in firebase
    param project id text
    param microtask name
    param points integer
    param reference id text - Id of implemented microtask
    param worker id text
    return microtask ID text
  */
function createReviewMicrotask(project_id, microtask_name, points, reference_id, worker_id){
    microtask_schema = {
        name: microtask_name,
        points: points,
        awarded_points: 0,
        reference_id: reference_id,
        rating: "null",
        review: "null",
        worker: worker_id
    }
    var path = 'Projects/' + project_id + '/microtasks/review';
    var created_child = root_ref.child(path).push(microtask_schema);
    return created_child.key;
}

/* Add a test to a Project in firebase
    param project id text
    param test name text
    param test description text
    param function id text
    param test input array of json object with name and type
    param test output text/object
    returns test ID text
 */
function createTest(project_id, test_name, test_description, function_id, test_input, test_output){
    test_schema = {
        name: test_name,
        description: test_description,
        function_id: function_id,
        input: test_input,
        output: test_output,
        code: "null",
        isPassed: false,
        version: 0,
        isDeleted: false
    }
    var path = 'Projects/' + project_id + '/artifacts/Tests';
    var hiostory_path = 'Projects/' + project_id + '/history/artifacts/Tests';
    var created_child = root_ref.child(path).push(test_schema);
    var add_to_history = root_ref.child(hiostory_path).child(created_child.key).child('0').set(test_schema);
    return created_child.key;
}


/* Add an event in the history
    param project id text
    param artifact type text
    param artifact id text
    param event type text
    param microtask id
    return event ID text
 */
function createEvent(project_id, artifact_type, artifact_id, event_type, microtask_id, event_description ){
    event_schema = {
        artifact_type: artifact_type,
        artifact_id: artifact_id,
        event_type: event_type,
        event_description: event_description,
        microtask_id: microtask_id,
        timestamp: timestamp.getTime()
    }
    var path = 'Projects/' + project_id + '/history/events';
    var created_child = root_ref.child(path).push(event_schema);
    return created_child.key;
}

/* Create a question in a project
    param project id text
    param title text
    param question text
    param points integer
    param owner id text
    param subscribe ids array of worker ids
 */
function createQuestion(project_id, title, question, points, owner_id, subscriber_ids ){
    question_schema = {
        title: title,
        question: question,
        points: points,
        owner_id: owner_id,
        subscriber_ids: subscriber_ids,
        created_time: timestamp.getTime(),
        answers: "null",
        answer_count: 0,
        version: 0,
        updated_time: "null",
        isClosed: false
    }
    var path = 'Projects/' + project_id + '/questions';
    var hiostory_path = 'Projects/' + project_id + '/history/questions';
    var created_child = root_ref.child(path).push(question_schema);
    var add_to_history = root_ref.child(hiostory_path).child(created_child.key).child('0').set(question_schema);
    return created_child.key;
}

/* Create notifications in a project
    param project id text
    param worker id text
    param dat text
    returns Notification ID text
 */
function createNotification(project_id, worker_id, type, data){
    notification_schema = {
        type: type,
        data: data,
        created_time: timestamp.getTime()
    }
    var path = 'Projects/' + project_id + '/notifications';
    var created_child = root_ref.child(path).child(worker_id).push(notification_schema);
    return created_child.key;
}

/* Create a new worker profile in firebase
    param worker name text
    param avatar url text
    returns worker ID text
 */
function createWorker(worker_name, avatar_url)
{
    worker_schema = {
        name: worker_name,
        avatar_url: avatar_url,
        level: 1,
        microtask_history: "null",
        achievements: "null"
    }
    var path = 'Workers';
    var created_child = root_ref.child(path).push(worker_schema);
    return created_child.key;
}


module.exports.createProject = createProject;
module.exports.createADT = createADT;
module.exports.createFunction = createFunction;
module.exports.createImplementationMicrotask = createImplementationMicrotask;
module.exports.createReviewMicrotask = createReviewMicrotask;
module.exports.createTest = createTest;
module.exports.createEvent = createEvent;
module.exports.createQuestion = createQuestion;
module.exports.createNotification = createNotification;
module.exports.createWorker = createWorker;