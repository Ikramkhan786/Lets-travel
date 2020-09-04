require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');

var flash = require('connect-flash');

// @desc for session
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);

// @desc for passport.js
const passport = require('passport');
const User = require('./models/user');

var app = express();

// @desc view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// @desc Set up mongoose connection
mongoose.connect(process.env.DB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => console.error(error.message));

// @desc body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// @config session
app.use(session({
	secret: process.env.SECRET,
	saveUninitilized: false,
	resave: false,
	store: new mongoStore({mongooseConnection: mongoose.connection})
}));

// @config Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// @desc add flash as middleware
app.use(flash());


// @desc To pass local variables to all templates
app.use((req, res, next) => {
	res.locals.user = req.user;
	res.locals.url = req.path;
	res.locals.flash = req.flash();
	next();
});


app.use('/', indexRouter);


// @desc catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// @desc error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // @desc render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;