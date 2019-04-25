// The destination repo should not be contain file with name microservices and endpoint, if it has  they must be removed

module.exports = function (FirebaseService, ExpressGenerator, Config, Q) {
    var cmd = require('child_process').execSync;
    var gitCommandLine = require('git-command-line');
    var https = require('https');
    // it creates a directory in the project, then the create route and service file for it.
    var rootPath = "./services";
    var port = 4000;
    var rimraf = require("rimraf");


    function createMicroService(project_id) {
        //Fetch the project from firebase
        var project_promise = FirebaseService.retrieveProject(project_id);
        return result = project_promise.then(function (project) {
                var functions = project.artifacts.Functions;
                // read GitHub credential from Config file in Config directory
                var deploymentInfo = {
                    repoName: Config.github["repoName"],
                    token: Config.github["token"],
                    // firstName: Config.github["firstName"],
                    // lastName: Config.github["lastName"],
                    // email: Config.github["email"],
                    userId: Config.github["username"],

                };
                //if in the client request deployment info are inserted, it overwrite the deployment info, otherwise it reads data from the Config file
                if (project.deploymentInfo && project.deploymentInfo.gitUserId !== "" && project.deploymentInfo.gitToken !== "" && project.deploymentInfo.gitRepoName !== "") {
                    // project.deploymentInfo.firstName !== "" &&   project.deploymentInfo.lastName !== "" && project.deploymentInfo.gitEmail !== "" &&
                    console.log("it used the client request github credential");
                    for (var credential in project.deploymentInfo) {
                        deploymentInfo.userId = project.deploymentInfo[credential].gitUserName;
                        deploymentInfo.token = project.deploymentInfo[credential].gitToken;
                        // deploymentInfo.firstName = project.deploymentInfo[credential].gitUserFirstName;
                        // deploymentInfo.lastName = project.deploymentInfo[credential].gitUserLastName;
                        // deploymentInfo.email = project.deploymentInfo[credential].gitEmail;
                        deploymentInfo.repoName = project.deploymentInfo[credential].gitRepoName;
                    }
                }
                var isComplete = false;

                //Check if all the end points are complete
                for (var func in functions) {
                    if (functions[func].isApiArtifact) {
                        isComplete = functions[func].isComplete;
                    }
                }
                //if end points are complete, create a template express app
                if (isComplete) {
                    //if the template is created, add the code and routing
                    //  if (ExpressGenerator.createEndPints(project_id, path, port)) {

                    ExpressGenerator.createDir(rootPath + '/' + project_id);
                    //return new Promise(function (resolve, reject) {
                        var resultTmp = initGit(project_id, rootPath + '/' + project_id, deploymentInfo, functions);

                   // });
                    return true;
                }
                else {
                    return false;
                }
            }
        ).catch(function (err) {
            console.trace(err);

        });


    }

    function initGit(project_id, projectPath, deploymentInfo, functions) {
        //   return new Promise(function (resolve, reject) {


        var Git = new gitCommandLine(projectPath);

        // var git_data = '{ "name" : "' + project_id + '"}';
        var git_data = '{ "name" : "' + deploymentInfo.repoName + '"}';
        //  var git_data = '{ "name" : "EndPoints2"}';
        var git_options = {
            hostname: "api.github.com",
            port: "443",
            path: "/user/repos?access_token=" + deploymentInfo.token,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(git_data),
                "User-Agent": deploymentInfo.userId
            }
        };
        //Send github request to create a new repository
        var git_request = https.request(git_options, function (res) {

            //Initialize folder as a local repo
            Git.init().then(function (res) {
                //         console.log("user name set");

                return Git.pull('https://' + deploymentInfo.token + '@github.com/' + deploymentInfo.userId + '/' + deploymentInfo.repoName + '.git/  master --allow-unrelated-histories');      //Create a remote named origin
            }).then(function (res) {
                buildMicroserviceFiles(project_id, functions);

            }).then(function (res) {
                // console.log(res);
                //  console.log("add files in Git");
                return Git.add('-A', {cwd: projectPath});           //Add the files to repo

            }).then(function (res) {
                // console.log(res);
                return Git.commit('-m "add files"');           //Commit

            }).then(function (res) {
                return Git.push('  https://' + deploymentInfo.token + '@github.com/' + deploymentInfo.userId + '/' + deploymentInfo.repoName + '.git/  master');
            }).then(function (res) {
                rimraf(projectPath, function () {
                    console.log(" Pulled dir (temp files) is removed from server! ");
                });
                //return  resolve(true);
            }).fail(function (err) {
                rimraf(projectPath, function () {
                    console.log(" Pulled dir (temp files) is removed from server! ");
                });
                console.error(err);
                //return reject(err);
            });
        });

        git_request.on('error', function (e) {
            console.log('problem with git request: ' + e.message);
            // return reject(e);
        });

        git_request.write(git_data);
        git_request.end();
        //return git_request;
        //});

    }


     function buildMicroserviceFiles(project_id, functions) {
        var code = '';
        var routes = '';
        var exports = 'module.exports = {';

        //create a single object with code from all complete functions
        for (var func in functions) {
            if (functions[func].isComplete) {
                code += "\n\n\n" + functions[func].header + '\n' + functions[func].code;
                exports += "\n" + functions[func].name + ":" + functions[func].name + ",";
            }
        }
        exports = exports.substr(0, exports.length - 1) + " }";
        //Create the file with all the functions in the project
        ExpressGenerator.createServiceFile(project_id, rootPath, code + "\n" + exports);

        //create both get and post handlers for each end point

        for (var func in functions) {
            if (functions[func].isApiArtifact && functions[func].isComplete) {
                var get_parameters = '';
                var post_parameters = '';
                //Generate all parameters to be passed
                for (var parameter in functions[func].parameters) {
                    get_parameters += 'req.query.' + functions[func].parameters[parameter].name + ',';
                    post_parameters += 'req.body.' + functions[func].parameters[parameter].name + ',';
                }
                if (get_parameters.length > 0) {
                    get_parameters = get_parameters.substr(0, get_parameters.length - 1);
                    post_parameters = post_parameters.substr(0, post_parameters.length - 1);
                }

                //Add all routes to one object
                routes += "router.get('/" + functions[func].name + "', function(req, res) {\n" +
                    " res.send(service." + functions[func].name + "(" + get_parameters + "));\n" +
                    "  });\n\n" +
                    "router.post('/" + functions[func].name + "', function(req, res) {\n" +
                    " res.send(service." + functions[func].name + "(" + post_parameters + "));\n" +
                    "  });\n\n\n";

            }
        }
        ExpressGenerator.createRouter(project_id, rootPath, routes);
    }

    function runCommand(command, path) {
        var child = cmd(command, {cwd: path});


        return child;
    }


    return {
        createMicroService: createMicroService,
    }
}