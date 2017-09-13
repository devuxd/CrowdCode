module.exports = function(FirebaseService, Q) {
  var Projects = new Map();
  var firebase = FirebaseService;
  var q = Q;

  /*  Creates a new element in the Projects Map for all projects
      The new element contains three maps in it - Functions, Tests, and Microtasks
      param project id text
      returns boolean
   */
  function loadProject(project_id) {
    if (Projects.has(project_id) === false) {
      Projects.set(project_id, new Map());
      var Project = Projects.get(project_id);
      Project.set('functions', new Map());
      Project.set('tests', new Map());
      Project.set('microtasks', new Map());
      Project.set('implementationQ', new Array());
      Project.set('reviewQ', new Array());
      Project.set('workers', new Map());

      var functions = Project.get('functions');
      var function_load_result = loadFunctions(project_id);
      if (function_load_result !== null) {
        return function_load_result.then(function(data) {
          var test_load_result = loadTests(project_id);
          if (test_load_result !== null) {
            return test_load_result.then(function(data) {
                var load_project_state = loadState(project_id);
                return load_project_state.then(function(state_exists) {
                    if (state_exists) {
                          var load_microtask_result = loadMicrotasks(project_id);
                            if(load_microtask_result !== null){
                            return load_microtask_result.then(function (data) {
                                return true;
                            }).catch(function (err) {
                                console.log(err);
                                return false;
                            });
                            }
                    } else {
                        functions.forEach(function (content, function_id) {
                            generateImplementationMicrotasks(project_id, function_id);
                        });
                        return true;
                    }
                });
            }).catch(function(err) {
              console.log(err);
            });
          } else {
              var load_project_state = loadState(project_id);console.log('10');
              return load_project_state.then(function(state_exists){console.log('11');
                  console.log(state_exists);
                  if (state_exists) {
                          var load_microtask_result = loadMicrotasks(project_id);console.log('12');
                          if(load_microtask_result !== null){
                          return load_microtask_result.then(function (data) {console.log('13');
                                console.log(Project);
                              return true;
                          }).catch(function (err) {
                              console.log(err);
                              return false;
                          });
                        }
                  } else {
                        functions.forEach(function (content, function_id) {
                          generateImplementationMicrotasks(project_id, function_id);
                      });
                        return true
                  }
              });
          }
        }).catch(function(err) {
          console.log(err);
        });
      }

    } else {
      return null;
    }

  }


  /*Loads the functions map with all the incomplete functions in the project
      param project id text
      param functions Map object
      returns boolean
   */
  function loadFunctions(project_id) {
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var functions_list_promise = firebase.retrieveFunctionsList(project_id);
    var result = functions_list_promise.then(function(functions_list) {
      var function_promise = null;
      functions_list.forEach(function(function_id) {
        function_promise = firebase.retrieveFunction(project_id, function_id);
        function_promise.then(function(data) {
          if (data.isComplete === false) {
            functions.set(function_id, data);
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
  function loadTests(project_id) {
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var test_promise = null;
    functions.forEach(function(content, function_id) {
      if (content.hasOwnProperty('tests') && content.tests !== "null") {
        content.tests.forEach(function(test_id) {
          test_promise = firebase.retrieveTest(project_id, test_id);
          test_promise.then(function(data) {
            tests.set(test_id, data);
          }).catch(function(err) {
            console.log(err);
          });
        });
      }
    });
    return test_promise;
  };

  /*Loads the state of the project saved in firebase and populates the project map
   param project id text
   returns boolean
   */
    function loadState(project_id) {
        var Project = Projects.get(project_id);
        var implementationQ = Project.get('implementationQ');
        var reviewQ = Project.get('reviewQ');
        var workers = Project.get('workers');

        var load_state_promise = firebase.retrieveState(project_id);
        var result = load_state_promise.then(function(data) {
        var state_exists = false;
        if(data.hasOwnProperty('implementationQ') && data.implementationQ !== "null") {
          state_exists = true;
              data.implementationQ.forEach(function (task) {
                  implementationQ.push(task);
              });
          }

          if(data.hasOwnProperty('reviewQ') && data.reviewQ !== "null") {
          state_exists = true;
              data.reviewQ.forEach(function (task) {
                  reviewQ.push(task);
              });
          }

          if(data.hasOwnProperty('workers') && data.workers !== "null") {
          state_exists = true;
               data.workers.forEach(function(value){
                   var worker_id = value.id;

                   if(!(workers.has(worker_id))) {
                      workers.set(worker_id, new Map());
                      var worker = workers.get(worker_id);
                      worker.set('assigned',new Map());
                      worker.set('skipped', new Array());
                      worker.set('completed', new Array());
                  }

                  var worker = workers.get(worker_id);
                  var assigned_task = worker.get('assigned');
                  var skipped_tasks = worker.get('skipped');
                  var completed_tasks = worker.get('completed');

                  if(value.hasOwnProperty('completed_tasks')) {
                      value.completed_tasks.forEach(function (task_id) {
                          completed_tasks.push(task_id);
                      });
                  }

                  if(value.hasOwnProperty('skipped_tasks')) {
                      value.skipped_tasks.forEach(function (task_id) {
                          skipped_tasks.push(task_id);
                      });
                  }

                  if(value.hasOwnProperty('assigned_task')) {
                      assigned_task.set('id', value.assigned_task.id);
                      assigned_task.set('type', value.assigned_task.type);
                  }

                  worker.set('assigned',assigned_task);
                  worker.set('completed',completed_tasks);
                  worker.set('skipped', skipped_tasks);
                  workers.set(worker_id,worker);
              })
          }

          Project.set('implementationQ',implementationQ);
          Project.set('reviewQ',reviewQ);
          Project.set('workers',workers);
          Projects.set(project_id,Project);console.log("EXIST STATE")
          return state_exists;
        }).catch(function(err){
            console.log(err);
            return false;
        });
        return result;
    }



  /*Loads the microtasks map with all the incomplete microtasks in the project from both queues and assigned tasks
   param project id text
   returns boolean
   */
    function loadMicrotasks(project_id) {
        var Project = Projects.get(project_id);
        var implementationQ = Project.get('implementationQ');
        var reviewQ = Project.get('reviewQ');
        var microtasks = Project.get('microtasks');
        var workers = Project.get('workers');
        var result = null;

        implementationQ.forEach(function(microtask_id){
          var microtask_promise = firebase.retrieveMicrotask(project_id,'implementation',microtask_id);
          result = microtask_promise.then(function(microtask_object){
            microtasks.set(microtask_id,microtask_object);
          }).catch(function(err){
                console.log(err);
              return false;
          });
        });

        reviewQ.forEach(function(microtask_id){
            var microtask_promise = firebase.retrieveMicrotask(project_id,'review',microtask_id);
            result = microtask_promise.then(function(microtask_object){
                microtasks.set(microtask_id,microtask_object);
            }).catch(function(err){
              console.log(err);
                return false;
            });
        });

        workers.forEach(function(worker){
            var assigned_task = worker.get('assigned');
            if(assigned_task.has('id') && assigned_task.get('id')!== null){
                var microtask_promise = firebase.retrieveMicrotask(project_id,assigned_task.get('type'),assigned_task.get('id'));
                result = microtask_promise.then(function(microtask_object){
                    microtasks.set(assigned_task.get('id'),microtask_object);
                }).catch(function(err){
                    console.log(err);
                    return false;
                });
            }
        })



        return result;
    }



  /* Generate implementation microtasks for a project
      param project id
   */
  function generateImplementationMicrotasks(project_id, function_id) {
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var microtasks = Project.get('microtasks');
    var implementationQ = Project.get('implementationQ');
    var func = functions.get(function_id);
    var isDependentsComplete = true;
    if (func.dependent !== "null") {
        func.dependent.forEach(function(dependent_function_id) {
        if(functions.has(dependent_function_id)){
            var parent_function = functions.get(dependent_function_id);
            if (parent_function.isAssigned === false  && parent_function.isComplete === false) {
                isDependentsComplete = false;
                generateImplementationMicrotasks(project_id, dependent_function_id, functions, tests, microtasks);
           }
         }
        });
    }
    //Check if all depenedent functions are completely implemented
    if(isDependentsComplete === true) {
        var microtask_name = "Implementment behaviour";
        var microtask_description = "Write a test for a behaviour and write code to pass the test";
        var function_name = func.name;
        var function_version = func.version;
        var function_code = func.code;
        var function_description = func.description;
        var function_return_type = func.returnType;
        var function_parameters = func.parameters;
        var function_header = func.header;
        var max_points = 10;
        var temp_tests = new Array();
        if (func.hasOwnProperty('tests') && func.tests !== "null") {
            func.tests.forEach(function (test_id) {
                temp_tests.push(tests.get(test_id));

            });
        }

        var function_tests = temp_tests;
        var microtask_id = firebase.createImplementationMicrotask(project_id, microtask_name, max_points, function_id, function_name,
            function_description, function_version, microtask_description, function_code, function_return_type, function_parameters, function_header, function_tests, "WRITE");
        var microtask_object = {
            name: microtask_name,
            description: microtask_description,
            code: function_code,
            points: max_points,
            awarded_points: 0,
            promptType: "WRITE",
            type: "DescribeFunctionBehavior",
            functionId: function_id,
            functionName: function_name,
            functionVersion: function_version,
            functionDescription: function_description,
            returnType: function_return_type,
            header: function_header,
            parameters: function_parameters,
            tests: function_tests,
            worker: "null"
        };
        microtasks.set(microtask_id, microtask_object);
        implementationQ.push(microtask_id);
        func.isAssigned = true;
        firebase.updateFunctionStatus(project_id, function_id, func.isComplete, func.isAssigned);
    }else{
        func.isAssigned = false;
        firebase.updateFunctionStatus(project_id, function_id, func.isComplete, func.isAssigned);
    }
      functions.set(function_id,func);
      Project.set('functions',functions);
      Project.set('tests',tests);
      Project.set('microtasks',microtasks);
      Project.set('implementationQ',implementationQ);
      Projects.set(project_id,Project);
      firebase.backupState(project_id,Project);
    return true;
  }

  /* Generate a review microtask for a implementation task
      param project id text
      param microtask id text
   */
  function generateReviewMicrotask(project_id, reference_task__id, functionId, prompt_type) {
    var microtask_object = {
      name: "review the changes",
      points: 5,
      awarded_points: 0,
      reference_id: reference_task__id,
      functionId: functionId,
      type: "Review",
      promptType: prompt_type,
      rating: "null",
      review: "null",
      worker: "null"
    }
    var microtask_id = firebase.createReviewMicrotask(project_id, "review the change", 5, reference_task__id, functionId, prompt_type);
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var reviewQ = Project.get('reviewQ');
    microtasks.set(microtask_id, microtask_object);
    reviewQ.push(microtask_id);
    Project.set('microtasks',microtasks);
    Project.set('reviewQ',reviewQ);
    Projects.set(project_id,Project);
    firebase.backupState(project_id,Project);
    return microtask_id;

  }

  /*Submit implementation microtask
      param project id text
      param microtask id text
   */
  function submitImplementationMicrotask(project_id, microtask_id, funct, microtask_tests, worker_id) {
    let deferred = q.defer();
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var workers = Project.get('workers');
    var worker = workers.get(worker_id);
    var assigned_task = worker.get('assigned');
    var skipped_tasks = worker.get('skipped');
    assigned_task.set('id', null);
    assigned_task.set('type', null);
    var completed_task = worker.get('completed');
    completed_task.push(microtask_id);

    var microtask_object = microtasks.get(microtask_id);
    microtask_object.code = funct.code ? funct.code : "defaultCode";
    microtask_object.header = funct.header;
    microtask_object.tests = microtask_tests.tests;
    microtask_object.worker = worker_id;
    microtask_object.submission = microtask_tests;
    microtask_object.isFunctionComplete = microtask_tests.isDescribeComplete;
    microtasks.set(microtask_id, microtask_object);
    var update_promise = firebase.updateImplementationMicrotask(project_id, microtask_id, funct, microtask_tests, worker_id, microtask_tests.isDescribeComplete);
    update_promise.then(function() {
      let review_id = generateReviewMicrotask(project_id, microtask_id, microtask_object.functionId, "WRITE");
      skipped_tasks.push(review_id);
      deferred.resolve(review_id);
    }).catch(err => {
      deferred.reject(new Error(err));
    });
      worker.set('skipped',skipped_tasks);
      worker.set('assigned',assigned_task);
      worker.set('completed',completed_task);
      workers.set(worker_id,worker);
      Project.set('workers',workers);
      Project.set('microtasks',microtasks);
      Projects.set(project_id,Project);
      firebase.backupState(project_id,Project);
    return deferred.promise;
  }

  /*Submit review microtask
      param project_id text
      param microtask id text
   */
  function submitReviewMicrotask(project_id, microtask_id, review, rating, worker_id) {
    var deferred = q.defer();
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var tests = Project.get('tests');
    var microtasks = Project.get('microtasks');
    var workers = Project.get('workers');
    var worker = workers.get(worker_id);
    var assigned_task = worker.get('assigned');
    assigned_task.set('id', null);
    assigned_task.set('type', null);
    var completed_task = worker.get('completed');
    completed_task.push(microtask_id);


    var microtask_object = microtasks.get(microtask_id);
    microtask_object.rating = rating;
    microtask_object.review = review;
    microtask_object.worker = worker_id;
    microtasks.set(microtask_id, microtask_object);

    var implementation_task_id = microtask_object.reference_id;
    var implementation_object = microtasks.get(implementation_task_id);
    var function_id = implementation_object.functionId;
    var update_promise = firebase.updateReviewMicrotask(project_id, microtask_id, rating, review, worker_id);
    update_promise.then(function() {
      firebase.incrementReviewTasks(project_id, worker_id);
      firebase.incrementPointsScored(project_id, worker_id, 5);
      firebase.updateLeaderBoardScore(project_id, worker_id, 5);
      if (rating === 4 || rating === 5) {
        //update function object and tests

        var function_object = functions.get(function_id);
        function_object.version = implementation_object.functionVersion + 1;
        function_object.code = implementation_object.code;
        var test_set = implementation_object.tests;
        var test_list = new Array();
        for (var test_id = 0; test_id < test_set.length; test_id++) {
          let testId  = function_id + '' + test_id;
          let mytest = test_set[test_id];
          mytest.id = testId;
          mytest.functionName = function_object.name;
          test_list.push(testId);
          tests.set(testId, mytest);
        }
        function_object.tests = test_list;
        var submission_object = implementation_object.submission;
        if(submission_object.hasOwnProperty('requestedFunctions') && submission_object.requestedFunctions !== "null"){
          submission_object.requestedFunctions.forEach(function(func){
                var dependent_id = firebase.createFunction(project_id,func.name,"null",func.description,"#Implement the function",func.returnType,func.parameters,"null","null","null","null",false);
                var dependent_object = {
                    name: func.name,
                    header: "null",
                    description: func.description,
                    code: "\n{\n//#Implement the function\n\nreturn {};\n}",
                    linesOfCode: 2,
                    returnType: func.returnType,
                    version: 0,
                    parameters: func.parameters,
                    stubs: "null",
                    tests: "null",
                    ADTsId: "null",
                    dependent: "null",
                    isComplete: false,
                    isAssigned: false,
                    isApiArtifact: false
                }
                functions.set(dependent_id,dependent_object);
                if(function_object.dependent === "null"){
                  function_object.dependent = new Array();
                  function_object.dependent.push(dependent_id);

                }else{
                    function_object.dependent.push(dependent_id);
                }
            });
        }


        functions.set(function_id, function_object);
        //Update function and test in firebase
        var function_update_promise = firebase.updateFunction(project_id, function_id, function_object.name, function_object.header, function_object.description, function_object.code, function_object.returnType, function_object.parameters, function_object.stubs, function_object.tests, "null", function_object.dependent, function_object.isComplete, false, function_object.isApiArtifact);
        test_list.forEach(function(test_id) {
          var test_object = tests.get(test_id);
          var test_update_promise = firebase.updateTest(project_id, function_id, test_id, test_object);
        });

        //remove function and its tests from memory
        if (implementation_object.isFunctionComplete === true) {
          firebase.updateFunctionStatus(project_id, function_id, true, false);
          functions.delete(implementation_object.function_id);
          test_list.forEach(function(test_id) {
            tests.delete(test_id);
          });
          Project.set('functions',functions);
          Project.set('tests',tests);
            functions.forEach(function(content, function_id) {
                var temp_function = functions.get(function_id);
                if (temp_function.isAssigned === false) {
                    generateImplementationMicrotasks(project_id, function_id);
                }
            });

          //deferred.resolve({"isFunctionComplete": true, "functionApproved" : true});
        } else {
          //deferred.resolve({"isFunctionComplete": false, "functionApproved" : true});
          //Generate new implementation task with function
          generateImplementationMicrotasks(project_id, function_id);
        }

        firebase.incrementImplementationTasks(project_id, implementation_object.worker);
      } else if (rating === 1 || rating === 2 || rating === 3) {
        //No changes made to function
        // Generate new implementation task with function
        generateImplementationMicrotasks(project_id, function_id);
        //deferred.resolve({"isFunctionComplete": false, "functionApproved": false});
        firebase.incrementRejectedTasks(project_id, implementation_object.worker);
      }
      var points = implementation_object.points * (rating / 5);
      firebase.incrementPointsScored(project_id, implementation_object.worker, points);
      firebase.updateLeaderBoardScore(project_id, implementation_object.worker, points);
      firebase.createNewsFeed(project_id, implementation_object.worker, points, false, "none", implementation_object.points, implementation_task_id, "DescribeFunctionBehavior", rating, "WorkReviewed").then(function() {
        firebase.createNewsFeed(project_id, worker_id, 5, false, "none", 5, microtask_id, "Review", -1, "SubmittedReview").then(function() {
          deferred.resolve();
        }, function(error) {
          deferred.reject(error);
        });
      }).catch(function(err) {
        deferred.reject(err);
      });

    }).catch(function(err) {
      deferred.reject(err);
    });
      worker.set('assigned',assigned_task);
      worker.set('completed',completed_task);
      workers.set(worker_id,worker);
      Project.set('workers',workers);
      Project.set('functions',functions);
      Project.set('tests',tests);
      Project.set('microtasks',microtasks);
      Project.set('implementationQ',implementationQ);
      Projects.set(project_id,Project);
    firebase.backupState(project_id,Project);
    return deferred.promise;
  }

  /* Fetch a microtask in the queue
      param project_id text
      return microtask object
   */
  function fetchMicrotask(project_id, worker_id) {
    var Project = Projects.get(project_id);
    var functions = Project.get('functions');
    var microtasks = Project.get('microtasks');
    var reviewQ = Project.get('reviewQ');
    var implementationQ = Project.get('implementationQ');
    var workers = Project.get('workers');
    if (workers.has(worker_id)) {
      var worker = workers.get(worker_id);
    } else {
      firebase.createProjectWorker(project_id, worker_id);
      workers.set(worker_id, new Map());
      var worker = workers.get(worker_id);
      worker.set('assigned', new Map());
      worker.set('completed', new Array());
      worker.set('skipped', new Array());
      let assigned_task = worker.get('assigned');
      assigned_task.set('id', null);
      assigned_task.set('type', null);
    }

    var microtask_id;
    var microtask_type;
    var assigned_task = worker.get('assigned');
    var skipped_task = worker.get('skipped');
    var completed_task = worker.get('completed');console.log('fetching for '+worker_id+ " ===== "+assigned_task.get('id'));
    //If the worker doesnt have any task already assigned
    if (assigned_task.get('id') === null) {
        var review_skipped = 0;
      var implementation_skipped = 0;

      //Check if tasks that are already skipped available or if review tasks are not for implementation by the worker
      reviewQ.forEach(function(id) {
        var review_object = microtasks.get(id);
        if (skipped_task.indexOf(id) >= 0 || completed_task.indexOf(review_object.reference_id) >= 0) {
          review_skipped++;
        }
      });
      implementationQ.forEach(function(id) {
        if (skipped_task.indexOf(id) >= 0) {
          implementation_skipped++;
        }
      });

      var review_available = reviewQ.length - review_skipped;
      var implementation_available = implementationQ.length - implementation_skipped;
      //If there are no review tasks go to implementation tasks
      if (review_available === 0) {
        //If there are no implementation tasks return null
        if (implementation_available === 0) {
          microtask_id = null;
        } else {
          var temp = new Array();
          do {
            //Pick the first task from implementation queue
            microtask_id = implementationQ.shift();
            //If the task was already skipped by the worker put in a temp array and try the next task
            if (skipped_task.indexOf(microtask_id) >= 0) {
              temp.push(microtask_id);
              microtask_id = null;
            }
          } while (microtask_id === null);
          //put the rejected tasks back in the queue
          temp.forEach(function(id) {
            implementationQ.unshift(id);
          });
          microtask_type = "DescribeFunctionBehavior";
        }
      }
      //If there are review taskss in the queue assigned those first
      if (review_available > 0) {
        var temp = new Array();
        do {
          //Pick the first task from review queue
          microtask_id = reviewQ.shift();
          var review_object = microtasks.get(microtask_id);
          //If the task was already skipped by the worker put in a temp array and try the next task
          if (skipped_task.indexOf(microtask_id) >= 0 || completed_task.indexOf(review_object.reference_id) >= 0) {
            temp.push(microtask_id);
            microtask_id = null;
          }
        } while (microtask_id === null);
        //put the rejected tasks back in the queue
        temp.forEach(function(id) {
          reviewQ.unshift(id);
        });
        microtask_type = "Review";
      }
    }
    //If the worker already has as on going task
    else {
      microtask_id = assigned_task.get('id');
      microtask_type = assigned_task.get('type');
    }


    //Check if there was any task assigned
    if (microtask_id !== null) {
      assigned_task.set('id', microtask_id);
      assigned_task.set('type', microtask_type);
      var microtask_object = microtasks.get(microtask_id);
      var funct = functions.get(microtask_object.functionId);
      microtask_object.function = funct;
      var return_object = {
        "microtaskKey": microtask_id,
        "type": microtask_type,
        "object": microtask_object
      };

    } else {
      var return_object = {
        "microtaskKey": undefined
      };
    }
      worker.set('assigned',assigned_task);
      worker.set('completed',completed_task);
      workers.set(worker_id,worker);
      Project.set('workers',workers);
      Project.set('functions',functions);
      Project.set('microtasks',microtasks);
      Project.set('implementationQ',implementationQ);
      Project.set('reviewQ',reviewQ);
      Projects.set(project_id,Project);
      firebase.backupState(project_id,Project);
    return return_object;
  }


  function skipMicrotask(project_id, worker_id) {
    var Project = Projects.get(project_id);
    var microtasks = Project.get('microtasks');
    var implementationQ = Project.get('implementationQ');
    var reviewQ = Project.get('reviewQ');
    var workers = Project.get('workers');
    var return_object = null;
    if (workers.has(worker_id)) {
      var worker = workers.get(worker_id);
      var skipped_task = worker.get('skipped');
      var assigned_task = worker.get('assigned');

      //Can add upper limit to allowed number of skips
      if (skipped_task.length >= 0) {
        var microtask_id = assigned_task.get('id');
        var microtask_type = assigned_task.get('type');
        //Check if there are tasks available
        if (reviewQ.length > 0 || implementationQ.length > 0) {
          var review_skipped = 0;
          var implementation_skipped = 0;

          skipped_task.push(microtask_id);
          if (microtask_type === 'DescribeFunctionBehavior') {
              implementationQ.push(microtask_id);
              Project.set('implementationQ', implementationQ);
          }

          if (microtask_type === 'Review') {
              reviewQ.push(microtask_id);
              Project.set('reviewQ', reviewQ);
          }

            //Check if tasks that are already skipped available
          reviewQ.forEach(function(id) {
            if (skipped_task.indexOf(id) >= 0) {
              review_skipped++;
            }
          });
          implementationQ.forEach(function(id) {
            if (skipped_task.indexOf(id) >= 0) {
              implementation_skipped++;
            }
          });
          var review_available = reviewQ.length - review_skipped;
          var implementation_available = implementationQ.length - implementation_skipped;

          //if there are no tasks that are not skipped then clear the list of skipped tasks
          if (!(review_available > 0 || implementation_available > 0)) {
            skipped_task = new Array();
          }

          worker.set('skipped', skipped_task);
          assigned_task.set('id', null);
          assigned_task.set('type', null);

        }
      }
      return_object = fetchMicrotask(project_id, worker_id);
    }
      worker.set('assigned',assigned_task);
      worker.set('skipped',skipped_task);
      workers.set(worker_id,worker);
      Project.set('workers',workers);
      Project.set('microtasks',microtasks);
      Project.set('implementationQ',implementationQ);
      Project.set('reviewQ',reviewQ);
      Projects.set(project_id,Project);
      firebase.backupState(project_id,Project);
    return return_object;
  }

  return {
    loadProject: loadProject,
    submitImplementationMicrotask: submitImplementationMicrotask,
    submitReviewMicrotask: submitReviewMicrotask,
    fetchMicrotask: fetchMicrotask,
    skipMicrotask: skipMicrotask
  };
}
