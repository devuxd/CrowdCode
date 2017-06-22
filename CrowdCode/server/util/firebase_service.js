module.exports = function(AdminFirebase) {
  var timestamp = new Date();
  const root_ref = AdminFirebase.database().ref();
  return {

    /* Creates an empty project in Firebase
     param project_name text
     param owner_id text
     returns Project ID text
     */
    createProject: function(project_name, owner_id) {
      project_schema = {
        name: project_name,
        owner: owner_id,
        isComplete: "null",
        artifacts: {
          ADTs: "null",
          Functions: "null",
          Tests: "null"
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
          review: "null"
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

      var created_child = root_ref.child('Projects').child(project_name).set(project_schema);
      return created_child.key;

    },

    /* Retrieve list of projects
     result promise object
     */
    retrieveProjectsList: function() {
      var path = 'Projects';
      var promise = root_ref.child(path).once("value").then(function(data) {
        var projects_list = [];
        data.forEach(function(project) {
          projects_list.push(project.key);
        });
        return projects_list;
      });
      return promise;
    },

    /*Retrieve Project from Projects
     param project id text
     param function id text
     return promise object
     */
    retrieveProject: function(project_id) {
      var path = 'Projects/' + project_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },


    /* ---------------- ADT API ------------- */
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
    createADT: function(project_id, ADT_name, ADT_description, isReadOnly, structure, example) {
      ADT_schema = {
        name: ADT_name,
        description: ADT_description,
        isDeleted: false,
        isReadOnly: isReadOnly,
        version: 0,
        structure: structure,
        example: example
      }
      var path = 'Projects/' + project_id + '/artifacts/ADTs';
      var history_path = 'Projects/' + project_id + '/history/artifacts/ADTs/';
      var created_child = root_ref.child(path).push(ADT_schema);
      var add_to_history = root_ref.child(history_path).child(created_child.key).child('0').set(ADT_schema);
      return created_child.key;
    },

    /*Retrieve ADT from Project
     param project id text
     param ADT id text
     return promise object
     */
    retrieveADT: function(project_id, ADT_id) {
      var path = 'Projects/' + project_id + '/artifacts/ADTs/' + ADT_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },

    /* ---------------- End ADT API ------------- */

    /* ---------------- Function API ------------- */
    /* Adds a function to a Project in firebase
     param project_id text
     param function name text
     param function type text
     param function description text
     param function code text
     param test Array of test id's
     param stubs Array of json objects with stub names and values
     param parameters Array of json objects with name, type and description
     param functions dependent Array of functions that this function calls
     returns function ID text
     */
    createFunction: function(project_id, function_name, function_type, function_description, function_code, tests, stubs, parameters, functions_dependent) {
      function_schema = {
        name: function_name,
        description: function_description,
        code: function_code,
        type: function_type,
        version: 0,
        parameters: parameters,
        stubs: stubs,
        tests: tests,
        dependent: functions_dependent,
        isComplete: false,
        isAssigned: false
      }
      var path = 'Projects/' + project_id + '/artifacts/Functions';
      var history_path = 'Projects/' + project_id + '/history/artifacts/Functions';
      var created_child = root_ref.child(path).push(function_schema);
      var add_to_history = root_ref.child(history_path).child(created_child.key).child('0').set(function_schema);
      return created_child.key;
    },

    /* Update code in function in a project
     param project  id text
     param function id text
     param function name text
     param function type text
     param function description text
     param function code text
     param test Array of test id's
     param stubs Array of json objects with stub names and values
     param parameters Array of json objects with name, type and description
     param functions dependent Array of functions that call this function
     param isComplete Boolean if the implementation of this function is complete
     param isAssigned Boolean if the function has already a microtask
     return update promise object
     */
    updateFunction: function(project_id, function_id, function_name, function_type, function_description, function_code, tests, stubs, parameters, functions_dependent, isComplete, isAssigned) {
      var path = 'Projects/' + project_id + '/artifacts/Functions/' + function_id;
      var history_path = 'Projects/' + project_id + '/history/artifacts/Functions/' + function_id;
      root_ref.child(history_path).once("value", function(data) {
        var version_number = data.numChildren();
        function_schema = {
          name: function_name,
          description: function_description,
          code: function_code,
          type: function_type,
          version: version_number,
          parameters: parameters,
          stubs: stubs,
          tests: tests,
          dependent: functions_dependent,
          isComplete: isComplete,
          isAssigned: isAssigned
        }

        var update_promise = root_ref.child(path).update(function_schema);
        var add_to_history = root_ref.child(history_path).child(version_number).set(function_schema);
        return update_promise;
      });
    },

    /* Update complete and assigned status of a function in a project
     param project  id text
     param function id text
     param isComplete Boolean if the implementation of this function is complete
     param isAssigned Boolean if the function has already a microtask
     */
    updateFunctionStatus: function(project_id, function_id, isComplete, isAssigned) {
      var function_promise = this.retrieveFunction(project_id, function_id);
      function_promise.then(function(func) {
        var path = 'Projects/' + project_id + '/artifacts/Functions/' + function_id;
        var history_path = 'Projects/' + project_id + '/history/artifacts/Functions/' + function_id;
        root_ref.child(history_path).once("value", function(data) {
          var version_number = data.numChildren();
          function_schema = {
            name: func.name,
            description: func.description,
            code: func.code,
            type: func.type,
            version: version_number,
            parameters: func.parameters,
            stubs: func.stubs,
            tests: func.tests,
            dependent: func.dependent,
            isComplete: isComplete,
            isAssigned: isAssigned
          }

          root_ref.child(path).update(function_schema);
          var add_to_history = root_ref.child(history_path).child(version_number).set(function_schema);
          return true;
        });
      });
    },

    /*Retrieve function from Project
     param project id text
     param function id text
     return promise object
     */
    retrieveFunction: function(project_id, function_id) {
      var path = 'Projects/' + project_id + '/artifacts/Functions/' + function_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },

    /* Retrieve list of functions
        param Project_id text
     result promise object
     */
    retrieveFunctionsList: function(project_id) {
      var path = 'Projects/' + project_id + '/artifacts/Functions';
      var promise = root_ref.child(path).once("value").then(function(data) {
        var functions_list = [];
        data.forEach(function(func) {
          functions_list.push(func.key);
        });
        return functions_list;
      });
      return promise;
    },
    /* ---------------- End Function API ------------- */


    /* ---------------- Test API ------------- */
    /* Add a test to a Project in firebase
     param project id text
     param test name text
     param test description text
     param function id text
     param test input array of json object with name and type
     param test output text/object
     returns test ID text
     */
    createTest: function(project_id, function_id, test_type, test_name, test_description, test_input, test_output) {
      test_schema = {
        name: test_name,
        description: test_description,
        function_id: function_id,
        input: test_input,
        output: test_output,
        isPassed: false,
        version: 0,
        isDeleted: false,
        type: test_type
      }
      var path = 'Projects/' + project_id + '/artifacts/Tests';
      var history_path = 'Projects/' + project_id + '/history/artifacts/Tests';
      var created_child = root_ref.child(path).push(test_schema);
      var add_to_history = root_ref.child(history_path).child(created_child.key).child('0').set(test_schema);
      return created_child.key;
    },

    /* Update code in function in a project
     param project  id text
     param test id text
     param test type text
     param test name text,
     param test_description,
     param function id text
     param test input array of json object with name and type
     param test output text/object
     param test result boolean
     return update promise object
     */
    updateTest: function(project_id, function_id, test_id, test_type, test_name, test_description, test_input, test_output, test_result) {
      var path = 'Projects/' + project_id + '/artifacts/Tests/' + test_id;
      var history_path = 'Projects/' + project_id + '/history/artifacts/Tests/' + test_id;
      root_ref.child(history_path).once("value", function(data) {
        var version_number = data.numChildren();
        test_schema = {
          name: test_name,
          description: test_description,
          function_id: function_id,
          input: test_input,
          output: test_output,
          isPassed: test_result,
          version: version_number,
          isDeleted: false,
          type: test_type
        }

        var update_promise = root_ref.child(path).update(test_schema);
        var add_to_history = root_ref.child(history_path).child(version_number).set(test_schema);
        return update_promise;
      });
    },

    /*Retrieve test from Project
     param project id text
     param test id text
     return promise object
     */
    retrieveTest: function(project_id, test_id) {
      var path = 'Projects/' + project_id + '/artifacts/Tests/' + test_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },

    /* Retrieve list of tests
     param Project_id text
     result promise object
     */
    retrieveTestsList: function(project_id) {
      var path = 'Projects/' + project_id + '/artifacts/Tests';
      var promise = root_ref.child(path).once("value").then(function(data) {
        var tests_list = [];
        data.forEach(function(test) {
          tests_list.push(test.key);
        });
        return tests_list;
      });
      return promise;
    },
    /* ---------------- End Test API ------------- */

    /* ---------------- Microtask API ------------- */
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
    createImplementationMicrotask: function(project_id, microtask_name, points, function_id, function_name, function_version, microtask_description, microtask_code, tests) {
      microtask_schema = {
        name: microtask_name,
        description: microtask_description,
        code: microtask_code,
        max_points: points,
        awarded_points: 0,
        function_id: function_id,
        function_name: function_name,
        function_version: function_version,
        tests: tests,
        worker: "null"
      }
      var path = 'Projects/' + project_id + '/microtasks/implementation';
      var created_child = root_ref.child(path).push(microtask_schema);
      return created_child.key;
    },

    /* Update a implementation microtask to a Project in firebase
        param project id tect
        param microtask id text
        param microtask code text
        param tests array of test objects
        param worker id text
        param isFUnctionCOmplete boolean
        return promise object
    */
    updateImplementationMicrotask: function(project_id, microtask_id, microtask_code, tests, worker_id, isFunctionComplete) {
        var path = 'Projects/' + project_id + '/microtasks/implementation/' + microtask_id;
        var update_promise = root_ref.child(path).update({ "code":microtask_code, "tests":tests, "worker":worker_id, "isFunctionComplete":isFunctionComplete});
        return update_promise;
    },


    /* Update the awarded points to a microtask after it is reviewed
     param project id text
     param microtask id text
     param points number
     */
    updateMicrotaskPointsAwarded: function(project_id, microtask_id, points) {
      var path = 'Projects/' + project_id + '/microtasks/implementation/' + microtask_id;
      root_ref.child(path).update({ "awarded_points": points });
    },


    /* Adds a review microtassk to a Project in firebase
     param project id text
     param microtask name
     param points integer
     param reference id text - Id of implemented microtask
     param worker id text
     return microtask ID text
     */
    createReviewMicrotask: function(project_id, microtask_name, points, reference_id) {
      microtask_schema = {
        name: microtask_name,
        points: points,
        awarded_points: 0,
        reference_id: reference_id,
        rating: "null",
        review: "null",
        worker: "null"
      }
      var path = 'Projects/' + project_id + '/microtasks/review';
      var created_child = root_ref.child(path).push(microtask_schema);
      return created_child.key;
    },


    /* Update the rating and review in review microtask
     param project id text
     param microtask id text
     param rating number
     param review text
     param worker id text
     return promise object
     */
    updateReviewMicrotask: function(project_id, microtask_id, rating, review, worker_id) {
      var path = 'Projects/' + project_id + '/microtasks/review/' + microtask_id;
      var update_promise = root_ref.child(path).update({ "rating": rating, "review": review, "worker": worker_id });

      //Update awarded points in the implementation task based on the rating
      root_ref.child(path).once("value").then(function(data) {
        var reference_id = data.val().reference_id;
        var implementation_path = 'Projects/' + project_id + '/microtasks/implementation/' + reference_id;
        root_ref.child(implementation_path).once("value").then(function(value) {
          var max_points = value.val().max_points;
          var points = max_points * (rating / 5);
          root_ref.child(implementation_path).update({
            "awarded_points": points
          });
        });
        return true;
      });
      return update_promise;
    },


    /*Retrieve task from Project
     param project id text
     param microtask type text -  - Implementation or Review
     param microtask id text
     return promise object
     */
    retrieveMicrotask: function(project_id, microtask_type, microtask_id) {
      var path = 'Projects/' + project_id + '/microtasks/' + microtask_type + '/' + microtask_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },



    /* ---------------- End Microtask API ------------- */


    /* ----------------Event API ------------- */

    /* Add an event in the history
     param project id text
     param artifact type text
     param artifact id text
     param event type text
     param microtask id
     return event ID text
     */
    createEvent: function(project_id, artifact_type, artifact_id, event_type, microtask_id, event_description) {
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
    },


    /* ---------------- End Event API ------------- */


    /* ---------------- Questions API ------------- */

    /* Create a question in a project
     param project id text
     param title text
     param question text
     param points integer
     param owner id text
     param subscribe ids array of worker ids
     */
    createQuestion: function(project_id, title, question, points, owner_id) {
      question_schema = {
        title: title,
        question: question,
        points: points,
        owner_id: owner_id,
        subscriber_ids: "null",
        created_time: timestamp.getTime(),
        answers: "null",
        answer_count: 0,
        version: 0,
        updated_time: "null",
        isClosed: false
      };
      var path = 'Projects/' + project_id + '/questions';
      var history_path = 'Projects/' + project_id + '/history/questions';
      var created_child = root_ref.child(path).push(question_schema);
      root_ref.child(path).child(created_child.key).child('subscriber_ids').push(owner_id);
      var add_to_history = root_ref.child(history_path).child(created_child.key).child('0').set(question_schema);
      root_ref.child(history_path).child(created_child.key).child('subscriber_ids').push(owner_id);
      return created_child.key;
    },

    /* Adds an answer to a question in the project
        param project id text
        param question id text
        param answerer id text - worker id
        param answer content text
        returns answer ID text
     */
    addAnswer: function(project_id, question_id, answerer_id, answer_content) {
      answer_schema = {
        answer: answer_content,
        comments: "null",
        owner_id: answerer_id
      };
      var path = 'Projects/' + project_id + '/questions/' + question_id;
      //add the answer
      var created_child = root_ref.child(path).child('answers').push(answer_schema);
      //update the updated time
      root_ref.child(path).update({
        updated_time: timestamp.getTime()
      });
      //increment answer count
      root_ref.child(path).once("value").then(function(data) {
        var answer_count = data.val().answer_count + 1;
        root_ref.child(path).child('answer_count').set(answer_count);
      })
      //add the answering worker to subscribers list
      root_ref.child(path).child('subscriber_ids').once("value").then(function(data) {
        var isSubcribed = false;
        var subscribers = data.forEach(function(subscriber) {
          if (subscriber.val() === answerer_id) {
            isSubcribed = true;
          }
        });
        if (!isSubcribed) {
          root_ref.child(path).child('subscriber_ids').push(answerer_id);
        }
        return true;
      });
      return created_child.key;
    },

    /* Add comment to an answer
        param project id text
        param question id text
        param answer id text
        param commenter id text - worker id
        param comment_content text
        returns comment ID text
     */
    addComment: function(project_id, question_id, answer_id, commenter_id, comment_content) {
      comment_schema = {
        comment: comment_content,
        owner_id: commenter_id
      };
      //add the comment
      var path = 'Projects/' + project_id + '/questions/' + question_id + '/answers/' + answer_id + '/comments';
      var created_child = root_ref.child(path).push(comment_schema);

      //add the subscriber if not already on the list
      var question_path = 'Projects/' + project_id + '/questions/' + question_id;
      root_ref.child(question_path).child('subscriber_ids').once("value").then(function(data) {
        var isSubcribed = false;
        var subscribers = data.forEach(function(subscriber) {
          if (subscriber.val() === commenter_id) {
            isSubcribed = true;
          }
        });
        if (!isSubcribed) {
          root_ref.child(question_path).child('subscriber_ids').push(commenter_id);
        }
        return true;
      });
      return created_child.key;
    },

    /* Retrieves a question in project
        param project id text
        param question id text
        return promise object
    */
    retrieveQuestion: function(project_id, question_id) {
      var path = 'Projects/' + project_id + '/questions/' + question_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },

      /* ---------------- End Questions API ------------- */

    /* ---------------- clientRequests services ------- */

    createClientRequest: function(id,clientReq) {
      var created_child = root_ref.child('clientRequests').child(id).set(clientReq);
      return created_child.key;
    },

    updateClientRequest: function(id, clientReq) {
      return root_ref.child("clientRequests").child(id).update(clientReq, function() {
        return true;
      });
    },

    /* ----------------End clientRequests services ---- */



    /* ---------------- Notifications API ------------- */

    /* Create notifications in a project
     param project id text
     param worker id text
     param dat text
     returns Notification ID text
     */
    createNotification: function(project_id, worker_id, type, data) {
      notification_schema = {
        type: type,
        data: data,
        created_time: timestamp.getTime()
      }
      var path = 'Projects/' + project_id + '/notifications';
      var created_child = root_ref.child(path).child(worker_id).push(notification_schema);
      return created_child.key;
    },
    /* ---------------- End Notifications API ------------- */

    /* ---------------- Workers API ------------- */
    /* Create a new worker profile in firebase
     param worker name text
     param avatar url text
     returns worker ID text
     */
    createWorker: function(worker_id, worker_name, avatar_url) {
      worker_schema = {
        name: worker_name,
        avatar_url: avatar_url,
        level: 1,
        microtask_history: "null",
        achievements: "null"
      }
      var path = 'Workers';
      var created_child = root_ref.child(path).child(worker_id).set(worker_schema);
      return created_child.key;
    },

    /* Retrieve worker object
        param worker id text
        result promise object
     */
    retrieveWorker: function(worker_id) {
      var path = 'Workers/' + worker_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },

    /* Retrieve list of workers
     result promise object
     */
    retrieveWorkersList: function() {
      var path = 'Workers';
      var promise = root_ref.child(path).once("value").then(function(data) {
        var workers_list = [];
        data.forEach(function(worker) {
          workers_list.push(worker.key);
        });
        return workers_list;
      });
      return promise;
    }
    /* ---------------- End Workers API ------------- */


  }
}
