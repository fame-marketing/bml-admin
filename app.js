require('dotenv').config();

const createError = require('http-errors'),
			express = require('express'),
			path = require('path'),
			fs = require('fs'),
			cookieParser = require('cookie-parser'),
			morgan = require('morgan'),
			winston = require('./bin/winston'),
			cron = require('cron').CronJob,
			Checker = require('./data/cityCheck'),
			Builder = require('./model/Builder'),
		
			indexRouter = require('./routes/index'),
			importRouter = require('./routes/import'),
      formHandler = require('./routes/submit'),

			app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('combined', {stream: winston.stream}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/test/webhook', indexRouter);// TODO: Remove all instances of /test from these files before pushing to live directory
app.use('/test/webhook/import', importRouter);
app.use('/test/webhook/import/submit', formHandler);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  winston.error(err.message);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
 | checks temp db tables for new reviews/checkins
 | Stores information and counts checkin/review totals
 | creates a  page if a new city has an updated count
*/
new cron('0 */5 * * * *', function () {
  (async () => {
    new Checker();
  })();
}, null, true, 'America/New_York');

module.exports = app;