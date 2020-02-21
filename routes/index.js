const express = require('express'),
      router  = express.Router(),
      winston = require('../bin/winston'),
      Db = require('../data/Database')
;
/* GET home page. */
router.get('/', function(req, res) {

  const pageList = getNewPages();

  res.render('admin', {
    title: 'Nearby Now Webhook Admin Page',
    description: 'This page will be a dashboard with details on pages created, recent nearby now events and buttons allowing you to remove pages, change SEO data and such.',
    newPages: pageList
  });
});

function getNewPages() {
  const db = new Db();
  const sql = `SELECT * FROM nn_city_totals ORDER BY `;
  const newPages = db.readPool(sql);
  return newPages;
}

function getRecentEvents() {
  //TODO: make database table that only stores an event id with a timestamp to use here. after fetching the event id we can then find the correct event in the correct table using the id.
}

function getLocationDetails() {

}

module.exports = router;
