const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const index = require('./routes/index')(passport);
const bearerToken = require('express-bearer-token');
const session = require('express-session');
const exphbs = require('express-hbs');
const app = express();
const flash = require('express-flash');
require('dotenv').config();


/**
 * check if application is running online(Azure) or it is running in local environment.
 */

if(process.env.ENV === 'Azure')
{
  require('./azureWebAppConfig')();
}
const models = require("./models");
const msService = require('./routes/microsoftService')(passport, models.Account);
require('./config/passport.js')(passport, models.Account);

//Sync Database
models.sequelize.sync().then(function (res) {
  console.log('Db connected and synchronized')
});

/**
 * App Settings.
 */

let expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
app.use(
  session({
    name: 'SESS_ID',
    secret: "voice",
    resave: true,
    saveUninitialized: true,
    cookie: {
      expires: expiryDate,
      ephemeral: true
    }
  })
); // session secret

app.use(bearerToken());
app.use(passport.initialize());
app.use(passport.session());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// For Handlebars
app.engine(
  'hbs',
  exphbs.express4({
    extname: '.hbs',
    defaultLayout: __dirname + '/views/layouts/default.hbs',
    partialsDir: __dirname + '/views/partials',
    layoutsDir: __dirname + '/views/layouts'
  })
);
app.use(flash());
require('./lib/handlebarHelpers')
  .helpers(exphbs);
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/voice', msService);



app.use( (req, res, next)=> {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});// catch 404 and forward to error handler


app.use( (err, req, res, next)=> {
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});// error handler

module.exports = app;
