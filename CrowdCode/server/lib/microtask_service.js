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
function loadProjects() {
    var project_list_promise = firebase.retrieveProjectsList();
    project_list_promise.then(function(project_list){
        project_list.forEach(function(project_id){
            Projects.set(project_id, new Map());
            var Project = Projects.get(project_id);
            Project.set('functions',new Map());
            Project.set('tests',new Map());
            Project.set('microtasks',new Map());
            Project.set('implementationQ', new Array());
            Project.set('reviewQ',new Array());
            var functions = Project.get('functions');
            var function_load_result = loadFunctions(project_id);
            function_load_result.then(function(data){
                var test_load_result = loadTests(project_id);
                test_load_result.then(function(data){
                    functions.forEach(function(content,function_id){
                        generateImplementationMicrotasks(project_id,function_id);
                    });
                });
            });
        })
    })


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
        var function_promise;
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
    var test_promise;
    functions.forEach(function(content, function_id){
        content.tests.forEach(function(test_id){
            test_promise = firebase.retrieveTest(project_id, test_id);
            test_promise.then(function (data) {
                tests.set(test_id, data);
            });
        });

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
        var max_points = 10;
        var temp_tests = '{';
        func.tests.forEach(function(test_id){
            if(temp_tests === '{'){
                temp_tests +=  test_id + ': {' + tests.get(test_id).toString() +'}';
            }else {
                temp_tests += ',' + test_id + ': {' + tests.get(test_id).toString() + '}';
            }
        });
        temp_tests += '}';
        var function_tests = JSON.parse(temp_tests);
        var microtask_id = firebase.createImplementationMicrotask(project_id,microtask_name,max_points,function_id,function_name,function_version,microtask_description,function_code,function_tests);

        var microtask_object = {
            name: microtask_name,
            description: microtask_description,
            code: function_code,
            max_points: max_points,
            awarded_points: 0,
            function_id: function_id,
            function_name: function_name,
            function_version: function_version,
            tests: function_tests,
            worker: "null"
        };
        microtasks.set(microtask_id,microtask_object);
        implementationQ.push(microtask_id);
        func.isAssigned = true;
        firebase.updateFunctionStatus(project_id,function_id,func.isComplete,func.isAssigned);

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
function fetchMicrotask(project_id){
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var reviewQ = Project.get('reviewQ');
    var microtask_id;
    var microtask_type;
    if(reviewQ.length === 0){
        var implementationQ= Project.get('implementationQ');
        microtask_id = implementationQ.shift();
        microtask_type = "implementation";
    }
    if(reviewQ.length > 0){
        microtask_id = reviewQ.shift();
        microtask_type = "review";
    }
    var microtask_object = microtasks.get(microtask_id);
    var return_object = {"id":microtask_id,"type":microtask_type,"object":microtask_object};
    return return_object;
}

module.exports.loadProjects = loadProjects;
module.exports.submitImplementationMicrotask = submitImplementationMicrotask;
module.exports.submitReviewMicrotask = submitReviewMicrotask;
module.exports.fetchMicrotask = fetchMicrotask;