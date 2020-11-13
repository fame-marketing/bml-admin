require('dotenv').config();

const createError = require('http-errors'),
			express = require('express'),
      hbs = require('express-handlebars'),
			path = require('path'),
			fs = require('fs'),
			cookieParser = require('cookie-parser'),
			morgan = require('morgan'),
			winston = require('./bin/winston'),
			cron = require('cron').CronJob,
			Checker = require('./data/cityCheck'),

			indexRouter = require('./routes/index'),
			importRouter = require('./routes/import'),
      formHandler = require('./routes/submit'),
      webhookRouter = require('./routes/webhook'),
			statsRouter = require('./routes/stats'),
			mapRouter = require('./routes/map'),
			contactRouter = require('./routes/contact'),
			settingsRouter = require('./routes/settings'),

			app = express();

// view engine setup
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));

app.use(morgan('combined', {stream: winston.stream}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/nn-admin', indexRouter);
app.use('/nn-admin/webhook', webhookRouter);
app.use('/nn-admin/import', importRouter);
app.use('/nn-admin/import/submit', formHandler);
app.use('/nn-admin/stats', statsRouter);
app.use('/nn-admin/map', mapRouter);
app.use('/nn-admin/contact', contactRouter);
app.use('/nn-admin/settings', settingsRouter);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  winston.error('general error sent from app.js - ' + err.message);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
 | checks temp db tables for new reviews/checkins
 | Stores information and counts checkin/review totals
 | creates a  page if a new city has an updated count
*/
new cron('0 */2 * * * *', function () {
}, null, true, 'America/New_York');
(async () => {
  new Checker();
})();

module.exports = app;
