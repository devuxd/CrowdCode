module.exports = function(FirebaseService, ExpressGenerator, Config, Q) {
    var cmd = require('child_process').execSync;
    var gitCommandLine = require('git-command-line');
    var https = require('https');

    var path = "./services";
    var port = 4000;

    function createMicroService(project_id){
        //Fetch the project from firebase
        var project_promise = FirebaseService.retrieveProject(project_id);
        var result = project_promise.then(function(project){
            var functions = project.artifacts.Functions;
            var isComplete = false;
            var code = '';
            var routes = '';
            var exports = 'module.exports = {';
            //Check if all the end points are complete
            for(var func in functions){
                if(functions[func].isApiArtifact) {
                    isComplete = functions[func].isComplete;
                }
            }
            //if end points are complete, create a template express app
            if(isComplete) {
                //if the template is created, add the code and routing
                if (ExpressGenerator.createApplication(project_id, path, port)) {
                    //create a single object with code from all complete functions
                    for(var func in functions){
                        if(functions[func].isComplete) {
                            code += "\n\n\n" + functions[func].header +'\n'+ functions[func].code;
                            exports += "\n"+functions[func].name+":"+functions[func].name+",";
                        }
                    }
                    exports = exports.substr(0, exports.length-1)+" }";
                    //Create the file with all the functions in the project
                    ExpressGenerator.createServiceFile(project_id,path,code+"\n"+exports);

                    //create both get and post handlers for each end point

                    for(var func in functions){
                        if(functions[func].isApiArtifact && functions[func].isComplete) {
                            var get_parameters = '';
                            var post_parameters = '';
                            //Generate all parameters to be passed
                            for(var parameter in functions[func].parameters) {
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
                    ExpressGenerator.createRouter(project_id,path,routes);
                    var token = Config.heroku["token"];
                    ExpressGenerator.createTravisFile(project_id,path, token);
                    initGit(project_id,path+'/'+project_id);
                return true;
                }
            }else{
                return false;
            }
        }).catch(function(err){
            console.trace(err);
        });
        return result;

    }

    function runCommand(command, path){
        var child = cmd(command, {cwd: path} );

        return child;
    }

    function initGit(project_id,path) {
        var Git = new gitCommandLine(path);

        var git_data = '{ "name" : "' + project_id + '"}';
        var git_options = {
            hostname: "api.github.com",
            port: "443",
            path: "/user/repos?access_token=" + Config.github["token"],
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(git_data),
                "User-Agent": Config.github["username"]
            }
        };
        //Send github request to create a new repository
        var git_request = https.request(git_options, function (res) {

            //Initialize folder as a local repo
            Git.init()
            .then(function (res) {
                return Git.direct('config user.name "Crowd Code"');     //Set user name for the repo commits

            }).then(function (res) {
                return Git.direct('config user.email "crowdcodev2@gmail.com');  //Set user email for repo commits

            }).then(function (res) {
                return Git.add('-A', {cwd: path});           //Add the files to repo

            }).then(function (res) {
                return Git.commit('-m "Initial commit"');           //Commit

            }).then(function (res) {
                return Git.remote('add origin https://' + Config.github["token"] + '@github.com/crowdcodev2/' + project_id + '.git/');      //Create a remote named origin

            }).then(function (res) {
                return Git.push('-u origin master');            //push the files to the master branch

            }).then(function (res) {
                console.log('Success: ', res);
                console.log("SYNC---------------------");
                //initTravis(project_id);
                var a = runCommand("curl -s -X POST -H \"Content-Type: application/json\"  -H \"Accept: application/json\"  -H \"Travis-API-Version: 3\"  -H \"Authorization: token Gto3IqdjFI43hWc4YGcuaA\" https://api.travis-ci.org/user/1066726/sync\n","./services")
                  console.log(a.toString());
                console.log("LIST---------------------");
                var x = runCommand("curl -s -X GET -H \"Content-Type: application/json\"  -H \"Accept: application/json\"  -H \"Travis-API-Version: 3\"  -H \"Authorization: token Gto3IqdjFI43hWc4YGcuaA\" https://api.travis-ci.org/repos","./services")
                console.log(x.toString());
                console.log("ACTIVATE---------------------");
                var b = runCommand("curl -s -X POST -H \"Content-Type: application/json\"  -H \"Accept: application/json\"  -H \"Travis-API-Version: 3\"  -H \"Authorization: token Gto3IqdjFI43hWc4YGcuaA\" https://api.travis-ci.org/repo/crowdcodev2%2Fmeysam/activate\n","./services")
                    console.log(b.toString());
                console.log("BUILD---------------------");
                var c = runCommand("curl -s -X GET -H \"Content-Type: application/json\"  -H \"Accept: application/json\"  -H \"Travis-API-Version: 3\"  -H \"Authorization: token Gto3IqdjFI43hWc4YGcuaA\" https://api.travis-ci.org/repo/crowdcodev2%2Fmeysam/requests","./services")
                    console.log(c.toString());
                console.log("END---------------------");
            }).fail(function (err) {
                console.error(err);
            });
        });

        git_request.on('error', function (e) {
            console.log('problem with git request: ' + e.message);
        });
        git_request.write(git_data);
        git_request.end();

    }



    function initTravis(project_id) {

        var travis_sync_options = {
            hostname: "api.travis-ci.org",
            port: "443",
            path: "/user/" + Config.travis["userId"] + "/sync",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Travis-API-Version": "3",
                "Authorization": "token " + Config.travis["token"]
            }
        };

        var travis_activate_options = {
            hostname: "api.travis-ci.org",
            port: "443",
            path: "/repo/" + Config.github["username"] + "%2F" + project_id + "/activate",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Travis-API-Version": "3",
                "Authorization": "token " + Config.travis["token"]
            }
        };

        var travis_build_options = {
            hostname: "api.travis-ci.org",
            port: "443",
            path: "/repo/" + Config.github["username"] + "%2F" + project_id + "/requests",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Travis-API-Version": "3",
                "Authorization": "token " + Config.travis["token"]
            }
        };

        //Sync the repo in travis
        var travis_sync_request = https.request(travis_sync_options, function (res) {
            res.on('data', function (response) {
                console.log("Sync  " + response);

                //Activate the repo in travis
                var travis_activate_request = https.request(travis_activate_options, function (res) {
                    res.on('data', function (response) {
                        console.log("Activate  " + response);

                        //Trigger build
                        var travis_build_request = https.request(travis_build_options, function (res) {
                            res.on('data', function (response) {
                                console.log("build  " + response);
                            });
                            travis_build_request.on('error', function (e) {
                                console.log('problem with travis build request: ' + e.message);
                            });
                            travis_build_request.end();
                        });
                        travis_activate_request.on('error', function (e) {
                            console.log('problem with travis activate request: ' + e.message);
                        });
                        travis_activate_request.end();
                    });
                });
                travis_sync_request.on('error', function (e) {
                    console.log('problem with travis sync request: ' + e.message);
                });
                travis_sync_request.end();
            });
        });
    }


    return{
        createMicroService: createMicroService,
    }
}