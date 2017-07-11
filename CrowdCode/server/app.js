const express = require('express');
const session = require('express-session');
var FileStore = require('session-file-store')(session);
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
const validateFirebaseIdToken = wagner.invoke(function(AdminFirebase) {
  var admin = AdminFirebase;
  return (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !req.session.idToken) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>',
        'or by passing a "__session" cookie.');
      res.status(status.UNAUTHORIZED).send('Unauthorized');
      return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      //console.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
      req.session.idToken = idToken;
    } else {
      //console.log('Found "session.idToken"');
      // Read the ID Token from cookie.
      idToken = req.session.idToken;
      //req.cookies.__session;
    }
    admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
      //console.log('ID Token correctly decoded', decodedIdToken);
      req.user = decodedIdToken;
      next();
    }).catch(error => {
      console.error('Error while verifying Firebase ID token:', error);
      res.status(status.UNAUTHORIZED).send('Unauthorized');
    });
  };
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
//app.use(validateFirebaseIdToken);
app.use('/api/v1', validateFirebaseIdToken,require('./routes/api')(wagner));
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
