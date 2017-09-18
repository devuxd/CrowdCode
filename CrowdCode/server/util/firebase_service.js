var s = require("underscore.string");

module.exports = function(AdminFirebase, Q) {
  const now = (unit) => {
    const hrTime = process.hrtime();
    switch (unit) {
      case 'milli':
        return hrTime[0] * 1000 + hrTime[1] / 1000000;
      case 'micro':
        return hrTime[0] * 1000000 + hrTime[1] / 1000;
      case 'nano':
        return hrTime[0] * 1000000000 + hrTime[1];
        break;
      default:
        return hrTime[0] * 1000000000 + hrTime[1];
    }
  };
  const timeOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  const root_ref = AdminFirebase.database().ref();
  return {

    /* Creates an empty project in Firebase
     param project_name text
     param owner_id text
     returns Project ID text
     */
    createProject: function(project_name, owner_id) {
      let project_schema = {
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
            tutorials: false
          },
          notifications: "null"
        },
        workers: "null",
        state: {
            implementationQ: "null",
            reviewQ: "null",
            workers: "null"
        }
      };
      var created_child = root_ref.child('Projects').child(project_name).set(project_schema);
      return created_child.then(err => {
        if (err) throw err;
        else return "created the project Successfully";
      });

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
     param isApiArtifact boolean
     param structure array of json objects with name and value
     param example array of json objects with name and value
     returns ADT ID text
     */
    createADT: function(project_id, ADT_name, ADT_description, isReadOnly, isApiArtifact, structure, examples) {
      let ADT_schema = {
        name: ADT_name,
        description: ADT_description,
        isDeleted: false,
        isReadOnly: isReadOnly,
        isApiArtifact: isApiArtifact,
        version: 0,
        structure: structure,
        examples: examples
      };
      var path = 'Projects/' + project_id + '/artifacts/ADTs';
      var history_path = 'Projects/' + project_id + '/history/artifacts/ADTs/';
      var created_child = root_ref.child(path).push(ADT_schema);
      ADT_schema.id = created_child.key;
      var add_to_history = root_ref.child(history_path).child(created_child.key).child('0').set(ADT_schema);
      return created_child.key;
    },

    /* Wrapper function for creating ADT using ADT object
      param project_id String
      param ADTObject Object
      returns ADT ID text
    */
    createADTWrapper: function(project_id, ADTObject) {
      return this.createADT(project_id, ADTObject.name, ADTObject.description, ADTObject.isReadOnly, ADTObject.isApiArtifact, ADTObject.structure, ADTObject.examples);
    },

    /* Add String, Number and Boolean ADTs in a project in firebase
     returns Array of ADT IDs text
     */
    createDefaultADTS: function(project_id) {
      let string = {
        name: "String",
        description: "A String simply stores a series of characters like \"John Doe\". A string can be any text inside double quotes.",
        isDeleted: false,
        isReadOnly: true,
        isApiArtifact: true,
        version: 0,
        structure: [],
        examples: []
      };
      let stringKey = this.createADTWrapper(project_id, string);
      this.createEvent(project_id, "ADT", stringKey, "String", "ADT.Created", "Create ADT from client request", "null");
      let number = {
        name: "Number",
        description: "Number is the only type of number. Numbers can be written with, or without, decimals.",
        isDeleted: false,
        isReadOnly: true,
        isApiArtifact: true,
        version: 0,
        structure: [],
        examples: []
      };
      let numberKey = this.createADTWrapper(project_id, number);
      this.createEvent(project_id, "ADT", numberKey, "Number", "ADT.Created", "Create ADT from client request", "null");
      let boolean = {
        name: "Boolean",
        description: "A Boolean represents one of two values: true or false.",
        isDeleted: false,
        isReadOnly: true,
        isApiArtifact: true,
        version: 0,
        structure: [],
        examples: []
      };
      let booleanKey = this.createADTWrapper(project_id, boolean);
      this.createEvent(project_id, "ADT", booleanKey, "Boolean", "ADT.Created", "Create ADT from client request", "null");
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

    /* retrieve project's ADTs
      param project id String

      return promise object containing Array of ADTs
    */
    retrieveADTList: function(project_id) {
      return root_ref.child('Projects').child(project_id).child('artifacts').child('ADTs').once('value').then(data => {
        return data.val();
      }, function(err) {
        console.log("Error in retrieving ADT list");
        //console.log(err);
      });
    },

    /* ---------------- End ADT API ------------- */

    /* ---------------- Function API ------------- */
    /* Adds a function to a Project in firebase
     param project_id text
     param function name text
     param function header text
     param function type text
     param function description text
     param function code text
     param test Array of test id's
     param stubs Array of json objects with stub names and values
     param parameters Array of json objects with name, type and description
     param functions dependent Array of functions that this function calls
     returns function ID text
     */
    createFunction: function(project_id, function_name, header, function_description, function_code,
      return_type, parameters, stubs, tests, ADTsId, functions_dependent, isApiArtifact) {
      let function_schema = {
        name: function_name,
        header: header,
        description: function_description,
        code: function_code,
        linesOfCode: s.count(function_code, "\n") + 2,
        returnType: return_type,
        version: 0,
        parameters: parameters,
        stubs: stubs,
        tests: tests,
        ADTsId: ADTsId,
        dependent: functions_dependent,
        isComplete: false,
        isAssigned: false,
        isApiArtifact: isApiArtifact
      };
      var path = 'Projects/' + project_id + '/artifacts/Functions';
      var history_path = 'Projects/' + project_id + '/history/artifacts/Functions';
      var created_child = root_ref.child(path).push(function_schema);
      function_schema.id = created_child.key;
      var add_to_history = root_ref.child(history_path).child(created_child.key).child('0').set(function_schema);
      return created_child.key;
    },

    /* Update code in function in a project
     param project  id text
     param function id text
     param function name text
     param header text
     param function description text
     param function code text
     param return type text
     param parameters Array of json objects with name, type and description
     param stubs Array of json objects with stub names and values
     param test Array of test id's
     param ADTsId Array of ADT Ids that is used in this function
     param functions dependent Array of functions that call this function
     param isComplete Boolean if the implementation of this function is complete
     param isAssigned Boolean if the function has already a microtask
     param isApiArtifact Boolean if the artifact is for the API
     return update promise object
     */
    updateFunction: function(project_id, function_id, function_name, header, function_description, function_code,
      return_type, parameters, stubs, tests, ADTsId, functions_dependent, isComplete, isAssigned, isApiArtifact) {
      var path = 'Projects/' + project_id + '/artifacts/Functions/' + function_id;
      var history_path = 'Projects/' + project_id + '/history/artifacts/Functions/' + function_id;
      root_ref.child(history_path).once("value", function(data) {
        var version_number = data.numChildren();
        let function_schema = {
          name: function_name,
          header: header,
          description: function_description,
          code: function_code,
          linesOfCode: s.count(function_code, "\n") + 2,
          returnType: return_type,
          version: version_number,
          parameters: parameters,
          stubs: stubs,
          tests: tests,
          ADTsId: ADTsId,
          dependent: functions_dependent,
          isComplete: isComplete,
          isAssigned: isAssigned,
          isApiArtifact: isApiArtifact
        };

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
          if(!func.hasOwnProperty('tests')){
            func.tests = "null";
          }
          function_schema = {
            name: func.name,
            description: func.description,
            code: func.code,
            returnType: func.returnType,
            version: version_number,
            parameters: func.parameters,
            stubs: func.stubs,
            tests: func.tests,
            ADTsId: func.ADTsId,
            isApiArtifact: func.isApiArtifact,
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
        description: test_description,
        functionId: function_id,
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
    updateTest: function(project_id, function_id, test_id, test_object) {
      var path = 'Projects/' + project_id + '/artifacts/Tests/' + test_id;
      var history_path = 'Projects/' + project_id + '/history/artifacts/Tests/' + test_id;
      root_ref.child(history_path).once("value", function(data) {
        var version_number = data.numChildren();
        test_schema = {
            version: version_number,
        }
        var update_promise = root_ref.child(path).update(test_object);
        var update_promise = root_ref.child(path).update(test_schema);
        root_ref.child(history_path).child(version_number).set(test_object);
        var add_to_history = root_ref.child(history_path).child(version_number).update(test_schema);
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
    createImplementationMicrotask: function(project_id, microtask_name, points, function_id, function_name, function_description, function_version, microtask_description, microtask_code, microtask_return_type, microtask_parameters, function_header, tests, prompt_type) {
      microtask_schema = {
        name: microtask_name,
        description: microtask_description,
        code: microtask_code,
        points: points,
        awarded_points: 0,
        functionId: function_id,
        functionName: function_name,
        functionVersion: function_version,
        functionDescription: function_description,
        returnType: microtask_return_type,
        parameters: microtask_parameters,
        header: function_header,
        type: "DescribeFunctionBehavior",
        promptType: prompt_type,
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
    updateImplementationMicrotask: function(project_id, microtask_id, funct, tests, worker_id, isFunctionComplete) {
      var path = 'Projects/' + project_id + '/microtasks/implementation/' + microtask_id;
      var update_promise = root_ref.child(path).update({
        "submission": tests,
        "worker": worker_id,
        "isFunctionComplete": isFunctionComplete,
        "code": funct.code,
        "tests": tests.tests,
      });
      return update_promise;
    },


    /* Update the awarded points to a microtask after it is reviewed
     param project id text
     param microtask id text
     param points number
     */
    updateMicrotaskPointsAwarded: function(project_id, microtask_id, points) {
      var path = 'Projects/' + project_id + '/microtasks/implementation/' + microtask_id;
      root_ref.child(path).update({
        "awarded_points": points
      });
    },


    /* Adds a review microtassk to a Project in firebase
     param project id text
     param microtask name
     param points integer
     param reference id text - Id of implemented microtask
     param worker id text
     return microtask ID text
     */
    createReviewMicrotask: function(project_id, microtask_name, points, reference_id, functionId, prompt_type) {
      microtask_schema = {
        name: microtask_name,
        points: points,
        awarded_points: 0,
        reference_id: reference_id,
        functionId: functionId,
        promptType: prompt_type,
        type: "Review",
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
      var update_promise = root_ref.child(path).update({
        "rating": rating,
        "review": review,
        "worker": worker_id,
        "submission": {
        "qualityScore": rating,
        "reviewText": review
        }
      });

      //Update awarded points in the implementation task based on the rating
       root_ref.child(path).once("value").then(function(data) {
        var reference_id = data.val().reference_id;
        var implementation_path = 'Projects/' + project_id + '/microtasks/implementation/' + reference_id;
        root_ref.child(implementation_path).once("value").then(function(value) {
          var max_points = value.val().points;
          var points = max_points * (rating / 5);
          root_ref.child(implementation_path).update({
            "awarded_points": points,
            "review": {
              "qualityScore": rating,
              "reviewKey": microtask_id,
              "reviewText": review
            },
             });
           });
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
      if(microtask_type === 'DescribeFunctionBehavior'){
        microtask_type = 'implementation';
      }
      if(microtask_type === "Review"){
        microtask_type = 'review';
      }
      var path = 'Projects/' + project_id + '/microtasks/' + microtask_type + '/' + microtask_id;
      var promise = root_ref.child(path).once("value").then(function(data) {
        return data.val();
      });
      return promise;
    },



    /* ---------------- End Microtask API ------------- */

    /*-----------------LeaderBoard API -------------- */
      addWorkerToLeaderBoard: function(project_name, worker_id, worker_name) {
          let path = root_ref.child('Projects').child(project_name).child('leaderboard').child('leaders').child(worker_id);
          let deferred = Q.defer();
          path.update({
              name: worker_name,
              score: 0
          }).then(err => {
              if (err) deferred.reject(err);
          else deferred.resolve();
      });
          return deferred.promise;
      },

      updateLeaderBoardScore: function(project_name, worker_id, points) {
          let path = root_ref.child('Projects').child(project_name).child('leaderboard').child('leaders').child(worker_id);
          let deferred = Q.defer();
            path.once('value').then(function(data) {
                var current_score = data.val().score;
                var total_score = current_score + points;
                path.update({
                    score: total_score
                }).then(err => {
                    if (err) deferred.reject(err);
                    else
                    deferred.resolve();
                });
          });
          return deferred.promise;
      },




    /* -------------------- End LeaderBoard API ---------- */
    /* ----------------Event API ------------- */

    /* Add an event in the history
     param project id text
     param artifact type text
     param artifact id text
     param artifact name text
     param event type text
     param event description
     return event ID text
     */
    createEvent: function(project_id, artifact_type, artifact_id, artifact_name, event_type, event_description, parent_id) {
      let event_schema = {
        parentId: parent_id,
        artifactType: artifact_type,
        artifactId: artifact_id,
        artifactName: artifact_name,
        eventType: event_type,
        eventDescription: event_description,
        projectId: project_id,
        timestamp: new Date().toLocaleTimeString("en-us", timeOptions),
        timeInMicros: now('micro')
      };
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
        created_time: now('micro'),
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
        updated_time: now('micro')
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

    createClientRequest: function(id, clientReq, workerId) {
      var self = this;
      root_ref.child('clientRequests').child(id).set(clientReq, function(error) {
        if (error) {
          console.log("client Request could not be saved." + error);
        } else {
          self.createProjectFromClientRequest(id, clientReq, workerId);
          console.log("client Request saved successfully. ");
        }
      });

    },

    createProjectFromClientRequest: function(id, clientReq, workerId) {
      this.createProject(id, workerId).then(result => {
        // create an event for project creation
        this.createEvent(id, "", "", "", "Project.Created", "create project from client request", "null");
        this.createDefaultADTS(id);
        if (typeof clientReq.ADTs !== 'undefined') {
          clientReq.ADTs.forEach(adt => {
            var adtKey = this.createADT(id, adt.name, adt.description, true, true, adt.structure, adt.examples);
            this.createEvent(id, "ADT", adtKey, adt.name, "ADT.Created", "Create ADT from client request", "null");
          });
        }
        if (typeof clientReq.functions !== 'undefined') {
          clientReq.functions.forEach(func => {
            var funcKey = this.createFunction(id, func.name, func.header, func.description, func.code, func.returnType, func.parameters, func.stubs, "null", "null", "null", true);
            this.createEvent(id, "Function", funcKey, func.name, "Function.Created", "Create Function from client request", "null");
            //this.createImplementationMicrotask(id, "Implement function behavior", 10, funcKey, func.name, 0, "Implement function behavior with all the related tests", func.code, "null");
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },

    resetProject: function(clientReqId, workerId) {
      let path = 'clientRequests/' + clientReqId;
      let deferred = Q.defer();
      var self = this;
      root_ref.child(path).once("value").then(function(data) {
         let clientReq = data.val();
         console.log("clientReq", clientReq);
         self.createProjectFromClientRequest(clientReqId, clientReq, workerId);
         deferred.resolve();
      }).catch(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    },

    updateClientRequest: function(id, clientReq) {
      return root_ref.child("clientRequests").child(id).update(clientReq, function(error) {
        if (error) {
          console.log("Data could not be saved." + error);
        } else {
          console.log("Data updated successfully.");
        }
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
        created_time: now('micro')
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
        avatarUrl: avatar_url,
        workerHandle: "null"
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
    },

    // Tests to see if /leaderboard/<workerId> has any data.
    checkIfWorkerIsInLeaderboard: function(project_name, worker_id) {
        let deferred = Q.defer();
        let workerRef = root_ref.child('Projects').child(project_name).child('leaderboard').child('leaders');
        workerRef.child(worker_id).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            deferred.resolve(exists);
        }).catch(err => {
            deferred.reject(err);
    });
        return deferred.promise;
    },

    // Tests to see if /Workers/<workerId> has any data.
    checkIfWorkerExists: function(worker_id) {
        let deferred = Q.defer();
        let workerRef = root_ref.child('Workers');
        workerRef.child(worker_id).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            deferred.resolve(exists);
        }).catch(err => {
            deferred.reject(err);
    });
        return deferred.promise;
    },

    /* Add the worker into a project
      param project id text
      param worker id text
      return promise object
    */
    createProjectWorker: function(project_id, worker_id){
      var worker_schema = {
        implementationTasks: 0,
        reviewTasks: 0,
        rejectedTasks: 0,
        totalTasks: 0,
        points: 0,
        achievements: 0,
        questions: 0,
        answers: 0
      }
      var path = 'Projects/' + project_id + '/workers';
      var create_promise = root_ref.child(path).child(worker_id).update(worker_schema);
      return create_promise;
    },

    /* Update number of implementation tasks completed
      param project id text
      param worker id text
     */
    incrementImplementationTasks : function(project_id,worker_id){
      var path = 'Projects/' + project_id + '/workers/' + worker_id;
      root_ref.child(path).once("value", function(obj) {
          var data = obj.val();
          var implementationTasks = data.implementationTasks + 1;
          var totalTasks = data.totalTasks + 1;
          worker_update = {
              implementationTasks: implementationTasks,
              totalTasks: totalTasks
      }
          root_ref.child(path).update(worker_update);
      });
    },

    /* Update number of review tasks completed
     param project id text
     param worker id text
     */
    incrementReviewTasks : function(project_id,worker_id) {
        var path = 'Projects/' + project_id + '/workers/' + worker_id;
        root_ref.child(path).once("value", function (obj) {
            var data = obj.val();
            var reviewTasks = data.reviewTasks + 1;
            var totalTasks = data.totalTasks + 1;
            worker_update = {
                reviewTasks: reviewTasks,
                totalTasks: totalTasks
        }
            root_ref.child(path).update(worker_update);
        });
     },

    /* Update number of rejected tasks
     param project id text
     param worker id text
     */
    incrementRejectedTasks : function(project_id,worker_id) {
        var path = 'Projects/' + project_id + '/workers/' + worker_id;
        root_ref.child(path).once("value", function (obj) {
            var data = obj.val();
            var rejectedTasks = data.rejectedTasks + 1;
            worker_update = {
                rejectedTasks: rejectedTasks
            }
            root_ref.child(path).update(worker_update);
        });
      },

    /* Update number of questions asked
     param project id text
     param worker id text
     */
    incrementQuestionsAsked : function(project_id,worker_id) {
        var path = 'Projects/' + project_id + '/workers/' + worker_id;
        root_ref.child(path).once("value", function (obj) {
            var data = obj.val();
            var questions = data.questions + 1;
            worker_update = {
                questions: reviewTasks,
            }
            root_ref.child(path).update(worker_update);
        });
      },

    /* Update number of questions answered
     param project id text
     param worker id text
     */
    incrementQuestionsAnswered : function(project_id,worker_id) {
        var path = 'Projects/' + project_id + '/workers/' + worker_id;
        root_ref.child(path).once("value", function (obj) {
            var data = obj.val();
            var answers = data.answers + 1;
            worker_update = {
                answers: answers,
            }
            root_ref.child(path).update(worker_update);
        });
     },

    /* Update number of points
     param project id text
     param worker id text
     */
    incrementPointsScored : function(project_id,worker_id, points) {
        var path = 'Projects/' + project_id + '/workers/' + worker_id;
        root_ref.child(path).once("value", function (obj) {
            var data = obj.val();
            var totalPoints = data.points + points;
            worker_update = {
                points: totalPoints
            }
            root_ref.child(path).update(worker_update);
        });
      },

    /* Update number of achievements unclocked
     param project id text
     param worker id text
     */
    incrementAchievementsUnlocked : function(project_id,worker_id) {
        var path = 'Projects/' + project_id + '/workers/' + worker_id;
        root_ref.child(path).once("value", function (obj) {
            var data = obj.val();
            var achievements = data.achievements + 1;
            worker_update = {
                achievements: achievements,
            }
            root_ref.child(path).update(worker_update);
        });
      },

      /* ---------------- End Workers API ------------- */

      /* ---------------- Newsfeed API -------------------- */
    createNewsFeed: function(project_name, worker_id, awarded_points, can_be_challenged, challenge_status, max_points, microtask_key, microtask_type, score, type) {
      let deferred = Q.defer();
      let newsfeed = root_ref.child('Projects').child(project_name).child('workers').child(worker_id).child('newsfeed').child(microtask_key);
      let newsfeed_schema = {
        awardedPoints: awarded_points,
        canBeChallenged: can_be_challenged,
        challengeStatus: challenge_status,
        maxPoints: max_points,
        microtaskKey: microtask_key,
        microtaskType: microtask_type,
        score: score,
        timeInMillis: now("milli"),
        type: type
      };
      newsfeed.set(newsfeed_schema).then(function(err) {
        if(err) {
          deferred.reject(err);
        }
        else {
          deferred.resolve();
        }
      });
      return deferred.promise;

    },
    /* ---------------- End Newsfeed API ------------- */

    /* ---------------- State API ------------- */
    /* Updates the microtask queues and all the workers' assigned, skipped and completed tasks
        param project id text
        param project object map
       return void
     */
    backupState: function(project_id, project_object){
      console.log("Backing Up---------"+project_id);
      var Project = project_object;
      var implementationQ = Project.get('implementationQ');
      var reviewQ = Project.get('reviewQ');
      var workers = Project.get('workers');

    //Update the microtask queues
      var path = 'Projects/' + project_id +'/state';
      root_ref.child(path).child('implementationQ').set(implementationQ);
      root_ref.child(path).child('reviewQ').set(reviewQ);
        var worker_schema = [];
    //Update the status of each worker
      workers.forEach(function (value, key){
        var skipped_tasks = null;
        var assigned_id = null;
        var assigned_type = null;
        var completed_task = null;
        if(value.has('skipped')){
          skipped_tasks = value.get('skipped');
        }
        if(value.has('assigned')){
          if(value.get('assigned').has('id')){
            assigned_id = value.get('assigned').get('id');
            assigned_type = value.get('assigned').get('type');
          }
        }
        if(value.has('completed')){
          completed_task = value.get('completed');
        }
             worker_schema.push({
                  id: key,
                  skipped_tasks: skipped_tasks,
                  assigned_task: {
                      id: assigned_id,
                      type: assigned_type
                  },
                  completed_tasks: completed_task
              });
      });
      root_ref.child(path).child('workers').set(worker_schema);
    },


    retrieveState: function(project_id){
      var path = 'Projects/' + project_id + '/state';
      var promise = root_ref.child(path).once("value").then(function(data) {
            return data.val();
        });
        return promise;
    }




    /* ---------------- End State API ------------- */


  }
}