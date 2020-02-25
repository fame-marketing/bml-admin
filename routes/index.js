const express = require('express'),
      router  = express.Router(),
      winston = require('../bin/winston'),
      Db = require('../data/Database')
;
/* GET home page. */
router.get('/', async function(req, res) {

  const pageList = await getNewPages();
  const recentEvents = await getRecentEvents();
  const locations = await getLocationDetails();

  res.render('admin', {
    layout: 'default',
    template: 'admin-template',
    title: 'Nearby Now Webhook Admin Page',
    description: 'This page will be a dashboard with details on pages created, recent nearby now events and buttons allowing you to remove pages, change SEO data and such.',
    pages: pageList,
    events: recentEvents
  });

});

async function getNewPages() {
  const db = new Db();
  const sql = `SELECT * FROM nn_city_totals WHERE Created = 1 ORDER BY PageCreatedDate LIMIT 10`;
  const rows = await db.readPool(sql);
  return rows;
}

function getRecentEvents() {
  const db = new Db();
  const sql = `SELECT * FROM nn_events ORDER BY PageCreatedDate LIMIT 10`;
  const rows = await db.readPool(sql);
  return rows;
}

function getLocationDetails() {
  const db = new Db();
  const sql = `SELECT * FROM nn_events ORDER BY CheckinTotal LIMIT 40`;
  const rows = await db.readPool(sql);
  return rows;
}

module.exports = router;
