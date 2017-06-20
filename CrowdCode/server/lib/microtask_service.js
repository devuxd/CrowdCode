const wagner = require('wagner-core');
var Projects = new Map();
var firebase;
wagner.invoke(function(FirebaseService){
    firebase = FirebaseService;
});

/* Creates a new element in the Projects Map with project id as key
    The new element contains three maps in it - Functions, Tests, and Microtasks
    param project id text
    returns boolean
 */
function loadProject(project_id) {
    Projects.set(project_id, new Map());
    var Project = Projects.set(project_id, new Map());
    Project.set('functions',new Map());
    Project.set('tests',new Map());
    Project.set('microtasks',new Map());
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var microtasks = Project.get('microtasks');
    var function_load_result = loadFunctions(project_id,functions);
    function_load_result.then(function(data){
        var test_load_result = loadTests(project_id,tests,functions);
        test_load_result.then(function(data){
            functions.forEach(function(content,function_id){
                generateImplementationMicrotasks(project_id,function_id,functions,tests,microtasks);
            });

        });
    });

}


/*Loads the functions map with all the incomplete functions in the project
    param project id text
    param functions Map object
    returns boolean
 */
function loadFunctions(project_id,functions){
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
function loadTests(project_id,tests,functions){
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
function generateImplementationMicrotasks(project_id, function_id, functions, tests, microtasks){
    var func = functions.get(function_id);

    if(func.dependent == "null") {
        var microtask_name = "Implementment behaviour";
        var microtask_description = "Write a test for a behaviour and write code to pass the test";
        var function_name = func.name;
        var function_version = func.version;
        var function_code = func.code;
        var max_points = 10;
        var function_tests = '{';
        func.tests.forEach(function(test_id){
            if(function_tests === '{'){
                function_tests += '{' + test_id + ':' + tests.get(test_id).toString() +'}';
            }else {
                function_tests += ',{' + test_id + ':' + tests.get(test_id).toString() + '}';
            }
        });
        function_tests += '}';

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
        func.isAssigned = true;
        firebase.updateFunctionStatus(project_id,function_id,func.isComplete,func.isAssigned);

    }
    else{
        func.dependent.forEach(function(dependent_function_id){
            generateImplementationMicrotasks(project_id,dependent_function_id,functions,tests,microtasks);
        });
        generateImplementationMicrotasks(project_id,function_id,functions,tests,microtasks);
    }
}




module.exports.loadProject = loadProject;