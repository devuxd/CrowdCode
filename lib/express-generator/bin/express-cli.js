var ejs = require('ejs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var program = require('commander');
var readline = require('readline');
var sortedObject = require('sorted-object');
var util = require('util')

var MODE_0666 = parseInt('0666', 8);
var MODE_0755 = parseInt('0755', 8);

var _exit = process.exit;
var pkg = require('../package.json');

var version = pkg.version;

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication(name, path, port) {
    var name = createAppName(name);
    var path = path + '/' + name;

    //emptyDirectory(name,function(){});  // Makes sure existing service is not over written

    var app = loadTemplate('js/app.js');
    var www = loadTemplate('js/www');

    // App name
    www.locals.name = name;
    //Port number
    www.locals.port = port;
    // App modules
    app.locals.modules = Object.create(null);
    app.locals.uses = [];
    app.locals.view = {
        engine: 'ejs'
    };
    app.locals.project = name;

    mkdir(path, function () {
        mkdir(path + '/public', function () {
            mkdir(path + '/public/javascripts');
            mkdir(path + '/public/images');
            mkdir(path + '/public/stylesheets');
        });
        mkdir(path + '/routes');
        mkdir(path + '/service');
        mkdir(path + '/views');
        mkdir(path + '/bin', function () {
            write(path + '/bin/www', www.render(), MODE_0755)
        });
        write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n');
        write(path + '/app.js', app.render())
    });


    // package.json
    var pkg = {
        name: name,
        version: '0.0.0',
        private: true,
        scripts: {
            start: 'node ./bin/www'
        },
        dependencies: {
            'body-parser': '~1.18.2',
            'cookie-parser': '~1.4.3',
            'debug': '~2.6.9',
            'express': '~4.15.5',
            'morgan': '~1.9.0',
            'serve-favicon': '~2.4.5',
            'ejs': '~2.5.7'
        }
    }

    // sort dependencies like npm(1)
    pkg.dependencies = sortedObject(pkg.dependencies);


    return true;
}

function createDir(path) {
    mkdir(path + '/routes');
    mkdir(path + '/service');

}

function createEndPints(name, path, port) {
    var name = createAppName(name);
    var path = path + '/' + name;

    //emptyDirectory(name,function(){});  // Makes sure existing service is not over written

    // var app = loadTemplate('js/app.js');
    // var www = loadTemplate('js/www');

    // App name
    // www.locals.name = name;
    //Port number
    // www.locals.port = port;
    // App modules
    // app.locals.modules = Object.create(null);
    // app.locals.uses = [];
    // app.locals.view = {
    //     engine: 'ejs'
    // };
    // app.locals.project = name;

    mkdir(path, function () {
        // mkdir(path + '/public', function () {
        //     mkdir(path + '/public/javascripts');
        //     mkdir(path + '/public/images');
        //     mkdir(path + '/public/stylesheets');
        // });
        mkdir(path + '/routes');
        mkdir(path + '/service');
        // mkdir(path + '/views');
        // mkdir(path + '/bin', function () {
        //     write(path + '/bin/www', www.render(), MODE_0755)
        // });
        // write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n');
        // write(path + '/app.js', app.render())
    });


    // package.json
    // var pkg = {
    //     name: name,
    //     version: '0.0.0',
    //     private: true,
    //     scripts: {
    //         start: 'node ./bin/www'
    //     },
    //     dependencies: {
    //         'body-parser': '~1.18.2',
    //         'cookie-parser': '~1.4.3',
    //         'debug': '~2.6.9',
    //         'express': '~4.15.5',
    //         'morgan': '~1.9.0',
    //         'serve-favicon': '~2.4.5',
    //         'ejs': '~2.5.7'
    //     }
    // }
    //
    // // sort dependencies like npm(1)
    // pkg.dependencies = sortedObject(pkg.dependencies);


    return true;
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName(pathName) {
    return path.basename(pathName)
        .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

/**
 * Create a router with all the routes
 *
 * @param {String} name
 * @param (String) path
 * @param (String) routes
 */
function createRouter(name, path, routes) {
    var path = path + '/' + name;
    var router = loadTemplate('js/routes/api.js');
    router.locals.routes = routes;
    // write(path+'/routes/api.js',router.render());
    write(path + '/routes/endpoints.js', router.render());
}


/**
 * Create a file with all the code for service
 *
 * @param {String} name
 * @param (String) path
 * @param (String) code
 */
function createServiceFile(name, path, code) {
    var path = path + '/' + name;
    write(path + '/service/microservice.js', code, MODE_0755);
}


/**
 * Create a router with all the routes
 *
 * @param {String} name
 * @param (String) path
 * @param (String) routes
 */
function createTravisFile(name, path, token) {
    var path = path + '/' + name;
    var travis = loadTemplate('js/travis.yml');
    travis.locals.token = token;
    travis.locals.app = name + ' \n';
    write(path + '/travis.yml', travis.render());
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str, mode) {
    fs.writeFileSync(path, str, {mode: mode || MODE_0666})
    console.log('   \x1b[36mcreate\x1b[0m : ' + path)
}


/**
 * Copy file from template directory.
 */

function copyTemplate(from, to) {
    from = path.join(__dirname, '..', 'templates', from)
    write(to, fs.readFileSync(from, 'utf-8'))
}

/**
 * Load template file.
 */

function loadTemplate(name) {
    var contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
    var locals = Object.create(null)

    function render() {
        return ejs.render(contents, locals)
    }

    return {
        locals: locals,
        render: render
    }
}


/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path, fn) {
    fs.readdir(path, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}


/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
    mkdirp.sync(path, MODE_0755);
    fn && fn();
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption(originalName, newName) {
    return function (val) {
        warning(util.format("option `%s' has been renamed to `%s'", originalName, newName))
        return val
    }
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning(message) {
    console.error()
    message.split('\n').forEach(function (line) {
        console.error('  warning: %s', line)
    })
    console.error()
}

/**
 * Graceful exit for async STDIO
 */

function exit(code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done() {
        if (!(draining--)) _exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
    })

    done()
}

module.exports = {
    createApplication: createApplication,
    createRouter: createRouter,
    createServiceFile: createServiceFile,
    createTravisFile: createTravisFile,
    createEndPints: createEndPints,
    createDir: createDir


};