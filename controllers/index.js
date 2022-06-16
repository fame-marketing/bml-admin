const winston = require('../bin/winston'),
  FileUtils = require('../data/FileSystem/FileUtils'),
  database = require('../data/Database'),
  db = new database(),
  fs = require('fs'),
  fileUtils = new FileUtils(),
  directory = fileUtils.fixSlashes(process.env.DESTINATION)
;

async function getNewPages() {
  const sql = `SELECT *
               FROM nn_city_totals
               WHERE Created = 1 AND
                   City != ''
               ORDER BY Verified ASC, PageCreatedDate DESC
               LIMIT 20`;
  const rows = await db.readPool(sql);
  rows.forEach(row => {
    row.PageCreatedDate = simplifyDateFormat(row.PageCreatedDate);
  });
  return rows;
}

async function getRecentEvents() {
  const sql = `SELECT EventType, EventTime, UserName, City, State
               FROM nn_events
                        INNER JOIN nn_checkins
                                   ON nn_events.EventId = nn_checkins.EventId
               UNION ALL
               SELECT EventType, EventTime, UserName, City, State
               FROM nn_events
                        INNER JOIN nn_reviews
                                   ON nn_events.EventId = nn_reviews.EventId
               ORDER BY EventTime DESC
               LIMIT 15`
  ;
  const rows = await db.readPool(sql);
  rows.forEach(row => {
    row.EventType = (row.EventType === "checkin.created") ? 'Checkin' : 'Review';
    row.EventTime = simplifyDateFormat(row.EventTime);
  });
  return rows;
}

async function getPendingEvents() {

  const sql = `SELECT COUNT(*) FROM nn_events_temp`;
  const rows = await db.readPool(sql);
  return rows[0]['COUNT(*)'];

}

async function markAsValid() {

  const sql = `UPDATE nn_city_totals SET Verified = 1 WHERE Url = "${url}"`;
  const res = await db.readPool(sql);
  return res.affectedRows > 0 ? "verified" : "error : " + res.serverStatus;

}

function simplifyDateFormat(date) {
  return date.toLocaleString(date, {dateStyle:'medium',timeStyle:'medium'})
}

exports.render = async (req, res) => {

  res.render('admin', {
    layout: 'default',
    template: 'admin-template',
    title: 'Nearby Now Webhook Admin Page',
    description: 'This page will be a dashboard with details on pages created, recent nearby now events and buttons allowing you to remove pages, change SEO data and such.',
    pages: await getNewPages(),
    events: await getRecentEvents(),
    pendingEvents: await getPendingEvents(),
    hrefBase: process.env.URL + '/' + directory
  });

}

exports.validatePage = async (req, res) => {

  if (typeof req.body.url === "string" && req.body.url !== '') {
    const url = req.body.url;
    const validResult = await markAsValid(url);
    res.send(validResult);
  }

}
