const wagner = require('wagner-core');
var Projects = new Map();
var firebase;
wagner.invoke(function(FirebaseService){
    firebase = FirebaseService;
});

/*  Creates a new element in the Projects Map for all projects
    The new element contains three maps in it - Functions, Tests, and Microtasks
    param project id text
    returns boolean
 */
function loadProject(project_id) {
    if(Projects.has(project_id) === false) {
        Projects.set(project_id, new Map());
        var Project = Projects.get(project_id);
        Project.set('functions', new Map());
        Project.set('tests', new Map());
        Project.set('microtasks', new Map());
        Project.set('implementationQ', new Array());
        Project.set('reviewQ', new Array());
        Project.set('workers',new Map());
        var result = null;
        var functions = Project.get('functions');
        var function_load_result = loadFunctions(project_id);
        if (function_load_result !== null) {
            result =function_load_result.then(function (data) {
                var test_load_result = loadTests(project_id);
                if (test_load_result !== null) {
                    test_load_result.then(function (data) {
                        functions.forEach(function (content, function_id) {
                            generateImplementationMicrotasks(project_id, function_id);
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
                }else {
                    functions.forEach(function (content, function_id) {
                        generateImplementationMicrotasks(project_id, function_id);
                    });
                }
                return Project.get('implementationQ');
            }).catch(function (err) {
                console.log(err);
            });
        }
        return result;
    }
    else {
        return null;
    }

}


/*Loads the functions map with all the incomplete functions in the project
    param project id text
    param functions Map object
    returns boolean
 */
function loadFunctions(project_id){
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var functions_list_promise = firebase.retrieveFunctionsList(project_id);
    var result = functions_list_promise.then(function(functions_list){
        var function_promise = null;
       functions_list.forEach(function(function_id){
           function_promise = firebase.retrieveFunction(project_id,function_id);
           function_promise.then(function(data){
              if(data.isComplete === false && data.isAssigned === false){
                  functions.set(function_id,data);
              }
           });
       });
      return function_promise;
    });
    return result;
}


/*Loads the tests map with all the tests for incomplete functions in the project
 param project id text
 param tests Map object
 returns boolean
 */
function loadTests(project_id){
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var test_promise = null;
    functions.forEach(function(content, function_id){
        if(content.tests !== "null") {
            content.tests.forEach(function (test_id) {
                test_promise = firebase.retrieveTest(project_id, test_id);
                test_promise.then(function (data) {
                    tests.set(test_id, data);
                }).catch(function(err){
                    console.log(err);
                });
            });
        }
    });return test_promise;
};


/* Generate implementation microtasks for a project
    param project id
 */
function generateImplementationMicrotasks(project_id, function_id){
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var microtasks = Project.get('microtasks');
    var implementationQ= Project.get('implementationQ');
    var func = functions.get(function_id);

    if(func.dependent == "null") {
        var microtask_name = "Implementment behaviour";
        var microtask_description = "Write a test for a behaviour and write code to pass the test";
        var function_name = func.name;
        var function_version = func.version;
        var function_code = func.code;
        var function_description = func.description;
        var function_return_type = func.returnType;
        var function_parameters = func.parameters;
        var max_points = 10;
        var temp_tests = '{';
        if(func.tests !== "null") {
            func.tests.forEach(function (test_id) {
                if (temp_tests === '{') {
                    temp_tests += test_id + ': {' + tests.get(test_id).toString() + '}';
                } else {
                    temp_tests += ',' + test_id + ': {' + tests.get(test_id).toString() + '}';
                }
            });
        }
        temp_tests += '}';
        var function_tests = JSON.parse(temp_tests);
        var microtask_id = firebase.createImplementationMicrotask(project_id,microtask_name,max_points,function_id,function_name, function_description, function_version,microtask_description,function_code, function_return_type, function_parameters, function_tests);

        var microtask_object = {
            name: microtask_name,
            description: microtask_description,
            code: function_code,
            max_points: max_points,
            awarded_points: 0,
            function_id: function_id,
            function_name: function_name,
            function_version: function_version,
            function_description: function_description,
            return_type: function_return_type,
            parameters: function_parameters,
            tests: function_tests,
            worker: "null"
        };
        microtasks.set(microtask_id,microtask_object);
        implementationQ.push(microtask_id);
        func.isAssigned = true;
        //firebase.updateFunctionStatus(project_id,function_id,func.isComplete,func.isAssigned);

    }
    else{
        func.dependent.forEach(function(dependent_function_id){
            generateImplementationMicrotasks(project_id,dependent_function_id,functions,tests,microtasks);
        });
        generateImplementationMicrotasks(project_id,function_id);
    }
}

/* Generate a review microtask for a implementation task
    param project id text
    param microtask id text
 */
function generateReviewMicrotask(project_id, reference_task__id){
    var microtask_object = {
        name: "review the changes",
        points: points,
        awarded_points: 0,
        reference_id: reference_task__id,
        rating: "null",
        review: "null",
        worker:"null"
    }
    var microtask_id = firebase.createReviewMicrotask(project_id,"review the change",10,reference_task__id);
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var reviewQ = Project.get('reviewQ');
    microtasks.set(microtask_id,microtask_object);
    reviewQ.set(microtask_id);

}

/*Submit implementation microtask
    param project id text
    param microtask id text
 */
function submitImplementationMicrotask(project_id,microtask_id, microtask_code, microtask_tests, worker_id){
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var workers = Project.get('workers');
    var worker = workers.get(worker_id);
    var assigned_task = worker.get('assigned');
    assigned_task.set('id',null);
    assigned_task.set('type',null);
    var completed_task = worker.get('completed');
    completed_task.push(microtask_id);

    var microtask_object = microtasks.get(microtask_id);
    microtask_object.code = microtask_code;
    microtask_object.tests = microtask_tests;
    microtask_object.worker = worker_id;
    microtasks.set(microtask_id, microtask_object);
    var update_promise = firebase.updateImplementationMicrotask(project_id,microtask_id,microtask_code,microtask_tests,worker_id);
    update_promise.then(function(){
        generateReviewMicrotask(project_id,microtask_id);
    })

}

/*Submit review microtask
    param project_id text
    param microtask id text
 */
function submitReviewMicrotask(project_id,microtask_id,review, rating, worker_id){
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var microtasks = Project.get('microtasks');
    var workers = Project.get('workers');
    var worker = workers.get(worker_id);
    var assigned_task = worker.get('assigned');
    assigned_task.set('id',null);
    assigned_task.set('type',null);
    var completed_task = worker.get('completed');
    completed_task.push(microtask_id);

    var microtask_object = microtasks.get(microtask_id);
    microtask_object.rating = rating;
    microtask_object.review = review;
    microtask_object.worker = worker_id;
    microtasks.set(microtask_id, microtask_object);

    var implementation_task_id = microtask_object.reference_id;
    var implementation_object = microtasks.get(implementation_task_id);
    var function_id = implementation_object.function_id;

    var update_promise = firebase.updateReviewMicrotask(project_id,microtask_id,rating,review,worker_id);
    update_promise.then(function(){
        if(rating === 4 || rating === 5){
            //update function object and tests
            var function_object = functions.get(function_id);
            function_object.code = implementation_object.code;
            var test_set = implementation_object.tests;
            var test_list = new Array();
            test_set.keys(test).forEach(function(test_id){
                test_list.push(test_id);
                tests.set(test_id,test[test_id]);

            });
            if(implementation_object.isFunctionComplete === true){
                //Update function and test in firebase and remove function and its tests from memory
                var function_update_promise = firebase.updateFunction(project_id,function_id,function_object.name,function_object.type,function_object.description,function_object.code,function_object.tests,function_object.stubs,function_object.parameters,function_object.dependent,function_object.isFunctionComplete, function_object.isAssigned);
                function_update_promise.remove(implementation_object.function_id);
                test_list.forEach(function(test_id){
                    var test_object = tests.get(test_id);
                    var test_update_promise = firebase.updateTest(project_id,function_id, test_id, test_object.type,test_object.name,test_object.description,test_object.input, test_object.output,test_object.result);
                    test_update_promise.then(function(){
                        tests.remove(test_id);
                    });
                });

            }
            if(implementation_object.isFunctionComplete === false)
            {
                //Generate new implementation task with function
                generateImplementationMicrotasks(project_id,function_id);
            }
        }
        else if( rating === 1 || rating === 2 || rating === 3){
            //No changes made to function
            // Generate new implementation task with function
            generateImplementationMicrotasks(project_id,function_id);
        }

    })

}

/* Fetch a microtask in the queue
    param project_id text
    return microtask object
 */
function fetchMicrotask(project_id, worker_id){
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var reviewQ = Project.get('reviewQ');
    var workers = Project.get('workers');
    if(workers.has(worker_id)){
        var worker = workers.get(worker_id);
    }else{
        workers.set(worker_id, new Map());
        var worker = workers.get(worker_id);
        worker.set('assigned',new Map());
        worker.set('completed', new Array());
        worker.set('skipped',new Array());
        let assigned_task = worker.get('assigned');
        assigned_task.set('id',null);
        assigned_task.set('type',null);
    }

    var microtask_id;
    var microtask_type;
    var assigned_task = worker.get('assigned');
    var skipped_task = worker.get('skipped');
    //If the worker doesnt have any task already assigned
    if(assigned_task.get('id') === null) {
        //If there are no review tasks go to implementation tasks
        if (reviewQ.length === 0) {
            var implementationQ = Project.get('implementationQ');
            //If there are no implementation tasks return null
            if (implementationQ.length === 0) {
                microtask_id = null;
            } else {
                var temp = new Array();
                do{
                    //Pick the first task from implementation queue
                    microtask_id = implementationQ.shift();
                    //If the task was already skipped by the worker put in a temp array and try the next task
                    if(skipped_task.indexOf(microtask_id) >= 0){
                        temp.push(microtask_id);
                        microtask_id = null;
                    }
                }while(microtask_id === null);
                //put the rejected tasks back in the queue
                temp.forEach(function(id){
                   implementationQ.unshift(id);
                });
                microtask_type = "DescribeFunctionBehavior";
            }
        }
        //If there are review taskss in the queue assigned those first
        if (reviewQ.length > 0) {
            var temp = new Array();
            do{
                //Pick the first task from review queue
                microtask_id = reviewQ.shift();
                //If the task was already skipped by the worker put in a temp array and try the next task
                if(skipped_task.indexOf(microtask_id) >= 0){
                    temp.push(microtask_id);
                    microtask_id = null;
                }
            }while(microtask_id === null);
            //put the rejected tasks back in the queue
            temp.forEach(function(id){
                reviewQ.unshift(id);
            });
            microtask_type = "Review";
        }
    }
    //If the worker already has as on going task
    else{
        microtask_id = assigned_task.get('id');
        microtask_type = assigned_task.get('type');
    }


    //Check if there was any task assigned
    if(microtask_id !== null) {
        assigned_task.set('id',microtask_id);
        assigned_task.set('type',microtask_type);
        var microtask_object = microtasks.get(microtask_id);
        var return_object = {"microtaskKey":microtask_id,"type":microtask_type,"object":microtask_object};
    }
    else{
        var return_object = {"microtaskKey":"none"};
    }
    return return_object;
}


function skipMicrotask(project_id, worker_id){
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var implementationQ= Project.get('implementationQ');
    var reviewQ = Project.get('reviewQ');
    var workers = Project.get('workers');
    var return_object =  null;
    if(workers.has(worker_id)) {
        var worker = workers.get(worker_id);
        var skipped_task = worker.get('skipped');
        var assigned_task = worker.get('assigned');

        //Can add upper limit to allowed number of skips
        if(skipped_task.length >= 0 ){
            var microtask_id = assigned_task.get('id');
            var microtask_type = assigned_task.get('type');


            skipped_task.push(microtask_id);
            assigned_task.set('id',null);
            assigned_task.set('type',null);

            if(microtask_type === "DescribeFunctionBehavior"){
                implementationQ.unshift(microtask_id);
            }
            if(microtask_type === 'Review'){
                reviewQ.unshift(microtask_id);
            }
        }
        return_object = fetchMicrotask(project_id,worker_id);
    }
    return return_object;
}

module.exports.loadProject = loadProject;
module.exports.submitImplementationMicrotask = submitImplementationMicrotask;
module.exports.submitReviewMicrotask = submitReviewMicrotask;
module.exports.fetchMicrotask = fetchMicrotask;
module.exports.skipMicrotask = skipMicrotask;