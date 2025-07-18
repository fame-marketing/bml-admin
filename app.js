import 'dotenv/config'
import createError from 'http-errors'
import express from 'express'
import {engine as hbsEngine} from 'express-handlebars'
import HandlebarHelpers from './utils/handlebarHelpers.js'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import logger from "./bin/winston.js";
import { CronJob } from 'cron';
import cityCheck from './data/cityCheck.js'
import router from './routes/router.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const app = express(),
      __dirname = dirname(fileURLToPath(import.meta.url));

// view engine setup
app.set('view engine', 'hbs');

app.engine('hbs', hbsEngine({
  extname: 'hbs',
  helpers: HandlebarHelpers,
  defaultLayout: 'default',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}))

app.use(morgan('combined', {stream: logger.stream}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static('public'))

app.use('/', router);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  logger.error('general error sent from app.js - ' + err.message);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
 | checks temp db tables for new reviews/checkins
 | Stores information and counts checkin/review totals
 | creates a  page if a new city has an updated count
*/

 new CronJob('0 */2 * * * *', function () {
   (async () => {
     new cityCheck();
   })();
 }, null, true, 'America/New_York');

export default app
