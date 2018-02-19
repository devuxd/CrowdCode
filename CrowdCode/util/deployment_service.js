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
                if (ExpressGenerator.createEndPints(project_id, path, port)) {
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
                 //   var token = Config.heroku["token"];
                  //  ExpressGenerator.createTravisFile(project_id,path, token);
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



    function initGit(project_id,path) {
        var Git = new gitCommandLine(path);

        var git_data = '{ "name" : "' + project_id + '"}';
        var git_data = '{ "name" : "EndPoints2"}';
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
                console.log("user name set");
                return Git.direct('config user.name "Emad Aghayi"');     //Set user name for the repo commits

            }).then(function (res) {
                console.log(res);
                console.log("mail set");
                return Git.direct('config user.email "emad.aghayi@gmail.com"');  //Set user email for repo commits

            }).then(function (res) {
                console.log(res);
                console.log("add files in Git");
                return Git.add('-A', {cwd: path});           //Add the files to repo

            }).then(function (res) {
                console.log(res);
                return Git.commit('-m "Initial commit"');           //Commit

            }).then(function (res) {
                // return Git.remote('add origin https://' + Config.github["token"] + '@github.com/eaghayi/' + project_id + '.git/');      //Create a remote named origin
                return Git.pull('https://' + Config.github["token"] + '@github.com/eaghayi/EndPoints2.git/  master --allow-unrelated-histories');      //Create a remote named origin

            }).then(function (res) {
                // return Git.push('-u origin master');            //push the files to the master branch
                return Git.push('  https://' + Config.github["token"] + '@github.com/eaghayi/EndPoints2.git/  master');
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

    function runCommand(command, path){
        var child = cmd(command, {cwd: path} );



        return child;
    }




    return{
        createMicroService: createMicroService,
    }
}