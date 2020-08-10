const express = require('express'),
      router  = express.Router(),
      winston = require('../bin/winston'),
      Db = require('../data/Database')
;
/* GET home page. */
router.get('/', async function(req, res) {

  const db = new Db();
  const pageList = await getNewPages(db);
  const recentEvents = await getRecentEvents(db);
  const pendingEvents = await getPendingEvents(db);

  res.render('admin', {
    layout: 'default',
    template: 'admin-template',
    title: 'Nearby Now Webhook Admin Page',
    description: 'This page will be a dashboard with details on pages created, recent nearby now events and buttons allowing you to remove pages, change SEO data and such.',
    pages: pageList,
    events: recentEvents,
    pendingEvents: pendingEvents
  });

});

async function getNewPages(db) {
  const sql = `SELECT * 
               FROM nn_city_totals 
               WHERE Created = 1 
               ORDER BY Verified ASC, PageCreatedDate 
               LIMIT 20`;
  const rows = await db.readPool(sql);
  return rows;
}

async function getRecentEvents(db) {
  const sql = `SELECT EventType, EventTime, UserName, City, State
               FROM nn_events 
               INNER JOIN nn_checkins_perma
               ON nn_events.EventId = nn_checkins_perma.EventId
               UNION ALL
               SELECT EventType, EventTime, UserName, City, State
               FROM nn_events 
               INNER JOIN nn_reviews_perma
               ON nn_events.EventId = nn_reviews_perma.EventId
               ORDER BY EventTime 
               LIMIT 15`
  ;
  const rows = await db.readPool(sql);
  rows.forEach(row => {
    row.EventType = (row.EventType === "checkin.created") ? 'checkin' : 'review';
  });
  return rows;
}

async function getPendingEvents(db) {

  const sql = `SELECT COUNT(*) FROM nn_events_temp`;
  const rows = await db.readPool(sql);
  return rows[0]['COUNT(*)'];

}

router.post('/', async function(req, res) {
  if (typeof req.body.url === "string" && req.body.url !== '') {
    const url = req.body.url;
    const validResult = await markAsValid(url);
    res.send(validResult);
  }
});

async function markAsValid(url) {
  const db = new Db();
  const sql = `UPDATE nn_city_totals SET Verified = 1 WHERE Url = "${url}"`;
  const res = await db.readPool(sql);
  return res.affectedRows > 0 ? "verified" : "error : " + res.serverStatus;
}

module.exports = router;
