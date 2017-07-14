const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')({
  origin: true
});
const status = require('http-status');
const wagner = require('wagner-core');
require('./lib/dependencies')(wagner);
const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));
const isAuth = wagner.invoke(function() {
  return (req, res, next) => {
    if(req.session.user || req.path==='/login' || req.path === '/loggedin.html') {
      req.user = req.session.user;
      next();
    } else {
      res.redirect('/login');
    }
  };
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.post('/authenticate', wagner.invoke(function(UserService, AdminFirebase, FirebaseService) {
  return function(req, res) {
    //var idToken = req.body.idToken;
    var idToken = req.headers['authorization'].split(' ').pop();
    AdminFirebase.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        var uid = decodedToken.uid;
        req.session.user = decodedToken;
        UserService.getUserById(uid)
          .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully fetched user data:", userRecord.toJSON());
            var worker_id = userRecord.uid;
            var worker_name = userRecord.displayName;
            var avatar_url = userRecord.photoURL;
            var firebase = FirebaseService;
            var workers_list_promise = firebase.retrieveWorkersList();
            workers_list_promise.then(function(workers_list) {
              if (workers_list.indexOf(worker_id) < 0) {
                firebase.createWorker(worker_id, worker_name, avatar_url);
              }
            }).catch(err => {

            });
          })
          .catch(function(error) {
            console.log("Error fetching user data:", error);
          });
        res.json({
          'Success': 200
        })
      }).catch(function(error) {
        // Handle error
      });
  };
}));
app.use(cookieParser());
app.use(isAuth);
app.use('/api/v1', require('./routes/api')(wagner));
app.use(express.static(path.join(__dirname, '../public')));
app.use(require('./routes/app-routing'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.sendFile(path.join(__dirname, '../public/404.html'));
});

module.exports = app;
