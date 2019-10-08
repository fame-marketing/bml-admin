const createError = require('http-errors'),
      express = require('express'),
      path = require('path'),
      cookieParser = require('cookie-parser'),
      logger = require('morgan'),
			cron  = require('cron').CronJob,
			Checker = require('./data/cityCheck'),
      Builder = require('./model/Builder'),

      indexRouter = require('./routes/index'),
      whrouter    = require('./routes/webhook'),

      app = express()
;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/webhook', whrouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
 | checks temp db tables for new reviews/checkins
 | Stores information and counts checkin/review totals
 | creates a  page if a new city has an updated count
*/
/*new cron('0 30 * * * *', function() {

}, null,true,'America/New_York')*/

(async() => {
  new Checker();
})();

module.exports = app;