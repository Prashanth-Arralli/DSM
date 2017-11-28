ROOT_FOLDER = __dirname;
CONTROLLERS = ROOT_FOLDER + '/controllers/';
SERVICES = ROOT_FOLDER + '/services/';
HELPERS = ROOT_FOLDER + '/helpers/';
MODELS = ROOT_FOLDER + '/models/';
VALIDATIONS = ROOT_FOLDER + '/validations/';
MIDDLEWARES = ROOT_FOLDER + '/middlewares/';
const config = require('config');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const index = require('./routes/index'); //index page
const apiV1Routes = require('./routes/api/v1'); //api routes
const xssFilter = require('x-xss-protection');
const mongoose = require('mongoose');
const i18n = require('i18n');
const expressValidator = require('express-validator');
const app = express();
const fs = require('fs');
const mailHelper = require(HELPERS + 'mail');
mongoose.Promise = Promise;
DB2 = mongoose.createConnection(config.get('db2ConnectionString'), {
  useMongoClient: true,
  keepAlive: 300000,
  connectTimeoutMS: 30000
}, console.log);
mongoose.connect(config.get('dbConnectionString'), {
  useMongoClient: true
});
//set up helmet for security
// app.use(helmet());
//The X-XSS-Protection HTTP header is a basic protection against XSS
app.use(xssFilter({
  setOnOldIE: true // To force the header to be set to 1; mode=block on all versions of IE
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator({
  customValidators: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    isDate: function (value) {
      return new Date(value).toString() !== 'Invalid Date'
    },
    isFutureDate: function (value) {
      return new Date(value).getTime() > new Date().getTime()
    },
    isDateGreaterThan: function (value) {
      console.log(this)
      return false;
    },
    isValidObjectID: function (value) {
      return mongoose.Types.ObjectId.isValid(value)
    }
  }
}));
const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/profilePictures', express.static(__dirname + '/public'));
app.use('/offerPictures', express.static(__dirname + '/public'));
app.use('/vehiclePictures', express.static(__dirname + '/public'));

i18n.configure({
  locales: ['en', 'de'],
  defaultLocale: 'de',
  directory: __dirname + '/locales',
  autoReload: true,
  register: global
});
this.locale = 'de';
app.use(i18n.init);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.sendResponse = (body, message, statusCode) => {
    let statusText = 'success';
    statusCode = statusCode || 200;
    message = res.__(message || 'success');
    res.json({
      body,
      message,
      statusCode,
      statusText
    });
  }
  next();
});
app.use('/', index);
app.use('/api/v1', apiV1Routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  let response = {};
  var stream = fs.createWriteStream("error.log", {
    flags: 'a'
  });
  console.log(new Date().toISOString());
  stream.write(req.originalUrl + " ERROR STARTS\n");
  stream.write(err.stack + "\n");
  stream.write(req.originalUrl + " ERROR ENDS\n");
  stream.end();
  response.message = i18n.__(err.message || 'error');
  response.statusCode = err.status || 500;
  response.statusText = 'fail';
  response.body = {};
  res.json(response);
  // render the error page
  // res.status(err.status || 500);
  // res.render('error');

});

module.exports = app;
